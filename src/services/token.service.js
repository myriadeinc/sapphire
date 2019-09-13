'use strict';

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const config = require('src/util/config.js');

const TokenService = {

  encodeAndSign: (data, options) => {
    return jwt.sign(data, config.get('jwt:private_key'), _.extend({}, options, {
      algorithm: config.get('jwt:algorithm'),
      jwtid: uuid.v4(),
      issuer: config.get('service:name'),
    }));
  },

  decodeAndVerify: (token) => {
    return new Promise((resolve, reject) => {
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, config.get('jwt:public_key'));
      } catch (err) {
        return reject(err);
      }
      return resolve(_.omit(decodedToken, ['iat', 'jti']));
    });
  },

  createAccessToken: (account) => {
    const expiry = config.get('jwt:expiry');
    return TokenService.encodeAndSign({
      version: 1,
      account: {
        email: account.email,
        name: account.name,
        address: account.wallet_address,
      },

    }, {
      expiresIn: parseInt(expiry.access_token),
      subject: account.id,
    });
  },
};

module.exports = TokenService;
