# Collaborative Task Manager

A full-stack, real-time collaborative task management application built as an engineering assessment. It implements secure authentication, task CRUD, personal dashboards, and Socket.io-based live updates.  

## Tech Stack

- **Frontend:** React (Vite, TypeScript), Tailwind CSS, React Router, React Query, React Hook Form, Zod  
- **Backend:** Node.js, Express, TypeScript, Mongoose, MongoDB  
- **Real-time:** Socket.io  
- **Deployment targets:**  
  - Frontend: Vercel / Netlify  
  - Backend + DB: Render / Railway + MongoDB (e.g. Atlas)

---

## Project Structure

.
├── frontend/ # Vite React + TS + Tailwind app
│ ├── src/
│ │ ├── api/ # Axios API helpers (auth, tasks, users)
│ │ ├── components/# Reusable UI (TaskForm, notifications)
│ │ ├── context/ # AuthContext, SocketContext
│ │ ├── routes/ # Pages (Dashboard, Auth, Profile)
│ │ └── validation/# Zod schemas (auth, tasks)
│ └── ...
├── backend/ # Express + TS + Mongoose API
│ ├── src/
│ │ ├── config/ # env, database, socket.io bootstrapping
│ │ ├── controllers/# HTTP controllers (auth, tasks, users)
│ │ ├── middleware/# auth middleware, error handling
│ │ ├── models/ # Mongoose models (User, Task)
│ │ ├── repositories/# DB access layer
│ │ ├── services/ # Business logic (auth, tasks, socket events)
│ │ ├── routes/ # Express routers (/auth, /tasks, /users)
│ │ └── server.ts # App entrypoint
└── README.md

text

---

## Setup Instructions (Local)

### Prerequisites

- Node.js (LTS)
- npm
- MongoDB instance (local or cloud, e.g. MongoDB Atlas)

### Backend

1. Install dependencies:

cd backend
npm install

text

2. Create `.env` in `backend/`:

PORT=5000
MONGO_URI=mongodb://localhost:27017/collaborative-task-manager
JWT_SECRET=super-secret-jwt-key-change-this
NODE_ENV=development

text

3. Run the backend in dev mode:

npm run dev

text

The API will be available at `http://localhost:5000`.

### Frontend

1. Install dependencies:

cd frontend
npm install

text

2. Start the Vite dev server:

npm run dev

text

3. Open `http://localhost:5173` in your browser.

---

## API Contract (Key Endpoints)

Base URL (local): `http://localhost:5000/api`

### Auth

- **POST** `/auth/register`  
- Body: `{ "name", "email", "password" }`  
- Creates a user, sets HttpOnly JWT cookie, returns `{ user }`.

- **POST** `/auth/login`  
- Body: `{ "email", "password" }`  
- Verifies credentials, sets HttpOnly JWT cookie, returns `{ user }`.

- **POST** `/auth/logout`  
- Clears JWT cookie.

- **GET** `/auth/me`  
- Requires auth (token cookie).  
- Returns `{ user }` for current session.

- **PUT** `/auth/profile`  
- Requires auth.  
- Body: `{ "name" }`  
- Updates the current user’s profile and returns `{ user }`.

### Users

- **GET** `/users`  
- Requires auth.  
- Returns `[{ id, name, email }]` for all registered users (used to assign tasks).

### Tasks

- **GET** `/tasks`  
- Requires auth.  
- Query params (all optional):  
 - `status`: `To Do | In Progress | Review | Completed`  
 - `priority`: `Low | Medium | High | Urgent`  
 - `creatorId`: user id  
 - `assignedToId`: user id  
 - `overdueOnly`: `"true"` to fetch tasks with `dueDate` in the past  
- Returns `{ tasks }`, sorted by due date ascending.

- **POST** `/tasks`  
- Requires auth.  
- Body:

 ```
 {
   "title": "string (<= 100 chars)",
   "description": "string",
   "dueDate": "ISO date string",
   "priority": "Low | Medium | High | Urgent",
   "status": "To Do | In Progress | Review | Completed",
   "assignedToId": "userId"
 }
 ```

- **GET** `/tasks/:id`  
- Requires auth.  
- Returns `{ task }`.

