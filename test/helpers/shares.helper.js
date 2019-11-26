'use strict';
const testing = require('../test.init.js');
const uuid = require('uuid/v4');
const ShareModel = require('src/models/share.model.js');

const time1 = Date.now()
const time2 = Date.now() + 100
const time3 = Date.now() + 1000
const time4 = Date.now() + 5000

const SharesHelper = {

  sampleShares: [
    {
      time: time1,
      difficulty: 10123213,
      share: 1,
      is_calulated: false
    },
    {
      time: time2,
      difficulty: 1000000,
      share: 2,
      is_calulated: false
    },
    {
      time: time3,
      difficulty: 1000000,
      share: 3,
      is_calulated: false
    },
    {
      time: time4,
      difficulty: 1000000,
      share: 4,
      is_calulated: false
    },
  ],

  createSampleShares: (shares) => {
    return Promise.all(shares.map(s => {
      return ShareModel.create(s);
    }))
  }
}

module.exports = {
  ...SharesHelper, 
  time1, 
  time2, 
  time3, 
  time4
};