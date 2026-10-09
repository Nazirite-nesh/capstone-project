# Employee Leave Management System

A web application that lets employees request leave, managers approve or reject it, and everyone track leave balances in one place.

**TS Academy Capstone Project, Group 60**

## What problem does it solve?

Many small organizations manage leave through paper forms, chats or spreadsheets. Requests get lost, balances are miscounted, and managers can't see who is off and when. This system replaces that with one place to request, approve and track leave.

## Who is it for?

- **Employees:** request leave, check balances, view and cancel requests
- **Managers:** review, approve or reject their team's requests
- **Admins:** manage leave types and see all requests

## Features

**Employee**
- Register and log in
- View leave balance per leave type
- Submit a leave request (balance and date checks included)
- View request history with status filter and pagination
- Cancel a pending request

**Manager**
- View team leave requests (filter by status, paginated)
- Approve or reject requests with an optional comment
- Balances update automatically on approval

**Admin**
- Create, edit and delete leave types
- Review requests across all teams

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT, bcryptjs |
| Validation | express-validator |

## Project Structure

```
capstone-project/
├── frontend/
└── backend/
    ├── src/
    │   ├── config/        # database connection
    │   ├── controllers/   # request handling logic
    │   ├── middleware/    # auth, roles, error handling
    │   ├── models/        # database schemas
    │   ├── routes/        # API routes
    │   ├── services/
    │   ├── utils/         # helpers (tokens, hashing, responses)
    │   └── app.js
    ├── server.js
    ├── .env.example
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- A MongoDB database (local or MongoDB Atlas)
- Git

### 1. Clone the repository

```
git clone https://github.com/Nazirite-nesh/capstone-project.git
cd capstone-project
```

### 2. Set up the backend

```
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your values:

```
PORT=5000
MONGO_URI=your_database_connection
JWT_SECRET=your_secret
```

Start the server:

```
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Set up the frontend

```
cd frontend
npm install
npm start
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the backend runs on |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |

Never commit your `.env` file.

## API Overview

All responses use this format:

```json
{
  "success": true,
  "message": "Description of the result",
  "data": {}
}
```

Protected routes need this header:

```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an employee account |
| POST | `/api/auth/login` | No | Log in and receive a token |
| GET | `/api/auth/me` | Yes | Get the current user |

### Leave Types

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/leave-types` | Yes | List all leave types |
| POST | `/api/admin/leave-types` | Admin | Create a leave type |
| PUT | `/api/admin/leave-types/:id` | Admin | Update a leave type |
| DELETE | `/api/admin/leave-types/:id` | Admin | Delete a leave type |

### Leave Balance

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/leave-balance/me` | Yes | Get my leave balances |

### Leave Requests (Employee)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/leave-requests` | Yes | Submit a leave request |
| GET | `/api/leave-requests/me` | Yes | List my requests (`?status=&page=&limit=`) |
| DELETE | `/api/leave-requests/:id` | Yes | Cancel my pending request |

### Leave Requests (Manager)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/manager/leave-requests` | Manager/Admin | List team requests (`?status=&page=&limit=`) |
| PUT | `/api/manager/leave-requests/:id/approve` | Manager/Admin | Approve a request |
| PUT | `/api/manager/leave-requests/:id/reject` | Manager/Admin | Reject a request |

### Example: Submit a leave request

**Request**

```
POST /api/leave-requests
```

```json
{
  "leaveType": "<leave type id>",
  "startDate": "2026-11-02",
  "endDate": "2026-11-06",
  "reason": "Family event"
}
```

**Success (201)**

```json
{
  "success": true,
  "message": "Leave request submitted",
  "data": { "status": "pending", "days": 5 }
}
```

**Error (400)**

```json
{
  "success": false,
  "message": "Insufficient balance. You have 3 day(s) available",
  "data": null
}
```

## Security

- Passwords are hashed with bcrypt and never returned in responses
- JWT authentication on private routes
- Role-based authorization (employee, manager, admin)
- Input validated on the backend
- Secrets kept in environment variables

## Team Workflow

- `main` is protected: no direct pushes
- Each task is built on its own branch, e.g. `feature/leave-requests`
- Changes reach `main` through a pull request

```
git checkout main
git pull origin main
git checkout -b feature/your-task
git add .
git commit -m "Describe the change"
git push origin feature/your-task
```

## Live Demo

- Frontend: [link]
- Backend API: [link]

## Team

| Name | Role |
|---|---|
| [Keith ] | [Team leader, backend, docs] |
| [Bello Adedapo Moses ] | [Frontend] |
| [nancynkem199@gmail.com ] | [Frontend] |
| [ajaegbustaley2@gmail.com] | [Backend] |
| [orjimaryjullie@gmail.com] | [Backend] |
