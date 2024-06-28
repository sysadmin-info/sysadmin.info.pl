---
title: Licznik fanów Twitch na wyświetlaczu Ulanzi TC001 - Samouczek krok po kroku
date: 2024-06-28T18:14:00+00:00
description: Licznik fanów Twitch na wyświetlaczu Ulanzi TC001 - Samouczek krok po kroku
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
image: images/2024-thumbs/ulanzi15.webp
---

Ten samouczek przeprowadzi Cię przez proces zakładania konta dewelopera na Twitch, tworzenia aplikacji, uzyskiwania identyfikatora klienta i tajnego klucza, generowania tokenu oraz importowania schematu Node-RED do interakcji z API Twitch, aby wyświetlić liczbę obserwujących na Ulanzi TC001.

#### Krok 1: Zakładanie konta dewelopera na Twitch

1. **Zaloguj się do Twitch**
   - Przejdź na stronę Twitch i zaloguj się na swoje konto.

2. **Przejdź do Konsoli Dewelopera**
   - Wyszukaj "Twitch developers" w Google i kliknij pierwszy link.
   - W prawym górnym rogu kliknij "Log in with Twitch" aby autoryzować.

3. **Włącz uwierzytelnianie dwuskładnikowe**
   - Przejdź do ustawień konta Twitch.
   - Przejdź do sekcji "Security and Privacy."
   - Włącz uwierzytelnianie dwuskładnikowe, podając swój numer telefonu i postępuj zgodnie z krokami, aby zeskanować kod QR za pomocą aplikacji uwierzytelniającej (Google Authenticator, Authy, itp.).

4. **Zarejestruj swoją aplikację**
   - Kliknij "Register Your Application."
   - Podaj unikalną nazwę dla swojej aplikacji.
   - Wypełnij pola OAuth Redirect URLs odpowiednim URL: <https://api.twitch.tv/helix/channels/followers?broadcaster_id=XXXXXXXXX>
   - Użyj tej strony [convert Twitch username to user ID]{<https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/}> aby uzyskać ID nadawcy.
   - Wybierz kategorię, taką jak "Application Integration."
   - Wybierz "Confidential" jako typ aplikacji.
   - Ukończ CAPTCHA i kliknij "Create."

5. **Wygeneruj identyfikator klienta i tajny klucz**
   - Po utworzeniu aplikacji przejdź do strony zarządzania aplikacją.
   - Skopiuj identyfikator klienta w bezpieczne miejsce.
   - Kliknij "New Secret" aby wygenerować tajny klucz i skopiuj go w bezpieczne miejsce.

#### Krok 2: Generowanie tokenu za pomocą CURL

1. Otwórz terminal lub wiersz poleceń.
2. Użyj następującego polecenia, aby wygenerować token dostępu:

   ```bash
   curl -X POST 'https://id.twitch.tv/oauth2/token' \
   -H 'Content-Type: application/x-www-form-urlencoded' \
   -d 'client_id=YOUR_CLIENT_ID&client_secret=YOUR_SECRET&grant_type=client_credentials'
   ```

   Zamień `YOUR_CLIENT_ID` na swój rzeczywisty identyfikator klienta i `YOUR_SECRET` na swój rzeczywisty tajny klucz.
3. Polecenie zwróci obiekt JSON zawierający Twój token dostępu:

   ```bash
   {"access_token":"YOUR_TOKEN","expires_in":4869067,"token_type":"bearer"}
   ```

#### Krok 3: Importowanie schematu Node-RED

1. **Otwórz Node-RED**
   - Upewnij się, że masz zainstalowany Node-RED w Home Assistant lub jako samodzielną instancję.
   - Otwórz Node-RED z interfejsu Home Assistant lub bezpośrednio, jeśli jest to samodzielna instancja.

2. **Importuj schemat**
   - Skopiuj schemat JSON podany w tym samouczku.
   - W Node-RED kliknij menu hamburgera (trzy poziome linie) w prawym górnym rogu.
   - Wybierz "Import" i wklej schemat JSON. Kliknij "Import" ponownie, aby dodać schemat.

3. **Konfiguracja schematu**
   - Zamień `YOUR_CLIENT_ID`, `YOUR_TOKEN` i `YOUR_BROADCASTER_ID` w schematie na rzeczywiste wartości.
   - Zamień `IP_ADDRESS_MQTT_BROKER` na adres IP swojego brokera MQTT.

Schemat Node-RED Twitch JSON

