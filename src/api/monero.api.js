'use strict';
const config = require('src/util/config.js');
const logger = require('src/util/logger.js');
const axios = require('axios');

function send_rpc(method, params) {
  return axios({
    //url: `http://${config.get('monero:daemon:host')}:${config.get('monero:daemon:port')}/json_rpc`,
    url: "http://daemon.myriade.io/json_rpc",
    method: 'post',
    data: {
      "json_rpc": "2.0",
      "id": "0",
      "method": method,
      "params": params,
    }
  })
      .then((res) => {
        return res.data.result;
      });
};

const MoneroApi = {
getCurrentBlockHeight: () => {
    return send_rpc('get_height', {}).height;
},
getFullBlockReward: (blockHeight) => {
     return send_rpc('get_block_header_by_height', {"height": blockHeight})
     .then((result) => {
        return result.block_header.reward;
     });
 },
 /**
  * @Todo Add proper base block reward calculation
  * @param BigInt blockHeight 
  */
 getBaseBlockReward: (blockHeight) => {
  return send_rpc('get_block_header_by_height', {"height": blockHeight})
  .then((result) => {
     return result.block_header.reward;
  });
},
 getNetworkHashrate: (blockHeight) => {
  return send_rpc('get_block_header_by_height', {"height": blockHeight})
  .then((result)=>{
    /* Hashrate = Difficulty*Share / time and 120s is block cycle length*/
    return BigInt(result.block_header.difficulty)/120n;
  });
 },
  /**
    * @description gets the header of the last block : promisified
    * @return {object} Returns the header of the last block promisified
    */
  getLastBlockHeader: () =>  {
    return send_rpc('getlastblockheader', {});
  },
  /**
    * @description Submit a block to the daemon
    * @param {object} buffer Shared buffer constructed with xmr utilities
    */
  submit: (buffer) => {
    return send_rpc('submitblock', [buffer.toString('hex')]);
  },


}

module.exports = MoneroApi;
