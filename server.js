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

class BufferWriter {
  constructor(size) {
    this.currentPosition = 0;
    this.buffer = Buffer.alloc(size);
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
  var currentTimeInMilliseconds = utcTimeInMilliseconds - Date.UTC(2009, 0, 1, 0, 0, 0);
  var currentTimeInSeconds = Math.floor(currentTimeInMilliseconds / 1000);
  var buffer = new BufferWriter(7);
  buffer.writeUInt8(6);
  buffer.writeUInt16(37000);
  buffer.writeUInt32(currentTimeInSeconds);
  device.write(buffer.toArray());
}