```json
[
    {
        "id": "6209167e92cacd70",
        "type": "inject",
        "z": "3117f04a786d98f3",
        "g": "52f6d3fda37eb850",
        "name": "",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "3600",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 130,
        "y": 120,
        "wires": [
            [
                "27c650bb0c784414"
            ]
        ]
    },
    {
        "id": "85c884fd4ecc3629",
        "type": "change",
        "z": "3117f04a786d98f3",
        "g": "52f6d3fda37eb850",
        "name": "Client ID and Token",
        "rules": [
            {
                "t": "set",
                "p": "ClientID",
                "pt": "flow",
                "to": "YOUR_CLIENT_ID",
                "tot": "str"
            },
            {
                "t": "set",
                "p": "Token",
                "pt": "flow",
                "to": "Bearer YOUR_TOKEN",
                "tot": "str"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 130,
        "y": 60,
        "wires": [
            [
                "4f857c3cac26b684"
            ]
        ]
    },
    {
        "id": "27c650bb0c784414",
        "type": "function",
        "z": "3117f04a786d98f3",
        "g": "52f6d3fda37eb850",
        "name": "Request followers",
        "func": "msg = {\n    \"headers\" : {\n        \"Client-ID\" : flow.get('ClientID'),\n        \"Authorization\" : flow.get('Token'),\n        \"Accept\" : \"application/vnd.twitchtv.v5+json\"\n    },\n    \"url\" : \"https://api.twitch.tv/helix/channels/followers?broadcaster_id=YOUR_BROADCASTER_ID\"\n}\nreturn msg;",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 320,
        "y": 120,
        "wires": [
            [
                "e474b6579589a570",
                "ad4fcbed6335fb45"
            ]
        ]
    },
    {
        "id": "e474b6579589a570",
        "type": "http request",
        "z": "3117f04a786d98f3",
        "g": "52f6d3fda37eb850",
        "name": "Followers",
        "method": "GET",
        "ret": "obj",
        "paytoqs": "ignore",
        "url": "",
        "tls": "",
        "persist": false,
        "proxy": "",
        "insecureHTTPParser": false,
        "authType": "bearer",
        "senderr": false,
        "headers": [
            {
                "keyType": "other",
                "keyValue": "Client-ID",
                "valueType": "other",
                "valueValue": "YOUR_CLIENT_ID"
            },
            {
                "keyType": "other",
                "keyValue": "Authorization",
                "valueType": "other",
                "valueValue": "Bearer YOUR_TOKEN"
            }
        ],
        "x": 510,
        "y": 120,
        "wires": [
           

 [
                "2cc5ccf2675776dd",
                "aa8044ccaabba288"
            ]
        ]
    },
    {
        "id": "2cc5ccf2675776dd",
        "type": "function",
        "z": "3117f04a786d98f3",
        "g": "52f6d3fda37eb850",
        "name": "Process followers",
        "func": "if (msg.payload && msg.payload.total !== undefined) {\n    var textToSend = msg.payload.total.toString();\n    msg.payload = { \"text\": textToSend, \"icon\": \"20643\", \"duration\": 10 };\n    if (msg.payload.data && msg.payload.data.length > 0) {\n        var lastFollower = msg.payload.data[0].from_login;\n        msg.lastFollower = lastFollower;\n    }\n    return [msg, null];\n} else {\n    node.error('No followers data found', msg);\n    return null;\n}",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 690,
        "y": 120,
        "wires": [
            [
                "3b6cc9057d7586eb",
                "bf2d63effc16047e"
            ]
        ]
    },
    {
        "id": "3b6cc9057d7586eb",
        "type": "mqtt out",
        "z": "3117f04a786d98f3",
        "g": "52f6d3fda37eb850",
        "name": "MQTT Twitch Followers",
        "topic": "awtrix_prefix/custom/twitch",
        "qos": "2",
        "retain": "true",
        "respTopic": "",
        "contentType": "",
        "userProps": "",
        "correl": "",
        "expiry": "",
        "broker": "346df2a95aac5785",
        "x": 930,
        "y": 120,
        "wires": []
    },
    {
        "id": "ad4fcbed6335fb45",
        "type": "debug",
        "z": "3117f04a786d98f3",
        "name": "debug 1",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 320,
        "y": 260,
        "wires": []
    },
    {
        "id": "aa8044ccaabba288",
        "type": "debug",
        "z": "3117f04a786d98f3",
        "name": "debug 2",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 600,
        "y": 260,
        "wires": []
    },
    {
        "id": "bf2d63effc16047e",
        "type": "debug",
        "z": "3117f04a786d98f3",
        "name": "debug 3",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 860,
        "y": 260,
        "wires": []
    },
    {
        "id": "4f857c3cac26b684",
        "type": "debug",
        "z": "3117f04a786d98f3",
        "g": "52f6d3fda37eb850",
        "name": "debug 4",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 380,
        "y": 60,
        "wires": []
    },
    {
        "id": "346df2a95aac5785",
        "type": "mqtt-broker",
        "name": "MQTT HA Broker",
        "broker": "IP_ADDRESS_MQTT_BROKER",
        "port": "1883",
        "clientid": "",
        "autoConnect": true,
        "usetls": false,
        "protocolVersion": "4",
        "keepalive": "60",
        "cleansession": true,
        "autoUnsubscribe": true,
        "birthTopic": "awtrix_prefix",
        "birthQos": "2",
        "birthRetain": "true",
        "birthPayload": "",
        "birthMsg": {},
        "closeTopic": "awtrix_prefix",
        "closeQos": "2",
        "closeRetain": "true",
        "closePayload": "",
        "closeMsg": {},
        "willTopic": "awtrix_prefix",
        "willQos": "2",
        "willRetain": "true",
        "willPayload": "",
        "willMsg": {},
        "userProps": "",
        "sessionExpiry": ""
    }
]
```

4. **Zastosuj schemat**
   - Kliknij "Deploy" w prawym górnym rogu Node-RED, aby zastosować zmiany.
   - Upewnij się, że wszystkie węzły są poprawnie skonfigurowane i połączone.

#### Krok 4: Weryfikacja konfiguracji

1. **Ręczne wywołanie schematu**
   - Ręcznie wywołaj węzeł inject, aby przetestować schemat.
   - Sprawdź węzły debug, czy nie ma błędów lub wyników.

2. **Weryfikacja wiadomości MQTT**
   - Upewnij się, że wiadomości MQTT są poprawnie wysyłane do twojego brokera.

Postępując zgodnie z tymi krokami, pomyślnie utworzysz konto dewelopera Twitch, stworzysz aplikację, wygenerujesz token i zaimportujesz schemat Node-RED do interakcji z API Twitch.

#### Film instruktażowy

{{<youtube XVhkqvqN_bI>}}