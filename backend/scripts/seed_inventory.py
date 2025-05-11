import asyncio
import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import init_db, get_inventory
from datetime import datetime

sample_items = [
    {
        "name": "Paracetamol 500mg",
        "name_lower": "paracetamol 500mg",
        "description": "Pain relief tablets",
        "quantity": 1000,
        "unit": "tablets",
        "use_period": 365,
        "price": 5.99,
        "reorder_level": 200,
        "created_at": datetime(2024, 6, 1),
        "updated_at": datetime(2024, 6, 1)
    },
    {
        "name": "Amoxicillin 250mg",
        "name_lower": "amoxicillin 250mg",
        "description": "Antibiotic capsules",
        "quantity": 500,
        "unit": "capsules",
        "use_period": 180,
        "price": 8.99,
        "reorder_level": 100,
        "created_at": datetime(2024, 6, 10),
        "updated_at": datetime(2024, 6, 10)
    },
    {
        "name": "Bandages",
        "name_lower": "bandages",
        "description": "Sterile gauze bandages",
        "quantity": 200,
        "unit": "rolls",
        "use_period": 730,
        "price": 3.99,
        "reorder_level": 50,
        "created_at": datetime(2024, 7, 1),
        "updated_at": datetime(2024, 7, 1)
    },
    {
        "name": "Ibuprofen 200mg",
        "name_lower": "ibuprofen 200mg",
        "description": "Anti-inflammatory tablets",
        "quantity": 800,
        "unit": "tablets",
        "use_period": 365,
        "price": 6.49,
        "reorder_level": 150,
        "created_at": datetime(2024, 6, 15),
        "updated_at": datetime(2024, 6, 15)
    },
    {
        "name": "Cetirizine 10mg",
        "name_lower": "cetirizine 10mg",
        "description": "Allergy relief tablets",
        "quantity": 300,
        "unit": "tablets",
        "use_period": 365,
        "price": 4.99,
        "reorder_level": 60,
        "created_at": datetime(2024, 7, 5),
        "updated_at": datetime(2024, 7, 5)
    }
]

async def seed_inventory():
    await init_db()
    inventory = get_inventory()
    # Clear existing items
    await inventory.delete_many({})
    
    # Insert sample items
    result = await inventory.insert_many(sample_items)
    print(f"Inserted {len(result.inserted_ids)} items")
    
    # Verify items were inserted
    count = await inventory.count_documents({})
    print(f"Total items in database: {count}")

if __name__ == "__main__":
    asyncio.run(seed_inventory()) 