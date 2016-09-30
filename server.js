var HID = require('node-hid');

var devices = HID.devices();
// Find the Aquaero device.
var aquaeroDevice = HID.devices().find((device) => device.product == 'aquaero Device');

// Open the Aquaero device.
var device = new HID.HID('\\\\?\\hid#vid_0c70&pid_f001&mi_02#7&19825fb9&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}');

device.on('data', (data) => {
  console.log('data', data.length);
});

device.on('error', (error) => {
  console.log('error encountered', error);
});

function writeSoftwareSensorValues() {
  device.write([0x07, 0x03, 0xE8, 0x07, 0xD0, 0x0B, 0xB8, 0x0F, 0xA0, 0x13, 0x88, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
}

function writeSoftwareSensorName() {
  device.write([0x10, 0x00, 0x20, 0x00, 'a'.charCodeAt(0), 'b'.charCodeAt(0), 'c'.charCodeAt(0), 'd'.charCodeAt(0), 'e'.charCodeAt(0), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
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

writeTime();

console.log('done');
