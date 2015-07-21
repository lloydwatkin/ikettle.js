iKettle API
==============

A very simple API to the [WIFI Kettle / iKettle](http://smarter.am/).

**Requires nodejs >=0.11**

[![Build
Status](https://travis-ci.org/lloydwatkin/ikettle.js.svg?branch=master)](https://travis-ci.org/lloydwatkin/ikettle.js)
[![npm version](https://badge.fury.io/js/kettle.js.svg)](http://badge.fury.io/js/kettle.js)
[![Dependency Status](https://david-dm.org/lloydwatkin/ikettle.js.svg?theme=shields.io)](https://david-dm.org/lloydwatkin/ikettle.js)
[![devDependency Status](https://david-dm.org/lloydwatkin/ikettle.js/dev-status.svg?theme=shields.io)](https://david-dm.org/lloydwatkin/ikettle.js#info=devDependencies)


# Licence

MIT

# Donate

Like it?

Bitcoin: 17cc2cNc343Mg3RbYZmocxXDXmDLARipeM

[![Support via Gratipay](https://cdn.rawgit.com/gratipay/gratipay-badge/2.3.0/dist/gratipay.svg)](https://gratipay.com/lloydwatkin/)

# Usage

## Methods

### Discover the kettle

```javascript
ikettle.discover(function(error, success) {
   console.log(error, success)
})
```

### Boil the kettle

```javascript
ikettle.boil(function() {
  console.log('Kettle boiling')
})
```

Note: The callback is _optional_ since the kettle will emit status events.

### Stop / switch off the kettle

```javascript
ikettle.stop(function() {
  console.log('Kettle off')
})
```

Note: The callback is _optional_ since the kettle will emit status events.

### Get kettle status

```javascript
ikettle.getStatus(function() {
  console.log('Retrieving kettle status')
})
```

Note: The callback is _optional_ since the kettle will emit status events.

### Set temperature

```javascript
ikettle.setTemperature(temperature, function(error) {
  if (error) console.log(error)
})
```

If *error* is populated then an error has occurred. Valid values for temperature are:

* 100
* 95
* 80
* 65

### Keep Warm

#### Activate / Deactivate

```javascript
ikettle.setKeepWarm(function() {
    console.log('Kettle set to keep warm')
})
```

Note: The callback is _optional_ since the kettle will emit status events.

#### Set keep warm time

```javascript
ikettle.setKeepWarmTime(time, function(error) {
    if (error) console.log(error)
})
```

Set keep warm time, valid values of *time* are:

* 5 * 60 * 1000 = 5 minutes
* 10 * 60 * 1000 = 10 minutes
* 20 * 60 * 1000 = 20 minutes

## Events

### Temperature

```javascript
ikettle.on('temperature', function(temperature) {
  console.log(
    'Kettle temperature set to ' +
    temperature +
    '℃'
    )
 })
```

### Boiling

```javascript
ikettle.on('boiling', function() {
  console.log('Kettle is boiling')
})
```

### Boiled

```javasript
ikettle.on('boiled', function() {
  console.log('Kettle has boiled')
})
```

### Off

```javascript
ikettle.on('off', function() {
  console.log('Kettle is off')
})
```

### Keep warm

```javascript
ikettle.on('keep-warm', function(active) {
  console.log('Keep warm is active?', active)
})
```

#### Time

```javascript
ikettle.on('keep-warm-time', function(time) {
  console.log('Keep warm time ' + time + ' ms')
})
```

#### Expired

```javascript
ikettle.on('keep-warm-expired', function() {
  console.log('Keep warm time expired')
})
```

### Kettle removed

When the kettle body is removed from the base we are alerted as follows:

```javascript
ikettle.on('removed', function() {
  console.log('Kettle body removed')
})
```

### Overheat / Boil dry

```javascript
ikettle.on('overheat', function() {
  console.log('Kettle overheating')
})
```

### Error

```javascript
ikettle.on('error', functon(error) {
  console.log('ERROR', error)
})
```
