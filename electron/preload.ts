import { contextBridge, ipcRenderer } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
    toggleAlwaysOnTop: (flag: boolean) => ipcRenderer.send('toggle-always-on-top', flag),
    minimize: () => ipcRenderer.send('minimize-window'),
    close: () => ipcRenderer.send('close-window'),
    clearSession: () => ipcRenderer.send('clear-session'),
    setShortcutEnabled: (enabled: boolean) => ipcRenderer.send('set-shortcut-enabled', enabled),
})
