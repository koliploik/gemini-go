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

// Optimize for performance and prevent hangs during streaming
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-renderer-backgrounding')

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

    // Set a modern Chrome User Agent to ensure compatibility and stability
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
    win.webContents.setUserAgent(userAgent)

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(process.env.DIST!, 'index.html'))
    }

    // Global Context Menu (Right-click) - works for main window AND webviews
    app.on('web-contents-created', (event, webContents) => {
        webContents.on('context-menu', (event, params) => {
            const menu = Menu.buildFromTemplate([
                {
                    label: 'Copia',
                    role: 'copy',
                    enabled: params.selectionText.length > 0
                },
                {
                    label: 'Incolla',
                    role: 'paste'
                },
                { type: 'separator' },
                {
                    label: 'Seleziona tutto',
                    role: 'selectAll'
                }
            ])
            menu.popup()
        })
    })

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

    // We don't call registerShortcuts here anymore, 
    // it will be called by the renderer sync on mount.
    createApplicationMenu()
})

function createApplicationMenu() {
    if (process.platform !== 'darwin') {
        Menu.setApplicationMenu(null) // Keep it clean on Windows/Linux
        return
    }

    const template: Electron.MenuItemConstructorOptions[] = [
        {
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                {
                    label: 'Preferences...',
                    accelerator: 'Command+,',
                    click: () => {
                        win?.webContents.send('open-settings')
                    }
                },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                {
                    label: 'Close Window',
                    accelerator: 'Command+W',
                    click: () => {
                        win?.hide()
                    }
                },
                { type: 'separator' },
                { role: 'front' }
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

function registerShortcuts(key: string) {
    // Unregister everything first to ensure a clean state
    globalShortcut.unregisterAll()

    // Register the specific key requested
    let ret = globalShortcut.register(key, () => {
        toggleWindow('shortcut')
    })

    if (!ret) {
        console.warn(`Failed to register shortcut: ${key}. It might be in use by another application.`)
    } else {
        console.log(`Global shortcut ${key} registered successfully.`)
    }
}

function unregisterShortcuts() {
    globalShortcut.unregisterAll()
}

// IPC Handler for Shortcut Toggle
ipcMain.on('set-shortcut-enabled', (event, enabled, key) => {
    if (enabled) {
        registerShortcuts(key)
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
