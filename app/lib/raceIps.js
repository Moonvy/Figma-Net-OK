const testUrl = require("./testUrl")
const axios = require("axios")
/** 测速多个 ip */
module.exports = async function reacIps(url, ips) {
    let bestIp = null
    spinner.start(`🐌 对 ${ips.length} 个服务器进行测速... `)
    let i = 0
    for (const ip of ips) {
        i++
        let time = await testUrl(url, ip)
        spinner.start(`🐌 [${i}/${ips.length}] ${ip}  \t ${time}ms`)

        if ((bestIp && time < bestIp.time) || !bestIp) {
            bestIp = { ip, time }
        }
    }

    let ipInfo = await getIpInfo(bestIp.ip)
    bestIp.ipInfo = ipInfo
    return bestIp
}

async function getIpInfo(ip) {
    try {
        let re = await axios.get(`http://ip-api.com/json/${ip}?lang=zh-CN`, { timeout: 2000 })
        return `${re.data.countryCode},${re.data.country},${re.data.city}`
    } catch (e) {
        // console.error("ipInfo", e)
        return `未知地区`
    }
}
