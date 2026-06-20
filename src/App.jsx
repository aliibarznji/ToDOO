import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import TodoItem from './components/TodoItem'
import Auth from './Auth'
import { getToken, saveToken, clearToken, authHeaders } from './auth'
import './App.css'

const API = 'http://localhost:3003'

export default function App() {
  const [token, setToken] = useState(getToken()) // null = logged out
  const [todos, setTodos] = useState([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  // Load todos whenever we have a token (i.e. after login).
  useEffect(() => {
    if (!token) return
    fetch(`${API}/todos`, { headers: authHeaders() })
      .then(res => {
        if (res.status === 401) return logout() // token expired/invalid
        return res.json()
      })
      .then(data => data && setTodos(data))
  }, [token])

  function login(newToken) {
    saveToken(newToken)
    setToken(newToken)
  }

  function logout() {
    clearToken()
    setToken(null)
    setTodos([])
  }

  async function onSubmit({ title }) {
    const res = await fetch(`${API}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ title }),
    })
    const todo = await res.json()
    setTodos(prev => [...prev, todo])
    reset()
  }

  async function toggleTodo(id) {
    const res = await fetch(`${API}/todos/${id}`, { method: 'PATCH', headers: authHeaders() })
    const updated = await res.json()
    setTodos(prev => prev.map(t => t.id === id ? updated : t))
  }

  async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, { method: 'DELETE', headers: authHeaders() })
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  // Not logged in -> show the auth screen instead of the todos.
  if (!token) return <Auth onAuth={login} />

  return (
    <div className="card">
      <div className="card__header">
        <h1 className="card__title">ToDOO</h1>
        <button className="form__btn" type="button" onClick={logout}>Log out</button>
      </div>

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
