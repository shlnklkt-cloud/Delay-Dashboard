from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from twilio.rest import Client


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# WhatsApp Message Models
class WhatsAppMessage(BaseModel):
    to_number: str = Field(..., description="Recipient's WhatsApp number with country code (e.g., +6591234567)")
    claim_number: str
    amount: str
    flight_number: str
    traveller_name: str

class WhatsAppResponse(BaseModel):
    success: bool
    message: str
    message_sid: Optional[str] = None

# Twilio Configuration
def get_twilio_client():
    """Get Twilio client with credentials from environment variables"""
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    
    if not account_sid or not auth_token:
        logger.warning("Twilio credentials not found in environment variables")
        return None
    
    return Client(account_sid, auth_token)

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/send-whatsapp", response_model=WhatsAppResponse)
async def send_whatsapp_notification(message_data: WhatsAppMessage):
    """
    Send WhatsApp notification for claim payment
    """
    try:
        # Get Twilio client
        twilio_client = get_twilio_client()
        
        if not twilio_client:
            # Return success but indicate it's a mock message (for development without credentials)
            logger.info(f"Mock WhatsApp message - Would send to {message_data.to_number}")
            return WhatsAppResponse(
                success=True,
                message=f"Mock message sent (Twilio credentials not configured). Message would be: A new claim of {message_data.amount} has successfully been paid.",
                message_sid="mock_sid_" + str(uuid.uuid4())
            )
        
        # Get WhatsApp from number from environment
        from_number = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')
        
        # Format the message
        message_body = f"""A new claim has successfully been paid.

Claim Number: {message_data.claim_number}
Flight: {message_data.flight_number}
Traveller: {message_data.traveller_name}
Amount Paid: {message_data.amount}

Thank you for choosing Income Insurance!"""
        
        # Send WhatsApp message via Twilio
        message = twilio_client.messages.create(
            body=message_body,
            from_=from_number,
            to=f"whatsapp:{message_data.to_number}"
        )
        
        logger.info(f"WhatsApp message sent successfully. SID: {message.sid}")
        
        return WhatsAppResponse(
            success=True,
            message="WhatsApp notification sent successfully",
            message_sid=message.sid
        )
        
    except Exception as e:
        logger.error(f"Error sending WhatsApp message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send WhatsApp message: {str(e)}"
        )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()