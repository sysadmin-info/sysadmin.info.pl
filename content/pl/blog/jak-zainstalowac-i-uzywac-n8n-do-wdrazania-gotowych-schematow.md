---
title: Jak zainstalować i używać n8n do wdrażania gotowych schematów
date: 2023-12-15T14:00:00+00:00
description: Jak zainstalować i używać n8n - narzędzia do automatyzacji schematu pracy, aby wdrażać gotowe schematy na Ulanzi TC001
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
image: images/2023-thumbs/ulanzi06.webp
---

{{<youtube Y4xX-gOIDQo>}}

1. Zainstaluj nala w Debianie 12

```bash
sudo apt install nala -y
```

2. Zainstaluj nodejs i npm
```bash
sudo nala install nodejs npm -y
# lub
sudo apt install nodejs npm -y
```

3. Sprawdź wersje
```bash
nodejs --version
npm --version
```

4. Uruchom n8n
```bash
npx n98
```

5. Aby uruchomić n8n w tle, zainstaluj screen

```bash
sudo nala install screen -y
```

6. Uruchom screen

```bash
screen
```

7. Uruchom n8n

```bash
npx n8n
```

8. Odłącz sesję screen za pomocą poniższej kombinacji:

```
ctrl+a i ctrl+d #aby odłączyć
```

9. Ponownie podłącz sesję screen za pomocą poniższego polecenia:

```bash
screen -r
```

10. Sprawdź adres IP maszyny, na której działa n8n, za pomocą poniższego polecenia:

```bash
hostname -I
```

11. Zaloguj się w swojej przeglądarce internetowej używając schematu URL: http://IP_address:5678 (5678 to port).

12. Postępuj zgodnie z instrukcjami wideo, aby zobaczyć, jak importować i uruchamiać schemat w n8n.