---
title: Boost Your Focus - A Simple Guide to the Node-RED Pomodoro Timer displayed on Ulanzi TC001
date: 2024-01-21T13:00:00+00:00
description: Boost Your Focus - A Simple Guide to the Node-RED Pomodoro Timer displayed on Ulanzi TC001
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
    image: images/2024-thumbs/ulanzi11.webp
---

{{<youtube dusZ_gOQWjY>}}

### Introduction to the Pomodoro Timer Application in Node-RED

In the realm of productivity tools, the Pomodoro Technique stands out as a widely adopted method for enhancing focus and efficiency. Recognizing the potential of this technique, we've developed a comprehensive Pomodoro Timer application using Node-RED, a flow-based development tool. This application is not just a simple timer; it's a multifaceted tool that integrates modern web technologies and the Internet of Things (IoT) communication protocols to provide a rich, interactive user experience.

The application is built using HTTP and WebSocket for a dynamic and responsive web interface, and MQTT for robust and scalable IoT communication. This makes it an ideal solution for those seeking to implement a Pomodoro timer in a more integrated and connected environment, such as a smart home or office.

### Importing and Understanding the Flow in Node-RED

Before diving into the technical details, it's crucial to know how to import this sophisticated flow into your Node-RED environment. Follow these steps to get started:

1. **Copy the JSON Code**: The entire flow is encapsulated in a JSON format. Begin by copying the provided JSON code. Remember to change the prefix** awtrix_b6d76c to your own - see your Ulanzi web dashboard to find it in the MQTT configuration.

