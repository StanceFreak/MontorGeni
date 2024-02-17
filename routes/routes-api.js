const express = require('express')
const controller = require('../controllers/index')

function routesApi() {
    const router = express.Router()

    router.get("/server/status", controller.serverStatus)

    return router
}

module.exports = routesApi