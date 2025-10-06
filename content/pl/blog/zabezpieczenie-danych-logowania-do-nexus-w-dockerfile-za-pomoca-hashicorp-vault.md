---
title: Zabezpieczenie danych logowania do Nexus w Dockerfile za pomocą HashiCorp Vault
date: 2024-06-18T12:00:00+00:00
description: Zabezpieczenie danych logowania do Nexus w Dockerfile za pomocą HashiCorp Vault
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- GitLab
categories:
- GitLab
cover:
    image: images/2024-thumbs/gitlab06.webp
---

## Wstęp

Aby wykorzystać HashiCorp Vault do przechowywania i pobierania danych logowania do Nexus (NPM) podczas budowania obrazu Docker, musimy skupić się na bezpiecznym przechowywaniu tych danych w Vault i późniejszym ich pobraniu wewnątrz kontenera Docker podczas budowania. Kluczowym aspektem jest tutaj użycie narzędzia `vault` w kontenerze Docker do pobrania tajemnic bezpośrednio podczas budowania obrazu.

### Kroki

1. **Przechowywanie danych logowania do NPM w HashiCorp Vault**.
2. **Modyfikacja `.gitlab-ci.yml`** do pobrania tych danych wewnątrz kontenera Docker.
3. **Modyfikacja Dockerfile**, aby pobrać dane logowania z Vault podczas budowania obrazu.

### Krok 1: Przechowywanie danych logowania do NPM w HashiCorp Vault

Najpierw dodaj dane logowania do NPM do HashiCorp Vault.

```bash
vault kv put secret/gitlab/npm NPM_USER="your-npm-username" NPM_PASS="your-npm-password"
```

### Krok 2: Modyfikacja `.gitlab-ci.yml`

Zaktualizuj `.gitlab-ci.yml`, aby pobrać dane logowania z Vault i użyć ich w kontenerze Docker.

