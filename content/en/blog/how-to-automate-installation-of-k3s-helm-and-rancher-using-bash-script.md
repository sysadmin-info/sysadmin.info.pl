---
title: How to automate installation of K3S, Helm and Rancher using Bash script
date: 2023-09-28T14:00:00+00:00
description: How to automate installation of K3S, Helm and Rancher using Bash script
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
    image: images/2023-thumbs/k3s-helm-rancher-bash.webp
---
I will walk you through the k3s and rancher installation and configuration steps in this article. 

1. **Here is a video tutorial; continue reading for a list of written instructions.**

{{<youtube sHTfc3Whu-8>}}

Scripts can be found here: [Bash scripts](https://github.com/sysadmin-info/rancher)

#### Exercises to complete:
1. Uninstall k3s on master node and workers
2. Add cgroup entries into the cmdline.txt and reboot each node with ARM processor
3. Install k3s v1.26.9+k3s1 without traefik, Helm and Rancher on a master node using a Bash script
4. Display the Rancher dashboard URL 
5. Copy the URL and put it into the address bar into your web browser. 
6. Then login to Rancher using initial password test1234 and login: admin.
7. Copy the token
8. Copy IP address of the master node
9. Install newest k3s on worker nodes
10. Add labels to worker nodes on master node
11. Check node status and pods
12. Check the configuration on the master node.
13. Check k3s services

#### Uninstall k3s on master node and workers

* Bash script for master node:

```vim
#!/bin/bash -e

# Function to check for file existence and execute it
execute_if_exists() {
    local file_path="$1"
    local description="$2"
    if [ -f "$file_path" ]; then
        echo "Executing ${description}..."
        sh "$file_path"
    else
        echo "${description} does not exist in ${file_path%/*}."
    fi
}

# Function to configure iptables
configure_iptables() {
    iptables-save | awk '/^[*]/ { print $1 } /COMMIT/ { print $0; }' | sudo iptables-restore
    iptables -S
    iptables -F
    update-alternatives --set iptables /usr/sbin/iptables-legacy
    update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
}

# Check if the user is root
if [ "$UID" -ne 0 ]; then
    echo "You are not the root user."
    exit 1
fi

echo "You are the root user."

# Executions
execute_if_exists "/usr/local/bin/k3s-killall.sh" "k3s-killall.sh"
execute_if_exists "/usr/local/bin/k3s-uninstall.sh" "k3s-uninstall.sh"

# Check and remove helm
if [ -f "/usr/local/bin/helm" ]; then
    echo "Removing helm..."
    rm -f /usr/local/bin/helm
else
    echo "Helm does not exist in /usr/local/bin."
fi

# Configure iptables
configure_iptables
```

* Bash script for worker nodes:

```vim
#!/bin/bash -e

# Function to check for file existence and execute it
execute_if_exists() {
    local file_path="$1"
    local description="$2"
    if [ -f "$file_path" ]; then
        echo "Executing ${description}..."
        sh "$file_path"
    else
        echo "${description} does not exist in ${file_path%/*}."
    fi
}

# Function to configure iptables
configure_iptables() {
    iptables-save | awk '/^[*]/ { print $1 } /COMMIT/ { print $0; }' | sudo iptables-restore
    iptables -S
    iptables -F
    update-alternatives --set iptables /usr/sbin/iptables-legacy
    update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
}

# Check if the user is root
if [ "$UID" -ne 0 ]; then
    echo "You are not the root user."
    exit 1
fi

echo "You are the root user."

# Executions
execute_if_exists "/usr/local/bin/k3s-killall.sh" "k3s-killall.sh"
execute_if_exists "/usr/local/bin/k3s-agent-uninstall.sh" "k3s-agent-uninstall.sh"

# Configure iptables
configure_iptables
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

### Install k3s v1.26.9+k3s1 without traefik, Helm and Rancher on a master node using a Bash script


{{< notice success "hostNetwork: true" >}}

When you set hostNetwork: true in your Kubernetes Pod specification, the Pod uses the host’s network namespace, instead of its own. This can lead to a situation where the Pod cannot reach the external IPs of services within the same cluster. See the article: [Kubernetes pod with hostNetwork: true cannot reach external IPs of services in the same cluster](https://sysadmin.info.pl/en/blog/kubernetes-pod-with-hostnetwork/)
{{< /notice >}}

#### Create a file rancher.sh

```bash
vim rancher.sh
```

#### Put the below content into the file

```vim
#!/bin/bash -e

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')]: $*"
}

