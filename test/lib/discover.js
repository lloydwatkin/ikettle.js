'use strict';

var proxyquire =  require('proxyquire')
    , should = require('should')

describe('Discovery', function() {

    describe('Scan', function() {

        it('If creating a socket fails', function(done) {
            var discover = proxyquire('../../lib/discover', {PORT: 0, LAN: 0})
            discover(function(error) {
                error.should.equal(true)
                done()
            })
        })

        it('If creating a socket succeeds', function(done) {
            var discover = proxyquire('../../lib/discover', {PORT: 80, LAN: '192.168.1.2'})
            discover(function(error, status, host, port) {
                error.should.equal(null)
                status.should.be.equal('closed')
                done()
            })
        })

        it('If there\'s no devices listening on port 2000 on the network', function(done) {

            var discover = proxyquire('../../lib/discover')
            discover(function(error, socket) {
                should.not.exist(socket)
                error.should.equal('Kettle not found :(')
                done()
            })
        })

    })

})