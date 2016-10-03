### Report ID 7 (Update Software Temps)

Report ID 7 followed by 8 int16's which corresponds to the 8 possible software temperature sensors. Values should be in Celsius, multiplied by 100 (so 50 degrees becomes 5,000). Array size should be 17 bytes exactly. All 8 sensors must be sent at once. Any sensor that doesn't have a value should be sent as 0x7FFF.

Example: We have the temperature readings 10, 20, 30, 40, and 50 for the first 5 sensors.

```
       |- 1000 -|  |- 2000 -|  |- 3000 -|  |- 4000 -|  |- 5000 -|  |- none -|  |- none -|  |- none -|
[0x07, 0x03, 0xE8, 0x07, 0xD0, 0x0B, 0xB8, 0x0F, 0xA0, 0x13, 0x88, 0x7F, 0xFF, 0x7F, 0xFF, 0x7F, 0xFF]
```

### Report ID 10 (Update Software Temp Name)

Report ID 10 followed by an int16 that represents the software sensor to update (starts at 32, increments by 1 up to 40 for all 8 sensors). Then followed by 0x00, then a 24-byte string for the name where the last byte is 0x00 (allowing for 23 characters total). Any character in between that's blank should be 0x00. The array size should be 28 bytes exactly. The Aquaero 6 supports the complete Latin1 character set (also known as ISO 8859-1) minus the very last character, ÿ. Sending data that uses another encoding such as UTF8 or Windows-1252 will treat it as if it's the Latin1 character set.

Example: We set software sensor 32 with the string 'abcde':

```
       |-- 32 --|         a     b     c     d     e
[0x0A, 0x00, 0x20, 0x00, 0x61, 0x62, 0x63, 0x64, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
```

### Report ID 6 (Set All Configuration Settings) [currently incomplete]

Setting the time: Report ID followed by an int16 with value 37,000, then the time as an int32 where the time is the number of seconds that has elapsed since 2009-01-01 00:00:00 (if you're working with a Unix timestamp, you need to divide it by 1,000 because it's in milliseconds).

Example: We set the time:

```
       |- 37000 -|
[0x06, 0x90, 0x88, ]
```
