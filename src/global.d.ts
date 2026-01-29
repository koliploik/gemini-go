export { }

declare global {
    interface Window {
        electronAPI: {
            toggleAlwaysOnTop: (flag: boolean) => void
            minimize: () => void
            close: () => void
            clearSession: () => void
            setShortcutEnabled: (enabled: boolean, key: string) => void
            onOpenSettings: (callback: () => void) => void
            onAuthComplete: (callback: () => void) => void
            getAppVersion: () => Promise<string>
        }
    }

    // Intrinsic element for webview
    namespace JSX {
        interface IntrinsicElements {
            webview: any
        }
    }
}
