var nmap = require('node-libnmap')

var options = { nmap: '/usr/local/bin/nmap' }

var performScan = function(ipAddresses) {
    var opts = {
        range: ipAddresses,
        ports: 80,
        nmap: '/usr/local/bin/nmap'
    }
    nmap.nmap('scan', opts, function(error, report) {
      if (error) throw error
      report.forEach(function(item) {
          console.log(item[0].ip, item[0].ports[0])
      })
    })

}

var discover = function(callback) {
  nmap.nmap('discover', options, function(error, interfaces) {
    if (error) {
      return callback(error)
    }
    interfaces.forEach(function(interface) {
        performScan(interface.neighbors)
    })
  })
}

module.exports = discover