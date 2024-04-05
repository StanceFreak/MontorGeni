const {getServerStatus, postServerStatus} = require("./controller-status")
const serverAvgMemory = require("./controller-memory")
const {getServerCpuUtilRecord, getServerCpuUtil} = require("./controller-cpu-util")
const getServerNetworkIo = require("./controller-network-io")
const getServerDiskRw = require("./controller-disk-rw")
const {getNetworkPacketLoss, getNetworkLatency} = require("./controller-network-performance")

module.exports = {
    getServerStatus,
    postServerStatus,
    serverAvgMemory,
    getServerCpuUtilRecord,
    getServerCpuUtil,
    getServerNetworkIo,
    getServerDiskRw,
    getNetworkPacketLoss,
    getNetworkLatency
}