import asyncio
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import init_db, get_inventory

async def migrate_inventory_to_user(email="arsivakuhan@gmail.com"):
    await init_db()
    inventory = get_inventory()
    await inventory.update_many(
        {},  # all documents
        {"$set": {"user_email": email}}
    )
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate_inventory_to_user()) 