```json
[
    {
        "id": "5e4e7bb77cdc206e",
        "type": "group",
        "z": "b855e85a78344413",
        "style": {
            "stroke": "rgba(255, 255, 255, 0.1)",
            "stroke-opacity": "1",
            "fill": "#21222c",
            "fill-opacity": "0.5",
            "label": true,
            "label-position": "nw",
            "color": "#f8f8f2"
        },
        "nodes": [
            "224ba22856faf0c4",
            "722e9a2c1e958742"
        ],
        "x": 44,
        "y": 19,
        "w": 904,
        "h": 734
    },
    {
        "id": "224ba22856faf0c4",
        "type": "group",
        "z": "b855e85a78344413",
        "g": "5e4e7bb77cdc206e",
        "style": {
            "stroke": "rgba(255, 255, 255, 0.1)",
            "stroke-opacity": "1",
            "fill": "#21222c",
            "fill-opacity": "0.5",
            "label": true,
            "label-position": "nw",
            "color": "#f8f8f2"
        },
        "nodes": [
            "6fc4b92685677d61",
            "3064db0a53829fce"
        ],
        "x": 78,
        "y": 93,
        "w": 844,
        "h": 634
    },
    {
        "id": "6fc4b92685677d61",
        "type": "group",
        "z": "b855e85a78344413",
        "g": "224ba22856faf0c4",
        "style": {
            "stroke": "rgba(255, 255, 255, 0.1)",
            "stroke-opacity": "1",
            "fill": "#21222c",
            "fill-opacity": "0.5",
            "label": true,
            "label-position": "nw",
            "color": "#f8f8f2"
        },
        "nodes": [
            "ecab58db07a16f51",
            "d93ddf0c049e3a57",
            "e55d8ff882979aa4",
            "7e160ff8ad183726",
            "cbbc7a1813b7c509",
            "9cce02fb58074e61"
        ],
        "x": 114,
        "y": 119,
        "w": 742,
        "h": 142
    },
    {
        "id": "ecab58db07a16f51",
        "type": "inject",
        "z": "b855e85a78344413",
        "g": "6fc4b92685677d61",
        "name": "Tick every 5 secs",
        "props": [
            {
                "p": "payload",
                "v": "",
                "vt": "date"
            },
            {
                "p": "topic",
                "v": "test",
                "vt": "str"
            }
        ],
        "repeat": "5",
        "crontab": "",
        "once": false,
        "topic": "test",
        "payload": "",
        "payloadType": "date",
        "x": 250,
        "y": 220,
        "wires": [
            [
                "9cce02fb58074e61"
            ]
        ]
    },
    {
        "id": "d93ddf0c049e3a57",
        "type": "websocket out",
        "z": "b855e85a78344413",
        "g": "6fc4b92685677d61",
        "name": "",
        "server": "e71514a2f08d359c",
        "client": "",
        "x": 710,
        "y": 220,
        "wires": []
    },
    {
        "id": "e55d8ff882979aa4",
        "type": "http response",
        "z": "b855e85a78344413",
        "g": "6fc4b92685677d61",
        "name": "",
        "x": 690,
        "y": 160,
        "wires": []
    },
    {
        "id": "7e160ff8ad183726",
        "type": "http in",
        "z": "b855e85a78344413",
        "g": "6fc4b92685677d61",
        "name": "",
        "url": "/pomodoro",
        "method": "get",
        "swaggerDoc": "",
        "x": 250,
        "y": 160,
        "wires": [
            [
                "cbbc7a1813b7c509"
            ]
        ]
    },
    {
        "id": "cbbc7a1813b7c509",
        "type": "template",
        "z": "b855e85a78344413",
        "g": "6fc4b92685677d61",
        "name": "Pomodoro Web Page",
        "field": "payload",
        "fieldType": "msg",
        "format": "html",
        "syntax": "mustache",
        "template": "<!DOCTYPE HTML>\n<html>\n    <head>\n    <title>Pomodoro Dasboard</title>\n    <link href=\"https://fonts.bunny.net/css2?family=Roboto:wght@400;700&display=swap\" rel=\"stylesheet\">\n    <style>\n            h1, h2 {\n                color: white;\n                padding: 1rem;\n                text-transform: uppercase;\n                font-size: 2rem;    \n            }\n            \n            #status {\n                color: white;\n                padding: 1rem;\n                text-transform: uppercase;\n                font-size: 2rem;\n            }\n\n            #dashboard {\n                text-align: center;\n                display: block;\n            }\n\n            #status {\n                text-align: center;\n                padding: 1rem;\n            }\n        \n            * {\n            margin: 0;\n            padding: 0;\n            box-sizing: border-box;\n            }\n            \n            body {\n            display: flex;\n            flex-direction: column;\n            gap: 1rem;\n            align-items: center;\n            justify-content: center;\n            min-height: 10vh;\n            background: #27272c;\n            font-family: 'Roboto', sans-serif;\n            }\n            \n            button {\n            position: relative;\n            background: #444;\n            color: #fff;\n            text-decoration: none;\n            text-transform: uppercase;\n            border: none;\n            letter-spacing: 0.1rem;\n            font-size: 2rem;\n            padding: 1rem 3rem;\n            transition: 0.2s;\n            display: block;\n            width: 460px;\n            margin: 1rem auto;\n            font-family: inherit;\n            }\n            \n            button:hover {\n            letter-spacing: 0.2rem;\n            padding: 1.1rem 3.1rem;\n            background: var(--clr);\n            color: var(--clr);\n            /* box-shadow: 0 0 35px var(--clr); */\n            animation: box 3s infinite;\n            }\n            \n            button::before {\n            content: \"\";\n            position: absolute;\n            inset: 2px;\n            background: #272822;\n            }\n            \n            button span {\n            position: relative;\n            z-index: 1;\n            }\n            button i {\n            position: absolute;\n            inset: 0;\n            display: block;\n            }\n            \n            button i::before {\n            content: \"\";\n            position: absolute;\n            width: 10px;\n            height: 2px;\n            left: 80%;\n            top: -2px;\n            border: 2px solid var(--clr);\n            background: #272822;\n            transition: 0.2s;\n            }\n            \n            button:hover i::before {\n            width: 15px;\n            left: 20%;\n            animation: move 3s infinite;\n            }\n            \n            button i::after {\n            content: \"\";\n            position: absolute;\n            width: 10px;\n            height: 2px;\n            left: 20%;\n            bottom: -2px;\n            border: 2px solid var(--clr);\n            background: #272822;\n            transition: 0.2s;\n            }\n            \n            button:hover i::after {\n            width: 15px;\n            left: 80%;\n            animation: move 3s infinite;\n            }\n            \n            @keyframes move {\n            0% {\n            transform: translateX(0);\n            }\n            50% {\n            transform: translateX(5px);\n            }\n            100% {\n            transform: translateX(0);\n            }\n            }\n            \n            @keyframes box {\n            0% {\n            box-shadow: #27272c;\n            }\n            50% {\n            box-shadow: 0 0 25px var(--clr);\n            }\n            100% {\n            box-shadow: #27272c;\n            }\n            }\n        </style>\n    <script type=\"text/javascript\">\n        var ws;\n        var wsUri = \"ws:\";\n        var loc = window.location;\n        console.log(loc);\n        if (loc.protocol === \"https:\") { wsUri = \"wss:\"; }\n        // This needs to point to the web socket in the Node-RED flow\n        // ... in this case it's ws/pomodoro\n        wsUri += \"//\" + loc.host + loc.pathname.replace(\"pomodoro\",\"ws/pomodoro\");\n\n        function wsConnect() {\n            console.log(\"connect\",wsUri);\n            ws = new WebSocket(wsUri);\n            //var line = \"\";    // either uncomment this for a building list of messages\n            ws.onmessage = function(msg) {\n                var line = \"\";  // or uncomment this to overwrite the existing message\n                // parse the incoming message as a JSON object\n                var data = msg.data;\n                //console.log(data);\n                // build the output from the topic and payload parts of the object\n                line += \"<p>\"+data+\"</p>\";\n                // replace the messages div with the new \"line\"\n                document.getElementById('messages').innerHTML = line;\n                //ws.send(JSON.stringify({data:data}));\n            }\n            ws.onopen = function() {\n                // update the status div with the connection status\n                document.getElementById('status').innerHTML = \"connected\";\n                //ws.send(\"Open for data\");\n                console.log(\"connected\");\n            }\n            ws.onclose = function() {\n                // update the status div with the connection status\n                document.getElementById('status').innerHTML = \"not connected\";\n                // in case of lost connection tries to reconnect every 3 secs\n                setTimeout(wsConnect,3000);\n            }\n        }\n\n        function doit(m) {\n            if (ws) { ws.send(m); }\n        }\n\n        function sendCommand(topic, action) {\n            if (ws && ws.readyState === WebSocket.OPEN) {\n                ws.send(JSON.stringify({ topic: topic, action: action }));\n                console.log('Command sent:', topic, action);\n            } else {\n                console.error('WebSocket connection is not open.');\n            }\n        }\n\n         document.addEventListener(\"DOMContentLoaded\", function() {\n                wsConnect();\n\n                document.getElementById('startWork').addEventListener('click', function() {\n                    sendCommand('work', 'start');\n                });\n                \n                document.getElementById('stopWork').addEventListener('click', function() {\n                    sendCommand('work', 'stop');\n                });\n                \n                document.getElementById('startBreak').addEventListener('click', function() {\n                    sendCommand('break', 'start');\n                });\n                \n                document.getElementById('stopBreak').addEventListener('click', function() {\n                    sendCommand('break', 'stop');\n                });\n            });        \n    </script>\n    </head>\n    <body onload=\"wsConnect();\" onunload=\"ws.disconnect();\">\n        <div id=\"dashboard\">\n            <h1>Dashboard for Pomodoro</h1>\n            <button id=\"startWork\" type=\"button\" style=\"--clr:#39FF14\"><span>Start Work Timer</span><i></i></button>\n            <button id=\"stopWork\" type=\"button\" style=\"--clr:#FF44CC\"><span>Stop Work Timer</span><i></i></button>\n            <button id=\"startBreak\" type=\"button\" style=\"--clr:#0FF0FC\"><span>Start Break Timer</span><i></i></button>\n            <button id=\"stopBreak\" type=\"button\" style=\"--clr:#8A2BE2\"><span>Stop Break Timer</span><i></i></button>\n            <h2>Websocket status:</h2>\n            <div id=\"status\">unknown</div>\n        </div>        \n    </body>\n</html>\n",
        "x": 500,
        "y": 160,
        "wires": [
            [
                "e55d8ff882979aa4"
            ]
        ]
    },
    {
        "id": "9cce02fb58074e61",
        "type": "function",
        "z": "b855e85a78344413",
        "g": "6fc4b92685677d61",
        "name": "format time nicely",
        "func": "msg.payload = Date(msg.payload).toString();\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 460,
        "y": 220,
        "wires": [
            [
                "d93ddf0c049e3a57"
            ]
        ]
    },
    {
        "id": "e71514a2f08d359c",
        "type": "websocket-listener",
        "path": "/ws/pomodoro",
        "wholemsg": "false"
    },
    {
        "id": "3064db0a53829fce",
        "type": "group",
        "z": "b855e85a78344413",
        "g": "224ba22856faf0c4",
        "style": {
            "stroke": "rgba(255, 255, 255, 0.1)",
            "stroke-opacity": "1",
            "fill": "#21222c",
            "fill-opacity": "0.5",
            "label": true,
            "label-position": "nw",
            "color": "#f8f8f2"
        },
        "nodes": [
            "7ca57b6aec429111",
            "57f0f5cb25bf3b47",
            "c09ee71a61033df0",
            "4d3638661703f908",
            "66401a5d40a5a5db",
            "2162f51689955c5d",
            "8c63c45b50c0a417",
            "11cec9d220eb3b88",
            "b2ebdecd50cb5cd5",
            "463452c4ccc89ae8",
            "af981f901f906210",
            "6f75c1d56fe9f372",
            "7046ed91bba632aa",
            "5363ed9a833786ce"
        ],
        "x": 104,
        "y": 279,
        "w": 792,
        "h": 422
    },
    {
        "id": "7ca57b6aec429111",
        "type": "websocket in",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "",
        "server": "e71514a2f08d359c",
        "client": "",
        "x": 260,
        "y": 380,
        "wires": [
            [
                "8c63c45b50c0a417"
            ]
        ]
    },
    {
        "id": "57f0f5cb25bf3b47",
        "type": "function",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "Work Timer Function",
        "func": "function startWorkTimer(duration) {\n    // Reset the start time for a new work period\n    var startTime = Date.now();\n    flow.set('workTimerStartTime', startTime);\n\n    var updateTimer = function() {\n        var elapsedTime = Date.now() - startTime;\n        var remainingTime = duration - elapsedTime;\n\n        if (remainingTime <= 0) {\n            flow.set('workTimerRunning', false);\n            node.send({ payload: { text: 'Work Period Ended', icon: '29802', color: '#00FF00', duration: 10 } });\n            flow.set('workTimerTimeout', null); // Clear the timeout reference\n        } else {\n            node.send({ payload: { text: 'Work time left: ' + Math.round(remainingTime / 1000) + ' sec', icon: '82', color: '#FFA500', duration: 1500 } });\n            var timeout = setTimeout(updateTimer, 1000);\n            flow.set('workTimerTimeout', timeout); // Store the timeout reference\n        }\n    };\n\n    updateTimer();\n}\n\nif (msg.topic === 'work') {\n    if (msg.payload === 'start') {\n        // Stop any existing timer\n        var existingTimeout = flow.get('workTimerTimeout');\n        if (existingTimeout) clearTimeout(existingTimeout);\n\n        // Start a new work timer\n        flow.set('workTimerRunning', true);\n        startWorkTimer(25 * 60 * 1000); // 25 minutes\n    } else if (msg.payload === 'stop') {\n        var timeout = flow.get('workTimerTimeout');\n        if (timeout) clearTimeout(timeout);\n        flow.set('workTimerRunning', false);\n        flow.set('workTimerStartTime', null);\n        flow.set('workTimerTimeout', null); // Clear the timeout reference\n        return { payload: { text: 'Work Timer Stopped', icon: '29802', color: '#FF0000', duration: 10 } };\n    }\n}\nreturn null;\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 530,
        "y": 440,
        "wires": [
            [
                "4d3638661703f908"
            ]
        ]
    },
    {
        "id": "c09ee71a61033df0",
        "type": "inject",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "Start Work Timer",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str",
                "v": "work"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": "",
        "topic": "work",
        "payload": "start",
        "payloadType": "str",
        "x": 230,
        "y": 440,
        "wires": [
            [
                "57f0f5cb25bf3b47"
            ]
        ]
    },
    {
        "id": "4d3638661703f908",
        "type": "mqtt out",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "MQTT Work Timer",
        "topic": "awtrix_b6d76c/custom/work_timer",
        "qos": "",
        "retain": "",
        "respTopic": "",
        "contentType": "",
        "userProps": "",
        "correl": "",
        "expiry": "",
        "broker": "346df2a95aac5785",
        "x": 780,
        "y": 380,
        "wires": []
    },
    {
        "id": "66401a5d40a5a5db",
        "type": "inject",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "Stop  Work Timer",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": "",
        "topic": "",
        "payload": "stop",
        "payloadType": "str",
        "x": 230,
        "y": 320,
        "wires": [
            [
                "2162f51689955c5d"
            ]
        ]
    },
    {
        "id": "2162f51689955c5d",
        "type": "function",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "Stop Work Timer Function",
        "func": "var timerKey = 'workTimer';\ntry {\n    if (flow.get(timerKey + 'Running') !== true) {\n        return { payload: 'Work timer is not running' };\n    }\n    var timeout = flow.get(timerKey + 'Timeout');\n    if (timeout) clearTimeout(timeout); // Correctly accessing the timeout\n    flow.set(timerKey + 'Running', false);\n    flow.set(timerKey + 'StartTime', null);\n    flow.set(timerKey + 'Timeout', null); // Clear the timeout reference\n    var message = {\n        payload: {\n            text: 'Work Timer Stopped',\n            icon: '29802',\n            color: '#FF0000',\n            duration: 10\n        }\n    };\n    return message;\n} catch (error) {\n    node.error('Error in stop work timer function: ' + error.message);\n    return { payload: 'Error stopping work timer: ' + error.message };\n}\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 520,
        "y": 320,
        "wires": [
            [
                "4d3638661703f908"
            ]
        ]
    },
    {
        "id": "8c63c45b50c0a417",
        "type": "function",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "WebSocket to MQTT",
        "func": "let incomingData;\n\ntry {\n    incomingData = JSON.parse(msg.payload);\n} catch (error) {\n    node.error('Invalid JSON format', msg);\n    return;\n}\n\nif (!incomingData.topic || !incomingData.action) {\n    node.error('Invalid message format', msg);\n    return;\n}\n\nlet newMsg = {\n    payload: incomingData.action,\n    topic: incomingData.topic\n};\nreturn newMsg;\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 510,
        "y": 380,
        "wires": [
            [
                "57f0f5cb25bf3b47"
            ]
        ]
    },
    {
        "id": "11cec9d220eb3b88",
        "type": "function",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "Break Timer Function",
        "func": "function startBreakTimer(duration) {\n    // Reset the start time for a new break period\n    var startTime = Date.now();\n    flow.set('breakTimerStartTime', startTime);\n\n    var updateTimer = function() {\n        var elapsedTime = Date.now() - startTime;\n        var remainingTime = duration - elapsedTime;\n\n        if (remainingTime <= 0) {\n            flow.set('breakTimerRunning', false);\n            node.send({ payload: { text: 'Break Period Ended', icon: '29802', color: '#00FF00', duration: 10 } });\n            flow.set('breakTimerTimeout', null); // Clear the timeout reference\n        } else {\n            node.send({ payload: { text: 'Break time left: ' + Math.round(remainingTime / 1000) + ' sec', icon: '6396', color: '#FFA500', duration: 300 } });\n            var timeout = setTimeout(updateTimer, 1000);\n            flow.set('breakTimerTimeout', timeout); // Store the timeout reference\n        }\n    };\n\n    updateTimer();\n}\n\nif (msg.topic === 'break') {\n    if (msg.payload === 'start') {\n        // Stop any existing timer\n        var existingTimeout = flow.get('breakTimerTimeout');\n        if (existingTimeout) clearTimeout(existingTimeout);\n\n        // Start a new break timer\n        flow.set('breakTimerRunning', true);\n        startBreakTimer(5 * 60 * 1000); // 5 minutes\n    } else if (msg.payload === 'stop') {\n        var timeout = flow.get('breakTimerTimeout');\n        if (timeout) clearTimeout(timeout);\n        flow.set('breakTimerRunning', false);\n        flow.set('breakTimerStartTime', null);\n        flow.set('breakTimerTimeout', null); // Clear the timeout reference\n        return { payload: { text: 'Break Timer Stopped', icon: '29802', color: '#FF0000', duration: 10 } };\n    }\n}\nreturn null;\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 510,
        "y": 660,
        "wires": [
            [
                "6f75c1d56fe9f372"
            ]
        ]
    },
    {
        "id": "b2ebdecd50cb5cd5",
        "type": "inject",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "Start Break Timer",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str",
                "v": "break"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": "",
        "topic": "break",
        "payload": "start",
        "payloadType": "str",
        "x": 230,
        "y": 660,
        "wires": [
            [
                "11cec9d220eb3b88"
            ]
        ]
    },
    {
        "id": "463452c4ccc89ae8",
        "type": "inject",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "Stop Break Timer",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": "",
        "topic": "",
        "payload": "stop",
        "payloadType": "str",
        "x": 230,
        "y": 540,
        "wires": [
            [
                "af981f901f906210"
            ]
        ]
    },
    {
        "id": "af981f901f906210",
        "type": "function",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "Stop Break Timer Function",
        "func": "var timerKey = 'breakTimer';\ntry {\n    if (flow.get(timerKey + 'Running') !== true) {\n        return { payload: 'Break timer is not running' };\n    }\n    var timeout = flow.get(timerKey + 'Timeout');\n    if (timeout) clearTimeout(timeout); // Correctly accessing the timeout\n    flow.set(timerKey + 'Running', false);\n    flow.set(timerKey + 'StartTime', null);\n    flow.set(timerKey + 'Timeout', null); // Clear the timeout reference\n    var message = {\n        payload: {\n            text: 'Break Timer Stopped',\n            icon: '29802',\n            color: '#FF0000',\n            duration: 10\n        }\n    };\n    return message;\n} catch (error) {\n    node.error('Error in stop break timer function: ' + error.message);\n    return { payload: 'Error stopping break timer: ' + error.message };\n}\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 490,
        "y": 540,
        "wires": [
            [
                "6f75c1d56fe9f372"
            ]
        ]
    },
    {
        "id": "6f75c1d56fe9f372",
        "type": "mqtt out",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "MQTT Break Timer",
        "topic": "awtrix_b6d76c/custom/break_timer",
        "qos": "",
        "retain": "",
        "respTopic": "",
        "contentType": "",
        "userProps": "",
        "correl": "",
        "expiry": "",
        "broker": "346df2a95aac5785",
        "x": 760,
        "y": 600,
        "wires": []
    },
    {
        "id": "7046ed91bba632aa",
        "type": "websocket in",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "",
        "server": "e71514a2f08d359c",
        "client": "",
        "x": 250,
        "y": 600,
        "wires": [
            [
                "5363ed9a833786ce"
            ]
        ]
    },
    {
        "id": "5363ed9a833786ce",
        "type": "function",
        "z": "b855e85a78344413",
        "g": "3064db0a53829fce",
        "name": "WebSocket to MQTT",
        "func": "let incomingData;\n\ntry {\n    incomingData = JSON.parse(msg.payload);\n} catch (error) {\n    node.error('Invalid JSON format', msg);\n    return;\n}\n\nif (!incomingData.topic || !incomingData.action) {\n    node.error('Invalid message format', msg);\n    return;\n}\n\nlet newMsg = {\n    payload: incomingData.action,\n    topic: incomingData.topic\n};\nreturn newMsg;\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 490,
        "y": 600,
        "wires": [
            [
                "11cec9d220eb3b88"
            ]
        ]
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
    },
    {
        "id": "722e9a2c1e958742",
        "type": "comment",
        "z": "b855e85a78344413",
        "g": "5e4e7bb77cdc206e",
        "name": "Readme!",
        "info": "URL pattern is: \nhttp://[IP ADDRESS OF THE NODE-RED]:1880/endpoint/pomodoro\n\nIf Node-RED is installed as a Home Assistant Addon \nthen the IP address will be identical like the one \nthat is assigned to the Home Assistant.",
        "x": 130,
        "y": 60,
        "wires": []
    }
]
```

