'use strict';

var nmap    = require('node-libnmap')
  , Socket = require('net').Socket
  , log       = require('debug')('discover')
  , debug = require('debug')('discover:debug')

var options = {}
var PORT = 2000
var HELLO_APP = 'HELLOAPP'
var HELLO_KETTLE = 'HELLOKETTLE\n'

var checkForKettle = function(ip, portDetails, callback) {
    debug('Checking IP ' + ip + ' for kettles', portDetails.state)
    if ('open' !== portDetails.state) return callback()
    var client = new Socket()
    client.setEncoding('ascii')
    client.setNoDelay()
    client.connect(PORT, ip, function() {
        debug('Connected to ' + ip)
        var found = false
        var timeout = setTimeout(function() {
            if (false === found) client.end()
            log('Timeout on IP address ' + ip)
            callback()
        }, 1500)
        client.once('data', function(response) {
            if (response.indexOf(HELLO_APP) !== -1) {
                log('Have found a kettle on IP ' + ip)
                callback(client)
            }
            found = true
            clearTimeout(timeout)
        })
        client.write(HELLO_KETTLE)
    })
}

var performScan = function(ipAddresses, callback) {
    var opts = {
        range: ipAddresses,
        ports: PORT
    }
    log('Total of ' + ipAddresses.length + ' ip addresses to check')
    nmap.nmap('scan', opts, function(error, report) {
      if (error) {
          return callback(error)
      }
      var counter = 0
      var kettle = null
      if (0 === report.length) {
          return callback('No devices listening on port ' + PORT)
      }
      report.forEach(function(item) {
          checkForKettle(item[0].ip, item[0].ports[0], function(socket) {
              ++counter
              if (socket) {
                kettle = socket
              }
              if (counter === ipAddresses.length) {
                  callback(kettle ? null : 'Kettle not found :(', kettle)
              }
          })
      })
    })

}

/**
 * This method loops over local interfaces and finds a list
 * of IP addresses within the same subnet
 */
var discover = function(callback) {
  log('Performing discovery')
  nmap.nmap('discover', options, function(error, networkInterfaces) {
    if (error) {
      return callback(error)
    }
    var ipAddresses = []
    networkInterfaces.forEach(function(networkInterface) {
      (networkInterface.neighbors || []).forEach(function(ip) {
          ipAddresses.push(ip)
          debug('Found IP address ' + ip)
      })
    })
    if (0 === ipAddresses.length) {
        return callback('No IP addresses to scan')
    }
    performScan(ipAddresses, callback)
  })
}

module.exports = discover
