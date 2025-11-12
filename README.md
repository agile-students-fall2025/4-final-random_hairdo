# SmartFit

**Smart Campus Fitness Coordination Platform**

## What is SmartFit?

Campus fitness centers face a consistent problem: unpredictable crowding creates friction in students' workout routines. Beyond just knowing how busy a gym is, students struggle to coordinate with workout partners, find accountability, and optimize their limited time between classes. **SmartFit** solves this by combining live facility insights with social coordination features, turning the gym experience from chaotic to collaborative.

### Why SmartFit?

NYU students dedicate a lot fo time to academics or the city lifestyle. With a school as large as NYU, their athletic facilities/gyms comes with a lot of management problems for students. Crowds, equipment avaliability and optimizing your allocated time, and hours.  SmartFit transforms the campus fitness experience by providing real-time insights, smart coordination tools, and a centralized platform for a better athletic experience on campus.

## Product Vision Statement

SmartFit empowers students to make the most of their campus fitness experience by providing real-time gym insights, smart coordination tools, and social accountability in one unified platform.

---

## Team Members (Sprint 1)

| Name | GitHub | Role |
|------|--------|------|
| [Matthew Membreno] | [m9membreno](https://github.com/m9membreno) |  |
| [Andrew Park] | [Toudles](https://github.com/Toudles) |  |
| [Sarya Sadi] | [saryasadi](https://github.com/saryasadi) |  |
| [Yi Fei] | [yeefeizhao](https://github.com/yeefeizhao) | Product Owner |
| [Ahmed Arkam] | [am13367](https://github.com/am13367) | Scrum Master |

---

## Project History

The management of NYU's athletic facilities is a shared frustration among five NYU students during the fall 2024 semester. It is a campus-wide issue affecting thousands of students trying to balance fitness with demanding academic schedules, important for mental and physical health. We wanted to build a tool that makes campus fitness accessible, efficient, and social**. We saw an opportunity to apply our software engineering skills to solve a real problem affecting our daily lives and the broader NYU community.

Drawing inspiration from modern service coordination platforms while adding our own innovative spin on social fitness features, we set out to create something that goes beyond simple occupancy tracking. SmartFit represents our vision of what campus recreation can be: connected, predictive, and built by students, for students.

---

## Contributing to SmartFit

We welcome contributions from the NYU community and beyond. Whether you're fixing bugs, adding features, improving documentation, or suggesting enhancements, your input helps make SmartFit better for everyone.

**Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) document** for detailed guidelines on:
- Code of conduct
- How to submit issues and feature requests
- Pull request process and coding standards
- Development workflow and branch strategy
- Testing requirements

---

## Features

### Core Functionality (MVP)

#### Smart Occupancy Dashboard
- Real-time heat map showing traffic by zone (cardio, weights, studios, courts)
- Predictive analytics: "Usually less crowded in 30 minutes" based on historical patterns
- User-reported status updates with gamified points system

#### Equipment Reservation System
- Virtual check-in for high-demand equipment (squat racks, cable machines, benches)
- Dynamic queue with estimated wait times based on average usage patterns
- Auto-release mechanism if users don't check in within 5 minutes

#### Accountability Features
- Set workout goals and notify others when completed
- Tracking for consistent gym-goers
- Courtesy countdown timers that notify next person in queue

---

## Technical Stack

- **Frontend**: 
- **Backend**: 
- **Database**: 
- **Real-Time**: 
- **Authentication**: 
- **Notifications**:
- **Deployment**: 

---

## Building and Testing

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Running the Application

#### 1. Start the Backend Server

```bash
cd back-end
npm install
npm start
```

The backend API will be available at `http://localhost:3000`

#### 2. Start the Frontend Development Server

In a new terminal:

```bash
cd front-end
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Running Tests

#### Backend Tests

```bash
cd back-end
npm test
```

To check code coverage:

```bash
cd back-end
npm run coverage
```

### API Endpoints

The backend provides the following API endpoints:

- `GET /api/facilities` - Get all gym facilities
- `GET /api/facilities/:id` - Get specific facility details
- `GET /api/zones` - Get all equipment zones (with optional `?facilityId` filter)
- `GET /api/zones/:id` - Get specific zone details
- `POST /api/queues` - Join a queue for equipment
- `GET /api/queues/:id` - Get queue entry details
- `GET /api/queues/user/:userId` - Get all queues for a user
- `PUT /api/queues/:id` - Update queue position or status
- `DELETE /api/queues/:id` - Leave a queue

## Additional Resources

### NYU Athletics & Recreation
- [NYU Athletics Facilities Hours & Access](https://gonyuathletics.com/sports/2021/2/25/nyu-athletics-facilities-hours-access.aspx) - Official hours and access policies
- [NYU Athletic Facilities Overview](https://gonyuathletics.com/sports/2024/1/29/landing-page-facilities-draft.aspx) - Detailed information on each facility
