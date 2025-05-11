from typing import Optional, List, Union, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_json_schema__(cls, _schema_generator, _schema):
        return {
            "type": "string",
            "description": "ObjectId string",
            "examples": ["507f1f77bcf86cd799439011"]
        }

    @classmethod
    def validate(cls, v: Any, handler) -> ObjectId:
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid ObjectId string")
            return ObjectId(v)
        raise ValueError("Invalid ObjectId format")

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class InventoryItemCreate(BaseModel):
    name: str
    description: str
    quantity: int
    unit: str
    use_period: int
    price: float
    reorder_level: int

class InventoryItem(MongoBaseModel):
    name: str
    name_lower: str  # Store lowercase version for case-insensitive searches
    description: str
    quantity: int
    unit: str
    use_period: int
    price: float
    reorder_level: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @classmethod
    def from_mongo(cls, data: dict):
        if not data:
            return None
        id = data.pop('_id', None)
        if id:
            data['id'] = PyObjectId(str(id))
        
        # Handle records that don't have name_lower field
        if 'name' in data and 'name_lower' not in data:
            data['name_lower'] = data['name'].lower()
        
        return cls(**data)

class OrderItem(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    inventory_item_id: PyObjectId
    quantity: int
    price: float
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class Order(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    items: List[OrderItem]
    total_amount: float
    status: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class InventoryActivity(MongoBaseModel):
    item_id: PyObjectId
    action: str
    details: str
    timestamp: datetime = Field(default_factory=datetime.utcnow) 