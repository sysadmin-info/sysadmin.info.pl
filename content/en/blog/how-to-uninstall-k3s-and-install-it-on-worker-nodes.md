---
title: How to uninstall k3s and install it on worker nodes
date: 2023-08-30T11:00:00+00:00
description: How to uninstall k3s and install it on worker nodes in Raspberry Pi CM4
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
    image: images/2023-thumbs/k3s-nodes.webp
---
I will walk you through the k3s installation and configuration steps in this article. 

1. **Here is a video tutorial; continue reading for a list of written instructions.**

{{<youtube PBWAnnNlS-k>}}

#### Exercises to complete:
1. Remove k3s from worker node
2. Remove properly worker node on a master node
3. Install k3s on worker node
4. Label a node
5. Recover deleted worker nodes on master node
6. Drain node and uncordone it
7. Check node log

##### Introduction

I decided to install k3s on a Raspberry Pi CM4 IO board with Compute Module 4 and alos on two Raspberry Pis 4b with 8GB RAM.

##### Remove k3s from worker node

Log into worker node via ssh, switch to root and remove k3s from worker node.

```bash
sudo -i 
cd /usr/local/bin
./k3s-killall.sh
./k3s-agent-uninstall.sh
```

##### Remove properly worker node on a master node 

Log into the master node and type:

```bash
kubectl get nodes
```
to check existing nodes

Remove safely pods from worker

You can use kubectl drain to safely evict all of your pods from a node before you perform maintenance on the node (e.g. kernel upgrade, hardware maintenance, etc.). Safe evictions allow the pod's containers to gracefully terminate and will respect the PodDisruptionBudgets you have specified.


```bash
kubectl drain worker
```

Delete nodes

```bash
kubectl delete node worker
```

Check that worker node does not exist anymore

```bash
kubectl get nodes
```
##### Install k3s on worker node

Get the token from master node

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```


Get the IP address of the master node

```bash
hostname -I
```

Log into worker node via ssh and perform the below command:

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://10.10.0.110:6443 K3S_TOKEN=K1035b82... sh -
```

Add cgroup entries into the cmdline.txt

```bash
sudo vim /boot/cmdline.txt
```

Add at the end of the line that starts with console= the below entries:

```bash
cgroup_memory=1 cgroup_enable=memory
```

Save the file and exit.

Reboot the server

```bash
sudo reboot
```

Check worker nodes status on master node


Check node status

```bash
kubectl get nodes
```

##### Label a node

How to label a node 

```bash
kubectl label nodes worker kubernetes.io/role=worker
```

How to change a label

```bash
kubectl label nodes worker kubernetes.io/role=worker-1 --overwrite
```

##### Recover deleted worker nodes on master node

If someone did a drain and then deleted nodes on a master node, log into worker node via ssh and restart the k3s service with the below command

```bash
sudo systemctl restart k3s-agent.service
```

##### Drain node and uncordone it

```bash
kubectl drain worker
kubectl get nodes
kubectl uncordon worker
kubectl get nodes
```

##### Check node log

```bash
kubectl describe node worker
```