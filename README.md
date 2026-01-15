# Gemini GO

![Gemini GO](public/tray-icon.png)

**Gemini GO** is a lightweight, Electron-based desktop application wrapper for Google Gemini. It provides a dedicated workspace for your AI interactions, keeping them separate from your browser tabs.

> [!NOTE]
> **Gemini GO** is currently in its very early development phase. We welcome all contributions!

## Features

- **Dedicated Window**: Access Gemini in a standalone, distraction-free window.
- **Always on Top**: Toggle the window to stay on top of other applications.
- **Customizable Global Shortcut**: Choose your preferred toggle key: `Alt+Space` or `Ctrl+Space`.
- **Theme Support**: Switch between **Light** and **Dark** modes in settings.
- **Context Menu**: Full right-click support (Copy/Paste/Select All) even inside Gemini.
- **System Tray Support**: Minimizes to the system tray to keep your taskbar clean.
- **Portable & Unpacked**: Available as a single `.exe` or a zipped directory for Windows.

## Why is FFMPEG here?

You might notice `ffmpeg.dll` or similar files in the release folder. **Gemini GO** uses Electron (which is built on Chromium). FFMPEG is a core component of Chromium required for media playback. It is automatically included to ensure that if Gemini needs to play any audio or video content, it works out of the box. We do not use it for any other processing.

## Security & Signing

Because this is a free, open-source project, we do not purchase expensive code-signing certificates.

- **Windows**: You may see a "Windows protected your PC" (SmartScreen) warning because the app is not signed with a purchased certificate. Click **"More info"** and then **"Run anyway"**.
- **macOS**: Without an Apple Developer Account, the app is unsigned. You will need to **Right Click** the app and select **Open** to bypass the "Unidentified Developer" warning.

## Transparency & Security

Given the recent security concerns surrounding other third-party Gemini desktop apps (e.g., the "Gemini Desk" malware incident), this project prioritizes absolute transparency:

- **100% Open Source**: Every line of code is available for audit.
- **Zero Data Collection**: We do not collect, store, or transmit your data to any external servers. The app is a simple Electron wrapper that communicates only with `gemini.google.com`.
- **Audited Development**: This project was developed and audited with the help of **Antigravity** (Google Deepmind) to ensure adherence to security best practices.
- **No Persistence/Background Tasks**: Unlike malicious apps, Gemini GO does not install background services or hidden persistence mechanisms. When you quit the app, it is completely gone from your processes.

## Development & Testing

To test the application locally or run it from source:

1. Clone the repository:
   ```bash
   git clone https://github.com/koliploik/gemini-go.git
   cd gemini-go
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Installation (Windows)

You can download the latest version from the [Releases](https://github.com/koliploik/gemini-go/releases) page:

- **Portable (`-Portable.exe`)**: A single file that runs without installation.
- **Unpacked (`.zip`)**: A compressed archive of the application directory.

## Building

To build the application for production:

```bash
npm run dist
```

This will create the release artifacts in the `release/` directory.

## Tech Stack

- **Electron**: For cross-platform desktop application development.
- **React**: For the UI (User Interface).
- **TypeScript**: For type-safe code.
- **Vite**: For fast build tooling.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Developed in Italy with 🧠 and ❤️ and with Antigravity. 
</p>
