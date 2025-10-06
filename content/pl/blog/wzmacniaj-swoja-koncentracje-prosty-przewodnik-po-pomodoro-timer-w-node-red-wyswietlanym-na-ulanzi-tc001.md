---
title: Wzmacniaj swoją koncentrację - Prosty przewodnik po Pomodoro Timer w Node-RED wyświetlanym na Ulanzi TC001
date: 2024-01-21T13:00:00+00:00
description: Wzmacniaj swoją koncentrację - Prosty przewodnik po Pomodoro Timer w Node-RED wyświetlanym na Ulanzi TC001
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

### Wprowadzenie do aplikacji Pomodoro Timer w Node-RED

W dziedzinie narzędzi zwiększających produktywność, Technika Pomodoro wyróżnia się jako powszechnie stosowana metoda zwiększania koncentracji i wydajności. Dostrzegając potencjał tej techniki, opracowaliśmy kompleksową aplikację Pomodoro Timer przy użyciu Node-RED, narzędzia programistycznego opartego na schemacie. Ta aplikacja to nie tylko prosty licznik czasu; to wieloaspektowe narzędzie, które integruje nowoczesne technologie internetowe i protokoły komunikacyjne Internetu rzeczy (IoT), aby zapewnić bogate, interaktywne wrażenia użytkownika.

Aplikacja jest zbudowana przy użyciu HTTP i WebSocket dla dynamicznego i responsywnego interfejsu internetowego oraz MQTT dla solidnej i skalowalnej komunikacji IoT. Dzięki temu jest to idealne rozwiązanie dla tych, którzy chcą wdrożyć minutnik Pomodoro w bardziej zintegrowanym i połączonym środowisku, takim jak inteligentny dom lub biuro.

### Importowanie i zrozumienie schematu w Node-RED

Przed zagłębieniem się w szczegóły techniczne, ważne jest, aby wiedzieć, jak zaimportować ten wyrafinowany schemat do środowiska Node-RED. Aby rozpocząć, wykonaj następujące kroki:

1. **Skopiuj kod JSON**: Cały schemat jest utworzony w formacie JSON. Rozpocznij od skopiowania dostarczonego kodu JSON. Pamiętaj, aby zmienić prefiks** awtrix_b6d76c na własny - zobacz pulpit nawigacyjny Ulanzi, aby znaleźć go w konfiguracji MQTT.

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

2. **Uzyskaj dostęp do edytora Node-RED**: Otwórz swoją instancję Node-RED. Zazwyczaj można uzyskać do niej dostęp za pośrednictwem przeglądarki internetowej pod adresem `http://[Twój adres IP Node-RED]:1880`.

3. **Import the Flow**:
    - W edytorze Node-RED kliknij menu hamburgera (trzy poziome linie) w prawym górnym rogu.
    - Wybierz `Import` z rozwijanego menu.
    - Wklej skopiowany kod JSON do pola tekstowego.
    - Kliknij `Import`, aby dodać schemat do obszaru roboczego.

