---
title: Jak zainstalować Arch na starym laptopie jednym poleceniem
date: 2024-04-26T13:00:00+00:00
description: Jak zainstalować Arch na starym laptopie jednym poleceniem
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
##### Ćwiczenia do wykonania:
1. Pobierz iso Arch
2. Użyj dd, aby skopiować zawartość iso na pendrive
3. Włóż pendrive do portu USB w starym laptopie
4. Zmień kolejność bootowania w BIOS
5. Uruchom Arch z pendrive'a
6. Wykonaj polecenie instalujące Arch
7. Podziękowania

{{<youtube iyg1N-XFeRo>}}

##### 1. Pobierz iso Arch

Pobierz iso stąd [Arch Linux - Pobieranie](https://archlinux.org/download/)

##### 2. Użyj dd, aby skopiować zawartość iso na pendrive

```bash
sudo dd bs=4M if=/home/username/Downloads/archlinux-2024.04.01.iso of=/dev/disk/by-id/name-of-the-usb-stick conv=fsync oflag=direct status=progress
```

##### 3. Włóż pendrive do portu USB w starym laptopie

##### 4. Zmień kolejność bootowania w BIOS 

Zobacz wideo

###### 5. Uruchom Arch z pendrive

Zobacz wideo

##### 6. Wykonaj polecenie instalacji Arch

```bash
bash <(curl -L christitus.com/archtitus)
```

Podaj nazwę, hasło (dwukrotnie) i nazwę hosta.

Postępuj zgodnie z tym, co prezentuję na wideo. 

##### 7. Podziękowania

Artykuł Chrisa Titusa: [Instalacja Arch w 2 Minuty](https://christitus.com/installing-arch-in-2-minutes/)