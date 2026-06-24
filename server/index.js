import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production'
const TOKEN_EXPIRES_IN = '1h'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

async function readUsers() {
  try {
    const data = await readFile(USERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveUsers(users) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

function createToken(user) {
  return jwt.sign(publicUser(user), JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Missing token' })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

app.post('/api/auth/register', async (req, res) => {
  const name = req.body.name?.trim()
  const email = req.body.email?.trim().toLowerCase()
  const password = req.body.password

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const users = await readUsers()
  const emailTaken = users.some(user => user.email === email)

  if (emailTaken) {
    return res.status(409).json({ message: 'Email is already registered' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = { id: randomUUID(), name, email, passwordHash }

  users.push(user)
  await saveUsers(users)

  res.status(201).json({
    token: createToken(user),
    user: publicUser(user),
  })
})

app.post('/api/auth/login', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase()
  const password = req.body.password

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const users = await readUsers()
  const user = users.find(item => item.email === email)
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false

  if (!user || !passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  res.json({
    token: createToken(user),
    user: publicUser(user),
  })
})

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const users = await readUsers()
  const user = users.find(item => item.id === req.user.id)

  if (!user) {
    return res.status(401).json({ message: 'User no longer exists' })
  }

  res.json({ user: publicUser(user) })
})

app.listen(PORT, () => {
  console.log(`Auth API running at http://localhost:${PORT}`)
})
