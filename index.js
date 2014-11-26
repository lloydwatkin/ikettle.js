'use strict';

var discover = require('./lib/discover')
  , log = require('debug')('index')
  , EventEmitter = require('events').EventEmitter

var kettle = null

var iKettle = new EventEmitter()

iKettle.KETTLE_NOT_CONNECTED = 'kettle-not-connected'

iKettle.errors = {
    '-1': 'Improper command format',
    '-2': 'Command not supported',
    '-3': 'Improper operationa symbol',
    '-4': 'Improper parameter',
    '-5': 'Not permitted',
    '-6': 'Lack of memory',
    '-7': 'Flash memory error',
    '-10': 'Join failed',
    '-11': 'No available socket',
    '-12': 'Improper socket value',
    '-13': 'Socket connection failed',
    '-100': 'Undefined'
}

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
    kettle.once('data', function(data) {
        console.log(data)
    })
    console.log('getting stauts')
    kettle.write('get sys status\n')
})

iKettle.on('keep-warm', function(time, callback) {
    if (!kettle) {
        return callback(this.KETTLE_NOT_CONNECTED)
    }
    var key = null
    switch (time) {
        case 5:
            key = '0x8005'
            break
    }
    if (!key) {
        return calback(this.INVALID_KEEP_WARM_TIME)
    }
    kettle.once('data', function(data) {
        if (-1 === data.indexOf(key)) {
            return callback('some error')
        }
        callback(null, true)
    })
    // 5 minute keep warm time
    
    kettle.write('set sys output ' + key + '\r')  
})

module.exports = iKettle