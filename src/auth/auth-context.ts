import { createContext } from 'react'

export interface AuthContextValue {
  user: string | null
  login: () => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
