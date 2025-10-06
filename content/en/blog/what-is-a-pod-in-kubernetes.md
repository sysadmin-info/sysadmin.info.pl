---
title: What is a pod in Kubernetes?
date: 2024-01-06T16:00:00+00:00
description: Article explains what is a pod in Kubernetes and compares it to a single apartment in a large apartment building.
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
    image: images/2024-thumbs/pod.webp
---
**Here is a short video; continue reading to find out more.**
{{<youtube -gPQuHro0yM>}}

In the context of Kubernetes, a pod can be thought of as the smallest deployable unit, much like a single apartment within a large apartment building. (The rest of the article is under the image.)

![large apartment building](/images/2024/large-apartment-building.webp "large apartment building")<figcaption>large apartment building</figcaption>

Just as an apartment can have one or more rooms, a pod can contain one or more containers, such as Docker containers. These containers inside a pod are like rooms within an apartment, each serving a specific function or purpose. They share resources and are managed as a single entity.

![apartment plan](/images/2024/apartment-plan.webp "apartment plan")<figcaption>apartment plan</figcaption>

In this analogy, each container (room) in the pod (apartment) works towards a common goal, such as running different aspects of an application. They share the same network address space (like an apartment's address) and can communicate with each other easily, just as people in different rooms of the same apartment can easily talk to each other.

Thus, a pod represents a cohesive unit of deployment in the Kubernetes ecosystem, encapsulating and running a set of containers together.

![apartment](/images/2024/apartment.webp "apartment")<figcaption>apartment</figcaption>