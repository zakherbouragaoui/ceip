# /Users/zakherfrogman/Documents/Conservation evidence/src/application/notifier.py

from dotenv import load_dotenv
import os, smtplib
load_dotenv()

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.intelligence.db import AlertQueue, get_session
from loguru import logger

# SMTP config from .env
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")  # Use App Password for Gmail


def send_alert(user_email: str, paper_title: str,
               paper_id: str, project_name: str):
    if not SMTP_USER:
        logger.warning("SMTP not configured — alert not sent")
        return

    body = (
        f"New evidence relevant to your project: {project_name}\n\n"
        f"Title: {paper_title}\n"
        f"View synthesis: https://ceip.io/evidence/{paper_id}\n"
    )
    msg            = MIMEMultipart()
    msg['From']    = SMTP_USER
    msg['To']      = user_email
    msg['Subject'] = f"New conservation evidence: {project_name}"
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        logger.info(f"Alert sent to {user_email}")
    except Exception as e:
        logger.error(f"Failed to send alert: {e}")


def process_alert_queue():
    with get_session() as session:
        pending = session.query(AlertQueue).filter_by(sent=0).all()
        for alert in pending:
            send_alert(
                user_email   = alert.user_id,
                paper_title  = alert.paper_id,
                paper_id     = alert.paper_id,
                project_name = str(alert.project_id)
            )
            session.query(AlertQueue).filter_by(
                id=alert.id
            ).update({"sent": 1})
        logger.info(f"Processed {len(pending)} alerts")
