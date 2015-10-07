'use strict';

var Socket = require('net').Socket
  , log       = require('debug')('discover')
  , debug = require('debug')('discover:debug')
  , ip = require('ip')

var PORT = 2000
var HELLO_APP = 'HELLOAPP'
var HELLO_KETTLE = 'HELLOKETTLE\n'
var kettle = null;

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

/**
 * This method creates a socket connection to host@port and returns
 * whether this device is listening on port or not.
 * @param port
 * @param host
 * @param checkPort
 * @param callback2
 */
var createConnection = function ( port, host, checkPort, callback ) {
    var socket = new Socket(), status = null, error = null;

    // Socket connection established, port is open
    socket.on( 'connect', function () {
        status = 'open';
        socket.end();
    } );
    // If no response, assume port is not listening
    socket.setTimeout( 1500 );

    // When connection timeout destroy and return
    socket.on( 'timeout', function () {
        status = 'closed';
        error = true;
        socket.destroy();
    } );

    // On error, set status to closed
    socket.on( 'error', function ( ) {
        status = 'closed';
    } );

    // When a socket is closed
    socket.on( 'close', function ( ) {
        checkPort( error, status, host, callback );
    } );

    // Connect socket to host@port
    socket.connect( port, host );
}

/**
 * This method checks when a port is open whether it is a kettle,
 * and when there are IPs left to check it returns nothing found if necessary
 * @param error
 * @param status
 * @param host
 * @param callback
 */
var checkPort = function ( error, status, host, callback ) {
    debug('Found IP address ' + host)

    // If port is open
    if ( status === 'open' ) {

        // Check if found device is a kettle
        checkForKettle( host, { state: status }, function (socket) {

            // Successfully created a socket to a kettle
            if (socket) {
                kettle = socket
                callback(null, kettle)
            }
        });
    }

    // If we reached end of subnet and no kettle was fount
    if(/255/i.test(host) && !kettle){
        debug( 'No IPs to be checked anymore')
        callback('Kettle not found :{', null)
    }
}

/**
 * This method loops over local interfaces and finds a list
 * of IP addresses within the same subnet
 * @param callback
 */
var discover = function (callback) {
    log('Performing discovery')

    // Create LAN address
    var LAN = ip.address().substr(0, ip.address().lastIndexOf('.')) || ip.address();

    // Set kettle to null as new discovery is started
    kettle = null;

    // Scan over a range of IP addresses and execute a function each time the PORT is shown to be open.
    for ( var i = 0; i <= 255; i++ ) {
        
        // Scan local network
        createConnection( PORT, LAN + '.' + i, checkPort, callback)
    }
}

// Export all for testing purposes
module.exports = {
    discover: discover,
    createConnection: createConnection,
    checkPort: checkPort
}
