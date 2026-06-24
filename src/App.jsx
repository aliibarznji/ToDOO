import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import TodoItem from './components/TodoItem'
import './App.css'

const KEY = 'todos'

// ponytail: localStorage is the whole "backend" now. Swap for an API later if multi-device sync matters.
function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  // Persist on every change so todos survive a refresh.
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(todos))
  }, [todos])

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

  return (
    <div className="card">
      <div className="card__header">
        <h1 className="card__title">ToDOO</h1>
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
