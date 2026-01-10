import { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'node:path'

// Type-safe app reference
const myApp = app as any

// The built directory structure
//
// ├─┬─ dist
// │ ├─ index.html
// │ ├─ assets
// │ └─ ...
// ├─┬─ dist-electron
// │ ├─ main.js
// │ └─ preload.js
//

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST!, '../public')

let win: BrowserWindow | null
let tray: Tray | null = null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: path.join(process.env.VITE_PUBLIC!, 'tray-icon.png'),
        frame: false, // Custom titlebar
        autoHideMenuBar: true,
        alwaysOnTop: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true, // Critical for embedding Gemini
            nodeIntegration: false,
            contextIsolation: true,
        },
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(process.env.DIST!, 'index.html'))
    }

    // Basic IPC handlers
    ipcMain.on('toggle-always-on-top', (event, flag) => {
        if (win) win.setAlwaysOnTop(flag)
    })

    ipcMain.on('minimize-window', () => {
        if (win) win.minimize()
    })

    ipcMain.on('clear-session', async () => {
        if (win) {
            await win.webContents.session.clearStorageData()
            win.reload()
        }
    })

    ipcMain.on('close-window', () => {
        if (win) win.hide()
    })

    // Handle close functionality - intercept 'x' button
    win.on('close', (event) => {
        // Prevent window from being destroyed, just hide it
        if (!myApp.isQuiting) {
            event.preventDefault()
            win?.hide()
        }
        return false
    })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    // Modified for Tray: Do NOT quit when window is closed
    if (process.platform !== 'darwin') {
        // app.quit() // Disabled to keep app running in tray
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(() => {
    createWindow()


    // Create Tray Icon
    const iconPath = path.join(process.env.VITE_PUBLIC!, 'tray-icon.png')
    // Ensure icon exists, or handle error? Standard template has it.
    const icon = nativeImage.createFromPath(iconPath)
    tray = new Tray(icon)
    tray.setToolTip('Gemini GO')

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show/Hide',
            click: () => toggleWindow('tray')
        },
        {
            label: 'Quit Gemini GO',
            click: () => {
                app.quit()
            }
        }
    ])

    tray.setContextMenu(contextMenu)

    tray.on('click', () => {
        toggleWindow('tray')
    })

    registerShortcuts()
})

function registerShortcuts() {
    globalShortcut.unregisterAll() // Clear existing first
    // Try registering Alt+Space, fallback to Ctrl+Space if failed
    let ret = globalShortcut.register('Alt+Space', () => {
        toggleWindow('shortcut')
    })

    if (!ret) {
        console.log('Alt+Space failed, trying Ctrl+Space')
        ret = globalShortcut.register('Ctrl+Space', () => {
            toggleWindow('shortcut')
        })
    }
}

function unregisterShortcuts() {
    globalShortcut.unregisterAll()
}

// IPC Handler for Shortcut Toggle
ipcMain.on('set-shortcut-enabled', (event, enabled) => {
    if (enabled) {
        registerShortcuts()
    } else {
        unregisterShortcuts()
    }
})

function toggleWindow(source: 'tray' | 'shortcut') {
    if (!win) return
    const isVisible = win.isVisible()
    const isFocused = win.isFocused()

    if (source === 'shortcut') {
        if (isVisible && isFocused) {
            win.hide()
        } else {
            if (win.isMinimized()) win.restore()
            win.show()
            win.focus()
        }
    } else {
        // Tray source - simpler toggle
        // If visible (even if not focused, e.g. clicked tray), hide it.
        if (isVisible) {
            win.hide()
        } else {
            if (win.isMinimized()) win.restore()
            win.show()
            win.focus()
        }
    }
}

app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
})

// Add property to global app to track quitting state
myApp.isQuiting = false

app.on('before-quit', () => {
    myApp.isQuiting = true
})
