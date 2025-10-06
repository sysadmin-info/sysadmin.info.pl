---
title: How to install nginx as ingress controller for k3s
date: 2023-08-20T18:00:00+00:00
description: How to install nginx as ingress controller for k3s in Raspberry Pi CM4
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
    image: images/2023-thumbs/k3s-nginx-ingress.webp
---
I will walk you through the NGINX ingress controller installation and configuration steps in this article. 

1. **Here is a video tutorial; continue reading for a list of written instructions.**

{{<youtube wloUT1WPFVc>}}

#### Exercises to complete:
1. install k3s securely without traefik and servicelb
2. install nginx as ingress controller in k3s
3. Check nodes and pods status
4. Create a load balancer to expose NGINX ingress controller ports
5. Create a namespace test
6. Create an example for testing
7. Test the configuration
8. Copy k3s config file
9. Change owner to user for k3s config file
10. Install k9s
11. Run k9s
12. k9s usage explanation
13. Check k3s services
14. Check the example test application

#### Install k3s securely without the traefik and servicelb

```bash
sudo curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik,servicelb" K3S_KUBECONFIG_MODE="644" sh -
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

#### Copy k3s config file

```bash
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
```

Change owner to user for k3s config file

```bash
sudo chown -R $USER:$USER /home/$USER
```

#### Install k9s 

In order to communicate with your Kubernetes clusters, K9s offers a terminal UI. This project's goal is to make it simpler to use, monitor, and administer your apps in the field. K9s continuously scans Kubernetes for modifications and provides follow-up commands to interact with the resources you have selected.

```bash
curl -sS https://webinstall.dev/k9s | bash
```
#### Run k9s

```bash
k9s
```

Quit by pressing ctrl+c

#### k9s usage

```bash
k9s info
k9s help
k9s -A
```

#### Check k3s services

```bash
kubectl get svc --all-namespaces -o wide 
```

#### Check the example test application

```bash
curl http://10.43.13.55
```
