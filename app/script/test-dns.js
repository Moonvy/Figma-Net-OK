const nslookup = require("nslookup")
const axios = require("axios")
const ping = require("ping")
const dns = require("dns")
const { resolve } = require("path")
const { rejects } = require("assert")
const testUrl = require("./testUrl.js")
const ora = require("ora")
const chalk = require("chalk")

console.clear()
console.log("\n----------------------------------------------")
console.log(chalk.green("       🐌 Figma 网络最佳线路测试 v1.2 🐙    "))
console.log(chalk.gray(" https://github.com/Moonvy/Figma-Net-OK   "))
console.log(chalk.gray("            By 🌕 Moonvy.com      "))
console.log("----------------------------------------------\n")
console.log("Host 编辑工具：https://swh.app/zh/\n")
const spinner = ora("🐌").start()

async function main() {
    // s3-alpha-sig.figma.com
    console.log(`🐌 [查找 1/3] s3-alpha-sig.figma.com`)
    let s3_ips = await dnsList(
        "s3-alpha-sig.figma.com",
        "https://s3-alpha.figma.com/profile/9b3f693e-0677-4743-89ff-822b9f6b72be"
    )
    // www.figma.com
    console.log(`🐌 [查找 2/3] www.figma.com`)
    let api_ips = await dnsList("www.figma.com", "https://www.figma.com/api/community_categories/all?page_size=10")

    // static.figma.com
    console.log(`🐌 [查找 3/3] static.figma.com`)
    let static_ips = await dnsList("static.figma.com", "https://static.figma.com/app/icon/1/icon-192.png")
    spinner.succeed("done")

    console.log(chalk.green("\n在此时对于你最佳的 Host 配置是：\n\n"))
    console.log(`${s3_ips[0].ip}     s3-alpha-sig.figma.com`)
    console.log(`${api_ips[0].ip}     www.figma.com`)
    console.log(`${static_ips[0].ip}     static.figma.com`)
    console.log("\n\n")
    process.stdin.resume()
}

main()

async function dnsList(name, url) {
    let allAddrs = []

    await Promise.all(
        [
            async () => {
                let localDNSServers = dns.getServers()

                // "本地 DNS"
                for (const localDNSServer of localDNSServers) {
                    allAddrs.push(...(await dnsLookup(name, localDNSServer)))
                }
            },
            async () => {
                // Google DNS
                allAddrs.push(...(await dnsLookup(name, "8.8.8.8")))
            },
            async () => {
                // 百度 DNS
                allAddrs.push(...(await dnsLookup(name, "180.76.76.76")))
            },
            async () => {
                // 阿里 DNS
                allAddrs.push(...(await dnsLookup(name, "223.5.5.5")))
            },
            async () => {
                // 114 DNS
                allAddrs.push(...(await dnsLookup(name, "114.114.114.114")))
            },
            async () => {
                // Cloudflare DNS
                allAddrs.push(...(await dnsLookup(name, "1.1.1.1")))
            },
            async () => {
                // Quad9 DNS
                allAddrs.push(...(await dnsLookup(name, "9.9.9.9")))
            },
            async () => {
                // 腾讯 DNS
                allAddrs.push(...(await dnsLookup(name, "119.29.29.29")))
            },
            async () => {
                // level3.net  DNS
                allAddrs.push(...(await dnsLookup(name, "4.2.2.1")))
            },
        ].map((f) => f())
    )

    allAddrs = Array.from(new Set(allAddrs))

    let list = []
    let minTime = 5500
    let i = 0
    for (const addr of allAddrs) {
        i++
        let ob = { ip: addr, info: {} }
        try {
            let info = await ipInfo(addr)
            ob.info = info
            spinner.text = ` [test] ${i}/${allAddrs.length} <${ob.ip}> info: ${info}\n`
        } catch (error) {
            // console.error(error)
        }

        try {
            if (url) {
                spinner.text = ` [test] ${i}/${allAddrs.length} <${ob.ip}(${ob.info})> url speed... \n`
                let time = await testUrl(url, ob.ip, minTime)
                ob.time = time
                spinner.text = ` [test] ${i}/${allAddrs.length} <${ob.ip}(${ob.info})> url speed:${time}ms \n`
                minTime = Math.min(minTime, time)
            }
        } catch (error) {
            // console.error(error)
        }
        list.push(ob)
    }

    list = list.sort((a, b) => a.time - b.time).filter((x) => x != undefined && typeof x.ip != undefined)

    console.log(
        "\n",
        list
            .map((x, index) =>
                index == 0
                    ? chalk.green(`  ${x.ip} - ${x.info} - ${x.time}`)
                    : chalk.gray(`  ${x.ip} - ${x.info} - ${x.time}`)
            )
            .join("\n")
    )
    return list
}

function dnsLookup(name, server = "8.8.8.8") {
    spinner.text = `DNS(${name} by ${server}):`
    return new Promise((resolve, reject) => {
        nslookup(name)
            .server(server) // default is 8.8.8.8
            .timeout(5 * 1000) // default is 3 * 1000 ms
            .end(function (err, addrs) {
                if (err) {
                    // console.error(err)
                    resolve([])
                } else {
                    // console.log(`  DNS(${name} by ${server}):`, addrs)
                    resolve(addrs.filter((x) => /./.test(x)))
                }
            })
    })
}

async function ipInfo(ip) {
    try {
        let re = await axios.get(`http://ip-api.com/json/${ip}?lang=zh-CN`, { timeout: 3000 })
        return `${re.data.countryCode},${re.data.country},${re.data.city}`
    } catch (e) {
        // console.log("ipInfo", e)
        return `未知地区`
    }
}
