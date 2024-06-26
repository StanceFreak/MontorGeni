const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on("error", (err) => {
    console.error(err)
})

async function storeCpuUtils(interval) {
    try {
        const objValues = {}
        const url = `${ROOT_URL}/query`
        //for testing 
        const cpuUtil = await axios.get(url, {params: {query: `(1-(avg by(instance)(rate(otel_system_cpu_time_seconds_total{state="idle"}[${interval}m])))) * 100`}})
        // for prod
        // const cpuUtil = await axios.get(url, {params: {query: '100 - (avg by (instance) (rate(node_cpu_seconds_total{job="node-exporter", mode="idle"}[1m])) * 100)'}})
        if (cpuUtil.data.data.result.length > 0) {
            cpuUtil.data.data.result.map((data) => {
                const unixTime = new Date(data.value[0] * 1000)
                objValues.value = data.value[1]
                objValues.date = unixTime.toLocaleDateString('en-GB')
                objValues.time = unixTime.toLocaleTimeString('en-GB')
            })
            const cpuValues = Object.values(objValues)
            let cpuData = {
                value: cpuValues[0],
                date: cpuValues[1],
                time: cpuValues[2]
            }
            pool.getConnection(function (err, conn) {
                if (err) throw err
                conn.query(`INSERT INTO cpu_util SET ?;`, [cpuData])
                conn.release()
            })
        } else {
            const unixTime = new Date()
            objValues.value = 0.0
            objValues.date = unixTime.toLocaleDateString('en-GB')
            objValues.time = unixTime.toLocaleTimeString('en-GB')
            const cpuValues = Object.values(objValues)
            let emptyData = {
                value: cpuValues[0].toFixed(1),
                date: cpuValues[1],
                time: cpuValues[2]
            }
            pool.getConnection(function (err, conn) {
                if (err) throw err
                conn.query(`INSERT INTO cpu_util SET ?;`, [emptyData])
                conn.release()
            })
        }
    } catch (error) {
        const objValues = {}
        const unixTime = new Date()
        objValues.value = 0.0
        objValues.date = unixTime.toLocaleDateString('en-GB')
        objValues.time = unixTime.toLocaleTimeString('en-GB')
        const cpuValues = Object.values(objValues)
        let emptyData = {
            value: cpuValues[0].toFixed(1),
            date: cpuValues[1],
            time: cpuValues[2]
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(`INSERT INTO cpu_util SET ?;`, [emptyData])
            conn.release()
        })
        console.log(`Server error: ${error.message}`)
    }
}

