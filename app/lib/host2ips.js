const nslookup = require("nslookup")

/** 通过 DNS 解析域名的 IP, 返回 IP 列表 */
module.exports = async function host2ips(hostname, dnsServer, serverName) {
    spinner.start(`DNS [${hostname}] by ${serverName} (${dnsServer}) `)
    return await dnsLookup(hostname, dnsServer)
}

function dnsLookup(name, server = "8.8.8.8") {
    return new Promise((resolve, reject) => {
        nslookup(name)
            .server(server) // default is 8.8.8.8
            .timeout(3 * 1000) // default is 3 * 1000 ms
            .end(function (err, addrs) {
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
