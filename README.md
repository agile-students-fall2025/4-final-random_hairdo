# SmartFit

**Smart Campus Fitness Coordination Platform**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://smartfit-front-end-dddud.ondigitalocean.app/) [![API Status](https://img.shields.io/badge/API-online-blue)](https://smartfit-back-end-xhy5a.ondigitalocean.app/)

🔗 **Live App**: [smartfit-front-end-dddud.ondigitalocean.app](https://smartfit-front-end-dddud.ondigitalocean.app/)

---

## What is SmartFit?

Campus fitness centers like the ones at NYU face unpredictable crowding that disrupts students' workout routines. Students struggle to know when equipment is available, coordinate with workout partners, and optimize limited time between classes.

**SmartFit solves this** by combining real-time facility insights with smart queue management and social features, transforming the gym experience from chaotic to coordinated.

### Key Features
- **Real-time occupancy tracking** - See which zones are busy before you go
- **Smart queue system** - Virtual check-in for equipment with wait time estimates
- **Workout tracking** - Log exercises, track goals, view history and stats
- **Live notifications** - Get alerted via Socket.io when it's your turn

---

## Product Vision Statement

*SmartFit empowers students to make the most of their campus fitness experience by providing real-time gym insights, smart coordination tools, and social accountability in one unified platform.*

---

## Team Members

| Name | GitHub | Role |
|------|--------|------|
| Matthew Membreno | [@m9membreno](https://github.com/m9membreno) | Backend Developer |
| Andrew Park | [@Toudles](https://github.com/Toudles) | Frontend Developer |
| Sarya Sadi | [@saryasadi](https://github.com/saryasadi) | Frontend Developer |
| Yi Fei | [@yeefeizhao](https://github.com/yeefeizhao) | Product Owner |
| Ahmed Arkam | [@am13367](https://github.com/am13367) | Scrum Master |

---

## Project History

 NYU students have identified a shared frustration: managing NYU's athletic facilities. With thousands of students balancing fitness with demanding academic schedules, we saw an opportunity to apply our software engineering skills to solve a real campus-wide problem.

Drawing inspiration from modern service coordination platforms, we built SmartFit to go beyond simple occupancy tracking. Our vision: a connected, predictive platform built by students, for students.

---

## Tech Stack

**Frontend**: React 18 + Vite, React Router, Socket.io Client  
**Backend**: Node.js, Express.js, Socket.io Server, JWT Auth  
**Database**: MongoDB Atlas (Mongoose ODM)  
**Testing**: Mocha, Chai, Supertest 
**Deployment**: Digital Ocean App Platform

---

## Quick Start

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (free tier)

### 1. Clone Repository
```bash
git clone https://github.com/your-org/smartfit.git
cd smartfit
```

### 2. Backend Setup
```bash
cd back-end
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
```
Backend runs at `http://localhost:3000`

### 3. Frontend Setup
```bash
cd front-end
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

### 4. Seed Database (Optional)
```bash
cd back-end
node scripts/seed.js
```

---

## Environment Variables

Create `back-end/.env`:
```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/smartfit
JWT_SECRET=your_strong_secret_here
JWT_EXPIRE=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## Testing

```bash
cd back-end

# Run all tests
npm test

# Run specific test suite
npm test test/auth.test.js
npm test test/queues.test.js

# Check coverage
npm run coverage
```

**Current Coverage**: ~69% (exceeds requirement)

---

## API Endpoints

Base URL: `https://smartfit-back-end-xhy5a.ondigitalocean.app` (production)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `PUT /api/users/:id/password` - Change password

### Facilities & Zones
- `GET /api/facilities` - Get all gym facilities
- `GET /api/facilities/:id` - Get specific facility
- `GET /api/zones` - Get all zones (optional `?facilityId` filter)
- `GET /api/zones/:id` - Get specific zone

### Queue System
- `POST /api/queues` - Join queue (protected)
- `GET /api/queues/me/status` - Get current user status (protected)
- `GET /api/queues/:id` - Get queue entry (protected)
- `GET /api/queues/user/:userId` - Get user's queues (protected)
- `PUT /api/queues/:id` - Update queue (protected)
- `POST /api/queues/:id/start` - Start workout (protected)
- `POST /api/queues/:id/stop` - Complete workout (protected)
- `DELETE /api/queues/:id` - Leave queue (protected)

### Goals & History
- `POST /api/goals` - Create goal (protected)
- `GET /api/goals` - Get user's goals (protected)
- `PUT /api/goals/:id` - Update goal (protected)
- `DELETE /api/goals/:id` - Delete goal (protected)
- `GET /api/history/user/:userId` - Get workout history with stats (protected)
- `POST /api/history` - Log workout (protected)

### Notifications & Support
- `GET /api/notifications/user/:userId` - Get user's notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/support/faqs` - Get FAQs (optional `?category` filter)
- `POST /api/support/issues` - Submit support ticket

### Settings
- `DELETE /api/settings/account/:userId` - Delete account (cascades)

---

## Project Structure

```
smartfit/
├── back-end/
│   ├── middleware/auth.js         # JWT authentication
│   ├── routes/                    # API route handlers
│   │   ├── auth.js               # Login/register
│   │   ├── users.js              # User management
│   │   ├── facilities.js         # Gym facilities
│   │   ├── zones.js              # Equipment zones
│   │   ├── queues.js             # Queue system
│   │   ├── goals.js              # Fitness goals
│   │   ├── history.js            # Workout history
│   │   ├── notifications.js      # Notifications
│   │   ├── settings.js           # Account settings
│   │   └── helpsupp.js           # FAQs & support
│   ├── test/                      # Mocha/Chai tests
│   ├── scripts/seed.js            # Database seeding
│   ├── app.js                     # Express configuration
│   ├── server.js                  # Server entry point
│   ├── db.js                      # MongoDB schemas
│   └── package.json
│
├── front-end/
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   ├── pages/                 # Page components
│   │   ├── context/               # React context (Socket.io)
│   │   ├── utils/api.js           # API utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── ux-design/                     # Wireframes & prototypes Guidelines
├── .github/                       # Issue templates & workflows
├── UX-DESIGN.md                   # Project's Wireframes, App Map, & Prototype
├── CONTRIBUTING.md                # Contribution guidelines
└── README.md
└── LICENSE.md                     # License for Project
```

---

## Database Schema

**Collections**: Users, Facilities, Zones, Queues, Goals, History, Notifications, SupportIssues, FAQs

**Key Models**:
- **User**: Authentication, profile, goals, bcrypt password hashing
- **Queue**: Virtual equipment queue with unique index on `(userId, zoneId)` for active status
- **History**: Workout logs with exercises, duration, mood tracking
- **Notification**: Real-time alerts with types (queue_ready, goal_progress, etc.)

**Relationships**: MongoDB ObjectId references with Mongoose `.populate()` for joins

See database schemas in `back-end/db.js`

---

## Real-Time Features

SmartFit uses **Socket.io** for live updates:

**Server Events**:
- `queue:update` - Queue position changed
- `queue:ready` - Your turn notification
- `zone:occupancy` - Zone capacity updated
- `notification:new` - New notification received

**Client Implementation**: See `front-end/src/context/SocketContext.jsx`

---

## Deployment

**Live Application**:
- Frontend: [smartfit-front-end-dddud.ondigitalocean.app](https://smartfit-front-end-dddud.ondigitalocean.app/)
- Backend API: [smartfit-back-end-xhy5a.ondigitalocean.app](https://smartfit-back-end-xhy5a.ondigitalocean.app/)

**Platform**: Digital Ocean App Platform + MongoDB Atlas

### Deploy Your Own

**1. MongoDB Atlas** (free tier):
- Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Add IP `0.0.0.0/0` to Network Access
- Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/smartfit`

**2. Backend** (Digital Ocean):
- Create App → Connect GitHub → Select `/back-end` directory
- Build: `npm install`, Run: `npm start`
- Add environment variables:
  ```
  MONGODB_URI=<your_connection_string>
  JWT_SECRET=<generate_with: openssl rand -base64 32>
  JWT_EXPIRE=7d
  NODE_ENV=production
  FRONTEND_URL=<frontend_url_after_deployment>
  ```

**3. Frontend** (Digital Ocean):
- Create Static Site → Connect GitHub → Select `/front-end` directory  
- Build: `npm install && npm run build`, Output: `dist`
- Add environment variables:
  ```
  VITE_API_URL=<backend_url_from_step_2>
  VITE_SOCKET_URL=<backend_url_from_step_2>
  ```

**4. Seed Database**:
```bash
node scripts/seed.js
```

That's it! Your app is live.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code of conduct
- Development workflow (feature branches, PRs)
- Coding standards and style guide
- Testing requirements
- How to submit issues and feature requests

**Development Workflow**:
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## Additional Documentation

- **[UX Design](./UX-DESIGN.md)** - Wireframes, mockups, and prototypes
- **[Contributing Guide](./CONTRIBUTING.md)** - Development workflow and coding standards
- **[Sprint Instructions](./instructions-0d-sprint-planning.md)** - Sprint planning and workflow

### External Resources
- [NYU Athletics Facilities Hours & Access](https://gonyuathletics.com/sports/2021/2/25/nyu-athletics-facilities-hours-access.aspx)
- [NYU Athletic Facilities Overview](https://gonyuathletics.com/sports/2024/1/29/landing-page-facilities-draft.aspx)

---

## License

This project is licensed under the MIT License - see [LICENSE.md](./LICENSE.md)

---

## Acknowledgments

- **NYU ITP/IMA** for project guidance
- **MongoDB Atlas** for database hosting
- **Digital Ocean** for application hosting
- **All contributors** for making SmartFit better

---

**Built by NYU students, for NYU students**

*Last Updated: December 2025 | Version 1.0.0 | Sprint 4 - Deployment*