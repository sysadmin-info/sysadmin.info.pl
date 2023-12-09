---
title: Jak połączyć Ulanzi TC001 Smart Pixel Clock przez MQTT z Home Assistant
date: 2023-12-08T12:00:00+00:00
description: Jak połączyć Ulanzi TC001 Smart Pixel Clock przez MQTT z Home Assistant
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
image: images/2023-thumbs/ulanzi02.webp
---

{{<youtube >}}

##### Konfiguracja komunikacji MQTT:

1. Zainstaluj dodatek MQTT w Home Assistant.
2. Skonfiguruj integrację MQTT w Home Assistant.
3. Utwórz użytkownika dla dodatku MQTT (broker MQTT) w Home Assistant.

np. ```mqtt-user```

4. Dodaj użytkownika dla MQTT na Ulanzi TC001 Smart Pixel Clock w sekcji Auth.
5. Przygotuj prosty payload do komunikacji z urządzeniem Ulanzi w dodatku MQTT Mosquito.

```json
{
	"text": "Witaj, Sysadmin!",
	"icon": "1",
	"rainbow": true,
	"duration": 10
}
```
6. Kliknij opublikuj i sprawdź, czy tekst jest widoczny na Ulanzi TC001 Smart Pixel Clock. Niestety to nie jest trwałe rozwiązanie.