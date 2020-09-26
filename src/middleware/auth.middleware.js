"use strict";
const _ = require("lodash");
const jwt = require("jsonwebtoken");

const config = require("src/util/config.js");
const logger = require("src/util/logger.js").account;

const decodeAndVerify = (token) => {
  return new Promise((resolve, reject) => {
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, config.get("diamond:public_key").trim(), { algorithms: ['RS256'] });
    } catch (err) {
      return reject(err);
    }
    return resolve(_.omit(decodedToken, ["iat", "jti"]));
  });
};

const AuthMiddleware = {
  authenticateSharedSecret: (req, res, next) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "SharedSecret" &&
      config.get("service:shared_secret") ===
      req.headers.authorization.split(" ")[1]
    ) {
      next();
    } else {
      logger.error(`Failed login attempt for shared secret`);
      res.sendStatus(403);
    }
  },
  authenticateGodMode: (req, res, next) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "GodMode" &&
      config.get("service:god_mode") ===
      req.headers.authorization.split(" ")[1]
    ) {
      next();
    } else {
      logger.error(`Failed login attempt for god mode`);
      res.sendStatus(403);
    }
  },

  validateMinerId: (req, res, next) => {
    let tokenString;
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      tokenString = req.headers.authorization.split(" ")[1];
    } else if (req.query.token) {
      tokenString = req.query.token;
      // Strip it out so it doesn't get mixed in by other query param consumers
      delete req.query.token;
    }
    if (!tokenString) {
      logger.error("Failed authentication: no JWT token provided");
      return res.sendStatus(403);
    }

    return decodeAndVerify(tokenString)
      .then(token => {
        req.body.minerId = token.sub;
        req.token = token;
        return next();
      })
      .catch(err => {
        logger.error(`Failed authentication for ${tokenString} : ${err}`);
        return res.sendStatus(403);
      });
  },
};

module.exports = AuthMiddleware;