async function storeMemUtils(interval) {
    try {
        const objValues = {}
        const url = `${ROOT_URL}/query`
        const avgMemTotal = await axios.get(url, {params: {query: `avg_over_time(node_memory_MemTotal_bytes{instance="localhost:9100"}[${interval}m])`}})
        const avgMemFree = await axios.get(url, {params: {query: `avg_over_time(node_memory_MemFree_bytes{instance="localhost:9100"}[${interval}m])`}})
        const avgMemCached = await axios.get(url, {params: {query: `avg_over_time(node_memory_Cached_bytes{instance="localhost:9100"}[${interval}m])`}})
        const avgMemBuffers = await axios.get(url, {params: {query: `avg_over_time(node_memory_Buffers_bytes{instance="localhost:9100"}[${interval}m])`}})
        if (avgMemTotal.data.data.result.length > 0 || avgMemFree.data.data.result.length > 0 ||
            avgMemCached.data.data.result.length > 0 || avgMemBuffers.data.data.result.length > 0
        ) {
            avgMemTotal.data.data.result.map((data) => {
                const calc = parseInt(data.value[1])
                objValues.memTotals = calc
            })
            avgMemFree.data.data.result.map((data) => {
                const calc = parseInt(data.value[1])
                objValues.memFree = calc
            })
            avgMemCached.data.data.result.map((data) => {
                const calc = parseInt(data.value[1])
                objValues.memCached = calc
            })
            avgMemBuffers.data.data.result.map((data) => {
                const calc = parseInt(data.value[1])  
                const unixTime = new Date(data.value[0] * 1000)
                objValues.memBuffers = calc
                objValues.date = unixTime.toLocaleDateString('en-GB')
                objValues.time = unixTime.toLocaleTimeString('en-GB')
            })
            const memValues = Object.values(objValues)
            const avgServerMemory = 100 * (1- ((memValues[1] + memValues[2] + memValues[3]) / memValues[0]))
            let memData = {
                value: avgServerMemory.toFixed(1),
                date: memValues[4],
                time: memValues[5]
            }
            pool.getConnection(function (err, conn) {
                if (err) throw err
                conn.query(`INSERT INTO mem_util SET ?;`, [memData])
                conn.release()
            })
        } else {
            const unixTime = new Date()
            objValues.value = 0.0
            objValues.date = unixTime.toLocaleDateString('en-GB')
            objValues.time = unixTime.toLocaleTimeString('en-GB')
            const memValues = Object.values(objValues)
            let emptyData = {
                value: memValues[0].toFixed(1),
                date: memValues[1],
                time: memValues[2]
            }
            pool.getConnection(function (err, conn) {
                if (err) throw err
                conn.query(`INSERT INTO mem_util SET ?;`, [emptyData])
                conn.release()
            })
        }
    } catch (error) {
        const objValues = {}
        const unixTime = new Date()
        objValues.value = 0.0
        objValues.date = unixTime.toLocaleDateString('en-GB')
        objValues.time = unixTime.toLocaleTimeString('en-GB')
        const memValues = Object.values(objValues)
        let emptyData = {
            value: memValues[0].toFixed(1),
            date: memValues[1],
            time: memValues[2]
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(`INSERT INTO mem_util SET ?;`, [emptyData])
            conn.release()
        })
        console.log(`Server error: ${error.message}`)
    }
}

async function storeNetLatency(interval) {
    try {
        const url = `${ROOT_URL}/query`
        const objValues = {}
        const serverLatency = await axios.get(url, {params: {query: `avg_over_time(probe_icmp_duration_seconds{phase="rtt", instance="8.8.8.8"}[${interval}m]) * 1000`}})
        if (serverLatency.data.data.result.length > 0) {
            serverLatency.data.data.result.map((data) => {
                const latency = parseFloat(data.value[1]).toFixed(1)
                const unixTime = new Date(data.value[0] * 1000)
                objValues.value = latency
                objValues.date = unixTime.toLocaleDateString('en-GB')
                objValues.time = unixTime.toLocaleTimeString('en-GB')
            })
            const latencyValues = Object.values(objValues)
            let latencyData = {
                value: latencyValues[0],
                date: latencyValues[1],
                time: latencyValues[2]
            }
            pool.getConnection(function (err, conn) {
                if (err) throw err
                conn.query(`INSERT INTO net_latency SET ?;`, [latencyData])
                conn.release()
            })
        } else {
            const unixTime = new Date()
            objValues.value = 0.0
            objValues.date = unixTime.toLocaleDateString('en-GB')
            objValues.time = unixTime.toLocaleTimeString('en-GB')
            const latencyValues = Object.values(objValues)
            let emptyData = {
                value: latencyValues[0].toFixed(1),
                date: latencyValues[1],
                time: latencyValues[2]
            }
            pool.getConnection(function (err, conn) {
                if (err) throw err
                conn.query(`INSERT INTO net_latency SET ?;`, [emptyData])
                conn.release()
            })
        }
    } catch (error) {
        const objValues = {}
        const unixTime = new Date()
        objValues.value = 0.0
        objValues.date = unixTime.toLocaleDateString('en-GB')
        objValues.time = unixTime.toLocaleTimeString('en-GB')
        const latencyValues = Object.values(objValues)
        let emptyData = {
            value: latencyValues[0].toFixed(1),
            date: latencyValues[1],
            time: latencyValues[2]
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(`INSERT INTO net_latency SET ?;`, [emptyData])
            conn.release()
        })
        console.log(`Server error: ${error.message}`)
    }
}

module.exports = {
    storeCpuUtils,
    storeMemUtils,
    storeNetLatency
}