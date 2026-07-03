from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Enum, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.pool import StaticPool
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import jwt
import bcrypt
import stripe
import os
from enum import Enum as PyEnum
from typing import Optional, List

# ==================== CONFIG ====================
DATABASE_URL = "sqlite:///./salon.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_demo")

# JWT config
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ==================== ENUMS ====================
class UserRoleEnum(str, PyEnum):
    CLIENT = "client"
    STYLIST = "stylist"
    ADMIN = "admin"

class BookingStatusEnum(str, PyEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class PaymentMethodEnum(str, PyEnum):
    ON_SITE = "on_site"
    STRIPE = "stripe"
    CASH = "cash"

class PaymentStatusEnum(str, PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

# ==================== MODELS ====================
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    phone_number = Column(String)
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.CLIENT)
    preferred_language = Column(String, default="en")  # en, sv
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="client", foreign_keys="Booking.client_id")
    stylist_bookings = relationship("Booking", back_populates="stylist", foreign_keys="Booking.stylist_id")
    payments = relationship("Payment", back_populates="user")

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text)
    price = Column(Float)
    duration_minutes = Column(Integer)
    category = Column(String)  # Haircut, Coloring, Styling, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="service")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    stylist_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    booking_datetime = Column(DateTime)
    status = Column(Enum(BookingStatusEnum), default=BookingStatusEnum.PENDING)
    notes = Column(String)
    payment_method = Column(Enum(PaymentMethodEnum), default=PaymentMethodEnum.ON_SITE)
    is_paid = Column(Boolean, default=False)
    stripe_payment_intent_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    client = relationship("User", back_populates="bookings", foreign_keys=[client_id])
    stylist = relationship("User", back_populates="stylist_bookings", foreign_keys=[stylist_id])
    service = relationship("Service", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    status = Column(Enum(PaymentStatusEnum), default=PaymentStatusEnum.PENDING)
    transaction_id = Column(String)  # Stripe or internal ID
    method = Column(Enum(PaymentMethodEnum))
    paid_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    booking = relationship("Booking", back_populates="payment")
    user = relationship("User", back_populates="payments")

# ==================== SCHEMAS ====================
class UserBase(BaseModel):
    email: str
    first_name: str
    last_name: str
    phone_number: str
    preferred_language: str = "en"

class UserRegister(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRoleEnum
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ServiceResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    duration_minutes: int
    category: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    service_id: int
    booking_datetime: datetime
    notes: Optional[str] = None
    payment_method: PaymentMethodEnum = PaymentMethodEnum.ON_SITE
    stylist_id: Optional[int] = None

class BookingResponse(BaseModel):
    id: int
    client_id: int
    service_id: int
    stylist_id: Optional[int]
    booking_datetime: datetime
    status: BookingStatusEnum
    notes: str
    payment_method: PaymentMethodEnum
    is_paid: bool
    created_at: datetime
    service: ServiceResponse
    
    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: float
    status: PaymentStatusEnum
    method: PaymentMethodEnum
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== APP ====================
app = FastAPI(title="Salon Booking System API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# ==================== DEPENDENCIES ====================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: HTTPAuthCredentials = Depends(HTTPBearer()), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ==================== AUTH ENDPOINTS ====================
@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    
    # Create user
    new_user = User(
        email=user.email,
        password_hash=password_hash,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        preferred_language=user.preferred_language,
        role=UserRoleEnum.CLIENT
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    access_token = create_access_token(data={"sub": new_user.id})
    return {"access_token": access_token}

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== SERVICES ENDPOINTS ====================
@app.get("/api/services", response_model=List[ServiceResponse])
async def get_services(db: Session = Depends(get_db)):
    services = db.query(Service).filter(Service.is_active == True).all()
    return services

@app.get("/api/services/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@app.post("/api/services", response_model=ServiceResponse)
async def create_service(
    name: str,
    description: str,
    price: float,
    duration_minutes: int,
    category: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create services")
    
    service = Service(
        name=name,
        description=description,
        price=price,
        duration_minutes=duration_minutes,
        category=category
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

# ==================== BOOKINGS ENDPOINTS ====================
@app.post("/api/bookings", response_model=BookingResponse)
async def create_booking(
    booking: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate service exists
    service = db.query(Service).filter(Service.id == booking.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check booking time is in future
    if booking.booking_datetime < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Booking time must be in future")
    
    # Check no double booking at same time
    existing = db.query(Booking).filter(
        Booking.booking_datetime == booking.booking_datetime,
        Booking.status != BookingStatusEnum.CANCELLED
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Time slot already booked")
    
    new_booking = Booking(
        client_id=current_user.id,
        service_id=booking.service_id,
        stylist_id=booking.stylist_id,
        booking_datetime=booking.booking_datetime,
        notes=booking.notes,
        payment_method=booking.payment_method
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

@app.get("/api/bookings", response_model=List[BookingResponse])
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).filter(Booking.client_id == current_user.id).all()
    return bookings

@app.get("/api/bookings/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.client_id != current_user.id and current_user.role != UserRoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    return booking

@app.put("/api/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.client_id != current_user.id and current_user.role != UserRoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    booking.status = BookingStatusEnum.CANCELLED
    db.commit()
    return {"message": "Booking cancelled"}

# ==================== PAYMENT ENDPOINTS ====================
@app.post("/api/payments/create-intent")
async def create_payment_intent(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.client_id != current_user.id and current_user.role != UserRoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    service = booking.service
    amount_cents = int(service.price * 100)
    
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            metadata={"booking_id": booking_id, "user_id": current_user.id}
        )
        
        booking.stripe_payment_intent_id = intent.id
        db.commit()
        
        return {"client_secret": intent.client_secret, "intent_id": intent.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/payments/{booking_id}/confirm")
async def confirm_payment(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.is_paid = True
    booking.status = BookingStatusEnum.CONFIRMED
    
    payment = Payment(
        booking_id=booking.id,
        user_id=current_user.id,
        amount=booking.service.price,
        status=PaymentStatusEnum.COMPLETED,
        method=booking.payment_method,
        transaction_id=booking.stripe_payment_intent_id,
        paid_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()
    
    return {"message": "Payment confirmed"}

# ==================== ADMIN ENDPOINTS ====================
@app.get("/api/admin/bookings")
async def get_all_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    bookings = db.query(Booking).all()
    return bookings

@app.get("/api/admin/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_bookings = db.query(Booking).count()
    completed_bookings = db.query(Booking).filter(Booking.status == BookingStatusEnum.COMPLETED).count()
    total_revenue = db.query(Payment).filter(Payment.status == PaymentStatusEnum.COMPLETED).with_entities(Payment.amount).sum()
    
    return {
        "total_bookings": total_bookings,
        "completed_bookings": completed_bookings,
        "total_revenue": total_revenue or 0,
        "users": db.query(User).count()
    }

# ==================== HEALTH CHECK ====================
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
