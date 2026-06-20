import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = process.env.PORT || 3003

// Secret used to SIGN tokens. Real apps read this from an env var and NEVER
// commit it. Generate one with:  openssl rand -hex 32
// Set it before starting:  JWT_SECRET=<value> npm run server
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret'
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set — using insecure dev default. Do NOT use in production.')
}

app.use(cors())
app.use(express.json())

// In-memory "database". Wiped on restart — fine for learning.
let users = []   // { id, email, passwordHash }
let todos = []   // { id, title, done, userId }

// ---------- AUTH ----------

// Register: hash the password, store the user.
app.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' })
  }
  // Never store the raw password. Hash it (10 = cost factor).
  const passwordHash = await bcrypt.hash(password, 10)
  const user = { id: crypto.randomUUID(), email, passwordHash }
  users.push(user)
  // Hand back a token so the user is logged in right after registering.
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '2h' })
  res.status(201).json({ token, email: user.email })
})

// Login: find user, compare password, return a token.
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = users.find(u => u.email === email)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '2h' })
  res.json({ token, email: user.email })
})

// Middleware: runs BEFORE protected routes. Reads the token, verifies it,
// attaches the userId to the request. If bad/missing token -> 401.
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'No token' })

  try {
    const payload = jwt.verify(token, JWT_SECRET) // throws if invalid/expired
    req.userId = payload.userId
    next() // token good -> continue to the real route handler
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ---------- TODOS (all protected, scoped to the logged-in user) ----------

app.get('/todos', authMiddleware, (req, res) => {
  res.json(todos.filter(t => t.userId === req.userId))
})

app.post('/todos', authMiddleware, (req, res) => {
  const { title } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' })
  }
  const todo = { id: crypto.randomUUID(), title: title.trim(), done: false, userId: req.userId }
  todos.push(todo)
  res.status(201).json(todo)
})

app.patch('/todos/:id', authMiddleware, (req, res) => {
  const todo = todos.find(t => t.id === req.params.id && t.userId === req.userId)
  if (!todo) return res.status(404).json({ error: 'Not found' })
  todo.done = !todo.done
  res.json(todo)
})

app.delete('/todos/:id', authMiddleware, (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id && t.userId === req.userId)
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  todos.splice(index, 1)
  res.status(204).end()
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
