---
title: How to deploy n8n in Kubernetes - k3s 
date: 2023-12-29T11:00:00+00:00
description: How to deploy n8n in Kubernetes - k3s 
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
- Home Assistant
cover:
    image: images/2023-thumbs/ulanzi09.webp
---

{{<youtube gE4O2c1H8Vw>}}

##### How to deploy n8n in Kubernetes - k3s 

Quick implementation:

1. Install git

```bash
sudo apt install git
```

2. Clone the repository

```bash
git clone https://github.com/sysadmin-info/n8n-k3s.git
```

3. Enter the directory

```bash
cd n8n-k3s
```

4. Deploy n8n in k3s

```bash
kubectl apply -f .
```

The article details setting up n8n, a workflow automation solution, on Kubernetes. It focuses on the use of YAML files for Kubernetes deployment.

**Key Points:**

1. **n8n Overview**: n8n is a fair-code workflow automation tool, similar to Zapier or IFTTT, suitable for self-hosting or using the paid n8n.cloud service.

2. **Kubernetes Setup for n8n**:
   - **Namespace Creation**: Initially, a Kubernetes namespace 'n8n' is created using `kubectl create namespace n8n`.
   - **Deployment and Service Configuration**:
     - `n8n-deployment.yaml`: Defines a deployment with one replica of the n8n container, exposing port 5678. It includes liveness and readiness probes at `/healthz`, environment variables from a ConfigMap (`n8n-configmap`) and a Secret (`n8n-secrets`), and resource limits.
     - `n8n-service.yaml`: Sets up a NodePort service for n8n, mapping port 80 to the container's port 5678.

3. **PostgreSQL StatefulSet**:
   - `postgres-statefulset.yaml` and `postgres-service.yaml`: Define a StatefulSet and a Service for PostgreSQL, exposing port 5432, and linked to a Secret (`postgres-secrets`).

4. **ConfigMaps and Secrets**:
   - `n8n-configmap.yaml`: Includes environment variables like NODE_ENV, database configurations, and webhook settings.
   - `n8n-secrets.yaml`: Contains secrets for n8n, including database password and encryption key.
   - `postgres-secrets.yaml`: Holds PostgreSQL configuration data.

5. **Deployment Process**:
   - Applying the configuration files (`kubectl apply -f`) for n8n and PostgreSQL.
   - Using `kubectl rollout restart` to restart the StatefulSet and Deployment after applying the configurations.
   - The final setup includes checking services (`kubectl get svc -n n8n`) and accessing n8n via a browser using the NodePort or a custom domain through NGINX Proxy Manager.

The article emphasizes the importance of label alignment in Kubernetes configurations and provides a comprehensive guide for setting up n8n with PostgreSQL on Kubernetes, leveraging ConfigMaps and Secrets for configuration management.

### TLDR
For those who would like to read and know more see the article:

#### What is n8n{#what-is-n8n}

