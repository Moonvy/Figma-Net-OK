const ora = require("ora")
const chalk = require("chalk")
const host2ips = require("./host2ips")
const raceIps = require("./raceIps")

const DNSServers = [
    { ip: "8.8.8.8", name: "Google DNS" },
    { ip: "180.76.76.76", name: "百度 DNS" },
    { ip: "223.5.5.5", name: "阿里 DNS", fast: true },
    { ip: "114.114.114.114", name: "114 DNS", fast: true },
    { ip: "1.1.1.1", name: "Cloudflare DNS", fast: true },
    { ip: "9.9.9.9", name: "Quad9 DNS" },
    { ip: "119.29.29.29", name: "腾讯 DNS" },
    { ip: "4.2.2.1", name: "level3.net" },
]

const Hostnames = [
    {
        hostname: "s3-alpha-sig.figma.com",
        testUrl: "https://s3-alpha.figma.com/profile/9b3f693e-0677-4743-89ff-822b9f6b72be",
    },
    {
        hostname: "www.figma.com",
        testUrl: "https://www.figma.com/api/community_categories/all?page_size=10",
    },
    {
        hostname: "static.figma.com",
        testUrl: "https://static.figma.com/app/icon/1/icon-192.png",
    },
]

module.exports = async function getBestHosts(mode) {
    let dnsList = DNSServers.filter((x) => (mode === "fast" ? x.fast : true))
    global.spinner = ora("🐌").start()

    let bestHost = []

    let i = 0
    let len = Hostnames.length
    for (const host of Hostnames) {
        i++
        let nowP = chalk.gray(`[${i}/${len}] `)
        let ips = []
        for (const dnsServer of dnsList) {
            ips.push(...(await host2ips(host.hostname, dnsServer.ip, dnsServer.name)))
        }
        spinner.info(`${nowP}${chalk.blueBright(host.hostname)}\t\t找到 ${ips.length} 个服务器`)

        let bestIp = await raceIps(host.testUrl, ips)

        spinner.info(
            `${nowP}${chalk.greenBright(host.hostname)}\t\t最佳服务器: ${bestIp.ip} - ${bestIp.ipInfo} - ${
                bestIp.time
            }ms`
        )

        if (bestIp.ip && bestIp.time) {
            bestHost.push({ hostname: host.hostname, ip: bestIp.ip })
        }
    }

    spinner.succeed(`完毕`)

    console.log(chalk.green("\n\n在此时对于你最佳的 Host 配置是：\n"))
    console.log(bestHost.map((x) => `${x.ip}     ${x.hostname}`).join("\n"))
    console.log("\n\n")

    return bestHost
}
