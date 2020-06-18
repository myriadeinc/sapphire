"use strict";

const _ = require("lodash");
const jwt = require("jsonwebtoken");

const config = require("src/util/config.js");
const logger = require("src/util/logger.js").account;
const decodeAndVerify = (token) => {
  return new Promise((resolve, reject) => {
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, config.get("diamond:public_key"));
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

  validateMinerId: (req, res, next) => {
    let tokenString;
    // check authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      tokenString = req.headers.authorization.split(" ")[1];
    } else if (req.query.token) {
      // check query param
      tokenString = req.query.token;
      // strip it out so it doesn't get mixed in by other query param consumers
      delete req.query.token;
    }
    if (config.get("debugMode")) {
      // Bypass JWT auth with debug temporarily
      return next();
    }

    if (!tokenString) {
      logger.error("Failed authentication: no JWT token provided");
      return res.sendStatus(403);
    }

    return decodeAndVerify(tokenString)
      .then((token) => {
        req.body.variables.minerId = token.sub;
        req.token = token;
        return next();
      })
      .catch((err) => {
        logger.error(`Failed authentication for ${tokenString} : ${err}`);
        return res.sendStatus(403);
      });
  },
};

module.exports = AuthMiddleware;
