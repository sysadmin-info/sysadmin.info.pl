---
title: How to install Red Hat OpenShift CodeReady Containers in Linux
date: 2023-11-19T16:00:00+00:00
description: How to install Red Hat OpenShift CodeReady Containers in Linux
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- OpenShift
categories:
- OpenShift
cover:
    image: images/2023-thumbs/openshift01.webp
---

1. **Here is a video tutorial**

{{<youtube Sc4O96nh4aw>}}


Scripts and configuration files are available [here:](https://github.com/sysadmin-info/openshift)

{{< notice info "info" >}}
Please bear in mind that the user you are using for the installatiopn (the one that is currently logged in through ssh) has to be in sudoers group. 
{{< /notice >}}

##### System requirements: 
* 4 physical CPU cores or vCPU
* 9 GB of free RAM, so the machine should have at least 12 GB of RAM In total
* 35 GB of storage space
* AMD64/Intel 64
* Microsoft Windows 10 (version 1709 or later)
* MacOS 10.14 Mojave or later
* Red Hat Enterprise Linux/CentOS 7.5 or later

This is an ephemeral cluster setup and you are not supposed to keep any important data or application inside the CRC cluster.

* Meant for development and testing
* No direct upgrade to the newer version of CRC
* Single node OpenShift cluster (common master and worker node)
* The cluster monitoring operator will be disabled by default
* Running as a virtual machine

##### OpenShift installation procedure

1. Go to: https://console.redhat.com/openshift
2. Register an account if you do not have it.
3. Login.
5. Go to the local tab.
4. Download CRC and pull secret
5. Upload to server, where you want to install OpenShift.
6. Extract it
```bash
tar xvf crc-linux-amd64.tar.xz
```
7. Add variable to the .bashrc file
```bash
echo 'export PATH=$PATH:~/crc-linux-2.29.0-amd64' >> ~/.bashrc
```
8. Perform the below command:
```bash
source ~/.bashrc
```
9. Type
```bash
crc version
```
to ensure the executable is working fine

10. Perform the below commands one by one to install OpenShift

```bash
crc setup
crc config set cpus 4
crc config set memory 10000
crc start -p pull-secret
```

##### HAProxy installation procedure
{{< notice warning "warning" >}}
Perform this procedure only on a local network. Exposing an insecure server on the internet has many security implications.
{{< /notice >}}

1. Ensure that the cluster remains running during this procedure.
2. Install the haproxy package and other utilities by running the script haproxy.sh from here: [haproxy.sh](https://github.com/sysadmin-info/openshift)
3. Change permissions for the file
```bash
chmod +x  haproxy.sh
```
4. Run the script
```bash
./haproxy.sh
```
5. Add a wildcard in Adguard Home / Pi-Hole for IP address. See the video.
6. Now test the cluster with openshift CLI or in short oc
```bash
echo 'eval $(crc oc-env)' >> ~/.bashrc
source ~/.bashrc
oc login -u kubeadmin https://api.crc.testing:6443
oc get projects
oc get nodes
oc get pods -A
oc get all -A
```

##### Stop, delete and cleanup OpenShift

1. Perform the below commands one by one:

```bash
crc stop
crc delete
crc cleanup
```

2. Run the below command:
```bash
chmod +x haproxy-remove.sh
./haproxy-remove.sh
```

The file you  will find here: [haproxy-remove.sh](https://github.com/sysadmin-info/openshift) 
