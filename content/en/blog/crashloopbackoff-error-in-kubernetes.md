---
title: CrashLoopbackOff error in Kubernetes in Raspberry Pi CM4
date: 2023-09-01T13:00:00+00:00
description: CrashLoopbackOff error in Kubernetes in Raspberry Pi CM4
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
    image: images/2023-thumbs/crashloopbackoff-error.webp
---
1. **Here is a video tutorial; continue reading for a list of written instructions.**
{{<youtube 1OKCSXaYUnc>}}
#### Exercises to complete:
1. Create pods with Alpine and Ubuntu images.
2. Use the watch command to watch the changes live.
3. Check the architecture of machine Kubernetes runs on.
4. Use multiarch image.
5. Get into the container.
6. Create a pod with Ubuntu image through yaml file with sleep command.
7. Apply the YAML file.
8. Observe changes.
9. Set the Kubernetes policy.
##### Create pods with Alpine and Ubuntu images
```bash
kubectl run alpine --image=alpine
kubectl run ubuntu --image=ubuntu

```
##### Use the watch command to watch the changes live.
```bash
watch kubetcl get pods
```
##### Check the architecture of machine Kubernetes runs on
```bash
uname -a
uname -m
```
##### Use multiarch image
```bash
kubectl run multiarch --image=nginx:alpine
```
##### Get into the container
```bash
kubectl exec --help
kubectl exec -it multiarch -- /bin/ash
```
or
```bash
kubectl exec -it multiarch -- /bin/ash
```
##### Create a pod with Ubuntu image through yaml file with sleep command
```bash
vim pod.yaml
```
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ubuntu-sleep
  namespace: default
spec:
  containers:
    - name: ubuntu
      image: ubuntu
      command:
        - sleep
        - "60"
      resources:
        limits:
          memory: "600Mi"
        requests:
          memory: "100Mi"
```
#### Apply the YAML file.
```bash
kubectl apply -f pod.yaml
```
##### Use the watch command to watch the changes live.
```bash
watch kubetcl get pods
```
You will observe that pod with container are restarting. This is not a solution.
##### Set the Kubernetes policy
```bash
kubectl run ubuntu-no-restart --image=ubuntu --restart=Never
kubectl run ubuntu-on-failure --image=ubuntu --restart=OnFailure
```
By default Kubernetes policy restarts always the pod.
##### Use the watch command to watch the changes live.
```bash
watch kubetcl get pods
```
Pods have status completed, but there are no running containers inside pods.