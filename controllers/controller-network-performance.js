const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)
const csvWriter = require('csv-writer')
const dateFormat = require('date-and-time')
const fs = require('fs')

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
        if (req.query.interval.includes('1')) {
            query = `SELECT * FROM net_latency WHERE created_at BETWEEN CURDATE() - INTERVAL 1 DAY AND CURDATE() - INTERVAL 1 SECOND`
        } else if (req.query.interval.includes('today')) {
            query = `SELECT * FROM net_latency WHERE created_at >= CURDATE()`
        }
        else {
            query = `SELECT * FROM net_latency WHERE created_at BETWEEN CURDATE() - INTERVAL ${req.query.interval} day AND CURDATE() - INTERVAL ${req.query.interval - 1} day`
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

async function downloadLatencyRecords(req, res, next) {
    try {
        var query = ''
        if (req.query.interval.includes('1')) {
            query = `SELECT * FROM net_latency WHERE created_at BETWEEN CURDATE() - INTERVAL 1 DAY AND CURDATE() - INTERVAL 1 SECOND`
        } else if (req.query.interval.includes('today')) {
            query = `SELECT * FROM net_latency WHERE created_at >= CURDATE()`
        }
        else {
            query = `SELECT * FROM net_latency WHERE created_at BETWEEN CURDATE() - INTERVAL ${req.query.interval} day AND CURDATE() - INTERVAL ${req.query.interval - 1} day`
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(
                query,
                function (error, results) {
                    if (error) throw error
                    const date = new Date()
                    const currentTime = dateFormat.format(date, "DDMMYYYY_HHmm")
                    const filePath = `./file/LAT_RECORD_${currentTime}.csv`
                    const csvCreate = csvWriter.createObjectCsvWriter({
                        path: filePath,
                        header: [
                            {id: "id", title: "Id"}, 
                            {id: "value", title: "Value"}, 
                            {id: "time", title: "Time"}, 
                            {id: "date", title: "Date"},
                            {id: "created_at", title: "Created At"}, 
                        ]
                    })
                    try {
                        if (fs.existsSync("./file")) {
                            csvCreate.writeRecords(results)
                            .then(() => {
                                return res.status(200).json(
                                    {
                                        status: 200,
                                        message: "success",
                                        // testing
                                        // data: `http://localhost:3100/records/LAT_RECORD_${currentTime}.csv`
                                        // prod
                                        data: `http://146.190.99.85:3100/records/LAT_RECORD_${currentTime}.csv`
                                    }
                                )
                            })
                        }
                        else {
                            fs.mkdirSync("./file/", true)
                            csvCreate.writeRecords(results)
                            .then(() => {
                                return res.status(200).json(
                                    {
                                        status: 200,
                                        message: "success",
                                        // testing
                                        // data: `http://localhost:3100/records/LAT_RECORD_${currentTime}.csv`
                                        // prod
                                        data: `http://146.190.99.85:3100/records/LAT_RECORD_${currentTime}.csv`
                                    }
                                )
                            })
                        }
                    } catch (error) {
                        res.status(400)
                        next(Error(error.message))
                    }
                }
            )
            conn.release()
        })
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

module.exports = {
    getNetworkPacketLoss,
    getNetworkLatencyRecord,
    downloadLatencyRecords
}