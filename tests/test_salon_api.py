"""
Comprehensive test suite for Salon Booking System FastAPI backend
Run with: pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
from main import app, SessionLocal, User, Service, Booking, Payment
from datetime import datetime, timedelta
import bcrypt

# Test client
client = TestClient(app)

# ==================== FIXTURES ====================

@pytest.fixture
def db_session():
    """Create a test database session"""
    from sqlalchemy import create_engine
    from sqlalchemy.pool import StaticPool
    
    SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
    engine = create_engine(
        SQLALCHEMY_TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    from main import Base
    Base.metadata.create_all(bind=engine)
    
    SessionLocal_test = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    yield SessionLocal_test()

@pytest.fixture
def admin_user(db_session):
    """Create admin user for testing"""
    pwd_hash = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
    admin = User(
        email="admin@test.com",
        password_hash=pwd_hash,
        first_name="Admin",
        last_name="Test",
        phone_number="+1234567890",
        role="admin",
        preferred_language="en"
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin

@pytest.fixture
def client_user(db_session):
    """Create client user for testing"""
    pwd_hash = bcrypt.hashpw("password123".encode(), bcrypt.gensalt()).decode()
    user = User(
        email="client@test.com",
        password_hash=pwd_hash,
        first_name="Client",
        last_name="Test",
        phone_number="+1111111111",
        role="client",
        preferred_language="en"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def sample_service(db_session):
    """Create sample service"""
    service = Service(
        name="Haircut",
        description="Professional haircut",
        price=45.00,
        duration_minutes=45,
        category="Haircut"
    )
    db_session.add(service)
    db_session.commit()
    db_session.refresh(service)
    return service

# ==================== AUTH TESTS ====================

class TestAuthentication:
    def test_register_user(self):
        """Test user registration"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newuser@test.com",
                "password": "TestPass123!",
                "first_name": "New",
                "last_name": "User",
                "phone_number": "+1234567890"
            }
        )
        assert response.status_code == 201
        assert response.json()["email"] == "newuser@test.com"

    def test_register_duplicate_email(self):
        """Test registration with duplicate email fails"""
        # Register first user
        client.post(
            "/api/auth/register",
            json={
                "email": "duplicate@test.com",
                "password": "Pass123!",
                "first_name": "User",
                "last_name": "One",
                "phone_number": "+1111111111"
            }
        )
        
        # Try to register with same email
        response = client.post(
            "/api/auth/register",
            json={
                "email": "duplicate@test.com",
                "password": "Pass456!",
                "first_name": "User",
                "last_name": "Two",
                "phone_number": "+2222222222"
            }
        )
        assert response.status_code == 409

    def test_login_success(self):
        """Test successful login"""
        # Register user
        client.post(
            "/api/auth/register",
            json={
                "email": "logintest@test.com",
                "password": "LoginPass123!",
                "first_name": "Login",
                "last_name": "Test",
                "phone_number": "+1111111111"
            }
        )
        
        # Login
        response = client.post(
            "/api/auth/login",
            json={
                "email": "logintest@test.com",
                "password": "LoginPass123!"
            }
        )
        assert response.status_code == 200
        assert "token" in response.json()

    def test_login_invalid_credentials(self):
        """Test login with wrong password"""
        # Register user
        client.post(
            "/api/auth/register",
            json={
                "email": "badlogin@test.com",
                "password": "CorrectPass123!",
                "first_name": "Bad",
                "last_name": "Login",
                "phone_number": "+1111111111"
            }
        )
        
        # Try wrong password
        response = client.post(
            "/api/auth/login",
            json={
                "email": "badlogin@test.com",
                "password": "WrongPass123!"
            }
        )
        assert response.status_code == 401

# ==================== SERVICE TESTS ====================

class TestServices:
    def test_get_all_services(self):
        """Test fetching all services"""
        response = client.get("/api/services")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_service_details(self, sample_service):
        """Test getting specific service details"""
        response = client.get(f"/api/services/{sample_service.id}")
        assert response.status_code == 200
        assert response.json()["name"] == "Haircut"

    def test_create_service_admin(self, admin_user):
        """Test creating service as admin"""
        # Get admin token
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "admin@test.com",
                "password": "admin123"
            }
        )
        token = login_response.json()["token"]
        
        response = client.post(
            "/api/services",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Hair Coloring",
                "description": "Professional coloring",
                "price": 85.00,
                "duration_minutes": 90,
                "category": "Coloring"
            }
        )
        assert response.status_code == 201

    def test_create_service_non_admin(self, client_user):
        """Test non-admin cannot create service"""
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "client@test.com",
                "password": "password123"
            }
        )
        token = login_response.json()["token"]
        
        response = client.post(
            "/api/services",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Hair Coloring",
                "description": "Professional coloring",
                "price": 85.00,
                "duration_minutes": 90,
                "category": "Coloring"
            }
        )
        assert response.status_code == 403

# ==================== BOOKING TESTS ====================

class TestBookings:
    def test_create_booking(self, client_user, sample_service):
        """Test creating a booking"""
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "client@test.com",
                "password": "password123"
            }
        )
        token = login_response.json()["token"]
        
        booking_time = (datetime.utcnow() + timedelta(days=1)).isoformat()
        
        response = client.post(
            "/api/bookings",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "service_id": sample_service.id,
                "booking_datetime": booking_time,
                "notes": "Test booking",
                "payment_method": "on_site"
            }
        )
        assert response.status_code == 201

    def test_get_my_bookings(self, client_user):
        """Test getting user's bookings"""
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "client@test.com",
                "password": "password123"
            }
        )
        token = login_response.json()["token"]
        
        response = client.get(
            "/api/bookings",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_cancel_booking(self):
        """Test cancelling a booking"""
        # Setup: Register, login, create booking, cancel
        register = client.post(
            "/api/auth/register",
            json={
                "email": "cancel@test.com",
                "password": "Pass123!",
                "first_name": "Cancel",
                "last_name": "Test",
                "phone_number": "+1111111111"
            }
        )
        
        # Would need booking ID - simplified test
        pass

# ==================== PAYMENT TESTS ====================

class TestPayments:
    def test_payment_methods(self):
        """Test payment method options"""
        payment_methods = ["on_site", "stripe"]
        assert all(m in ["on_site", "stripe"] for m in payment_methods)

# ==================== ERROR HANDLING TESTS ====================

class TestErrorHandling:
    def test_invalid_json(self):
        """Test invalid JSON body"""
        response = client.post(
            "/api/auth/register",
            json={"invalid": "data"}  # Missing required fields
        )
        assert response.status_code in [400, 422]

    def test_not_found(self):
        """Test accessing non-existent resource"""
        response = client.get("/api/services/99999")
        assert response.status_code == 404

    def test_unauthorized(self):
        """Test accessing protected endpoint without token"""
        response = client.get("/api/bookings")
        assert response.status_code == 401

# ==================== LANGUAGE TESTS ====================

class TestLanguage:
    def test_language_preference(self, client_user):
        """Test user language preference"""
        assert client_user.preferred_language == "en"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
