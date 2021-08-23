const nslookup = require("nslookup")
const axios = require("axios")
const ping = require("ping")
const dns = require("dns")
const { resolve } = require("path")
const { rejects } = require("assert")
const testUrl = require("./testUrl.js")
const ora = require("ora")

console.log("\n---------------------------")
console.log("   🐌 Figma 最佳线路测试 🐙    ")
console.log("---------------------------\n")
console.log("Host 编辑工具：https://swh.app/zh/\n")
const spinner = ora("🐌").start()

async function main() {
    // console.log("www.figma.com", await dnsList("www.figma.com"))
    // console.log("static.figma.com", await dnsList("static.figma.com"))

    // s3-alpha-sig.figma.com
    let s3_ips = await dnsList(
        "s3-alpha-sig.figma.com",
        "https://s3-alpha.figma.com/profile/9b3f693e-0677-4743-89ff-822b9f6b72be"
    )
    // www.figma.com
    let api_ips = await dnsList("www.figma.com", "https://www.figma.com/api/community_categories/all?page_size=10")

    // static.figma.com
    let static_ips = await dnsList("static.figma.com", "https://static.figma.com/app/icon/1/icon-192.png")
    https: spinner.succeed()

    console.log("在此时对于你最佳的 Host 配置是：\n\n")
    console.log(`${s3_ips[0].ip}     s3-alpha-sig.figma.com`)
    console.log(`${api_ips[0].ip}     www.figma.com`)
    console.log(`${static_ips[0].ip}     static.figma.com`)
    console.log("\n\n")
}

main()

async function dnsList(name, url) {
    console.log(`🐌 [查找] ${name}`)

    let allAddrs = []
    let localDNSServers = dns.getServers()

    // "本地 DNS"
    for (const localDNSServer of localDNSServers) {
        allAddrs.push(...(await dnsLookup(name, localDNSServer)))
    }
    // Google DNS
    allAddrs.push(...(await dnsLookup(name, "8.8.8.8")))

    // 百度 DNS
    allAddrs.push(...(await dnsLookup(name, "180.76.76.76")))

    // 阿里 DNS
    allAddrs.push(...(await dnsLookup(name, "223.5.5.5")))

    // 114 DNS
    allAddrs.push(...(await dnsLookup(name, "114.114.114.114")))

    // Cloudflare DNS
    allAddrs.push(...(await dnsLookup(name, "1.1.1.1")))

    // Quad9 DNS
    allAddrs.push(...(await dnsLookup(name, "9.9.9.9")))

    allAddrs = Array.from(new Set(allAddrs))

    let list = []
    for (const addr of allAddrs) {
        let ob = { ip: addr, info: {} }
        try {
            let info = await ipInfo(addr)
            ob.info = info
            spinner.text = `find ip info:${info}`
            if (url) {
                let time = await testUrl(url, ob.ip)
                ob.time = time
                spinner.text = `test url:${addr}:${time}ms`
            }
        } catch (error) {
            console.error(error)
        }
        list.push(ob)
    }

    list = list.sort((a, b) => a.time - b.time)
    return list
}

function dnsLookup(name, server = "8.8.8.8") {
    spinner.text = `DNS(${name} by ${server}):`
    return new Promise((resolve, reject) => {
        nslookup(name)
            .server(server) // default is 8.8.8.8
            .timeout(10 * 1000) // default is 3 * 1000 ms
            .end(function (err, addrs) {
                if (err) {
                    // console.error(err)
                    resolve([])
                } else {
                    // console.log(`  DNS(${name} by ${server}):`, addrs)
                    resolve(addrs)
                }
            })
    })
}

async function ipInfo(ip) {
    let re = await axios.get(`http://ip-api.com/json/${ip}?lang=zh-CN`)
    return `${re.data.countryCode},${re.data.country},${re.data.city}`
}
