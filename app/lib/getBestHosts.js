const ora = require("ora")
const chalk = require("chalk")
const host2ips = require("./host2ips")
const { waitForSpinnerQueue } = require("./host2ips")
const raceIps = require("./raceIps")

const DNSServers = [
    // --- 本地 DNS ---
    { ip: null, name: "本地 DNS (系统默认)", fast: true },

    // --- 国内主流互联网巨头 ---
    { ip: "223.5.5.5", name: "阿里 DNS", fast: true },
    { ip: "223.6.6.6", name: "阿里 DNS (备用)", fast: true },
    { ip: "119.29.29.29", name: "腾讯 DNS (DNSPod)", fast: true },
    { ip: "119.28.28.28", name: "腾讯 DNS (备用)"},
    { ip: "180.184.1.1", name: "字节跳动 DNS (火山引擎)", fast: true },
    { ip: "180.184.2.2", name: "字节跳动 DNS (备用)"},
    { ip: "180.76.76.76", name: "百度 DNS" },

    // --- 专业/机构 DNS ---
    { ip: "114.114.114.114", name: "114 DNS", fast: true },
    { ip: "1.2.4.8", name: "CNNIC SDNS" },
    { ip: "210.2.4.8", name: "CNNIC SDNS (备用)" },
    { ip: "101.226.4.6", name: "360 安全 DNS" },
    { ip: "101.6.6.6", name: "清华大学 TUNA DNS" },

    // --- 海外主流 DNS (国内访问视网络情况而定) ---
    { ip: "8.8.8.8", name: "Google DNS" },
    { ip: "8.8.4.4", name: "Google DNS (备用)" },
    { ip: "1.1.1.1", name: "Cloudflare DNS" },
    { ip: "1.0.0.1", name: "Cloudflare DNS (备用)" },
    { ip: "9.9.9.9", name: "Quad9 DNS" },
    { ip: "4.2.2.1", name: "Level3 DNS" },

    // --- 运营商通用 DNS ---
    // --- 中国电信 (China Telecom) ---
    { ip: "202.96.128.86", name: "上海电信" },
    { ip: "202.106.0.20", name: "北京电信" },

    // --- 中国联通 (China Unicom) ---
    { ip: "202.106.196.115", name: "北京联通" },
    { ip: "210.22.84.3", name: "上海联通"},

    // --- 中国移动 (China Mobile) ---
    { ip: "211.136.192.6", name: "中国移动" },
    { ip: "211.136.112.50", name: "上海移动" },
    { ip: "211.136.17.107", name: "北京移动" },
]

const Hostnames = [
    {
        hostname: "s3-alpha-sig.figma.com",
        testUrl: "https://s3-alpha.figma.com/profile/9b3f693e-0677-4743-89ff-822b9f6b72be",
    },
    {
        hostname: "www.figma.com",
        testUrl: "https://www.figma.com/api/statsig/bootstrap?",
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
        // 并行请求不同 DNS 服务商
        let ips = (
            await Promise.all(
                dnsList.map((dnsServer) =>
                    // 单个 DNS 解析失败直接忽略
                    host2ips(host.hostname, dnsServer.ip, dnsServer.name).catch(() => [])
                )
            )
        ).flat()

        // 等待 spinner 队列清空
        await waitForSpinnerQueue()

        // 去重
        ips = Array.from(new Set(ips))
        spinner.info(`${nowP}${chalk.blueBright(host.hostname)}`.padEnd(50) + ` 找到 ${ips.length} 个服务器`)

        let bestIp = await raceIps(host.testUrl, ips)

        spinner.info(
            `${nowP}${chalk.greenBright(host.hostname)}`.padEnd(50) +
                ` 最佳服务器: ${bestIp.ip}`.padEnd(22) +
                `- ${bestIp.ipInfo} - ${Math.round(bestIp.time)}ms` +
                "\n"
        )

        if (bestIp.ip && bestIp.time) {
            bestHost.push({ hostname: host.hostname, ip: bestIp.ip })
        }
    }

    spinner.succeed(`完毕`)

    console.log(chalk.green("\n\n在此时对于你最佳的 Host 配置是：\n"))
    console.log(bestHost.map((x) => `${x.ip}`.padEnd(15) + ` ${x.hostname}`).join("\n"))
    console.log("\n\n")

    return bestHost
}
