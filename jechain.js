"use strict";

const crypto = require("crypto"), SHA256 = message => crypto.createHash("sha256").update(message).digest("hex");
const EC = require("elliptic").ec, ec = new EC("secp256k1");
const MINT_PRIVATE_ADDRESS = "0700a1ad28a20e5b2a517c00242d3e25a88d84bf54dce9e1733e6096e6d6495e";
const MINT_KEY_PAIR = ec.keyFromPrivate(MINT_PRIVATE_ADDRESS, "hex");
const MINT_PUBLIC_ADDRESS = MINT_KEY_PAIR.getPublic("hex");

class Block {
    constructor(timestamp = Date.now().toString(), data = []) {
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = "";
        this.nonce = 0;
        this.hash = Block.getHash(this);
    }

    static getHash(block) {
        return SHA256(block.prevHash + block.timestamp + JSON.stringify(block.data) + block.nonce);
    }

    mine(difficulty) {
        while (!this.hash.startsWith(Array(difficulty + 1).join("0"))) {
            this.nonce++;
            this.hash = Block.getHash(this);
        }
    }

    static hasValidUserData(block, chain) {
        return (
            block.data.every(user_data => UserData.isValid(user_data, chain))
        );
    }
}

class Blockchain {
    constructor() {
        const initalCoinRelease = new UserData(MINT_PUBLIC_ADDRESS, 1668413948380, {});
        this.array_user_data = [];
        this.chain = [new Block("", [initalCoinRelease])];
        this.difficulty = 3;
        this.chain[0].mine(this.difficulty)
        this.blockTime = 30000;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(block) {
        block.prevHash = this.getLastBlock().hash;
        block.hash = Block.getHash(block);
        block.mine(this.difficulty);
        this.chain.push(Object.freeze(block));

        this.difficulty += Date.now() - parseInt(this.getLastBlock().timestamp) < this.blockTime ? 1 : -1;
    }

    addUserData(user_data) {
        if (UserData.isValid(user_data, this)) {
            this.array_user_data.push(user_data);
        }
    }

    mineUserData(rewardAddress) {
        const blockUserData = [...this.array_user_data];
        if (this.array_user_data.length !== 0) this.addBlock(new Block(Date.now().toString(), blockUserData));
        this.array_user_data.splice(0, blockUserData.length);
        console.log(this.array_user_data)
    }

    getLatestInfo(address){
        latestInfo = null
        this.chain.forEach(block => {
            block.data.forEach(user_data => {
                if(user_data.uid === address){
                    latestInfo = user_data
                }
            })
        })
        return latestInfo;
    }

    getBalance(address) {
        let balance = 0;
        return balance;
    }

    static isValid(blockchain) {
        for (let i = 1; i < blockchain.chain.length; i++) {
            const currentBlock = blockchain.chain[i];
            const prevBlock = blockchain.chain[i-1];

            if (
                currentBlock.hash !== Block.getHash(currentBlock) || 
                prevBlock.hash !== currentBlock.prevHash || 
                !Block.hasValidUserData(currentBlock, blockchain)
            ) {
                return false;
            }
        }

        return true;
    }
}

class UserData { 
    constructor(uid, timestamp, data) { 
        this.uid = uid;
        this.timestamp = timestamp;
        this.data = data;
    } 
 
    sign(keyPair) { 
        if (keyPair.getPublic("hex") === this.uid) {
            this.signature = keyPair.sign(SHA256(this.uid + this.timestamp.toString() + JSON.stringify(this.data)), "base64").toDER("hex"); 
        } 
    } 
 
    static isValid(tx, chain) {
        return ( 
            tx.uid &&
            tx.timestamp &&
            tx.data &&
            ec.keyFromPublic(tx.uid, "hex").verify(SHA256(tx.uid + tx.timestamp.toString() + JSON.stringify(tx.data)), tx.signature)
        )
    }
} 

const JeChain = new Blockchain();

module.exports = { Block, UserData, Blockchain, JeChain };