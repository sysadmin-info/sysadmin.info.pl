---
title: How to connect Ulanzi TC001 Smart Pixel Clock through MQTT with Home Assistant
date: 2023-12-08T12:00:00+00:00
description: How to connect Ulanzi TC001 Smart Pixel Clock through MQTT with Home Assistant
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
image: images/2023-thumbs/ulanzi02.webp
---

{{<youtube 3nlCNo_33z4>}}

##### Setting Up MQTT Communication:

1. Install MQTT add-on in Home Assistant.
2. Configure MQTT integration in Home Assistant.
3. Create a user for the MQTT add-on (MQTT broker) in Home Assistant.

eg. ```mqtt-user``` 

4. Setup integration in Settings -> Devices and services and add integration and select MQTT. See the video. 
You need an IP address of the Home Assitant to be set for MQTT mosquito broker, so go to Settings -> System -> Network, click three dots and copy the IP address without the mask.

5. Add user for the MQTT on Ulanzi TC001 Smart Pixel Clock  in the Auth section.
6. Prepare a simple payload for communication with the Ulanzi device in MQTT Mosquito addon.

```json
{
	"text": "Hello, Sysadmin!",
	"icon": "1",
	"rainbow": true,
	"duration": 10
}
```
Add a topic this way: 

```awtrix_b6d76c/notify```

And change the icon using this website: [icons](https://developer.lametric.com/icons) - see the video tutorial to find out how to make it work.

7. Click publish and check that the text is visible on Ulanzi TC001 Smart Pixel Clock. Unfortunatelly this is not a permanent solution. 