const {NodeSSH} = require('node-ssh')
const ssh = new NodeSSH()
const config = require('../utils/config-ssh')
const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerStatus(req, res, next) {
    try {
        const url = `${ROOT_URL}/query`
        const status = await axios.get(url, {params: {query: 'up{job="prometheus"}'}})
        const objResponse = {}
        status.data.data.result.map((data) => {
            objResponse.up = data.value[1]
        })
        await ssh.connect(config).then(function() {
            ssh.execCommand("uptime -p").then(function(result) {
                if (result.stderr) {
                    console.log('stderr:', result.stderr)
                } else {
                    objResponse.serverUptime = result.stdout.replace("up ", "")
                    return res.status(200).json({
                        status: 200,
                        message: "success",
                        data: objResponse
                    })
                }
            })
        })
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

async function postServerStatus(req, res, next) {
    try {
        await ssh.connect(config).then(function() {
            ssh.execCommand(`echo "ubuntu" | sudo -S systemctl ${req.body.command} prometheus`, [], {stdin: 'ubuntu\n', pty: true}).then(function(result) {
                if(req.body.command == "stop") {
                    res.status(200).json({
                        status: 200,
                        message: "Success",
                        data: {
                            result: "Server inactive"
                        }
                    })
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

module.exports = {
    getServerStatus,
    postServerStatus
}