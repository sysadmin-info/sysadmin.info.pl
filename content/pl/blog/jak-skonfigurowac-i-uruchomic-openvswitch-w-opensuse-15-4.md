---
title: Jak skonfigurować i uruchomić OpenvSwitch w openSUSE 15.4
date: 2022-10-13T11:00:08+00:00
description: Jak skonfigurować i uruchomić OpenvSwitch w openSUSE 15.4
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
image: images/2022-thumbs/openvswitch.webp
---
{{< youtube 3kh1AvI0otA >}}
<figcaption>Wideo wyjaśnia, jak prawidłowo zainstalować openvswitch w openSUSE 15.4 i skonfigurować go zgodnie z dobrą praktyką. Ujawniam informacje, co powoduje nieprzyjemne zachowanie OpenvSwitch.</figcaption>

Skrypt, który zrobi wszystko za ciebie: <a href="https://github.com/sysadmin-info/openvswitch/blob/main/ovs-suse.sh" target="_blank" rel="noreferrer noopener">https://github.com/sysadmin-info/openvswitch/blob/main/ovs-suse.sh</a>

Pobierz go na serwer, wykonaj chmod +x ovs-suse.sh i uruchom ./ovs-suse.sh