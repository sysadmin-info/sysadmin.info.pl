---
title: Implementacja wyświetlania prognozy pogody w Home Assistant na Ulanzi TC001
date: 2024-03-22T22:10:00+00:00
description: Implementacja wyświetlania prognozy pogody w Home Assistant na Ulanzi TC001
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
    image: images/2024-thumbs/ulanzi13.webp
---

{{<youtube k7aorpEz3yU>}}

Oto uporządkowany samouczek:

**Część 1: Konfiguracja automatyzacji Home Assistant dla danych pogodowych**

1. **Konfiguracja wyzwalacza**: W Home Assistant utwórz automatyzację opartą na czasie, która będzie wykonywana co 10 minut.
2. **Konfiguracja działania**: Użyj usługi `mqtt.publish` do wysyłania danych pogodowych. Sformatuj ładunek z niezbędnymi atrybutami pogodowymi (temperatura, stan, itp.).

```json
{
  "text": "Temperature {{ state_attr('weather.home', 'temperature') }}°C, Humidity {{ state_attr('weather.home', 'humidity') }}%, Wind {{ state_attr('weather.home', 'wind_speed') }}km/h, Pressure {{ state_attr('weather.home', 'pressure') }}hPa",
  "icon": "53288",
  "rainbow": false,
  "duration": 30
}
```

3. **Temat MQTT**: Zdefiniuj unikalny temat MQTT dla tej automatyzacji.
- wzór: `prefix/custom/name_of_the_panel`

**Część 2: Tworzenie schematu Node-RED dla wyświetlacza Ulanzi TC001**

1. **Węzeł wyzwalacza**: Użyj węzła Injektora ustawionego na wyzwalanie co 10 minut.
2. **Dane pogodowe**: Użyj węzła "api-current-state" do pobrania najnowszego stanu pogody z `weather.home`.
3. **Formatowanie danych**: Dodaj węzeł Funkcji, w którym konwertujesz stany pogodowe na komunikaty, używając obiektu mapującego (iconMap) dla warunków pogodowych na identyfikatory ikon specyficzne dla Ulanzi TC001.
4. **Komunikacja MQTT**: Dodaj węzeł "MQTT out" skonfigurowany z danymi twojego brokera, ustawiony na publikowanie sformatowanej wiadomości do Ulanzi TC001.

Ten proces obejmuje pobieranie aktualizacji pogodowych z Home Assistant, formatowanie ich odpowiednio w Node-RED, a następnie wysyłanie sformatowanych danych na wyświetlacz Ulanzi TC001 za pośrednictwem MQTT. Pamiętaj, aby dostosować mapowanie między stanami pogody a identyfikatorami ikon zgodnie z wymaganiami twojego wyświetlacza i dostępnymi ikonami.

Oto schemat w formacie JSON, który możesz zaimportować do Node-RED. Pamiętaj, aby zmienić adres IP i temat wszędzie zgodnie z wyjaśnieniami w filmie.

