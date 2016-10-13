var HID = require('node-hid');
var express = require('express');
var bodyParser = require('body-parser');
var BufferWriter = require('./buffer-writer');

var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.post('/sensor', (request, response) => {
  if (request.body && request.body.name) {
    writeSoftwareSensorName(request.body.name);
    response.status(200).send();
  }
  else {
    response.status(500).send();
  }
});

app.post('/temp', (request, response) => {
  if (request.body && request.body.temp) {
    writeTemperature(request.body.temp);
    response.status(200).send();
  }
  else {
    response.status(500).send();
  }
});

app.post('/time', (request, response) => {
  if (request.body && request.body.time) {
    writeTime(request.body.time);
    response.status(200).send();
  }
  else {
    response.status(500).send();
  }
});

app.post('/settings', (request, response) => {
  if (request.body) {
    writeMegaSettings(request.body);
    response.status(200).send();
  }
  else {
    response.status(500).send();
  }
});

app.listen(8080);
console.log('listening on http://localhost:8080');

var devices = HID.devices();
// Find the Aquaero device.
var aquaeroDevice = HID.devices().find((device) => device.product == 'aquaero Device');
// Open the Aquaero device.
var device = new HID.HID(aquaeroDevice.path);

function writeSoftwareSensorName(name) {
  var buffer = new BufferWriter(28);
  buffer.writeUInt8(10);
  buffer.writeUInt16(32);
  buffer.writeUInt8(0);
  buffer.write(name);

  device.write(buffer.toArray());
}

function writeTemperature(temperature) {
  temperature = temperature * 100;
  var buffer = new BufferWriter(17);
  buffer.writeUInt8(7);
  buffer.writeInt16(temperature);
  buffer.writeInt16(32767);
  buffer.writeInt16(32767);
  buffer.writeInt16(32767);
  buffer.writeInt16(32767);
  buffer.writeInt16(32767);
  buffer.writeInt16(32767);
  buffer.writeInt16(32767);

  device.write(buffer.toArray());
}

function writeTime(utcTimeInMilliseconds) {
  var buffer = new BufferWriter(7);
  buffer.writeUInt8(6);
  buffer.writeUInt16(37000);
  buffer.writeUInt32(getAquaeroTimestamp(utcTimeInMilliseconds));

  device.write(buffer.toArray());
}

function getAquaeroTimestamp(utcTimeInMilliseconds) {
  var currentTimeInMilliseconds = Math.max(0, utcTimeInMilliseconds - Date.UTC(2009, 0, 1, 0, 0, 0));
  var currentTimeInSeconds = Math.floor(currentTimeInMilliseconds / 1000);
  return currentTimeInSeconds;
}

var array = device.getFeatureReport(11, 2653);
var buffer = BufferWriter.fromArray(array);

function writeMegaSettings(settings) {
  if (settings.utcOffset != undefined) {
    buffer.setPosition(46);
    buffer.writeInt16(settings.utcOffset);
  }

  var dateConfig = 0;
  if (settings.useDst) {
    dateConfig = dateConfig + 1;
  }
  if (settings.use24HourFormat) {
    dateConfig = dateConfig + 2;
  }
  if (settings.dateFormat == 1) {
    dateConfig = dateConfig + 4;
  }

  buffer.setPosition(48);
  buffer.writeUInt8(dateConfig);

  buffer.setPosition(26);
  buffer.writeUInt8(settings.language);

  if (settings.activeContrastValue) {
    buffer.setPosition(27);
    buffer.writeUInt16(settings.activeContrastValue * 100);
  }

  device.sendFeatureReport(buffer.toArray());
}
