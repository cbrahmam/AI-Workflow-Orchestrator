import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import httpx
from services.nodes.base import BaseNode, NodeOutput


class NotifySlackNode(BaseNode):
    node_type = "notify_slack"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        webhook_url = self.config.get("webhookUrl", "")
        if not webhook_url:
            return NodeOutput(error="Slack webhook URL is required")

        message = self.resolve_variables(self.config.get("messageTemplate", ""), context)
        if not message and inputs:
            first = next(iter(inputs.values()), None)
            if first:
                message = str(first.data) if hasattr(first, "data") else str(first)

        payload = {"text": message}
        channel = self.config.get("channel")
        if channel:
            payload["channel"] = channel
        username = self.config.get("username")
        if username:
            payload["username"] = username

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(webhook_url, json=payload)

        if resp.status_code != 200:
            return NodeOutput(error=f"Slack returned {resp.status_code}: {resp.text}")

        return NodeOutput(
            data=f"Sent to Slack: {message[:100]}",
            output_type="text",
            metadata={"channel": channel or "default"},
        )


class NotifyEmailNode(BaseNode):
    node_type = "notify_email"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        to = self.config.get("to", "")
        subject = self.resolve_variables(self.config.get("subject", "FlowPilot Notification"), context)
        smtp_host = self.config.get("smtpHost", "")
        smtp_port = int(self.config.get("smtpPort", 587))
        smtp_user = self.config.get("smtpUser", "")
        smtp_pass = self.config.get("smtpPass", "")

        if not to:
            return NodeOutput(error="Recipient email is required")
        if not smtp_host:
            return NodeOutput(error="SMTP host is required")

        body = self.resolve_variables(self.config.get("bodyTemplate", ""), context)
        if not body and inputs:
            first = next(iter(inputs.values()), None)
            if first:
                body = str(first.data) if hasattr(first, "data") else str(first)

        msg = MIMEMultipart()
        msg["From"] = smtp_user
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.starttls()
                if smtp_user and smtp_pass:
                    server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        except Exception as e:
            return NodeOutput(error=f"Email send failed: {str(e)}")

        return NodeOutput(
            data=f"Email sent to {to}: {subject}",
            output_type="text",
            metadata={"to": to, "subject": subject},
        )


class NotifyDiscordNode(BaseNode):
    node_type = "notify_discord"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        webhook_url = self.config.get("webhookUrl", "")
        if not webhook_url:
            return NodeOutput(error="Discord webhook URL is required")

        message = self.resolve_variables(self.config.get("messageTemplate", ""), context)
        if not message and inputs:
            first = next(iter(inputs.values()), None)
            if first:
                message = str(first.data) if hasattr(first, "data") else str(first)

        payload = {"content": message[:2000]}
        username = self.config.get("username")
        if username:
            payload["username"] = username

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(webhook_url, json=payload)

        if resp.status_code not in (200, 204):
            return NodeOutput(error=f"Discord returned {resp.status_code}: {resp.text}")

        return NodeOutput(
            data=f"Sent to Discord: {message[:100]}",
            output_type="text",
        )
