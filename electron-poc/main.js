const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const sudo = require('sudo-prompt')

// Import existing project logic
const getBestHosts = require(path.join(__dirname, '..', 'app', 'lib', 'getBestHosts'))

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// IPC: start test
ipcMain.handle('run-test', async (event, mode) => {
  try {
    const best = await getBestHosts(mode)
    return { ok: true, best }
  } catch (e) {
    return { ok: false, error: e && e.message }
  }
})

// Hosts manipulation (Windows PoC). Uses a safe block replacement and backup.
const HOSTS_PATH = process.platform === 'win32'
  ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'drivers', 'etc', 'hosts')
  : '/etc/hosts'
const BACKUP_DIR = path.join(os.homedir(), '.figma-net-ok-backups')
const BLOCK_START = '# ==== FIGMA-NET-OK START ===='
const BLOCK_END = '# ==== FIGMA-NET-OK END ===='

function makeFigmaBlock(hostsArray) {
  const lines = hostsArray.map(h => `${h.ip}    ${h.hostname}`)
  return [BLOCK_START, ...lines, BLOCK_END].join(os.EOL)
}

function replaceFigmaBlock(content, newBlock) {
  const startIndex = content.indexOf(BLOCK_START)
  const endIndex = content.indexOf(BLOCK_END)
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = content.slice(0, startIndex)
    const after = content.slice(endIndex + BLOCK_END.length)
    return before + newBlock + after
  } else {
    // append with newline
    return content + os.EOL + newBlock + os.EOL
  }
}

function backupHostsSync() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })
    const bakPath = path.join(BACKUP_DIR, `hosts.bak.${Date.now()}`)
    fs.copyFileSync(HOSTS_PATH, bakPath)
    return { ok: true, path: bakPath }
  } catch (e) {
    return { ok: false, error: e && e.message }
  }
}

function writeHostsDirect(newBlock) {
  const content = fs.readFileSync(HOSTS_PATH, 'utf8')
  const newContent = replaceFigmaBlock(content, newBlock)
  // atomic write: write to tmp then rename
  const tmp = HOSTS_PATH + '.tmp'
  fs.writeFileSync(tmp, newContent, { encoding: 'utf8' })
  fs.renameSync(tmp, HOSTS_PATH)
}

function writeHostsWithPrivilege(newBlock) {
  return new Promise((resolve, reject) => {
    const tmpScript = path.join(os.tmpdir(), `fn_write_hosts_${Date.now()}.js`)
    const script = `const fs=require('fs');const path='${HOSTS_PATH.replace(/\\/g,'\\\\')}';const os=require('os');const BLOCK_START='${BLOCK_START}';const BLOCK_END='${BLOCK_END}';function replaceFigmaBlock(content,newBlock){const start=content.indexOf(BLOCK_START);const end=content.indexOf(BLOCK_END);if(start!==-1&&end!==-1&&end>start){const before=content.slice(0,start);const after=content.slice(end+BLOCK_END.length);return before+newBlock+after;}return content+os.EOL+newBlock+os.EOL;}try{const content=fs.readFileSync(path,'utf8');const nc=replaceFigmaBlock(content,${JSON.stringify(newBlock)});fs.writeFileSync(path, nc, 'utf8');console.log('OK');}catch(e){console.error(e);process.exit(1);}`
    fs.writeFileSync(tmpScript, script, 'utf8')
    const options = { name: 'FigmaNetOK' }
    sudo.exec(`node "${tmpScript}"`, options, (err, stdout, stderr) => {
      try { fs.unlinkSync(tmpScript) } catch (_) {}
      if (err) return reject(err)
      return resolve(stdout)
    })
  })
}

ipcMain.handle('apply-hosts', async (event, hostsArray) => {
  const block = makeFigmaBlock(hostsArray)
  const bak = backupHostsSync()
  if (!bak.ok) {
    return { ok: false, error: 'backup failed: ' + bak.error }
  }

  try {
    writeHostsDirect(block)
    return { ok: true, backup: bak.path }
  } catch (e) {
    // likely permission error: try with privilege
    try {
      await writeHostsWithPrivilege(block)
      return { ok: true, backup: bak.path }
    } catch (e2) {
      return { ok: false, error: e2 && e2.message }
    }
  }
})

ipcMain.handle('reset-hosts', async (event) => {
  try {
    const content = fs.readFileSync(HOSTS_PATH, 'utf8')
    const startIndex = content.indexOf(BLOCK_START)
    const endIndex = content.indexOf(BLOCK_END)
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const before = content.slice(0, startIndex)
      const after = content.slice(endIndex + BLOCK_END.length)
      const newContent = before + after
      const tmp = HOSTS_PATH + '.tmp'
      fs.writeFileSync(tmp, newContent, 'utf8')
      try { fs.renameSync(tmp, HOSTS_PATH); return { ok: true } } catch (e) {
        // try privileged
        const script = `const fs=require('fs');const path='${HOSTS_PATH.replace(/\\/g,'\\\\')}';const content=fs.readFileSync(path,'utf8');const start=content.indexOf('${BLOCK_START}');const end=content.indexOf('${BLOCK_END}');if(start!==-1&&end!==-1&&end>start){const before=content.slice(0,start);const after=content.slice(end+'${BLOCK_END}'.length);fs.writeFileSync(path,before+after,'utf8');console.log('OK');}`
        const tmpScript = path.join(os.tmpdir(), `fn_reset_hosts_${Date.now()}.js`)
        fs.writeFileSync(tmpScript, script, 'utf8')
        const options = { name: 'FigmaNetOK' }
        return new Promise((resolve) => {
          sudo.exec(`node "${tmpScript}"`, options, (err) => {
            try { fs.unlinkSync(tmpScript) } catch (_) {}
            if (err) return resolve({ ok: false, error: err.message })
            return resolve({ ok: true })
          })
        })
      }
    } else {
      return { ok: false, error: 'no block found' }
    }
  } catch (e) {
    return { ok: false, error: e && e.message }
  }
})
