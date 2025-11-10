# SmartFit Backend API

Backend API server for SmartFit - NYU campus fitness coordination app.

## Tech Stack

### Core Dependencies
- **Express.js** (v4.21.1) - Web framework
- **Node.js** - Runtime environment
- **CORS** (v2.8.5) - Cross-Origin Resource Sharing
- **dotenv** (v16.4.5) - Environment variable management
- **Axios** (v1.7.7) - HTTP client for API requests

### Development Dependencies
- **Mocha** (v11.1.0) - Testing framework
- **Chai** (v5.2.0) - Assertion library
- **chai-http** (v5.1.1) - HTTP integration testing
- **c8** (v10.1.3) - Code coverage tool
- **Morgan** (v1.10.0) - HTTP request logger
- **Nodemon** (v3.1.7) - Auto-restart during development

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Navigate to the back-end directory:
   ```bash
   cd back-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration (if needed)

### Running the Server

#### Development Mode (with auto-reload via nodemon)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-reload
- `npm test` - Run all tests with 3000ms timeout
- `npm run coverage` - Run tests with code coverage report

## API Endpoints

All endpoints return JSON responses in the format:
```json
{
  "success": true/false,
  "data": {...},
  "message": "..." // (optional)
}
```

### Root
- `GET /` - API information and available endpoints

### Authentication & Users
- `POST /api/users` - **Register** new user account
  - Body: `{ name, email, password }`
  - Used by: Register page
- `GET /api/users/:id` - Get user profile information
  - Used by: Profile page, Edit Profile page
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id` - **Update user profile** (name, email, goals)
  - Body: `{ name?, email?, goals? }`
  - Used by: Edit Profile page, Goals page

### Facilities
- `GET /api/facilities` - Get all gym facilities
  - Returns: List of available facilities with addresses
  - Used by: Facilities page
- `GET /api/facilities/:id` - Get specific facility details
  - Returns: Facility name, address, capacity

### Zones
- `GET /api/zones` - Get all equipment zones
  - Query params: `?facilityId=<id>` to filter by facility
  - Returns: Zone name, queue length, wait time, capacity
  - Used by: Zones page
- `GET /api/zones/:id` - Get specific zone details
  - Returns: Detailed zone information including current queue status

### Queues
- `POST /api/queues` - **Join a queue** for equipment
  - Body: `{ userId, zoneId, position?, estimatedWait? }`
  - Returns: Queue entry with ID and confirmation details
  - Used by: Zones page → Queue Confirmation flow
- `GET /api/queues/:id` - Get specific queue entry details
  - Returns: Queue position, estimated wait time, status
  - Used by: Confirmed Queue page (for real-time updates)
- `GET /api/queues/user/:userId` - Get all queues for a user
  - Returns: List of active and past queue entries
  - Used by: Home page (Dashboard), History page
- `PUT /api/queues/:id` - **Update queue position** or status
  - Body: `{ position?, estimatedWait?, status? }`
  - Used by: Real-time queue position updates
- `DELETE /api/queues/:id` - **Leave a queue**
  - Used by: Confirmed Queue page (cancel button)

### Goals
- `GET /api/goals/user/:userId` - Get user's fitness goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal progress
- `DELETE /api/goals/:id` - Delete goal

### History
- `GET /api/history/user/:userId` - Get workout history
- `POST /api/history` - Log a workout session

### Notifications
- `GET /api/notifications/user/:userId` - Get user notifications
- `PUT /api/notifications/:id` - Mark notification as read

### Settings
- `PUT /api/users/:id/password` - Change password
- `GET /api/support/faqs` - Get FAQ content
- `POST /api/support/issues` - Submit support issue

## Testing

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run coverage
```

Tests are located in the `test/` directory and use Mocha and Chai.

## Project Structure

```
back-end/
├── routes/
│   ├── facilities.js
│   ├── goals.js
│   ├── history.js
│   ├── notifications.js
│   ├── queues.js
│   ├── settings.js
│   ├── users.js
│   └── zones.js
├── test/
│   ├── facilities.test.js
│   ├── goals.test.js
│   ├── history.test.js
│   ├── integration.test.js
│   ├── notifications.test.js
│   ├── queues.test.js
│   ├── settings.test.js
│   ├── users.test.js
│   └── zones.test.js
├── server.js            # Main server file
├── package.json
├── .env                 # Environment variables
├── .env.example         # Example environment variables
└── README.md
```

## Mock Data

Currently, all endpoints return mock JSON data that is hard-coded. This will be replaced with database integration in future sprints.

## Environment Variables

- `PORT` - Server port (default: 3000)

Additional environment variables can be added as needed for database connections, API keys, etc.

## Development Notes

- All credentials and sensitive information should be stored in `.env` file
- The `.env` file is excluded from version control
- Follow the Feature Branch git workflow for contributions
- Maintain test coverage above 10%
- Using ES6 modules (`"type": "module"` in package.json)
- Morgan logger enabled in development for request logging
- Test timeout set to 3000ms for mocha tests
