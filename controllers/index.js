const {getServerStatus, postServerStatus} = require("./controller-status")
const {getServerAvgMemory, getServerMemUtilRecord} = require("./controller-memory")
const {getServerCpuUtilRecord, getServerCpuUtil} = require("./controller-cpu-util")
const {getServerNetworkIo, getServerNetworkRt} = require("./controller-network-io")
const {getServerDiskUtil, getServerDiskRw} = require("./controller-disk-rw")
const {getNetworkPacketLoss, getNetworkLatencyRecord} = require("./controller-network-performance")

module.exports = {
    getServerStatus,
    postServerStatus,
    getServerAvgMemory,
    getServerMemUtilRecord,
    getServerCpuUtilRecord,
    getServerCpuUtil,
    getServerNetworkIo,
    getServerNetworkRt,
    getServerDiskUtil,
    getServerDiskRw,
    getNetworkPacketLoss,
    getNetworkLatencyRecord
}