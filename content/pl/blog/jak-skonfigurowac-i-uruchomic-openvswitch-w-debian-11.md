---
title: Jak skonfigurować i uruchomić OpenvSwitch w Debian 11
date: 2022-10-15T14:36:56+00:00
description: Jak skonfigurować i uruchomić OpenvSwitch w Debian 11
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
<figcaption>Wideo wyjaśnia, jak prawidłowo zainstalować openvswitch w Debian 11 i skonfigurować go zgodnie z dobrą praktyką. Ujawniam informacje, co powoduje nieprzyjemne zachowanie OpenvSwitch.</figcaption>

Skrypt, który zrobi wszystko za ciebie: <a href="https://github.com/sysadmin-info/openvswitch/blob/main/ovs-debian.sh" target="_blank" rel="noreferrer noopener">https://github.com/sysadmin-info/openvswitch/blob/main/ovs-debian.sh</a>

Pobierz go na serwer, wykonaj chmod +x ovs-debian.sh i uruchom ./ovs-debian.sh