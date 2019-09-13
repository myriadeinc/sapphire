'use strict';
const NodeRSA = require('node-rsa');
const config = require('src/util/config.js');

const key = new NodeRSA(config.get('jwt:private_key'));
const encryption = {

  encrypt: (str) => {
    return key.encrypt(str, 'base64');
  },

  decrypt: (cypher) => {
    return key.decrypt(cypher, 'utf-8');
  },
};

module.exports = encryption;
