---
title: How to install rancher and K3S in Raspberry Pi CM4 and manage a cluster
date: 2023-09-08T16:00:00+00:00
description: How to install rancher and K3S in Raspberry Pi CM4 and manage a cluster
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
    image: images/2023-thumbs/k3s-rancher.webp
---
I will walk you through the k3s and rancher installation and configuration steps in this article. 

1. **Here is a video tutorial; continue reading for a list of written instructions.**

{{<youtube RwMpXQMO-zE>}}

#### Exercises to complete:
1. Uninstall k3s on master node and workers
2. Uninstall rancher
3. Add cgroup entries into the cmdline.txt and reboot each node with ARM processor
4. Install k3s k3s v1.21.1+k3s1 securely without traefik
5. Check the status of k3s
6. Copy the token
7. Copy IP address of the master node
8. Install k3s v1.21.1+k3s1 on worker nodes
9. Add labels to worker nodes on master node
10. Enable k3s completion
11. Install nginx as ingress controller in k3s
12. Check nodes and pods status
13. Create a load balancer to expose NGINX ingress controller ports
14. Create a namespace test
15. Create an example for testing
16. Test the configuration
17. Check the example test application
18. Install and configure Rancher

#### Uninstall k3s on master node and workers

* Bash script for master node:

```vim
#!/bin/bash

# Check if user is root
if [ "$UID" -ne 0 ]; then
    echo "You are not the root user."
    exit 1
fi

echo "You are the root user."

# Check if k3s-killall.sh exists in /usr/local/bin
if [ -f "/usr/local/bin/k3s-killall.sh" ]; then
    echo "Executing k3s-killall.sh..."
    /usr/local/bin/k3s-killall.sh
else
    echo "k3s-killall.sh does not exist in /usr/local/bin."
fi

# Check if k3s-uninstall.sh exists in /usr/local/bin
if [ -f "/usr/local/bin/k3s-uninstall.sh" ]; then
    echo "Executing k3s-uninstall.sh..."
    /usr/local/bin/k3s-uninstall.sh
else
    echo "k3s-uninstall.sh does not exist in /usr/local/bin."
fi

apt install iptables
iptables-save | awk '/^[*]/ { print $1 } /COMMIT/ { print $0; }' | sudo iptables-restore
iptables -S
iptables -F
update-alternatives --set iptables /usr/sbin/iptables-legacy
update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
reboot
```

* Bash script for worker nodes:

```vim
#!/bin/bash

# Check if user is root
if [ "$UID" -ne 0 ]; then
    echo "You are not the root user."
    exit 1
fi

echo "You are the root user."

# Check if k3s-killall.sh exists in /usr/local/bin
if [ -f "/usr/local/bin/k3s-killall.sh" ]; then
    echo "Executing k3s-killall.sh..."
    /usr/local/bin/k3s-killall.sh
else
    echo "k3s-killall.sh does not exist in /usr/local/bin."
fi

# Check if k3s-agent-uninstall.sh exists in /usr/local/bin
if [ -f "/usr/local/bin/k3s-agent-uninstall.sh" ]; then
    echo "Executing k3s-agent-uninstall.sh..."
    /usr/local/bin/k3s-agent-uninstall.sh
else
    echo "k3s-agent-uninstall.sh does not exist in /usr/local/bin."
fi

apt install iptables
iptables-save | awk '/^[*]/ { print $1 } /COMMIT/ { print $0; }' | sudo iptables-restore
iptables -S
iptables -F
update-alternatives --set iptables /usr/sbin/iptables-legacy
update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
reboot
```

* Bash script for rancher

```vim
#!/bin/bash

# Check if user is root
if [ "$UID" -ne 0 ]; then
    echo "You are not the root user."
    exit 1
fi

echo "You are the root user."

# Check if rancherd-killall.sh exists in /usr/local/bin
if [ -f "/usr/local/bin/rancherd-killall.sh" ]; then
    echo "Executing rancherd-killall.sh..."
    /usr/local/bin/rancherd-killall.sh
else
    echo "rancherd-killall.sh does not exist in /usr/local/bin."
fi

# Check if rancherd-uninstall.sh exists in /usr/local/bin
if [ -f "/usr/local/bin/rancherd-uninstall.sh" ]; then
    echo "Executing rancherd-uninstall.sh..."
    /usr/local/bin/rancherd-uninstall.sh
else
    echo "rancherd-uninstall.sh does not exist in /usr/local/bin."
fi

apt install iptables
iptables-save | awk '/^[*]/ { print $1 } /COMMIT/ { print $0; }' | sudo iptables-restore
iptables -S
iptables -F
update-alternatives --set iptables /usr/sbin/iptables-legacy
update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
reboot
```

#### Add cgroup entries into the cmdline.txt on each nodes that is running on ARM processor.

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

