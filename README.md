# Gemini GO

![Gemini GO](public/tray-icon.png)

**Gemini GO** is a lightweight, Electron-based desktop application wrapper for Google Gemini. It provides a dedicated workspace for your AI interactions, keeping them separate from your browser tabs.

## Features

- **Dedicated Window**: Access Gemini in a standalone, distraction-free window.
- **Always on Top**: Toggle the window to stay on top of other applications for easy reference while working.
- **Global Shortcut**: Quickly toggle the visibility of Gemini GO with `Alt+Space` (or `Ctrl+Space` if `Alt+Space` is taken).
- **System Tray Support**: Minimizes to the system tray to keep your taskbar clean.
- **Portable**: Available as a portable executable for Windows – no installation required.

## Why is FFMPEG here?

You might notice `ffmpeg.dll` or similar files in the release folder. **Gemini GO** uses Electron (which is built on Chromium). FFMPEG is a core component of Chromium required for media playback. It is automatically included to ensure that if Gemini needs to play any audio or video content, it works out of the box. We do not use it for any other processing.

## Security & Signing

Because this is a free, open-source project, we do not purchase expensive code-signing certificates.

- **Windows**: You may see a "Windows protected your PC" (SmartScreen) warning because the app is not signed with a purchased certificate. Click **"More info"** and then **"Run anyway"**.
- **macOS**: Without an Apple Developer Account, the app is unsigned. You will need to **Right Click** the app and select **Open** to bypass the "Unidentified Developer" warning.

## Installation

### Windows (Portable)
1. Download the latest `Gemini GO-Portable.exe` from the [Releases](https://github.com/koliploik/gemini-go/releases) page.
2. Run the executable to start the application.

### From Source
To run Gemini GO from source, you'll need [Node.js](https://nodejs.org/) installed on your machine.

1. Clone the repository:
   ```bash
   git clone https://github.com/koliploik/gemini-go.git
   cd gemini-go
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Building

To build the application for production:

```bash
npm run dist
```

This will create the executable and portable files in the `release/` directory.

## Tech Stack

- **Electron**: For cross-platform desktop application development.
- **React**: For the UI (User Interface).
- **TypeScript**: For type-safe code.
- **Vite**: For fast build tooling.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
