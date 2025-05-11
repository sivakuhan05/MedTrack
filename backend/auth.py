from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
from database import get_users
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Google OAuth2 configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8080/auth/callback")

async def get_google_user_info(access_token: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Could not validate Google credentials")
        return response.json()

@router.post("/google-auth")
async def google_auth(code: str):
    try:
        logger.info(f"Received Google auth code: {code}")
        
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            logger.error("Google OAuth credentials not configured")
            raise HTTPException(status_code=500, detail="Google OAuth not configured")
        
        async with httpx.AsyncClient() as client:
            # Exchange code for tokens
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                }
            )
            token_data = token_response.json()
            
            if "error" in token_data:
                logger.error(f"Error from Google OAuth: {token_data['error']}")
                raise HTTPException(status_code=400, detail=token_data["error"])
            
            # Get user info from Google
            user_info = await get_google_user_info(token_data["access_token"])
            
            # Prepare user data
            user_data = {
                "id": user_info["id"],
                "email": user_info["email"],
                "name": user_info.get("name", ""),
                "picture": user_info.get("picture"),
                "updated_at": datetime.utcnow()
            }
            
            # Store or update user in database
            users = get_users()
            await users.update_one(
                {"email": user_info["email"]},
                {"$set": user_data},
                upsert=True
            )
            
            logger.info(f"Successfully authenticated user: {user_info['email']}")
            return {"user": user_data}
            
    except Exception as e:
        logger.error(f"Error during Google authentication: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed") 