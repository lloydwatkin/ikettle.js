'use strict';

var ikettle = require('./index')

ikettle.emit('discover', function(error, success) {
   if (error) {
       console.log('Could not get kettle connection', error)
       process.exit(1)
   }
   ikettle.emit('status', function(error, status) {
       console.log('status', error, status)
   })
   ikettle.emit('temp:100', function(error, success) {
       console.log('temp:100', error, success)
   })
})
