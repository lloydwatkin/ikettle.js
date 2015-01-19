'use strict';

require('should')

describe('Status', function() {
    
    var IKettle = require('../index')

    it.skip('Calling `status` before connecting returns error', function(done) {
        
        var ikettle = new IKettle()
        ikettle.getStatus(function(error) {
            error.should.equal(ikettle.KETTLE_NOT_CONNECTED)
            done()
        })
    })
    
})