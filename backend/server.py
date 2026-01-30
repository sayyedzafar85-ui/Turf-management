from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta, time as dt_time
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'turf-management-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class LoginRequest(BaseModel):
    username: str
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class CreateUserRequest(BaseModel):
    username: str
    mobile: str
    role: str  # 'admin' or 'staff'
    turf_name: Optional[str] = None
    temporary_password: str
    permissions: Optional[dict] = None

class TurfSettings(BaseModel):
    turf_name: str
    open_time: str  # HH:MM format
    close_time: str  # HH:MM format
    slot_duration: int  # minutes (60 or 90)
    weekday_price: float
    weekend_price: float
    advance_required: Optional[float] = 0
    cancellation_policy: Optional[str] = "No refund"

class BookingCreate(BaseModel):
    date: str  # YYYY-MM-DD
    slot_time: str  # HH:MM
    customer_name: str
    customer_mobile: str
    total_amount: float
    advance_paid: float
    payment_mode: str  # Cash, UPI, Card

class CustomerRecord(BaseModel):
    customer_name: str
    customer_mobile: str
    visit_count: int = 1
    total_spent: float = 0
    last_booking_date: str

class StaffPermissions(BaseModel):
    can_add_booking: bool = True
    can_take_payment: bool = True
    can_edit_price: bool = False
    can_view_reports: bool = False

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"username": username}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Initialize super admin on startup
@app.on_event("startup")
async def create_super_admin():
    existing_super_admin = await db.users.find_one({"role": "super_admin"})
    if not existing_super_admin:
        super_admin = {
            "username": "superadmin",
            "password": get_password_hash("Admin@123"),
            "role": "super_admin",
            "mobile": "9999999999",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "force_password_change": True
        }
        await db.users.insert_one(super_admin)
        logger.info("Super admin created: username=superadmin, password=Admin@123")

