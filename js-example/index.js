// Copyright 2020 Nym Technologies SA
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


import {
    NymClient,
    set_panic_hook
} from "@nymproject/nym-client-wasm"


// current limitation of rust-wasm for async stuff : (
let client = null
let pasteNymClientId = "8hcLscXVwQLiRTFXFQ59XXkdJbi3DJ24TU3cTNBDAYsZ.ET8T5nQiThcyaVeh8k7JMxoaKnsCEwR39wjEj7cCMM1t@EmksoVk8Q7RZZH8atvZspDShD7Ekq6vDPnjK4LCQ7DUv"

async function main() {

    // sets up better stack traces in case of in-rust panics
    set_panic_hook();

    // validator server we will use to get topology from
    const validator = "https://validator.nymtech.net/api";

    client = new NymClient(validator);

    const on_message = (msg) => displayReceived(msg);
    const on_connect = () => console.log("Established (and authenticated) gateway connection!");

    client.set_on_message(on_message);
    client.set_on_gateway_connect(on_connect);

    // this is current limitation of wasm in rust - for async methods you can't take self my reference...
    // I'm trying to figure out if I can somehow hack my way around it, but for time being you have to re-assign
    // the object (it's the same one)
    client = await client.initial_setup();

    const self_address = client.self_address();

        displaySenderAddress(self_address);

        const sendButton = document.querySelector('#send-button');
        sendButton.onclick = function () {
            sendMessageTo('newText');
        }
         document.getElementById("send-button").disabled = false;

}

/**
 * Create a Sphinx packet and send it to the mixnet through the gateway node.
 * 
 * Message and recipient are taken from the values in the user interface.
 *
 * @param {Client} nymClient the nym client to use for message sending
 */
async function sendMessageTo(cmd) {

    let elementMessage = "";
    let message = "";

    elementMessage = document.getElementById("message");
    message = client.self_address()+"/"+cmd+"/"+elementMessage.value;

    console.log(message)
    client = await client.send_message(message, pasteNymClientId);
    //displaySend(message);
}

/**
 * Display received text messages in the browser. Colour them green.
 *
 * @param {string} message
 */
function displayReceived(message) {
    const content = message.message;
    const replySurb = message.replySurb
    let hostname = ""
   if (window.location.port.length > 0){
      hostname = window.location.hostname+':'+window.location.port
   } else {
      hostname = window.location.hostname
   }

   const urlBasePaste = 'http://'+hostname+'/paste.html?'
   
    if (content.length > 0) {
        window.location.href = urlBasePaste+content;
    }else{

    let paragraphContent = "Error try again"
    document.getElementById("output").innerHTML = paragraphContent
    }
}


/**
 * Display the nymClient's sender address in the user interface
 *
 * @param {Client} nymClient
 */
function displaySenderAddress(address) {
    document.getElementById("sender").value = address;
}

// Let's get started!
main();
