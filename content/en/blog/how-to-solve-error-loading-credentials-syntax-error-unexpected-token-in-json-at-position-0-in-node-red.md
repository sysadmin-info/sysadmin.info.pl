---
title: How to solve error loading credentials Syntax Error Unexpected token in JSON at position 0 in Node-RED
date: 2023-12-15T10:00:00+00:00
description: How to solve error loading credentials Syntax Error Unexpected token in JSON at position 0 in Node-RED
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
    image: images/2023-thumbs/ulanzi05.webp
---

{{<youtube uoCS3JBTasY>}}

To solve the problem
```markdown
[warn] Error loading credentials: SyntaxError: Unexpected token in JSON at position 0
```
that in fact blocks refreshing information on the Ulanzi's TC001 Smart Pixel Clock screen, you have to follow the below steps. Of course if you are using a standalone Node-RED instance instaed of the Home Assistant Addon you can just login to your instance and perform mentioned commands.

1. Install SSH addon in Home Assistant
2. Use the below commands one by one to fix the problem:
```bash
find / -name "*nodered*"
# Bear in mind that the string after the underscore can be different than the provided one
cd /addon_config/a0d7b954_nodered/
cat .config.runtime.json
mv .config.runtime.json .bla.config.runtime.json.bak
```
3. Restart the Node-RED
4. Provide MQTT broker user and password in the MQTT connection in each flow or provide a user and a password for the Ulanzi's TC001 web GUI panel (some flows are connecting directly to Ulanzi's device using IP address).
5. Deploy
6. Problem solved
