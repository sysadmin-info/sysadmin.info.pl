---
title: Creating pods in Kubernetes in Raspberry Pi CM4
date: 2023-09-01T11:00:00+00:00
description: Creating pods in Kubernetes in Raspberry Pi CM4
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
    image: images/2023-thumbs/creating-pods.webp
---
1. **Here is a video tutorial; continue reading for a list of written instructions.**
{{<youtube c1MwmZEHdfI>}}
#### Exercises to complete:
1. Create pod.
2. Create pod with different version of the image.
3. Display pods.
4. Use the watch command to watch the changes live.
##### Create pod. Remember that pod's name has to be unique.
```bash
kubectl run apache1 --image=httpd
```
httpd is in fact apache web server
##### Create pod with different version of the image.
```bash
kubectl run apache1-older --image=httpd:2.2
```
##### Display pods.
```bash
kubecetl get pods
```
##### Use the watch command to watch the changes live.
```bash
watch kubecetl get pods
```
ctrl+c exists watch window