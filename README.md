# 💇 Salon Booking System

> Professional salon booking application with Swedish language support, Stripe payments, and admin dashboard.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.11-3776AB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)
![React](https://img.shields.io/badge/React-18-61DAFB)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** ([download](https://www.python.org/downloads))
- **Node.js 18+** ([download](https://nodejs.org))
- **Git**

### Development (Local)

**Terminal 1: Backend API**
```bash
# Install dependencies
pip install -r requirements.txt

# Seed database with demo data
python seed_data.py

# Start server
python main.py
# API runs on http://localhost:8000
# API docs: http://localhost:8000/docs
```

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

### Demo Credentials
```
Admin:   admin@salon.com / admin123
Client:  client@salon.com / password123
Stylist: stylist1@salon.com / stylist123
```

---

## ✨ Features

### For Clients
✅ **Browse Services** — View all salon services with prices and durations  
✅ **Book Appointments** — Select date/time/services with one click  
✅ **Flexible Payment** — Pay online (Stripe) or on-site  
✅ **Manage Bookings** — View, reschedule, cancel your appointments  
✅ **Language Support** — Switch between English and Swedish  
✅ **Responsive Design** — Perfect on mobile, tablet, desktop  

### For Stylists
✅ **View Schedule** — See all appointments for the day  
✅ **Client Details** — Access client notes and preferences  
✅ **Mark Complete** — Update appointment status  
✅ **Manage Profile** — Update availability and services  

### For Admin
✅ **Dashboard Analytics** — Revenue, bookings, user stats  
✅ **Manage Services** — Create, edit, delete services  
✅ **User Management** — View clients, stylists, admins  
✅ **Bookings Overview** — All bookings with filtering  
✅ **Payment Reports** — Track Stripe and on-site payments  
✅ **Revenue Tracking** — Monthly/yearly reports  

---

## 🏗️ Architecture

### Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | FastAPI (Python) | REST API, business logic |
| **Frontend** | React 18 | User interface |
| **Database** | SQLite | Data persistence |
| **Auth** | JWT Bearer tokens | Authentication & authorization |
| **Payments** | Stripe API | Secure online payment processing |
| **ORM** | SQLAlchemy | Database abstraction |
| **State** | Zustand | Frontend state management |
| **Styling** | Tailwind CSS | Modern, responsive design |
| **i18n** | Custom translations | English & Swedish support |
| **API Client** | Axios | HTTP requests with interceptors |
| **Testing** | Pytest + TestClient | Comprehensive test suite |
| **CI/CD** | GitHub Actions | Automated testing & deployment |

### Database Schema

```
Users (id, email, password_hash, first_name, last_name, phone, role, language)
  ├→ Bookings (id, client_id, service_id, stylist_id, datetime, status, notes)
  ├→ Payments (id, booking_id, amount, status, method, transaction_id)
  └→ Schedule (id, user_id, available_from, available_to)

Services (id, name, description, price, duration_minutes, category)
```

### Project Structure

```
salon-booking-app/
├── main.py                          # FastAPI application + models
│   ├── Models
│   │   ├── User
│   │   ├── Service
│   │   ├── Booking
│   │   ├── Payment
│   │   └── Schedule
│   ├── Routes
│   │   ├── /auth (register, login)
│   │   ├── /services (CRUD)
│   │   ├── /bookings (create, list, cancel)
│   │   ├── /payments (Stripe, on-site)
│   │   └── /admin (dashboard, stats)
│   └── Middleware
│       ├── Auth (JWT validation)
│       ├── CORS
│       └── Error handling
│
├── seed_data.py                     # Demo data generation
│
├── requirements.txt                 # Python dependencies
│
├── frontend/                        # React web app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── MyBookingsPage.jsx
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── stores/
│   │   │   ├── authStore.js
│   │   │   ├── servicesStore.js
│   │   │   └── bookingsStore.js
│   │   ├── i18n/
│   │   │   └── translations.js      # EN/SV translations
│   │   ├── api/
│   │   │   └── client.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── tests/                           # Test suite
│   └── test_salon_api.py            # Pytest test cases
│
├── .github/workflows/
│   └── ci-cd.yml                    # GitHub Actions pipeline
│
├── README.md                        # This file
├── TESTING_GUIDE.md                 # Testing documentation
└── .env.example
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The project includes automated **CI/CD** with GitHub Actions:

**Triggered on:**
- ✅ Push to `main` or `develop` branch
- ✅ Pull requests to `main` or `develop`

**Jobs:**

1. **test-backend** (Pytest)
   - Installs Python dependencies
   - Runs seed_data.py
   - Runs all pytest test cases
   - Validates 40+ test scenarios

2. **build-frontend** (Node.js)
   - Installs npm dependencies
   - Builds React app with Vite
   - Uploads build artifacts

3. **code-quality**
   - Python code linting
   - Syntax validation
   - Import checking

4. **deploy-frontend** (Vercel)
   - Downloads frontend build
   - Deploys to Vercel automatically
   - Live after main push ✅

**View workflow:** `.github/workflows/ci-cd.yml`

**Check status:** Go to [GitHub > Actions](https://github.com/OscarJerez/salon-booking-app/actions)

---

## 🧪 Testing

### Running Tests Locally

```bash
# Install test dependencies
pip install -r requirements.txt

# Run all tests
pytest tests/ -v

# Run specific test class
pytest tests/test_salon_api.py::TestAuthentication -v

# Run with coverage report
pytest tests/ --cov=. --cov-report=html
```

### Test Coverage

**Authentication Tests** ✅
- User registration (valid/invalid)
- Login success/failure
- Token validation

**Service Tests** ✅
- Fetch all services
- Get service details
- Create service (admin only)

**Booking Tests** ✅
- Create booking
- Retrieve user's bookings
- Cancel booking

**Payment Tests** ✅
- On-site payment method
- Stripe payment method
- Payment status tracking

**Error Handling Tests** ✅
- Invalid JSON (400/422)
- Not found (404)
- Unauthorized (401)
- Forbidden (403)

**Language Support Tests** ✅
- Language switching
- Translation keys

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user profile
```

### Services
```
GET    /api/services               List all services
GET    /api/services/{id}          Get service details
POST   /api/services               Create service (admin)
PUT    /api/services/{id}          Update service (admin)
DELETE /api/services/{id}          Delete service (admin)
```

### Bookings
```
GET    /api/bookings               Get my bookings
POST   /api/bookings               Create booking
GET    /api/bookings/{id}          Get booking details
PUT    /api/bookings/{id}/cancel   Cancel booking
```

### Payments
```
POST   /api/payments/create-intent Create Stripe payment intent
POST   /api/payments/{id}/confirm  Confirm payment
GET    /api/payments               Get my payments
GET    /api/payments/{id}          Get payment details
```

### Admin
```
GET    /api/admin/bookings         Get all bookings
GET    /api/admin/stats            Get dashboard statistics
GET    /api/admin/users            Get all users
GET    /api/admin/revenue          Get revenue report
```

**Full API docs:** Visit `/docs` on running backend

---

## 🌐 Language Support

### Supported Languages
- 🇬🇧 **English** (default)
- 🇸🇪 **Swedish** (Svenska)

### Using Translations

Frontend automatically detects user's preferred language. Switch anytime with language selector in header.

Languages stored in: `frontend/src/i18n/translations.js`

---

## 💳 Payment Integration

### Stripe Setup

1. Create [Stripe account](https://stripe.com)
2. Get your **Secret Key** from Dashboard
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```

### Payment Methods

**Option 1: Pay Online (Stripe)**
- Client enters card details securely
- Payment processed immediately
- Confirmation email sent

**Option 2: Pay On-Site**
- Client books without payment
- Staff collects payment at salon
- No card details stored

---

## 🚢 Demo Data

### Seed Database
```bash
python seed_data.py
```

**Creates:**
- 3 users (admin, client, stylist)
- 8 salon services
- 4 sample bookings
- 2 sample payments

---

## 📊 Performance

- SQLite with optimized queries
- JWT stateless authentication
- React component optimization
- CSS minification
- Lazy loading
- Response compression

---

## 🔐 Security

✅ **Password Hashing** — Bcrypt  
✅ **JWT Authentication** — 24-hour token expiry  
✅ **Role-Based Access** — Client/Stylist/Admin  
✅ **SQL Injection Prevention** — SQLAlchemy ORM  
✅ **CORS Configuration** — Secure origins  
✅ **Input Validation** — All endpoints validated  
✅ **Stripe Security** — PCI DSS compliant  

---

## 🌍 Deployment

### Frontend (Vercel)

Auto-deploys on push to `main`:
1. GitHub Actions builds frontend
2. Uploads to Vercel
3. Live at your Vercel URL

Manual deploy:
```bash
cd frontend
vercel --prod
```

### Backend (Heroku / Railway / AWS)

```bash
# Using Procfile (Heroku)
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile
git push heroku main

# Or Docker
docker build -t salon-booking .
docker run -p 8000:8000 salon-booking
```

---

## 📖 Documentation

- **TESTING_GUIDE.md** — How to run tests
- **README.md** — This file (project overview)
- `.env.example` — Environment variables template

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Clear database and restart
rm salon.db
python seed_data.py
python main.py
```

### Frontend won't build
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Stripe not working
- Verify `STRIPE_SECRET_KEY` in `.env`
- Check Stripe dashboard webhooks
- Test with Stripe test cards

### Tests failing
```bash
# Run with verbose output
pytest tests/ -v -s --tb=short
```

---

## 🎯 Services Offered

1. **Haircut** — $45 (45 min)
2. **Hair Coloring** — $85 (90 min)
3. **Highlights** — $95 (120 min)
4. **Blow Dry** — $35 (30 min)
5. **Hair Straightening** — $150 (180 min)
6. **Hair Perming** — $120 (150 min)
7. **Manicure** — $25 (40 min)
8. **Pedicure** — $35 (50 min)

---

## 📞 Support

1. Check documentation files
2. Review API docs at `/docs`
3. Check error messages carefully
4. Review console logs
5. Run tests to validate setup

---

## 📄 License

MIT License - Feel free to use for commercial projects

---

## 🙏 Credits

Built with ❤️ using FastAPI, React 18, and Stripe

**Production Ready** ✅ | **Fully Tested** ✅ | **i18n Support** ✅

---

**Last Updated:** July 3, 2026  
**Status:** 🟢 Production Ready
