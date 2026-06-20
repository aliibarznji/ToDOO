import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

let todos = []

app.get('/todos', (req, res) => {
  res.json(todos)
})

app.post('/todos', (req, res) => {
  const { title } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' })
  }
  const todo = { id: crypto.randomUUID(), title: title.trim(), done: false }
  todos.push(todo)
  res.status(201).json(todo)
})

app.patch('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id)
  if (!todo) return res.status(404).json({ error: 'Not found' })
  todo.done = !todo.done
  res.json(todo)
})

app.delete('/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  todos.splice(index, 1)
  res.status(204).end()
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
