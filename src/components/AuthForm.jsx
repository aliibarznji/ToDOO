import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { loginUser, registerUser, saveToken } from '../api/auth'

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const isRegister = mode === 'register'

  async function onSubmit(values) {
    setServerError('')
    setIsSubmitting(true)

    try {
      const data = isRegister
        ? await registerUser(values)
        : await loginUser({ email: values.email, password: values.password })

      saveToken(data.token)
      onAuth(data.user)
      reset()
    } catch (error) {
      setServerError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setServerError('')
    reset()
  }

  return (
    <div className="card auth-card">
      <h1 className="card__title">{isRegister ? 'Create account' : 'Welcome back'}</h1>

      <div className="auth-tabs" aria-label="Authentication mode">
        <button
          className={`auth-tabs__btn${!isRegister ? ' auth-tabs__btn--active' : ''}`}
          type="button"
          onClick={() => switchMode('login')}
        >
          Login
        </button>
        <button
          className={`auth-tabs__btn${isRegister ? ' auth-tabs__btn--active' : ''}`}
          type="button"
          onClick={() => switchMode('register')}
        >
          Register
        </button>
      </div>

      <form className="form auth-form" onSubmit={handleSubmit(onSubmit)}>
        {isRegister && (
          <label className="auth-form__field">
            <span>Name</span>
            <input
              className={`form__input${errors.name ? ' form__input--error' : ''}`}
              type="text"
              autoComplete="name"
              {...register('name', {
                required: 'Name is required',
                validate: value => value.trim().length > 0 || 'Name cannot be empty',
              })}
            />
            {errors.name && <small className="form__error">{errors.name.message}</small>}
          </label>
        )}

        <label className="auth-form__field">
          <span>Email</span>
          <input
            className={`form__input${errors.email ? ' form__input--error' : ''}`}
            type="email"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Use a valid email address',
              },
            })}
          />
          {errors.email && <small className="form__error">{errors.email.message}</small>}
        </label>

        <label className="auth-form__field">
          <span>Password</span>
          <input
            className={`form__input${errors.password ? ' form__input--error' : ''}`}
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          {errors.password && <small className="form__error">{errors.password.message}</small>}
        </label>

        {serverError && <p className="form__error">{serverError}</p>}

        <button className="form__btn auth-form__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
        </button>
      </form>
    </div>
  )
}
