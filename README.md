# AI Resume Builder

A full-stack resume builder that lets users create, edit, enhance, import, preview, and share professional resumes. The application uses a React/Vite client and an Express/MongoDB API, with OpenRouter (free models, through the OpenAI-compatible API) for AI writing and resume extraction and ImageKit for profile image uploads.

## Features

- User registration and login with JWT authentication.
- Dashboard for managing multiple resumes.
- Resume editor with personal information, professional summary, skills, experience, projects, and education sections.
- Multiple resume templates and configurable accent colors.
- AI enhancement for professional summaries and job descriptions.
- AI-assisted resume import from extracted resume text.
- Profile image upload with optional background removal through ImageKit transformations.
- Authenticated resume editing and private resume retrieval.
- Public resume preview links for resumes marked public.
- Client-side resume preview and responsive Vite/React interface.

## Tech Stack

### Client

- React 19
- Vite
- React Router
- Redux Toolkit and React Redux
- Axios
- Tailwind CSS through the Vite plugin
- Lucide React icons
- React Hot Toast
- `react-pdftotext`

### Server

- Node.js with native ES modules
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens and bcrypt
- OpenAI Node SDK (pointed at OpenRouter)
- ImageKit Node SDK
- Multer for multipart image uploads
- CORS and dotenv

## Project Structure

```text
.
├── client/                 React/Vite frontend
│   ├── public/
│   └── src/
│       ├── app/             Redux store and slices
│       ├── assets/          Shared assets and styles
│       ├── components/      Forms, preview, templates, and home sections
│       ├── configs/         Client configuration, including the Axios API client
│       └── pages/           Home, login, dashboard, builder, layout, and preview
├── server/                 Express API
│   ├── configs/             Database, AI, ImageKit, and upload configuration
│   ├── controllers/        User, resume, and AI request handlers
│   ├── middlewares/         JWT authentication middleware
│   ├── models/              User and resume Mongoose models
│   ├── routes/              API route definitions
│   └── server.js            API entry point
└── README.md
```

## Requirements

Install the following before starting the project:

- Node.js 18 or newer (Node.js 20 LTS or newer is recommended).
- npm.
- A MongoDB deployment, such as MongoDB Atlas or a local MongoDB server.
- An OpenRouter API key (free tier works): https://openrouter.ai/keys
- An ImageKit account and private key if image uploads are enabled.

No root `package.json` exists. Install dependencies separately in `client` and `server`.

## Installation

From the repository root:

```bash
cd server
npm install

cd ../client
npm install
```

## Environment Variables

Create `server/.env` with the following values:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>
JWT_SECRET=replace-with-a-long-random-secret
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openrouter/free
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
```

`OPENROUTER_MODEL` is optional and defaults to `openrouter/free`, which routes each request to an available free model. If you set a specific model (for example one ending in `:free`), the server falls back to `openrouter/free` when that model is busy or rate limited. AI requests time out after 45 seconds instead of hanging.

Create `client/.env` when the API is not running at the default local URL:

```env
VITE_BASE_URL=http://localhost:3000
```

The client falls back to `http://localhost:3000` when `VITE_BASE_URL` is not set. Vite only exposes variables prefixed with `VITE_` to browser code.

Do not commit either `.env` file. Keep API keys, JWT secrets, database credentials, and ImageKit private keys server-side.

## Running Locally

Open two terminals from the repository root.

### Terminal 1: API server

```bash
cd server
npm run server
```

This starts the API with Nodemon and reloads it when server files change. For a normal Node process, use:

```bash
cd server
npm start
```

The API listens on `http://localhost:3000` by default. A successful health check returns `Server is live...`:

```text
GET http://localhost:3000/
```

### Terminal 2: client

```bash
cd client
npm run dev
```

Vite prints the local frontend URL, normally `http://localhost:5173`.

## Client Commands

Run these from `client/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server with HMR. |
| `npm run build` | Create a production build in `client/dist`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint against the client source. |

## Server Commands

Run these from `server/`:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the API with Node. |
| `npm run server` | Start the API with Nodemon during development. |

## API Reference

The base API URL is `http://localhost:3000` locally, or the deployed server URL in production. Protected routes require an HTTP header in this form:

```http
Authorization: Bearer <jwt-token>
```

### Health check

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Confirms that the server is running. |

### Users

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/users/register` | No | Register with `name`, `email`, and `password`. Returns a JWT and user object. |
| `POST` | `/api/users/login` | No | Log in with `email` and `password`. Returns a JWT and user object. |
| `GET` | `/api/users/data` | Yes | Get the authenticated user's profile. |
| `GET` | `/api/users/resumes` | Yes | Get all resumes owned by the authenticated user. |

Example registration body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "a-secure-password"
}
```