```yaml
variables:
  # Określa URL repozytorium
  REPO_URL: 'git@gitlab.sysadmin.homes:developers/taiko.git'
  # Określa gałąź do użycia
  BRANCH: 'main'
  # Ścieżka do przechowywania raportów
  REPORT_PATH: '/workspace'
  # Nazwa raportu
  REPORT_NAME: 'TAIKO_AUTOMATED_TESTS'
  # Obraz Dockera do użycia
  DOCKER_IMAGE: "taiko"
  # Strategia Git do użycia
  GIT_STRATEGY: clone
  # Pomija pobieranie Chromium dla Taiko
  TAIKO_SKIP_CHROMIUM_DOWNLOAD: "true"

stages:
  # Określa etapy dla potoku CI/CD
  - clean
  - build_and_test
  - cleanup

before_script:
  # Sprawdza, czy ssh-agent jest zainstalowany, jeśli nie, instaluje openssh-client
  - 'which ssh-agent || ( apk update && apk add openssh-client )'
  # Uruchamia ssh-agent w tle
  - eval $(ssh-agent -s)
  # Tworzy katalog .ssh, jeśli nie istnieje
  - mkdir -p ~/.ssh
  # Ustawia uprawnienia katalogu .ssh na 700
  - chmod 700 ~/.ssh
  # Tworzy pusty plik known_hosts, jeśli nie istnieje
  - touch ~/.ssh/known_hosts
  # Ustawia uprawnienia pliku known_hosts na 644
  - chmod 644 ~/.ssh/known_hosts
  # Dodaje klucz prywatny z zmiennej środowiskowej do pliku i usuwa znaki powrotu karetki
  - echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_ed25519
  # Ustawia uprawnienia pliku klucza prywatnego na 400
  - chmod 400 ~/.ssh/id_ed25519
  # Dodaje klucz prywatny do ssh-agent
  - ssh-add ~/.ssh/id_ed25519
  # Tworzy plik konfiguracyjny SSH z ustawieniami dla hosta GitLab
  - echo -e "Host gitlab.sysadmin.homes\n\tUser git\n\tHostname gitlab.sysadmin.homes\n\tIdentityFile ~/.ssh/id_ed25519\n\tIdentitiesOnly yes\n\tStrictHostKeyChecking no" > ~/.ssh/config
  # Dodaje adres IP serwera GitLab do /etc/hosts
  - echo "10.10.0.119 gitlab.sysadmin.homes" >> /etc/hosts
  # Instaluje OpenSSL, jq i curl, jeśli nie są już zainstalowane
  - apk add --no-cache openssl jq curl
  # Pobiera certyfikat SSL z serwera GitLab i zapisuje go do pliku
  - echo -n | openssl s_client -connect gitlab.sysadmin.homes:443 -servername gitlab.sysadmin.homes | openssl x509 > gitlab.crt
  # Kopiuje pobrany certyfikat do katalogu z zaufanymi certyfikatami
  - cp gitlab.crt /usr/local/share/ca-certificates/gitlab.crt
  # Pobiera certyfikat SSL z serwera HashiCorp Vault i zapisuje go do pliku
  - echo -n | openssl s_client -connect 10.10.0.150:8200 -servername 10.10.0.150 | openssl x509 > vault.crt
  # Kopiuje pobrany certyfikat do katalogu z zaufanymi certyfikatami
  - cp vault.crt /usr/local/share/ca-certificates/vault.crt
  # Aktualizuje listę zaufanych certyfikatów
  - update-ca-certificates
  # Eksportuje dane logowania do AWX z HashiCorp Vault
  - |
    export AWX_SECRET=$(curl --silent --header "X-Vault-Token: $VAULT_TOKEN" $VAULT_ADDR/v1/secret/data/gitlab/awx)
    export AWX_USERNAME=$(echo $AWX_SECRET | jq -r '.data.data.login')
    export AWX_PASSWORD=$(echo $AWX_SECRET | jq -r '.data.data.password')
  # Eksportuje dane logowania do ArgoCD z HashiCorp Vault
  - |
    export ARGOCD_SECRET=$(curl --silent --header "X-Vault-Token: $VAULT_TOKEN" $VAULT_ADDR/v1/secret/data/gitlab/argocd)
    export ARGOCD_USERNAME=$(echo $ARGOCD_SECRET | jq -r '.data.data.login')
    export ARGOCD_PASSWORD=$(echo $ARGOCD_SECRET | jq -r '.data.data.password')

build_and_test_awx:
  stage: build_and_test
  tags:
    - docker1
  image: docker:latest
  services:
    # Używa usługi Docker-in-Docker
    - name: docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_HOST: "tcp://docker:2375"
    DOCKER_TLS_CERTDIR: ""
  script:
    # Klonuje określoną gałąź z repozytorium
    - git clone --single-branch --branch $BRANCH $REPO_URL
    # Buduje obraz Dockera z poświadczeniami Vault
    - docker build -t $DOCKER_IMAGE --build-arg VAULT_ADDR=$VAULT_ADDR --build-arg VAULT_TOKEN=$VAULT_TOKEN -f Dockerfile .
    # Uruchamia kontener Dockera i wykonuje test dla AWX
    - |
      docker run --rm -v ${CI_PROJECT_DIR}:/workspace $DOCKER_IMAGE bash -c '
        server_address="awx.sysadmin.homes"
        username="${AWX_USERNAME}"
        password="${AWX_PASSWORD}"
        rm -rf /workspace/node_modules
        rm -rf /lib/node_modules
        ln -s /usr/local/lib/node_modules/ /workspace/node_modules
        ln -s /usr/local/lib/node_modules/ /lib/node_modules
        rm -f *.tar downloaded//*
        rm -rf reports .gauge logs
        gauge run /workspace/specs/test-awx.spec
      '
    # Archiwizuje raporty, jeśli istnieją
    - if [ -d "${CI_PROJECT_DIR}/reports/" ]; then
        formattedDate=$(date +"%d_%m_%Y_%H_%M");
        filename="PASS_${REPORT_NAME}_${formattedDate}_AWX.tar";
        tar -cf ${filename} ${CI_PROJECT_DIR}/reports/ ${CI_PROJECT_DIR}/logs/;
        mv ${filename} ${CI_PROJECT_DIR}/;
      fi
    # Czyści system i wolumeny Dockera
    - docker system prune -af
    - docker volume prune -f
  artifacts:
    # Określa ścieżki do archiwizowania artefaktów
    paths:
      - "${CI_PROJECT_DIR}/*.tar"

build_and_test_argocd:
  stage: build_and_test
  tags:
    - docker2
  image: docker:latest
  services:
    # Używa usługi Docker-in-Docker
    - name: docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_HOST: "tcp://docker:2375"
    DOCKER_TLS_CERTDIR: ""
  script:
    # Klonuje określoną gałąź z repozytorium
    - git clone --single-branch --branch $BRANCH $REPO_URL
    # Buduje obraz Dockera z poświadczeniami Vault
    - docker build -t $DOCKER_IMAGE --build-arg VAULT_ADDR=$VAULT_ADDR --build-arg VAULT_TOKEN=$VAULT_TOKEN -f Dockerfile .
    # Uruchamia kontener Dockera i wykonuje test dla ArgoCD
    - |
      docker run --rm -v ${CI_PROJECT_DIR}:/workspace $DOCKER_IMAGE bash -c '
        server_address="argocd.sysadmin.homes"
        username="${ARGOCD_USERNAME}"
        password="${ARGOCD_PASSWORD}"
        rm -rf /workspace/node_modules
        rm -rf /lib/node_modules
        ln -s /usr/local/lib/node_modules/ /workspace/node_modules
        ln -s /usr/local/lib/node_modules/ /lib/node_modules
        rm -f *.tar downloaded//*
        rm -rf reports .gauge logs
        gauge run /workspace/specs/test-argocd.spec
      '
    # Archiwizuje raporty, jeśli istnieją
    - if [ -d "${CI_PROJECT_DIR}/reports/" ]; then
        formattedDate=$(date +"%d_%m_%Y_%H_%M");
        filename="PASS_${REPORT_NAME}_${formattedDate}_ArgoCD.tar";
        tar -cf ${filename} ${CI_PROJECT_DIR}/reports/ ${CI_PROJECT_DIR}/logs/;
        mv ${filename} ${CI_PROJECT_DIR}/;
      fi
    # Czyści system i wolumeny Dockera
    - docker system prune -af
    - docker volume prune -f
  artifacts:
    # Określa ścieżki do archiwizowania artefaktów
    paths:
      - "${CI_PROJECT_DIR}/*.tar"

clean_workspace:
  stage: cleanup
  parallel:
    matrix:
      # Użyj runnerów z tagiem 'docker1' i 'docker2'
      - RUNNER: docker1
      - RUNNER: docker2
  tags:
    - ${RUNNER}
  script:
    # Czyści katalog workspace
    - rm -rf $CI_PROJECT_DIR/*
```

