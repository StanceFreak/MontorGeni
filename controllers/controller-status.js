const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerStatus(req, res, next) {
    try {
        const url = `${ROOT_URL}/query`
        const status = await axios.get(url, {params: {query : 'up{job="node_exporter"}'}})
        return res.status(200).json(status.data)
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

module.exports = getServerStatus