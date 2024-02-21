const serverStatus = require("./controller-status")
const serverAvgMemory = require("./controller-memory")
const serverCpuUtil = require("./controller-cpu-util")
const serverNetworkIo = require("./controller-network-io")

module.exports = {
    serverStatus,
    serverAvgMemory,
    serverCpuUtil,
    serverNetworkIo
}