# Email Digest Summarizer

## What it does

Paste a batch of emails (separated by `---`) and get a prioritized daily digest. The AI categorizes each email into Urgent, Important, or Low Priority, and suggests actions for each.

## Nodes used

- **Input** — Accepts raw email text
- **Transform** — Splits the batch into individual emails
- **LLM Call** — Summarizes and prioritizes using Claude
- **Output** — Displays the formatted digest

## Configuration needed

- Anthropic API key (set `ANTHROPIC_API_KEY` in your environment)

## Example output

```
## Urgent / Action Required

1. **From:** Jane (VP Sales) | **Subject:** Q3 Budget Approval
   Summary: Needs sign-off by EOD Friday.
   → Action: Review attached spreadsheet and reply with approval.

## Important Updates

2. **From:** DevOps Team | **Subject:** Deployment scheduled tonight
   Summary: v2.1 rolling out at 11pm EST.
   → Action: No response needed, but be aware of potential downtime.

## Low Priority

3. **From:** HR | **Subject:** Office snack survey
   Summary: Vote for next month's snack options.
   → Action: Fill out survey when free.
```
