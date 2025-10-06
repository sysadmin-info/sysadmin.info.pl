---
title: 'Kubernetes pod with hostNetwork: true cannot reach external IPs of services
  in the same cluster'
date: 2023-09-30T16:15:00+00:00
description: 'Kubernetes pod with hostNetwork: true cannot reach external IPs of services
  in the same cluster'
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
    image: images/2023-thumbs/hostnetworktrue.webp
---
### Kubernetes pod with hostNetwork: true cannot reach external IPs of services in the same cluster

An effective tool for managing and growing applications is Kubernetes, the de facto industry standard for container orchestration. However, it occasionally poses difficult problems. When a Kubernetes Pod with hostNetwork: true is unable to contact the external IPs of services within the same cluster, this is one example of a problem. We'll go through this issue in depth and offer a solution in this blog post.


#### Recognizing the Issue

Let's first analyze the issue before moving on to the solution. The Kubernetes Pod uses the host's network namespace rather than its own when hostNetwork: true is defined in the Pod specification. This may result in the Pod being unable to access services that are located within the same cluster through their external IP addresses.

Due to the potential for disrupting communication between various services in your cluster, this issue can be very difficult and result in application failures. When using Kubernetes, data scientists and DevOps experts frequently run into this problem.

#### What Causes This to Occur?

The networking architecture of Kubernetes is the main contributor to this problem. When hostNetwork: true is used, the Pod and the host share the network namespace. This indicates that it utilizes the host's IP address and port space.

The virtual IP (VIP) used to access Kubernetes services is often only usable within the cluster. The request is sent from the host's network namespace when a pod with hostNetwork: true tries to connect to a service using its external IP. The host fails because it is unable to resolve the service's VIP because it is not a part of the Kubernetes network.

### Utilizing DNS and iptables is the solution.

DNS and iptables, two essential Kubernetes networking tools, are used to solve this issue.

#### First: DNS

A built-in DNS service is available in Kubernetes for service discovery. A DNS name is automatically assigned when a service is created. This DNS name can be used by pods in the same cluster to contact the service.

We can benefit from this functionality in our situation. We can utilize the service's DNS name rather than the external IP address. In this manner, the service may still be accessed by our Pod even if it is using the host's network.

The following is an illustration of how to include the service's DNS name in your Pod specification:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  hostNetwork: true
  containers:
  - name: my-container
    image: my-image
    command: ['curl', 'my-service.cluster.local']
```

#### Second: Install iptables

Although using DNS can resolve our issue, it isn't always practical. You'll need a different solution, for instance, if your application needs to use the service's IP to communicate.

Iptables can help in this situation. Using different rules, iptables is a strong tool that lets you control network traffic. In our situation, iptables can be used to reroute traffic from our Pod to the service's VIP.

Here is an illustration of how to create an iptables rule:

```bash
iptables -t nat -A OUTPUT -d <external-ip> -j DNAT --to-destination <service-vip>
```

This rule instructs iptables to divert all traffic intended for the service's external IP to the VIP. In this manner, the service can still be accessed by your Pod even if it is utilizing the host's network.


#### Conclusion

Although Kubernetes is an effective tool for managing and growing applications, it occasionally presents challenging situations. One such problem is when a Kubernetes pod with hostNetwork: true is unable to contact services that are located in the same cluster's external IP address. We may overcome this difficulty by identifying the underlying cause of the problem and making advantage of Kubernetes' built-in capabilities. Keep in mind that Kubernetes is a complex system, and thus in order to properly troubleshoot problems, you must comprehend how it functions. Keep exploring and learning, and whenever you run into a problem, don't be afraid to go into the Kubernetes documentation in-depth.
