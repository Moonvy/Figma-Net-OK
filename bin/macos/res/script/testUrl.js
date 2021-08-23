const { default: axios } = require("axios")
const http = require("http")
const https = require("https")
const { inspect } = require("util")

const staticLookup = (ip, v) => (hostname, opts, cb) => cb(null, ip, v || 4)
const staticDnsAgent = (scheme, ip) => new require(scheme).Agent({ lookup: staticLookup(ip) })

module.exports = async function testUrl(url, ip) {
    let t0 = new Date().getTime()
    try {
        await axios.get(url, {
            httpsAgent: staticDnsAgent("https", ip),
        })
        let t1 = new Date().getTime()
        return t1 - t0
    } catch (error) {
        return 9999999
    }
}
