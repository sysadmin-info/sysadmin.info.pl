---
title: Jak zamontować dysk NVMe w płycie CM4 przy użyciu adaptera PCIe
date: 2023-07-18T13:45:00+00:00
description: Jak zamontować dysk NVMe w płycie CM4 przy użyciu adaptera PCIe
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- water cooling dla CM4 / Raspberry Pi
categories:
- Raspberry Pi
cover:
    image: images/2023-thumbs/How to mount NVMe drive in CM4 board.webp
---


#### Instrukcje wideo

##### Wstęp

{{<youtube 0ZcbCJ1I8U0>}}

##### Samouczek

{{<youtube eiIjcACOCv4>}}

1. Włóż dysk NVMe do adaptera PCIe.
2. Włóż adapter PCIe do gniazda PCIe na płycie CM4.
3. Podłącz zasilanie i uruchom Raspberry Pi OS.
4. Sprawdź wersję firmware za pomocą poniższego polecenia:

```bash
vcgencmd version
```

5. Sprawdź status dysku NVMe za pomocą poniższych poleceń:

```bash
lsblk
blkid
```

6. Wyłącz Raspberry Pi OS za pomocą poniższego polecenia:

```bash
sudo systemctl poweroff
```