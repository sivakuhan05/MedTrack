from fastapi import APIRouter, HTTPException, Body
from typing import List
from models import InventoryItem, InventoryItemCreate, InventoryActivity, PyObjectId
from database import get_inventory, get_inventory_activities
from bson import ObjectId
from datetime import datetime
import logging
from pydantic import BaseModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class QuantityUpdate(BaseModel):
    quantity: int

@router.get("/activities")
async def get_activities():
    inventory_activities = get_inventory_activities()
    activities = []
    async for activity in inventory_activities.find().sort("timestamp", -1).limit(10):
        activities.append({
            **activity,
            "_id": str(activity["_id"]),
            "item_id": str(activity["item_id"])
        })
    return activities

@router.get("/{item_id}", response_model=InventoryItem)
async def get_item(item_id: str):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")
    inventory = get_inventory()
    item = await inventory.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return InventoryItem(**item)

@router.get("/", response_model=List[InventoryItem])
async def get_inventory_items():
    try:
        logger.info("Attempting to fetch inventory items...")
        inventory = get_inventory()
        logger.info("Successfully got inventory collection")
        
        items = []
        cursor = inventory.find()
        logger.info("Created cursor for inventory find operation")
        
        try:
            async for item in cursor:
                logger.info(f"Processing item: {item}")
                try:
                    inventory_item = InventoryItem.from_mongo(item)
                    items.append(inventory_item)
                    logger.info(f"Successfully processed item: {inventory_item.name}")
                except Exception as e:
                    logger.error(f"Error processing item {item.get('_id')}: {str(e)}")
                    continue
        except Exception as e:
            logger.error(f"Error iterating cursor: {str(e)}")
            raise
        
        logger.info(f"Successfully fetched {len(items)} items")
        return items
    except Exception as e:
        logger.error(f"Error fetching inventory: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch inventory: {str(e)}"
        )

@router.post("/", response_model=InventoryItem)
async def create_item(item: InventoryItemCreate):
    try:
        inventory = get_inventory()
        inventory_activities = get_inventory_activities()
        
        # Normalize the name (convert to lowercase for comparison)
        normalized_name = item.name.lower()
        logger.info(f"Checking for existing item with normalized name: {normalized_name}")
        
        # Check if item with same name exists (case-insensitive)
        existing_item = await inventory.find_one({
            "name_lower": normalized_name
        })
        logger.info(f"Existing item check result: {existing_item}")
        
        if existing_item:
            logger.warning(f"Item with name '{item.name}' already exists (case-insensitive match)")
            raise HTTPException(
                status_code=400,
                detail=f"An item with the name '{item.name}' already exists (case-insensitive match)"
            )

        # Create new item
        item_dict = item.dict()
        # Store both original name and lowercase version
        item_dict["name_lower"] = normalized_name
        item_dict["created_at"] = datetime.utcnow()
        item_dict["updated_at"] = datetime.utcnow()
        
        logger.info(f"Creating new item with data: {item_dict}")
        result = await inventory.insert_one(item_dict)
        logger.info(f"Insert result: {result.inserted_id}")
        
        # Verify the item was created
        created_item = await inventory.find_one({"_id": result.inserted_id})
        if not created_item:
            logger.error("Failed to verify created item")
            raise HTTPException(
                status_code=500,
                detail="Failed to create item"
            )
            
        try:
            # Record activity
            activity_dict = {
                "item_id": result.inserted_id,
                "action": "created",
                "details": f"Created new item: {item.name}",
                "timestamp": datetime.utcnow()
            }
            await inventory_activities.insert_one(activity_dict)
            logger.info(f"Successfully recorded creation activity for item: {item.name}")
        except Exception as e:
            logger.error(f"Error recording activity: {str(e)}")
            # Don't raise the error since the item was successfully created
        
        return InventoryItem.from_mongo(created_item)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating item: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create item: {str(e)}"
        )

