const { start_node_1 } = require("./jecoin")

const PORT = parseInt(process.argv.slice(2)[0]);
const PEERS = [];
for(let i=0; i<PORT-3000; i++){
    PEERS.push("ws://localhost:" + ((PORT - i - 1).toString()))
}
const MY_ADDRESS = "ws://localhost:" + (PORT.toString());

// console.log(PORT, PEERS, MY_ADDRESS)

start_node_1(PORT, PEERS, MY_ADDRESS)

actions = []

