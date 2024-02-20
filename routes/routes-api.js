const express = require('express')
const controller = require('../controllers/index')

function routesApi() {
    const router = express.Router()

    router.get("/server/status", controller.serverStatus)

    router.get("/server/average-memory", controller.serverAvgMemory)

    router.get("/server/cpu-util", controller.serverCpuUtil)

    return router
}

module.exports = routesApi