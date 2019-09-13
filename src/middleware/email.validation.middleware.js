'use strict';

const encryption = require('src/util/encryption.js');

const EmailValidationMiddleware = {
  validateToken: (req, res, next) => {
    if (req.body.email) {
      delete req.body.email;
    }
    const email = encryption.decrypt(req.body.email_token);
    req.body.email = email;
    next();
  },
};

module.exports = EmailValidationMiddleware;