# Auth Routes
@api_router.post("/auth/login", response_model=Token)
async def login(login_data: LoginRequest):
    user = await db.users.find_one({"username": login_data.username}, {"_id": 0})
    
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    
    # Remove password from user object
    user_data = {k: v for k, v in user.items() if k != "password"}
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@api_router.post("/auth/change-password")
async def change_password(password_data: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    if not verify_password(password_data.old_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    new_hashed_password = get_password_hash(password_data.new_password)
    await db.users.update_one(
        {"username": current_user["username"]},
        {"$set": {"password": new_hashed_password, "force_password_change": False}}
    )
    
    return {"message": "Password changed successfully"}

@api_router.post("/auth/create-user")
async def create_user(user_data: CreateUserRequest, current_user: dict = Depends(get_current_user)):
    # Only super_admin can create admins, admins can create staff
    if current_user["role"] == "super_admin" and user_data.role not in ["admin", "staff"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    if current_user["role"] == "admin" and user_data.role != "staff":
        raise HTTPException(status_code=403, detail="Admins can only create staff")
    
    if current_user["role"] == "staff":
        raise HTTPException(status_code=403, detail="Staff cannot create users")
    
    # Check if username exists
    existing = await db.users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = {
        "username": user_data.username,
        "password": get_password_hash(user_data.temporary_password),
        "role": user_data.role,
        "mobile": user_data.mobile,
        "turf_name": user_data.turf_name if user_data.role == "admin" else current_user.get("turf_name"),
        "created_by": current_user["username"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "force_password_change": True,
        "permissions": user_data.permissions or {"can_add_booking": True, "can_take_payment": True, "can_edit_price": False, "can_view_reports": False}
    }
    
    await db.users.insert_one(new_user)
    
    return {"message": f"{user_data.role.capitalize()} created successfully", "username": user_data.username}

# Dashboard Routes
@api_router.get("/dashboard/super-admin")
async def super_admin_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get all turfs (admins)
    admins = await db.users.find({"role": "admin"}, {"_id": 0, "password": 0}).to_list(None)
    
    # Get total bookings across all turfs
    total_bookings = await db.bookings.count_documents({})
    
    # Get total revenue
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}]
    result = await db.bookings.aggregate(pipeline).to_list(1)
    total_revenue = result[0]["total"] if result else 0
    
    # Active vs inactive turfs
    active_turfs = len([a for a in admins if a.get("turf_name")])
    
    return {
        "total_turfs": len(admins),
        "active_turfs": active_turfs,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "turfs": admins
    }

@api_router.get("/dashboard/admin")
async def admin_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    turf_name = current_user.get("turf_name")
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Today's bookings
    today_bookings = await db.bookings.find(
        {"turf_name": turf_name, "date": today},
        {"_id": 0}
    ).to_list(None)
    
    # Today's income
    today_income = sum([b["total_amount"] for b in today_bookings])
    
    # Pending payments
    pending_payments = await db.bookings.find(
        {"turf_name": turf_name, "balance_pending": {"$gt": 0}},
        {"_id": 0}
    ).to_list(None)
    
    # Available slots for today
    settings = await db.turf_settings.find_one({"turf_name": turf_name}, {"_id": 0})
    
    available_count = 0
    if settings:
        # Generate today's slots
        slots = generate_slots_for_date(settings, today)
        booked_slots = [b["slot_time"] for b in today_bookings]
        available_count = len([s for s in slots if s not in booked_slots])
    
    return {
        "today_bookings_count": len(today_bookings),
        "today_income": today_income,
        "pending_payments_count": len(pending_payments),
        "pending_amount": sum([b.get("balance_pending", 0) for b in pending_payments]),
        "available_slots_today": available_count,
        "recent_bookings": today_bookings[:5]
    }

# Turf Settings Routes
@api_router.post("/settings/turf")
async def save_turf_settings(settings: TurfSettings, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update settings")
    
    settings_dict = settings.model_dump()
    settings_dict["turf_name"] = current_user.get("turf_name") or settings.turf_name
    settings_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.turf_settings.update_one(
        {"turf_name": settings_dict["turf_name"]},
        {"$set": settings_dict},
        upsert=True
    )
    
    return {"message": "Settings saved successfully"}

@api_router.get("/settings/turf")
async def get_turf_settings(current_user: dict = Depends(get_current_user)):
    turf_name = current_user.get("turf_name")
    settings = await db.turf_settings.find_one({"turf_name": turf_name}, {"_id": 0})
    
    if not settings:
        return {"message": "No settings found"}
    
    return settings

# Slot Generation
def generate_slots_for_date(settings: dict, date_str: str) -> List[str]:
    """Generate time slots based on turf settings"""
    slots = []
    
    # Parse times
    open_hour, open_min = map(int, settings["open_time"].split(":"))
    close_hour, close_min = map(int, settings["close_time"].split(":"))
    slot_duration = settings["slot_duration"]
    
    current_time = datetime.strptime(f"{open_hour:02d}:{open_min:02d}", "%H:%M")
    end_time = datetime.strptime(f"{close_hour:02d}:{close_min:02d}", "%H:%M")
    
    while current_time < end_time:
        slots.append(current_time.strftime("%H:%M"))
        current_time += timedelta(minutes=slot_duration)
    
    return slots

@api_router.get("/slots/available")
async def get_available_slots(date: str, current_user: dict = Depends(get_current_user)):
    turf_name = current_user.get("turf_name")
    
    # Get settings
    settings = await db.turf_settings.find_one({"turf_name": turf_name}, {"_id": 0})
    if not settings:
        raise HTTPException(status_code=404, detail="Turf settings not found. Please configure settings first.")
    
    # Generate all slots for the date
    all_slots = generate_slots_for_date(settings, date)
    
    # Get booked slots
    bookings = await db.bookings.find(
        {"turf_name": turf_name, "date": date, "status": {"$ne": "cancelled"}},
        {"_id": 0, "slot_time": 1}
    ).to_list(None)
    
    booked_slots = [b["slot_time"] for b in bookings]
    
    # Determine if date is weekend
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    is_weekend = date_obj.weekday() >= 5  # Saturday=5, Sunday=6
    
    price = settings["weekend_price"] if is_weekend else settings["weekday_price"]
    
    # Create slot status list
    slot_status = [
        {
            "time": slot,
            "available": slot not in booked_slots,
            "price": price
        }
        for slot in all_slots
    ]
    
    return {
        "date": date,
        "is_weekend": is_weekend,
        "slots": slot_status
    }

# Booking Routes
@api_router.post("/bookings")
async def create_booking(booking: BookingCreate, current_user: dict = Depends(get_current_user)):
    turf_name = current_user.get("turf_name")
    
    # Check if slot is available
    existing = await db.bookings.find_one({
        "turf_name": turf_name,
        "date": booking.date,
        "slot_time": booking.slot_time,
        "status": {"$ne": "cancelled"}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Slot already booked")
    
    booking_data = {
        "turf_name": turf_name,
        "date": booking.date,
        "slot_time": booking.slot_time,
        "customer_name": booking.customer_name,
        "customer_mobile": booking.customer_mobile,
        "total_amount": booking.total_amount,
        "advance_paid": booking.advance_paid,
        "balance_pending": booking.total_amount - booking.advance_paid,
        "payment_mode": booking.payment_mode,
        "status": "confirmed",
        "created_by": current_user["username"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookings.insert_one(booking_data)
    
    # Update customer records
    customer = await db.customers.find_one(
        {"turf_name": turf_name, "customer_mobile": booking.customer_mobile},
        {"_id": 0}
    )
    
    if customer:
        await db.customers.update_one(
            {"turf_name": turf_name, "customer_mobile": booking.customer_mobile},
            {
                "$inc": {"visit_count": 1, "total_spent": booking.total_amount},
                "$set": {"last_booking_date": booking.date}
            }
        )
    else:
        await db.customers.insert_one({
            "turf_name": turf_name,
            "customer_name": booking.customer_name,
            "customer_mobile": booking.customer_mobile,
            "visit_count": 1,
            "total_spent": booking.total_amount,
            "last_booking_date": booking.date
        })
    
    return {"message": "Booking created successfully", "booking": booking_data}

@api_router.get("/bookings")
async def get_bookings(date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    turf_name = current_user.get("turf_name")
    
    query = {"turf_name": turf_name}
    if date:
        query["date"] = date
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    
    return {"bookings": bookings}

@api_router.patch("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    # This is a simplified cancel - in production you'd match by proper ID
    result = await db.bookings.update_one(
        {"created_at": booking_id},  # Using created_at as unique identifier for simplicity
        {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking cancelled successfully"}

# Payment Routes
@api_router.get("/payments/pending")
async def get_pending_payments(current_user: dict = Depends(get_current_user)):
    turf_name = current_user.get("turf_name")
    
    pending = await db.bookings.find(
        {"turf_name": turf_name, "balance_pending": {"$gt": 0}},
        {"_id": 0}
    ).to_list(None)
    
    return {"pending_payments": pending}

@api_router.patch("/payments/{booking_created_at}/pay")
async def record_payment(booking_created_at: str, amount: float, current_user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"created_at": booking_created_at}, {"_id": 0})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    new_balance = booking["balance_pending"] - amount
    
    await db.bookings.update_one(
        {"created_at": booking_created_at},
        {
            "$set": {"balance_pending": max(0, new_balance)},
            "$inc": {"advance_paid": amount}
        }
    )
    
    return {"message": "Payment recorded", "new_balance": max(0, new_balance)}

# Customer Routes
@api_router.get("/customers")
async def get_customers(current_user: dict = Depends(get_current_user)):
    turf_name = current_user.get("turf_name")
    
    customers = await db.customers.find(
        {"turf_name": turf_name},
        {"_id": 0}
    ).sort("visit_count", -1).to_list(None)
    
    return {"customers": customers}

# Reports Routes
@api_router.get("/reports/daily")
async def daily_report(date: str, current_user: dict = Depends(get_current_user)):
    turf_name = current_user.get("turf_name")
    
    bookings = await db.bookings.find(
        {"turf_name": turf_name, "date": date},
        {"_id": 0}
    ).to_list(None)
    
    total_revenue = sum([b["total_amount"] for b in bookings])
    total_advance = sum([b["advance_paid"] for b in bookings])
    
    return {
        "date": date,
        "total_bookings": len(bookings),
        "total_revenue": total_revenue,
        "total_advance_collected": total_advance,
        "pending_amount": total_revenue - total_advance,
        "bookings": bookings
    }

# Staff Routes
@api_router.get("/staff")
async def get_staff(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view staff")
    
    turf_name = current_user.get("turf_name")
    
    staff = await db.users.find(
        {"role": "staff", "turf_name": turf_name},
        {"_id": 0, "password": 0}
    ).to_list(None)
    
    return {"staff": staff}

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