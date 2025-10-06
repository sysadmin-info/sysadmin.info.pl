---
title: Błąd CrashLoopbackOff w Kubernetes na Raspberry Pi CM4
date: 2023-09-01T13:00:00+00:00
description: Błąd CrashLoopbackOff w Kubernetes na Raspberry Pi CM4
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
1. **Oto samouczek wideo; czytaj dalej dla listy pisemnych instrukcji.**
{{<youtube 1OKCSXaYUnc>}}
#### Ćwiczenia do wykonania:
1. Utwórz pody z obrazami Alpine i Ubuntu.
2. Użyj polecenia watch, aby na bieżąco obserwować zmiany.
3. Sprawdź architekturę maszyny, na której działa Kubernetes.
4. Użyj obrazu multiarch.
5. Wejdź do kontenera.
6. Utwórz pod z obrazem Ubuntu przez plik yaml z komendą sleep.
7. Zastosuj plik YAML.
8. Obserwuj zmiany.
9. Ustaw politykę Kubernetes.
##### Utwórz pody z obrazami Alpine i Ubuntu
```bash
kubectl run alpine --image=alpine
kubectl run ubuntu --image=ubuntu

```
##### Użyj polecenia watch, aby na bieżąco obserwować zmiany.
```bash
watch kubetcl get pods
```
##### Sprawdź architekturę maszyny, na której działa Kubernetes
```bash
uname -a
uname -m
```
##### Użyj obrazu multiarch
```bash
kubectl run multiarch --image=nginx:alpine
```
##### Wejdź do kontenera
```bash
kubectl exec --help
kubectl exec -it multiarch -- /bin/ash
```
lub
```bash
kubectl exec -it multiarch -- /bin/ash
```
##### Utwórz pod z obrazem Ubuntu przez plik yaml z komendą sleep
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
#### Zastosuj plik YAML.
```bash
kubectl apply -f pod.yaml
```
##### Użyj polecenia watch, aby na bieżąco obserwować zmiany.
```bash
watch kubetcl get pods
```
Zauważysz, że pod z kontenerem restartuje się. To nie jest rozwiązanie.
##### Ustaw politykę Kubernetes
```bash
kubectl run ubuntu-no-restart --image=ubuntu --restart=Never
kubectl run ubuntu-on-failure --image=ubuntu --restart=OnFailure
```
Domyślnie polityka Kubernetes zawsze restartuje pod.
##### Użyj polecenia watch, aby na bieżąco obserwować zmiany.
```bash
watch kubetcl get pods
```
Pody mają status zakończony, ale w podach nie ma działających kontenerów.