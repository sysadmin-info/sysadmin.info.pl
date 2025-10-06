---
title: What is NGINX ingress controller in Kubernetes?
date: 2024-01-09T11:30:00+00:00
description: Article explains what is NGINX ingress controller in Kubernetes and compares it to a highly skilled receptionist at the main entrance of an apartment building, equipped with additional capabilities and expertise.
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
    image: images/2024-thumbs/nginx-ingress-controller.webp
---
**Here is a short video; continue reading to find out more.**
{{<youtube FW8TP5UDq4g>}}

The NGINX Ingress Controller in Kubernetes can be best understood as a specialized version of the Ingress tool. It's like a highly skilled receptionist at the main entrance of an apartment building, equipped with additional capabilities and expertise.

![highly skilled receptionist](/images/2024/highly-skilled-receptionist.webp "highly skilled receptionist")<figcaption>highly skilled receptionist</figcaption>

Just as this specialized receptionist not only directs visitors to the right apartment but also offers extra services such as security checks, the NGINX Ingress Controller does more than just route external traffic to the appropriate services within the Kubernetes cluster. It provides additional key functionalities:

- **Traffic Routing**: It efficiently manages how incoming external traffic is distributed to various services. This is like guiding visitors to different apartments based on who they are there to see.

- **SSL/TLS Termination**: The NGINX Ingress Controller can handle the encryption and decryption of secure traffic (HTTPS), offloading this task from the individual services. This is akin to performing security checks at the reception before allowing visitors to proceed.

- **Load Balancing**: It also balances the incoming traffic across multiple instances of a service to ensure that no single service is overwhelmed, much like a receptionist managing a queue to avoid overburdening any single service desk.

Overall, the NGINX Ingress Controller is a more advanced and feature-rich gateway in Kubernetes, enhancing the control and security of how external traffic is managed and directed within your cluster.