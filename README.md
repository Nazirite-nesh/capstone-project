# capstone-project
Employee Leave Management API

Backend for a leave management system. Employees request leave, managers approve or reject it, and balances update automatically.

*Stack:* Node.js, Express, MongoDB (Mongoose), JWT

## Setup

bash
npm install


Create a .env file:


PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development


Seed default leave types, then start the server:

bash
npm run seed
npm run dev

Base URL:
All endpoints are relative to the configured base URL. In the Postman collection, this is stored as the environment variable:  
https://employee-leave-management-oty9.onrender.com/


## API Flow Overview 
The first admin must be promoted directly in the database (register normally, then set that user's role to admin in MongoDB Atlas). From there, that admin can promote others through the API.
Users register as an employee by default, Admin assigns a manager from the registered users, users request for leave, assigned manager approves or rejects leave.

## Response format

Success: { "success": true, "message": "...", "data": {...} }
Error: { "success": false, "message": "...", "data": null }

A paginated list response wraps its array inside data:
json
{
  "success": true,
  "message": "Leave requests retrieved",
  "data": {
    "requests": [...],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalRecords": 23,
      "totalPages": 3
    }
  }
}


## Authentication

Protected routes need the header Authorization: Bearer <token>.
Roles: employee, manager, admin. New sign-ups are always employee — role changes only happen through the admin role endpoint.

## Endpoints

### Auth
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | No | Create account. 
Body: name, email, password. 
Always created as employee |
| POST | /api/auth/login | No | Log in. 
Body: email, password |
| GET | /api/auth/me | Any user | Get the currently logged-in user |

### Leave types
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | /api/leave-types | Any user | List leave types |
| POST | /api/leave-types | Admin | Create leave  
Body: name, defaultDaysAllowed, description |
| PUT | /api/leave-types/:id | Admin | Update leave|
| DELETE | /api/leave-types/:id | Admin | Delete leave |

### Employee
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/leave-requests | Any user | Submit request.
 Body: leaveType, startDate, endDate, reason |
| GET | /api/leave-requests/me | Any user | View own requests. 
Query: status, page, limit |
| DELETE | /api/leave-requests/:id | Owner | Cancel a pending request |
| GET | /api/leave-balance/me | Any user | View own balances (allocated, used, remaining per leave type) |

### Manager
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | /api/manager/leave-requests | Manager, Admin | View own team's requests. Query: status, page, limit |
| PUT | /api/manager/leave-requests/:id/approve | Manager, Admin | Approve leave(deducts balance). Only the employee's own manager, or an admin, can act |
| PUT | /api/manager/leave-requests/:id/reject | Manager, Admin | Reject leave. Same ownership rule as approve |

### Admin
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | /api/admin/users | Admin | List all users |
| PUT | /api/admin/users/:id/assign-manager | Admin | 
Body: managerId |
| PUT | /api/admin/users/:id/role | Admin |
 Body: role (employee, manager, or admin) |

## Business rules

- Balance is checked at request time and deducted only on approval, not on submission
- Overlapping pending or approved requests for the same employee are rejected
- Only pending requests can be cancelled, approved, or rejected
- A manager can only approve or reject requests from employees who report to them directly (or be an admin, who can act on anyone's)
- Registration always creates an employee; role changes require an existing admin

## Common errors

| Status | Meaning |
|---|---|
| 400 | Validation failed, invalid action, or malformed ID |
| 401 | Missing, invalid, or expired token |
| 403 | Role not permitted, or acting outside your own team |
| 404 | Resource not found |
| 409 | Duplicate, such as an existing email or overlapping leave dates |
