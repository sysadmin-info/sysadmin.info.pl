---
title: How to fix Rudder error while attempting send and run n8n during boot
date: 2023-12-19T10:00:00+00:00
description: How to fix Rudder error while attempting send and run n8n during boot
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
    image: images/2023-thumbs/ulanzi07.webp
---

{{<youtube MUKxFsdKeA0>}}

#### How to solve the below problem:

```
[Rudder] error: got error while attempting send for 3 times, dropping 3 events
```

By default, a self-hosted n8n instance sends data to n8n's servers. This allows n8n to send users notifications about available updates, allows access to workflow templates, and provides n8n with diagnostic information.

If you need to prevent your n8n instance from connecting with n8n's servers, use environment variables to turn off the settings that cause your instance to connect with n8n's servers.

##### Turn off diagnostics, notifications, and workflow templates.

You have to create .env file inside .n8n directory 

```bash
vim /home/$USER/.n8n/.env
```

and paste the below content

```vim
N8N_DIAGNOSTICS_ENABLED=false
N8N_VERSION_NOTIFICATIONS_ENABLED=false
N8N_TEMPLATES_ENABLED=false
```

Save and exit.

Restart n8n

Source: [Isolating n8n](https://docs.n8n.io/hosting/environment-variables/configuration-examples/isolation/)

##### How to start n8n during boot?

Create a script:

```bash
vim /home/$USER/start-n8n.sh
```

Paste the below content:

```vim
#!/bin/bash

# Start n8n in a detached screen session
screen -dmS n8n bash -c "npx n8n"

# Wait for a bit to ensure n8n is up and running
sleep 10

# Use xdotool commands within the same screen session
# Assuming xdotool commands are meant to interact with n8n
screen -S n8n -X stuff $'xdotool key ctrl+a\nxdotool key ctrl+d\nexit\n'
```

Save and exit.

##### Install xdotool

```bash
sudo apt install xdotool -y
```

##### Make the script executable:

```bash
chmod +x start-n8n.sh
```


#### Add the script to crontab:

```bash
crontab -e
```

Add the below entry:

```vim
@reboot /home/$USER/start-n8n.sh
```

Save and exit. 

##### Run the script 

```bash
cd ~
./start-n8n.sh
```

Done, great work. 