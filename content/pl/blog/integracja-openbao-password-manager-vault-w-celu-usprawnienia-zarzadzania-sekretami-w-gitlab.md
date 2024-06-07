---
title: Integracja OpenBao Password Manager Vault w celu usprawnienia zarządzania sekretami w GitLab
date: 2024-06-07T13:00:00+00:00
description: Integracja OpenBao Password Manager Vault w celu usprawnienia zarządzania sekretami w GitLab
draft: true
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
image: images/2024-thumbs/gitlab05.webp
---

**Oto film instruktażowy**

{{<youtube>}}

### Instalacja OpenBao z interfejsem użytkownika

#### Krok 1: Instalacja Go

1. **Pobierz i zainstaluj Go**:
   
   ```bash
   wget https://go.dev/dl/go1.20.5.linux-amd64.tar.gz  # Sprawdź najnowszą wersję na stronie Go
   sudo tar -C /usr/local -xzf go1.20.5.linux-amd64.tar.gz

   # Dodaj Go do ścieżki systemowej
   echo "export PATH=$PATH:/usr/local/go/bin" >> ~/.profile
   source ~/.profile

   # Sprawdź instalację
   go version
   ```

#### Krok 2: Instalacja OpenBao

1. **Sklonuj repozytorium OpenBao**:

    ```bash
    git clone https://github.com/openbao/openbao.git
    cd openbao
    ```

2. **Zbuduj OpenBao z interfejsem użytkownika**:

    ```bash
    make static-dist dev-ui
    ```

3. **Przenieś binarkę do ścieżki systemowej**:

    ```bash
    sudo mv bin/vault /usr/local/bin/openbao
    openbao --version
    ```

#### Krok 3: Konfiguracja OpenBao

1. **Stwórz plik konfiguracyjny `config.hcl`**:

    ```hcl
    storage "file" {
      path = "/path/to/openbao/data"
    }

    listener "tcp" {
      address     = "127.0.0.1:8200"
      tls_disable = 1
    }

    ui = true
    ```

2. **Uruchom OpenBao**:

    ```bash
    openbao server -config=config.hcl
    ```

3. **Inicjalizacja i odblokowanie OpenBao**:

    ```bash
    export VAULT_ADDR='http://127.0.0.1:8200'
    openbao operator init

    # Zapisz klucze unseal i token root wygenerowane podczas inicjalizacji

    openbao operator unseal <unseal_key_1>
    openbao operator unseal <unseal_key_2>
    openbao operator unseal <unseal_key_3>
    openbao login <root_token>
    ```

#### Krok 4: Konfiguracja polityki i sekretów

1. **Stwórz politykę `gitlab-policy.hcl`**:

    ```hcl
    path "secret/data/gitlab/*" {
      capabilities = ["create", "read", "update", "delete", "list"]
    }
    ```

2. **Załaduj politykę do OpenBao**:

    ```bash
    openbao policy write gitlab-policy gitlab-policy.hcl
    ```

3. **Stwórz sekret dla GitLab**:

    ```bash
    openbao secrets enable -path=secret kv-v2
    openbao kv put secret/gitlab/database username="my-username" password="my-password"
    ```

4. **Stwórz token dostępu dla GitLab**:

    ```bash
    openbao token create -policy=gitlab-policy -period=24h
    ```

    Zapisz wygenerowany token.

### Konfiguracja GitLab

1. **Zainstaluj `openbao` na runnerach**:

    Na każdym runnerze GitLab zainstaluj `openbao`:

    ```bash
    # Skopiuj binarkę openbao na runnery
    scp /usr/local/bin/openbao user@runner:/usr/local/bin/
    ```

2. **Zdefiniuj zmienne środowiskowe w GitLab CI/CD**:

    Dodaj zmienne CI/CD w GitLab:

    - `VAULT_ADDR` = `http://127.0.0.1:8200`
    - `VAULT_TOKEN` = `<vault_token>`

3. **Skonfiguruj `.gitlab-ci.yml`**:

    ```yaml
    stages:
      - test

    variables:
      VAULT_ADDR: "http://127.0.0.1:8200"

    before_script:
      - apt-get update -y && apt-get install -y jq
      - echo $VAULT_TOKEN > /tmp/.vault-token

    job:
      stage: test
      script:
        - echo "Pobieranie sekretów z OpenBao"
        - export VAULT_TOKEN=$(cat /tmp/.vault-token)
        - secrets=$(openbao kv get -format=json secret/gitlab/database)
        - export DB_USERNAME=$(echo $secrets | jq -r '.data.data.username')
        - export DB_PASSWORD=$(echo $secrets | jq -r '.data.data.password')
        - echo "Używanie pobranych sekretów"
        - echo "DB_USERNAME: $DB_USERNAME"
        - echo "DB_PASSWORD: $DB_PASSWORD"
    ```

### Podsumowanie

Powyższe kroki obejmują instalację Go, pobranie i zbudowanie OpenBao wraz z interfejsem użytkownika, konfigurację OpenBao oraz integrację z GitLab. Dzięki temu możesz bezpiecznie przechowywać i zarządzać sekretami używanymi w swoich pipeline'ach CI/CD. Jeśli masz dodatkowe pytania lub potrzebujesz dalszej pomocy, daj znać!