'use strict';

var discover = require('./lib/discover')
  , log = require('debug')('index')

discover(function(error, kettles) {
    if (error) {
        log(error)
    } else {
        log('Found kettle!')
    }
})