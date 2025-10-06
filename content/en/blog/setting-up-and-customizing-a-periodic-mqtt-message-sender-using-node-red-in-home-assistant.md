---
title: Setting up and customizing a periodic MQTT message sender using Node-RED in Home Assistant
date: 2024-03-24T17:00:00+00:00
description: Learn how to configure and personalize a Node-RED flow within Home Assistant to send periodic MQTT messages, enabling customized notifications and alerts for your IoT projects.
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
    image: images/2024-thumbs/ulanzi14.webp
---

{{<youtube zxkmbv7q6r4>}}

### Step 1: Accessing Node-RED

1. Open your Home Assistant instance.
2. Navigate to the Node-RED addon.
3. Click on the addon to open the Node-RED editor.

### Step 2: Importing the Flow

1. In the Node-RED editor, click on the menu icon in the top-right corner.
2. Select "Import" from the dropdown menu.
3. Copy the provided flow JSON.
4. Paste the JSON into the import dialog box.
5. Click "Import" to import the flow.

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
        "name": "Send periodically",
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
        "name": "Prepare message with icon",
        "func": "// Text to send\nvar textToSend = 'Like and subscribe';\n\n// Creating payload object according to the example\nmsg.payload = {\n    \"text\": textToSend,\n    \"icon\": \"10516\", // Icon name, change as needed\n    \"duration\": 10 // Display duration, you can adjust\n};\n\nreturn msg;",
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
        "name": "Publish Text to MQTT",
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

### Step 3: Understanding the Flow

This flow is designed to periodically send a message to an MQTT topic. Let's break down each node:

#### Inject Node (inject1)
- This node injects a message into the flow at regular intervals (every 600 seconds in this case).
- It sends the payload "Like and subscribe".

#### Function Node (function1)
- This node prepares the message to be sent to the MQTT broker.
- It takes the payload from the inject node and constructs a new message object.
- The message object contains:
  - `text`: The text to be displayed ("Like and subscribe").
  - `icon`: An icon identifier (in this case, "10516").
  - `duration`: The duration for which the message will be displayed (10 seconds).
- The constructed message object is then sent to the next node.

#### MQTT Out Node (mqtt1)
- This node sends the prepared message to an MQTT topic.
- **Note**: You need to customize the MQTT broker settings:
  - Add the IP address of your MQTT broker in the "Server" field.
  - Specify the topic to which the message should be sent in the "Topic" field.
  - Add the username of your MQTT broker in the "User" field (if required).
- The message is sent to the specified MQTT topic using the configured broker.

### Step 4: Summary
- This flow periodically sends a message containing "Like and subscribe" to the MQTT topic specified in the flow.
- **Note**: Before deploying the flow, ensure you customize the MQTT broker settings with the appropriate IP address, topic, and username.
- The message content can be customized in the function node according to your requirements.

By following these steps and customizing the necessary settings, you can set up and utilize this Node-RED flow effectively in your environment. Let me know if you need further assistance!