"""
Seed script to add mock data to the salon booking system database
Run with: python seed_data.py
"""

from datetime import datetime, timedelta
from main import app, SessionLocal, User, Service, Booking, Payment
from enum import Enum as PyEnum
import bcrypt

class UserRoleEnum(str, PyEnum):
    CLIENT = "client"
    STYLIST = "stylist"
    ADMIN = "admin"

class BookingStatusEnum(str, PyEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentMethodEnum(str, PyEnum):
    ON_SITE = "on_site"
    STRIPE = "stripe"

class PaymentStatusEnum(str, PyEnum):
    COMPLETED = "completed"
    PENDING = "pending"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def seed_database():
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(Payment).delete()
        db.query(Booking).delete()
        db.query(User).delete()
        db.query(Service).delete()
        db.commit()
        print("✓ Database cleared")

        # Create admin user
        admin = User(
            email="admin@salon.com",
            password_hash=hash_password("admin123"),
            first_name="Admin",
            last_name="User",
            phone_number="+1234567890",
            role=UserRoleEnum.ADMIN,
            preferred_language="en"
        )
        db.add(admin)

        # Create client users
        clients = [
            User(
                email="client@salon.com",
                password_hash=hash_password("password123"),
                first_name="John",
                last_name="Doe",
                phone_number="+1111111111",
                role=UserRoleEnum.CLIENT,
                preferred_language="en"
            ),
            User(
                email="client2@salon.com",
                password_hash=hash_password("password123"),
                first_name="Jane",
                last_name="Smith",
                phone_number="+2222222222",
                role=UserRoleEnum.CLIENT,
                preferred_language="sv"
            ),
            User(
                email="client3@salon.com",
                password_hash=hash_password("password123"),
                first_name="Erik",
                last_name="Svensson",
                phone_number="+3333333333",
                role=UserRoleEnum.CLIENT,
                preferred_language="sv"
            ),
        ]
        db.add_all(clients)

        # Create stylists
        stylists = [
            User(
                email="stylist1@salon.com",
                password_hash=hash_password("stylist123"),
                first_name="Sarah",
                last_name="Hair",
                phone_number="+4444444444",
                role=UserRoleEnum.STYLIST,
                preferred_language="en"
            ),
            User(
                email="stylist2@salon.com",
                password_hash=hash_password("stylist123"),
                first_name="Maria",
                last_name="Curly",
                phone_number="+5555555555",
                role=UserRoleEnum.STYLIST,
                preferred_language="sv"
            ),
        ]
        db.add_all(stylists)
        db.commit()
        print(f"✓ Created {len(clients)} clients + {len(stylists)} stylists + 1 admin")

        # Create services
        services = [
            Service(
                name="Haircut",
                description="Classic haircut with styling",
                price=45.00,
                duration_minutes=45,
                category="Haircut"
            ),
            Service(
                name="Hair Coloring",
                description="Full hair color treatment",
                price=85.00,
                duration_minutes=90,
                category="Coloring"
            ),
            Service(
                name="Highlights",
                description="Selective hair highlighting",
                price=95.00,
                duration_minutes=120,
                category="Coloring"
            ),
            Service(
                name="Blow Dry",
                description="Professional blow dry styling",
                price=35.00,
                duration_minutes=30,
                category="Styling"
            ),
            Service(
                name="Hair Straightening",
                description="Keratin treatment and straightening",
                price=150.00,
                duration_minutes=180,
                category="Treatment"
            ),
            Service(
                name="Hair Perming",
                description="Permanent wave treatment",
                price=120.00,
                duration_minutes=150,
                category="Styling"
            ),
            Service(
                name="Manicure",
                description="Nail care and polish",
                price=25.00,
                duration_minutes=40,
                category="Nails"
            ),
            Service(
                name="Pedicure",
                description="Foot care and nail treatment",
                price=35.00,
                duration_minutes=50,
                category="Nails"
            ),
        ]
        db.add_all(services)
        db.commit()
        print(f"✓ Created {len(services)} services")

        # Create bookings
        base_date = datetime.utcnow() + timedelta(days=1)
        bookings = [
            Booking(
                client_id=clients[0].id,
                service_id=services[0].id,
                stylist_id=stylists[0].id,
                booking_datetime=base_date + timedelta(hours=10),
                status=BookingStatusEnum.CONFIRMED,
                notes="Regular haircut",
                payment_method=PaymentMethodEnum.ON_SITE,
                is_paid=False
            ),
            Booking(
                client_id=clients[1].id,
                service_id=services[1].id,
                stylist_id=stylists[1].id,
                booking_datetime=base_date + timedelta(hours=14),
                status=BookingStatusEnum.CONFIRMED,
                notes="Full coloring",
                payment_method=PaymentMethodEnum.STRIPE,
                is_paid=True
            ),
            Booking(
                client_id=clients[2].id,
                service_id=services[3].id,
                stylist_id=stylists[0].id,
                booking_datetime=base_date + timedelta(days=2, hours=15),
                status=BookingStatusEnum.PENDING,
                notes="Blow dry for special event",
                payment_method=PaymentMethodEnum.ON_SITE,
                is_paid=False
            ),
            Booking(
                client_id=clients[0].id,
                service_id=services[2].id,
                stylist_id=stylists[1].id,
                booking_datetime=base_date + timedelta(days=3, hours=11),
                status=BookingStatusEnum.COMPLETED,
                notes="Highlights touch up",
                payment_method=PaymentMethodEnum.STRIPE,
                is_paid=True
            ),
        ]
        db.add_all(bookings)
        db.commit()
        print(f"✓ Created {len(bookings)} bookings")

        # Create payments
        payments = [
            Payment(
                booking_id=bookings[1].id,
                user_id=clients[1].id,
                amount=85.00,
                status=PaymentStatusEnum.COMPLETED,
                transaction_id="pi_demo_1",
                method=PaymentMethodEnum.STRIPE,
                paid_at=datetime.utcnow()
            ),
            Payment(
                booking_id=bookings[3].id,
                user_id=clients[0].id,
                amount=95.00,
                status=PaymentStatusEnum.COMPLETED,
                transaction_id="pi_demo_2",
                method=PaymentMethodEnum.STRIPE,
                paid_at=datetime.utcnow()
            ),
        ]
        db.add_all(payments)
        db.commit()
        print(f"✓ Created {len(payments)} payments")

        print("\n✅ Database seeded successfully!")
        print("\nDemo Credentials:")
        print("  Admin: admin@salon.com / admin123")
        print("  Client: client@salon.com / password123")
        print("  Stylist: stylist1@salon.com / stylist123")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
