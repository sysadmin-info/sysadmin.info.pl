---
title: A simple guide to the Home Assistant weather forecast displayed  on Ulanzi TC001
date: 2024-03-22T22:10:00+00:00
description: A simple guide to the Home Assistant weather forecast displayed  on Ulanzi TC001
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

Here is a structured tutorial:

**Part 1: Setting up Home Assistant Automation for Weather Data**

1. **Trigger Setup**: In Home Assistant, create a time-based automation to execute every 10 minutes.
2. **Action Configuration**: Utilize the `mqtt.publish` service to send the weather data. Format the payload with necessary weather attributes (temperature, condition, etc.).

```json
{
  "text": "Temp {{ state_attr('weather.home', 'temperature') }}°C, Humidity {{ state_attr('weather.home', 'humidity') }}%, Wind {{ state_attr('weather.home', 'wind_speed') }}km/h, Pressure {{ state_attr('weather.home', 'pressure') }}hPa",
  "icon": "53288",
  "rainbow": false,
  "duration": 30
}
```

3. **MQTT Topic**: Define a unique MQTT topic for this automation.
- pattern: `prefix/custom/name_of_the_panel`

**Part 2: Creating a Node-RED Flow for Ulanzi TC001 Display**

1. **Trigger Node**: Use an Inject node set to trigger every 10 minutes.
2. **Weather Data**: Utilize an "api-current-state" node to fetch the latest weather state from `weather.home`.
3. **Data Formatting**: Add a Function node where you convert weather states into messages, using a mapping object (iconMap) for weather conditions to icon IDs specific to Ulanzi TC001.
4. **MQTT Communication**: Add an "MQTT out" node configured with your broker details, and set to publish the formatted message to the Ulanzi TC001.

This process includes fetching weather updates from Home Assistant, formatting them appropriately in Node-RED, and then sending the formatted data to the Ulanzi TC001 display via MQTT. Remember to adjust the mapping between weather states and icon IDs according to your display's requirements and the available icons.

Here is the flow in json format that you can import to Node-RED. Remember to change the IP address and topic everywhere according to the explanation in the video.

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

This Node-RED flow is designed to fetch the current weather state from Home Assistant, specifically from the `weather.home` entity. It processes attributes such as temperature, humidity, wind speed, and pressure, mapping them into a structured payload. Additionally, the flow translates the weather condition into a specific icon code based on predefined mappings, preparing the payload for display on the Ulanzi TC001 device through MQTT. This approach ensures real-time weather updates are visually represented on the Ulanzi device. If you have any specific questions or need further customization, let me know!