---
title: Ustawianie automatycznego wysyłania powiadomień MQTT przez Node-RED w Home Assistant
date: 2024-03-24T17:00:00+00:00
description: Naucz się konfigurować i dostosowywać przepływ Node-RED w Home Assistant, aby automatycznie wysyłać powiadomienia MQTT, które umożliwią Ci tworzenie spersonalizowanych alertów dla Twoich urządzeń IoT.
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Ulanzi TC001 Inteligentny Zegar Pikselowy
categories:
- Home Assistant
image: images/2024-thumbs/ulanzi14.webp
---

{{<youtube zxkmbv7q6r4>}}

### Krok 1: Dostęp do Node-RED

1. Otwórz Home Assistant.
2. Przejdź do sekcji z dodatkami i znajdź Node-RED.
3. Otwórz interfejs Node-RED, aby rozpocząć pracę.

### Krok 2: Importowanie schematu

1. W interfejsie Node-RED, otwórz menu w prawym górnym rogu.
2. Wybierz opcję "Importuj" z menu.
3. Skopiuj podany kod JSON.
4. Wklej kod do okna dialogowego importu.
5. Zatwierdź import, klikając "Importuj".

```json
[
    {
        "id": "a96270e425179e4a",
        "type": "tab",
        "label": "Subs",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "b29251f338c92d7b",
        "type": "group",
        "z": "a96270e425179e4a",
        "style": {
            "stroke": "#3d3e46",
            "stroke-opacity": "1",
            "fill": "#21222c",
            "fill-opacity": "0.5",
            "label": true,
            "label-position": "nw",
            "color": "#f8f8f2"
        },
        "nodes": [
            "inject1",
            "function1",
            "mqtt1"
        ],
        "x": 14,
        "y": 19,
        "w": 812,
        "h": 82
    },
    {
        "id": "inject1",
        "type": "inject",
        "z": "a96270e425179e4a",
        "g": "b29251f338c92d7b",
        "name": "Wysyłaj cyklicznie",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "600",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "Like and subscribe",
        "payloadType": "str",
        "x": 150,
        "y": 60,
        "wires": [
            [
                "function1"
            ]
        ]
    },
    {
        "id": "function1",
        "type": "function",
        "z": "a96270e425179e4a",
        "g": "b29251f338c92d7b",
        "name": "Przygotuj komunikat z ikoną",
        "func": "// Tekst do wysłania\nvar textToSend = 'Like and subscribe';\n\n// Tworzenie obiektu payload zgodnie z przykładem Instagram\nmsg.payload = {\n    \"text\": textToSend,\n    \"icon\": \"10516\", // Nazwa ikony, zmień zgodnie z potrzebami\n    \"duration\": 10 // Czas trwania wyświetlania, możesz dostosować\n};\n\nreturn msg;",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 400,
        "y": 60,
        "wires": [
            [
                "mqtt1"
            ]
        ]
    },
    {
        "id": "mqtt1",
        "type": "mqtt out",
        "z": "a96270e425179e4a",
        "g": "b29251f338c92d7b",
        "name": "Wyślij tekst do MQTT",
        "topic": "awtrix_b6d76c/custom/subs",
        "qos": "2",
        "retain": "false",
        "respTopic": "",
        "contentType": "",
        "userProps": "",
        "correl": "",
        "expiry": "",
        "broker": "346df2a95aac5785",
        "x": 680,
        "y": 60,
        "wires": []
    },
    {
        "id": "346df2a95aac5785",
        "type": "mqtt-broker",
        "name": "MQTT HA Broker",
        "broker": "10.10.0.100",
        "port": "1883",
        "clientid": "",
        "autoConnect": true,
        "usetls": false,
        "protocolVersion": "4",
        "keepalive": "60",
        "cleansession": true,
        "autoUnsubscribe": true,
        "birthTopic": "awtrix_b6d76c",
        "birthQos": "2",
        "birthRetain": "true",
        "birthPayload": "",
        "birthMsg": {},
        "closeTopic": "awtrix_b6d76c",
        "closeQos": "2",
        "closeRetain": "true",
        "closePayload": "",
        "closeMsg": {},
        "willTopic": "awtrix_b6d76c",
        "willQos": "2",
        "willRetain": "true",
        "willPayload": "",
        "willMsg": {},
        "userProps": "",
        "sessionExpiry": ""
    }
]
```

### Krok 3: Zrozumienie schematu

Ten schemat jest zaprojektowany do okresowego wysyłania wiadomości do tematu MQTT. Przeanalizujmy każdy węzeł:

#### Węzeł inicjujący (inject1)
- Ten węzeł wstrzykuje wiadomość do schematu w regularnych odstępach czasu (w tym przypadku co 600 sekund).
- Wysyła ładunek "Lajkuj i subskrybuj".

#### Węzeł funkcji (function1)
- Ten węzeł przygotowuje wiadomość do wysłania do brokera MQTT.
- Pobiera ładunek z węzła inicjującego i konstruuje nowy obiekt wiadomości.
- Obiekt wiadomości zawiera:
  - `text`: Tekst do wyświetlenia ("Lajkuj i subskrybuj").
  - `icon`: Identyfikator ikony (w tym przypadku "10516").
  - `duration`: Czas, przez który wiadomość będzie wyświetlana (10 sekund).
- Skonstruowany obiekt wiadomości jest następnie wysyłany do kolejnego węzła.

#### Węzeł wyjścia MQTT (mqtt1)
- Ten węzeł wysyła przygotowaną wiadomość do tematu MQTT.
- **Uwaga**: Musisz dostosować ustawienia brokera MQTT:
  - Dodaj adres IP swojego brokera MQTT w polu "Serwer".
  - Określ temat, do którego powinna być wysłana wiadomość, w polu "Temat".
  - Dodaj nazwę użytkownika swojego brokera MQTT w polu "Użytkownik" (jeśli jest wymagane).
- Wiadomość jest wysyłana do określonego tematu MQTT za pomocą skonfigurowanego brokera.

### Krok 4: Podsumowanie
- Ten schemat okresowo wysyła wiadomość zawierającą "Lajkuj i subskrybuj" do określonego tematu MQTT w schemacie.
- **Uwaga**: Przed uruchomieniem schematu, upewnij się, że dostosowałeś ustawienia brokera MQTT z odpowiednim adresem IP, tematem i nazwą użytkownika.
- Zawartość wiadomości może być dostosowana w węźle funkcji zgodnie z Twoimi wymaganiami.

Postępując zgodnie z tymi krokami i dostosowując niezbędne ustawienia, możesz skutecznie skonfigurować i wykorzystać ten schemat Node-RED w swoim środowisku. Daj mi znać, jeśli potrzebujesz dalszej pomocy!