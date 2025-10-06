---
title: How to setup and configure OpenvSwitch in Debian 11
date: 2022-10-15T14:36:56+00:00
description: How to setup and configure OpenvSwitch in Debian 11
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
    image: images/2022-thumbs/openvswitch-debian.webp
---
{{< youtube ogFsgKaRk-8 >}}
<figcaption>The video explains how to properly install openvswitch in Debian 11 and configure it according to good practice. I reveal the information what causes the ugly behavior of the OpenvSwitch.</figcaption>

The script which will do everything for you: <a href="https://github.com/sysadmin-info/openvswitch/blob/main/ovs-debian.sh" target="_blank" rel="noreferrer noopener">https://github.com/sysadmin-info/openvswitch/blob/main/ovs-debian.sh</a>

Download it to the server, chmod +x ovs-debian.sh and run ./ovs-debian.sh