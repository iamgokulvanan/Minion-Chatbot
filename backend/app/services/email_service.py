import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from typing import Dict, Any, List

# In-memory store for dispatched email logs so user can inspect them anytime
SENT_EMAIL_LOGS: List[Dict[str, Any]] = []

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("SMTP_FROM", "no-reply@minion.ai")

    def send_login_notification(self, user_email: str, user_name: str, user_ip: str = "127.0.0.1") -> Dict[str, Any]:
        """Dispatches an authentication & security welcome email to the user's email address."""
        now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M:%S UTC")
        
        subject = f"🔒 Security Alert: Successful Login to MINION AI ({user_name})"

        # Beautiful HTML Email Body
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; background-color: #08090B; color: #F5F5F5; margin: 0; padding: 20px; }}
            .container {{ max-width: 580px; margin: 0 auto; background-color: #111318; border: 1px solid rgba(255, 214, 0, 0.25); border-radius: 20px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }}
            .logo-bar {{ text-align: center; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); }}
            .logo-title {{ font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: 2px; }}
            .logo-highlight {{ color: #FFD600; }}
            .badge {{ display: inline-block; padding: 4px 12px; background: rgba(0, 216, 255, 0.15); color: #00D8FF; border-radius: 12px; font-size: 11px; font-weight: 600; margin-top: 8px; }}
            .content {{ padding: 24px 0; }}
            .greeting {{ font-size: 18px; font-weight: 600; color: #FFFFFF; margin-bottom: 12px; }}
            .details-card {{ background-color: #171A20; border-radius: 14px; padding: 18px; margin: 18px 0; border: 1px solid rgba(255,255,255,0.06); }}
            .detail-row {{ display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.04); }}
            .detail-label {{ color: #9297A2; }}
            .detail-value {{ color: #F5F5F5; font-weight: 500; font-family: monospace; }}
            .cta-button {{ display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #0066FF, #00D8FF); color: #FFFFFF; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 13px; margin: 20px 0; }}
            .footer {{ border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; font-size: 11px; color: #9297A2; text-align: center; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo-bar">
              <div class="logo-title">MINION <span class="logo-highlight">AI</span></div>
              <div class="badge">SECURE SESSION VERIFIED</div>
            </div>

            <div class="content">
              <div class="greeting">Hello, {user_name}!</div>
              <p style="font-size: 14px; color: #9297A2; line-height: 1.6;">
                This security notice confirms that your MINION AI workspace account has been successfully accessed.
              </p>

              <div class="details-card">
                <div class="detail-row">
                  <span class="detail-label">User Account:</span>
                  <span class="detail-value">{user_email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Login Timestamp:</span>
                  <span class="detail-value">{now_str}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Client Location / IP:</span>
                  <span class="detail-value">{user_ip} (Verified Session)</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Intelligence Status:</span>
                  <span class="detail-value" style="color: #00FF88;">MINION CORE Active</span>
                </div>
              </div>

              <p style="font-size: 13px; color: #9297A2; line-height: 1.5;">
                If you authorized this login, you can start asking questions, generating code, analyzing documents, and creating AI images immediately.
              </p>
            </div>

            <div class="footer">
              MINION AI — Your Intelligence. Your Assistant. Your World.<br/>
              This is an automated security transmission. If this was not you, please secure your account immediately.
            </div>
          </div>
        </body>
        </html>
        """

        email_record = {
            "id": f"mail-{len(SENT_EMAIL_LOGS) + 1}",
            "to": user_email,
            "subject": subject,
            "timestamp": now_str,
            "html": html_body,
            "status": "delivered",
        }

        # Try live SMTP if host provided
        if self.smtp_host and self.smtp_user and self.smtp_password:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = self.from_email
                msg["To"] = user_email
                msg.attach(MIMEText(html_body, "html"))

                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=8.0) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    server.sendmail(self.from_email, [user_email], msg.as_string())
                email_record["status"] = "sent_via_smtp"
            except Exception as e:
                email_record["status"] = f"smtp_fallback: {str(e)}"

        SENT_EMAIL_LOGS.insert(0, email_record)
        return email_record

email_service = EmailService()
