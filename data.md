### Output Report ID 7 - Update Software Temps (17 bytes)

Report ID 7 followed by 8 int16's which corresponds to the 8 possible software temperature sensors. Values should be in Celsius, multiplied by 100 (so 50 degrees becomes 5,000). Up to two digits of precision is supported. All 8 sensors must be sent at once. Any sensor that doesn't have a value should be sent as 0x7FFF (decimal value 32767, a.k.a. the maximum value of an int16).

Example: We have the temperature readings 10, 20, 30, 40, and 50 for the first 5 sensors.

```
       |- 1000 -|  |- 2000 -|  |- 3000 -|  |- 4000 -|  |- 5000 -|  | 32767 |   | 32767 |   | 32767 |
[0x07, 0x03, 0xE8, 0x07, 0xD0, 0x0B, 0xB8, 0x0F, 0xA0, 0x13, 0x88, 0x7F, 0xFF, 0x7F, 0xFF, 0x7F, 0xFF]
```

### Output Report ID 10 - Update Software Temp Name (28 bytes)

Report ID 10 followed by an int16 that represents the software sensor to update (starts at 32, increments by 1 up to 40 for all 8 sensors). Then followed by 0x00, then a 24-byte string for the name where the last byte is 0x00 (allowing for 23 characters total). Any unused characters should be set to 0x00. The Aquaero 6 supports the complete Latin1 character set (also known as ISO 8859-1) minus the very last character, ÿ. Sending data that uses another encoding such as UTF8 or Windows-1252 will treat it as if it's the Latin1 character set, which can result in [mojibake](https://en.wikipedia.org/wiki/Mojibake).

Example: We set software sensor 32 with the string 'abcde':

```
       |-- 32 --|         a     b     c     d     e
[0x0A, 0x00, 0x20, 0x00, 0x61, 0x62, 0x63, 0x64, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
```

### Output Report ID 6, Sync Time Commmand (7 bytes)

Setting the time: Report ID followed by an int16 with value 37,000, which is the sync time command. The time should follow as a uint32 where the time is the number of seconds that has elapsed since 2009-01-01 00:00:00.

Example: We set the time:

```
       |- 37000 -| | 2016-10-07 11:38:00 |
[0x06, 0x90, 0x88, 0x57, 0xF8, 0x15, 0x7C]
```

### Feature Report ID 11, Mega Settings (2048 bytes used out of 2653 bytes total)

Mega settings file

| Hex Offset | Decimal offset | Data type | Range | Description |
|------------|----------------|-----------|-------------|
| 0x0000 | 0 | uint8 | Always 11 | Report ID |
| 0x0001 | 1 | uint16 | Structure ID 1200, will be valid for firmware versions 2000 to 2007 and likely beyond |
| 0x0003 | 3 | uint32 | Aquaero timestamp, this value seems to be ignored, use report ID 6's sync time command to update the time instead |
| 0x0007 | 7 | int16 | Clock offset, this seems to always be 0 and is ignored, the actual UTC offset is controlled at 0x46 instead |
| 0x0009 | 9 | int16 x 8 | Key sensitivity settings for all 8 keys, seems to be all 0's for the Aquaero 5 Pro, which has physical keys instead of touch keys |
| 0x0019 | 25 | uint8 | Interface type, always seems to be 3, unknown what this value is for |
| 0x001A | 26 | uint8 | Language type (0 for English, 1 for German) |
| 0x001B | 27 | uint16 | Screen contrast when active, this number is a percentage from 0% to 100% multiplied by 100, so 40% would be 4,000 |
| 0x001D | 29 | uint16 | Screen contrast when on standby, this number is a percentage from 0% to 100% multiplied by 100, so 40% would be 4,000 |
| 0x001F | 31 | uint16 | Backlight brightness when active, this number is a percentage from 0% to 100% multiplied by 100, so 40% would be 4,000 |
| 0x0021 | 33 | uint16 | Backlight brightness when on standby, this number is a percentage from 0% to 100% multiplied by 100, so 40% would be 4,000 |


Scratch pad stuff below, TODO: format this into a table

0 Report ID 11
1-2 Structure version 1200
3-6 Aquaero timestamp
7-8 Clock offset (0)
9-24 key sensitivity (eight uint16 bytes, all 0)
25 Interface type (3)
26 Language type (0 for English, 1 for German)
27-28 Contrast when active (4,000 for 40%)
29-30 Contrast when standby (6,000 for 40%)
31-32 Backlight when active (10,000 for 100%)
33-34 Backlight when standby (4,000 for 40%)
35-36 Idle timeout (240 seconds)
37 Backlight mode (0 for "off after timeout", 1 for "always on")
38 Display mode (0 for normal, 1 for inverted)
39-40 Backlight key (5,000 for 50%)
41-42 Backlight key idle (500 for 5%)
43 Key backlight mode (0 for "off after timeout", 1 for "always on")
44-45 Menu timeout (60 seconds)
46-47 UTC offset (signed int16)
48 Time config (1 = DST, 2 = 24-hour, 4 = DE date format)
49-176 Display pages, 32 of them where the format is:
  uint8 0: off, 1: on, 2: permanent on
  uint16 total seconds to display (only used if first byte value is "on")
  uint8 page type
177-196 Soft key configuration, 4 soft keys where each soft key is a 5-byte array (array values TBD)
197 Temperature unit (0 for Celsius, 1 for Fahrenheit, 2 for Kelvin)
198 Flow unit (0 for liters per hour, 1 for liters per minute, 2 for US gallons per hour, 3 for US gallons per minute, 4 for Imperial gallons per hour, 5 for Imperial gallons per minute)
199 Pressure unit (0 for Bar, 1 for PSI)
200 Key tone (0 for off, 1 for low, 2 for mid, 3 for high)
201-202 Backlight standby (500 for 5%)
203-204 Idle timeout standby (10 seconds)
205-206 Backlight key standby (0 seconds)
207-208 Wakeup action (-1)
209-210 Sleep action (-1)
211-212 Main page selection timeout (60 seconds)
213-214 m_pageStandby (-1)
215-216 m_pageIdle (-1)
217-218 m_pageAlarm (-1)

Action types:
	NONE = -1,
	TACHO_ON = 0,
	TACHO_OFF = 1,
	BUZZER_ON = 2,
	BUZZER_OFF = 3,
	BUZZER_INTERVAL_TONE = 4,
	BUZZER_SINGLE_TONE = 5,
	RELAY_ON = 6,
	RELAY_OFF = 7,
	RELAY_2SEC = 8,
	RELAY_10SEC = 9,
	PROFILE1 = 10,
	PROFILE2 = 11,
	PROFILE3 = 12,
	PROFILE4 = 13,
	KEYBOARD_POWER = 14,
	KEYBOARD_SLEEP = 15,
	KEYBOARD_WAKE = 16,
	KEYBOARD_PLAY = 17,
	KEYBOARD_VOLUP = 18,
	KEYBOARD_VOLDOWN = 19,
	KEYBOARD_MUTE = 20
