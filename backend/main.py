from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from inventory import router as inventory_router
from auth import router as auth_router
from database import init_db
import logging
from contextlib import asynccontextmanager

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up application...")
    try:
        await init_db()
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise
    yield
    # Shutdown
    logger.info("Shutting down application...")

app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(inventory_router, prefix="/api/inventory", tags=["inventory"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to MedTrack API"}