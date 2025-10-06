---
title: What are Port and TargetPort in Kubernetes?
date: 2024-01-09T10:00:00+00:00
description: Article explains what are a Port and TargetPort in Kubernetes and compares them to a number you dial on an internal phone system in an apartment building to reach someone in a specific apartment.
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
    image: images/2024-thumbs/port.webp
---
**Here is a short video; continue reading to find out more.**
{{<youtube chU2pqzuC2I>}}

In Kubernetes, 'Port' and 'TargetPort' are crucial settings within a service that control how network traffic is routed to the pods. (The rest of the article is under the image.)

![internal phone system](/images/2024/internal-phone-system.webp "internal phone system")<figcaption>internal phone system</figcaption>

* **Port:** This refers to the port number on the service itself. It's the point of contact for other services or external users when they want to communicate with the pods managed by this service.

	* **Analogy:** Imagine this as a number on an internal phone system in an apartment building. When you want to contact someone in the building, you dial this number. Similarly, when someone wants to access a service in Kubernetes, they use this 'Port' number.

* **TargetPort:** This is the specific port on the pod to which the service forwards the incoming traffic. It’s where the application inside the pod is actually listening for requests.

	* **Analogy:** Think of 'TargetPort' as the actual apartment number in the building. When you dial a number on the internal phone system (Port), you are connected to a specific apartment (TargetPort) where the person you want to speak to lives.

Together, 'Port' and 'TargetPort' ensure that external or internal requests reach the correct destination inside the cluster, much like how a well-organized internal phone system ensures you connect with the right apartment in a large building.