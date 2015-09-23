'use strict';

var Socket = require('net').Socket
  , log       = require('debug')('discover')
  , debug = require('debug')('discover:debug')
  , ip = require('ip')

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

/**
 * This method looks a certain port on a host
 * and determines if it is open or not
 * @param port
 * @param host
 * @param callback
 */
var checkPort = function ( port, host, callback ) {
    var socket = new Socket(), status = null;

    // Socket connection established, port is open
    socket.on( 'connect', function () {
        status = 'open';
        socket.end();
    } );
    socket.setTimeout( 1500 );// If no response, assume port is not listening
    socket.on( 'timeout', function () {
        status = 'closed';
        socket.destroy();
    } );
    socket.on( 'error', function ( exception ) {
        status = 'closed';
    } );
    socket.on( 'close', function ( exception ) {
        callback( null, status, host, port );
    } );

    socket.connect( port, host );
}

/**
* This method loops over local interfaces and finds a list
* of IP addresses within the same subnet
* @param callback
*/
var discover = function (callback) {
    log('Performing discovery')
    var LAN = ip.address().substr(0, ip.address().lastIndexOf('.')) || ip.address();

    var kettle = null;
    // Scan over a range of IP addresses and execute a function each time the PORT is shown to be open.
    for ( var i = 1; i <= 255; i++ ) {

        // Scan local network
        checkPort( PORT, LAN + '.' + i, function ( error, status, host, port ) {
            debug('Found IP address ' + host)
            if ( status == "open" ) {
                // Check if found device is a kettle
                checkForKettle( host, { state: status }, function (socket) {
                    if (socket) {
                        kettle = socket
                        callback(null, kettle)
                    } else if(i == 255 && !socket){
                        debug( 'No IPs to be checked anymore')
                        callback('Kettle not found :{', null);
                    }
                });
            }
        } );
    }
}

module.exports = discover
