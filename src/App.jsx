import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import TodoItem from './components/TodoItem'
import './App.css'

const API = 'http://localhost:3001'

export default function App() {
  const [todos, setTodos] = useState([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    fetch(`${API}/todos`)
      .then(res => res.json())
      .then(data => setTodos(data))
  }, [])

  async function onSubmit({ title }) {
    const res = await fetch(`${API}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const todo = await res.json()
    setTodos(prev => [...prev, todo])
    reset()
  }

  async function toggleTodo(id) {
    const res = await fetch(`${API}/todos/${id}`, { method: 'PATCH' })
    const updated = await res.json()
    setTodos(prev => prev.map(t => t.id === id ? updated : t))
  }

  async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, { method: 'DELETE' })
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="card">
      <h1 className="card__title">ToDOO</h1>

      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form__field">
          <input
            className={`form__input${errors.title ? ' form__input--error' : ''}`}
            placeholder="What needs to be done?"
            {...register('title', {
              required: 'Title is required',
              validate: v => v.trim().length > 0 || 'Title cannot be empty',
            })}
          />
          <button className="form__btn" type="submit">Add</button>
        </div>
        {errors.title && (
          <p className="form__error">{errors.title.message}</p>
        )}
      </form>

      {todos.length === 0 ? (
        <p className="empty">No todos yet. Add one above.</p>
      ) : (
        <ul className="list">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
