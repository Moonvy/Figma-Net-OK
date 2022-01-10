const { default: axios } = require("axios")
const http = require("http")
const https = require("https")
const { resolve } = require("path")
const { inspect } = require("util")

const staticLookup = (ip, v) => (hostname, opts, cb) => cb(null, ip, v || 4)
const staticDnsAgent = (scheme, ip) => new require(scheme).Agent({ lookup: staticLookup(ip) })

module.exports = function testUrl(url, ip, timeout = 5500) {
    return new Promise((resolve) => {
        let t0 = new Date().getTime()
        axios
            .get(url, {
                httpsAgent: staticDnsAgent("https", ip),
                timeout: timeout + 10,
            })
            .then((r) => {
                let t1 = new Date().getTime()
                resolve(t1 - t0)
            })
            .catch((e) => {
                resolve(9999999)
            })
    })
}