- **PUT** `/tasks/:id`  
- Requires auth.  
- Body: any subset of the `POST /tasks` fields.  
- Returns `{ task }` with updated fields.

- **DELETE** `/tasks/:id`  
- Requires auth.  
- Deletes a task and returns `204 No Content`.

---

## Architecture & Design Decisions

- **Database: MongoDB + Mongoose**  
- Chosen for flexible document modeling of tasks and users and straightforward integration with Node.js via Mongoose.  
- The `User` and `Task` schemas encode enums for `priority` and `status` and enforce required fields.

- **Layered backend (controllers → services → repositories → models)**  
- Controllers are thin and handle HTTP concerns (validation errors, status codes).  
- Services implement business logic (e.g., password hashing, JWT, assignment notification logic).  
- Repositories encapsulate database access (Mongoose queries).  
- This matches the assessment’s emphasis on a clear service/repository pattern and improves testability. [file:1]

- **JWT Auth with HttpOnly cookies**  
- On login/register, a signed JWT is stored in an HttpOnly cookie (`token`).  
- `authMiddleware` verifies the token and attaches `userId` to the request, used by task and user endpoints.

- **Validation using Zod DTOs**  
- Backend DTOs: Zod schemas for auth (`register`, `login`, `updateProfile`) and tasks (`createTask`, `updateTask`).  
- Frontend forms reuse aligned Zod schemas for validation via React Hook Form, ensuring consistent constraints across client and server. [file:1]

- **Frontend state management with React Query**  
- All server state (auth user, tasks, users) is handled via React Query for caching, auto-refetch, and background updates.  
- Task dashboards (assigned, created, overdue) are driven by query params hitting `/tasks`.

---

## Socket.io Real-Time Design

- **Backend integration**  
- `server.ts` creates an `http.Server` and attaches a Socket.io `Server` instance via `initSocket`.  
- On connection, clients emit `join` with the current user id; the server joins them to room `user:{id}`.  
- Task service emits:
 - `taskUpdated` (broadcast to all clients) whenever a task is created or updated.  
 - `taskAssigned` (to `user:{assignedToId}`) when a task’s `assignedToId` changes.

- **Frontend integration**  
- `SocketContext` connects to `http://localhost:5000` and, once authenticated user is known, emits `join` with the user id.  
- `DashboardPage` listens for `taskUpdated` and patches all `["tasks"]` React Query caches so task lists update live.  
- `AssignmentNotifications` listens for `taskAssigned` and shows an in-app toasts-style banner for the latest assigned task.

This satisfies both “live updates” and “assignment notification” requirements. [file:1]

---

## Trade-offs and Assumptions

- **Simple role model**: All authenticated users have the same permissions; there is no separate admin role.  
- **Basic error UI**: The frontend surfaces API errors inline on forms and as text; no global toast system is used to keep implementation focused.  
- **Socket.io auth**: The socket connection trusts the existing cookie-based session and user id from `AuthContext`; no separate token is used for sockets.  
- **Pagination**: Task lists are not paginated, assuming a moderate number of tasks for the assessment.

---

## Running Tests

(Once you add Jest/Mocha tests for key backend services, describe them here.)

Example (Jest):

cd backend
npm test

text

Tests target critical business logic such as `taskService.createTask`, `taskService.updateTask` (assignment detection), and auth login validation. [file:1]

---

## Deployment Notes

- **Frontend (Vercel / Netlify)**  
  - Build command: `npm run build` in `frontend/`.  
  - Output directory: `frontend/dist`.  
  - Environment variable (for production): `VITE_API_BASE_URL` (if you decide to make baseURL configurable).

- **Backend (Render / Railway)**  
  - Build command: `npm run build` in `backend/`.  
  - Start command: `npm start`.  
  - Environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`, plus the allowed frontend origin for CORS.  
  - Ensure Socket.io works over HTTPS/WSS by using the deployed backend URL in the frontend socket client.

Once deployed, include:

- **Frontend URL** (e.g. `https://your-task-manager-frontend.vercel.app`)  
- **Backend URL** (e.g. `https://your-task-manager-api.onrender.com`)  

in the README and the submission form. [file:1]
