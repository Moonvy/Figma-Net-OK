const nslookup = require("nslookup")
const axios = require("axios")
const ping = require("ping")
const dns = require("dns")

//

dnsList("ap-web-1-oversea.agora.io")

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

    console.log("dnsList", name, allAddrs)
}


function dnsLookup(name, server = "8.8.8.8") {

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