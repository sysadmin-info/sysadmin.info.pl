---
title: "Jak zainstalować rancher i K3S na Raspberry Pi CM4 i zarządzać klastrami"
date:  2023-09-08T16:00:00+00:00
description: "Jak zainstalować rancher i K3S na Raspberry Pi CM4 i zarządzać klastrami"
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
- CM4 board
- CM4 compute module
- Kubernetes
- k3s
- rancher
- helm
series:
- Kubernetes 
categories:
- Raspberry Pi
image: images/2023-thumbs/k3s-rancher.webp
---
W tym artykule przeprowadzę Cię przez kroki instalacji i konfiguracji k3s oraz rancher.

1. **Oto tutorial wideo; kontynuuj czytanie, aby uzyskać listę pisemnych instrukcji.**

{{<youtube RwMpXQMO-zE>}}

#### Ćwiczenia do wykonania:
1. Odinstaluj k3s na węźle głównym i węzłach roboczych
2. Odinstaluj rancher
3. Dodaj wpisy cgroup do cmdline.txt i zrestartuj każdy węzeł z procesorem ARM
4. Zainstaluj bezpiecznie k3s v1.21.1+k3s1 bez traefika
5. Sprawdź status k3s
6. Skopiuj token
7. Skopiuj adres IP węzła głównego
8. Zainstaluj k3s v1.21.1+k3s1 na węzłach roboczych
9. Dodaj etykiety do węzłów roboczych na węźle głównym
10. Włącz uzupełnianie k3s
11. Zainstaluj nginx jako kontroler dostępu w k3s
12. Sprawdź status węzłów i podów
13. Utwórz balanser obciążenia, aby udostępnić porty kontrolera dostępu NGINX
14. Utwórz przestrzeń nazw test
15. Utwórz przykład do testowania
16. Przetestuj konfigurację
17. Sprawdź przykładową aplikację testową
18. Zainstaluj i skonfiguruj Rancher

#### Odinstalowanie k3s na węźle głównym i węzłach roboczych

* Skrypt Bash dla węzła głównego:

```vim
#!/bin/bash

# Sprawdź, czy użytkownik jest rootem
if [ "$UID" -ne 0 ]; then
    echo "Nie jesteś użytkownikiem root."
    exit 1
fi

echo "Jesteś użytkownikiem root."

# Sprawdź, czy k3s-killall.sh istnieje w /usr/local/bin
if [ -f "/usr/local/bin/k3s-killall.sh" ]; then
    echo "Wykonuję k3s-killall.sh..."
    /usr/local/bin/k3s-killall.sh
else
    echo "k3s-killall.sh nie istnieje w /usr/local/bin."
fi

# Sprawdź, czy k3s-uninstall.sh istnieje w /usr/local/bin
if [ -f "/usr/local/bin/k3s-uninstall.sh" ]; then
    echo "Wykonuję k3s-uninstall.sh..."
    /usr/local/bin/k3s-uninstall.sh
else
    echo "k3s-uninstall.sh nie istnieje w /usr/local/bin."
fi

apt install iptables
iptables-save | awk '/^[*]/ { print $1 } /COMMIT/ { print $0; }' | sudo iptables-restore
iptables -S
iptables -F
update-alternatives --set iptables /usr/sbin/iptables-legacy
update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
reboot
```

* Skrypt Bash dla węzłów roboczych:

```vim
#!/bin/bash

# Sprawdź, czy użytkownik jest rootem
if [ "$UID

" -ne 0 ]; then
    echo "Nie jesteś użytkownikiem root."
    exit 1
fi

echo "Jesteś użytkownikiem root."

# Sprawdź, czy k3s-killall.sh istnieje w /usr/local/bin
if [ -f "/usr/local/bin/k3s-killall.sh" ]; then
    echo "Wykonuję k3s-killall.sh..."
    /usr/local/bin/k3s-killall.sh
else
    echo "k3s-killall.sh nie istnieje w /usr/local/bin."
fi

# Sprawdź, czy k3s-agent-uninstall.sh istnieje w /usr/local/bin
if [ -f "/usr/local/bin/k3s-agent-uninstall.sh" ]; then
    echo "Wykonuję k3s-agent-uninstall.sh..."
    /usr/local/bin/k3s-agent-uninstall.sh
else
    echo "k3s-agent-uninstall.sh nie istnieje w /usr/local/bin."
fi

apt install iptables
iptables-save | awk '/^[*]/ { print $1 } /COMMIT/ { print $0; }' | sudo iptables-restore
iptables -S
iptables -F
update-alternatives --set iptables /usr/sbin/iptables-legacy
update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
reboot
```