# Function to display spinner
display_spinner() {
  local pid=$1
  local spin='-\|/'

  log "Loading..."

  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
    local temp=${spin#?}
    printf "\r [%c]" "$spin"
    local spin=$temp${spin%"$temp"}
    sleep 0.1
  done
  printf "\r"
}

execute_command() {
  local cmd="$*"
  log "Executing: $cmd"
  bash -c "$cmd" &
  display_spinner $!
}

error_exit() {
  log "$1"
  exit 1
}

install_k3s() {
  execute_command "curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=\"v1.26.9+k3s1\" INSTALL_K3S_EXEC=\"--disable traefik\" K3S_KUBECONFIG_MODE=\"644\" sh -s -" || error_exit "Failed to install k3s"
  execute_command "systemctl -q is-active k3s.service" || error_exit "k3s service not active. Exiting..."
}

setup_bash_autocomplete() {
  echo "source <(kubectl completion bash)" >> ~/.bashrc
  source ~/.bashrc
}

setup_environment() {
  cat << EOF | sudo tee /etc/environment
KUBECONFIG=/etc/rancher/k3s/k3s.yaml
EOF
  sudo cat /etc/environment
  source /etc/environment
}

install_nginx() {
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/baremetal/deploy.yaml
}

patch_nginx() {
  cat > ingress.yaml <<EOF
spec:
  template:
    spec:
      hostNetwork: true
EOF
  kubectl patch deployment ingress-nginx-controller -n ingress-nginx --patch "$(cat ingress.yaml)"
}

perform_cluster_check() {
  kubectl cluster-info
  kubectl get nodes
  kubectl describe nodes rancher
  kubectl get pods -A
  kubectl get svc -A -o wide
}

install_git_helm() {
  sudo apt install git
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
}

helm_autocomplete() {
  echo "source <(helm completion bash)" >> ~/.bashrc
  source ~/.bashrc
}

add_rancher_repo() {
  helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
  helm repo update
}

generate_certs() {
  openssl genrsa -out rancher.key 2048
  echo 'This part is interactive. Provide proper values.'
  openssl req -new -key rancher.key -out rancher.csr
  openssl x509 -req -days 365 -in rancher.csr -signkey rancher.key -out rancher.crt
}

generate_secret() {
  kubectl -n cattle-system create secret tls tls-rancher-ingress \
  --cert=/home/adrian/rancher.crt \
  --key=/home/adrian/rancher.key
}

generate_values() {
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
}

main() {
  if install_k3s; then
    echo 'k3s is running...'
    setup_bash_autocomplete
    setup_environment
    install_nginx
    patch_nginx
    perform_cluster_check
    install_git_helm
    helm_autocomplete
    add_rancher_repo
    generate_certs
    generate_values
    kubectl create namespace cattle-system
    generate_secret

    export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

    echo 'Wait 30 seconds...'
    sleep 30 & # Background sleep command
    display_spinner $! # Pass the PID of the last background command

    helm install rancher rancher-stable/rancher --namespace cattle-system -f values.yaml

    echo 'Wait 120 seconds...'
    sleep 120 & # Background sleep command
    display_spinner $! # Pass the PID of the last background command

    kubectl get pods -A
  else
    echo "Failed to install k3s. Exiting..."
  fi
}

main
```

#### Make the script executable

```bash
sudo chmod +x rancher.sh
```

#### Execute the script

```bash
./rancher.sh
```

#### Display the Rancher dashboard URL 

```bash
echo https://rancher.local/dashboard/?setup=$(kubectl get secret --namespace cattle-system bootstrap-secret -o go-template='{{.data.bootstrapPassword|base64decode}}')
```

#### Copy the URL and put it into the address bar into your web browser. Then login to Rancher using initial password test1234 and login: admin.

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
