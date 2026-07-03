# Salon Booking System

Professional salon booking application with Swedish language support, Stripe payments, and admin dashboard.

## Features

✨ **For Clients**
- Easy online booking system
- Multiple service selection (haircuts, coloring, styling, etc.)
- Choose payment method (Stripe or pay on-site)
- View and manage bookings
- Swedish language support (EN/SV)
- Mobile-responsive design
- Real-time availability

✨ **For Admin**
- Complete admin dashboard
- Revenue and booking analytics
- All bookings management
- Service management
- User management
- Statistics and reports

✨ **Technical**
- FastAPI backend (Python)
- React 18 frontend
- SQLite database
- JWT authentication
- Stripe payment integration
- i18n support (English/Swedish)
- Responsive mobile design
- Error handling middleware

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide Icons** - Icons

## Quick Start

### 1. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run seed data (creates mock data)
python seed_data.py

# Start backend
python main.py
```

Backend runs on: `http://localhost:8000`
API docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 3. Demo Credentials

```
Admin Dashboard:
  Email: admin@salon.com
  Password: admin123

Client:
  Email: client@salon.com
  Password: password123

Stylist:
  Email: stylist1@salon.com
  Password: stylist123
```

## API Endpoints

### Auth
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user
```

### Services
```
GET    /api/services          - List all services
GET    /api/services/{id}     - Get service details
POST   /api/services          - Create service (admin)
```

### Bookings
```
POST   /api/bookings          - Create booking
GET    /api/bookings          - Get my bookings
GET    /api/bookings/{id}     - Get booking details
PUT    /api/bookings/{id}/cancel  - Cancel booking
```

### Payments
```
POST   /api/payments/create-intent   - Create Stripe payment
POST   /api/payments/{id}/confirm    - Confirm payment
```

### Admin
```
GET    /api/admin/bookings    - Get all bookings
GET    /api/admin/stats       - Get dashboard stats
```

## Services Offered

1. **Haircut** - $45 (45 min)
2. **Hair Coloring** - $85 (90 min)
3. **Highlights** - $95 (120 min)
4. **Blow Dry** - $35 (30 min)
5. **Hair Straightening** - $150 (180 min)
6. **Hair Perming** - $120 (150 min)
7. **Manicure** - $25 (40 min)
8. **Pedicure** - $35 (50 min)

## Language Support

- **English** (default)
- **Swedish** (Svenska)

Toggle language in header or automatically uses user's preferred language.

## Environment Variables

Create `.env` file:

```
STRIPE_SECRET_KEY=sk_test_xxxxx
JWT_SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./salon.db
VITE_API_URL=http://localhost:8000/api
```

## Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

Set environment variable:
```
VITE_API_URL=https://your-api-domain.com/api
```

### Backend (Heroku/Railway)

```bash
# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
git push heroku main
```

## Project Structure

```
salon-booking-app/
├── main.py                 - FastAPI app & models
├── seed_data.py           - Database seeding
├── requirements.txt       - Python dependencies
├── .env.example           - Environment template
├── .env.development       - Dev environment
│
├── frontend/
│   ├── src/
│   │   ├── pages/         - React pages
│   │   ├── stores/        - Zustand stores
│   │   ├── api/           - API client
│   │   ├── i18n/          - Translations
│   │   ├── App.jsx        - Main component
│   │   ├── main.jsx       - Entry point
│   │   └── index.css      - Global styles
│   ├── index.html         - HTML template
│   ├── vite.config.js     - Vite config
│   ├── tailwind.config.js - Tailwind config
│   ├── package.json       - npm dependencies
│   └── .env.production    - Prod env vars
│
└── README.md              - This file
```

## Features in Detail

### Client Features
- **Browse Services** - View all salon services with prices and duration
- **Book Appointment** - Select date/time, add notes, choose payment method
- **Payment Options**
  - Pay On-Site (cash or card at salon)
  - Pay with Stripe (secure online payment)
- **Manage Bookings** - View, reschedule, cancel bookings
- **Language Toggle** - Switch between EN and SV
- **Mobile Responsive** - Works on all devices

### Admin Dashboard
- **Statistics** - Total bookings, completed, revenue, users
- **Bookings Management** - View all bookings with filters
- **Services Management** - Create, edit, delete services
- **User Reports** - Activity and booking history

## Security

✅ Password hashing with Bcrypt  
✅ JWT authentication with 24-hour tokens  
✅ Role-based access control  
✅ SQL injection prevention (ORM)  
✅ CORS properly configured  
✅ Input validation on all endpoints  

## Error Handling

- Comprehensive error messages
- Validation errors with details
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Performance

- SQLite database with indexes
- JWT stateless auth (no session overhead)
- Optimized React components
- CSS minification
- Lazy loading where applicable

## Testing

```bash
# Backend tests (optional)
pytest

# Frontend build
cd frontend && npm run build
```

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## Troubleshooting

### Backend won't start
```bash
# Clear database and restart
rm salon.db
python seed_data.py
python main.py
```

### CORS errors
- Check `VITE_API_URL` matches backend URL
- Ensure backend CORS is configured correctly

### Payment not working
- Check Stripe secret key in `.env`
- Verify callback URLs in Stripe dashboard

### Language not switching
- Check browser localStorage for `language` key
- Ensure translations are loaded

## Future Enhancements

- Email/SMS notifications
- Recurring bookings
- Staff scheduling
- Reviews and ratings
- Membership plans
- Analytics dashboard improvements
- API rate limiting
- Multi-location support

## Support

For issues or questions:
1. Check documentation
2. Review API docs at `/docs`
3. Check error messages carefully
4. Review console logs

## License

© 2026 Salon Booking System. All rights reserved.

---

**Built with ❤️ using FastAPI + React**

Ready for production. 🚀
