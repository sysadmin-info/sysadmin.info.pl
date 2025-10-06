---
title: What is a service in Kubernetes?
date: 2024-01-06T17:00:00+00:00
description: Article explains what is a service in Kubernetes is and compares it to receptionist in a hotel.
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
    image: images/2024-thumbs/service.webp
---
**Here is a short video; continue reading to find out more.**
{{<youtube xpZyYifb6NE>}}

In Kubernetes, a Service is a critical concept that acts like a gateway or a receptionist for pods. It's a way for Kubernetes to expose pods, either to other pods within the same cluster or to external users and systems. (The rest of the article is under the image.)

![receptionist](/images/2024/receptionist.webp "receptionist")<figcaption>receptionist</figcaption>

Think of a Service as a stable address for accessing pods. Just like a receptionist in a hotel who directs your call to the right person, a Service ensures that network traffic is directed to the appropriate pods. This is important because pods can be ephemeral – they might be replaced, moved, or scaled, so their IP addresses can change. The Service provides a consistent way to access the pods, regardless of these changes.

There are different types of Services in Kubernetes:

**NodePort:** This type of Service exposes the pod to external traffic. It opens a specific port on all the nodes (the machines in the Kubernetes cluster), and any traffic that comes to this port is forwarded to the pods. It's like having a public phone number that external callers can use to reach the apartment (pod).

**ClusterIP:** This is the default type of Service and is used for internal communication within the cluster. It assigns a unique IP address to the Service, which other services within the cluster can use to access the pods. It's akin to an internal phone extension within a building, allowing communication between different apartments (pods) without exposing them to the outside world.

In summary, a Service in Kubernetes acts as an intermediary, ensuring smooth and stable communication to and from pods, similar to how a receptionist or a switchboard manages calls in a large building.