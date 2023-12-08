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

{{<youtube 3nlCNo_33z4>}}

##### Konfiguracja komunikacji MQTT:

1. Zainstaluj dodatek MQTT w Home Assistant.
2. Skonfiguruj integrację MQTT w Home Assistant.
3. Utwórz użytkownika dla dodatku MQTT (broker MQTT) w Home Assistant.

np. ```mqtt-user```

4. Skonfiguruj integrację w Ustawienia -> Urządzenia i usługi, dodaj integrację i wybierz MQTT. Zobacz wideo.
Potrzebujesz adresu IP Home Assistant do ustawienia brokera MQTT Mosquitto, więc przejdź do Ustawienia -> System -> Sieć, kliknij trzy kropki i skopiuj adres IP bez maski.
5. Dodaj użytkownika dla MQTT na Ulanzi TC001 Smart Pixel Clock w sekcji Auth.
6. Przygotuj prosty payload do komunikacji z urządzeniem Ulanzi w dodatku MQTT Mosquito.

```json
{
	"text": "Witaj, Sysadmin!",
	"icon": "1",
	"rainbow": true,
	"duration": 10
}
```
Dodaj temat w ten sposób: 

```awtrix_b6d76c/notify```

I zmień ikonę, korzystając z tej strony internetowej: ikony - zobacz tutorial wideo, aby dowiedzieć się, jak to działa.

7. Kliknij opublikuj i sprawdź, czy tekst jest widoczny na Ulanzi TC001 Smart Pixel Clock. Niestety to nie jest trwałe rozwiązanie.