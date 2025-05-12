import os
import sys
import smtplib
import json
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import asyncio

# --- Import your database utilities ---
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import init_db, get_inventory, get_users

# --- Email Configuration (edit these!) ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "arsivakuhan@gmail.com"
SMTP_PASSWORD = "" #email password

# --- Email Sending Function ---
def send_simple_email(subject, body, to_email):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, [to_email], msg.as_string())

# --- Main Notification Function ---
async def notify_users():
    await init_db()  # Ensure DB is initialized

    users_collection = get_users()
    inventory_collection = get_inventory()
    users = await users_collection.find().to_list(length=None)
    inventory = await inventory_collection.find().to_list(length=None)
    today = datetime.utcnow()
    today_str = today.strftime("%Y-%m-%d")

    # Track last notification date per user (simple file-based)
    notify_file = os.path.join(os.path.dirname(__file__), "last_notify.json")
    if os.path.exists(notify_file):
        with open(notify_file, "r") as f:
            last_notify = json.load(f)
    else:
        last_notify = {}

    expiring = []
    low_stock = []
    for item in inventory:
        expiry_date = item["created_at"] + timedelta(days=item["use_period"])
        days_left = (expiry_date - today).days
        if 0 < days_left <= 30:
            expiring.append(f"{item['name']} (expires in {days_left} days)")
        if item["quantity"] <= item["reorder_level"]:
            low_stock.append(f"{item['name']} (only {item['quantity']} left)")

    if not expiring and not low_stock:
        print("No expiring or low stock drugs today.")
        return

    body = ""
    if expiring:
        body += "Expiring soon:\n" + "\n".join(expiring) + "\n\n"
    if low_stock:
        body += "Low stock:\n" + "\n".join(low_stock)

    for user in users:
        email = user.get("email")
        if not email:
            continue
        if last_notify.get(email) == today_str:
            continue  # Already notified today
        send_simple_email(
            subject="MedTrack Alert: Expiring or Low Stock Drugs",
            body=body,
            to_email=email,
        )
        last_notify[email] = today_str
        print(f"Sent notification to {email}")

    # Save notification log
    with open(notify_file, "w") as f:
        json.dump(last_notify, f)

# --- Entry Point ---
if __name__ == "__main__":
    asyncio.run(notify_users())