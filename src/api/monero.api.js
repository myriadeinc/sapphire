"use strict";
const config = require("src/util/config.js");
const logger = require("src/util/logger.js").xmr;
const axios = require("axios");
const moneroUrl = config.get("monero:daemon:host") || "daemon.myriade.io"
const   DEFAULT_REWARD = "1627091224764";
const  DEFAULT_DIFF = "161650163162";
const send_rpc = (method, data) => {
  return axios({
    url: `http://${moneroUrl}/json_rpc`,
    method: "POST",
    data: {
      json_rpc: "2.0",
      id: "0",
      method,
      params: data,
    },
  }).then(({ data }) => {
    return data.result;
  }).catch(e => {
    logger.error(e) 
    return false
  });
};
let blockHeight = 1;
const MoneroApi = {

  DEFAULT_BLOCK: {
    reward: DEFAULT_REWARD, difficulty: DEFAULT_DIFF
  },
  getCurrentBlockHeight: () => {
    return blockHeight;
    // return send_rpc("get_height", {}).height;
  },
  updateBlockheight: (height) => {
    blockHeight = height;
    return height;
  },

  getBlockReward: (blockHeight) => {
    return send_rpc("get_block_header_by_height", { blockHeight }).then(
      (result) => {
        return result.block_header.reward;
      }
    );
  },
  getBlockInfoByHeight: (blockHeight, forceCalc = false) => {
    if(forceCalc) return MoneroApi.DEFAULT_BLOCK
    return send_rpc("get_block", { height: blockHeight })
    .then(result => {
        if (!result || result == undefined) throw new Error('No response!')
        return result.block_header;
    })
    .catch(e => {
      logger.error("Unable to fetch monero info!")
      logger.error(e)
      return MoneroApi.DEFAULT_BLOCK
    })
  },
  getInfo: () => {
    return send_rpc("get_info", {})
  },

  /**
   * @description gets the header of the last block : promisified
   * @return {object} Returns the header of the last block promisified
   */
  getLastBlockHeader: () => {
    return send_rpc("getlastblockheader", {});
  },
};

module.exports = MoneroApi;
