import json
import time
import asyncio
from services.nodes.base import BaseNode, NodeOutput


class ABCompareNode(BaseNode):
    node_type = "ab_compare"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        prompt = self.resolve_variables(self.config.get("prompt", ""), context)
        system_prompt = self.resolve_variables(self.config.get("systemPrompt", ""), context)
        temperature = self.config.get("temperature", 0.7)
        max_tokens = self.config.get("maxTokens", 1024)

        if not prompt and inputs:
            first_input = next(iter(inputs.values()), None)
            if first_input:
                prompt = str(first_input.data) if hasattr(first_input, "data") else str(first_input)

        if not prompt:
            return NodeOutput(error="No prompt provided")

        models = self.config.get("models", [])
        if not models:
            models = [
                {"provider": "claude", "model": "claude-sonnet-4-20250514"},
                {"provider": "openai", "model": "gpt-4o"},
            ]

        async def call_model(model_config):
            provider = model_config.get("provider", "claude")
            model = model_config.get("model", "")
            start = time.time()
            tokens = 0

            try:
                if provider == "claude":
                    api_key = context.api_keys.get("ANTHROPIC_API_KEY", "")
                    if not api_key:
                        return {"model": model, "provider": provider, "error": "ANTHROPIC_API_KEY not configured"}

                    import anthropic
                    client = anthropic.Anthropic(api_key=api_key)
                    kwargs = {
                        "model": model,
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                        "messages": [{"role": "user", "content": prompt}],
                    }
                    if system_prompt:
                        kwargs["system"] = system_prompt

                    response = client.messages.create(**kwargs)
                    text = response.content[0].text
                    tokens = (response.usage.input_tokens or 0) + (response.usage.output_tokens or 0)
                    cost = _estimate_cost(provider, model, response.usage.input_tokens, response.usage.output_tokens)

                elif provider == "openai":
                    api_key = context.api_keys.get("OPENAI_API_KEY", "")
                    if not api_key:
                        return {"model": model, "provider": provider, "error": "OPENAI_API_KEY not configured"}

                    import openai
                    client = openai.OpenAI(api_key=api_key)
                    messages = []
                    if system_prompt:
                        messages.append({"role": "system", "content": system_prompt})
                    messages.append({"role": "user", "content": prompt})

                    response = client.chat.completions.create(
                        model=model, messages=messages,
                        temperature=temperature, max_tokens=max_tokens,
                    )
                    text = response.choices[0].message.content
                    tokens = response.usage.total_tokens if response.usage else 0
                    input_t = response.usage.prompt_tokens if response.usage else 0
                    output_t = response.usage.completion_tokens if response.usage else 0
                    cost = _estimate_cost(provider, model, input_t, output_t)

                else:
                    return {"model": model, "provider": provider, "error": f"Unknown provider: {provider}"}

                duration = time.time() - start
                return {
                    "model": model,
                    "provider": provider,
                    "output": text,
                    "tokens": tokens,
                    "latency_ms": round(duration * 1000),
                    "estimated_cost": cost,
                    "output_length": len(text),
                }

            except Exception as e:
                return {
                    "model": model,
                    "provider": provider,
                    "error": str(e),
                    "latency_ms": round((time.time() - start) * 1000),
                }

        results = []
        for m in models:
            result = await call_model(m)
            results.append(result)

        total_tokens = sum(r.get("tokens", 0) for r in results)

        comparison = {
            "prompt": prompt[:200],
            "models_compared": len(results),
            "results": results,
            "summary": _build_summary(results),
        }

        return NodeOutput(
            data=comparison,
            output_type="json",
            metadata={"tokens_used": total_tokens},
        )


def _estimate_cost(provider, model, input_tokens, output_tokens):
    rates = {
        "claude-sonnet-4-20250514": (3.0, 15.0),
        "claude-haiku-4-5-20251001": (0.80, 4.0),
        "gpt-4o": (2.50, 10.0),
        "gpt-4o-mini": (0.15, 0.60),
    }
    input_rate, output_rate = rates.get(model, (3.0, 15.0))
    return round(((input_tokens or 0) * input_rate + (output_tokens or 0) * output_rate) / 1_000_000, 6)


def _build_summary(results):
    successful = [r for r in results if "output" in r]
    if not successful:
        return "All models failed"

    fastest = min(successful, key=lambda r: r["latency_ms"])
    cheapest = min(successful, key=lambda r: r.get("estimated_cost", 999))
    longest = max(successful, key=lambda r: r.get("output_length", 0))

    return {
        "fastest": f"{fastest['model']} ({fastest['latency_ms']}ms)",
        "cheapest": f"{cheapest['model']} (${cheapest.get('estimated_cost', 0):.6f})",
        "most_detailed": f"{longest['model']} ({longest.get('output_length', 0)} chars)",
    }
