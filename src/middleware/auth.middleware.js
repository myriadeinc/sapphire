'use strict';
const TokenService = require('src/services/token.service.js');
const config = require('src/util/config.js');
const AuthMiddleware = {

  authenticateSharedSecret: (req, res, next) => {
    if (req.headers.authorization
        && req.headers.authorization.split(' ')[0] === 'SharedSecret'
        && config.get('service:shared_secret') ===
              req.headers.authorization.split(' ')[1]
    ) {
      next();
    } else {
      res.sendStatus(403);
    }
  },

  authenticateUser: (req, res, next) => {
    let tokenString;
    // check authorization header
    if (req.headers.authorization
            && req.headers.authorization.split(' ')[0] === 'Bearer') {
      tokenString = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      // check query param
      tokenString = req.query.token;
      // strip it out so it doesn't get mixed in by other query param consumers
      delete req.query.token;
    }

    if (!tokenString) {
      res.sendStatus(403);
    }

    return TokenService.decodeAndVerify(tokenString)
        .then((token) => {
          req.accountId = token.sub;
          req.token = token;
          next();
        })
        .catch((err) => {
          res.status(403).send(err);
        });
  },
};

module.exports = AuthMiddleware;
