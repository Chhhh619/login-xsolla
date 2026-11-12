import { Api } from '@xsolla/login-sdk'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'
import { xsollaProjectId } from './xsolla'

const TOKEN_KEY = 'xsolla_login_token'

function getUserLabel(token: string): string {
  try {
    const payload = token.split('.')[1]
    if (!payload) return 'Signed in'
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized)) as Record<string, unknown>
    const label = decoded.email ?? decoded.username ?? decoded.preferred_username ?? decoded.sub
    return typeof label === 'string' && label ? label : 'Signed in'
  } catch {
    return 'Signed in'
  }
}

function readInitialToken(): string | null {
  const params = new URLSearchParams(window.location.search)
  const callbackToken = params.get('token')
  if (callbackToken) {
    sessionStorage.setItem(TOKEN_KEY, callbackToken)
    params.delete('token')
    params.delete('is_new')
    const query = params.toString()
    const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState({}, document.title, cleanUrl)
    return callbackToken
  }
  return sessionStorage.getItem(TOKEN_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readInitialToken)

  const login = useCallback(() => {
    window.dispatchEvent(new CustomEvent('xsolla-login-open'))
  }, [])

  const logout = useCallback(async () => {
    if (token && xsollaProjectId) {
      const api = new Api({ projectId: xsollaProjectId, callbackUrl: window.location.origin })
      try {
        await api.logout(token, 'all')
      } catch {
        // Always clear the local session, even if the server session has expired.
      }
      try {
        await api.clearSSO()
      } catch {
        // The local session is still cleared if the SSO cookie is already gone.
      }
    }
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [token])

  const value = useMemo<AuthContextValue>(() => ({
    user: token ? getUserLabel(token) : null,
    login,
    logout,
  }), [token, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
