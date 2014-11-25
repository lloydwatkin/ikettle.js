var discover = require('./lib/discover')

discover(function(error, kettles) {
    if (error) {
        console.error(error)
    } else {
        console.log('Found kettles: ' + JSON.stringify(kettles))
    } 
})