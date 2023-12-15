---
title: Jak rozwiązać błąd wczytywania poświadczeń Syntax Error Unexpected token in JSON na pozycji 0 w Node-RED
date: 2023-12-15T10:00:00+00:00
description: Jak rozwiązać błąd wczytywania poświadczeń Syntax Error Unexpected token in JSON na pozycji 0 w Node-RED
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
image: images/2023-thumbs/ulanzi05.webp
---

{{<youtube uoCS3JBTasY>}}

Aby rozwiązać problem
```markdown
[warn] Error loading credentials: SyntaxError: Unexpected token in JSON at position 0
```
który faktycznie blokuje odświeżanie informacji na ekranie zegara Ulanzi TC001 Smart Pixel Clock, należy wykonać poniższe kroki. Oczywiście, jeśli używasz samodzielnej instancji Node-RED zamiast dodatku Home Assistant, możesz po prostu zalogować się do swojej instancji i wykonać wymienione polecenia.

1. Zainstaluj dodatek SSH w Home Assistant
2. Użyj poniższych poleceń, jeden po drugim, aby rozwiązać problem:
```bash
find / -name "*nodered*"
# Pamiętaj, że ciąg znaków po podkreśleniu może być inny niż podany
cd /addon_config/a0d7b954_nodered/
cat .config.runtime.json
mv .config.runtime.json .bla.config.runtime.json.bak
```
3. Zrestartuj Node-RED
4. Podaj użytkownika i hasło brokera MQTT w połączeniu MQTT w każdym przepływie lub podaj użytkownika i hasło do panelu GUI internetowego Ulanzi TC001 (niektóre przepływy łączą się bezpośrednio z urządzeniem Ulanzi za pomocą adresu IP).
5. Wdrożenie
6. Problem rozwiązany