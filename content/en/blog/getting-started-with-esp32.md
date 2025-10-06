---
title: Getting started with ESP32 in Debian 12 - a step-by-step guide
date: 2024-08-02T11:50:00+00:00
description: Getting started with ESP32 in Debian 12 - a step-by-step guide
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- ESP32
categories:
- ESP32
cover:
    image: images/2024-thumbs/esp32.webp
---

To connect ESP32 to your computer with Linux Debian 12, you will need to follow these steps:

1. USB Cable: You need a USB to micro-USB or USB-C cable, depending on the port type in your ESP32.
2. Drivers: Most modern operating systems automatically recognize ESP32, but you may need to install CP210x USB to UART Bridge VCP drivers.
3. Connection:
   - Connect the USB cable to the ESP32.
   - Connect the other end of the cable to a USB port on your computer.
4. Checking the connection:
   - On Linux, use the command "ls /dev/tty*" in the terminal.
You should see a new serial device.
5. Software: For programming ESP32, you can use Arduino IDE or the ESP-IDF platform.

#### Backup

Making a copy of the factory ESP32 content is a good idea, especially before introducing your own changes. Here's how you can do it:

1.Install esptool:

   If you don't have it yet, install esptool. You can do this via pip:

   ```bash
   sudo apt install python3-pip python3.11-venv python3-wxgtk4.0 python3-full
   mkdir esptool
   python3 -m venv ~/esptool/
   ~/esptool/bin/python3.11 ~/esptool/bin/pip install esptool
   ```

2.Connect the ESP32 to your computer via USB.

How do I know which port to use?

**On Linux:**

- Open a terminal and type: `ls /dev/tty*`
- Connect the ESP32 to your computer
- Type again: `ls /dev/tty*`
- Compare the results - the new port that appeared is probably your ESP32
- It will usually be something like `/dev/ttyUSB0` or `/dev/ttyACM0`

If you're unsure, you can disconnect and reconnect the ESP32, observing which port disappears and reappears on the list.

3.Perform the backup:

   Open a terminal and type:

   ```bash
   USER=your_username
   mkdir /home/$USER/backup
   sudo /home/$USER/esptool/bin/python3.11 /home/$USER/esptool/bin/esptool.py --port /dev/ttyUSB0 --baud 115200 --before default_reset --after hard_reset read_flash 0 0x400000 ~/backup/flash_content.bin
   ```

Note: Change `/dev/ttyUSB0` to the appropriate port for your system.

4.This command will create a `flash_contents.bin` file, which will contain a copy of the entire ESP32 flash memory.

A few notes:

- Make sure you have enough disk space (the file will be about 4MB).
- The process may take a few minutes.
- If you encounter connection problems, you may need to repeat the command to perform a backup.

To restore this copy later:

```bash
sudo chmod a+rw /dev/ttyUSB0
sudo /home/$USER/esptool/bin/python3.11 /home/$USER/esptool/bin/esptool.py --port /dev/ttyUSB0 --baud 115200 write_flash 0 ~/backup/flash_contents.bin
```

Remember that this copy contains everything in the flash memory, including the bootloader, partitions, and application.

#### Install Arduino IDE

To install Arduino IDE on a Linux system, you can use one of two main methods:

1.Installation through the package manager (easier, but may not be the latest version):

Open a terminal and type:

```bash
sudo apt-get update
sudo apt-get install arduino
```

This method works on Debian/Ubuntu-based systems. For other distributions, the command may differ.

2.Installation from the official Arduino website (latest version):
   a) Go to [https://www.arduino.cc/en/software](https://www.arduino.cc/en/software)
   b) Download the Linux version (64-bit or 32-bit, depending on your system)
   c) Extract the downloaded .tar.xz file
   d) Open a terminal in the folder where you extracted the files
   e) Run the installation script:

```bash
./install.sh
```

After installation, you can launch Arduino IDE from the application menu or by typing `arduino` in the terminal.

Additionally, to use Arduino IDE without root permissions, you need to add your user to the dialout group:

```bash
sudo usermod -a -G dialout $USER
```

Also make sure that you can write to the device:

```bash
sudo chmod a+rw /dev/ttyUSB0
```

After executing this command, it will be necessary to restart the system or log out and log back in.

After installing Arduino IDE and connecting ESP32, the next steps are:

1. Adding ESP32 support to Arduino IDE:
   - Open Arduino IDE
   - Go to File > Preferences
   - In the "Additional Boards Manager URLs" field, add:
     `https://espressif.github.io/arduino-esp32/package_esp32_index.json`
   - Click OK

   See documentation: [https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html)

2. Installing the ESP32 board:
   - Go to Tools > Board > Boards Manager
   - Search for "ESP32"
   - Install "ESP32 by Espressif Systems"

3. Configuring Arduino IDE:
   - Select the appropriate ESP32 model in Tools > Board > esp32 > AI Thinker ESP32-CAM from the Arduino IDE menus.
   - Select the correct port in Tools > Port
   - Select proper frequency - see crystal freq. Usually 80 or 40 MHz

4. Testing the connection:
   - Open an example sketch: File > Examples > WiFi > WiFiScan
   - Click the "Upload" button to compile and upload the program

5. Programming:
   - Now you can start writing your own programs or modify existing examples

6. Testing application/code
   - Open Tools > Serial Monitor
   - Set baud to 115200
   - Observe the result of the code

#### Walkthrough video

{{<youtube jmiKZUIE_EM>}}