#### Install k3s v1.21.1+k3s1 securely without the traefik on a master node

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.21.1+k3s1" INSTALL_K3S_EXEC="--disable traefik" K3S_KUBECONFIG_MODE="644" sh -s -
```

#### Check the status of k3s

```bash
systemctl status k3s
systemctl is-enabled k3s
```

#### Copy the token

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

#### Copy IP address of the master node

```bash
hostname -I | awk '{ print $1 }'
```

#### Install k3s v1.21.1+k3s1 on worker nodes
```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.21.1+k3s1" K3S_TOKEN="<YOUR_TOKEN>" K3S_URL="https://<MASTER_NODE_URL>:6443" K3S_NODE_NAME="worker1" sh -
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.21.1+k3s1" K3S_TOKEN="<YOUR_TOKEN>" K3S_URL="https://<MASTER_NODE_URL>:6443" K3S_NODE_NAME="worker2" sh -
```

#### Add labels to worker nodes on master node

```bash
kubectl label nodes worker1 kubernetes.io/role=worker
kubectl label nodes worker2 kubernetes.io/role=worker
```
#### Enable k3s completion

```bash
echo 'source <(kubectl completion bash)' >>~/.bashrc
source <(kubectl completion bash)
source .bashrc
```

#### What is NGINX ingress controller?

See the documentation: [NGINX ingress controller](https://docs.nginx.com/nginx-ingress-controller/intro/how-nginx-ingress-controller-works/)

#### Install NGINX as ingress controller in k3s

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/baremetal/deploy.yaml
```

See the documentation: [NGINX ingress controller Installation Guide](https://kubernetes.github.io/ingress-nginx/deploy/?ref=blog.thenets.org#bare-metal-clusters)


#### Check node status

```bash
kubectl get nodes
```

#### Check pods

```bash
kubectl get pods -A
```

#### Create a load balancer to expose NGINX ingress controller ports

```bash
vim ingress-controller-load-balancer.yaml
```

* Put the below content into the file

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx-controller-loadbalancer
  namespace: ingress-nginx
spec:
  selector:
    app.kubernetes.io/component: controller
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
  ports:
    - name: http
      port: 80
      protocol: TCP
      targetPort: 80
    - name: https
      port: 443
      protocol: TCP
      targetPort: 443
  type: LoadBalancer
```

* Save and exit

#### Apply the load balancer file

```bash
kubectl apply -f ingress-controller-load-balancer.yaml
```


#### Create a namespace test

```bash
kubectl  create namespace test
```

#### Create an example for testing

The sample below uses the NGINX ingress controller to establish a deployment and expose it. Because SSL will be utilized by default and produce an error for a nonexistent certificate, it's critical to pay attention to the annotation nginx.ingress.kubernetes.io/ssl-redirect: "false".

The domain name that is used is another crucial factor. I'm going to use the domain name test.localhost, but you should obviously change it to your own and direct it to your k3s instance node.

Create a file called my-example.yaml and use the following syntax to implement this example for Ingress testing:

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-nginx-app
  namespace: test
spec:
  selector:
    matchLabels:
      name: test-nginx-backend
  template:
    metadata:
      labels:
        name: test-nginx-backend
    spec:
      containers:
        - name: backend
          image: docker.io/nginx:alpine
          imagePullPolicy: Always
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: test-nginx-service
  namespace: test
spec:
  ports:
    - name: http
      port: 80
      protocol: TCP
      targetPort: 80
  selector:
    name: test-nginx-backend
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: test-nginx-ingress
  namespace: test
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
  - host: test.localhost
    http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: test-nginx-service
              port:
                number: 80

```

#### Apply the example for testing

```bash
kubectl apply -f my-example.yaml --namespace test
```

#### Test the configuration

```bash
kubectl cluster-info
kubectl get nodes
kubectl get pods -A
kubectl config get-contexts
kubectl get all --all-namespaces
```

#### Check k3s services

```bash
kubectl get svc --all-namespaces -o wide 
```

#### Check the example test application

```bash
curl http://10.43.XX.XX
```
If it will not work, just perform the below command and then check once again application

```bash
kubectl replace -f test.yaml --namespace test --force
```

#### Install Rancher

* Switch to root
```bash
sudo -i
```

* Create a directory
```bash
mkdir -p /etc/rancher/rke2
```

* Create config.yaml

```bash
vim /etc/rancher/rke2/config.yaml
```

* Add the below entries to the config.yaml file. Change the IP address - it has to be the same IP as the machine where you are installing Rancher.

```vim
token: Adw94lUaTgKfR93V0BZU
tls-san:
  - 10.XX.X.XXX
```

* Save and exit

#### Install Rancher v. 2.5.8

```bash
curl -sfL https://get.rancher.io | INSTALL_RANCHERD_VERSION="v2.5.8" sh -
```

#### Enable and start rancherd-server service

```bash
systemctl enable rancherd-server.service
systemctl start rancherd-server.service
```

#### Check the progress with journalctl

```bash
journalctl -eu rancherd-server -f
```

Remember to wait till the end. See the video to understand the explanation. ctrl+c will allow you to exit from journalctl window.

#### Check rancher version

```bash
rancherd -v
```

#### Reset rancher password for admin

```bash
rancherd reset-admin
```

If it does not work just try to restart the rancherd-server service.

```bash
systemctl restart rancherd-server.service
```

Wait a liitle bit and rerun:

```bash
rancherd reset-admin
```

It should show somethig like this:

```bash
INFO[0000] Server URL: https://10.10.0.120:8443         
INFO[0000] Default admin and password created. Username: admin, Password: bk777mwr69wfgpwvbbk2d52f4mjsj4ssqxqnwstcpzvlc9wnlf59mk
```

Copy the URL and the password.

Paste the URL into browser and login as admin with the generated pasword.

Change the password to the one you want to use. It will ask for it. Leave the rest as it is. Select that you agree with terms and conditions. 

#### Override agent image for nodes/cluster with ARM processors. See the video

* In `agentimageoverride` field of the API:

add

```vim
rancher/rancher-agent:v2.5.8-linux-arm64
```