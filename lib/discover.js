'use strict';

var scan    = require('scan-neighbors')
  , Socket = require('net').Socket
  , log       = require('debug')('discover')
  , debug = require('debug')('discover:debug')
  , _ = require('underscore')

var options = {}
var PORT = 2000
var HELLO_APP = 'HELLOAPP'
var HELLO_KETTLE = 'HELLOKETTLE\n'

var checkForKettle = function(ip, callback) {
  console.log('Checking IP ' + ip + ' for kettles');
    
  var client = new Socket();
  client.setEncoding('ascii');
  client.setNoDelay();

  client.connect(PORT, ip, function() {
    console.log('Connected to ' + ip);

    var found = false;

    var timeout = setTimeout(function() {
      if (!found) client.end();
      console.log('Timeout on IP address ' + ip);
      callback();
    }, 1500);

    client.once('data', function(response) {
      if (response.indexOf(HELLO_APP) !== -1) {
        console.log('Have found a kettle on IP ' + ip);
        callback(client);
      }
      found = true;
      clearTimeout(timeout);
    });

    client.write(HELLO_KETTLE);
  });
};

var performScan = function(ipAddresses, callback) {
  var counter = 0;
  var kettle = null;

  _.each(ipAddresses, function(ip) {
    checkForKettle(ip, function(socket) {
      ++counter;
      if (socket) {
        kettle = socket;
      }

      // once we've reached the end of the discovered IPs
      if (counter === ipAddresses.length) {
        kettle.write('set sys output 0x04' + String.fromCharCode(0x0d), function() {
          //if (callback) callback()
        })
        callback(kettle ? null : 'Kettle not found :(', kettle);
      }

    });
  })    
};

/**
 * This method loops over local interfaces and finds a list
 * of IP addresses within the same subnet
 */
var discover = function(callback) {
  console.log('Performing discovery');
  scan.scanNodes(PORT, function(err, nodes) {
    if(err) {
      console.log(err);
    } else {
      console.log(nodes);
      performScan(nodes, callback);
    }

  });
};

module.exports = discover;
