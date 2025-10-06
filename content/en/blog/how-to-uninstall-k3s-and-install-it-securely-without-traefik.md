---
title: How to uninstall k3s and install it securely without traefik
date: 2023-08-20T15:00:00+00:00
description: How to uninstall k3s and install it securely without traefik in Raspberry
  Pi CM4
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
    image: images/2023-thumbs/k3s-traefik.webp
---
I will walk you through the k3s installation and configuration steps in this article. 

1. **Here is a video tutorial; continue reading for a list of written instructions.**

{{<youtube ChHXfOO1R5Q>}}

#### Exercises to complete:
1. Install k3s
2. Remove traefik
3. Install k3s without traefik

#### Introduction

I decided to install k3s on a Raspberry Pi CM4 IO board with Compute Module 4 to show that it is possible to run a single-node cluster.

#### Install k3s

```bash
sudo curl -sfL https://get.k3s.io | sh
```

#### Check k3s status 

```bash
sudo systemctl status k3s
```

####  Remove the k3s

##### Switch to root

```bash
sudo -i
cd /usr/local/bin
./k3s-killall.sh
./k3s-uninstall.sh
```

#### Install k3s securely

```bash
sudo curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
or
sudo curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE="644" sh -
```

#### Find kubeconfig files

```bash
sudo find / -iname "*.kubeconfig"
```

#### Check kubeconfig file permissions

```bash
sudo stat -c %a /var/lib/rancher/k3s/agent/kubelet.kubeconfig
600
```

#### Check k3s status 

```bash
sudo systemctl status k3s
```

#### Add cgroup entries into the cmdline.txt

```bash
sudo vim /boot/cmdline.txt
```

* Add at the end of the line that starts with console= the below entries:

```bash 
cgroup_memory=1 cgroup_enable=memory
```

* Save the file and exit.

#### Reboot the server

```bash
sudo reboot
```

#### Check node status

```bash
kubectl get nodes
```

#### Check pods

```bash
kubectl get pods -A
```

#### Get rid of the traefik

```bash
kubectl -n kube-system delete helmcharts.helm.cattle.io traefik
```

#### Stop k3s 

```bash
sudo systemctl stop k3s
```

#### Edit k3s service file

```bash
sudo vim /etc/systemd/system/k3s.service
```

#### Modify ExectStart

* Add the below line

--disable=traefik

So it should look like this:

```bash
ExecStart=/usr/local/bin/k3s \
	server \
	--disable=traefik \
	'--write-kubeconfig-mode' \
	'644' \
	...
```

#### Reload daemon

```bash
sudo systemctl daemon-reload
```

#### Delete traefik.yaml

```bash
sudo rm /var/lib/rancher/k3s/server/manifests/traefik.yaml
```

#### Start k3s and check the status

```bash
sudo systemctl start k3s
sudo systemctl status k3s
```

#### Check pods

```bash
kubectl get pods -A
```

#### Install k3s securely without the traefik

```bash
sudo curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik" sh -s - --write-kubeconfig-mode 644
or
sudo curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik" K3S_KUBECONFIG_MODE="644" sh -
```

#### Check pods

```bash
kubectl get pods -A
```
