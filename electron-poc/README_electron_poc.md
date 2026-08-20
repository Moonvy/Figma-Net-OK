Electron PoC for Figma-Net-OK

This PoC demonstrates a basic Electron desktop app that reuses the existing Node logic in app/lib to find the best hosts and write them to the system hosts file on Windows (with privilege escalation if needed).

How to run (Windows):

1. Ensure you have Node.js (v16+) and npm installed.
2. In the repository root run:
   cd electron-poc
   npm install
   npm run start

3. The Electron window will open. Click "开始测试" then "应用 Hosts" to apply. When applying, if the process cannot write the hosts file it will prompt for elevation (UAC) using sudo-prompt.

Notes & caveats:
- This is a PoC. Do NOT consider it production ready. It performs backups before writing hosts but you should review the code.
- The PoC assumes the original project files under app/ (lib/*) are present and contain the logic used for testing. It calls ../app/lib/getBestHosts from main process.
- On non-Windows platforms the hosts path falls back to /etc/hosts but elevation behavior differs.

If you want, next I can:
- Harden the privileged write path, add logging and error recovery.
- Improve the UI to match the FigmaDrip mock exactly.
- Add an installer and code signing steps for Windows.
