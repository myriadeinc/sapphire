'use strict';

/*eslint-disable */
const router = require('express').Router();
/* eslint-enable */
const {check, validationResult} = require('express-validator');


const EmailVerificationService =
        require('src/services/email.verification.service.js');

router.post('/',
    [
    // username must be an email
      check('email').exists().isEmail(),
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }
      const recipient = req.body.email;
      EmailVerificationService.verifyEmail(recipient)
          .then((valid) => {
            if (valid) {
              res.status(200).send('Email Confirmation Sent');
            } else {
              res.status(400).send(`Email ${recipient} is already in use`);
            }
          });
    });

module.exports = router;
