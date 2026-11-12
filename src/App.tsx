import './App.css'
import { LoginWidget } from './components/LoginWidget'
import { useAuth } from './auth/useAuth'
import { hasXsollaConfig } from './auth/xsolla'

function App() {
  const { user, login, logout } = useAuth()

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Xsolla Login Demo</h1>
        {user ? (
          <div className="account-actions">
            <span className="account-name">{user}</span>
            <button type="button" className="btn" onClick={logout}>Log out</button>
          </div>
        ) : (
          <button type="button" className="btn btn-primary" onClick={login} disabled={!hasXsollaConfig()}>
            Log in
          </button>
        )}
      </header>
      <main className="app-main">
        <p className="welcome">{user ? `Welcome, ${user}` : 'Welcome, guest'}</p>
        {!hasXsollaConfig() && <p role="alert">Set VITE_XSOLLA_LOGIN_PROJECT_ID in .env.local to enable login.</p>}
      </main>
      <LoginWidget />
    </div>
  )
}

export default App
