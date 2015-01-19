'use strict';

require('colors')

var iKettle = require('./index')

var ikettle = new iKettle()

ikettle.on('boiling', function() {
    console.log('Kettle is boiling'.green)
    ikettle.setTemperature(100, function(error) {
        if (error) {
            console.log(error.red)
            process.exit(1)
        }
        ikettle.off()
    })
})

ikettle.on('off', function() {
    console.log('Kettle is off'.red)
})

ikettle.on('boiled', function() {
    console.log('Kettle has boiled'.rainbow)
})

ikettle.on('removed', function() {
    console.log('Kettle removed from base'.red)
})

ikettle.on('overheat', function() {
    console.log('Kettle has overheated'.red)
})

ikettle.on('keep-warm-expired', function() {
    console.log('Keep warm period has expired'.red)
})

ikettle.discover(function(error, success) {
   if (error) {
       console.log('Could not get kettle connection'.red, error.red)
       process.exit(1)
   }
   ikettle.getStatus(function(error, status) {
       ikettle.boil()
   })
})