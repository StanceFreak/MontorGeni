const {getServerStatus, postServerStatus, getServerUptime} = require("./controller-status")
const {getServerAvgMemory, getServerMemUtilRecord} = require("./controller-memory")
const {getServerCpuUtilRecord, getServerCpuUtil} = require("./controller-cpu-util")
const {getServerNetworkIo, getServerNetworkRt} = require("./controller-network-io")
const {getServerDiskUtil, getServerDiskRw, getServerDiskUsage} = require("./controller-disk-rw")
const {getNetworkPacketLoss, getNetworkLatencyRecord} = require("./controller-network-performance")
const {getNotifRecord, registerDevice} = require("./controller-notif")

module.exports = {
    getServerStatus,
    postServerStatus,
    getServerUptime,
    getServerAvgMemory,
    getServerMemUtilRecord,
    getServerCpuUtilRecord,
    getServerCpuUtil,
    getServerNetworkIo,
    getServerNetworkRt,
    getServerDiskUtil,
    getServerDiskRw,
    getServerDiskUsage,
    getNetworkPacketLoss,
    getNetworkLatencyRecord,
    getNotifRecord,
    registerDevice
}