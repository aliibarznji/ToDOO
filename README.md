# ToDOO

A small React todo app with simple JWT authentication.

## Run the project

```bash
npm install
npm run dev
```

`npm run dev` starts both parts of the app:

- React/Vite client: `http://localhost:5173`
- Express auth API: `http://localhost:4000`

## JWT Auth Flow

1. The user registers or logs in from `src/components/AuthForm.jsx`.
2. The frontend sends the form data to `/api/auth/register` or `/api/auth/login`.
3. `server/index.js` checks the user, hashes passwords with `bcryptjs`, and creates a JWT with `jsonwebtoken`.
4. The frontend stores the JWT in `localStorage` using `src/api/auth.js`.
5. On refresh, `src/App.jsx` calls `/api/auth/me` with `Authorization: Bearer <token>`.
6. If the token is valid, the todo app opens for that user.

For real deployment, set a strong `JWT_SECRET` environment variable before starting the server.
