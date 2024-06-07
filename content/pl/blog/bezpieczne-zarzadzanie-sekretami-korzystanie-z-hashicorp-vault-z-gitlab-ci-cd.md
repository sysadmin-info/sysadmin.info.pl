---
title: Bezpieczne zarządzanie sekretami - Korzystanie z HashiCorp Vault z GitLab CI/CD
date: 2024-06-08T13:00:00+00:00
description: Bezpieczne zarządzanie sekretami - Korzystanie z HashiCorp Vault z GitLab CI/CD
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
image: images/2024-thumbs/gitlab04.webp
---

**Oto film instruktażowy**

{{<youtube>}}

[Dokumentacja HashiCorp Vault](https://developer.hashicorp.com/vault/install?product_intent=vault)

## Wstęp

Poniżej przedstawiam zintegrowany tutorial obejmujący instalację HashiCorp Vault na osobnym serwerze oraz jego integrację z GitLab Runnerami. Dzięki temu zapewnimy bezpieczne przechowywanie sekretów i ich wykorzystanie w pipeline'ach GitLab CI/CD.

### Instalacja HashiCorp Vault na osobnym serwerze

1. **Zainstaluj Vault**:

    Na serwerze z systemem Linux wykonaj poniższe kroki:

{{< tabs Debian CentOS >}}
  {{< tab >}}
  ##### Debian/Ubuntu
  ```bash
  wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
  sudo apt update && sudo apt install vault
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### CentOS/RHEL
  ```bash
  sudo yum install -y yum-utils
  sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
  sudo yum -y install vault
  # Verify the installation
  vault --version
  ```
  {{< /tab >}}
{{< /tabs >}}

2. **Skonfiguruj Vault**:

    Stwórz plik konfiguracyjny Vault (`config.hcl`):

    ```hcl
    storage "file" {
      path = "/path/to/vault/data"
    }

    listener "tcp" {
      address     = "0.0.0.0:8200"
      tls_disable = 1
    }

    ui = true
    ```

    Upewnij się, że katalog `/path/to/vault/data` istnieje i ma odpowiednie uprawnienia.

3. **Uruchom Vault**:

    ```bash
    vault server -config=config.hcl
    ```

    Vault będzie teraz działał na `http://<vault_server_ip>:8200`.

4. **Inicjalizacja i odblokowanie Vault**:

    W nowym terminalu uruchom poniższe komendy:

    ```bash
    export VAULT_ADDR='http://<vault_server_ip>:8200'
    
    # Inicjalizacja Vault
    vault operator init

    # Zapisz klucze i token root wygenerowane podczas inicjalizacji
    ```

    Otrzymasz kilka kluczy unseal i jeden token root. Zapisz je w bezpiecznym miejscu.

    ```bash
    # Odblokuj Vault przy użyciu kluczy unseal
    vault operator unseal <unseal_key_1>
    vault operator unseal <unseal_key_2>
    vault operator unseal <unseal_key_3>
    ```

    Zaloguj się przy użyciu tokenu root:

    ```bash
    vault login <root_token>
    ```

### Konfiguracja HashiCorp Vault

1. **Stwórz politykę i sekret w Vault**:

    Stwórz plik polityki `gitlab-policy.hcl`:

    ```hcl
    path "secret/data/gitlab/*" {
      capabilities = ["create", "read", "update", "delete", "list"]
    }
    ```

    Załaduj politykę do Vault:

    ```bash
    vault policy write gitlab-policy gitlab-policy.hcl
    ```

    Stwórz sekret dla GitLab:

    ```bash
    vault secrets enable -path=secret kv-v2
    
    vault kv put secret/gitlab/database username="my-username" password="my-password"
    ```

2. **Stwórz token dostępu dla GitLab**:

    ```bash
    vault token create -policy=gitlab-policy -period=24h
    ```

    Zapisz wygenerowany token.

### Konfiguracja GitLab Runnerów

1. **Instalacja `vault` na runnerach**:

    Na każdym runnerze GitLab, zainstaluj `vault`:

    ```bash
    curl -O https://releases.hashicorp.com/vault/1.16.3/vault_1.16.3_linux_amd64.zip
    unzip vault_1.16.3_linux_amd64.zip
    sudo mv vault /usr/local/bin/
    vault --version
    ```

2. **Zdefiniuj zmienne środowiskowe w GitLab CI/CD**:

    Dodaj zmienne środowiskowe do konfiguracji CI/CD w GitLab:

    - `VAULT_ADDR` = `http://<vault_server_ip>:8200`
    - `VAULT_TOKEN` = `<vault_token>`

3. **Skonfiguruj `.gitlab-ci.yml`**:

    Dodaj kroki do pliku `.gitlab-ci.yml`:

    ```yaml
    stages:
      - test

    variables:
      VAULT_ADDR: "http://<vault_server_ip>:8200"

    before_script:
      - apt-get update -y && apt-get install -y jq
      - echo $VAULT_TOKEN > /tmp/.vault-token

    job:
      stage: test
      script:
        - echo "Pobieranie sekretów z Vault"
        - export VAULT_TOKEN=$(cat /tmp/.vault-token)
        - secrets=$(vault kv get -format=json secret/gitlab/database)
        - export DB_USERNAME=$(echo $secrets | jq -r '.data.data.username')
        - export DB_PASSWORD=$(echo $secrets | jq -r '.data.data.password')
        - echo "Używanie pobranych sekretów"
        - echo "DB_USERNAME: $DB_USERNAME"
        - echo "DB_PASSWORD: $DB_PASSWORD"
    ```

### Podsumowanie

Zainstalowanie Vault na osobnym serwerze zapewnia większą elastyczność i skalowalność w zarządzaniu sekretami. Dzięki powyższemu tutorialowi skonfigurowałeś Vault, aby bezpiecznie przechowywał i zarządzał sekretami, oraz zintegrowałeś go z GitLab, umożliwiając bezpieczne korzystanie z tych sekretów w pipeline'ach CI/CD. Upewnij się, że konfiguracja sieci i zabezpieczenia są odpowiednio skonfigurowane, aby umożliwić bezpieczne połączenia między GitLab runnerami a Vault.