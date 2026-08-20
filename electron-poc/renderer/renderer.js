const modeFastBtn = document.getElementById('modeFast')
const modeFullBtn = document.getElementById('modeFull')
const btnTest = document.getElementById('btnTest')
const btnCancel = document.getElementById('btnCancel')
const btnApply = document.getElementById('btnApply')
const btnReset = document.getElementById('btnReset')
const statusText = document.getElementById('statusText')
const progressInner = document.getElementById('progressInner')
const ipRows = document.getElementById('ipRows')
const bestHostsDiv = document.getElementById('bestHosts')
const logArea = document.getElementById('logArea')
const currentHosts = document.getElementById('currentHosts')
const currentHostsCount = document.getElementById('currentHostsCount')

let mode = 'fast'
let latestBest = []
let progressState = { total: 0, completed: 0 }

function log(msg) {
  const t = new Date().toLocaleString()
  logArea.textContent = `[${t}] ${msg}\n` + logArea.textContent
}

modeFastBtn.addEventListener('click', () => { mode = 'fast'; modeFastBtn.classList.add('active'); modeFullBtn.classList.remove('active') })
modeFullBtn.addEventListener('click', () => { mode = 'full'; modeFullBtn.classList.add('active'); modeFastBtn.classList.remove('active') })

btnTest.addEventListener('click', async () => {
  btnTest.disabled = true
  btnCancel.disabled = false
  btnApply.disabled = true
  statusText.textContent = '测试中...'
  progressInner.style.width = '0%'
  ipRows.innerHTML = ''
  bestHostsDiv.innerHTML = ''
  log('开始测试, 模式=' + mode)
  const re = await window.fn.runTest(mode)
  if (!re.ok) {
    statusText.textContent = '测试失败'
    log('测试失败: ' + (re.error || 'unknown'))
    btnTest.disabled = false
    btnCancel.disabled = true
    return
  }
  latestBest = re.best || []
  statusText.textContent = '测试完成'
  renderBest(latestBest)
  btnApply.disabled = latestBest.length === 0
  btnTest.disabled = false
  btnCancel.disabled = true
  log('测试完成，找到 ' + latestBest.length + ' 条')
})

btnCancel.addEventListener('click', async () => {
  btnCancel.disabled = true
  await window.fn.cancelTest()
  statusText.textContent = '已取消'
  log('用户取消测试')
})

btnApply.addEventListener('click', async () => {
  if (!latestBest.length) return
  btnApply.disabled = true
  statusText.textContent = '正在应用 Hosts...'
  log('尝试应用 Hosts：' + JSON.stringify(latestBest))
  const re = await window.fn.applyHosts(latestBest)
  if (re.ok) {
    statusText.textContent = '应用成功'
    log('应用成功，备份：' + (re.backup || ''))
    alert('应用成功，已备份：' + (re.backup || ''))
  } else {
    statusText.textContent = '应用失败'
    log('应用失败：' + (re.error || 'unknown'))
    alert('应用失败：' + (re.error || 'unknown'))
  }
  btnApply.disabled = false
})

btnReset.addEventListener('click', async () => {
  const ok = confirm('确认要删除 hosts 中 Figma 的自动块吗？')
  if (!ok) return
  const re = await window.fn.resetHosts()
  if (re.ok) { log('重置成功'); alert('重置成功') }
  else { log('重置失败：' + (re.error || 'unknown')); alert('重置失败：' + (re.error || 'unknown')) }
})

function renderBest(list) {
  bestHostsDiv.innerHTML = ''
  list.forEach(h => {
    const line = document.createElement('div')
    line.className = 'host-line'
    const left = document.createElement('div')
    left.className = 'host-left'
    left.textContent = `${h.ip}  ${h.hostname}`
    const right = document.createElement('div')
    right.className = 'host-right'
    right.textContent = `${h.ipInfo || ''} ${Math.round(h.time || 0)}ms`
    line.appendChild(left)
    line.appendChild(right)
    bestHostsDiv.appendChild(line)
  })
}

// listen progress events
window.fn.onProgress((payload) => {
  try {
    if (payload.type === 'start') {
      progressState = { total: payload.total || 0, completed: 0 }
      progressInner.style.width = '0%'
      ipRows.innerHTML = ''
      log('开始对 ' + payload.hostname + ' 进行测速，共 ' + (payload.total||0) + ' 个 IP')
    } else if (payload.type === 'ipResult') {
      progressState.completed = payload.completed
      const pct = progressState.total ? Math.round((progressState.completed / progressState.total) * 100) : 0
      progressInner.style.width = pct + '%'
      // append/update ip row
      const id = 'ip-' + payload.hostname + '-' + payload.ip
      let row = document.getElementById(id)
      if (!row) {
        row = document.createElement('div')
        row.id = id
        row.className = 'ip-row'
        const left = document.createElement('div')
        left.className = 'ip-left'
        left.textContent = payload.hostname
        const middle = document.createElement('div')
        middle.className = 'ip-middle'
        middle.textContent = payload.ip
        const right = document.createElement('div')
        right.className = 'ip-time'
        right.textContent = isFinite(payload.time) ? Math.round(payload.time) + 'ms' : 'timeout'
        row.appendChild(left)
        row.appendChild(middle)
        row.appendChild(right)
        ipRows.appendChild(row)
      } else {
        const el = row.querySelector('.ip-time')
        if (el) el.textContent = isFinite(payload.time) ? Math.round(payload.time) + 'ms' : 'timeout'
      }
    } else if (payload.type === 'bestIp') {
      log(`最佳 ${payload.hostname}: ${payload.ip} ${Math.round(payload.time)}ms ${payload.ipInfo||''}`)
    }
  } catch (e) {
    console.error(e)
  }
})

// display recent log file content by polling
setInterval(async () => {
  try {
    const res = await fetch('file://' + location.origin + '/dummy')
  } catch (_) {}
  // we don't have a direct API to read file logs; logArea already shows runtime logs from in-memory pushes
}, 2000)
