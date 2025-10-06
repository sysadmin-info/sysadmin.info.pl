---
title: How to flash Raspberry Pi OS onto the Compute Module 4 eMMC with usbboot
date: 2023-07-16T13:45:00+00:00
description: How to flash Raspberry Pi OS onto the Compute Module 4 eMMC with usbboot
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Water cooling for CM4 / Raspberry Pi
categories:
- Raspberry Pi
cover:
    image: images/2023-thumbs/flash-compute-module-4-eMMC.webp
---
There are two primary variations of the Raspberry Pi Compute Module 4: one with integrated eMMC storage and one without. If you choose a Compute Module 4 with integrated eMMC storage and you wish to manually change files on the boot volume or write a new OS image to the Compute Module, you may do it just like you would with a microSD card, but first you must make the eMMC storage mountable on another computer.

This blog post shows how to mount the eMMC storage on another computer (in my case a Linux, but the process is very similar on Mac), and then how to flash a new OS image to it.

#### Video Instructions

The installation and use of rpiboot for flashing the eMMC on Windows, Ubuntu, Raspberry Pi OS, or macOS are covered in a video version of this post that I also published in addition to the written tutorial below:

{{<youtube 7Yz9TlPPTtA>}}

#### Preparing the IO Board for mounting
1. Put a jumper over the first set of pins on the 'J2' jumper—the jumper labeled "Fit jumper to disable eMMC boot": If you don't have a jumper, you can also insert any type of conductor, such as a female-to-female jumper, between the two pins.
2. Then, connect USB and a power cable from your computer (in my instance, a Linux; however, it may also be a Windows or Mac) to the IO Board's 'USB Slave' micro USB port:
3. The board will switch on, and you'll see the red 'D1' LED light up, but the Compute Module won't boot. The following procedure should now be possible using the eMMC module.


#### Using usbboot to mount the eMMC storage

The next step is to download the rpiboot executable, which you'll need to mount the storage on your computer, construct the rpiboot repository, and install the necessary USB library on your computer. On my Linux, I carried out all of this using the Terminal program.

1. Confirm that the libusb library is installed. On Linux (e.g. another Raspberry Pi, Debian, Ubuntu), run: 

```bash
sudo apt install libusb-1.0-0-dev
```

2. Clone the usbboot repository to your computer:


```bash
git clone --depth=1 https://github.com/raspberrypi/usbboot
```

3. Create rpiboot by performing the below commands:


```bash
cd usbboot
make
```

4. Now, the directory ought to contain an executable file called rpiboot. Run the below command to mount the eMMC storage.

```bash
sudo ./rpiboot
```

5. The boot volume should then be mounted on your Linux (or whichever device you're using) a short while after it has finished its work. The D2 LED may also start to light up, indicating that there is disk read/write activity on the eMMC.

#### Installing Raspberry Pi imager

The eMMC storage now operates exactly like a microSD card or USB drive that is connected to a computer. Utilize a program like the Raspberry Pi Imager to flash the eMMC with the Raspberry Pi OS (or any other OS of your choice):

{{<youtube X0yUDcN8KUY>}}

1. Download the Raspberry Pi Imager

```bash
wget https://downloads.raspberrypi.org/imager/imager_latest_amd64.deb
sudo apt install ./imager_latest_amd64.deb
```

#### Flashing Raspberry Pi OS onto the eMMC

The video presents installation of the Raspberry Pi OS without and with GUI.

{{<youtube zUcWfZdYp6A>}}

You could now unplug the IO board and eject the boot volume if it's still mounted if you don't need to change anything in the boot volume's content. Remove the eMMC Boot disable jumper from J2 after disconnecting the power, USB slave port connection, and J2.

Reconnect the power, and the CM4 should now start from its recently flashed eMMC storage!


Run the below command once more if you ever need to mount the boot disk or re-flash the eMMC storage.

```bash
sudo./rpiboot
```

#### Configuring Raspberry Pi OS after the installation

{{<youtube 4s3k-heKiwY>}}