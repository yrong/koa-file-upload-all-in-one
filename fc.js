const util = require("./util")
const fs = require('fs')
const rp = require('request-promise')
const _ = require('lodash')
const IpfsApi = require('ipfs-api')
const Web3 = require('web3')
const SimpleStorageContract = require('./build/contracts/SimpleStorage.json')
const contract = require('truffle-contract')

module.exports = (options) => {
    const ipfs = IpfsApi({host: options.ipfs.api_host, port: options.ipfs.api_port, protocol: 'http'})
    const web3 = new Web3(new Web3.providers.HttpProvider(`http://${options.web3.host}:${options.web3.port}`))
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(web3.currentProvider)
    return {
        put: async (filename, file, ctx) => {
            await util.fileResolve(file)
            let buffer = fs.readFileSync(file.path)
            let response = await ipfs.add(buffer)
            let fileHash = response[0].hash
            console.log(`${filename} write to ipfs`)
            let userId = ctx.token_user?ctx.token_user.uuid:''
            let contractInstance = await simpleStorage.at(options.web3.publish_contract_address)
            let publishTime = new Date().getTime()
            await contractInstance.set(fileHash,userId,publishTime,{from: options.web3.account_address,gas:options.web3.publish_contract_gas_limit})
            console.log('file metaInfo written into block chain!');
            return fileHash
        },
        get: async (result) => {
            Object.keys(result).map(filename => {
                let value = result[filename]
                return result[filename] = {fileHash:value.fileId,fileUrl:encodeURI(`http://${options.ipfs.api_host}:${options.ipfs.gateway_port}/ipfs/${value.fileId}`)}
            })
            return result
        }
    }

}