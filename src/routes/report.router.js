'use strict';

/*eslint-disable */
const router = require('express').Router();

/* eslint-enable */
const {check} = require('express-validator');

const RequestValidationMiddleware =
    require('src/middleware/request.validation.middleware.js');

router.post('/',
    [
      check('uuid').exists(),
      check('hashrate').exists(),
      check('magic')
          .exists()
          .custom(({req})=>{
            req.body.magic == 'sipping';// process.env.SECRET_MYRIADE
          }),
      check('timestamp').exists(),
      check('numShares').exists(),
    ],
    RequestValidationMiddleware.handleErrors,
    (req, res) => {
      console.log('Recording data' );

      return res.sendStatus(200);
    });


module.exports = router;