In a nutshell, n8n is a fair-code distribution model-based workflow automation solution that is free and extensible. If you are familiar with low-code/no-code solutions such as [Zapier](https://zapier.com/) or [IFTTT](https://ifttt.com/), n8n may be operated independently and is rather similar.

Being fair-code implies that you are always free to use and distribute the source code. The only drawback is that you might have to pay for a license to use n8n if you make money with it. There are some excellent illustrations of how this methodology differs from conventional "open-source" initiatives in this community discussion [topic](https://community.n8n.io/t/doubts-about-fair-code-license/2502).


Workflows are executed via a NodeJS web server behind the hood. It was founded in [June 2019](https://github.com/n8n-io/n8n/commit/9cb9804eeec1576d935817ecda6bd345480b97fa) and has already amassed [+280 Nodes](https://n8n.io/integrations) and [+500 Workflows](https://n8n.io/workflows/). The community is also quite vibrant; it often takes a few days for a patch to be merged and made available, which is awesome!

This implies that self-hosting n8n is quite simple. Additionally, there is [n8n.cloud](https://www.n8n.cloud/), a hosted version that is paid for and eliminates the need for you to worry about scaling, security, or upkeep.

#### Why use n8n and not Zapier?

For me, it's the expensive price. 💸

Although Zapier is fantastic and most likely capable of handling any use-case that is thrown at it, eventually the free tier will become unusable. You can only design extremely basic "two-step" processes and you quickly reach your "zap" limits. Only clients who make payments can access more intricate flows.

Furthermore, it's not housed on "your environment" (self-hosted or on-premises deployment), which could be problematic if you have tight policies in place regarding the sharing of data with outside providers, for example. Because Zapier is enterprise ready, you can be sure you'll get all the functionality you need and exceptional customer support 💰.

If you don't mind controlling your own instance (scalability, durability, availability, etc.), then n8n will function just as well as any of its competitors that aren't free.

However, the purpose of this piece is to demonstrate how we've set up n8n on our Kubernetes cluster, not to discuss the benefits of using Zapier or n8n.

#### How to setup n8n in Kubernetes

Rather than starting from scratch with a completely new Kubernetes configuration, we will be utilizing the examples given by [@bacarini](https://community.n8n.io/u/bacarini), a community forum user of n8n who offered his [configuration](https://community.n8n.io/t/running-with-kubernetes/681/13).

K3s are being used by me to set up my cluster locally. If this is your first time using it, you may simply follow the [Kubernetes series](https://sysadmin.info.pl/en/series/kubernetes/).

After installing K3s, use the following command to deploy n8n in the cluster:

You will begin with the n8n Deployment configuration and expose it with its Service configuration.

But first you have to create a namespace n8n:

```bash
kubectl create namespace n8n
```

Then create the below files:

```yaml
# n8n-deployment.yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n-deployment
  namespace: n8n
  labels: &labels
    app: n8n
    component: deployment
spec:
  replicas: 1
  selector:
    matchLabels: *labels
  template:
    metadata:
      labels: *labels
    spec:
      containers:
      - name: n8n
        image: n8nio/n8n:latest
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 5678
        envFrom:
        - configMapRef:
            name: n8n-configmap
        - secretRef:
            name: n8n-secrets
        livenessProbe:
          httpGet:
            path: /healthz
            port: 5678
        readinessProbe:
          httpGet:
            path: /healthz
            port: 5678
        resources:
          limits:
            cpu: "1.0"
            memory: "1024Mi"
          requests:
            cpu: "0.5"
            memory: "512Mi"
```

```yaml
# n8n-service.yaml
---
apiVersion: v1
kind: Service
metadata:
  name: n8n-service
  namespace: n8n
  labels:
    app: n8n
    component: service
spec:
  type: NodePort
  selector:
    app: n8n
    component: deployment
  ports:
  - protocol: TCP
    name: http
    port: 80
    targetPort: 5678
```
Important things to remember here:
* To prevent us from copying and pasting the same labels inside of each other, I allocated a &labels variable.yaml configuration (this is the same for the majority of my settings).
* on my n8n-deployment.yaml file, I have the n8n container port set to 5678, which corresponds to the n8n default port. By rerouting traffic from port 80 (http) to the container's targetPort, my n8n-service.yaml exposes the container on that port.
* My n8n container is linked to both my n8n-configmap.yaml and n8n-secrets.yaml files, albeit I still need to build them. I'll take care of that right now.
* In order to verify whether the service is operational, n8n offers a /healthz endpoint. I use that endpoint to set up the Liveness and Readiness Probes for my deployment.
* In the end, I optimize my container's resources to utilize a maximum of 1 CPU and 1 GB of RAM on my cluster.

Pay close attention to the n8n-service selection.We won't be able to reach our n8n server if the yaml configuration on the n8n-deployment container doesn't match the same labels.

You may go here to learn more about selectors and how deployments work with them: [creating Kubernetes deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#creating-a-deployment)

Using those two arrangements, I will therefore have the following:

```bash
kubectl apply -f n8n-deployment.yaml,n8n-service.yaml
deployment.apps/n8n-deployment created
service/n8n-service created
```

You can observe that the pod ```kubectl get pods -n n8n``` is currently in the "CreateContainerConfigError" state if you check it out. This is a result of the ConfigMap and Secrets configuration still being lacking. I will quickly address that.

#### PostgreSQL StatefulSet

The Postgres Statefulset configuration is very similar to our previous Deployment configurations, and looks like this:

```yaml
# postgres-statefulset.yaml
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-statefulset
  namespace: n8n
  labels: &labels
    app: postgres
    component: statefulset
spec:
  serviceName: postgres-statefulset
  replicas: 1
  selector:
    matchLabels: *labels
  template:
    metadata:
      labels: *labels
    spec:
      containers:
      - name: postgres
        image: postgres:10
        ports:
        - name: postgres
          containerPort: 5432
        envFrom:
        - secretRef:
            name: postgres-secrets
```

```yaml
# postgres-service.yaml
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: n8n
  labels: &labels
    app: postgres
    component: service
spec:
  clusterIP: None
  selector:
    app: postgres
    component: statefulset
  ports:
  - name: postgres
    port: 5432
    targetPort: 5432
```

As you can see, the primary variations are:

* The default port for a PostgreSQL server is 5432, which is the port that I am currently exposing in both my postgres-statefulset.yaml and postgres-service.yaml files.
* Similar to the last setup, pay close attention to the service selector, since it needs to line up with the stateful set container's labels.

Using both K8S configurations, the following commands needs to be executed:

```bash
kubectl apply -f postgres-statefulset.yaml,postgres-service.yaml
statefulset.apps/postgres-statefulset created
service/postgres-service created
```

#### ConfigMaps & Secrets

I just need to bootstrap all of the basic PostgreSQL and n8n setups to bind things together:

* My n8n deployment is connected to a Secrets configuration called "n8n-secrets" and a ConfigMap called "n8n-configmap"; 
* The Postgres Statefulset is simply connected to a Secrets configuration called "postgres-secrets."

```yaml
# n8n-configmap.yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: n8n-configmap
  namespace: n8n
  labels:
    app: n8n
    component: configmap
data:
  NODE_ENV: "production"
  GENERIC_TIMEZONE: "Europe/Lisbon"
  WEBHOOK_TUNNEL_URL: "https://your.domain.com/"  # well come back to this later
  # Database configurations
  DB_TYPE: "postgresdb"
  DB_POSTGRESDB_USER: "n8n"
  DB_POSTGRESDB_DATABASE: "n8n"
  DB_POSTGRESDB_HOST: "postgres-service"
  DB_POSTGRESDB_PORT: "5432"
  # Turn on basic auth
  N8N_BASIC_AUTH_ACTIVE: "true"
  N8N_BASIC_AUTH_USER: "n8n"
```

```yaml
# n8n-secrets.yaml
---
apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: n8n-secrets
  namespace: n8n
  labels:
    app: n8n
    component: secrets
stringData:
  # Database password
  DB_POSTGRESDB_PASSWORD: "n8n"
  # Basic auth credentials
  N8N_BASIC_AUTH_PASSWORD: "n8n"
  # Encryption key to hash all data
  N8N_ENCRYPTION_KEY: "n8n"
```

```yaml
# postgres-secrets.yaml
---
apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: postgres-secrets
  namespace: n8n
  labels:
    app: postgres
    component: secrets
stringData:
  PGDATA: "/var/lib/postgresql/data/pgdata"
  POSTGRES_USER: "n8n"
  POSTGRES_DB: "n8n"
  POSTGRES_PASSWORD: "n8n"
```

The majority of these setups are copies and pastes from the [n8n manual](https://docs.n8n.io/reference/configuration.html) or the example provided by [@bacarini](https://community.n8n.io/t/running-with-kubernetes/681/13), but all of them are very common. The key is, as before:

* The n8n-configmap's ```DB_POSTGRESDB_HOST```. For my PostgreSQL service, the yaml configuration needs to match the service name.
* Additionally, the ```WEBHOOK_TUNNEL_URL``` environment needs to be updated. This will primarily be used to call webhooks, however it won't work unless the host url is legitimate.

The n8n FAQs advise using [ngrok to set up that url](https://docs.n8n.io/credentials/twist/#how-to-configure-the-oauth-credentials-for-the-local-environment), but I discovered that in k3s it will function without requiring the installation of any further services on your system. I will just use the service port that will be displayed using the below command:

```bash
kubectl get svc -n n8n
```

In my environment I use a NGINX Proxy manager where I defined the URL the way I presented on the video. So instead of http://10.10.0.112:31600 I am using n8n.local.

```yaml
# ~/k8s/n8n-configmap.yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: n8n-configmap
  namespace: default
  labels:
    app: n8n
    component: configmap
data:
  WEBHOOK_TUNNEL_URL: "http://n8n.local/"
  (...)
```

I can now simply apply all three configuration files, restart Statefulset and Deployment, and these configurations will be reloaded:

```bash
kubectl apply -f kn8n-configmap.yaml,n8n-secrets.yaml,postgres-secrets.yaml
configmap/n8n-configmap created
secret/n8n-secrets created
secret/postgres-secrets created

$ kubectl rollout restart statefulset postgres-statefulset -n n8n
statefulset.apps/postgres-statefulset restarted

$ kubectl rollout restart deployment n8n-deployment -n n8n
deployment.apps/n8n-deployment restarted

$ kubectl get all -n n8n
NAME                                  READY   STATUS    RESTARTS       AGE
pod/n8n-deployment-5c97d55b5f-2tv5b   1/1     Running   55 (27h ago)   2d
pod/postgres-statefulset-0            1/1     Running   1 (27h ago)    28h

NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/n8n-service        NodePort    10.43.184.200   <none>        80:31600/TCP   2d22h
service/postgres-service   ClusterIP   None            <none>        5432/TCP       2d22h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/n8n-deployment   1/1     1            1           2d22h

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/n8n-deployment-84d7b5cd76   0         0         0       2d22h
replicaset.apps/n8n-deployment-65dfc7d567   0         0         0       2d22h
replicaset.apps/n8n-deployment-5c97d55b5f   1         1         1       2d22h

NAME                                    READY   AGE
statefulset.apps/postgres-statefulset   1/1     2d22h
```

#### All together now 🚀

You ought to have something resembling this in your working directory if you have been saving the configurations mentioned above:

```bash
adrian@cm4:~ $ ls -lha n8n-deployment/
total 36K
drwxr-xr-x  2 adrian adrian 4.0K Dec 19 15:46 .
drwxr-xr-x 12 adrian adrian 4.0K Dec 21 10:13 ..
-rw-r--r--  1 adrian adrian  509 Dec 19 15:30 n8n-configmap.yaml
-rw-r--r--  1 adrian adrian  904 Dec 19 15:29 n8n-deployment.yaml
-rw-r--r--  1 adrian adrian  328 Dec 19 11:40 n8n-secrets.yaml
-rw-r--r--  1 adrian adrian  276 Dec 19 11:38 n8n-service.yaml
-rw-r--r--  1 adrian adrian  275 Dec 19 11:41 postgres-secrets.yaml
-rw-r--r--  1 adrian adrian  289 Dec 19 11:39 postgres-service.yaml
-rw-r--r--  1 adrian adrian  523 Dec 19 11:39 postgres-statefulset.yaml
```

All configurations might be deployed simultaneously by executing:

```bash
kubectl apply -f.
```
The time has finally come for me to launch our n8n server in our browser!

So, check the service

```bash
kubectl get svc -n n8n
```

and the IP address of the machine, where K3s is running

```bash
hostname -I
```

and use the NodePort that exposes the service.

So finally it should be eg. http://10.10.0.112:31600 or just http://n8n.local because I am using my own DNS server (Adguard Home). 