```json
[
    {
        "id": "c29e36f478fc3db8",
        "type": "tab",
        "label": "Weather Display",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "a372fa45308d730e",
        "type": "group",
        "z": "c29e36f478fc3db8",
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
            "490bf156ccdcccfb",
            "89a06b94a01ea8ca",
            "21c94aafe496d28b",
            "156691c5396806f2"
        ],
        "x": 14,
        "y": 19,
        "w": 1072,
        "h": 82
    },
    {
        "id": "490bf156ccdcccfb",
        "type": "inject",
        "z": "c29e36f478fc3db8",
        "g": "a372fa45308d730e",
        "name": "Send Weather Periodically",
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
        "payload": "",
        "payloadType": "date",
        "x": 180,
        "y": 60,
        "wires": [
            [
                "89a06b94a01ea8ca"
            ]
        ]
    },
    {
        "id": "89a06b94a01ea8ca",
        "type": "api-current-state",
        "z": "c29e36f478fc3db8",
        "g": "a372fa45308d730e",
        "name": "Get Weather State",
        "server": "073a5b0aaf38a13c",
        "version": 3,
        "outputs": 1,
        "halt_if": "",
        "halt_if_type": "str",
        "halt_if_compare": "is",
        "entity_id": "weather.home",
        "state_type": "str",
        "blockInputOverrides": false,
        "outputProperties": [
            {
                "property": "payload",
                "propertyType": "msg",
                "value": "",
                "valueType": "entityState"
            },
            {
                "property": "data",
                "propertyType": "msg",
                "value": "",
                "valueType": "entity"
            }
        ],
        "for": "0",
        "forType": "num",
        "forUnits": "minutes",
        "override_topic": false,
        "state_location": "payload",
        "override_payload": "msg",
        "entity_location": "data",
        "override_data": "msg",
        "x": 430,
        "y": 60,
        "wires": [
            [
                "21c94aafe496d28b"
            ]
        ]
    },
    {
        "id": "801b22e036cb3913",
        "type": "function",
        "z": "563f3f5c2595232d",
        "g": "167b4fee447b386d",
        "name": "Format Weather Message",
        "func": "var state = msg.data.state;\nvar iconMap={\n    \"sunny\": \"11201\",\n    \"partlycloudy\": \"22586\",\n    \"cloudy\": \"2283\",\n    \"rainy\": \"53288\",\n    \"snowy\": \"4702\",\n    \"fog\": \"56703\"\n};\nvar iconId = iconMap[state.toLowerCase()] || \"16754\"\n\nvar temperature = msg.data.attributes.temperature;\nvar humidity = msg.data.attributes.humidity;\nvar windSpeed = msg.data.attributes.wind_speed;\nvar pressure = msg.data.attributes.pressure;\n\nmsg.payload = {\n    \"text\": `Temp: ${temperature}°C, Hum: ${humidity}%, Wind: ${windSpeed} km/h, Pressure: ${pressure} hPa`,\n    \"icon\": `${iconId}`, // Change based on your icon system\n    \"duration\": 30\n};\n\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 670,
        "y": 60,
        "wires": [
            [
                "74740f68df8feb6a"
            ]
        ]
    },
    {
        "id": "156691c5396806f2",
        "type": "mqtt out",
        "z": "c29e36f478fc3db8",
        "g": "a372fa45308d730e",
        "name": "Publish Weather to MQTT",
        "topic": "awtrix_prefix/custom/weather",
        "qos": "2",
        "retain": "false",
        "respTopic": "",
        "contentType": "",
        "userProps": "",
        "correl": "",
        "expiry": "",
        "broker": "346df2a95aac5785",
        "x": 950,
        "y": 60,
        "wires": []
    },
    {
        "id": "073a5b0aaf38a13c",
        "type": "server",
        "name": "Home Assistant",
        "version": 5,
        "addon": false,
        "rejectUnauthorizedCerts": false,
        "ha_boolean": "y|yes|true|on|home|open",
        "connectionDelay": true,
        "cacheJson": true,
        "heartbeat": false,
        "heartbeatInterval": "30",
        "areaSelector": "friendlyName",
        "deviceSelector": "friendlyName",
        "entitySelector": "friendlyName",
        "statusSeparator": ": ",
        "statusYear": "hidden",
        "statusMonth": "short",
        "statusDay": "numeric",
        "statusHourCycle": "default",
        "statusTimeFormat": "h:m",
        "enableGlobalContextStore": false
    },
    {
        "id": "346df2a95aac5785",
        "type": "mqtt-broker",
        "name": "MQTT HA Broker",
        "broker": "192.168.0.1",
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

Ten schemat Node-RED jest zaprojektowany do pobierania bieżącego stanu pogody z Home Assistant, a dokładnie z jednostki `weather.home`. Przetwarza takie atrybuty jak temperatura, wilgotność, prędkość wiatru i ciśnienie, mapując je na strukturyzowane dane wyjściowe. Ponadto, schemat przekłada warunki pogodowe na specyficzne kody ikon na podstawie wcześniej zdefiniowanych mapowań, przygotowując dane wyjściowe do wyświetlenia na urządzeniu Ulanzi TC001 za pośrednictwem MQTT. To podejście zapewnia, że aktualizacje pogody w czasie rzeczywistym są wizualnie reprezentowane na urządzeniu Ulanzi. Jeśli masz jakiekolwiek konkretne pytania lub potrzebujesz dalszych dostosowań, daj mi znać!