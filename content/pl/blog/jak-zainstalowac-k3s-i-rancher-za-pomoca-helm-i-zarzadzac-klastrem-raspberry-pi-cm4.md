---
title: "Jak zainstalować K3S i Rancher za pomocą Helm i zarządzać klastrem Raspberry Pi CM4"
date: 2023-09-28T13:00:00+00:00
description: "Jak zainstalować K3S i Rancher za pomocą Helm i zarządzać klastrem Raspberry Pi CM4"
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
- Rancher
- Helm
series:
- Kubernetes 
categories:
- Raspberry Pi
image: images/2023-thumbs/k3s-helm-rancher.webp
---
W tym artykule omówię kroki instalacji i konfiguracji k3s oraz Rancher.

1. **Oto film instruktażowy; kontynuuj czytanie, aby uzyskać listę instrukcji pisemnych.**

{{<youtube xz2hYVPj-Fw>}}

#### Zadania do wykonania:
1. Odinstaluj k3s na węźle głównym i węzłach roboczych.
2. Odinstaluj Rancher.
3. Dodaj wpisy cgroup do cmdline.txt i zrestartuj każdy węzeł z procesorem ARM.
4. Zainstaluj k3s w wersji v1.26.9+k3s1 bez traefika na węźle głównym.
5. Sprawdź stan k3s.
6. Dodaj automatyczne uzupełnianie dla k3s.
7. Dodaj konfigurację k3s do środowiska.
8. Zainstaluj nginx jako kontroler Ingress w k3s.
9. Zainstaluj balansujący obciążenie kontrolera Ingress NGINX.
10. Przeprowadź sprawdzanie klastra.
11. Zainstaluj Git i Helm.
12. Dodaj automatyczne uzupełnianie dla Helm.
13. Dodaj repozytorium Rancher.
14. Zaktualizuj repozytorium za pomocą Helma.
15. Wygeneruj certyfikat.
16. Utwórz przestrzeń nazw cattle-system.
17. Utwórz sekret o nazwie tls-rancher-ingress.
18. Utwórz plik values.yaml.
19. Wyeksportuj konfigurację k3s.
20. Poczekaj 30 sekund na kontroler Ingress NGINX.
21. Zainstaluj Rancher za pomocą Helma.
22. Poczekaj 120 sekund na Rancher.
23. Wyświetl wszystkie pojemniki i sprawdź stan pojemników Ranchera.
24. Wyświetl adres URL pulpitu Rancher.
25. Skopiuj URL i wklej go do paska adresu przeglądarki internetowej.
26. Następnie zaloguj się do Ranchera używając początkowego hasła test123 oraz loginu: admin.
27. Skopiuj token.
28. Skopiuj adres IP węzła głównego.
29. Zainstaluj najnowsze k3s na węzłach roboczych.
30. Dodaj etykiety do węzłów roboczych na węźle głównym.
31. Sprawdź stan węzłów i pojemników.
32. Sprawdź konfigurację na węźle głównym.
33. Sprawdź usługi k3s.

#### Dezinstalacja k3s na węźle głównym i węzłach roboczych

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

* Skrypt Bash dla Ranchera:

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
    /usr

/local/bin/rancherd-killall.sh
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

#### Dodaj wpisy cgroup do pliku cmdline.txt na każdym węźle działającym na procesorze ARM.

```bash
sudo vim /boot/cmdline.txt
```

* Dodaj na końcu linii rozpoczynającej się od console= następujące wpisy:

```bash 
cgroup_memory=1 cgroup_enable=memory
```

* Zapisz plik i wyjdź.

#### Ponownie uruchom serwer

```bash
sudo reboot
```

#### Zainstaluj k3s w wersji 1.26.9+k3s1 bezpiecznie, bez traefik na węźle głównym

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.26.9+k3s1" INSTALL_K3S_EXEC="--disable traefik" K3S_KUBECONFIG_MODE="644" sh -s -
```

#### Sprawdź status k3s

```bash
systemctl status k3s
systemctl is-enabled k3s
```

#### Dodaj autouzupełnianie na stałe do swojego powłoki bash.

```bash
echo "source <(kubectl completion bash)" >> ~/.bashrc
source ~/.bashrc
```

#### Dodaj konfigurację k3s do środowiska

Edytuj plik
```bash
sudo vim /etc/environment
```

Dodaj poniższy wpis:
```vim
KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

