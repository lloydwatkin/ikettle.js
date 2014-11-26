'use strict';

var discover = require('./lib/discover')
  , log = require('debug')('index')
  , EventEmitter = require('events').EventEmitter

var kettle = null

var iKettle = new EventEmitter()

iKettle.KETTLE_NOT_CONNECTED = 'kettle-not-connected'

iKettle.on('discover', function(callback) {
    var discoverStartTime = new Date().getTime()
    discover(function(error, socket) {
        if (error) {
            log(error)
            return callback(error)
        }
        var discoveryTime = (new Date().getTime() - discoverStartTime) / 1000
        log('Found kettle! Discovery took ' + discoveryTime + ' seconds')
        kettle = socket
        callback(null, true)
    })
})

iKettle.on('status', function(callback) {
    if (!kettle) {
        return callback(this.KETTLE_NOT_CONNECTED)
    }
})

module.exports = iKettle