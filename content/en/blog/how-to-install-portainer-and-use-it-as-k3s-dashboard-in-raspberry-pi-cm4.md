---
title: How to install Portainer and use it as K3S dashboard in Raspberry Pi CM4
date: 2023-10-05T17:20:00+00:00
description: How to install Portainer and use it as K3S dashboard in Raspberry Pi
  CM4
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
    image: images/2023-thumbs/k3s-rancher-portainer.webp
---
I will walk you through the Portainer installation steps in this article. 

1. **Here is a video tutorial; continue reading for a list of written instructions.**

{{<youtube EvaRxmXxV0w>}}

#### Exercises to complete:

1. Install Portainer on master node
2. Open URL in the web browser
3. Delete Portainer if needed

#### Install Portainer on master node

```bash
kubectl apply -f https://raw.githubusercontent.com/portainer/k8s/master/deploy/manifests/portainer/portainer.yaml
```

#### Display the Portainer dashboard URL 

```bash
curl -vk https://<IP_ADDRESS>:<PORT_NUMBER>
```

eg. 

```bash
curl -vk https:10.10.0.120:30777
```

Copy the URL and put it into the address bar into your web browser. Then login to Portainer using login: admin. Generate a password by using a random password generator. 

#### Delete Portainer if needed

```bash
kubectl delete deployments.apps/portainer -n portainer && kubectl delete service portainer -n portainer && kubectl delete serviceaccount -n portainer portainer-sa-clusteradmin && kubectl delete pvc portainer -n portainer && kubectl delete clusterrolebinding portainer && kubectl delete namespace portainer && rm -f portainer.yaml
```
