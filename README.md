# DevBoard — MERN Auth CRUD

A personal developer-project manager. You register an account, log in, and keep
your own board of projects — ideas, work in progress, and finished builds — with
notes attached to each one.

**Live app:** _to be filled in after deployment_
**API:** _to be filled in after deployment_

---

## About

DevBoard is a full-stack MERN app built to demonstrate **authentication** and
**authenticated CRUD**.

The point is not the project list itself — it is everything around it. Passwords
are hashed before they reach the database, logging in returns a JSON Web Token,
the React app sends that token on every request, Express verifies it before any
controller runs, and each database query is filtered by the owner id taken from
the token. The result is that two users can use the same deployment and neither
can see, edit or delete the other's data.

## Features

- User registration with server-side and client-side validation
- Login with hashed-password comparison (bcryptjs)
- JWT authentication, 7-day expiry, secret read from the environment
- Protected API routes — every project endpoint requires a valid token
- Protected frontend route — `/dashboard` redirects guests to `/login`
- Project CRUD: create, list, read, update, delete
- Change project status from the card (idea / in-progress / completed)
- Add and delete notes on a project
- Filter the board by status
- Per-user ownership — another user's project returns `404`, not `403`
- Data persisted in MongoDB through Mongoose
- Immediate React state updates — no page refresh after any CRUD action
- Login survives a page refresh (token + user in `localStorage`)
- Logout clears the token and returns to the login screen
- Expired or invalid token logs you out with a "session expired" message
- Loading states and disabled buttons while requests are in flight
- Centralised error handling on both the client and the server

## Tech stack

**Frontend**

- React 18
- Vite
- React Router (routing and the protected route)
- Fetch API
- Plain CSS

**Backend**

- Node.js
- Express
- MongoDB (Atlas in production)
- Mongoose
- jsonwebtoken
- bcryptjs
- dotenv, cors

## Authentication flow

```text
Register / Login
      ↓
Express validates the input
      ↓
bcrypt hashes (register) or compares (login) the password
      ↓
JWT signed with JWT_SECRET, payload { userId }
      ↓
React stores the token in localStorage
      ↓
Every request sends: Authorization: Bearer <token>
      ↓
authMiddleware verifies the JWT and loads the user into req.user
      ↓
The protected controller runs
```

## CRUD flow

```text
React form
    ↓
fetch() through client/src/api/api.js
    ↓
Express route  →  auth middleware  →  controller
    ↓
Mongoose (query always filtered by owner)
    ↓
MongoDB
    ↓
JSON response
    ↓
React state updated in place
    ↓
UI re-renders immediately
```

## API endpoints

| Method | Endpoint                             | Auth | Purpose                           |
| ------ | ------------------------------------ | ---- | --------------------------------- |
| POST   | `/api/auth/register`                 | No   | Create an account, returns a token |
| POST   | `/api/auth/login`                    | No   | Log in, returns a token            |
| GET    | `/api/auth/me`                       | Yes  | Confirm a stored token is valid    |
| GET    | `/api/projects`                      | Yes  | List the logged-in user's projects |
| POST   | `/api/projects`                      | Yes  | Create a project                   |
| GET    | `/api/projects/:id`                  | Yes  | Read one owned project             |
| PUT    | `/api/projects/:id`                  | Yes  | Update an owned project            |
| DELETE | `/api/projects/:id`                  | Yes  | Delete an owned project            |
| POST   | `/api/projects/:id/notes`            | Yes  | Add a note to an owned project     |
| DELETE | `/api/projects/:id/notes/:noteId`    | Yes  | Delete a note                      |

Requests without a valid token get `401`. Requests for someone else's project
get `404`, so the API never confirms that a resource it will not serve exists.

## Data models

**User**

| Field      | Type   | Notes                                       |
| ---------- | ------ | ------------------------------------------- |
| `name`     | String | required, trimmed                           |
| `email`    | String | required, unique, lowercase, trimmed        |
| `password` | String | required, min 6, bcrypt hashed, `select: false` |

**Project**

| Field         | Type     | Notes                                    |
| ------------- | -------- | ---------------------------------------- |
| `title`       | String   | required, max 100                        |
| `description` | String   | optional, max 1000                       |
| `technology`  | String   | optional, max 100                        |
| `status`      | String   | enum `idea` / `in-progress` / `completed`, default `idea` |
| `owner`       | ObjectId | ref `User`, indexed, required            |
| `notes`       | Array    | embedded `{ text, createdAt }` subdocuments |

Both use Mongoose `timestamps`.

## Project structure

```text
devweekends-mern-auth-crud/
├── client/
│   ├── src/
│   │   ├── api/api.js              fetch wrapper: JWT header + error handling
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   └── LoadingState.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx                 auth state + routes
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/            authController, projectController
│   │   ├── middleware/             auth, notFound, error
│   │   ├── models/                 User, Project
│   │   ├── routes/                 authRoutes, projectRoutes
│   │   ├── utils/                  generateToken, asyncHandler
│   │   ├── app.js
│   │   └── server.js
│   └── .env.example
└── README.md
```

## Running locally

You need Node.js 18+ and a MongoDB connection string (local MongoDB or a free
MongoDB Atlas cluster).

**Server**

```bash
cd server
npm install
cp .env.example .env    # then fill in MONGO_URI and JWT_SECRET
npm run dev
```

Runs on http://localhost:5000

**Client** (in a second terminal)

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Runs on http://localhost:5173

### Environment variables

`server/.env`

```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/devboard
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

`client/.env`

```text
VITE_API_URL=http://localhost:5000
```

Real `.env` files are gitignored. Never commit a connection string or a JWT secret.

## Deployment

- **Database:** MongoDB Atlas
- **Backend:** Render — root directory `server`, build `npm install`, start `npm start`
- **Frontend:** Vercel — root directory `client`, framework Vite

After deploying the backend, set `VITE_API_URL` on Vercel to the Render URL.
After deploying the frontend, set `CLIENT_URL` on Render to the Vercel URL so
CORS allows it, then redeploy the backend.

## Notes on security decisions

- Passwords are hashed with bcrypt and a per-password salt. The plain password
  is never stored, and the hash is never returned by the API.
- Login answers with the same message whether the email is unknown or the
  password is wrong, so the endpoint cannot be used to discover accounts.
- The JWT payload holds only the user id. A JWT is signed, not encrypted —
  anyone holding it can read the payload, so nothing private goes in it.
- `owner` is always taken from the verified token, never from the request body,
  and it is not in the list of fields an update is allowed to change.
- Requests for another user's project return `404` rather than `403`, so a
  probe cannot tell "not yours" apart from "does not exist".
