---
title: How to install K3S and Rancher using Helm and manage Raspberry Pi CM4 cluster
date: 2023-09-28T13:00:00+00:00
description: How to install K3S and Rancher using Helm and manage Raspberry Pi CM4
  cluster
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
    image: images/2023-thumbs/k3s-helm-rancher.webp
---
I will walk you through the k3s and rancher installation and configuration steps in this article. 

1. **Here is a video tutorial; continue reading for a list of written instructions.**

{{<youtube xz2hYVPj-Fw>}}

#### Exercises to complete:
1. Uninstall k3s on master node and workers
2. Uninstall rancher
3. Add cgroup entries into the cmdline.txt and reboot each node with ARM processor
4. Install k3s v1.26.9+k3s1 without traefik on a master node
5. Check the status of k3s
6. Add autocomplete for k3s
7. Add k3s configuration into the environment
8. Install nginx as ingress controller in k3s
9. Install NGINX ingress controller load balancer 
10. Perform cluster check
11. Install Git and Helm
12. Add autocomplete for Helm
13. Add Rancher repository
14. Update repository using Helm
15. Generate certificate
16. Create namespace cattle-system
17. Create secret using name tls-rancher-ingress
18. Create a file values.yaml
19. Export k3s configuration
20. Wait 30 seconds for NGINX ingress-controller
21. Install Rancher using Helm
22. Wait 120 seconds for Rancher
23. Display all pods and check status of rancher pods.
24. Display the Rancher dashboard URL 
25. Copy the URL and put it into the address bar into your web browser. 
26. Then login to Rancher using initial password test123 and login: admin.
27. Copy the token
28. Copy IP address of the master node
29. Install newest k3s on worker nodes
30. Add labels to worker nodes on master node
31. Check node status and pods
32. Check the configuration on the master node.
33.  Check k3s services

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

#### Install k3s v1.26.9+k3s1 securely without the traefik on a master node

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.26.9+k3s1" INSTALL_K3S_EXEC="--disable traefik" K3S_KUBECONFIG_MODE="644" sh -s -
```

#### Check the status of k3s

```bash
systemctl status k3s
systemctl is-enabled k3s
```

#### Add autocomplete permanently to your bash shell.

```bash
echo "source <(kubectl completion bash)" >> ~/.bashrc
source ~/.bashrc
```


#### Add k3s configuration into the environment

Edit the file
```bash
sudo vim /etc/environment
```

Add the below entry:
```vim
KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

```bash
source /etc/environment
```

{{< notice success "Explanation:" >}}
source is a Bash shell built-in command that executes the content of the file passed as an argument in the current shell. It has a synonym in . (period).
{{< /notice >}}


#### What is NGINX ingress controller?

