---
title: Jak zautomatyzować instalację K3S, Helm i Rancher za pomocą skryptu Bash
date: 2023-09-28T14:00:00+00:00
description: Jak zautomatyzować instalację K3S, Helm i Rancher za pomocą skryptu Bash
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
image: images/2023-thumbs/k3s-helm-rancher-bash.webp
---
W tym artykule przeprowadzę cię przez kroki instalacji i konfiguracji k3s oraz Ranchera.

1. **Oto film instruktażowy; kontynuuj czytanie, aby uzyskać listę instrukcji pisemnych.**

{{<youtube sHTfc3Whu-8>}}

Skrypty można znaleźć tutaj: [Skrypty Bash](https://github.com/sysadmin-info/rancher)

#### Zadania do wykonania:
1. Odinstaluj k3s na węźle głównym i węzłach roboczych
2. Dodaj wpisy cgroup do cmdline.txt i zrestartuj każdy węzeł z procesorem ARM
3. Zainstaluj k3s v1.26.9+k3s1 bez traefika, Helma i Ranchera na węźle głównym przy użyciu skryptu Bash
4. Wyświetl adres URL pulpitu Ranchera
5. Skopiuj adres URL i wklej go do paska adresu przeglądarki internetowej
6. Następnie zaloguj się do Ranchera, używając początkowego hasła "test1234" oraz nazwy użytkownika: "admin".
7. Skopiuj token
8. Skopiuj adres IP węzła głównego
9. Zainstaluj najnowszą wersję k3s na węzłach roboczych
10. Dodaj etykiety do węzłów roboczych na węźle głównym
11. Sprawdź status węzłów i kontenerów
12. Sprawdź konfigurację na węźle głównym
13. Sprawdź usługi k3s

#### Odinstalowanie k3s na węźle głównym i węzłach pracujących

* Skrypt Bash dla węzła głównego:

```vim
#!/bin/bash -e

# Funkcja do sprawdzania istnienia pliku i jego wykonania
execute_if_exists() {
    local file_path="$1"
    local description="$2"
    if [ -f "$file_path" ]; then
        echo "Wykonywanie ${description}..."
        sh "$file_path"
    else
        echo "${description} nie istnieje w ${file_path%/*}."
    fi
}

# Funkcja do konfiguracji iptables
configure_iptables() {
    iptables-save | awk '/^[*]/ { print $1 } /COMMIT/ { print $0; }' | sudo iptables-restore
    iptables -S
    iptables -F
    update-alternatives --set iptables /usr/sbin/iptables-legacy
    update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
}

# Sprawdzenie, czy użytkownik to root
if [ "$UID" -ne 0 ]; then
    echo "Nie jesteś użytkownikiem root."
    exit 1
fi

echo "Jesteś użytkownikiem root."

# Wykonania
execute_if_exists "/usr/local/bin/k3s-killall.sh" "k3s-killall.sh"
execute_if_exists "/usr/local/bin/k3s-uninstall.sh" "k3s-uninstall.sh"

# Sprawdzenie i usunięcie helm
if [ -f "/usr/local/bin/helm" ]; then
    echo "Usuwanie helm..."
    rm -f /usr/local/bin/helm
else
    echo "Helm nie istnieje w /usr/local/bin."
fi

# Konfiguracja iptables
configure_iptables
```

* Skrypt Bash dla węzłów roboczych:

```vim
#!/bin/bash -e

# Funkcja do sprawdzania istnienia pliku i jego wykonania
execute_if_exists() {
    local file_path="$1"
    local description="$2"
    if [ -f "$file_path" ]; then
        echo "Wykonywanie ${description}..."
        sh "$file_path"
    else
        echo "${description} nie istnieje w ${file_path%/*}."
    fi
}

# Funkcja do konfiguracji iptables
configure_iptables() {
    iptables-save | awk '/^[*]/ { print $1 } /COMMIT/ { print $0; }' | sudo iptables-restore
    iptables -S
    iptables -F
    update-alternatives --set iptables /usr/sbin/iptables-legacy
    update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
}

# Sprawdzenie, czy użytkownik to root
if [ "$UID" -ne 0 ]; then
    echo "Nie jesteś użytkownikiem root."
    exit 1
fi

echo "Jesteś użytkownikiem root."

# Wykonania
execute_if_exists "/usr/local/bin/k3s-killall.sh" "k3s-killall.sh"
execute_if_exists "/usr/local/bin/k3s-agent-uninstall.sh" "k3s-agent-uninstall.sh"

# Konfiguracja iptables
configure_iptables
```

#### Dodaj wpisy cgroup do pliku cmdline.txt na każdym węźle działającym na procesorze ARM.

```bash
sudo vim /boot/cmdline.txt
```

* Dodaj na końcu linii rozpoczynającej się od console= poniższe wpisy:

```bash
cgroup_memory=1 cgroup_enable=memory
```

* Zapisz plik i wyjdź.

#### Ponownie uruchom serwer

```bash
sudo reboot
```

### Zainstaluj k3s w wersji 1.26.9+k3s1 bez traefik, Helma i Ranchera na węźle głównym przy użyciu skryptu Bash

{{< notice success "hostNetwork: true" >}}

Gdy ustawisz hostNetwork: true w specyfikacji Kubernetes Pod, Pod używa przestrzeni nazw sieci hosta, a nie swojej własnej. Może to prowadzić do sytuacji, w której Pod nie może osiągnąć zewnętrznych adresów IP usług w tym samym klastrze. Zobacz artykuł: [Kubernetes pod with hostNetwork: true cannot reach external IPs of services in the same cluster](https://sysadmin.info.pl/en/blog/kubernetes-pod-with-hostnetwork/)
{{< /notice >}}

#### Utwórz plik rancher.sh

```bash
vim rancher.sh
```

#### Umieść poniższą zawartość w pliku

```vim
#!/bin/bash -e

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')]: $*"
}

# Funkcja do wyświetlania spinnera
display_spinner() {
  local pid=$1
  local spin='-\|/'

  log "Ładowanie..."

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
  log "Wykonywanie: $cmd"
  bash -c "$cmd" &
  display_spinner $!
}

error_exit() {
  log "$1"
  exit 1
}

install_k3s() {
  execute_command "curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=\"v1.26.9+k3s1\" INSTALL_K3S_EXEC=\"--disable traefik\" K3S_KUBECONFIG_MODE=\"644\" sh -s -" || error_exit "Nie udało się zainstalować k3s"
  execute_command "systemctl -q is-active k3s.service" || error_exit "Usługa k3s nie jest aktywna. Wychodzę..."
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
  echo 'Ten fragment jest interaktywny. Podaj odpowiednie wartości.'
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
# Dodatkowe zaufane CA.
# Włącz tę flagę i dodaj swoje certyfikaty CA jako sekret o nazwie tls-ca-additional w przestrzeni nazw.
# Zobacz README.md dla szczegółów.
additionalTrustedCAs: false
antiAffinity: preferred
topologyKey: kubernetes.io/hostname

# Logi audit https://rancher.com/docs/rancher/v2.x/en/installation/api-auditing/
# Logi audit są kierowane do konsoli kontenera rancher-audit-log w podzie rancher.
# https://rancher.com/docs/rancher/v2.x/en/installation/api-auditing/
# destination stream to sidecar container console or hostPath volume
# level: Poziom logów, od 0 do 3. 0 to wyłączone, 3 to dużo.

auditLog:
  destination: sidecar
  hostPath: /var/log/rancher/audit/
  level: 0
  maxAge: 1
  maxBackup: 1
  maxSize: 100

  # Obraz do zbierania logów audit rancher.
  # Ważne: zaktualizuj plik pkg/image/export/resolve.go, gdy zostanie zmieniony ten domyślny obraz, aby został odpowiednio odzwierciedlony w rancher-images.txt generowanym dla instalacji offline.

  image:
    repository: "rancher/mirrored-bci-micro"
    tag: 15.4.14.3
    # Nadpisz imagePullPolicy obrazu
    # opcje: Always, Never, IfNotPresent
    pullPolicy: "IfNotPresent"

# Od wersji Rancher v2.5.0 ta flaga jest przestarzała i musi być ustawiona na 'true', aby Rancher się uruchomił
addLocal: "true"

# Dodaj flagę debug do serwera Rancher
debug: false

# Podczas pierwszego uruchomienia Rancher, zainicjuj admina jako restricted-admin
restrictedAdmin: false

# Dodatkowe zmienne środowiskowe przekazywane do podów rancher.
# extraEnv:
# - name: CATTLE_TLS_MIN_VERSION
#   value: "1.0"

# W pełni kwalifikowana nazwa, aby dostać się do serwera Rancher
hostname: rancher.local

## Opcjonalna tablica imagePullSecrets zawierająca poświadczenia prywatnych rejestrów
## Ref: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/
imagePullSecrets: []

# - name: secretName

### ingress ###

# Instrukcja do odczytu szczegółów i instrukcji dotyczących dodawania tajnych certyfikatów TLS.
ingress:
  # Jeśli ustawione na false, nie zostanie utworzone ingress
  # Domyślnie true
  # opcje: true, false
  enabled: true
  includeDefaultExtraAnnotations: true
  extraAnnotations: {}
  ingressClassName: "nginx"
  # numer portu backendu
  servicePort: 80

  # configurationSnippet - Dodaj dodatkową konfigurację Nginx. Ten przykład statycz

nie ustawia nagłówek w ingress.
  # configurationSnippet: |
  #   more_set_input_headers "X-Forwarded-Host: {{ .Values.hostname }}";

  tls:
    # opcje: rancher, letsEncrypt, secret
    source: secret
    secretName: tls-rancher-ingress

### service ###
# Nadpisz, aby używać typu usługi NodePort lub LoadBalancer - domyślnie ClusterIP

service:
  type: ""
  annotations: {}

### Konfiguracja LetsEncrypt ###
# Wskazówka: Środowisko produkcyjne pozwala rejestrować nazwę 5 razy na tydzień.
# Użyj środowiska testowego, dopóki nie skonfigurujesz swojego ustawienia.

letsEncrypt:
  # email: none@example.com
  environment: production
  ingress:
    # opcje: traefik, nginx
    class: "nginx"

# Jeśli używasz certyfikatów podpisanych przez prywatne CA, ustaw na 'true' i ustaw 'tls-ca'
# w przestrzeni nazw 'rancher-system'. Zobacz README.md dla szczegółów.
privateCA: false

# Proxy http[s] przekazywany do serwera rancher.
# proxy: http://example.local:1080

# Przecinek oddzielone lista domen lub adresów IP, które nie będą używać proxy
noProxy: 127.0.0.0/8,10.42.0.0/16,10.43.0.0/16,192.168.0.1/24,10.10.0.0/24,rancher.local

# Nadpisz lokalizację obrazu rancher dla instalacji offline
rancherImage: rancher/rancher

# Tag obrazu rancher/rancher. https://hub.docker.com/r/rancher/rancher/tags/
# Domyślnie .Chart.appVersion
# rancherImageTag: v2.0.7

# Nadpisz imagePullPolicy dla obrazów serwera rancher
# opcje: Always, Never, IfNotPresent
# Domyślnie IfNotPresent
# rancherImagePullPolicy: <pullPolicy>

# Liczba replik serwera Rancher. Ustawienie liczby ujemnej spowoduje dynamiczną zmianę między 0 a abs(replicas) na podstawie dostępnych węzłów.
# dostępnych w klastrze węzłów
replicas: 3

# Ustawienie priorityClassName, aby uniknąć wyłączenia
priorityClassName: rancher-critical

# Ustawienia zasobów podów Rancher.
resources: {}

#
# tls
#   Gdzie przekierować szyfrowanie TLS/SSL
# - ingress (domyślnie)
# - external
tls: ingress

systemDefaultRegistry: ""

# Ustaw, aby używać zapakowanych diagramów systemowych
useBundledSystemChart: false

# Zgodność z wersją Certmanager
certmanager:
  version: ""

# Trwałość niestandardowych logo Rancher
customLogos:
  enabled: false
  volumeSubpaths:
    emberUi: "ember"
    vueUi: "vue"

  ## Rodzaj woluminu do używania w celu trwałości: persistentVolumeClaim, configMap
  volumeKind: persistentVolumeClaim
  ## Użyj istniejącego woluminu. Loga niestandardowe powinny być skopiowane do woluminu przez użytkownika
  # volumeName: custom-logos
  ## Tylko dla volumeKind: persistentVolumeClaim
  ## Aby wyłączyć dynamiczne przydzielanie, ustaw storageClass: "" lub storageClass: "-"
  # storageClass: "-"
  accessMode: ReadWriteOnce
  size: 1Gi

# Hook Rancher po usunięciu
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

  # domyślnie, zadanie nie zostanie zakończone poprawnie, jeśli nie uda się odinstalować którejkolwiek z aplikacji
  ignoreTimeoutError: false

# Ustaw hasło startowe. Jeśli pozostawisz puste, zostanie wygenerowane losowe hasło.
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
      # domyślnie true w wersjach 1.24 i starszych, a false w wersji 1.25 i nowszych
      # można ręcznie zmienić na true lub false, aby obejść wersję i wymusić tę opcję
      enabled: ""
EOF
}

main() {
  if install_k3s; then
    echo 'k3s działa...'
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

    echo 'Czekam 30 sekund...'
    sleep 30 & # Tło komenda sleep
    display_spinner $! # Przekazanie PID ostatniej komendy w tle

    helm install rancher rancher-stable/rancher --namespace cattle-system -f values.yaml

    echo 'Czekam 120 sekund...'
    sleep 120 & # Tło komenda sleep
    display_spinner $! # Przekazanie PID ostatniej komendy w tle

    kubectl get pods -A
  else
    echo "Nie udało się zainstalować k3s. Wychodzę..."
  fi
}

main
```

#### Ustaw uprawnienia do wykonywania skryptu

```bash
sudo chmod +x rancher.sh
```

#### Uruchom skrypt

```bash
./rancher.sh
```

#### Wyświetl URL do pulpitu Rancher

```bash
echo https://rancher.local/dashboard/?setup=$(kubectl get secret --namespace cattle-system bootstrap-secret -o go-template='{{.data.bootstrapPassword|base64decode}}')
```

#### Skopiuj URL i wklej go do paska adresu przeglądarki internetowej. Następnie zaloguj się do Rancher używając początkowego hasła test1234 oraz loginu: admin.

### Instalacja na węzłach roboczych

#### Skopiuj token

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

#### Skopiuj adres IP węzła głównego

```bash
hostname -I | awk '{ print $1 }'
```

#### Zainstaluj najnowszą wersję k3s na węzłach roboczych
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

#### Sprawdź stan węzłów

```bash
kubectl get nodes
```

#### Sprawdź pod-y

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