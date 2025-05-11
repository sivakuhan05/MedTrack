from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv
import logging
from pymongo.errors import ConnectionFailure, OperationFailure, ServerSelectionTimeoutError
from typing import Optional

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

# MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "medtrack")

# Global variables for database and collections
client: Optional[AsyncIOMotorClient] = None
db = None
inventory = None
inventory_activities = None
users = None
orders = None

def get_db():
    global db
    if db is None:
        raise Exception("Database not initialized")
    return db

def get_inventory():
    global inventory
    if inventory is None:
        raise Exception("Inventory collection not initialized")
    return inventory

def get_inventory_activities():
    global inventory_activities
    if inventory_activities is None:
        raise Exception("Inventory activities collection not initialized")
    return inventory_activities

def get_users():
    global users
    if users is None:
        raise Exception("Users collection not initialized")
    return users

def get_orders():
    global orders
    if orders is None:
        raise Exception("Orders collection not initialized")
    return orders

async def init_db():
    global client, db, inventory, inventory_activities, users, orders
    
    try:
        logger.info(f"Connecting to MongoDB at {MONGODB_URL}")
        
        # Create MongoDB client
        client = AsyncIOMotorClient(MONGODB_URL)
        
        # Verify connection
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Get database
        db = client[DATABASE_NAME]
        logger.info(f"Using database: {DATABASE_NAME}")
        
        # Get collection references
        inventory = db.inventory
        inventory_activities = db.inventory_activities
        users = db.users
        orders = db.orders
        
        # Create collections if they don't exist
        collections = await db.list_collection_names()
        logger.info(f"Existing collections: {collections}")
        
        for collection_name in ["inventory", "inventory_activities", "users", "orders"]:
            if collection_name not in collections:
                logger.info(f"Creating collection: {collection_name}")
                await db.create_collection(collection_name)
                logger.info(f"Created collection: {collection_name}")
            else:
                logger.info(f"Collection already exists: {collection_name}")
        
        # Update existing inventory records to add name_lower field
        logger.info("Updating existing inventory records...")
        async for item in inventory.find({"name_lower": {"$exists": False}}):
            if "name" in item:
                await inventory.update_one(
                    {"_id": item["_id"]},
                    {"$set": {"name_lower": item["name"].lower()}}
                )
                logger.info(f"Updated item {item['_id']} with name_lower field")
        
        # Create indexes
        try:
            # Drop existing indexes first
            await inventory.drop_indexes()
            logger.info("Dropped existing indexes")
            
            # Create unique index on name_lower field for inventory
            await inventory.create_index("name_lower", unique=True)
            logger.info("Created unique index on inventory.name_lower")
            
            # Create index on timestamp for activities
            await inventory_activities.create_index("timestamp")
            logger.info("Created index on inventory_activities.timestamp")
            
            # Create index on item_id for activities
            await inventory_activities.create_index("item_id")
            logger.info("Created index on inventory_activities.item_id")
            
            # Create index on email for users
            await users.create_index("email", unique=True)
            logger.info("Created unique index on users.email")
            
        except OperationFailure as e:
            logger.error(f"Error creating indexes: {str(e)}")
            raise
        
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Error during database initialization: {str(e)}")
        if client:
            client.close()
        raise

async def close_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed") 