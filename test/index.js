'use strict';

require('should')

describe('Status', function() {
    
    it('Calling `status` before connecting returns error', function(done) {
        
        var iKettle = require('../index')
        iKettle.emit('status', function(error) {
            error.should.equal(iKettle.KETTLE_NOT_CONNECTED)
            done()
        })
    })
    
})