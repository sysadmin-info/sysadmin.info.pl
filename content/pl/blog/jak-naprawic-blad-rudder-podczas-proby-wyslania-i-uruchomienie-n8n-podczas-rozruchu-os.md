---
title: Jak naprawić błąd Rudder podczas próby wysłania i uruchomienie n8n podczas rozruchu OS
date: 2023-12-19T10:00:00+00:00
description: Jak naprawić błąd Rudder podczas próby wysłania i uruchomienie n8n podczas rozruchu OS
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
cover:
    image: images/2023-thumbs/ulanzi07.webp
---

{{<youtube MUKxFsdKeA0>}}

#### Jak rozwiązać poniższy problem:

```
[Rudder] error: got error while attempting send for 3 times, dropping 3 events
```

Domyślnie, samodzielnie hostowana instancja n8n wysyła dane na serwery n8n. Pozwala to n8n wysyłać użytkownikom powiadomienia o dostępnych aktualizacjach, umożliwia dostęp do szablonów przepływu pracy i dostarcza n8n informacje diagnostyczne.

Jeśli musisz zapobiec połączeniu twojej instancji n8n z serwerami n8n, użyj zmiennych środowiskowych, aby wyłączyć ustawienia powodujące połączenie twojej instancji z serwerami n8n.

##### Wyłącz diagnostykę, powiadomienia i szablony przepływu pracy.

Musisz stworzyć plik .env w katalogu .n8n

```bash
vim /home/$USER/.n8n/.env
```

i wkleić poniższą zawartość

```vim
N8N_DIAGNOSTICS_ENABLED=false
N8N_VERSION_NOTIFICATIONS_ENABLED=false
N8N_TEMPLATES_ENABLED=false
```

Zapisz i wyjdź.

Zrestartuj n8n

Źródło: [Izolacja n8n](https://docs.n8n.io/hosting/environment-variables/configuration-examples/isolation/)

##### Jak uruchomić n8n podczas startu?

Stwórz skrypt:

```bash
vim /home/$USER/start-n8n.sh
```

Wklej poniższą zawartość:

```vim
#!/bin/bash

# Uruchom n8n w oddzielonej sesji screen
screen -dmS n8n bash -c "npx n8n"

# Poczekaj chwilę, aby upewnić się, że n8n działa
sleep 10

# Użyj poleceń xdotool w tej samej sesji screen
# Zakładając, że polecenia xdotool są przeznaczone do interakcji z n8n
screen -S n8n -X stuff $'xdotool key ctrl+a\nxdotool key ctrl+d\nexit\n'
```

Zapisz i wyjdź.

##### Zainstaluj xdotool

```bash
sudo apt install xdotool -y
```

##### Nadaj skryptowi prawa do wykonania:

```bash
chmod +x start-n8n.sh
```

#### Dodaj skrypt do crontaba:

```bash
crontab -e
```

Dodaj poniższy wpis:

```vim
@reboot /home/$USER/start-n8n.sh
```

Zapisz i wyjdź. 

##### Uruchom skrypt 

```bash
cd ~
./start-n8n.sh
```

Zrobione, świetna robota.