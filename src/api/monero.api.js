'use strict';
const config = require('src/util/config.js');
const logger = require('src/util/logger.js');
const axios = require('axios');

const send_rpc = (method, data) => {
  return axios({
    url: `http://${config.get('monero:daemon:host')}:${config.get('monero:daemon:port')}/json_rpc`,
    method: 'post',
    data: {
      json_rpc: '2.0',
      id: '0',
      method,
      params: data,
    },
  })
      .then(({data}) =>{
        return data.result;
      });
};

class MoneroApi {
getCurrentBlockHeight(){
    return send_rpc('get_height', {}).height;
}

 getBlockReward(blockHeight) {
     return send_rpc('get_block_header_by_height', {blockHeight})
     .then((result) => {
        return result.block_header.reward;
     });
 }

  /**
    * @description gets the header of the last block : promisified
    * @return {object} Returns the header of the last block promisified
    */
  getLastBlockHeader() {
    return send_rpc('getlastblockheader', {});
  }

  /**
    * @description Submit a block to the daemon
    * @param {object} buffer Shared buffer constructed with xmr utilities
    */
  submit(buffer) {
    return send_rpc('submitblock', [buffer.toString('hex')]);
  }
}

module.exports = MoneroApi;
