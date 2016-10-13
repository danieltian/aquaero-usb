var HID = require('node-hid');
var express = require('express');
var bodyParser = require('body-parser');

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
console.log('listening on 8080');

var devices = HID.devices();
// Find the Aquaero device.
var aquaeroDevice = HID.devices().find((device) => device.product == 'aquaero Device');
// Open the Aquaero device.
var device = new HID.HID(aquaeroDevice.path);

function writeSoftwareSensorValues() {
  device.write([0x07, 0x03, 0xE8, 0x07, 0xD0, 0x0B, 0xB8, 0x0F, 0xA0, 0x13, 0x88, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
}

class BufferWriter {
  constructor(size = 0) {
    this.currentPosition = 0;
    this.buffer = Buffer.alloc(size);
  }

  static fromArray(array) {
    var bufferWriter = new BufferWriter();
    bufferWriter.buffer = Buffer.from(array);
    return bufferWriter;
  }

  writeUInt8(number) {
    this.currentPosition = this.buffer.writeUInt8(number, this.currentPosition);
  }

  writeInt16(number) {
    this.currentPosition = this.buffer.writeInt16BE(number, this.currentPosition);
  }

  writeUInt16(number) {
    this.currentPosition = this.buffer.writeUInt16BE(number, this.currentPosition);
  }

  writeUInt32(number) {
    this.currentPosition = this.buffer.writeUInt32BE(number, this.currentPosition);
  }

  write(string) {
    this.currentPosition = this.buffer.write(string, this.currentPosition, string.length, 'latin1');
  }

  // Sets the array writing position, which is an offset in bytes.
  setPosition(position) {
    this.currentPosition = position;
  }

  // Convert the buffer to an array.
  toArray() {
    return Array.from(this.buffer);
  }
}

function writeSoftwareSensorName(name) {
  console.log('name', name);
  var buffer = new BufferWriter(28);
  buffer.writeUInt8(10);
  buffer.writeUInt16(32);
  buffer.writeUInt8(0);
  buffer.write(name);
  var array = buffer.toArray();

  console.log(array);
  device.write(array);
}

function writeTemperature(temp) {
  temp = temp * 100;
  var buffer = new BufferWriter(17);
  buffer.writeUInt8(7);
  buffer.writeInt16(temp);
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
  var currentTimeInMilliseconds = utcTimeInMilliseconds - Date.UTC(2009, 0, 1, 0, 0, 0);
  var currentTimeInSeconds = Math.floor(currentTimeInMilliseconds / 1000);
  return currentTimeInSeconds;
}

var array = device.getFeatureReport(11, 2653);
var buffer = BufferWriter.fromArray(array);

function writeMegaSettings(settings) {
  if (settings.utcOffset != undefined) {
    console.log('writing UTC', settings.utcOffset);
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
