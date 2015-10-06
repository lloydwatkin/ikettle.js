'use strict';

var discover = require('./lib/discover' ).discover
  , log = require('debug')('index')
  , EventEmitter = require('events').EventEmitter

var iKettle = function() {
    this.KETTLE_NOT_CONNECTED = 'kettle-not-connected'
    this.CR = String.fromCharCode(0x0d)
}

iKettle.prototype = new EventEmitter()

iKettle.prototype.errors = {
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

iKettle.prototype._checkCall = function(callback) {
    if (this.kettle) {
        return true
    }
    if (!callback) {
        this.emit('error', this.KETTLE_NOT_CONNECTED)
    } else {
        callback(this.KETTLE_NOT_CONNECTED)
    }
    return false
}

iKettle.prototype.discover = function(callback) {
    var discoverStartTime = new Date().getTime()
    var self = this
    discover(function(error, socket) {
        self._discovered(error, socket, discoverStartTime, callback)
    })
}

iKettle.prototype._discovered = function(error, socket, discoverStartTime, callback) {
    if (error) {
        log(error)
        return callback(error)
    }
    this.kettle = socket
    this._setupListeners()
    var discoveryTime = (new Date().getTime() - discoverStartTime)
    log(
        'Found kettle! Discovery took ' +
        (discoveryTime / 1000) +
        ' seconds'
    )
    callback(null, true)
}

iKettle.prototype._setupListeners = function() {
    this.kettle.on('data', this._handleData.bind(this))
}

iKettle.prototype._handleStatus = function(code) {
    log('Status', code)
}

iKettle.prototype._handleData = function(data) {
    log('incoming socket data', data)
    if (-1 !== data.indexOf('sys status key')) {
        return this._handleStatus(data.split('=')[1])
    }
    var code = data.toString('ascii').replace('\r', '').split(' ')
    if (code[2] && code[2].match(/[0-9]*x[0-9]*/)) {
        switch (code[2]) {
          case '0x0':
              log('Kettle off')
              this.emit('off')
              break
          case '0x1':
              this.emit('removed')
              break
          case '0x2':
              this.emit('overheat')
              break
          case '0x3':
              this.emit('boiled')
              break
          case '0x4':
              this.emit('keep-warm-expired')
              break
          case '0x5':
              log('Emitting boiling')
              this.emit('boiling')
              break
          case '0x10':
              this.emit('keep-warm', false)
              break
          case '0x11':
              this.emit('keep-warm', true)
              break
          case '0x65':
              this.emit('temperature', 65)
              break
          case '0x80':
              this.emit('temperature', 80)
              break
          case '0x95':
              this.emit('temperature', 95)
              break
          case '0x100':
              this.emit('temperature', 100)
              break
          case '0x8005':
              this.emit('keep-warm-time', 5 * 60 * 1000)
              break
          case '0x8010':
              this.emit('keep-warm-time', 10 * 60 * 1000)
              break
          case '0x8020':
              this.emit('keep-warm-time', 20 * 60 * 1000)
              break
        }
    } 
}

iKettle.prototype.getStatus = function(callback) {
    if (!this._checkCall(callback)) return
    log('Getting kettle status')
    this.kettle.write('get sys status' + this.CR, function() {
        if (callback) callback()
    })
}

iKettle.prototype.boil = function(callback) {
    if (!this._checkCall(callback)) return
    this.kettle.write('set sys output 0x4' + this.CR, function() {
        if (callback) callback()
    })
}

iKettle.prototype.off = function(callback) {
    if (!this._checkCall(callback)) return
    this.kettle.write('set sys output 0x0' + this.CR, function() {
        if (callback) callback()
    })
}

iKettle.prototype.setTemperature = function(temperature, callback) {
    if (!this._checkCall(callback)) return
    var code = null
    switch (temperature) {
      case 100:
        code = '0x80'
        break
      case 95:
         code = '0x2'
         break
      case 80:
        code = '0x4000'
        break
      case 65:
        code = '0x200'
        break
    }
    if (!code) {
      callback(
        'Invalid temperature provided, ' +
        'valid values: 100, 95, 80, 65'
      )
    }
    log('Setting temperature to ' + temperature)
    var command = 'set sys output ' + code + this.CR
    this.kettle.write(command, function() {
      callback()
    })      
}

iKettle.prototype.keepWarm = function(callback) {
    if (!this._checkCall(callback)) return
    this.kettle.write('set sys output 0x8' + this.CR, function() {
        if (callback) callback()
    })
}

iKettle.prototype.setKeepWarmTime = function(time, callback) {
    if (!this._checkCall(callback)) return
    time = time / 60000
    var key = null
    switch (time) {
        case 5:
            key = '0x8005'
            break
        case 10:
            key = '0x8010'
            break
        case 20:
            key = '0x8020'
            break
    }
    if (!key) {
        return callback(this.INVALID_KEEP_WARM_TIME)
    }
    this.kettle.write('set sys output ' + key + this.CR)  
}

module.exports = iKettle
