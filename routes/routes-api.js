const express = require('express')
const controller = require('../controllers/index')

function routesApi() {
    const router = express.Router()

    router.get("/server/status", controller.getServerStatus)

    router.post("/server/change-status", controller.postServerStatus)

    router.post("/server/notification/device/register", controller.registerDevice)

    router.get("/server/uptime", controller.getServerUptime)

    router.get("/server/average-memory", controller.getServerAvgMemory)

    router.get("/server/cpu-util/record?:interval", controller.getServerCpuUtilRecord)

    router.get("/server/memory-util/record?:interval", controller.getServerMemUtilRecord)

    router.get("/server/net-latency/record?:interval", controller.getNetworkLatencyRecord)

    router.get("/server/notifications/record", controller.getNotifRecord)

    router.get("/server/cpu-util", controller.getServerCpuUtil)

    router.get("/server/network-util", controller.getServerNetworkIo)

    router.get("/server/network-util/total", controller.getServerNetworkRt)

    router.get("/server/disk-util", controller.getServerDiskUtil)

    router.get("/server/disk-util/total", controller.getServerDiskRw)

    router.get("/server/disk-util/usage", controller.getServerDiskUsage)

    router.get("/server/network/performance/packet-loss", controller.getNetworkPacketLoss)

    router.get("/server/cpu-util/download/record?:interval", controller.downloadCpuRecords)

    router.get("/server/mem-util/download/record?:interval", controller.downloadMemoryRecords)

    router.get("/server/net-latency/download/record?:interval", controller.downloadLatencyRecords)

    return router
}

module.exports = routesApi