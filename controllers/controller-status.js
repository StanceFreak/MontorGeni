const {NodeSSH} = require('node-ssh')
const ssh = new NodeSSH()
const config = require('../utils/config-ssh')
const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const {performance} = require('perf_hooks')

async function getServerStatus(req, res, next) {
    try {
        const startTime = performance.now()
        const url = `${ROOT_URL}/query`
        const status = await axios.get(url, {params: {query: 'up{job="prometheus"}'}})
        const objResponse = {}
        status.data.data.result.map((data) => {
            objResponse.up = data.value[1]
        })
        const endTime = performance.now()
        const execTime = endTime - startTime
        console.log(`server status delay log: ${execTime.toFixed(1)}ms`)
        return res.status(200).json({
            status: 200,
            message: "success",
            data: objResponse
        })
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

async function postServerStatus(req, res, next) {
    try {
        const startTime = performance.now()
        await ssh.connect(config).then(function() {
            // ssh.execCommand(`echo "ubuntu" | sudo -S systemctl ${req.body.command} prometheus`, [], {stdin: 'ubuntu\n', pty: true}).then(function(result) {
            ssh.execCommand(`systemctl ${req.body.command} prometheus`, [], {stdin: 'ubuntu\n', pty: true}).then(function(result) {
                if(req.body.command == "stop") {
                    res.status(200).json({
                        status: 200,
                        message: "Success",
                        data: {
                            result: "Server inactive"
                        }
                    })
                    const endTime = performance.now()
                    const execTime = endTime - startTime
                    console.log(`stop service delay log: ${execTime.toFixed(1)}ms`)
                }
                else if (req.body.command == "restart") {
                    res.status(200).json(
                        {
                            status: 200,
                            message: "Success",
                            data: {
                                result: "Server restarted"
                            }
                        }
                    )
                    const endTime = performance.now()
                    const execTime = endTime - startTime
                    console.log(`restart service delay log: ${execTime.toFixed(1)}ms`)
                }
                else if (req.body.command == "start") {
                    res.status(200).json(
                        {
                            status: 200,
                            message: "Success",
                            data: {
                                result: "Server is running"
                            }
                        }
                    )
                    const endTime = performance.now()
                    const execTime = endTime - startTime
                    console.log(`start service delay log: ${execTime.toFixed(1)}ms`)
                }
                else {
                    console.log("Command not found")
                }
            })
        })
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

async function getServerUptime(req, res, next) {
    try {
        const startTime = performance.now()
        await ssh.connect(config).then(function() {
            ssh.execCommand("uptime -p").then(function(result) {
                if (result.stderr) {
                    console.log('stderr:', result.stderr)
                } else {
                    const endTime = performance.now()
                    const execTime = endTime - startTime
                    console.log(`start service delay log: ${execTime.toFixed(1)}ms`)
                    return res.status(200).json({
                        status: 200,
                        message: "success",
                        data: {
                            uptime: result.stdout.replace("up ", "")
                        }
                    })
                }
            })
        })
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

module.exports = {
    getServerStatus,
    postServerStatus,
    getServerUptime
}