### Krok 3: Modyfikacja Dockerfile

Zaktualizuj Dockerfile, aby pobrać dane logowania z HashiCorp Vault podczas budowania obrazu.

```Dockerfile
FROM node:22.2-alpine3.20

# Zainstaluj zależności
RUN apk update > /dev/null && \
    apk add --no-cache curl jq unzip git openssh bash nano wget ca-certificates openssl > /dev/null

# Użyj openssl do pobrania certyfikatu samopodpisanego i dodaj go do zaufanych certyfikatów
RUN echo -n | openssl s_client -connect 10.10.0.150:8200 -servername 10.10.0.150 | openssl x509 -out /usr/local/share/ca-certificates/vault.crt && \
    update-ca-certificates

# Ustaw zmienne środowiskowe dla Vault
ARG VAULT_ADDR
ARG VAULT_TOKEN

# Pobierz dane uwierzytelniające NPM z Vault i utwórz plik .npmrc
RUN NPM_SECRET=$(curl --verbose --header "X-Vault-Token: $VAULT_TOKEN" $VAULT_ADDR/v1/secret/data/gitlab/npm) && \
    NPM_USER=$(echo $NPM_SECRET | jq -r '.data.data.NPM_USER') && \
    NPM_PASS=$(echo $NPM_SECRET | jq -r '.data.data.NPM_PASS') && \
    echo "registry=https://nexus.sysadmin.homes/repository/npm-group/" > /root/.npmrc && \
    echo "//nexus.sysadmin.homes/repository/npm-group/:_auth=$(echo -n ${NPM_USER}:${NPM_PASS} | base64)" >> /root/.npmrc && \
    echo "always-auth=true" >> /root/.npmrc

# Dodaj klucz SSH GitLab do known_hosts
RUN mkdir -p /root/.ssh && ssh-keyscan gitlab.sysadmin.homes >> /root/.ssh/known_hosts

# Instalacja Gauge
RUN curl -Ssl https://downloads.gauge.org/stable | sh

# Instalacja wtyczek Gauge.
RUN gauge install js && \
    gauge install screenshot && \
    gauge install html-report

# Ustawienie rejestru npm
RUN npm config set strict-ssl false
RUN npm config set registry "https://nexus.sysadmin.homes/repository/npm-group/"

# Instalacja wymaganych pakietów npm
ENV TAIKO_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm install --no-fund --save -g npm@latest log4js@latest xml2js@latest isomorphic-fetch@latest taiko@latest

# Wyłączanie proxy
ENV http_proxy=
ENV https_proxy=

# Ustaw zmienne środowiskowe
ENV NPM_CONFIG_PREFIX=/usr/local/lib/node_modules
ENV PATH="${NPM_CONFIG_PREFIX}/bin:${PATH}"
ENV TAIKO_BROWSER_ARGS=--no-sandbox,--start-maximized,--disable-dev-shm-usage,--headless,--disable-gpu
ENV TAIKO_BROWSER_PATH=/usr/bin/chromium-browser

# Zainstaluj przeglądarkę Chromium
RUN apk add chromium
```

### Podsumowanie

W powyższych krokach dodaliśmy możliwość pobierania danych logowania do NPM z HashiCorp Vault wewnątrz kontenera Docker podczas procesu budowania. Użyliśmy argumentów `VAULT_ADDR` i `VAULT_TOKEN` w Dockerfile, aby bezpośrednio pobrać tajemnice z Vault i ustawić je jako zmienne środowiskowe, które są następnie używane do ustawienia poświadczeń NPM w kontenerze. Dzięki temu procesowi dane logowania są bezpiecznie pobierane i używane w kontenerze bez konieczności ich wcześniejszego przechowywania jako zmienne CI/CD w GitLab.

### Film instruktażowy

{{<youtube NRW9p7tJll4>}}