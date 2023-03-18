---
title: "The system does not find the root partition, installed on lvm"
date: 2020-09-20T10:37:17+00:00
description: "The system does not find the root partition, installed on lvm"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
tags:
- LVM
- root partition missing
series:
- 
categories:
- Linux
image: images/2020-thumbs/linux-cli.png
---
Article shows how to solve the issue with missing swap and plymouthd sigrtmin error, when swap is not created as LVM, but as a standard swap.

<!--more-->

Boot-Message:

```
dracut-initqueue[279] Warning: Could not boot
dracut-initqueue[279] Warning; /dev/mapper/rhel_…-root does not exit
sigrtmin+20 from PID 297 plymouthd
```

Last error is because of mounting swap failed.

The solution is really simple. Check is standard swap is on with command:

```
swapon -s
```

Check where swap is mounted in /etc/fstab

```
cat /etc/fstab | grep -i swap
```

If it will show something similar to this:

```
/dev/sdc    swap swap defaults 0 0
```

Turn off swap:

```
swapoff /dev/sdc
```

Then extend the logical group for example rhel, create logical volume swap in rhel volume group and make a swap on this logical volume:

```
vgextend rhel /dev/sdc
lvcreate rhel -n swap -L 1024M
mkswap /dev/rhel/swap
```

Add the following entry in /etc/fstab instead /dev/sdc

```
/dev/rhel/swap swap swap defaults 0 0
```

Enable swap

```
swapon -v /dev/rhel/swap
```

Example: Change this:

```
GRUB_CMDLINE_LINUX="rd.lvm.lv=rootVG/root rd.lvm.lv=oldnameVG/swapLV rhgb quiet"
```

To this:

```
GRUB_CMDLINE_LINUX="rd.lvm.lv=rootVG/root rd.lvm.lv=rhel/swap rhgb quiet"
```

When that is completed, you 'll want to regenerate the grub config:

```
grub2-mkconfig -o /boot/grub2/grub.cfg
```

You can verify that it worked by looking at /boot/grub2/grub.cfg and verifying that swap is now pointed at the correct VG/LV

```
cat /boot/grub2/grub.cfg
```

It should contain this:

```
GRUB_CMDLINE_LINUX="rd.lvm.lv=rootVG/root rd.lvm.lv=rhel/swap rhgb quiet"
```