```bash
source /etc/environment
```

{{< notice success "Wyjaśnienie:" >}}
source to polecenie wbudowane powłoki Bash, które wykonuje zawartość pliku przekazanego jako argument w bieżącej powłoce. Ma synonim w postaci . (kropki).
{{< /notice >}}

#### Co to jest kontroler NGINX Ingress?

Zobacz dokumentację: [Kontroler NGINX Ingress](https://docs.nginx.com/nginx-ingress-controller/intro/how-nginx-ingress-controller-works/)

#### Zainstaluj NGINX jako kontroler Ingress w k3s

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/baremetal/deploy.yaml
```

Zobacz dokumentację: [Instrukcja instalacji kontrolera Ingress NGINX](https://kubernetes.github.io/ingress-nginx/deploy/?ref=blog.thenets.org#bare-metal-clusters)

#### Zainstaluj kontroler Ingress NGINX Load Balancer

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

#### Przeprowadź sprawdzanie klastra

```bash
kubectl cluster-info
kubectl get nodes
kubectl describe nodes rancher
kubectl get pods -A
kubectl get svc --all-namespaces -o wide
```

#### Zainstaluj git i Helm

```bash
sudo apt install git
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

#### Dodaj autouzupełnianie na stałe do swojego powłoki bash.

```bash
echo "source <(helm completion bash)" >> ~/.bashrc
source ~/.bashrc
```

#### Dodaj repozytorium Rancher

```bash
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
```

#### Zaktualizuj repozytorium za pomocą Helm

```bash
helm repo update
```

#### Wygeneruj certyfikat

```bash
openssl genrsa -out rancher.key 2048
openssl req -new -key rancher.key -out rancher.csr
openssl x509 -req -days 365 -in rancher.csr -signkey rancher.key -out rancher.crt
```

#### Utwórz przestrzeń nazw cattle-system

```bash
kubectl create namespace cattle-system
```

#### Utwórz tajemnicę o nazwie tls-rancher-ingress

```bash
kubectl -n cattle-system create secret tls tls-rancher-ingress \
  --cert=/home/adrian/rancher.crt \
  --key=/home/adrian/rancher.key
```

#### Utwórz plik values.yaml

```bash
cat > values.yaml <<EOF
# Dodatkowe zaufane CA.
# Włącz tę flagę i dodaj swoje certyfikaty CA jako tajemnicę o nazwie tls-ca-additional w przestrzeni nazw.
# Aby uzyskać szczegóły, patrz README.md.
additionalTrustedCAs: false
antiAffinity: preferred
topologyKey: kubernetes.io/hostname

# Dzienniki audytu https://rancher.com/docs/rancher/v2.x/en/installation/api-auditing/
# Dziennik audytu jest przekazywany do konsoli kontenera rancher-audit-log w podzie ranchera.
# https://rancher.com/docs/rancher/v2.x/en/installation/api-auditing/
# Cel przekazywania do kontenera uboczego lub do woluminu hosta
# level: Poziom szczegółowości dzienników, od 0 do 3. 0 oznacza wyłączony, 3 oznacza dużo.

auditLog:
  destination: sidecar
  hostPath: /var/log/rancher/audit/
  level: 0
  maxAge: 1
  maxBackup: 1
  maxSize: 100

  # Obraz do zbierania dzienników audytu ranchera.
  # Ważne: zaktualizuj pkg/image/export/resolve.go, gdy ten domyślny obraz zostanie zmieniony, aby odzwierciedlić to odpowiednio w pliku rancher-images.txt generowanym dla instalacji w trybie offline.

  image:
    repository: "rancher/mirrored-bci-micro"
    tag: 15.4.14.3
    # Przesłonić imagePullPolicy obrazu
    # opcje: Always, Never, IfNotPresent
    pullPolicy: "IfNotPresent"

# Od Ranchera w wersji 2.5.0 ta flaga jest przestarzała i musi być ustawiona na 'true', aby Rancher mógł wystartować
addLocal: "true"

# Dodaj flagę debug do serwera Rancher
debug: false

# Podczas pierwszego uruchomienia Ranchera zainicjuj admina jako restricted-admin
restrictedAdmin: false

# Dodatkowe zmienne środowiskowe przekazywane do podów ranchera.
# extraEnv:
# - name: CATTLE_TLS_MIN_VERSION
#   value: "1.0"

# W pełni kwalifikowana nazwa, aby dotrzeć do serwera Ranchera
hostname: rancher.local

## Opcjonalna tablica imagePullSecrets zawierająca dane uwierzytelniające do prywatnych rejestrów
## Odniesienie: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/
imagePullSecrets: []

# - name: secretName

### ingress ###

# Przeczytaj README w celu uzyskania szczegółów i instrukcji dotyczących dodawania tajemnic TLS.
ingress:
  # Jeśli ustawione na false, ingress nie zostanie utworzone
  # Domyślnie true
  # opcje: true, false
  enabled: true
  includeDefaultExtraAnnotations: true
  extraAnnotations: {}
  ingressClassName: "nginx"
  # Numer portu backendu
  servicePort: 80

  # configurationSnippet - Dodaj dodatkową konfigurację Nginx. Ten przykład statycznie ustawia nagłówek na ingress.
  # configurationSnippet: |
  #   more_set_input_headers "X-Forwarded-Host: {{ .Values.hostname }}";

  tls:
    # opcje: rancher, letsEncrypt, secret
    source: secret
    secretName: tls-rancher-ingress

### service ###
# Przesłonić typ usługi NodePort lub LoadBalancer - domyślnie ClusterIP

service:
  type: ""
  annotations: {}

### Konfiguracja LetsEncrypt ###
# Wskazówka: W środowisku produkcyjnym możesz zarejestrować nazwę tylko 5 razy w tygodniu.
#         Używaj wersji testowej, dopóki nie skonfigurujesz poprawnie swojej konfiguracji.

letsEncrypt:
  # email: none@example.com
  environment: production
  ingress:
    # opcje: traefik, nginx
    class: "nginx"

# Jeśli używasz certyfikatów podpisanych przez prywatnego CA, ustaw to na 'true' i ustaw 'tls-ca'
# w przestrzeni nazw 'rancher-system'. Patrz README.md na temat szczegółów.
privateCA: false

# Serwer proxy http[s] przekazywany do serwera Rancher.
# proxy: http://example.local:1080

# Rozdzielone przecinkami listy domen lub adresów IP, które nie będą korzystać z proxy
noProxy: 127.0.0.0/8,10.42.0.0/16,10.43.0.0/16,192.168.0.1/24,10.10.0.0/24,rancher.local

# Przesłonić lokalizację obrazu Ranchera dla instalacji w trybie offline
rancherImage: rancher/rancher

# Tag obrazu rancher/rancher. https://hub.docker.com/r/rancher/rancher/tags/
# Domyślnie .Chart.appVersion
# rancherImageTag: v2.0.7

# Przesłonić imagePullPolicy dla obrazów serwera Rancher
# opcje: Always, Never, IfNotPresent
# Domyślnie IfNotPresent
# rancherImagePullPolicy: <pullPolicy>

# Liczba replik serwera Rancher. Ustawienie na liczbę ujemną spowoduje dynamiczne dostosowanie między 0 a abs(replicas) na podstawie dostępnych węzłów.
# dostępnych w klastrze
replicas: 3

# Ustawienie priorityClassName, aby uniknąć wydalenia
priorityClassName: rancher-critical

# Ustawienia zasobów podów Rancher.
resources: {}

#
# tls
#   Gdzie przekierować szyfrowanie TLS/SSL
# - ingress (domyślnie)
# - external
tls

: ingress

systemDefaultRegistry: ""

# Ustaw, aby używać zestawionych systemowych wykresów
useBundledSystemChart: false

# Zgodność z wersją Certmanager
certmanager:
  version: ""

# Trwałość niestandardowych logotypów Ranchera
customLogos:
  enabled: false
  volumeSubpaths:
    emberUi: "ember"
    vueUi: "vue"

  ## Rodzaj woluminu do używania do trwałości: persistentVolumeClaim, configMap
  volumeKind: persistentVolumeClaim
  ## Użyj istniejącego woluminu. Niestandardowe logotypy powinny być skopiowane do woluminu przez użytkownika
  # volumeName: custom-logos
  ## Tylko dla volumeKind: persistentVolumeClaim
  ## Aby wyłączyć dynamiczne przydzielanie, ustaw storageClass: "" lub storageClass: "-"
  # storageClass: "-"
  accessMode: ReadWriteOnce
  size: 1Gi

# Hook po usunięciu Ranchera
postDelete:
  enabled: true
  image:
    repository: rancher/shell
    tag: v0.1.20

  namespaceList:
    - cattle-fleet-system
    - cattle-system
    - rancher-operator-system

  # Liczba sekund oczekiwania na odinstalowanie aplikacji
  timeout: 120

  # domyślnie zadanie zakończy się niepowodzeniem, jeśli nie uda się odinstalować żadnej z aplikacji
  ignoreTimeoutError: false

# Ustaw hasło rozruchowe. Jeśli pozostawisz puste, zostanie wygenerowane losowe hasło.
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
      # domyślnie true w wersji 1.24 i niższej, a false w wersji 1.25 i wyższej
      # można ręcznie zmienić na true lub false, aby ominąć sprawdzanie wersji i wymusić tę opcję
      enabled: ""
EOF
```

#### Eksportuj konfigurację k3s

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

{{< notice success "Wyjaśnienie:" >}}
Eksport to wbudowane polecenie powłoki Bash. Służy do oznaczania zmiennych i funkcji, które mają być przekazywane do procesów potomnych. W skrócie, zmienna zostanie uwzględniona w środowisku procesów potomnych, nie wpływając na inne środowiska.
{{< /notice >}}

#### Poczekaj 30 sekund na kontroler NGINX Ingress.

#### Zainstaluj Rancher za pomocą Helm.

```bash
helm install rancher rancher-stable/rancher --namespace cattle-system -f values.yaml
```

#### Poczekaj 120 sekund na Rancher.

#### Wyświetl wszystkie pody i sprawdź status podów Ranchera.

```bash
kubectl get pods -A
```

#### Wyświetl adres URL pulpitu Ranchera.

```bash
echo https://rancher.local/dashboard/?setup=$(kubectl get secret --namespace cattle-system bootstrap-secret -o go-template='{{.data.bootstrapPassword|base64decode}}')
```

#### Skopiuj URL i wklej go do paska adresu przeglądarki internetowej. Następnie zaloguj się do Ranchera, używając początkowego hasła test123 i loginu: admin.

### Instalacja na węzłach roboczych

#### Skopiuj token

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

#### Skopiuj adres IP węzła głównego

```bash
hostname -I | awk '{ print $1 }'
```

#### Zainstaluj najnowszy k3s na węzłach roboczych

```bash
curl -sfL https://get.k3s.io | K3S_TOKEN="<TWÓJ_TOKEN>" K3S_URL="https://<ADRES_WĘZŁA_GŁÓWNEGO>:6443" K3S_NODE_NAME="worker1" sh -
curl -sfL https://get.k3s.io | K3S_TOKEN="<TWÓJ_TOKEN>" K3S_URL="https://<ADRES_WĘZŁA_GŁÓWNEGO>:6443" K3S_NODE_NAME="worker2" sh -
curl -sfL https://get.k3s.io | K3S_TOKEN="<TWÓJ_TOKEN>" K3S_URL="https://<ADRES_WĘZŁA_GŁÓWNEGO>:6443" K3S_NODE_NAME="worker3" sh -
```

#### Dodaj etykiety do węzłów roboczych na węźle głównym

```bash
kubectl label nodes worker1 kubernetes.io/role=worker
kubectl label nodes worker2 kubernetes.io/role=worker
kubectl label nodes worker3 kubernetes.io/role=worker
```

#### Sprawdź status węzłów

```bash
kubectl get nodes
```

#### Sprawdź pody

```bash
kubectl get pods -A
```

#### Sprawdź konfigurację na węźle głównym.

```bash
kubectl cluster-info
kubectl get nodes
kubectl get pods -A
kubectl config get-contexts
kubectl get all --all-namespaces
```

#### Sprawdź usługi k3s

```bash
kubectl get svc --all-namespaces -o wide
```