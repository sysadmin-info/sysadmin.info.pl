---
title: Jak rozwiązać błąd parsera JSON w gotowym schemacie Node-RED z animacjami
date: 2023-12-09T14:00:00+00:00
description: Jak rozwiązać błąd parsera JSON w gotowym schemacie Node-RED z animacjami
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Ulanzi TC001 Smart Pixel Clock
categories:
- Home Assistant
image: images/2023-thumbs/ulanzi04.webp
---

{{<youtube xjhPrCVNnLA>}}

1. Zaimportuj do Node-RED schemat stąd: [Schemat efektów/animacji losowych](https://flows.blueforcer.de/flow/zB235ed0OrLJ)
2. Zmień w pschemacie AwtrixUlanzi/CustomApp przetworzony obiekt json na łańcuch znaków UTF-8.
3. Zastosuj zmiany
4. Problem rozwiązany