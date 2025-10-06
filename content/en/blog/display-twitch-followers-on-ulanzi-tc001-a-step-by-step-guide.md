---
title: Display Twitch Followers on Ulanzi TC001 - A Step-by-Step Tutorial with Node-RED and Home Assistant
date: 2024-06-28T18:14:00+00:00
description: Display Twitch Followers on Ulanzi TC001 - A Step-by-Step Tutorial with Node-RED and Home Assistant
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
    image: images/2024-thumbs/ulanzi15.webp
---

This tutorial will guide you through the process of setting up a developer account on Twitch, creating an application, obtaining a client ID and secret, generating a token, and importing a Node-RED flow to interact with the Twitch API to display Twitch followers number on a Ulanzi TC001.

#### Step 1: Setting Up a Developer Account on Twitch

1. **Log in to Twitch**
   - Go to the Twitch website and log in to your account.

2. **Navigate to the Developer Console**
   - Search for "Twitch developers" on Google and click the first link.
   - In the top right corner, click on "Log in with Twitch" to authorize.

3. **Enable Two-Factor Authentication**
   - Go to your Twitch account settings.
   - Navigate to "Security and Privacy."
   - Enable two-factor authentication by providing your phone number and following the steps to scan the QR code with an authenticator app (Google Authenticator, Authy, etc.).

4. **Register Your Application**
   - Click on "Register Your Application."
   - Provide a unique name for your application.
   - Fill in the OAuth Redirect URLs with the necessary URL: [https://api.twitch.tv/helix/channels/followers?broadcaster_id=XXXXXXXXX](https://api.twitch.tv/helix/channels/followers?broadcaster_id=XXXXXXXXX)
   - Use this website [convert Twitch username to user ID](https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/) to get the broadcaster ID.
   - Select a category such as "Application Integration."
   - Choose "Confidential" for the application type.
   - Complete the CAPTCHA and click "Create."

5. **Generate Client ID and Secret**
   - Once your application is created, navigate to the application management page.
   - Copy the client ID to a secure location.
   - Click "New Secret" to generate a client secret and copy it to a secure location.

#### Step 2: Generate a Token Using CURL

1. Open a terminal or command prompt.
2. Use the following command to generate an access token:

   ```bash
   curl -X POST 'https://id.twitch.tv/oauth2/token' \
   -H 'Content-Type: application/x-www-form-urlencoded' \
   -d 'client_id=YOUR_CLIENT_ID&client_secret=YOUR_SECRET&grant_type=client_credentials'
   ```

   Replace `YOUR_CLIENT_ID` with your actual client ID and `YOUR_SECRET` with your actual client secret.
3. The command will return a JSON object containing your access token:

   ```bash
   {"access_token":"YOUR_TOKEN","expires_in":4869067,"token_type":"bearer"}
   ```

#### Step 3: Importing Node-RED Flow

1. **Open Node-RED**
   - Ensure you have Node-RED installed in your Home Assistant or as a standalone instance.
   - Open Node-RED from the Home Assistant interface or directly if standalone.

2. **Import Flow**
   - Copy the JSON flow provided in this tutorial.
   - In Node-RED, click on the hamburger menu (three horizontal lines) in the top right corner.
   - Select "Import" and paste the JSON flow. Click "Import" again to add the flow.

3. **Configure Flow**
   - Replace `YOUR_CLIENT_ID`, `YOUR_TOKEN`, and `YOUR_BROADCASTER_ID` in the flow with the actual values.
   - Replace `IP_ADDRESS_MQTT_BROKER` with the IP address of your MQTT broker.

Twitch Node-RED Flow JSON

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

4. **Deploy the Flow**
   - Click "Deploy" in the top right corner of Node-RED to apply your changes.
   - Ensure all nodes are correctly configured and connected.

#### Step 4: Validate the Setup

1. **Trigger the Flow**
   - Manually trigger the inject node to test the flow.
   - Check the debug nodes for any errors or outputs.

2. **Verify MQTT Messages**
   - Ensure that the MQTT messages are being sent correctly to your broker.

By following these steps, you will have successfully set up a Twitch developer account, created an application, generated a token, and imported a Node-RED flow to interact with the Twitch API.

#### Walkthrough video

{{<youtube XVhkqvqN_bI>}}
