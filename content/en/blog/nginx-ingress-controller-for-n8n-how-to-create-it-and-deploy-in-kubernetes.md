---
title: NGINX ingress controller for n8n - how to create it and deploy in Kubernetes
date: 2024-01-12T21:00:00+00:00
description: Article explains what is NGINX ingress controller in Kubernetes and how to create it for n8n and deploy it. It also reproduces NGINX ingress controller 404 error and shows how to solve the problem.
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
    image: images/2024-thumbs/nginx-ingress-controller-n8n.webp
---
**Here is a short video; continue reading to find out more.**
{{<youtube wMaaoJ9Oj8M>}}

	I recommend to watch the entire video to understand how everything is made and deployed.

In a previous tutorial [How to deploy n8n in Kubernetes - k3s](/en/blog/how-to-deploy-n8n-in-kubernetes-k3s/) I deployed n8n. 

I checked that all is running correctly.

```bash
kubectl get all -n n8n
NAME                                  READY   STATUS    RESTARTS   AGE
pod/postgres-statefulset-0            1/1     Running   0          23h
pod/n8n-deployment-6dfd7cc794-pgccd   1/1     Running   0          23h

NAME                       TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
service/postgres-service   ClusterIP   None           <none>        5432/TCP       23h
service/n8n-service        NodePort    10.43.216.21   <none>        80:32469/TCP   23h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/n8n-deployment   1/1     1            1           23h

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/n8n-deployment-6dfd7cc794   1         1         1       23h

NAME                                    READY   AGE
statefulset.apps/postgres-statefulset   1/1     23h
```

One person (she or he) left a comment under my short video {{<youtube FW8TP5UDq4g>}}

> I have deployed my k8s cluster on baremetal & i have deployed nginx ingress controller inside the cluster the issue i am facing i.e the domain that i have pointed the master node, when i curl the domain i get desired result but on the browser i got 404 do you have any idea how can i fix this issue
>
> <cite>@user-ph7sl6mn5q  </cite>

I decided to explain how the NGINX ingress controller works using the example of deployment for the n8n application and what is more important recreate the NGINX ingress controller 404 error. 

I presented that except the ingress controller there is an additional service needed. You can ask: - Why I need a second service to make it work?