* Skrypt Bash dla rancher

```vim
#!/bin/bash

# Sprawdź, czy użytkownik jest rootem
if [ "$UID" -ne 0 ]; then
    echo "Nie jesteś użytkownikiem root."
    exit 1
fi

echo "Jesteś użytkownikiem root."

# Sprawdź, czy rancherd-killall.sh istnieje w /usr/local/bin
if [ -f "/usr/local/bin/rancherd-killall.sh" ]; then
    echo "Wykonuję rancherd-killall.sh..."
    /usr/local/bin/rancherd-killall.sh
else
    echo "rancherd-killall.sh nie istnieje w /usr/local/bin."
fi

# Sprawdź, czy rancherd-uninstall.sh istnieje w /usr/local/bin
if [ -f "/usr/local/bin/rancherd-uninstall.sh" ]; then
    echo "Wykonuję rancherd-uninstall.sh..."
    /usr/local/bin/rancherd-uninstall.sh
else
    echo "rancherd-uninstall.sh nie istnieje w /usr/local/bin."
fi

apt install iptables
iptables-save | awk '/^[*]/ { print $1 } /COMMIT/ { print $0; }' | sudo iptables-restore
iptables -S
iptables -F
update-alternatives --set iptables /usr/sbin/iptables-legacy
update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
reboot
```

#### Dodanie wpisów cgroup do pliku cmdline.txt na każdym węźle działającym na procesorze ARM.

```bash
sudo vim /boot/cmdline.txt
```

* Dodaj na końcu linii rozpoczynającej się od console= poniższe wpisy:

```bash 
cgroup_memory=1 cgroup_enable=memory
```

* Zapisz plik i wyjdź.

#### Restart serwera

```bash
sudo reboot
```

#### Bezpieczna instalacja k3s v1.21.1+k3s1 na węźle głównym bez traefik

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.21.1+k3s1" INSTALL_K3S_EXEC="--disable traefik" K3S_KUBECONFIG_MODE="644" sh -s -
```

#### Sprawdź status k3s

```bash
systemctl status k3s
systemctl is-enabled k3s
```

#### Skopiuj token

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

#### Skopiuj adres IP węzła głównego

```bash
hostname -I | awk '{ print $1 }'
```

#### Instalacja k3s v1.21.1+k3s1 na węzłach roboczych
```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.21.1+k3s1" K3S_TOKEN="<TWÓJ_TOKEN>" K3S_URL="https://<URL_WĘZŁA_GŁÓWNEGO>:6443" K3S_NODE_NAME="worker1" sh -
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.21.1+k3s1" K3S_TOKEN="<TWÓJ_TOKEN>" K3S_URL="https://<URL_WĘZŁA_GŁÓWNEGO>:6443" K3S_NODE_NAME="worker2" sh -
```

#### Dodawanie etykiet do węzłów roboczych na węźle głównym

```bash
kubectl label nodes worker1 kubernetes.io/role=worker
kubectl label nodes worker2 kubernetes.io/role=worker
```
#### Włączenie uzupełniania k3s

```bash
echo 'source <(kubectl completion bash)' >>~/.bashrc
source <(kubectl completion bash)
source .bashrc
```

#### Czym jest kontroler ingress NGINX?
roboczych
Zobacz dokumentację: [Kontroler dostępu NGINX](https://docs.nginx.com/nginx-ingress-controller/intro/how-nginx-ingress-controller-works/)

#### Zainstaluj NGINX jako kontroler ingress w k3s

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/baremetal/deploy.yaml
```

