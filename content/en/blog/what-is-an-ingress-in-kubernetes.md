---
title: What is an ingress in Kubernetes?
date: 2024-01-09T10:30:00+00:00
description: Article explains what is an ingress in Kubernetes and compares it to the main entrance or reception.
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
    image: images/2024-thumbs/ingress.webp
---
**Here is a short video; continue reading to find out more.**
{{<youtube DahTLuhhV60>}}

In Kubernetes, Ingress is a tool that manages external access to services within a cluster, primarily for HTTP and HTTPS traffic. It acts as a controller for routing external requests to the internal services. (The rest of the article is under the image.)

![reception](/images/2024/reception.webp "reception")<figcaption>reception</figcaption>

To understand Ingress, you can think of it as the main entrance or reception of an apartment building. Just as the reception directs visitors to various apartments based on who they want to see, Ingress directs incoming external traffic to the appropriate services within the Kubernetes cluster.

Ingress operates at the application layer of the network stack (HTTP) and can provide features like load balancing, SSL termination, and name-based virtual hosting. This is akin to a reception area that not only directs visitors but also provides additional services like security checks or information assistance.

In summary, Ingress in Kubernetes functions as the primary entry point for external traffic, efficiently directing it to the correct services inside the cluster, similar to a reception guiding visitors in a large building.