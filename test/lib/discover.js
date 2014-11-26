'use strict';

var proxyquire =  require('proxyquire')
  , should = require('should')

describe('Discovery', function() {
    
    var errorMessage = 'ERROR'
    
    it('Returns an error with `nmap` error', function(done) {
        var nMap = {
            nmap: function(method, options, callback) {
                method.should.equal('discover')
                options.should.eql({})
                callback(errorMessage)
            }
        }
        var discover = proxyquire('../../lib/discover', { 'node-libnmap': nMap, net: {} })
        discover(function(error, socket) {
            should.not.exist(socket)
            error.should.equal(errorMessage)
            done()
        })
        
    })
    
    it('Errors if there\'s no IP addresses to scan', function(done) {
        var nMap = {
            nmap: function(method, options, callback) {
                method.should.equal('discover')
                options.should.eql({})
                callback(null, [])
            }
        }
        var discover = proxyquire('../../lib/discover', { 'node-libnmap': nMap, net: {} })
        discover(function(error, socket) {
            should.not.exist(socket)
            error.should.equal('No IP addresses to scan')
            done()
        })
        
    })
    
    describe('Scan', function() {
    
        var ipAddresses = [ '192.168.0.1' ]
        
        it('Errors if nmap scan fails', function(done) {
            var nmapCalls = 0
            var nMap = {
                nmap: function(method, options, callback) {
                    ++nmapCalls
                    if (1 === nmapCalls) {
                        return callback(null, [ { neighbors: ipAddresses } ])
                    }
                    method.should.equal('scan')
                    options.should.eql({ range: ipAddresses, ports: 2000 })
                    callback(errorMessage)
                }
            }
            var discover = proxyquire('../../lib/discover', { 'node-libnmap': nMap, net: {} })
            discover(function(error, socket) {
                should.not.exist(socket)
                error.should.equal(errorMessage)
                done()
            })
        })
        
        it('If there\'s no reported devices listening on 2000 discovery fails', function(done) {
            var nmapCalls = 0
            var nMap = {
                nmap: function(method, options, callback) {
                    ++nmapCalls
                    if (1 === nmapCalls) {
                        return callback(null, [ { neighbors: ipAddresses } ])
                    }
                    callback(null, [])
                }
            }
            var discover = proxyquire('../../lib/discover', { 'node-libnmap': nMap, net: {} })
            discover(function(error, socket) {
                should.not.exist(socket)
                error.should.equal('No devices listening on port 2000')
                done()
            })
        })
        
        it('Fails discovery if devices listening on port 2000 are closed', function(done) {
            var nmapCalls = 0
            var nMap = {
                nmap: function(method, options, callback) {
                    ++nmapCalls
                    if (1 === nmapCalls) {
                        return callback(null, [ { neighbors: ipAddresses } ])
                    }
                    callback(null, [ [ { ip: '192.168.0.1', ports: [ { state: 'closed' } ] } ] ])
                }
            }
            var discover = proxyquire('../../lib/discover', { 'node-libnmap': nMap, net: {} })
            discover(function(error, socket) {
                should.not.exist(socket)
                error.should.equal('Kettle not found :(')
                done()
            })
        })
        
    })
    
    describe('Socket discovery', function() {
        
        
    })
    
    
})