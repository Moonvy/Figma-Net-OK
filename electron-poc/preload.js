const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('fn', {
  runTest: (mode) => ipcRenderer.invoke('run-test', mode),
  applyHosts: (hostsArray) => ipcRenderer.invoke('apply-hosts', hostsArray),
  resetHosts: () => ipcRenderer.invoke('reset-hosts')
})
