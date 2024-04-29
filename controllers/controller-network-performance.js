const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)

async function getNetworkPacketLoss(req, res, next) {
    try {
        const url = `${ROOT_URL}/query`
        const objValues = {}
        const serverPacketLoss = await axios.get(url, {params: {query: '100 - (increase(smokeping_response_duration_seconds_count[1m]) / increase(smokeping_requests_total[1m]) * 100)'}})
        serverPacketLoss.data.data.result.map((data) => {
            const pl = parseFloat(data.value[1]).toFixed(1)
            const unixTime = new Date(data.value[0] * 1000)
            objValues.value = pl
            objValues.time = unixTime.toLocaleTimeString('en-GB')
        })
        const plValues = Object.values(objValues)
        return res.status(200).json({
            status: 200,
            message: "success",
            data: {
                packetLoss: plValues[0],
                time: plValues[1]
            }
        })
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

async function getNetworkLatencyRecord(req, res, next) {
    try {
        var query = ''
        if (req.query.interval.includes(' day')) {
            query = `SELECT * FROM net_latency WHERE created_at BETWEEN CURDATE() - INTERVAL ${req.query.interval} AND CURDATE() - INTERVAL 1 SECOND`
        } else if (req.query.interval.includes('today')) {
            query = `SELECT * FROM net_latency WHERE created_at >= CURDATE()`
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(
                query,
                function (error, results) {
                    if (error) throw error
                    res.status(200).json(
                        {
                            status: 200,
                            message: "success",
                            data: results
                        }
                    )
                }
            )
            conn.release()
        })
    } catch (error) {
        res.status(400)
        next(Error(err.message))
    }
}

module.exports = {
    getNetworkPacketLoss,
    getNetworkLatencyRecord
}