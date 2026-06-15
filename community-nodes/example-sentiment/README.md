# Sentiment Analyzer Plugin

An example FlowPilot plugin that performs keyword-based sentiment analysis.

## How it works

Scans input text for positive and negative keywords and returns a sentiment score.

## Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| threshold | number | 0.5 | Confidence threshold (0-1) |
| detailed | boolean | false | Include word-level breakdown |

## Example output

```json
{
  "sentiment": "positive",
  "confidence": 0.75,
  "positive_count": 3,
  "negative_count": 1,
  "word_count": 20
}
```

## Using as a template

To create your own plugin:

1. Copy this folder to `community-nodes/your-plugin-name/`
2. Edit `node.json` with your node's definition
3. Implement the `execute(input_data, config)` function in `executor.py`
4. Restart the FlowPilot backend

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.
