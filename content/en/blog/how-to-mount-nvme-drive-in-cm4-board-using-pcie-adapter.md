---
title: How to mount NVMe drive in CM4 board using PCIe adapter
date: 2023-07-18T13:45:00+00:00
description: How to mount NVMe drive in CM4 board using PCIe adapter
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
    image: images/2023-thumbs/How to mount NVMe drive in CM4 board.webp
---


#### Video Instructions

##### Introduction

{{<youtube 0ZcbCJ1I8U0>}}

##### Tutorial

{{<youtube eiIjcACOCv4>}}

1. Put the NVMe drive into the PCIe adapter.
2. Put the PCIe adapetr into CM4 board PCIe slot.
3. Plug the power and boot the Raspberry Pi OS.
4. Check the version of the firmware with the below command:

```bash
vcgencmd version
```

5. Check the status of the NVMe drive with below commands:

```bash
lsblk
blkid
```

6. Poweroff the Raspberry PI OS with the below command:

```bash
sudo systemctl poweroff
```