4. **Prześlij ikony** do urządzenia Ulanzi TC001, tak jak zaprezentowałem na filmie {{<youtube PUFgScaYtnQ>}}. 

    Możesz użyć ikon stąd: **[icons](https://developer.lametric.com/icons)**

5. **Sprawdź łączność** z brokerem MQTT.

6. **Deploy the Flow**: Po zaimportowaniu zobaczysz schemat w obszarze roboczym Node-RED. Kliknij przycisk `Deploy` w prawym górnym rogu, aby aktywować schemat.

7. **Zmodyfikuj schemat**: Możesz zmodyfikować schemat zgodnie z własnymi potrzebami.

8. **Otwórz pulpit nawigacyjny zegara Pomodoro** Po wdrożeniu możesz otworzyć stronę internetową:

```
http://[IP ADDRESS OF THE NODE-RED]:1880/endpoint/pomodoro
```

W Home Assistant adres IP jest dokładnie taki sam dla dodatku Node-RED i pulpitu Home Assistant. 

### Przegląd schematu
Schemat jest dobrze zorganizowaną kombinacją grup i węzłów, z których każdy przyczynia się do ogólnej funkcjonalności aplikacji Pomodoro:

#### Grupa podstawowa
Ta grupa koncentruje się na konfiguracji serwera WWW i zarządzaniu komunikacją WebSocket, niezbędną do interakcji w czasie rzeczywistym z pulpitem nawigacyjnym Pomodoro.

#### Grupa drugorzędna
Tutaj znajduje się rdzeń timera Pomodoro, obsługujący logikę timera, kontrolujący fazy pracy i przerwy oraz komunikujący te statusy za pośrednictwem MQTT.

#### Różne węzły
Obejmują one konfigurację brokera MQTT i pomocną dokumentację dotyczącą dostępu do schematu Node-RED.

### Szczegółowe opisy węzłów
Każdy węzeł w grupach ma określoną rolę, od wyzwalania aktualizacji czasu do zarządzania żądaniami HTTP i komunikacją MQTT. Zrozumienie tych węzłów jest kluczem do zrozumienia funkcjonalności aplikacji i wprowadzenia wszelkich pożądanych dostosowań.

### Logika schematu
Logika schematu to sekwencja interakcji między tymi węzłami, zapewniająca dokładne działanie zegara, aktualizacje w czasie rzeczywistym i skuteczną komunikację między różnymi technologiami.

### Podsumowanie
Ten schemat Node-RED to coś więcej niż tylko czasomierz Pomodoro; to demonstracja tego, jak różne technologie, takie jak IoT, usługi sieciowe i komunikacja w czasie rzeczywistym, mogą być splecione razem, aby stworzyć płynną i interaktywną aplikację. Importując ten schemat do środowiska Node-RED, otrzymujesz nie tylko narzędzie zwiększające produktywność, ale także platformę do nauki i eksperymentowania w świecie połączonych aplikacji.

Oto szczegółowy przegląd:

### Przegląd schematu
Schemat jest metodycznie podzielony na grupy, z których każda specjalizuje się w różnych funkcjach aplikacji Pomodoro:

1. **Grupa podstawowa**: Hostuje niezbędne komponenty do konfiguracji serwera WWW, komunikacji WebSocket i silnika szablonów. Odpowiada za generowanie i obsługę pulpitu nawigacyjnego Pomodoro za pośrednictwem protokołów HTTP i WebSocket.

2. **Grupa drugorzędna**: Zarządza podstawowymi funkcjami timera Pomodoro, w tym inicjowaniem i kontrolowaniem timerów pracy i przerw oraz przekazywaniem ich statusu za pośrednictwem MQTT.

### Szczegółowe opisy węzłów
#### Węzły grupy podstawowej
- **Tick every 5 secs (Inject Node)**: Wyzwala co 5 sekund, zasilając węzeł funkcji "ładnie formatuj czas".
- **HTTP In Node**: Nasłuchuje żądań HTTP GET pod adresem `/pomodoro`, przekazując żądania do węzła szablonu "Pomodoro Web Page".
- **Pomodoro Web Page (Template Node)**: Generuje interaktywną stronę HTML dla pulpitu nawigacyjnego Pomodoro, zawierającą CSS i JavaScript do komunikacji WebSocket.
- **Format time nicely (Function Node)**: Formatuje dane bieżącego czasu i wysyła je do węzła WebSocket Out.
- **Węzeł WebSocket Out**: Ułatwia wysyłanie danych do klienta WebSocket.
- **Węzeł odpowiedzi HTTP**: Obsługuje wysyłanie wygenerowanej strony HTML w odpowiedzi na żądania HTTP.

#### Węzły grup drugorzędnych
- **Start/Stop Work/Break Timer (Inject Nodes)**: Węzły te wydają polecenia uruchomienia i zatrzymania odpowiednim węzłom funkcji timera.
- **Węzły funkcji timera pracy/przerwy**: Zarządzają timerami pracy i przerwania, w tym uruchamianiem, aktualizowaniem i zatrzymywaniem funkcji oraz wysyłają komunikaty MQTT ze statusem timera.
- **MQTT Work/Break Timer (MQTT Out Nodes)**: Publikowanie statusów timerów w tematach MQTT.
- **WebSocket to MQTT (Function Nodes)**: Parsowanie przychodzących wiadomości WebSocket i formatowanie ich do publikacji MQTT.
- **WebSocket In Node**: Odbiera dane przez WebSocket.

#### Różne węzły
- **MQTT HA Broker**: Konfiguruje brokera MQTT do komunikacji.
- **Readme! (Comment Node)**: Zawiera istotne informacje na temat dostępu do schematu Node-RED, w tym wzorzec adresu URL.

### Logika schematu
1. Schemat inicjowany jest przez węzeł "Tick every 5 secs", który okresowo aktywuje węzeł funkcji "format time nicely", wysyłając sformatowane dane czasu przez WebSocket.
2. Węzeł "HTTP In" odpowiada na przychodzące żądania HTTP, obsługując pulpit nawigacyjny Pomodoro, utworzony przez węzeł szablonu "Pomodoro Web Page".
3. Timer Pomodoro jest podzielony na fazy pracy i przerwy, z których każda jest kontrolowana przez odpowiednie węzły iniekcji "Start" i "Stop". Węzły funkcyjne dla timerów pracy i przerw zarządzają tymi interwałami, aktualizując ich status w tematach MQTT.
4. Węzły funkcyjne "WebSocket to MQTT" wypełniają lukę między komunikatami WebSocket a komunikacją MQTT, zapewniając spójne działanie w aplikacji.

### Podsumowanie
Ten schemat Node-RED prezentuje dobrze zorganizowaną i wieloaspektową aplikację, która elegancko zarządza timerem Pomodoro. Demonstruje zdolność Node-RED do tworzenia złożonych, zintegrowanych aplikacji łączących IoT i technologie internetowe do interakcji z użytkownikiem i komunikacji między urządzeniami. Ta konfiguracja podkreśla wydajność systemu w obsłudze aktualizacji w czasie rzeczywistym, kontroli timera i płynnej komunikacji między różnymi technologiami.