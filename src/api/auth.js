const TOKEN_KEY = 'jwt_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function authRequest(path, options = {}) {
  const token = getToken()
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export function registerUser(values) {
  return authRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function loginUser(values) {
  return authRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function getCurrentUser() {
  return authRequest('/api/auth/me')
}
