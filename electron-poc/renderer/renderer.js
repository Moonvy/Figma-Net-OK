const startBtn = document.getElementById('start')
const resultDiv = document.getElementById('result')
const applyBtn = document.getElementById('apply')
const applyStatus = document.getElementById('applyStatus')
const resetBtn = document.getElementById('reset')

let latestBest = []

startBtn.addEventListener('click', async () => {
  const mode = document.getElementById('mode').value
  resultDiv.textContent = '测试中... 等待结果（控制台也会输出）'
  applyBtn.disabled = true
  applyStatus.textContent = ''
  const re = await window.fn.runTest(mode)
  if (!re.ok) {
    resultDiv.textContent = '测试失败: ' + (re.error || 'unknown')
    return
  }
  latestBest = re.best || []
  if (!latestBest.length) {
    resultDiv.textContent = '未找到可用服务器'
    return
  }
  // display
  resultDiv.innerHTML = ''
  const ul = document.createElement('div')
  ul.className = 'hosts'
  latestBest.forEach(h => {
    const line = document.createElement('div')
    line.textContent = `${h.ip.padEnd(15)} ${h.hostname}`
    ul.appendChild(line)
  })
  resultDiv.appendChild(ul)
  applyBtn.disabled = false
})

applyBtn.addEventListener('click', async () => {
  if (!latestBest.length) return
  applyBtn.disabled = true
  applyStatus.textContent = '正在应用 Hosts... 如无权限会弹出系统确认'
  const re = await window.fn.applyHosts(latestBest)
  if (re.ok) {
    applyStatus.textContent = '应用成功，已备份: ' + (re.backup || '')
  } else {
    applyStatus.textContent = '应用失败: ' + (re.error || 'unknown')
  }
  applyBtn.disabled = false
})

resetBtn.addEventListener('click', async () => {
  const ok = confirm('确认要从 hosts 中删除 Figma 的自动块吗？')
  if (!ok) return
  const re = await window.fn.resetHosts()
  if (re.ok) alert('重置成功')
  else alert('重置失败: ' + (re.error || 'unknown'))
})
