// Tiny helpers for storing the token in the browser.
// localStorage survives page refresh, so the user stays logged in.

const KEY = 'token'

export function saveToken(token) {
  localStorage.setItem(KEY, token)
}

export function getToken() {
  return localStorage.getItem(KEY)
}

export function clearToken() {
  localStorage.removeItem(KEY)
}

// Build the headers for a request. If logged in, attach the token.
export function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
