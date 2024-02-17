const axios = require('axios')
const { request } = require('express')
const {ROOT_URL} = require('../utils/options')

async function getServerStatus(req, res) {
    try {
        const url = `${ROOT_URL}/query`
        const status = await axios.put(url, {"query" : 'up{job="node_exporter"}'})
        return res.status(200).json(status.data)
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

module.exports = {
    getServerStatus
}