'use strict';

const merge = require('webpack-merge');
const credentials = require('./cred.env');
const prodEnv = require('./prod.env');

module.exports = merge(
  prodEnv,
  Object.assign({}, credentials, {
    NODE_ENV: '"development"'
  })
);
