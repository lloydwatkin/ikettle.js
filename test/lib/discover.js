'use strict';
/* exported should*/
var proxyquire =  require('proxyquire'),
    should = require('should'),
    ip = require('ip')

describe('Discovery', function() {

    describe('Scan', function() {

        it('If creating a socket fails', function(done) {
            var discover = proxyquire('../../lib/discover', {PORT: 0, LAN: 0} ).discover
            discover(function(error) {
                error.should.equal('Kettle not found :{')
                done()
            })
        })

        it('If a socket is timing out', function(done) {
            var createConnection = require('../../lib/discover' ).createConnection
            //port, host, callback1, callback2
            createConnection(2000, '192.168.1.2', function(error, status) {
                error.should.equal(true)
                status.should.equal('closed')
                done()
            })
        })

        it('If a device is not listening on port 2000', function(done) {
            var createConnection = require('../../lib/discover' ).createConnection
            //port, host, callback1, callback2
            createConnection(2000, ip.address(), function(error, status) {
                should.not.exist(error)
                status.should.equal('closed')
                done()
            })
        })

        it('If a device is listening on a port', function(done) {
            var createConnection = require('../../lib/discover' ).createConnection
            createConnection(53, '8.8.8.8', function(error, status) {
                should.not.exist(error)
                status.should.equal('open')
                done()
            })
        })

        it('If a port is closed and no ports left to scan', function(done) {
            var checkPort = require('../../lib/discover' ).checkPort
            //error, status, host, callback
            checkPort(false, 'closed', '192.168.1.255', function(error, kettle) {
                should.not.exist(kettle)
                error.should.equal('Kettle not found :{')
                done()
            })
        })

        it('If there are open ports, but it is no kettle', function(done) {
            var checkPort = require('../../lib/discover' ).checkPort
            //error, status, host, callback
            checkPort(false, 'open', '192.168.1.255', function(error, kettle) {
                should.not.exist(kettle)
                error.should.equal('Kettle not found :{')
                done()
            })
        })

        it('If there\'s no devices listening on port 2000 on the network', function(done) {
            var discover = require('../../lib/discover' ).discover
            discover(function(error, kettle) {
                should.not.exist(kettle)
                error.should.equal('Kettle not found :{')
                done()
            })
        })


    })

})