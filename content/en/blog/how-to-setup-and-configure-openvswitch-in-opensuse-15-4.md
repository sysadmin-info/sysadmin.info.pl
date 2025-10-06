---
title: How to setup and configure OpenvSwitch in openSUSE 15.4
date: 2022-10-13T11:00:08+00:00
description: How to setup and configure OpenvSwitch in openSUSE 15.4
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
series:
- Qemu KVM
categories:
- Linux
- OpenvSwitch
cover:
    image: images/2022-thumbs/openvswitch.webp
---
{{< youtube 3kh1AvI0otA >}}
<figcaption>The video explains how to properly install openvswitch in openSUSE 15.4 and configure it according to good practice. I reveal the information what causes the ugly behavior of the OpenvSwitch.</figcaption>

The script which will do everything for you: <a href="https://github.com/sysadmin-info/openvswitch/blob/main/ovs-suse.sh" target="_blank" rel="noreferrer noopener">https://github.com/sysadmin-info/openvswitch/blob/main/ovs-suse.sh</a>

Download it to the server, chmod +x ovs-suse.sh and run ./ovs-suse.sh