Below you have all the files needed for nginx ingress controller for n8n located in ingress directory that you can download using a repository: [n8n-k3s](https://github.com/sysadmin-info/n8n-k3s.git)

```bash
cat ingress-n8n-class.yml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: k8s.io/ingress-nginx
```

```bash
cat n8n-ingress.yml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-ingress
  namespace: n8n
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-service
            port:
              number: 80
```

```bash
cat nginx-ingress-n8n-service.yml
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-ingress-n8n
  namespace: ingress-nginx
spec:
  type: NodePort
  ports:
    - port: 80
      nodePort: 5678
      protocol: TCP
      name: http
  selector:
    app.kubernetes.io/name: ingress-nginx
```

Because I am deploying n8n along with an NGINX Ingress Controller, the confusion seems to be around the necessity of having two different services: n8n-service and nginx-ingress-n8n-service. Let's clarify their roles and why both are needed.

1. **n8n-service (NodePort Service)**: This service is responsible for exposing the n8n application pods inside the Kubernetes cluster. It acts as an internal load balancer that directs traffic to your n8n pod(s). Since it's a NodePort service, it also makes the application accessible from outside the cluster, but through a specific port on the nodes.

2. **nginx-ingress-n8n-service (NodePort Service for Ingress)**: This service is associated with the NGINX Ingress Controller. Its primary role is to expose the Ingress Controller itself to the outside world. This is different from `n8n-service` because it's not exposing your application directly. Instead, it's exposing the Ingress Controller, which then manages and routes external traffic to your internal services (like `n8n-service`) based on the Ingress rules you define.

Here's why both are needed:

- The `n8n-service` makes your n8n application accessible within the Kubernetes cluster and potentially directly from outside the cluster (though the latter is not typically recommended for production environments).
  
- The `nginx-ingress-n8n-service` exposes the NGINX Ingress Controller. When external traffic hits this service, it's the Ingress Controller that decides where to route this traffic based on your Ingress rules (`n8n-ingress.yml`). In this case, it routes traffic to `n8n-service`.

In summary, the `n8n-service` is for internal load balancing and potential direct external access to n8n, while `nginx-ingress-n8n-service` is for external access to the Ingress Controller, which then intelligently routes traffic to internal services like `n8n-service`. This separation allows more sophisticated routing rules, better security, and easier management of ingress traffic in a Kubernetes environment.

{{< notice success "Important information" >}}
NGINX ingress controller for a specific service needs to be created in the same namespace where the service is running.
{{< /notice >}}

But this is not everything you need to know to understand how it works.

The below entry shows iptables rule:

```bash
sudo iptables -t nat -L PREROUTING --line-numbers -n -v
Chain PREROUTING (policy ACCEPT 326 packets, 43216 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1    17677 2468K KUBE-SERVICES  all  --  *      *       0.0.0.0/0            0.0.0.0/0            /* kubernetes service portals */
```

Also you need to modify the k3s service to change port range the way I presented. Without this it will not work, just because I am using a NodePort 5678 and by default Kubernetes is using a range for ports between 30000 and 32767.

So edit the k3s.service file

```bash
sudo vim /etc/systemd/system/k3s.service
```

and add the entry the way you can see on the video.

```vim
'--service-node-port-range=5678-32767'
```

Then reload the daemon and restart k3s service.

```bash
sudo systemctl daemon-reload
sudo systemctl restart k3s.service
```

{{< notice success "Important information" >}}
Restarting a Kubernetes service ( in this case K3S) does not change the NodePort for services whose deployment occurred earlier and was working, because once assigned randomly by Kubernetes the NodePort only changes when the service is removed.
{{< /notice >}}

Additionally IngressClass has been added through ingress-class.yml and is also specified in n8n-ingresss.yml file.

Let's break down the components and their roles in managing the network traffic for my Kubernetes setup, focusing on iptables, the Ingress Controller, and the service node port range.

1. **Iptables Entry for Kubernetes Services**: The iptables entry you've shown (`KUBE-SERVICES`) is part of the mechanism Kubernetes uses to manage network traffic to services. This rule is auto-generated by Kubernetes and is responsible for directing traffic to the correct services within the cluster based on their type and configuration.

2. **Service Node Port Range (`--service-node-port-range=5678-32767`)**: This modification to the `k3s.service` configuration expands the range of ports that can be used for NodePort services. By default, Kubernetes NodePort services are allocated ports from the 30000-32767 range. Your modification allows services to use ports starting from 5678, which includes the specific port you've configured for your NGINX Ingress Service (`nginx-ingress-n8n-service`).

3. **Ingress and IngressClass**: Your `n8n-ingress.yml` and `ingress-n8n-class.yml` files define an Ingress resource and an IngressClass, respectively. The IngressClass (`nginx`) tells Kubernetes which Ingress Controller should handle the Ingress resources. The Ingress (`n8n-ingress`) defines how the traffic should be routed to your services (like `n8n-service`).

4. **Traffic Flow**:
    - External traffic reaches the Kubernetes node on a specific port (defined by your NodePort service, `nginx-ingress-n8n-service`).
    - The iptables rule (`KUBE-SERVICES`) then directs this traffic to the NGINX Ingress Controller, based on the NodePort mapping.
    - The NGINX Ingress Controller, based on the Ingress rules (`n8n-ingress`), routes the traffic to the appropriate service inside the cluster (in your case, `n8n-service`).

The iptables rule is indeed sufficient to ensure that the traffic reaching the Kubernetes node on the specified NodePort is correctly redirected to the NGINX Ingress Controller. From there, the Ingress Controller takes over to route the traffic according to the Ingress rules you have defined. This setup provides a flexible and efficient way to manage traffic routing in your Kubernetes environment.

##### How to deploy it?

```bash
git clone https://github.com/sysadmin-info/n8n-k3s.git
cd n8n-k3s/ingress
kubectl apply -f ingress-n8n-class.yml -f n8n-ingress.yml -f nginx-ingress-n8n-service.yml
```

##### How to use a domain instead of IP address?

{{< notice success "Attention!">}}
In the video, I show Adguard Home, which acts as a DNS on port 53, and NGINX Proxy Manager to demonstrate how to assign a specific domain to a specific IP address (Adguard Home) and NodePort (NGINX Proxy Manage).
{{< /notice >}}

To use a domain name instead of an IP address for accessing your Kubernetes services (like n8n in your case), you typically follow these steps:

1. **Register a Domain Name**: If you don't already have one, you'll need to register a domain name with a domain registrar. Choose a name that suits your service or organization.

2. **Set Up DNS Records**: After obtaining a domain name, you need to configure its DNS settings. This involves creating DNS records that point to the IP address of your Kubernetes cluster (or specific node if you're using NodePort services).

   - **A Record**: Create an A record in your DNS configuration that points your domain (e.g., `example.com`) to the external IP address of your Kubernetes cluster. If your cluster is on a cloud platform, this would be the external IP of your Load Balancer. If it's on-premises or in a local setup, this would be the external IP of your node.
   - **CNAME Record (Optional)**: If you want to use a subdomain (like `n8n.example.com`), you can create a CNAME record that points to your main domain.

3. **Configure Ingress to Use the Domain**: In your Kubernetes Ingress resource (`n8n-ingress.yml`), you need to specify the host field to use your domain name. Here's an example modification:

   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: n8n-ingress
     namespace: n8n
     annotations:
       nginx.ingress.kubernetes.io/rewrite-target: /
   spec:
     ingressClassName: nginx
     rules:
     - host: n8n.example.com
       http:
         paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: n8n-service
               port:
                 number: 80
   ```

   In this example, replace `n8n.example.com` with your actual domain name.

4. **Reload or Reapply the Ingress**: After modifying the Ingress resource, apply the changes with `kubectl apply -f n8n-ingress.yml`. The NGINX Ingress Controller should pick up these changes and start routing traffic based on the domain name.

5. **Test the Domain Name**: Once everything is set up, you can test accessing your service using the domain name (e.g., `http://n8n.example.com`). It should route to your n8n service just like the IP and port method did previously.

Remember, DNS changes can take some time to propagate throughout the internet, so it might not work immediately. Also, ensure that your Kubernetes cluster's network configuration allows inbound traffic on the relevant ports (like 80 or 443 for HTTP/HTTPS).

##### How I reproduced the 404 error for NGINX ingress controller?

I made a mistake on purpose in n8n-ingress.yml file to show that it has a syntax issue in the rules section. This could be the reason why your Ingress is not routing traffic correctly to your n8n-service. The host and http keys should be part of the same rule, but they are currently separated, which makes the Ingress configuration invalid.

Below there is a yaml file with an error:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-ingress
  namespace: n8n
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: n8n.example.com
    - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-service
            port:
              number: 80

```

And here you have a file that is correct. The difference is simple. I removed symbol - for http:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-ingress
  namespace: n8n
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: n8n.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-service
            port:
              number: 80
```

In this corrected version, the `host` key is now correctly associated with the `http` key under the same rule. This change should allow the Ingress to correctly route traffic for `n8n.sysadmin.homes` to the `n8n-service` on port 80.

After making this change, apply the configuration using:

```bash
kubectl apply -f n8n-ingress.yml
```

Then, test accessing `n8n.sysadmin.homes` again. This should resolve the 404 Not Found issue, assuming all other parts of your setup (like DNS and service configuration) are correct.