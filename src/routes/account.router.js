'use strict';

/*eslint-disable */
const router = require('express').Router();
/* eslint-enable */
const {check} = require('express-validator');

const AccountService = require('src/services/accounts.service.js');
const EmailVerificationMiddleware =
    require('src/middleware/email.validation.middleware.js');
const RequestValidationMiddleware =
    require('src/middleware/request.validation.middleware.js');
const AuthMiddleware = require('src/middleware/auth.middleware.js');

const TokenService = require('src/services/token.service.js');

router.post('/create',
    [
      check('email_token').exists(),
      check('password').exists(),
    ],
    RequestValidationMiddleware.handleErrors,
    EmailVerificationMiddleware.validateToken,
    (req, res) => {
      return AccountService.createAccount(req.body)
          .then((acc) => {
            res.status(200).send(acc);
          })
          .catch((err) => {
            res.sendStatus(500);
          });
    });

router.post('/login',
    [
      check('email').exists().isEmail(),
      check('password').exists(),
    ],
    RequestValidationMiddleware.handleErrors,
    (req, res) => {
      return AccountService.validatePassword(req.body.email, req.body.password)
          .then((acc) => {
            return TokenService.createAccessToken(acc);
          })
          .then((tok) => {
            res.status(200).send({
              accessToken: tok,
            });
          })
          .catch((err) => {
            res.status(500).send(err);
          });
    }
);

router.post('/address-login',
    [
      check('address').exists(),
      check('email').exists().isEmail(),
    ],
    RequestValidationMiddleware.handleErrors,
    AuthMiddleware.authenticateSharedSecret,
    (req, res) => {
      return AccountService.validateStrantum(req.body.address, req.body.email)
          .then((acc) => {
            return TokenService.createAccessToken(acc.toJSON());
          })
          .then((tok) => {
            res.status(200).send({
              accessToken: tok,
            });
          })
          .catch((err) => {
            res.status(500).send(err);
          });
    }
);

router.get(`/:accountId`,
    AuthMiddleware.authenticateUser,
    (req, res) => {
      return AccountService.getAccount(req.accountId)
          .then((acc) => {
            res.status(200).send(acc.toJSON());
          })
          .catch((err) => {
            res.sendStatus(404);
          });
    });

router.put(`/:accountId`,
    AuthMiddleware.authenticateUser,
    (req, res) => {
      return AccountService.updateAccount(req.accountId, req.body)
          .then((acc) => {
            res.status(200).send(acc.toJSON());
          })
          .catch((err) => {
            res.sendStatus(500);
          });
    });

router.delete(`/:accountId`,
    AuthMiddleware.authenticateUser,
    (req, res) => {
      return AccountService.deleteAccount(req.accountId)
          .then(() => {
            res.sendStatus(200);
          })
          .catch((err) => {
            res.sendStatus(404);
          });
    });


module.exports = router;
