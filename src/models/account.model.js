'use strict';

const _ = require('lodash');
const DB = require('src/util/db.js');

const AccountModel = DB.sequelize.define('Accounts', {
  id: {
    type: DB.Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },

  externalId: {
    type: DB.Sequelize.UUID,
    defaultValue: DB.Sequelize.UUIDV4,
    allowNull: false,
    unique: true,
  },

  balance: {
    type: DB.Sequelize.BIGINT,
    defaultValue: 0,
    allowNull: false,
  },

  email: {
    type: DB.Sequelize.TEXT,
    allowNull: false,
    unique: true,
    set: function(val) {
      this.setDataValue('email', AccountModel.cleanEmail(val));
    },
  },

  credential: {
    type: DB.Sequelize.JSONB,
    allowNull: false,
    defaultValue: {},
  },

  wallet_address: {
    type: DB.Sequelize.STRING,
    allowNull: false,
  },

  name: {
    type: DB.Sequelize.TEXT,
    set: function(val) {
      this.setDataValue('name', AccountModel.cleanName(val));
    },
    get: function() {
      let name = this.getDataValue('name');
      if (name) {
        return name;
      } else {
        name = [
          this.getDataValue('firstName'),
          this.getDataValue('lastName'),
        ]
            .filter((n) => {
              return !!n;
            })
            .join(' ');

        if (name) return name;
      }
      return null;
    },
  },

  firstName: {
    type: DB.Sequelize.TEXT,
    set: function(val) {
      this.setDataValue('firstName', AccountModel.cleanName(val));
    },
    get: function() {
      const name = this.getDataValue('name');
      const firstName = this.getDataValue('firstName');
      const lastName = this.getDataValue('lastName');
      if (firstName) {
        return firstName;
      }
      if (name && lastName && name.endsWith(lastName)) {
        return name.slice(0, -lastName.length).trim();
      }
      if (name) {
        return name.split(' ').shift();
      }
      return null;
    },
  },

  lastName: {
    type: DB.Sequelize.TEXT,
    set: function(val) {
      this.setDataValue('lastName', AccountModel.cleanName(val));
    },
    get: function() {
      const name = this.getDataValue('name');
      const firstName = this.getDataValue('firstName');
      const lastName = this.getDataValue('lastName');
      if (lastName) {
        return lastName;
      }
      if (name && firstName && name.startsWith(firstName)) {
        return name.slice(firstName.length).trim();
      }
      if (name) {
        /*eslint-disable */
        const [_firstName, ...rest] = name.split(' ');
        /* eslint-enable*/
        return rest.join(' ');
      }
      return null;
    },
  },
}, {
  paranoid: false,
});

AccountModel.cleanEmail = (email) => {
  if (!_.isString(email)) {
    throw new Error('email must be a string');
  }
  return email.trim().toLowerCase();
};

AccountModel.cleanName = (name) => {
  if (name === null || name === undefined) {
    return name;
  }
  if (!_.isString(name)) {
    throw new Error('name must be a string or null');
  }

  return name.trim();
};

AccountModel.validFields = ['email', 'name',
  'firstName', 'lastName', 'phoneNumber',
  'gender', 'birthday', 'credential', 'wallet_address',
];

AccountModel.prototype.toJSON = function(unsafe = false) {
  if (unsafe === true) {
    return _.clone(this.get({plain: true}));
  }

  const self = this;
  const json = [
    'name', 'firstName', 'lastName',
    'wallet_address',
  ]
      .map((key) => {
        return [key, self.get(key)];
      })
      .filter(([field, value]) => {
        return !!value;
      })
      .reduce((acc, [key, value]) => {
        return {...acc, [key]: value};
      }, {});

  json.id = this.get('externalId');

  return json;
};

module.exports = AccountModel;
