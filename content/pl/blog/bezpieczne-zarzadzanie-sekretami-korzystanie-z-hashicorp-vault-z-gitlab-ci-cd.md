---
title: Bezpieczne zarządzanie sekretami - Korzystanie z HashiCorp Vault z GitLab CI/CD
date: 2024-06-11T08:00:00+00:00
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

## Wstęp

Poniżej przedstawiam zintegrowany tutorial obejmujący instalację HashiCorp Vault na osobnym serwerze oraz jego integrację z GitLab Runnerami. Dzięki temu zapewnimy bezpieczne przechowywanie sekretów i ich wykorzystanie w pipeline'ach GitLab CI/CD.

[Dokumentacja HashiCorp Vault](https://developer.hashicorp.com/vault/install?product_intent=vault)

### Instalacja HashiCorp Vault na osobnym serwerze

1. **Zainstaluj Vault**:

    Na serwerze z systemem Linux wykonaj poniższe kroki:

{{< tabs Debian CentOS >}}
  {{< tab >}}
  ##### Debian/Ubuntu
  ```bash
  sudo apt -y install gnupg2
  wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
  sudo apt update && sudo apt -y install vault
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### CentOS/RHEL
  ```bash
  sudo yum install -y yum-utils gnupg2
  sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
  sudo yum -y install vault
  # Verify the installation
  vault --version
  ```
  {{< /tab >}}
{{< /tabs >}}

2. **Konfiguracja certyfikatu dla Vault na nowo**:

Błąd "tls: failed to verify certificate: x509: cannot validate certificate for 10.10.0.150 because it doesn't contain any IP SANs" oznacza, że certyfikat SSL używany przez Vault nie zawiera informacji o IP w polu Subject Alternative Name (SAN). Zalecane jest wygenerowanie poprawnego certyfikatu SSL z odpowiednim polem SAN. Po wykonaniu tych kroków, Vault powinien poprawnie zaakceptować połączenia HTTPS i pozwolić na dalszą konfigurację oraz inicjalizację.

2a. **Stwórz plik konfiguracyjny OpenSSL dla certyfikatu z IP SAN**

Musisz wygenerować nowy certyfikat, który zawiera IP adres jako SAN.

Stwórz plik o nazwie `openssl.cnf`:

   ```ini
   [req]
   default_bits       = 2048
   default_md         = sha256
   prompt             = no
   encrypt_key        = no
   distinguished_name = dn
   req_extensions     = req_ext
   x509_extensions    = v3_ca

   [dn]
   C  = US
   ST = State
   L  = City
   O  = Organization
   OU = Organizational Unit
   CN = 10.10.0.150

   [req_ext]
   subjectAltName = @alt_names

   [v3_ca]
   subjectAltName = @alt_names
   basicConstraints = critical, CA:true

   [alt_names]
   IP.1 = 10.10.0.150
   ```

2b. **Generowanie nowego klucza prywatnego i certyfikatu**

Użyj poniższych poleceń do wygenerowania nowego klucza prywatnego i certyfikatu:

   ```bash
   openssl genpkey -algorithm RSA -out tls.key
   openssl req -new -x509 -days 365 -key tls.key -out tls.crt -config openssl.cnf
   ```

2c. **Zaktualizuj pliki certyfikatów w Vault**

   Skopiuj nowo wygenerowane pliki `tls.key` i `tls.crt` do odpowiedniego katalogu (np. `/opt/vault/tls/`):

   ```bash
   sudo mv tls.crt /opt/vault/tls/tls.crt
   sudo mv tls.key /opt/vault/tls/tls.key
   sudo chown -R vault:vault /opt/vault/tls/
   ```

3. **Skonfiguruj Vault**:

    Sprawdź plik konfiguracyjny Vault (`vault.hcl`) w katalogu `/etc/vault.d`:

    ```hcl
    # Copyright (c) HashiCorp, Inc.
    # SPDX-License-Identifier: BUSL-1.1

    # Full configuration options can be found at https://developer.hashicorp.com/vault/docs/configuration

    ui = true

    #mlock = true
    #disable_mlock = true

    storage "file" {
      path = "/opt/vault/data"
    }

    #storage "consul" {
    #  address = "127.0.0.1:8500"
    #  path    = "vault"
    #}

    # HTTP listener
    #listener "tcp" {
    #  address = "127.0.0.1:8200"
    #  tls_disable = 1
    #}

    # HTTPS listener
    listener "tcp" {
      address       = "0.0.0.0:8200"
      tls_cert_file = "/opt/vault/tls/tls.crt"
      tls_key_file  = "/opt/vault/tls/tls.key"
    }

    api_addr = "https://10.10.0.150:8200"
    cluster_addr = "https://10.10.0.150:8201"

    # Enterprise license_path
    # This will be required for enterprise as of v1.8
    #license_path = "/etc/vault.d/vault.hclic"

    # Example AWS KMS auto unseal
    #seal "awskms" {
    #  region = "us-east-1"
    #  kms_key_id = "REPLACE-ME"
    #}

    # Example HSM auto unseal
    #seal "pkcs11" {
    #  lib            = "/usr/vault/lib/libCryptoki2_64.so"
    #  slot           = "0"
    #  pin            = "AAAA-BBBB-CCCC-DDDD"
    #  key_label      = "vault-hsm-key"
    #  hmac_key_label = "vault-hsm-hmac-key"
    #}
    ```

    Upewnij się, że katalog `/opt/vault/data` istnieje i ma odpowiednie uprawnienia.

4. **Zaktualizowanie zaufanych certyfikatów**

   Skopiuj certyfikat do odpowiedniej lokalizacji i zaktualizuj bazę zaufanych certyfikatów:

   ```bash
   sudo cp /opt/vault/tls/tls.crt /usr/local/share/ca-certificates/vault.crt
   sudo update-ca-certificates
   ```

5. **Plik środowiskowy Vault:**

   Stwórz plik `vault.env` w `/etc/vault.d/` z odpowiednimi zmiennymi środowiskowymi.

   ```bash
   VAULT_ADDR=https://<vault_server_ip>
   DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus
   ```

### Stworzenie pliku usługi systemd

6. **Stwórz plik usługi systemd:**

   Stwórz plik `vault.service` w katalogu `/etc/systemd/system/`:

   ```bash
   sudo vim /etc/systemd/system/vault.service
   ```

7. **Dodaj poniższą konfigurację do pliku `vault.service`:**

   ```ini
   [Unit]
   Description=HashiCorp Vault
   Documentation=https://www.vaultproject.io/docs/
   Requires=network-online.target
   After=network-online.target

   [Service]
   User=vault
   Group=vault
   EnvironmentFile=/etc/vault.d/vault.env
   ExecStart=/usr/bin/vault server -config=/etc/vault.d/vault.hcl
   ExecReload=/bin/kill --signal HUP $MAINPID
   KillMode=process
   KillSignal=SIGINT
   Restart=on-failure
   RestartSec=5
   LimitNOFILE=65536

   [Install]
   WantedBy=multi-user.target
   ```

### Konfiguracja użytkownika i uprawnień

8. **Stwórz użytkownika i grupę dla Vault:**

   ```bash
   sudo useradd --system --home /var/lib/vault --shell /bin/false vault
   ```

9. **Ustaw odpowiednie uprawnienia dla katalogów:**

   ```bash
   sudo mkdir -p /var/lib/vault /opt/vault/data
   sudo chown -R vault:vault /var/lib/vault /opt/vault/data
   sudo chown -R vault:vault /etc/vault.d
   sudo chmod 640 /etc/vault.d/vault.hcl
   ```

### Uruchomienie i sprawdzenie statusu usługi

10. **Zaktualizuj systemd, aby wczytać nową usługę:**

   ```bash
   sudo systemctl daemon-reload
   ```

11. **Włącz usługę Vault, aby uruchamiała się automatycznie przy starcie systemu:**

   ```bash
   sudo systemctl enable vault
   ```

12. **Uruchom usługę Vault:**

   ```bash
   sudo systemctl start vault
   ```

13. **Sprawdź status usługi Vault:**

   ```bash
   sudo systemctl status vault
   ```

    Vault będzie teraz działał na `https://<vault_server_ip>:8200`.


### Inicjalizacja Vault

14. **Inicjalizacja i odblokowanie Vault**:

    W nowym terminalu uruchom poniższe komendy:

    ```bash
    echo "export VAULT_ADDR='https://<vault_server_ip>:8200'" >> ~/.bashrc
    source ~/.bashrc
    ```

    ### Rozwiąż problem z DBUS_SESSION_BUS_ADDRESS

    Gdy uruchamiasz polecenie `sudo journalctl -u vault.service`, widzisz ostrzeżenie:

    ```bash
    WARN[0000]log.go:244 gosnowflake.(*defaultLogger).Warn DBUS_SESSION_BUS_ADDRESS envvar looks to be not set, this can lead to runaway dbus-daemon processes. To avoid this, set envvar DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus (if it exists) or DBUS_SESSION_BUS_ADDRESS=/dev/null.
    ```

    Ostrzeżenie `DBUS_SESSION_BUS_ADDRESS envvar looks to be not set, this can lead to runaway dbus-daemon processes` wskazuje, że zmienna środowiskowa `DBUS_SESSION_BUS_ADDRESS` nie jest ustawiona. Może to prowadzić do niekontrolowanych procesów dbus-daemon, co może powodować problemy z zasobami.

    Aby rozwiązać ten problem, należy ustawić zmienną środowiskową `DBUS_SESSION_BUS_ADDRESS` w pliku `.bashrc`.

    ```bash
        echo "export DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus" >> ~/.bashrc
        source ~/.bashrc
    ```

    Inicjalizacja Vault

    ```bash
    vault operator init
    ```

    Zapisz klucze i token root wygenerowane podczas inicjalizacji
  
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

15. **Stwórz politykę i sekret w Vault**:

    Stwórz plik polityki `gitlab-policy.hcl` w dowolnym miejscu na serwerze np. w katalogu root:

    ```bash
    sudo vim /root/gitlab-policy.hcl
    ```
    Dodaj treść polityki do pliku:

    ```hcl
    path "secret/data/gitlab/*" {
      capabilities = ["create", "read", "update", "delete", "list"]
    }
    ```

    Zapisz plik i zamknij edytor.

    Załaduj politykę do Vault:

    ```bash
    vault policy write gitlab-policy gitlab-policy.hcl
    ```

    Stwórz sekrety dla aplikacji AWX oraz ArgoCD, które są testowane w GitLab:

    ```bash
    vault secrets enable -path=secret kv-v2
    vault kv put secret/gitlab/awx login="admin" password='adminpassword'
    vault kv put secret/gitlab/argocd login="admin" password='adminpassword'
    ```

16. **Stwórz token dostępu dla GitLab**:

    ```bash
    vault token create -policy=gitlab-policy -period=24h
    ```

    Zapisz wygenerowany token.

### Konfiguracja GitLab CI/CD

17. **Zdefiniuj zmienne środowiskowe w ustawieniach CI/CD projektu:**:

    - `VAULT_ADDR` = `https://<vault_server_ip>:8200`
    - `VAULT_TOKEN` = `<vault_token>`

Jeśli dodasz zmienne środowiskowe VAULT_TOKEN i VAULT_ADDR w ustawieniach CI/CD projektu w GitLab, nie musisz deklarować ich ponownie w pliku .gitlab-ci.yml. GitLab automatycznie przekaże te zmienne do wszystkich zadań w pipeline.

### Dodaj certyfikat Vault w GitLab runners

18. **Pobierz certyfikat SSL z Vault**:
   
   Najpierw pobierz certyfikat SSL używany przez Vault:

   ```bash
   echo -n | openssl s_client -connect 10.10.0.150:8200 | openssl x509 > vault.crt
   ```

19. **Dodaj certyfikat do zaufanych certyfikatów**:

   Skopiuj pobrany certyfikat do zaufanych certyfikatów systemowych:

   **Na maszynie, z której próbujesz się połączyć z Vault (np. GitLab):**

   ```bash
   sudo cp vault.crt /usr/local/share/ca-certificates/
   sudo update-ca-certificates
   ```

### Sprawdzenie połączenia

20. **Sprawdź połączenie z Vault za pomocą OpenSSL:**:

   ```bash
   openssl s_client -connect 10.10.0.150:8200 -CAfile /usr/local/share/ca-certificates/vault.crt
   ```

21. **Sprawdź połączenie z Vault za pomocą curl:**:

```bash
curl --cacert /usr/local/share/ca-certificates/vault.crt https://10.10.0.150:8200/v1/sys/health
```

22. **Skonfiguruj `.gitlab-ci.yml`**:

```yaml
variables:
  # Definiuje URL repozytorium
  REPO_URL: 'git@gitlab.sysadmin.homes:developers/taiko.git'
  # Definiuje gałąź do użycia
  BRANCH: 'main'
  # Ścieżka do przechowywania raportów
  REPORT_PATH: '/workspace'
  # Nazwa raportu
  REPORT_NAME: 'TAIKO_AUTOMATED_TESTS'
  # Obraz Docker do użycia
  DOCKER_IMAGE: "taiko"
  # Strategia Git do użycia
  GIT_STRATEGY: clone
  # Pomija pobieranie Chromium dla Taiko
  TAIKO_SKIP_CHROMIUM_DOWNLOAD: "true"

stages:
  # Definiuje etapy dla potoku CI/CD
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
  # Kopiuje pobrany certyfikat do katalogu zaufanych certyfikatów
  - cp gitlab.crt /usr/local/share/ca-certificates/gitlab.crt
  # Pobiera certyfikat SSL z serwera HashiCorp Vault i zapisuje go do pliku
  - echo -n | openssl s_client -connect 10.10.0.150:8200 -servername 10.10.0.150 | openssl x509 > vault.crt
  # Kopiuje pobrany certyfikat do katalogu zaufanych certyfikatów
  - cp vault.crt /usr/local/share/ca-certificates/vault.crt
  # Aktualizuje listę zaufanych certyfikatów
  - update-ca-certificates
  # Eksportuje poświadczenia AWX z HashiCorp Vault
  - |
    export AWX_SECRET=$(curl --silent --header "X-Vault-Token: $VAULT_TOKEN" $VAULT_ADDR/v1/secret/data/gitlab/awx)
    export AWX_USERNAME=$(echo $AWX_SECRET | jq -r '.data.data.login')
    export AWX_PASSWORD=$(echo $AWX_SECRET | jq -r '.data.data.password')
  # Eksportuje poświadczenia ArgoCD z HashiCorp Vault
  - |
    export ARGOCD_SECRET=$(curl --silent --header "X-Vault-Token: $VAULT_TOKEN" $VAULT_ADDR/v1/secret/data/gitlab/argocd)
    export ARGOCD_USERNAME=$(echo $ARGOCD_SECRET | jq -r '.data.data.login')
    export ARGOCD_PASSWORD=$(echo $ARGOCD_SECRET | jq -r '.data.data.password')

  # Zmienne NPM_USER i NPM_PASS nie są poprawnie przekazywane do Dockerfile, gdy są eksportowane w sekcji before_script. 
  # Docker buduje obraz przed uruchomieniem skryptów before_script, więc zmienne te nie są dostępne w czasie budowania obrazu Docker. 
  # Aby rozwiązać ten problem, zmienne NPM_USER i NPM_PASS powinny być zdefiniowane jako zmienne CI/CD na poziomie projektu w GitLab, 
  # a następnie przekazywane jako argumenty podczas budowania obrazu Docker.

build_and_test_awx:
  stage: build_and_test
  tags:
    # Użyj runnera z tagiem 'docker1'
    - docker1
  image: docker:latest
  services:
    # Użyj usługi Docker-in-Docker
    - name: docker:dind
  variables:
    # Użyj sterownika overlay2 dla Docker
    DOCKER_DRIVER: overlay2
    # Ustaw hosta Docker
    DOCKER_HOST: "tcp://docker:2375"
    # Wyłącz katalog certyfikatów TLS dla Docker
    DOCKER_TLS_CERTDIR: ""
  script:
    # Klonuje repozytorium
    - git clone --single-branch --branch $BRANCH $REPO_URL
    # Buduje obraz Docker z poświadczeniami NPM
    - docker build --build-arg NPM_USER="${NPM_USER}" --build-arg NPM_PASS="${NPM_PASS}" -t $DOCKER_IMAGE -f Dockerfile .
    # Uruchamia testy wewnątrz kontenera Docker
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
    # Czyści system Docker
    - docker system prune -af
    # Czyści woluminy Docker
    - docker volume prune -f
  artifacts:
    # Definiuje ścieżki do artefaktów
    paths:
      - "${CI_PROJECT_DIR}/*.tar"

build_and_test_argocd:
  stage: build_and_test
  tags:
    # Użyj runnera z tagiem 'docker2'
    - docker2
  image: docker:latest
  services:
    # Użyj usługi Docker-in-Docker
    - name: docker:dind
  variables:
    # Użyj sterownika overlay2 dla Docker
    DOCKER_DRIVER: overlay2
    # Ustaw hosta Docker
    DOCKER_HOST: "tcp://docker:2375"
    # Wyłącz katalog certyfikatów TLS dla Docker
    DOCKER_TLS_CERTDIR: ""
  script:
    # Klonuje repozytorium
    - git clone --single-branch --branch $BRANCH $REPO_URL
    # Buduje obraz Docker z poświadczeniami NPM
    - docker build --build-arg NPM_USER="${NPM_USER}" --build-arg NPM_PASS="${NPM_PASS}" -t $DOCKER_IMAGE -f Dockerfile .
    # Uruchamia testy wewnątrz kontenera Docker
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
    # Czyści system Docker
    - docker system prune -af
    # Czyści woluminy Docker
    - docker volume prune -f
  artifacts:
    # Definiuje ścieżki do artefaktów
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

### Podsumowanie

Zainstalowanie Vault na osobnym serwerze zapewnia większą elastyczność i skalowalność w zarządzaniu sekretami. Dzięki powyższemu tutorialowi skonfigurowałeś Vault, aby bezpiecznie przechowywał i zarządzał sekretami, oraz zintegrowałeś go z GitLab, umożliwiając bezpieczne korzystanie z tych sekretów w pipeline'ach CI/CD. Upewnij się, że konfiguracja sieci i zabezpieczenia są odpowiednio skonfigurowane, aby umożliwić bezpieczne połączenia między GitLab runnerami a Vault.