# Code signing and Windows installer notes

This file describes how to produce a signed Windows installer for the Electron app and notes for release.

Publisher name used in build config: Mr.xiaoan

1) Build installer (unsigned)
- Install dev deps: npm install --only=dev
- From electron-poc: npm run dist
- This uses electron-builder and NSIS to generate an installer in dist/ (e.g. FigmaDrip Setup x.y.z.exe)

2) Code signing (recommended)
- Obtain a Windows Code Signing Certificate (EV cert reduces SmartScreen warnings). Providers include DigiCert, Sectigo, GlobalSign, etc.
- Use signtool.exe (from Windows SDK) or osslsigncode to sign the executable and installer. Example with signtool:
  signtool sign /fd SHA256 /a /tr http://timestamp.digicert.com /td SHA256 /v "path\\to\\your-installer.exe"

- You can configure electron-builder to sign automatically by setting environment variables: CSC_LINK (path or URL to pfx) and CSC_KEY_PASSWORD. Example:
  export CSC_LINK="/path/to/yourcert.p12"
  export CSC_KEY_PASSWORD="yourcertpassword"
  npm run dist

3) NSIS installer privileges
- The build config allows elevation (allowElevation:true) so the installer can request UAC during certain operations.
- Our app still requests elevation at runtime only when writing hosts via sudo-prompt.

4) Publishing & auto-update
- You can publish releases to GitHub Releases and use electron-updater to implement auto-update. electron-builder can upload to GitHub automatically if configured.

Security & privacy
- The installer and executable should be code-signed to reduce SmartScreen warnings.
- Clearly document that the app will modify system hosts and will request elevation for that purpose.

Optional: If you want, provide the PFX file and password in a secure way and I can help generate a signed build locally and upload the signed installer to your Releases (I will need repo access or you can upload yourself following the steps provided here).
