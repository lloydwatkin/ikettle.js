var nmap    = require('node-libnmap')
  , log     = require('debug')('discover')
  , Socket = require('net').Socket

var options = {}
var noop = function() {}
var port = 2000
var expected = 'HELLOAPP'
var hello = 'HELLOKETTLE\n'

var checkForKettle = function(ip, portDetails, callback) {
    log('Checking IP ' + ip + ' for kettles', portDetails.state)
    if ('open' !== portDetails.state) return false
    var client = new Socket()
    client.setEncoding('ascii')
    client.setNoDelay()
    client.connect(port, ip, function() {
        log('Connected to ' + ip)
        client.once('data', function(response) {
            if (response.indexOf(expected) !== -1) {
                log('Have found a kettle on IP ' + ip)
                var cb = callback
                callback = noop
                cb(null, client)
            }
        })
        client.write(hello)
    })
}

var performScan = function(ipAddresses, callback) {
    var opts = {
        range: ipAddresses,
        ports: port
    }
    nmap.nmap('scan', opts, function(error, report) {
      if (error) throw error
      var discovered = false
      report.some(function(item) {
          if (checkForKettle(item[0].ip, item[0].ports[0], callback)) {
              return true
          }
      })
    })

}

var discover = function(callback) {
  nmap.nmap('discover', options, function(error, interfaces) {
    if (error) {
      return callback(error)
    }
    interfaces.some(function(interface) {
      if (performScan(interface.neighbors, callback)) {
          return true
      }
    })
  })
}

module.exports = discover
