var discover = require('./lib/discover')
  , log = require('debug')('index')

discover(function(error, kettles) {
    if (error) {
        console.error(error)
    } else {
        log('Found kettle!')
    }
})