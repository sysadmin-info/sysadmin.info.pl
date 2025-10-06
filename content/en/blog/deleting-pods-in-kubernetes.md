---
title: Deleting pods in Kubernetes in Raspberry Pi CM4
date: 2023-09-01T15:00:00+00:00
description: Deleting pods in Kubernetes in Raspberry Pi CM4
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
    image: images/2023-thumbs/deleting-pods.webp
---
1. **Here is a video tutorial; continue reading for a list of written instructions.**
{{<youtube 6VJxxxkPeJ4>}}
#### Exercises to complete:
1. Delete all pods from default namespace.
2. Create a namespace
3. Get namespaces
4. Create a pod in a given namespace
5. Display all pods
6. Delete all pods from a given namespace

##### Delete all pods from default namespace.
```bash
# displays all pods in all namespaces
kubectl get pods -A
# The below command deletes pods in default namespace.
kubectl delete pods --all
```
Delete pods manually or create a namespace and delete pods from a defined namespace.
##### Create a namespace
```bash
kubectl create namespace my-pods
```
##### Get namespaces
```bash
kubectl get namespace
```
##### Create a pod in a given namespace
```bash
kubectl run ubuntu --image=ubuntu -n my-pods
```
##### Display all pods
```bash
kubectl get pods -A
```
##### Delete all pods from a given namespace
```bash
kubectl delete pods --all -n my-pods
```