See the documentation: [NGINX ingress controller](https://docs.nginx.com/nginx-ingress-controller/intro/how-nginx-ingress-controller-works/)

#### Install NGINX as ingress controller in k3s

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/baremetal/deploy.yaml
```

See the documentation: [NGINX ingress controller Installation Guide](https://kubernetes.github.io/ingress-nginx/deploy/?ref=blog.thenets.org#bare-metal-clusters)


#### Install NGINX ingress controller load balancer 

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

```bash
kubectl apply -f ingress-controller-load-balancer.yaml
```

#### Perform cluster check
```bash
kubectl cluster-info
kubectl get nodes
kubectl describe nodes rancher
kubectl get pods -A
kubectl get svc --all-namespaces -o wide
```

#### Install git and helm

```bash
sudo apt install git
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

#### Add autocomplete permanently to your bash shell.

```bash
echo "source <(helm completion bash)" >> ~/.bashrc
source ~/.bashrc
```

#### Add Rancher repository

```bash
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
```

#### Update repository using Helm

```bash
helm repo update
```

#### Generate certificate

```bash
openssl genrsa -out rancher.key 2048
openssl req -new -key rancher.key -out rancher.csr
openssl x509 -req -days 365 -in rancher.csr -signkey rancher.key -out rancher.crt
```

#### Create namespace cattle-system

```bash
kubectl create namespace cattle-system
```

#### Create secret using name tls-rancher-ingress

```bash
kubectl -n cattle-system create secret tls tls-rancher-ingress \
  --cert=/home/adrian/rancher.crt \
  --key=/home/adrian/rancher.key
```

#### Create a file values.yaml

```bash
cat > values.yaml <<EOF
# Additional Trusted CAs.
# Enable this flag and add your CA certs as a secret named tls-ca-additional in the namespace.
# See README.md for details.
additionalTrustedCAs: false
antiAffinity: preferred
topologyKey: kubernetes.io/hostname

# Audit Logs https://rancher.com/docs/rancher/v2.x/en/installation/api-auditing/
# The audit log is piped to the console of the rancher-audit-log container in the rancher pod.
# https://rancher.com/docs/rancher/v2.x/en/installation/api-auditing/
# destination stream to sidecar container console or hostPath volume
# level: Verbosity of logs, 0 to 3. 0 is off 3 is a lot.

auditLog:
  destination: sidecar
  hostPath: /var/log/rancher/audit/
  level: 0
  maxAge: 1
  maxBackup: 1
  maxSize: 100


  # Image for collecting rancher audit logs.
  # Important: update pkg/image/export/resolve.go when this default image is changed, so that it's reflected accordingly in rancher-images.txt generated for air-gapped setups.

  image:
    repository: "rancher/mirrored-bci-micro"
    tag: 15.4.14.3
    # Override imagePullPolicy image
    # options: Always, Never, IfNotPresent
    pullPolicy: "IfNotPresent"


# As of Rancher v2.5.0 this flag is deprecated and must be set to 'true' in order for Rancher to start
addLocal: "true"

# Add debug flag to Rancher server
debug: false

# When starting Rancher for the first time, bootstrap the admin as restricted-admin
restrictedAdmin: false

# Extra environment variables passed to the rancher pods.
# extraEnv:
# - name: CATTLE_TLS_MIN_VERSION
#   value: "1.0"


# Fully qualified name to reach your Rancher server
hostname: rancher.local


## Optional array of imagePullSecrets containing private registry credentials
## Ref: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/
imagePullSecrets: []

# - name: secretName

### ingress ###

# Readme for details and instruction on adding tls secrets.
ingress:
  # If set to false, ingress will not be created
  # Defaults to true
  # options: true, false
  enabled: true
  includeDefaultExtraAnnotations: true
  extraAnnotations: {}
  ingressClassName: "nginx"
  # backend port number
  servicePort: 80

  # configurationSnippet - Add additional Nginx configuration. This example statically sets a header on the ingress.
  # configurationSnippet: |
  #   more_set_input_headers "X-Forwarded-Host: {{ .Values.hostname }}";

  tls:
    # options: rancher, letsEncrypt, secret
    source: secret
    secretName: tls-rancher-ingress


### service ###
# Override to use NodePort or LoadBalancer service type - default is ClusterIP

service:
  type: ""
  annotations: {}


### LetsEncrypt config ###
# ProTip: The production environment only allows you to register a name 5 times a week.
#         Use staging until you have your config right.

letsEncrypt:
  # email: none@example.com
  environment: production
  ingress:
    # options: traefik, nginx
    class: "nginx"

# If you are using certs signed by a private CA set to 'true' and set the 'tls-ca'
# in the 'rancher-system' namespace. See the README.md for details
privateCA: false

# http[s] proxy server passed into rancher server.
# proxy: http://example.local:1080

# comma separated list of domains or ip addresses that will not use the proxy
noProxy: 127.0.0.0/8,10.42.0.0/16,10.43.0.0/16,192.168.0.1/24,10.10.0.0/24,rancher.local

# Override rancher image location for Air Gap installs
rancherImage: rancher/rancher

# rancher/rancher image tag. https://hub.docker.com/r/rancher/rancher/tags/
# Defaults to .Chart.appVersion
# rancherImageTag: v2.0.7

# Override imagePullPolicy for rancher server images
# options: Always, Never, IfNotPresent
# Defaults to IfNotPresent
# rancherImagePullPolicy: <pullPolicy>

# Number of Rancher server replicas. Setting to negative number will dynamically between 0 and the abs(replicas) based on available nodes.
# of available nodes in the cluster
replicas: 3

# Set priorityClassName to avoid eviction
priorityClassName: rancher-critical

# Set pod resource requests/limits for Rancher.
resources: {}

#
# tls
#   Where to offload the TLS/SSL encryption
# - ingress (default)
# - external
tls: ingress

systemDefaultRegistry: ""

# Set to use the packaged system charts
useBundledSystemChart: false

# Certmanager version compatibility
certmanager:
  version: ""

# Rancher custom logos persistence
customLogos:
  enabled: false
  volumeSubpaths:
    emberUi: "ember"
    vueUi: "vue"

  ## Volume kind to use for persistence: persistentVolumeClaim, configMap
  volumeKind: persistentVolumeClaim
  ## Use an existing volume. Custom logos should be copied to the volume by the user
  # volumeName: custom-logos
  ## Just for volumeKind: persistentVolumeClaim
  ## To disables dynamic provisioning, set storageClass: "" or storageClass: "-"
  # storageClass: "-"
  accessMode: ReadWriteOnce
  size: 1Gi


# Rancher post-delete hook
postDelete:
  enabled: true
  image:
    repository: rancher/shell
    tag: v0.1.20

  namespaceList:
    - cattle-fleet-system
    - cattle-system
    - rancher-operator-system

  # Number of seconds to wait for an app to be uninstalled
  timeout: 120

  # by default, the job will fail if it fail to uninstall any of the apps
  ignoreTimeoutError: false

# Set a bootstrap password. If leave empty, a random password will be generated.
bootstrapPassword: "test1234"

livenessProbe:
  initialDelaySeconds: 60
  periodSeconds: 30

readinessProbe:
  initialDelaySeconds: 5
  periodSeconds: 30


global:
  cattle:
    psp:
      # will default to true on 1.24 and below, and false for 1.25 and above
      # can be changed manually to true or false to bypass version checks and force that option
      enabled: ""
EOF
```

#### Export k3s configuration

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

{{< notice success "Explanation:" >}}
Export is a built-in command of the Bash shell. It is used to mark variables and functions to be passed to child processes. Basically, a variable will be included in child process environments without affecting other environments.
{{< /notice >}}

#### Wait 30 seconds for NGINX ingress-controller.

#### Install Rancher using Helm.

```bash
helm install rancher rancher-stable/rancher --namespace cattle-system -f values.yaml
```

#### Wait 120 seconds for Rancher.

#### Display all pods and check status of rancher pods.

```bash
kubectl get pods -A
```

#### Display the Rancher dashboard URL 

```bash
echo https://rancher.local/dashboard/?setup=$(kubectl get secret --namespace cattle-system bootstrap-secret -o go-template='{{.data.bootstrapPassword|base64decode}}')
```

#### Copy the URL and put it into the address bar into your web browser. Then login to Rancher using initial password test123 and login: admin.


### Installation on worker nodes

#### Copy the token

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

#### Copy IP address of the master node

```bash
hostname -I | awk '{ print $1 }'
```

#### Install newest k3s on worker nodes
```bash
curl -sfL https://get.k3s.io | K3S_TOKEN="<YOUR_TOKEN>" K3S_URL="https://<MASTER_NODE_URL>:6443" K3S_NODE_NAME="worker1" sh -
curl -sfL https://get.k3s.io | K3S_TOKEN="<YOUR_TOKEN>" K3S_URL="https://<MASTER_NODE_URL>:6443" K3S_NODE_NAME="worker2" sh -
curl -sfL https://get.k3s.io | K3S_TOKEN="<YOUR_TOKEN>" K3S_URL="https://<MASTER_NODE_URL>:6443" K3S_NODE_NAME="worker3" sh -
```

#### Add labels to worker nodes on master node

```bash
kubectl label nodes worker1 kubernetes.io/role=worker
kubectl label nodes worker2 kubernetes.io/role=worker
kubectl label nodes worker3 kubernetes.io/role=worker
```

#### Check node status

```bash
kubectl get nodes
```

#### Check pods

```bash
kubectl get pods -A
```

#### Check the configuration on the master node.

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