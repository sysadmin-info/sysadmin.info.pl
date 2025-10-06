---
title: How to install and use n8n to deploy pre-made flows
date: 2023-12-15T14:00:00+00:00
description: How to install and use n8n - workflow automation tool to deploy pre-made flows onto Ulanzi TC001
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
    image: images/2023-thumbs/ulanzi06.webp
---

{{<youtube Y4xX-gOIDQo>}}

1. Install nala in Debian 12

```bash
sudo apt install nala -y
```

2. Install nodejs and npm
```bash
sudo nala install nodejs npm -y
# or
sudo apt install nodejs npm -y
```

3. Check versions
```bash
nodejs --version
npm --version
```

4. Run n8n
```bash
npx n8n
```

5. To run n8n in the background install screen

```bash
sudo nala install screen -y
```

6. Run screen

```bash
screen
```

7. Run n8n

```bash
npx n8n
```

8. Detach screen session with the below combination:

```
ctrl+a and ctrl+d #to detach
```

9. Reattach screen session with the below command:

```bash
screen -r
```

10. Check the IP address of the machine where n8n is running with the below command:

```bash
hostname -I
```

11. Login in your web browser using the URL schema: http://IP_addresss:5678 (5678 is a port).

12. Follow the video tutorial to see how to import and run the flow in n8n.