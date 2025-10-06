---
title: How to implement pomodoro timer using Node-RED onto Ulanzi TC001
date: 2024-01-14T15:00:00+00:00
description: How to implement pomodoro timer using Node-RED onto Ulanzi TC001
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
    image: images/2024-thumbs/ulanzi10.webp
---

{{<youtube PUFgScaYtnQ>}}

1. Copy the flow 

```json
[
    {
        "id": "work-timer-start",
        "type": "inject",
        "z": "305da690670f67c0",
        "name": "Start Work Timer",
        "props": [{"p": "payload"}],
        "repeat": "",
        "crontab": "",
        "once": false,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 100,
        "y": 100,
        "wires": [["work-timer-function"]]
    },
    {
        "id": "work-timer-function",
        "type": "function",
        "z": "305da690670f67c0",
        "name": "Countdown Timer",
        "func": "var duration = 25 * 60; // 25 minutes in seconds\nfunction countdown() {\n    if (flow.get('workTimerRunning') === false) {\n        return;\n    }\n    var message = {\n        payload: {\n            text: 'Time left: ' + duration + ' sec',\n            icon: \"82\",\n            color: '#FFA500',\n            duration: 1500\n        }\n    };\n    node.send(message);\n    duration--;\n    if (duration >= 0) {\n        setTimeout(countdown, 1000);\n    } else {\n        var endMessage = {\n            payload: {\n                text: 'Work Period Ended',\n                icon: \"29802\",\n                color: '#00FF00',\n                duration: 20\n            }\n        };\n        node.send(endMessage);\n    }\n}\nflow.set('workTimerRunning', true);\ncountdown();\nreturn null;",
        "outputs": 1,
        "x": 300,
        "y": 100,
        "wires": [["mqtt-out-work"]]
    },
    {
        "id": "mqtt-out-work",
        "type": "mqtt out",
        "z": "305da690670f67c0",
        "name": "MQTT Work Timer",
        "topic": "awtrix_b6d76c/custom/work_timer",
        "broker": "346df2a95aac5785",
        "x": 500,
        "y": 100,
        "wires": []
    },
    {
        "id": "work-timer-stop",
        "type": "inject",
        "z": "305da690670f67c0",
        "name": "Stop Work Timer",
        "props": [{"p": "payload"}],
        "repeat": "",
        "crontab": "",
        "once": false,
        "topic": "",
        "payload": "stop",
        "payloadType": "str",
        "x": 100,
        "y": 160,
        "wires": [["stop-work-timer-function"]]
    },
    {
        "id": "stop-work-timer-function",
        "type": "function",
        "z": "305da690670f67c0",
        "name": "Stop Work Timer Function",
        "func": "flow.set('workTimerRunning', false);\nvar message = {\n    payload: {\n        text: 'Work Timer Stopped',\n        icon: \"29802\",\n        color: '#FF0000',\n        duration: 20\n    }\n};\nreturn message;",
        "outputs": 1,
        "x": 300,
        "y": 160,
        "wires": [["mqtt-out-work"]]
    },
    {
        "id": "break-timer-start",
        "type": "inject",
        "z": "305da690670f67c0",
        "name": "Start Break Timer",
        "props": [{"p": "payload"}],
        "repeat": "",
        "crontab": "",
        "once": false,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 100,
        "y": 200,
        "wires": [["break-timer-function"]]
    },
    {
        "id": "break-timer-function",
        "type": "function",
        "z": "305da690670f67c0",
        "name": "Break Countdown Timer",
        "func": "var duration = 5 * 60; // 5 minutes in seconds\nfunction countdown() {\n    if (flow.get('breakTimerRunning') === false) {\n        return;\n    }\n    var message = {\n        payload: {\n            text: 'Break time left: ' + duration + ' sec',\n            icon: \"6396\",\n            color: '#FFA500',\n            duration: 300\n        }\n    };\n    node.send(message);\n    duration--;\n    if (duration >= 0) {\n        setTimeout(countdown, 1000);\n    } else {\n        var endMessage = {\n            payload: {\n                text: 'Break Period Ended',\n                icon: \"29802\",\n                color: '#00FF00',\n                duration: 20\n            }\n        };\n        node.send(endMessage);\n    }\n}\nflow.set('breakTimerRunning', true);\ncountdown();\nreturn null;",
        "outputs": 1,
        "x": 300,
        "y": 200,
        "wires": [["mqtt-out-break"]]
    },
    {
        "id": "mqtt-out-break",
        "type": "mqtt out",
        "z": "305da690670f67c0",
        "name": "MQTT Break Timer",
        "topic": "awtrix_b6d76c/custom/break_timer",
        "broker": "346df2a95aac5785",
        "x": 500,
        "y": 200,
        "wires": []
    },
    {
        "id": "break-timer-stop",
        "type": "inject",
        "z": "305da690670f67c0",
        "name": "Stop Break Timer",
        "props": [{"p": "payload"}],
        "repeat": "",
        "crontab": "",
        "once": false,
        "topic": "",
        "payload": "stop",
        "payloadType": "str",
        "x": 100,
        "y": 260,
        "wires": [["stop-break-timer-function"]]
    },
    {
        "id": "stop-break-timer-function",
        "type": "function",
        "z": "305da690670f67c0",
        "name": "Stop Break Timer Function",
        "func": "flow.set('breakTimerRunning', false);\nvar message = {\n    payload: {\n        text: 'Break Timer Stopped',\n        icon: \"29802\",\n        color: '#FF0000',\n        duration: 20\n    }\n};\nreturn message;",
        "outputs": 1,
        "x": 300,
        "y": 260,
        "wires": [["mqtt-out-break"]]
    }
]
```

2. Change the prefix awtrix_b6d76c to your own.

3. Import the flow into the Node-RED as I presented on the video.

4. Upload icons to your Ulanzi TC001 device as I presented on the video. You can use icons from here: [icons](https://developer.lametric.com/icons
)
5. Check the connectivity to your MQTT broker.

6. Feel free to modify the flow according to your needs. 

7. Deploy the flow onto the Ulanzi TC001 device.