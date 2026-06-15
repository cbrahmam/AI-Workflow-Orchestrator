"""
Example plugin: Sentiment Analyzer

Demonstrates the plugin executor interface.
Every plugin must export an async execute(input_data, config) function.
"""

POSITIVE_WORDS = {
    "good", "great", "excellent", "amazing", "wonderful", "fantastic",
    "love", "happy", "joy", "beautiful", "best", "awesome", "perfect",
    "brilliant", "outstanding", "superb", "delightful", "pleasant",
}

NEGATIVE_WORDS = {
    "bad", "terrible", "awful", "horrible", "worst", "hate", "ugly",
    "poor", "disappointing", "frustrating", "annoying", "broken",
    "sad", "angry", "failure", "useless", "mediocre", "dreadful",
}


async def execute(input_data, config):
    if not input_data:
        return {"error": "No input text provided"}

    text = str(input_data).lower()
    words = text.split()
    threshold = float(config.get("threshold", 0.5))
    detailed = config.get("detailed", False)

    pos_found = [w for w in words if w.strip(".,!?;:") in POSITIVE_WORDS]
    neg_found = [w for w in words if w.strip(".,!?;:") in NEGATIVE_WORDS]

    total = len(pos_found) + len(neg_found)
    if total == 0:
        sentiment = "neutral"
        confidence = 0.5
    else:
        pos_ratio = len(pos_found) / total
        if pos_ratio > threshold:
            sentiment = "positive"
            confidence = pos_ratio
        elif pos_ratio < (1 - threshold):
            sentiment = "negative"
            confidence = 1 - pos_ratio
        else:
            sentiment = "mixed"
            confidence = 0.5

    result = {
        "sentiment": sentiment,
        "confidence": round(confidence, 3),
        "positive_count": len(pos_found),
        "negative_count": len(neg_found),
        "word_count": len(words),
    }

    if detailed:
        result["positive_words"] = pos_found
        result["negative_words"] = neg_found

    return result
