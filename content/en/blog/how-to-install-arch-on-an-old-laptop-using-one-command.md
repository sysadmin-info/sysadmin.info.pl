---
title: How to install Arch on an old laptop using one command
date: 2024-04-26T13:00:00+00:00
description: How to install Arch on an old laptop using one command
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
categories:
- Linux
cover:
    image: images/2024-thumbs/arch.webp
---
##### Exercises to complete:
1. Download Arch iso
2. Use dd to copy content of the iso to a USB stick
3. Plug the USB drive into USB port in old laptop
4. Change boot order in BIOS
5. Run Arch from USB stick
6. Execute command to install Arch
7. Credits

{{<youtube iyg1N-XFeRo>}}

##### 1. Download Arch iso

Download iso from here [Arch Linux - Downloads](https://archlinux.org/download/)

##### 2. Use dd to copy content of the iso to a USB stick

```bash
sudo dd bs=4M if=/home/username/Downloads/archlinux-2024.04.01.iso of=/dev/disk/by-id/name-of-the-usb-stick conv=fsync oflag=direct status=progress
```

##### 3. Plug the USB drive into USB port in old laptop

##### 4. Change boot order in BIOS 

See the video

###### 5. Run Arch from USB stick

See the video

##### 6. Execute command to install Arch

```bash
bash <(curl -L christitus.com/archtitus)
```

Provide name, password (twice) and hostname.

Proceed the way I present on the video. 

##### 7. Credits

Chris Titus article: [Installing Arch in 2 Minutes](https://christitus.com/installing-arch-in-2-minutes/)