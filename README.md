# Finance Dashboard Backend

A RESTful backend API for a finance dashboard system with role-based access control, financial record management, and aggregated analytics.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) |
| Validation | Zod |
| Security | Helmet, bcryptjs |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
git clone <repo-url>
cd fintech-finance-system
npm install
```

### Environment Setup

Edit `.env`:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/finance-system
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:3000`

---

## Project Structure

```
src/
├── app.js               # Entry point, Express setup
├── config/
│   └── db.js            # MongoDB connection
├── models/
│   ├── User.js          # User schema (role, status, password hashing)
│   └── FinancialRecord.js # Record schema (soft delete, pre-query filter)
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── recordRoutes.js
│   └── dashboardRoutes.js
├── controllers/         # Request/response handling only
│   ├── authController.js
│   ├── userController.js
│   ├── recordController.js
│   └── dashboardController.js
├── services/            # All business logic lives here
│   ├── authService.js
│   ├── userService.js
│   ├── recordService.js
│   └── dashboardService.js
├── middleware/
│   ├── auth.js          # authenticate + authorize(roles)
│   └── errorHandler.js  # Global error handler
├── validators/
│   ├── userValidators.js
│   └── recordValidators.js
└── utils/
    └── response.js      # Consistent response shape
```

---

## Role Model

| Role | View Records | Dashboard | Create/Edit/Delete Records | Manage Users |
|---|---|---|---|---|
| `viewer` | ✅ | ❌ | ❌ | ❌ |
| `analyst` | ✅ | ✅ | ❌ | ❌ |
| `admin` | ✅ | ✅ | ✅ | ✅ |

Roles are enforced via `authorize(...roles)` middleware applied at the route level.

---

## API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Create account |
| POST | `/api/auth/login` | None | Login, returns JWT |
| GET | `/api/auth/me` | Any | Get current user |

**Register**
```json
POST /api/auth/register
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "analyst"
}
```

**Login**
```json
POST /api/auth/login
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

---

### Users (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update role or status |

**Update User**
```json
PATCH /api/users/:id
{
  "role": "analyst",
  "status": "inactive"
}
```

---

### Financial Records

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/records` | All | List records (paginated + filtered) |
| GET | `/api/records/:id` | All | Get single record |
| POST | `/api/records` | Admin | Create record |
| PATCH | `/api/records/:id` | Admin | Update record |
| DELETE | `/api/records/:id` | Admin | Soft delete record |

**Create Record**
```json
POST /api/records
{
  "amount": 1500.00,
  "type": "income",
  "category": "Salary",
  "date": "2024-01-15",
  "notes": "January salary"
}
```

**Filter Records (query params)**
```
GET /api/records?type=expense&category=food&startDate=2024-01-01&endDate=2024-03-31&page=1&limit=20
```

| Param | Type | Description |
|---|---|---|
| `type` | `income` \| `expense` | Filter by type |
| `category` | string | Partial match |
| `startDate` | ISO date | From date |
| `endDate` | ISO date | To date |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |

---

### Dashboard (Analyst + Admin)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Income, expenses, net balance |
| GET | `/api/dashboard/trends` | Monthly income/expense breakdown |
| GET | `/api/dashboard/categories` | Totals grouped by category |
| GET | `/api/dashboard/recent` | Recent transactions |

**Summary (optional date filter)**
```
GET /api/dashboard/summary?startDate=2024-01-01&endDate=2024-12-31
```
```json
{
  "success": true,
  "data": {
    "totalIncome": 45000,
    "totalExpenses": 28000,
    "netBalance": 17000,
    "incomeCount": 12,
    "expenseCount": 34
  }
}
```

**Monthly Trends**
```
GET /api/dashboard/trends?year=2024
```
```json
{
  "data": {
    "trends": [
      { "period": "2024-01", "year": 2024, "month": 1, "income": 5000, "expense": 2300 },
      { "period": "2024-02", "year": 2024, "month": 2, "income": 4800, "expense": 1900 }
    ]
  }
}
```

**Category Breakdown**
```
GET /api/dashboard/categories?type=expense
```

**Recent Activity**
```
GET /api/dashboard/recent?limit=10
```

---

## Error Responses

All errors follow a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": ["field-level details if validation failed"]
}
```

| Status | Meaning |
|---|---|
| 400 | Validation error / bad input |
| 401 | Missing or invalid token |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Internal server error |

---

## Design Decisions & Assumptions

### Soft Deletes
Records are never permanently deleted. A `isDeleted: true` flag is set, and a Mongoose pre-query hook automatically excludes them from all `find` queries. This preserves data integrity and audit history.

### Password Security
Passwords are hashed using bcrypt (salt rounds: 12) via a Mongoose `pre('save')` hook. The `passwordHash` field is excluded from all query results by default (`select: false`).

### Role Assignment on Register
The `role` field is accepted on registration for development convenience. In a production system, this would be removed and roles would only be assigned by admins post-registration.

### Validation with Zod
All input is validated using Zod schemas before reaching service or database layers. Zod errors are caught by the global error handler and returned with field-level detail.

### Aggregation Pipelines
Dashboard endpoints use MongoDB's native aggregation pipeline rather than in-application computation. This keeps data processing close to the database and scales better with large datasets.

### No Soft-Delete on Users
Users are deactivated (status: `inactive`) rather than deleted. This preserves the `createdBy` reference integrity on financial records.

---

## Tradeoffs

| Decision | Tradeoff |
|---|---|
| JWT stateless auth | No server-side session invalidation (acceptable for assessment scope) |
| Roles as string enum | Simple and clear; a separate Permissions collection would be needed for fine-grained ACL |
| MongoDB | Flexible schema; a relational DB (PostgreSQL) would offer stronger referential integrity |
| Single `isDeleted` flag | Simple soft delete; a full audit log table would be better for production |
