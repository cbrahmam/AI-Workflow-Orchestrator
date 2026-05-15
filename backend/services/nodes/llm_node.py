import time
from services.nodes.base import BaseNode, NodeOutput


class LLMNode(BaseNode):
    node_type = "llm"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        provider = self.config.get("provider", "claude")
        model = self.config.get("model", "claude-sonnet-4-20250514")
        system_prompt = self.resolve_variables(self.config.get("systemPrompt", ""), context)
        user_prompt = self.resolve_variables(self.config.get("userPrompt", ""), context)
        temperature = self.config.get("temperature", 0.7)
        max_tokens = self.config.get("maxTokens", 1024)

        if not user_prompt and inputs:
            first_input = next(iter(inputs.values()), None)
            if first_input:
                user_prompt = str(first_input.data) if hasattr(first_input, "data") else str(first_input)

        start = time.time()
        tokens_used = 0

        if provider == "claude":
            api_key = context.api_keys.get("ANTHROPIC_API_KEY", "")
            if not api_key:
                return NodeOutput(error="ANTHROPIC_API_KEY not configured")

            import anthropic
            client = anthropic.Anthropic(api_key=api_key)

            kwargs = {
                "model": model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": [{"role": "user", "content": user_prompt}],
            }
            if system_prompt:
                kwargs["system"] = system_prompt

            response = client.messages.create(**kwargs)
            text = response.content[0].text
            tokens_used = (response.usage.input_tokens or 0) + (response.usage.output_tokens or 0)

        elif provider == "openai":
            api_key = context.api_keys.get("OPENAI_API_KEY", "")
            if not api_key:
                return NodeOutput(error="OPENAI_API_KEY not configured")

            import openai
            client = openai.OpenAI(api_key=api_key)

            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": user_prompt})

            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            text = response.choices[0].message.content
            tokens_used = (response.usage.total_tokens or 0) if response.usage else 0
        else:
            return NodeOutput(error=f"Unknown provider: {provider}")

        duration = time.time() - start
        return NodeOutput(
            data=text,
            output_type="text",
            metadata={"tokens_used": tokens_used, "duration_s": round(duration, 2), "model": model},
        )
