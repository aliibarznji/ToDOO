import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getCurrentUser, getToken, removeToken } from './api/auth'
import AuthForm from './components/AuthForm'
import TodoItem from './components/TodoItem'
import './App.css'

const todosKey = userId => `todos:${userId}`

// Todos stay in localStorage for now; auth is handled by the API.
function loadTodos(userId) {
  try {
    return JSON.parse(localStorage.getItem(todosKey(userId))) || []
  } catch {
    return []
  }
}

export default function App() {
  const [user, setUser] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(getToken()))
  const [todos, setTodos] = useState([])
  const [activeTodoUserId, setActiveTodoUserId] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (!getToken()) return

    getCurrentUser()
      .then(data => setUser(data.user))
      .catch(() => removeToken())
      .finally(() => setIsCheckingAuth(false))
  }, [])

  useEffect(() => {
    if (user) {
      setTodos(loadTodos(user.id))
      setActiveTodoUserId(user.id)
    } else {
      setTodos([])
      setActiveTodoUserId(null)
    }
  }, [user])

  // Persist on every change so todos survive a refresh.
  useEffect(() => {
    if (user && activeTodoUserId === user.id) {
      localStorage.setItem(todosKey(user.id), JSON.stringify(todos))
    }
  }, [todos, user, activeTodoUserId])

  function onSubmit({ title }) {
    setTodos(prev => [...prev, { id: crypto.randomUUID(), title, done: false }])
    reset()
  }

  function toggleTodo(id) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  function logout() {
    removeToken()
    setUser(null)
  }

  if (isCheckingAuth) {
    return <div className="card">Checking your login...</div>
  }

  if (!user) {
    return <AuthForm onAuth={setUser} />
  }

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <h1 className="card__title">ToDOO</h1>
          <p className="card__meta">Signed in as {user.name}</p>
        </div>
        <button className="logout-btn" type="button" onClick={logout}>
          Sign out
        </button>
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
