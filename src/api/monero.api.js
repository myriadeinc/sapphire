"use strict";
const config = require("src/util/config.js");
const logger = require("src/util/logger.js").xmr;
const axios = require("axios");
// const moneroUrl = config.get("monero:daemon:host") || "daemon.myriade.io"
const  DEFAULT_REWARD = "1627091224764";
const  DEFAULT_DIFF = "161650163162";

const hosts = [
  'https://node.monerod.org/json_rpc',
  'http://node.melo.tools:18081/json_rpc',
  'http://xmr-node.cakewallet.com:18081',
  'http://node.monero.net:18081/json_rpc',
  'http://xmr.support:18081/json_rpc',
  'http://xmr-lux.boldsuck.org:38081/json_rpc'
]


const send_rpc =  async (method, parameters) => {
  for (let host of hosts) {
    try {
      logger.info(`Contacting monero rpc host ${host}`)
      const result = await axios.post(host, {
          "json_rpc": "2.0",
          "id": "1",
          "method": method,
          "params": parameters
        }
      )
      if (result) {
        return result.data
      }
      logger.error("Did not receive response")
      continue
    }catch(e){
      logger.error(e)
      continue
    }
  }
  throw new Error("Couldn't contact XMR Daemon") 


};


let blockHeight = 1;
const MoneroApi = {

  DEFAULT_BLOCK: {
    reward: DEFAULT_REWARD, difficulty: DEFAULT_DIFF
  },
  getCurrentBlockHeight: () => {
    return blockHeight;
  },
  updateBlockheight: (height) => {
    blockHeight = height;
    return height;
  },

  getBlockReward: async (blockHeight) => {
    try {
      const data = await send_rpc("get_block_header_by_height", { blockHeight })
      if (data.result) {
        return data.result.block_header.reward
      }
    } catch(e){
      logger.error(e)
    }
  },
  getBlockInfoByHeight: async (blockHeight, forceCalc = false) => {
    if(forceCalc) return MoneroApi.DEFAULT_BLOCK

    try {
      const data = await send_rpc("get_block", { height: blockHeight })
      if (data.result) {
        return data.result.block_header
      }
    } catch(e){
      logger.error(e)
      return MoneroApi.DEFAULT_BLOCK
    }


  },
  getInfo: async () => {

    try {
      const data = await send_rpc("get_info", {})
      if (data.result) {
        return data.result
      }
    } catch(e){
      logger.error(e)
      return 
    }

  },

  /**
   * @description gets the header of the last block : promisified
   * @return {object} Returns the header of the last block promisified
   */
  getLastBlockHeader: async () => {

    try {
      const data = await send_rpc("getlastblockheader", {})
      if (data.result) {
        return data.result
      }
    } catch(e){
      logger.error(e)
      return 
    }
  },
};

module.exports = MoneroApi;
