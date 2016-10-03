var HID = require('node-hid');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.post('/sensor', (request, response) => {
  if (request.body && request.body.name) {
    writeSoftwareSensorName(request.body.name);
    response.sendStatus(200);
  }
  else {
    response.write(500);
  }
});

app.listen(8080);
console.log('listening on 8080');

var devices = HID.devices();
//console.log(devices);
// Find the Aquaero device.
var aquaeroDevice = HID.devices().find((device) => device.product == 'aquaero Device');
//console.log(aquaeroDevice);

// Open the Aquaero device.
var device = new HID.HID(aquaeroDevice.path);

device.on('data', (data) => {
  //console.log('data', data.length);
});

device.on('error', (error) => {
  console.log('error encountered', error);
});

function writeSoftwareSensorValues() {
  device.write([0x07, 0x03, 0xE8, 0x07, 0xD0, 0x0B, 0xB8, 0x0F, 0xA0, 0x13, 0x88, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
}

function writeSoftwareSensorName(name) {
  console.log('name', name);
  var buffer = Buffer.alloc(28);
  buffer.writeUInt8(10);
  buffer.writeUInt16BE(32, 1);
  buffer.write(name, 4, name.length, 'latin1');
  var array = Array.from(buffer);
  console.log(array);

  device.write(array);
}

function writeTime() {
  var now = new Date();
  var currentTimeInMilliseconds = (now.getTime() + now.getTimezoneOffset() * 60000) - new Date(2009, 1, 1, 0, 0, 0);
  var currentTimeInSeconds = Math.floor(currentTimeInMilliseconds / 1000);
  var buffer = Buffer.alloc(7);
  buffer.writeUInt8(6);
  buffer.writeUInt16BE(37000, 1);
  buffer.writeUInt32BE(currentTimeInSeconds, 3);
  var array = Array.from(buffer);

  console.log(array);
  device.write(array);
}

//writeSoftwareSensorName();

//console.log('done');
