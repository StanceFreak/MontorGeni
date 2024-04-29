const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on("error", (err) => {
    console.error(err)
})

async function getServerAvgMemory(req, res, next) {
    try {
        // get root endpoint from options.js file and merge it with the additional /query for api calls
        const url = `${ROOT_URL}/query`
        // create new object for storing the object values from api response
        const objValues = {}
        // http request using axios library with query params for the api calls to prometheus api
        const avgMemTotal = await axios.get(url, {params: {query: 'avg_over_time(node_memory_MemTotal_bytes[1m])'}})
        const avgMemFree = await axios.get(url, {params: {query: 'avg_over_time(node_memory_MemFree_bytes[1m])'}})
        const avgMemCached = await axios.get(url, {params: {query: 'avg_over_time(node_memory_Cached_bytes[1m])'}})
        const avgMemBuffers = await axios.get(url, {params: {query: 'avg_over_time(node_memory_Buffers_bytes[1m])'}})
        const memAvailable = await axios.get(url, {params: {query: 'avg_over_time(node_memory_MemAvailable_bytes[1m])'}})
        // mapping the array of objects for getting the values and add that value to the objValues Object
        avgMemTotal.data.data.result.map((data) => {
            const calc = parseFloat(data.value[1])
            objValues.memTotals = calc
        })
        avgMemFree.data.data.result.map((data) => {
            const calc = parseFloat(data.value[1])
            objValues.memFree = calc
        })
        avgMemCached.data.data.result.map((data) => {
            const calc = parseFloat(data.value[1])
            objValues.memCached = calc
        })
        avgMemBuffers.data.data.result.map((data) => {
            const calc = parseFloat(data.value[1])
            objValues.memBuffers = calc
        })
        memAvailable.data.data.result.map((data) => {
            const unixTime = new Date(data.value[0] * 1000)
            const calc = parseFloat(data.value[1])
            objValues.memAvailable = calc
            objValues.date = unixTime.toLocaleTimeString('en-GB')
        })
        // getting the values only from the objValues Object
        const memValues = Object.values(objValues)
        // calculate all of the values using below formula for the average memory usage in percent
        const avgServerMemory = 100 * (1- ((memValues[1] + memValues[2] + memValues[3]) / memValues[0]))
        return res.status(200).json(
            {
                status: 200,
                message: "success",
                data: {
                    memoryUsage: parseInt(avgServerMemory.toFixed(2)),
                    memoryTotal: memValues[0].toFixed(1),
                    memoryAvailable: memValues[4].toFixed(1),
                    time: memValues[5]
                }
            }
        )
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

async function getServerMemUtilRecord(req, res, next) {
    try {
        var query = ''
        if (req.query.interval.includes(' day')) {
            query = `SELECT * FROM mem_util WHERE created_at BETWEEN CURDATE() - INTERVAL ${req.query.interval} AND CURDATE() - INTERVAL 1 SECOND`
        } else if (req.query.interval.includes('today')) {
            query = `SELECT * FROM mem_util WHERE created_at >= CURDATE()`
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
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

module.exports = {
    getServerAvgMemory,
    getServerMemUtilRecord
}