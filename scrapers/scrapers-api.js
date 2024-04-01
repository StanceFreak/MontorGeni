const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on("error", (err) => {
    console.error(err)
})

async function storeCpuUtils(req, res, next) {
    try {
        const objValues = {}
        const url = `${ROOT_URL}/query`
        const cpuUtil = await axios.get(url, {params: {query: '100 - (avg by (instance) (rate(node_cpu_seconds_total{job="node_exporter",mode="idle"}[1m])) * 100)'}})
        cpuUtil.data.data.result.map((data) => {
            const unixTime = new Date(data.value[0] * 1000)
            objValues.value = data.value[1]
            objValues.time = unixTime.toLocaleTimeString('en-GB')
        })
        const cpuValues = Object.values(objValues)
        let cpuData = {
            value: cpuValues[0],
            time: cpuValues[1]
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(`INSERT INTO cpu_util SET ?;`, [cpuData])
            conn.release()
        })
    } catch (error) {
        const objValues = {}
        const unixTime = new Date()
        objValues.value = 0.0
        objValues.time = unixTime.toLocaleTimeString('en-GB')
        const cpuValues = Object.values(objValues)
        let emptyData = {
            value: cpuValues[0],
            time: cpuValues[1]
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(`INSERT INTO cpu_util SET ?;`, [emptyData])
            conn.release()
        })
        console.log(`Server error: ${error.message}`)
    }
}

async function storeMemUtils() {
    try {
        const objValues = {}
        const url = `${ROOT_URL}/query`
        const avgMemTotal = await axios.get(url, {params: {query: 'avg_over_time(node_memory_MemTotal_bytes{instance="localhost:9100"}[1m])'}})
        const avgMemFree = await axios.get(url, {params: {query: 'avg_over_time(node_memory_MemFree_bytes{instance="localhost:9100"}[1m])'}})
        const avgMemCached = await axios.get(url, {params: {query: 'avg_over_time(node_memory_Cached_bytes{instance="localhost:9100"}[1m])'}})
        const avgMemBuffers = await axios.get(url, {params: {query: 'avg_over_time(node_memory_Buffers_bytes{instance="localhost:9100"}[1m])'}})
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
            objValues.date = unixTime.toLocaleTimeString('en-GB')
        })
        const memValues = Object.values(objValues)
        const avgServerMemory = 100 * (1- ((memValues[1] + memValues[2] + memValues[3]) / memValues[0]))
        let memData = {
            value: avgServerMemory.toFixed(2),
            time: memValues[4]
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(`INSERT INTO mem_util SET ?;`, [memData])
            conn.release()
        })
    } catch (error) {
        const objValues = {}
        const unixTime = new Date()
        objValues.value = 0.0
        objValues.time = unixTime.toLocaleTimeString('en-GB')
        const cpuValues = Object.values(objValues)
        let emptyData = {
            value: cpuValues[0],
            time: cpuValues[1]
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(`INSERT INTO mem_util SET ?;`, [emptyData])
            conn.release()
        })
        console.log(`Server error: ${error.message}`)
    }
}

async function storeNetLatency(req, res, next) {
    try {
        const url = `${ROOT_URL}/query`
        const objValues = {}
        const serverLatency = await axios.get(url, {params: {query: 'sum(probe_icmp_duration_seconds{phase="rtt", instance="10.33.109.200"}) * 1000'}})
        serverLatency.data.data.result.map((data) => {
            const latency = parseFloat(data.value[1]).toFixed(1)
            const unixTime = new Date(data.value[0] * 1000)
            objValues.value = latency
            objValues.date = unixTime.toLocaleTimeString('en-GB')
        })
        const latencyValues = Object.values(objValues)
        let latencyData = {
            value: latencyValues[0],
            time: latencyValues[1]
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(`INSERT INTO net_latency SET ?;`, [latencyData])
            conn.release()
        })
    } catch (error) {
        const objValues = {}
        const unixTime = new Date()
        objValues.value = 0.0
        objValues.time = unixTime.toLocaleTimeString('en-GB')
        const latencyValues = Object.values(objValues)
        let emptyData = {
            value: latencyValues[0],
            time: latencyValues[1]
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