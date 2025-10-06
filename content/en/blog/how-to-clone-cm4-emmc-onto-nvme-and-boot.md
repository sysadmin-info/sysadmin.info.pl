---
title: How to clone CM4 eMMC onto NVMe and boot
date: 2023-07-20T17:20:00+00:00
description: How to clone CM4 eMMC onto NVMe and boot
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
    image: images/2023-thumbs/how-to-clone-cm4-emmc-onto-nvme-and-boot.webp
---
#### Video Instruction

{{<youtube gczLvn7Uo-I>}}

#### How to change the boot order of the bootloader EEPROM to be able to boot from the NVMe drive?
1. To make it work you have to just power on the CM4 board where there is currently Raspberry Pi OS installed and check the configuration using the command:
2. Log into the CM4 Raspberry Pi OS through the SSH. Check the configuration in the command line:

```bash
rpi-eeprom-config
```

3. You can see the line:

```
BOOT_ORDER=
```

4. Poweroff the operating system on CM4 board.

There is a good tutorial on the raspberry pi official website: [Compute Module hardware - Datasheets and Schematics](https://www.raspberrypi.com/documentation/computers/compute-module.html "Compute Module hardware - Datasheets and Schematics")

See the section: [Compute Module 4 Bootloader](https://www.raspberrypi.com/documentation/computers/compute-module.html#cm4bootloader "Compute Module 4 Bootloader")

Table below explains better the correct order.

| Value | Mode           | Description                                                                                                              |
|-------|----------------|--------------------------------------------------------------------------------------------------------------------------|
| 0x0   | SD CARD DETECT | Try SD then wait for card-detect to indicate that the card has changed - deprecated now that Oxf (RESTART) is available. |
| 0x1   | SD CARD        | SD card (or eMMC on Compute Module 4).                                                                                   |
| 0x2   | NETWORK        | Network boot - See Network boot server tutorial                                                                          |
| 0x3   | RPI BOOT       | RPIBOOT - See usbboot                                                                                                    |
| 0x4   | USB-MSD        | USB mass storage boot - See USB mass storage boot                                                                        |
| 0x5   | BCM-USB-MSD    | USB 2.0 boot from USB Type C socket (CM4: USB type A socket on CM410 board).                                             |
| 0x6   | NVME           | CM4 only: boot from an NVMe SSD connected to the PCIe interface. See NVMe boot for more details.                         |
| 0x7   | HTTP           | HTTP boot over ethernet. See HTTP boot for more details.                                                                 |
| 0xe   | STOP           | Stop and display error pattern. A power cycle is required to exit this state.                                            |
| 0xf   | RESTART        | Restart from the first boot-mode in the BOOT_ORDER field i.e. loop                                                       |

5. Log into the computer with Linux from which you were flashing EEMC drive, in my case it is my DELL laptop.

6. Here you can see that you have to use the recovery directory inside the usbboot software that allows flashing the EEPROM.

7. #### Using usbboot

If you need, you can clone the repository with the command:

```bash
git clone --depth=1 https://github.com/raspberrypi/usbboot
cd usbboot
make
```

And then enter the recovery directory

```bash
cd recovery
```

8. You have to change the line in the file boot.conf

```bash
vim boot.conf
```

9. Change the order according to the below example:

```
BOOT_ORDER=0xf25416

#above boot configuration
NVMe, SD card, USB, USB CM4, Network, Reboot
```

10. Connect the USB - micro USB cable between the computer from which you will flash EEPROM and a powered off CM4 board.

11. Then plug power cord into the CM4 board.

12. Run the below command inside /usbboot/recovery directory

```bash
sudo ./upddate-pieeprom.sh
```

13. Then type the below commands to flash the bootloader

```bash
cd ..
sudo ./rpiboot
```

14. Unplugg the USB to mini USB cable and power plug and jumper (or female to female cable).

15. Connect then the power plug back and then you should see that the Raspberry Pi OS boots up from the EEMC storage.

16. Then connect through SSH or using your keyboard to the command line in Raspberry Pi OS.

17. After that you have to clone the content of the EEMC storage into NVMe drive using the below command:

```bash
sudo dd if=/dev/mmcblk0 of=/dev/nvme0n1 bs=4MB status=progress
```

18. Then you have to delete existing partitions on the EEMC drive and create a one partition instead of two that were created previously (boot and /)

```bash
sudo fdisk /dev/mmcblk0
```

19. Then hit d twice on a keyboard to delete partitions.

20. After that hit keys on a keyboard in this order:

```
1. n - new partition
2. p - primary partition
3. 1 - partition number
4. hit Enter twice to use default first and last sector of the EEMC disk.
5. p - to print the partition table
6. w - to write changes
```

21. Now reboot the Raspberry Pi OS

```bash
sudo reboot
```

22. Check with the ```lsblk``` commmand partitions


23. Then use the below command to resize the root partition and follow the video guide.

```bash
sudo raspi-config
```

24. Then reboot the CM4.

```bash
sudo reboot
```

25. Then check the size of the root filesystem

```
df -kTh /
```

26. After that you can find out that dd did the job, by checking the partition UUID using below commands:

```bash
lsblk
cat /etc/fstab
blkid
```

27. Update the system

```bash
sudo apt update
sudo apt list --upgradable
sudo apt upgrade -y
```

28. You are done. Good job!
