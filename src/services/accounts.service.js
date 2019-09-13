'use strict';
const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('src/util/config.js');
const logger = require('src/util/logger.js').account;
const Err = require('src/util/error.js');
const AccountModel = require('src/models/account.model.js');

const hashPassword = (pwd) => {
  const numHashSaltRounds = Number(config.get('passwords:hash_salt_rounds'));
  return bcrypt.hash(pwd, numHashSaltRounds);
};

const omittedFields = [
  'externalId',
  'id',
  'createdAt',
  'updatedAt',
];

const AccountServices = {

  // CRUD
  createAccount: async (data) => {
    if (!data.password) {
      logger.error('Failed to submit the password field');
      throw new Err.Account();
    }
    const hashedPassword = await hashPassword(data.password);
    delete data.password;
    data.credential = {
      password: hashedPassword,
      hash: 'bcrypt',
    };
    const filteredData = _.pick(data, AccountModel.validFields);
    let acc;
    try {
      acc = await AccountModel.create(filteredData);
    } catch (err) {
      logger.error(err);
      throw new Err.Account();
    }
    return acc.toJSON();
  },

  getAccount: (accountId) => {
    return AccountModel.findOne({
      where: {
        externalId: accountId,
      },
    });
  },

  updateAccount: (accountId, data) => {
    data = _.omit(data, omittedFields);
    return AccountModel.update(
        data,
        {
          where: {
            externalId: accountId,
          },
        }
    )
        .then(() => {
          return AccountServices.getAccount(accountId);
        })
        .catch((err) => {
          logger.error(err);
          throw new Err.Account();
        });
  },

  deleteAccount: (accountId) => {
    return AccountsModel.destroy({
      where: {
        externalId: accountId,
      },
    });
  },

  // Account Service Ops

  /**
   * Check if email already exists
   * @param {string} email
   * @return {boolean}
   */
  emailExists: async (email) => {
    const account = await AccountModel.findOne({
      where: {
        email: email,
      },
    });
    if (account) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * Validate a pair of password and email, if successful returns account
   *    otherwise returns empty object
   * @param {string} email
   * @param {string} password
   * @return {object}
   */
  validatePassword: async (email, password) => {
    let account = await AccountModel.findOne({
      where: {
        email: email,
      },
    });
    let success = false;
    if (account && account.dataValues.credential
      && 'bcrypt' === account.dataValues.credential.hash) {
      success = await bcrypt.compare(
          password,
          account.dataValues.credential.password);
    }
    account = success ? account.toJSON() : {};
    return account;
  },

  validateStrantum: async (address, email) => {
    return await AccountModel.findOne({
      where: {
        email,
        wallet_address: address,
      },
    });
  },

};

module.exports = AccountServices;
