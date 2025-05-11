import asyncio
import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import inventory
from datetime import datetime

sample_items = [
    {
        "name": "Paracetamol 500mg",
        "description": "Pain relief tablets",
        "quantity": 1000,
        "unit": "tablets",
        "category": "Pain Relief",
        "supplier": "ABC Pharmaceuticals",
        "price": 5.99,
        "reorder_level": 200,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Amoxicillin 250mg",
        "description": "Antibiotic capsules",
        "quantity": 500,
        "unit": "capsules",
        "category": "Antibiotics",
        "supplier": "XYZ Pharma",
        "price": 8.99,
        "reorder_level": 100,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Bandages",
        "description": "Sterile gauze bandages",
        "quantity": 200,
        "unit": "rolls",
        "category": "First Aid",
        "supplier": "Medical Supplies Co",
        "price": 3.99,
        "reorder_level": 50,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

async def seed_inventory():
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