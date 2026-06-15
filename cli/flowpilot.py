#!/usr/bin/env python3
"""
FlowPilot CLI — run workflows from the command line.

Usage:
  python cli/flowpilot.py run <workflow_id> [--input "text"] [--server http://localhost:8000]
  python cli/flowpilot.py list [--server http://localhost:8000]
  python cli/flowpilot.py run-file <workflow.json> [--input "text"] [--server http://localhost:8000]
"""
import argparse
import json
import sys
import time

try:
    import httpx
except ImportError:
    print("Error: httpx is required. Install with: pip install httpx")
    sys.exit(1)


DEFAULT_SERVER = "http://localhost:8000"


def cmd_list(args):
    url = f"{args.server}/api/workflows"
    resp = httpx.get(url, timeout=10)
    resp.raise_for_status()
    workflows = resp.json()

    if not workflows:
        print("No workflows found.")
        return

    print(f"{'ID':<40} {'Name':<30} {'Updated':<25}")
    print("-" * 95)
    for wf in workflows:
        print(f"{wf['id']:<40} {wf['name']:<30} {wf.get('updated_at', '')[:19]:<25}")
    print(f"\n{len(workflows)} workflow(s) found.")


def cmd_run(args):
    url = f"{args.server}/api/workflows/{args.workflow_id}/execute"
    payload = {"input": args.input} if args.input else {}

    print(f"Executing workflow {args.workflow_id}...")
    start = time.time()

    resp = httpx.post(url, json=payload, timeout=300)
    resp.raise_for_status()
    result = resp.json()

    elapsed = time.time() - start

    print(f"\nStatus: {result['status']}")
    print(f"Duration: {elapsed:.1f}s")

    if result.get("total_tokens_used"):
        print(f"Tokens: {result['total_tokens_used']}")

    if result.get("error_summary"):
        print(f"\nError: {result['error_summary']}", file=sys.stderr)
        sys.exit(1)

    if result.get("final_output") is not None:
        output = result["final_output"]
        if isinstance(output, (dict, list)):
            output = json.dumps(output, indent=2)
        if args.output:
            with open(args.output, "w") as f:
                f.write(str(output))
            print(f"\nOutput written to {args.output}")
        else:
            print(f"\n--- Output ---\n{output}")

    if args.json:
        print(json.dumps(result, indent=2))


def cmd_run_file(args):
    with open(args.file) as f:
        workflow_json = json.load(f)

    url = f"{args.server}/api/workflows"
    create_resp = httpx.post(url, json={
        "name": f"CLI: {args.file}",
        "workflow_json": workflow_json,
    }, timeout=10)
    create_resp.raise_for_status()
    wf = create_resp.json()

    args.workflow_id = wf["id"]
    cmd_run(args)

    if not args.keep:
        httpx.delete(f"{url}/{wf['id']}", timeout=10)


def cmd_webhook(args):
    url = f"{args.server}/api/webhooks/{args.workflow_id}"
    payload = {"input": args.input} if args.input else {}

    print(f"Triggering webhook for workflow {args.workflow_id}...")
    resp = httpx.post(url, json=payload, timeout=300)
    resp.raise_for_status()
    result = resp.json()

    print(f"Status: {result['status']}")
    if result.get("final_output"):
        print(f"\n{result['final_output']}")


def main():
    parser = argparse.ArgumentParser(
        prog="flowpilot",
        description="FlowPilot CLI — run AI workflows from the command line",
    )
    parser.add_argument("--server", default=DEFAULT_SERVER, help="FlowPilot server URL")

    sub = parser.add_subparsers(dest="command", required=True)

    # list
    sub.add_parser("list", help="List all workflows")

    # run
    run_p = sub.add_parser("run", help="Execute a workflow by ID")
    run_p.add_argument("workflow_id", help="Workflow ID")
    run_p.add_argument("--input", "-i", help="Input data for the workflow")
    run_p.add_argument("--output", "-o", help="Write output to file")
    run_p.add_argument("--json", action="store_true", help="Print full JSON result")

    # run-file
    rf_p = sub.add_parser("run-file", help="Execute a workflow from a JSON file")
    rf_p.add_argument("file", help="Workflow JSON file path")
    rf_p.add_argument("--input", "-i", help="Input data")
    rf_p.add_argument("--output", "-o", help="Write output to file")
    rf_p.add_argument("--json", action="store_true", help="Print full JSON result")
    rf_p.add_argument("--keep", action="store_true", help="Keep the workflow after execution")

    # webhook
    wh_p = sub.add_parser("webhook", help="Trigger a workflow via webhook")
    wh_p.add_argument("workflow_id", help="Workflow ID")
    wh_p.add_argument("--input", "-i", help="Input data")

    args = parser.parse_args()

    try:
        if args.command == "list":
            cmd_list(args)
        elif args.command == "run":
            cmd_run(args)
        elif args.command == "run-file":
            cmd_run_file(args)
        elif args.command == "webhook":
            cmd_webhook(args)
    except httpx.ConnectError:
        print(f"Error: Cannot connect to FlowPilot server at {args.server}", file=sys.stderr)
        print("Make sure the backend is running: cd backend && python main.py", file=sys.stderr)
        sys.exit(1)
    except httpx.HTTPStatusError as e:
        print(f"Error: {e.response.status_code} — {e.response.text}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
