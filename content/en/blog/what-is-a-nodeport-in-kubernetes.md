---
title: What is a NodePort in Kubernetes?
date: 2024-01-06T18:00:00+00:00
description: Article explains what is a NodePort in Kubernetes is and compares it to mail slot in an apartment door.
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Kubernetes
categories:
- Raspberry Pi
cover:
    image: images/2024-thumbs/nodeport.webp
---
**Here is a short video; continue reading to find out more.**
{{<youtube CZ2GQhrEC-0>}}

NodePort is a type of service in Kubernetes that makes a pod accessible from outside the Kubernetes cluster. It's like opening a specific channel for external traffic to reach your pods. (The rest of the article is under the image.)

![mail slot](/images/2024/mail-slot.webp "mail slot")<figcaption>mail slot</figcaption>

Think of NodePort like a mail slot in an apartment door. Just as the mail slot allows letters (network traffic) to be delivered directly from the outside world into an apartment, NodePort allows external requests to reach the right pod within your Kubernetes cluster.