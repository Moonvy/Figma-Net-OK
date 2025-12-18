const { default: axios } = require("axios")
const http = require("http")
const https = require("https")

const staticLookup = (ip, v) => (hostname, opts, cb) => {
    // 处理两种调用方式: lookup(hostname, cb) 或 lookup(hostname, opts, cb)
    if (typeof opts === 'function') {
        cb = opts
        opts = {}
    }
    // 确保 ip 有效
    if (!ip) {
        cb(new Error(`Invalid IP address: ${ip}`))
        return
    }
    // 处理 all: true 的情况，需要返回数组
    if (opts && opts.all) {
        cb(null, [{ address: ip, family: v || 4 }])
    } else {
        cb(null, ip, v || 4)
    }
}

const createAgents = (ip) => ({
    httpAgent: new http.Agent({ lookup: staticLookup(ip) }),
    httpsAgent: new https.Agent({ lookup: staticLookup(ip) }),
})

function testUrl(url, ip, timeout = 5500) {
    return new Promise((resolve) => {
        let t0 = performance.now()
        const agents = createAgents(ip)
        axios
            .get(url, {
                httpAgent: agents.httpAgent,
                httpsAgent: agents.httpsAgent,
                timeout,
            })
            .then((r) => {
                let t1 = performance.now()
                let t = t1 - t0
                // console.log(`[testUrl ok]`, { ip, url, time: t.toFixed(2) })
                resolve(t)
            })
            .catch((e) => {
                // console.error("[testUrl err]", { ip, url }, e)
                resolve(Infinity)
            })
    })
}

function testUrlNative(url, ip, timeout = 5500) {
    return new Promise((resolve) => {
        const t0 = performance.now()
        const parsedUrl = new URL(url)
        const isHttps = parsedUrl.protocol === 'https:'
        const lib = isHttps ? https : http
        const agent = isHttps
            ? new https.Agent({ lookup: staticLookup(ip) })
            : new http.Agent({ lookup: staticLookup(ip) })

        const req = lib.get(url, { agent, timeout }, (res) => {
            // 消费响应数据以完成请求
            res.on('data', () => {})
            res.on('end', () => {
                const t1 = performance.now()
                const t = t1 - t0
                // console.log(`[testUrlNative ok]`, { ip, url, time: t.toFixed(2) })
                resolve(t)
            })
        })

        req.on('error', (e) => {
            // console.error("[testUrlNative err]", { ip, url }, e)
            resolve(Infinity)
        })

        req.on('timeout', () => {
            req.destroy()
            resolve(Infinity)
        })
    })
}

module.exports = { testUrl, testUrlNative }
