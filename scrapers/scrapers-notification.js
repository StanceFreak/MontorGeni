const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)
const admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.cert('./serviceAccountKey.json')
})

pool.on("error", (err) => {
    console.error(err)
})

async function notifScraper(type) {
    const url = `${ROOT_URL}/query`
    const objValues = {}
    switch (type) {
        case 'memoryUsage':
            try {
                pool.getConnection(function (err, conn) {
                    if (err) throw err
                    conn.query(
                        'select * from mem_util order by id desc limit 1;',
                        function (error, results) {
                            if (error) throw error
                            const memUsage = results[0].value
                            if (memUsage >= 50.0 && memUsage <= 70.0) {
                                const notif = {
                                    notification: {
                                        title: "[Warning] Server high memory usage",
                                        body: `Memory usage is at ${memUsage}%`,
                                    },
                                    android: {
                                        notification: {
                                            channelId: "101",
                                            tag: "memUsage"
                                        }
                                    },
                                    topic: "all"
                                }
                                storeNotif(
                                    "[Warning] Server high memory usage",
                                    `Memory usage is at ${memUsage}%`,
                                )
                                admin.messaging().send(notif)
                            }
                            else if(memUsage > 70.0) {
                                const notif = {
                                    notification: {
                                        title: "[Critical] Server high memory usage",
                                        body: `Memory usage is at ${memUsage}%`,
                                    },
                                    android: {
                                        notification: {
                                            channelId: "101",
                                            tag: "memUsage"
                                        }
                                    },
                                    topic: "all"
                                }
                                storeNotif(
                                    "[Critical] Server high memory usage",
                                    `Memory usage is at ${memUsage}%`,
                                )
                                admin.messaging().send(notif)
                            }
                        }
                    )
                    conn.release()
                })
            } catch (error) {
                console.log(`Memory alert error: ${error.message}`)
            }
            break;
        case 'diskUsage':
            try {
                const objValues = {}
                const url = `${ROOT_URL}/query`
                const diskUsage = await axios.get(url, {params: {query: 'round(100 - ((node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} * 100) / node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"}))'}})
                diskUsage.data.data.result.map((data) => {
                    objValues.value = data.value[1]
                })
                const diskValues = Object.values(objValues)
                const usageValue = diskValues[0]
                if (usageValue >= 50.0 && usageValue <= 70.0) {
                    const notif = {
                        notification: {
                            title: "[Warning] Server high disk usage",
                            body: `Disk usage is at ${usageValue}%`,
                        },
                        android: {
                            notification: {
                                channelId: "102",
                                tag: "diskUsage"
                            }
                        },
                        topic: "all"
                    }
                    storeNotif(
                        "[Warning] Server high disk usage",
                        `Disk usage is at ${usageValue}%`,
                    )
                    admin.messaging().send(notif)
                } else if (usageValue > 70.0) {
                    const notif = {
                        notification: {
                            title: "[Citical] Server high disk usage",
                            body: `Disk usage is at ${usageValue}%`,
                        },
                        android: {
                            notification: {
                                channelId: "102",
                                tag: "diskUsage"
                            }
                        },
                        topic: "all"
                    }
                    storeNotif(
                        "[Citical] Server high disk usage",
                        `Disk usage is at ${usageValue}%`,
                    )
                    admin.messaging().send(notif)
                }
            } catch (error) {
                console.log(`Disk alert error: ${error.message}`)
            }
            break;
        case 'cpuUsage':
            try {
                pool.getConnection(function (err, conn) {
                    if (err) throw err
                    conn.query(
                        'select * from cpu_util order by id desc limit 1;',
                        function (error, results) {
                            if (error) throw error
                            const cpuUsage = results[0].value
                            if (cpuUsage >= 30.0 && cpuUsage <= 70.0) {
                                const notif = {
                                    notification: {
                                        title: "[Warning] Server high CPU usage",
                                        body: `CPU usage is at ${cpuUsage}%`,
                                    },
                                    android: {
                                        notification: {
                                            channelId: "103",
                                            tag: "cpuUsage"
                                        }
                                    },
                                    topic: "all"
                                }
                                storeNotif(
                                    "[Warning] Server high CPU usage",
                                    `CPU usage is at ${cpuUsage}%`,
                                )
                                admin.messaging().send(notif)
                            }
                            else if(cpuUsage > 70.0) {
                                const notif = {
                                    notification: {
                                        title: "[Critical] Server high CPU usage",
                                        body: `CPU usage is at ${cpuUsage}%`,
                                    },
                                    android: {
                                        notification: {
                                            channelId: "103",
                                            tag: "cpuUsage"
                                        }
                                    },
                                    topic: "all"
                                }
                                storeNotif(
                                    "[Critical] Server high CPU usage",
                                    `CPU usage is at ${cpuUsage}%`, 
                                )
                                admin.messaging().send(notif)
                            }
                        }
                    )
                    conn.release()
                })
            } catch (error) {
                console.log(`CPU alert error: ${error.message}`)
            }
            break;
        case 'serviceDown':
            try {
                const tempApiResponse = []
                const apiResponse = []
                const instanceStatus = await axios.get(url, {params: {query: 'up == 0'}})
                instanceStatus.data.data.result.map((data) => {
                    tempApiResponse.push({data})
                })
                let mergeObj = []
                for(item in tempApiResponse) {
                    const unixTime = new Date(tempApiResponse[item].data.value[0]*1000)
                    apiResponse.push({
                        job: tempApiResponse[item].data.metric.job,
                        status: [{
                            instance: tempApiResponse[item].data.metric.instance,
                            value: tempApiResponse[item].data.value[1]
                        }]
                    })
                }
                mergeObj = apiResponse.reduce((obj, item) => {
                    obj[item.job] ? obj[item.job].status.push(...item.status) : (obj[item.job] = { ...item })
                    return obj
                }, {})
                const finalObj = Object.values(mergeObj)
                if (finalObj.length > 0) {
                    const notif = {
                        notification: {
                            title: `[Critical] ${finalObj.length} server instances down`,
                            body: `You may need to check the instance on the server`,
                        },
                        android: {
                            notification: {
                                channelId: "104",
                                tag: "instanceDown"
                            }
                        },
                        topic: "all"
                    }
                    storeNotif(
                        `[Critical] ${finalObj.length} server instances down`,
                        `You may need to check the instance on the server`,
                    )
                    admin.messaging().send(notif)
                }
            } catch (error) {
                // for prod
                if (error.message == "connect ECONNREFUSED 128.199.135.220:9090") {
                // for test
                // if (error.message == "connect ECONNREFUSED 127.0.0.1:9090") {
                    const notif = {
                        notification: {
                            title: `[Critical] Error connecting to Prometheus`,
                            body: `Server can't connect to the Prometheus`,
                        },
                        android: {
                            notification: {
                                channelId: "104",
                                tag: "prometheusDown"
                            }
                        },
                        topic: "all"
                    }
                    storeNotif(
                        `[Critical] Error connecting to Prometheus`,
                        `Server can't connect to the Prometheus`,
                    )
                    admin.messaging().send(notif)
                }
            }
            break;
    }
}

async function storeNotif(notifTitle, notifBody) {
    try {
        const date = new Date()
        const currentTime = date.toLocaleTimeString('en-GB')
        const currentDate = date.toLocaleDateString('en-GB')
        let notifData = {
            title: notifTitle,
            body: notifBody,
            time: currentTime,
            date: currentDate
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(`INSERT INTO notif_alert SET ?;`, [notifData])
            conn.release()
        })
    } catch (error) {
        console.log(`MySQL error: ${error.message}`)
    }
}

module.exports = notifScraper