@router.put("/{item_id}", response_model=InventoryItem)
async def update_item(item_id: str, item: InventoryItem):
    logger.info(f"Attempting to update item with ID: {item_id}")
    
    if not ObjectId.is_valid(item_id):
        logger.error(f"Invalid ObjectId format: {item_id}")
        raise HTTPException(status_code=400, detail="Invalid item ID")
    
    try:
        inventory = get_inventory()
        inventory_activities = get_inventory_activities()
        
        # Convert string ID to ObjectId
        object_id = ObjectId(item_id)
        logger.info(f"Converted to ObjectId: {object_id}")
        
        # Try to find the item first
        existing_item = await inventory.find_one({"_id": object_id})
        if not existing_item:
            logger.error(f"Item not found with ID: {item_id}")
            raise HTTPException(status_code=404, detail="Item not found")
        
        item_dict = item.dict(by_alias=True)
        item_dict["updated_at"] = datetime.utcnow()
        
        # Remove _id from the update data to prevent overwriting
        if "_id" in item_dict:
            del item_dict["_id"]
        
        logger.info(f"Updating item with data: {item_dict}")
        
        result = await inventory.update_one(
            {"_id": object_id},
            {"$set": item_dict}
        )
        
        if result.modified_count == 0:
            logger.error(f"No changes made to item with ID: {item_id}")
            raise HTTPException(status_code=404, detail="Item not found or no changes made")
        
        try:
            # Record activity
            activity_dict = {
                "item_id": object_id,
                "action": "updated",
                "details": f"Updated item: {item.name}",
                "timestamp": datetime.utcnow()
            }
            await inventory_activities.insert_one(activity_dict)
            logger.info(f"Successfully recorded update activity for item: {item.name}")
        except Exception as e:
            logger.error(f"Error recording activity: {str(e)}")
            # Don't raise the error since the item was successfully updated
        
        updated_item = await inventory.find_one({"_id": object_id})
        logger.info(f"Successfully updated item: {updated_item}")
        
        return InventoryItem.from_mongo(updated_item)
        
    except Exception as e:
        logger.error(f"Error updating item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{item_id}")
async def delete_item(item_id: str):
    logger.info(f"Attempting to delete item with ID: {item_id}")
    
    if not ObjectId.is_valid(item_id):
        logger.error(f"Invalid ObjectId format: {item_id}")
        raise HTTPException(status_code=400, detail="Invalid item ID")
    
    try:
        inventory = get_inventory()
        inventory_activities = get_inventory_activities()
        
        # Convert string ID to ObjectId
        object_id = ObjectId(item_id)
        logger.info(f"Converted to ObjectId: {object_id}")
        
        # Try to find the item first
        item = await inventory.find_one({"_id": object_id})
        if not item:
            logger.error(f"Item not found with ID: {item_id}")
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Delete the item
        result = await inventory.delete_one({"_id": object_id})
        logger.info(f"Delete result: {result.raw_result}")
        
        if result.deleted_count == 0:
            logger.error(f"Failed to delete item with ID: {item_id}")
            raise HTTPException(status_code=404, detail="Item not found")
        
        try:
            # Record activity
            activity_dict = {
                "item_id": object_id,
                "action": "deleted",
                "details": f"Deleted item: {item['name']}",
                "timestamp": datetime.utcnow()
            }
            await inventory_activities.insert_one(activity_dict)
            logger.info(f"Successfully recorded deletion activity for item: {item['name']}")
        except Exception as e:
            logger.error(f"Error recording activity: {str(e)}")
            # Don't raise the error since the item was successfully deleted
        
        logger.info(f"Successfully deleted item with ID: {item_id}")
        return {"message": "Item deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/low-stock", response_model=List[InventoryItem])
async def get_low_stock():
    inventory = get_inventory()
    items = []
    async for item in inventory.find():
        if item["quantity"] <= item["reorder_level"]:
            items.append(InventoryItem(**item))
    return items

@router.post("/{item_id}/sell")
async def sell_item(item_id: str, update: QuantityUpdate):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")
    
    inventory = get_inventory()
    inventory_activities = get_inventory_activities()
    
    # Get the current item
    item = await inventory.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Check if we have enough quantity
    if item["quantity"] < update.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")
    
    # Update the quantity
    result = await inventory.update_one(
        {"_id": ObjectId(item_id)},
        {"$inc": {"quantity": -update.quantity}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update item")
    
    # Record the activity
    activity_dict = {
        "item_id": ObjectId(item_id),
        "action": "sold",
        "details": f"Sold {update.quantity} {item['unit']} of {item['name']}",
        "timestamp": datetime.utcnow()
    }
    await inventory_activities.insert_one(activity_dict)
    
    return {"message": "Item sold successfully"}

@router.post("/{item_id}/restock")
async def restock_item(item_id: str, update: QuantityUpdate):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")
    
    inventory = get_inventory()
    inventory_activities = get_inventory_activities()
    
    # Get the current item
    item = await inventory.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Update the quantity
    result = await inventory.update_one(
        {"_id": ObjectId(item_id)},
        {"$inc": {"quantity": update.quantity}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update item")
    
    # Record the activity
    activity_dict = {
        "item_id": ObjectId(item_id),
        "action": "restocked",
        "details": f"Restocked {update.quantity} {item['unit']} of {item['name']}",
        "timestamp": datetime.utcnow()
    }
    await inventory_activities.insert_one(activity_dict)
    
    return {"message": "Item restocked successfully"} 