---
title: "Jak zainstalować nginx jako kontroler dostępu dla k3s"
date: 2023-08-20T18:00:00+00:00
description: "Jak zainstalować nginx jako kontroler dostępu dla k3s w Raspberry Pi CM4"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- CM4
- płyta CM4
- moduł obliczeniowy CM4
- Kubernetes
- k3s 
series:
- Kubernetes 
categories:
- Raspberry Pi
image: images/2023-thumbs/k3s-nginx-ingress.webp
---
W tym artykule przeprowadzę Cię przez kroki instalacji i konfiguracji kontrolera dostępu nginx.

1. **Oto samouczek wideo; kontynuuj czytanie, aby zobaczyć listę pisemnych instrukcji.**

{{<youtube wloUT1WPFVc>}}

#### Ćwiczenia do wykonania:
1. zainstaluj k3s bezpiecznie bez traefik i servicelb
2. zainstaluj nginx jako kontroler dostępu w k3s
3. Sprawdź status węzłów i podów
4. Utwórz load balancer, aby udostępnić porty nginx ingress controller
5. Utwórz przestrzeń nazw test
6. Utwórz przykład do testowania
7. Przetestuj konfigurację
8. Skopiuj plik konfiguracyjny k3s
9. Zmień właściciela na użytkownika dla pliku konfiguracyjnego k3s
10. Zainstaluj k9s
11. Uruchom k9s
12. Wyjaśnienie użycia k9s
13. Sprawdź usługi k3s
14. Sprawdź przykładową aplikację testową

#### Zainstaluj k3s bezpiecznie bez traefik i servicelb

```bash
sudo curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik,servicelb" K3S_KUBECONFIG_MODE="644" sh -
```

#### Dodaj wpisy cgroup do pliku cmdline.txt

```bash
sudo vim /boot/cmdline.txt
```

* Dodaj na końcu linii rozpoczynającej się od console= poniższe wpisy:

```bash 
cgroup_memory=1 cgroup_enable=memory
```

* Zapisz plik i wyjdź.

#### Uruchom ponownie serwer

```bash
sudo reboot
```

#### Co to jest kontroler dostępu nginx?

Zobacz dokumentację: [Kontroler dostępu nginx](https://docs.nginx.com/nginx-ingress-controller/intro/how-nginx-ingress-controller-works/)

#### Zainstaluj nginx jako kontroler dostępu w k3s

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/baremetal/deploy.yaml
```

Zobacz dokumentację: [Przewodnik instalacji kontrolera dostępu nginx](https://kubernetes.github.io/ingress-nginx/deploy/?ref=blog.thenets.org#bare-metal-clusters)

#### Sprawdź status węzłów

```bash
kubectl get nodes
```

#### Sprawdź pody

```bash
kubectl get pods -A
```

#### Utwórz równoważnik obciążenia, aby udostępnić porty kontrolera dostępu nginx

```bash
vim ingress-controller-load-balancer.yaml
```

* Wprowadź poniższą zawartość do pliku

```bash
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

* Zapisz i wyjdź

#### Utwórz nginx ingresss controller load balancer

```bash
kubectl apply -f ingress-controller-load-balancer.yaml
```

#### Utwórz przestrzeń nazw test

```bash
kubectl  create namespace test
```

#### Utwórz przykład do testowania

Poniższy przykład wykorzystuje kontroler dostępu nginx do ustanowienia wdrożenia i jego ujawnienia. Ponieważ domyślnie będzie używany SSL i wywoła to błąd dla nieistniejącego certyfikatu, ważne jest, aby zwrócić uwagę na adnotację nginx.ingress.kubernetes.io/ssl-redirect: "false".

Kolejnym ważnym czynnikiem jest używana nazwa domeny. Zamierzam użyć nazwy domeny test.localhost, ale oczywiście powinieneś ją zmienić na własną i skierować do węzła twojej instancji k3s.

Utwórz plik o nazwie my-example.yaml i użyj poniższej składni, aby zaimplementować ten przykład do testowania Ingress:

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

#### Zastosuj przykład do testowania

```bash
kubectl apply -f my-example.yaml --namespace test
```

#### Przetestuj konfigurację

```bash
kubectl cluster-info
kubectl get nodes
kubectl get pods -A
kubectl config get-contexts
kubectl get all --all-namespaces
```

#### Skopiuj plik konfiguracyjny k3s

```bash
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
```

Zmień właściciela na użytkownika dla pliku konfiguracyjnego k3s

```bash
sudo chown -R $USER:$USER /home/$USER
```

#### Zainstaluj k9s 

Aby komunikować się z twoimi klastrami Kubernetes, K9s oferuje interfejs użytkownika terminalu. Celem tego projektu jest ułatwienie użytkowania, monitorowania i administrowania twoimi aplikacjami w terenie. K9s ciągle skanuje Kubernetes w poszukiwaniu zmian i oferuje dodatkowe polecenia do interakcji z wybranymi zasobami.

```bash
curl -sS https://webinstall.dev/k9s | bash
```
#### Uruchom k9s

```bash
k9s
```

Zakończ, naciskając ctrl+c

#### Użycie k9s

```bash
k9s info
k9s help
k9s -A
```

#### Sprawdź usługi k3s

```bash
kubectl get svc --all-namespaces -o wide 
```

#### Sprawdź przykładową aplikację testową

```bash
curl http://10.43.13.55
```