2. **Access Your Node-RED Editor**: Open your Node-RED instance. This can typically be accessed via a web browser at `http://[your Node-RED IP address]:1880`.

3. **Import the Flow**:
    - In the Node-RED editor, click on the hamburger menu (three horizontal lines) in the upper right corner.
    - Select `Import` from the dropdown menu.
    - Paste the copied JSON code into the text field.
    - Click `Import` to add the flow to your workspace.

4. **Upload icons** to your Ulanzi TC001 device as I presented on the video {{<youtube PUFgScaYtnQ>}}. 

    You can use icons from here: **[icons](https://developer.lametric.com/icons)**

5. **Check the connectivity** to your MQTT broker.

6. **Deploy the Flow**: After importing, you'll see the flow in your Node-RED workspace. Click the `Deploy` button in the upper right corner to activate the flow.

7. **Modify the flow** Feel free to modify the flow according to your needs.

8. **Open the Pomodoro clock dashboard** After deployment you can open the website:

```
http://[IP ADDRESS OF THE NODE-RED]:1880/endpoint/pomodoro
```

In Home Assistant the IP is exactly the same for Node-RED addon and Home Assistant dashboard. 

### Overview of the Flow
The flow is a well-orchestrated combination of groups and nodes, each contributing to the overall functionality of the Pomodoro application:

#### Primary Group
This group focuses on setting up the web server and managing WebSocket communication, essential for the real-time interaction with the Pomodoro dashboard.

#### Secondary Group
Here lies the core of the Pomodoro timer, handling the timer's logic, controlling the work and break phases, and communicating these statuses via MQTT.

#### Miscellaneous Nodes
These include the MQTT broker configuration and helpful documentation for accessing the Node-RED flow.

### Detailed Node Descriptions
Each node in the groups has a specific role, from triggering time updates to managing HTTP requests and MQTT communications. Understanding these nodes is key to comprehending the application's functionality and making any desired customizations.

### Flow Logic
The flow's logic is a sequence of interactions between these nodes, ensuring the timer's accurate operation, real-time updates, and effective communication across different technologies.

### Conclusion
This Node-RED flow is more than just a Pomodoro timer; it's a demonstration of how various technologies like IoT, web services, and real-time communication can be woven together to create a seamless and interactive application. By importing this flow into your Node-RED environment, you're not just getting a productivity tool, but also a platform for learning and experimentation in the world of connected applications.

Here’s an detailed overview:

### Overview of the Flow
The flow is methodically divided into groups, each specializing in different functionalities of the Pomodoro application:

1. **Primary Group**: Hosts the essential components for the web server setup, WebSocket communication, and the template engine. It's responsible for generating and serving the Pomodoro dashboard via HTTP and WebSocket.

2. **Secondary Group**: Manages the Pomodoro timer's core functionalities, including initiating and controlling work and break timers and communicating their status via MQTT.

### Detailed Node Descriptions
#### Primary Group Nodes
- **Tick every 5 secs (Inject Node)**: Triggers every 5 seconds, feeding into the "format time nicely" function node.
- **HTTP In Node**: Listens for HTTP GET requests at `/pomodoro`, forwarding requests to the "Pomodoro Web Page" template node.
- **Pomodoro Web Page (Template Node)**: Generates an interactive HTML page for the Pomodoro dashboard, incorporating CSS and JavaScript for WebSocket communication.
- **Format time nicely (Function Node)**: Formats current time data and sends it to the WebSocket Out node.
- **WebSocket Out Node**: Facilitates sending data to a WebSocket client.
- **HTTP Response Node**: Handles sending the generated HTML page in response to HTTP requests.

#### Secondary Group Nodes
- **Start/Stop Work/Break Timer (Inject Nodes)**: These nodes issue start and stop commands to their respective timer function nodes.
- **Work/Break Timer Function Nodes**: Manage the work and break timers, including starting, updating, and stopping functionalities, and send MQTT messages with timer status.
- **MQTT Work/Break Timer (MQTT Out Nodes)**: Publish the timers' statuses to the MQTT topics.
- **WebSocket to MQTT (Function Nodes)**: Parse incoming WebSocket messages and format them for MQTT publishing.
- **WebSocket In Node**: Receives data through WebSocket.

#### Miscellaneous Nodes
- **MQTT HA Broker**: Configures the MQTT broker for communication.
- **Readme! (Comment Node)**: Provides essential information about accessing the Node-RED flow, including the URL pattern.

### Flow Logic
1. The flow initiates with the "Tick every 5 secs" node, which periodically activates the "format time nicely" function node, sending formatted time data via WebSocket.
2. The "HTTP In" node responds to incoming HTTP requests by serving the Pomodoro dashboard, created by the "Pomodoro Web Page" template node.
3. The Pomodoro timer is bifurcated into work and break phases, each controlled by corresponding "Start" and "Stop" inject nodes. The function nodes for work and break timers manage these intervals, updating their status on MQTT topics.
4. The "WebSocket to MQTT" function nodes bridge the gap between WebSocket messages and MQTT communications, ensuring cohesive operation within the application.

### Conclusion
This Node-RED flow showcases a well-structured and multifaceted application that elegantly manages a Pomodoro timer. It demonstrates Node-RED's capability to create complex, integrated applications combining IoT and web-based technologies for user interaction and inter-device communication. This setup highlights the system's efficiency in handling real-time updates, timer control, and seamless communication across different technologies.