const { sudoExecScript } = require("./sudoUtils")

function sudoCallSetHosts(hosts) {
    sudoExecScript("setHosts.js", hosts)
}

module.exports = sudoCallSetHosts
