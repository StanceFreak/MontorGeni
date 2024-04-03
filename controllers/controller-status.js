const {NodeSSH} = require('node-ssh')
const ssh = new NodeSSH()
const config = require('../utils/config-ssh')

async function getServerStatus(req, res, next) {
    try {
        const objResponse = {}
        ssh.connect(config).then(function() {
            ssh.execCommand("uptime -p").then(function(result) {
                if (result.stderr) {
                    console.log('stderr:', result.stderr)
                } else {
                    objResponse.serverUptime = result.stdout.slice(3, -1)
                    const responseValues = Object.values(objResponse)
                    return res.status(200).json({
                        status: 200,
                        message: "success",
                        data: {
                            uptime: responseValues[0]
                        }
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