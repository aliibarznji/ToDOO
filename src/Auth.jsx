import { useState } from 'react'
import { useForm } from 'react-hook-form'

const API = 'http://localhost:3001'

// One form that does both login and register. `onAuth` is called with the
// token after success, so the parent (App) knows we're logged in.
export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit({ email, password }) {
    setServerError('')
    const res = await fetch(`${API}/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setServerError(data.error || 'Something went wrong')
      return
    }
    onAuth(data.token) // hand the token up to App
  }

  return (
    <div className="card">
      <h1 className="card__title">{mode === 'login' ? 'Log in' : 'Register'}</h1>

      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form__field">
          <input
            className={`form__input${errors.email ? ' form__input--error' : ''}`}
            placeholder="Email"
            {...register('email', { required: 'Email is required' })}
          />
        </div>
        {errors.email && <p className="form__error">{errors.email.message}</p>}

        <div className="form__field">
          <input
            type="password"
            className={`form__input${errors.password ? ' form__input--error' : ''}`}
            placeholder="Password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Min 6 characters' },
            })}
          />
          <button className="form__btn" type="submit" disabled={isSubmitting}>
            {mode === 'login' ? 'Log in' : 'Register'}
          </button>
        </div>
        {errors.password && <p className="form__error">{errors.password.message}</p>}
        {serverError && <p className="form__error">{serverError}</p>}
      </form>

      <p className="empty">
        {mode === 'login' ? 'No account?' : 'Have an account?'}{' '}
        <button
          type="button"
          className="form__btn"
          onClick={() => { setServerError(''); setMode(mode === 'login' ? 'register' : 'login') }}
        >
          {mode === 'login' ? 'Register' : 'Log in'}
        </button>
      </p>
    </div>
  )
}