Zobacz dokumentację: [Przewodnik instalacji kontrolera dostępu NGINX](https://kubernetes.github.io/ingress-nginx/deploy/?ref=blog.thenets.org#bare-metal-clusters)


#### Sprawdzanie statusu węzłów

```bash
kubectl get nodes
```

#### Sprawdzanie podów

```bash
kubectl get pods -A
```

#### Utwórz load balancer, aby udostępnić porty kontrolera wejściowego NGINX

```bash
vim ingress-controller-load-balancer.yaml
```

* Wprowadź poniższą zawartość do pliku

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

* Zapisz i wyjdź

#### Uruchom plik yaml za pomocą kubectl

```bash
kubectl apply -f ingress-controller-load-balancer.yaml
```

#### Utwórz przestrzeń nazw test

```bash
kubectl create namespace test
```

#### Utwórz przykład do testowania

Poniższy przykład wykorzystuje kontroler dostępu NGINX do utworzenia wdrożenia (deployment) i jego udostępnienia. Ponieważ domyślnie będzie używany SSL i może wystąpić błąd z powodu braku certyfikatu, ważne jest zwrócenie uwagi na adnotację nginx.ingress.kubernetes.io/ssl-redirect: "false".

Kolejnym ważnym czynnikiem jest użyta nazwa domeny. Będę używać nazwy domeny test.localhost, ale oczywiście powinieneś ją zmienić na swoją i skierować do węzła Twojej instancji k3s.

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

#### Testowanie konfiguracji

```bash
kubectl cluster-info
kubectl get nodes
kubectl get pods -A
kubectl config get-contexts
kubectl get all --all-namespaces
```

#### Sprawdzanie usług k3s

```bash
kubectl get svc --all-namespaces -o wide 
```

#### Sprawdź przykładową aplikację testową

```bash
curl http://10.43.XX.XX
```
Jeśli nie zadziała, wykonaj poniższe polecenie, a następnie sprawdź ponownie aplikację

```bash
kubectl replace -f test.yaml --namespace test --force
```

#### Instalacja Rancher

* Przełącz na roota
```bash
sudo -i
```

* Utwórz katalog
```bash
mkdir -p /etc/rancher/rke2
```

* Utwórz plik config.yaml

```bash
vim /etc/rancher/rke2/config.yaml
```

* Dodaj poniższe wpisy do pliku config.yaml. Zmień adres IP - musi być taki sam, jak na maszynie, na której instalujesz Rancher.

```vim
token: Adw94lUaTgKfR93V0BZU
tls-san:
  - 10.XX.X.XXX
```

* Zapisz i wyjdź

#### Instalacja Rancher v. 2.5.8

```bash
curl -sfL https://get.rancher.io | INSTALL_RANCHERD_VERSION="v2.5.8" sh -
```

#### Włącz i uruchom usługę rancherd-server

```bash
systemctl enable rancherd-server.service
systemctl start rancherd-server.service
```

#### Sprawdzaj postępy z journalctl

```bash
journalctl -eu rancherd-server -f
```

Pamiętaj, aby czekać do końca. Zobacz wideo, aby zrozumieć wyjaśnienie. ctrl+c pozwoli Ci wyjść z okna journalctl.

#### Sprawdź wersję rancher

```bash
rancherd -v
```

#### Zresetuj hasło rancher dla admina

```bash
rancherd reset-admin
```

Jeśli nie zadziała, spróbuj ponownie uruchomić usługę rancherd-server.

```bash
systemctl restart rancherd-server.service
```

Poczekaj chwilę i uruchom ponownie:

```bash
rancherd reset-admin
```

Powinno pokazać coś takiego:

```bash
INFO[0000] Server URL: https://10.10.0.120:8443         
INFO[0000] Default admin and password created. Username: admin, Password: bk777mwr69wfgpwvbbk2d52f4mjsj4ssqxqnwstcpzvlc9wnlf59mk
```

Skopiuj URL i hasło.

Wklej URL do przeglądarki i zaloguj się jako admin z wygenerowanym hasłem.

Zmień hasło na to, którego chcesz używać. System poprosi o to. Pozostaw resztę bez zmian. Zaznacz, że zgadzasz się z warunkami użytkowania. 

#### Nadpisz obraz agenta dla węzłów/klasterów z procesorami ARM. Zobacz wideo

* W polu `agentimageoverride` API:

dodaj

```vim
rancher/rancher-agent:v2.5.8-linux-arm64
```