import { useState, useEffect } from 'react'

function App() {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isShortcutEnabled, setIsShortcutEnabled] = useState(() => {
    const saved = localStorage.getItem('shortcutEnabled')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [shortcutKey, setShortcutKey] = useState(() => {
    return localStorage.getItem('shortcutKey') || 'Alt+Space'
  })

  // Sync initial state on mount (in case main process differs)
  useEffect(() => {
    if (window.electronAPI) {
      // Just send current state to be sure
      window.electronAPI.setShortcutEnabled(isShortcutEnabled, shortcutKey)

      // Listen for open-settings signal (macOS Cmd+,)
      window.electronAPI.onOpenSettings(() => {
        setShowSettings(true)
      })
    }
  }, []) // Run once on mount

  const handleToggleTop = () => {
    const newState = !isAlwaysOnTop
    setIsAlwaysOnTop(newState)
    window.electronAPI.toggleAlwaysOnTop(newState)
  }

  const handleToggleShortcut = () => {
    const newState = !isShortcutEnabled
    setIsShortcutEnabled(newState)
    localStorage.setItem('shortcutEnabled', JSON.stringify(newState))
    window.electronAPI.setShortcutEnabled(newState, shortcutKey)
  }

  const handleKeyChange = (key: string) => {
    setShortcutKey(key)
    localStorage.setItem('shortcutKey', key)
    if (isShortcutEnabled) {
      window.electronAPI.setShortcutEnabled(true, key)
    }
  }

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const handleClose = () => {
    window.electronAPI.close()
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to clear your session and logout?')) {
      window.electronAPI.clearSession()
      setShowSettings(false)
    }
  }

  return (
    <div className={`app-container ${theme}-theme`}>
      <header className="titlebar">
        <div className="app-title">Gemini GO</div>
        <div className="controls">
          <button
            className={`control-btn ${isAlwaysOnTop ? 'active' : ''}`}
            onClick={handleToggleTop}
            title="Toggle Always on Top"
          >
            {isAlwaysOnTop ? '📌' : '⚓'}
          </button>
          <button
            className={`control-btn ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            ⚙️
          </button>
          <button className="control-btn close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>
      </header>

      {showSettings ? (
        <div className="settings-page">
          <h2>Settings</h2>
          <div className="setting-item">
            <p>Session Management</p>
            <button className="btn-primary" onClick={handleLogout}>
              Clear Session & Logout
            </button>
          </div>
          <div className="setting-item">
            <p className="hint">Shortcut: Global hotkey to toggle window.</p>
            <div className="shortcut-config">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isShortcutEnabled}
                  onChange={handleToggleShortcut}
                />
                <span>Enable Shortcut</span>
              </label>

              {isShortcutEnabled && (
                <div className="shortcut-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="shortcutKey"
                      value="Alt+Space"
                      checked={shortcutKey === 'Alt+Space'}
                      onChange={() => handleKeyChange('Alt+Space')}
                    />
                    <span>Alt+Space</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="shortcutKey"
                      value="Ctrl+Space"
                      checked={shortcutKey === 'Ctrl+Space'}
                      onChange={() => handleKeyChange('Ctrl+Space')}
                    />
                    <span>Ctrl+Space</span>
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="setting-item">
            <p className="hint">Theme: Choose between Light and Dark mode.</p>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={theme === 'light'}
                onChange={handleToggleTheme}
              />
              <span>Light Mode</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="webview-container">
          <webview
            src="https://gemini.google.com"
            className="gemini-view"
            // @ts-ignore
            allowpopups="true"
          />
        </div>
      )}
    </div>
  )
}

export default App
