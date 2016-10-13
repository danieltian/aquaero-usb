// Wrapper class to make it easier to work with NodeJS buffers as if they were stream writers.
class BufferWriter {
  // Create a BufferWriter instance with a given array size.
  constructor(size = 0) {
    this.currentPosition = 0;
    this.buffer = Buffer.alloc(size);
  }

  // Create a BufferWriter instance from an array.
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

  // Sets the array writing position as a byte position offset.
  setPosition(position) {
    this.currentPosition = position;
  }

  // Convert the buffer to an array.
  toArray() {
    return Array.from(this.buffer);
  }
}

module.exports = BufferWriter;