### Resumes

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/resumes/create` | Yes | Create a resume. Body: `{ "title": "Frontend Developer Resume" }`. |
| `PUT` | `/api/resumes/update` | Yes | Update a resume using multipart form data. Requires `resumeId` and `resumeData`; optionally accepts an `image` file and `removeBackground`. |
| `DELETE` | `/api/resumes/delete/:resumeId` | Yes | Delete an owned resume. |
| `GET` | `/api/resumes/get/:resumeId` | Yes | Retrieve an owned resume for editing. |
| `GET` | `/api/resumes/public/:resumeId` | No | Retrieve a resume only when its `public` field is true. |

For `PUT /api/resumes/update`, send `resumeData` as a JSON string when using `multipart/form-data`. The image field name is `image`.

### AI

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/ai/enhance-pro-sum` | Yes | Enhance a professional summary. Body: `{ "userContent": "..." }`. |
| `POST` | `/api/ai/enhance-job-desc` | Yes | Enhance a job description. Body: `{ "userContent": "..." }`. |
| `POST` | `/api/ai/upload-resume` | Yes | Extract structured resume data from text. Body: `{ "resumeText": "...", "title": "..." }`. Returns the created `resumeId`. |

## Data Model

### User

- `name`: required string.
- `email`: required, unique string.
- `password`: bcrypt-hashed string.
- `createdAt` and `updatedAt`: timestamps.

### Resume

- `userId`: owning user reference.
- `title`: defaults to `Untitled Resume`.
- `public`: controls access to the public route and defaults to `false`.
- `template`: defaults to `classic`.
- `accent_color`: defaults to `#3B82F6`.
- `professional_summary`, `skills`, `personal_info`, `experience`, `project`, and `education` content fields.
- `createdAt` and `updatedAt`: timestamps.

## Authentication Flow

1. Register or log in through the client.
2. Store the returned JWT in browser local storage under `token`.
3. Send the token as a Bearer token for protected API requests.
4. Tokens expire after seven days.
5. The client checks the stored token on application startup and restores the authenticated user when it is valid.

## Production Deployment

The client and server are independently deployable.

### Deploy the client to Vercel

1. Create a Vercel project with `client` as the root directory.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add `VITE_BASE_URL` with the public URL of the deployed API.
5. The existing `client/vercel.json` rewrites browser routes to `index.html` for client-side routing.

### Deploy the server to Vercel

1. Create a second Vercel project with `server` as the root directory.
2. Add all variables from `server/.env` in the Vercel project settings.
3. The existing `server/vercel.json` configures `server.js` as a Node function and routes requests to it.
4. Set the client `VITE_BASE_URL` to this server's public URL and redeploy the client.

For any other Node hosting provider, run `npm start` from `server/`, expose the configured `PORT`, and set the client base URL to the deployed API origin.

## Troubleshooting

### The client cannot reach the API

- Confirm that the server is running on port 3000.
- Confirm `VITE_BASE_URL` points to the API origin, without an extra `/api` suffix.
- Restart Vite after changing a client environment variable.
- Check browser and server logs for CORS or network errors.

### MongoDB connection fails

- Verify `MONGODB_URI` is present in `server/.env`.
- Confirm the MongoDB deployment is running and allows the server's IP address.
- Check that the URI credentials are URL-encoded when they contain reserved characters.
- The application stores data in the `resume-builder` database under the configured MongoDB host.

### AI features fail

- Verify `OPENROUTER_API_KEY` and, if set, `OPENROUTER_MODEL`.
- Confirm the selected model supports chat completions and JSON response format for resume import.
- Check provider quota, model availability, and the server log for the returned error.

### Image uploads fail

- Verify `IMAGEKIT_PRIVATE_KEY` is set on the server.
- Confirm the uploaded form field is named `image`.
- Confirm the client sends the update request as `multipart/form-data`.

## Security Notes

- Use a long, random `JWT_SECRET` in every environment.
- Never expose server secrets through `VITE_` variables or commit `.env` files.
- Use HTTPS in production.
- Restrict MongoDB network access to trusted sources.
- Review CORS configuration before production; the current server enables CORS for all origins.
- Add rate limiting and request-size limits before exposing AI and authentication endpoints to untrusted public traffic.

## License

The server package currently declares the ISC license. Add or update a repository-level license file if this project is distributed publicly.

## Live Demo

https://ai-resume-builder-v3zl.vercel.app/