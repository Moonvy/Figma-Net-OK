const nslookup = require("nslookup")

// Spinner 消息队列，确保每条消息有足够展示时间
const spinnerQueue = []
let isProcessingQueue = false
let queueFinishResolvers = [] // 用于通知等待者队列已清空
const MIN_DISPLAY_TIME = 150 // 每条消息最少展示 150ms

async function processSpinnerQueue() {
    if (isProcessingQueue) return
    isProcessingQueue = true

    while (spinnerQueue.length > 0) {
        const message = spinnerQueue.shift()
        spinner.start(message)
        await new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_TIME))
    }

    isProcessingQueue = false
    // 通知所有等待者队列已清空
    queueFinishResolvers.forEach((resolve) => resolve())
    queueFinishResolvers = []
}

function queueSpinnerMessage(message) {
    spinnerQueue.push(message)
    processSpinnerQueue()
}

/** 等待 spinner 队列处理完成 */
function waitForSpinnerQueue() {
    if (!isProcessingQueue && spinnerQueue.length === 0) {
        return Promise.resolve()
    }
    return new Promise((resolve) => {
        queueFinishResolvers.push(resolve)
    })
}

/** 通过 DNS 解析域名的 IP, 返回 IP 列表 */
async function host2ips(hostname, dnsServer, serverName) {
    queueSpinnerMessage(`DNS [${hostname}] by ${serverName}${dnsServer ? ` (${dnsServer})` : ''} `)
    let re = await dnsLookup(hostname, dnsServer)
 
    return re
}

function dnsLookup(name, server) {
    return new Promise((resolve, reject) => {
        const lookup = nslookup(name)
        if (server) {
            lookup.server(server) // 指定 DNS 服务器，不指定则使用系统默认
        }
        lookup.timeout(3 * 1000) // default is 3 * 1000 ms
        lookup.end(function (err, addrs) {
                if (err) {
                    resolve([])
                } else {
                    // console.log({addrs})
                    // console.log(`  DNS(${name} by ${server}):`, addrs)
                    resolve(addrs.filter((x) => x && /./.test(x)))
                }
            })
    })
}

module.exports = host2ips
module.exports.waitForSpinnerQueue = waitForSpinnerQueue
