---
title: Integracja OpenBao Password Manager Vault w celu usprawnienia zarządzania sekretami w GitLab
date: 2024-06-25T14:11:00+00:00
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
image: images/2024-thumbs/gitlab07.webp
---

### Integracja Vaulta Menedżera Haseł OpenBao dla Lepszego Zarządzania Sekretami w GitLabie

#### Wymagania wstępne

Upewnij się, że masz uprawnienia root przed rozpoczęciem instalacji.

#### Automatyczny skrypt instalacyjny

Aby zautomatyzować instalację i konfigurację OpenBao, użyj dostarczonego skryptu `bao.sh`. Skrypt ten obsługuje następujące czynności:

1. Tworzy systemowego użytkownika i grupę dla OpenBao.
2. Instaluje Go.
3. Instaluje niezbędne zależności.
4. Instaluje NVM, Node.js i Yarn.
5. Klonuje i buduje repozytorium OpenBao.
6. Konfiguruje OpenBao.
7. Generuje certyfikaty SSL.
8. Inicjalizuje i odblokowuje OpenBao.
9. Tworzy niezbędne usługi systemd.

Pobierz i uruchom skrypt jako root:

```bash
curl -O https://raw.githubusercontent.com/sysadmin-info/openbao/main/openbao.sh
```

Zamień `<IP address or URL>` na rzeczywisty adres IP lub URL i uruchom go przed uruchomieniem skryptu. Zobacz przykład poniżej:

```bash
sed -i 's|<IP address or URL>|10.10.0.126|g' openbao.sh
```

Uczyń plik wykonywalnym:

```bash
chmod +x bao.sh
```

Uruchom skrypt z sudo:

```bash
sudo ./bao.sh
```

Skrypt obsługuje wszystkie kroki opisane poniżej. Jeśli jednak wolisz zrozumieć każdy krok lub uruchomić je ręcznie, postępuj zgodnie ze szczegółowym przewodnikiem.

### Szczegółowe kroki instalacji

#### Krok 1: Tworzenie użytkownika i konfiguracja środowiska

Skrypt sprawdzi, czy użytkownik `openbao` istnieje i utworzy go, jeśli to konieczne. Upewni się również, że środowisko jest odpowiednio skonfigurowane dla użytkownika `openbao`, w tym skopiowanie `.bashrc` i `.profile` z `/etc/skel`, jeśli nie są obecne.

#### Krok 2: Instalacja Go

1. **Pobierz i zainstaluj Go**:

    ```bash
    wget https://go.dev/dl/go1.22.4.linux-amd64.tar.gz
    sudo tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz
    sudo mkdir -p /var/lib/openbao
    sudo touch /var/lib/openbao/.profile
    echo "export PATH=\$PATH:/usr/local/go/bin" | sudo tee -a /var/lib/openbao/.profile
    sudo chown -R openbao:openbao /var/lib/openbao
    ```

#### Krok 3: Instalacja zależności

1. **Zainstaluj wymagane pakiety**:

    ```bash
    sudo apt install -y git make curl gnupg2
    ```

2. **Skonfiguruj NVM, Node.js i Yarn dla użytkownika openbao**:

    ```bash
    sudo -u openbao -H bash -c 'cd /var/lib/openbao && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash'
    sudo -u openbao -H bash -c 'export NVM_DIR="/var/lib/openbao/.nvm" && cd /var/lib/openbao && source $NVM_DIR/nvm.sh && nvm install 22'
    sudo -u openbao -H bash -c 'export NVM_DIR="/var/lib/openbao/.nvm" && cd /var/lib/openbao && source $NVM_DIR/nvm.sh && npm config set prefix /var/lib/openbao/.npm-global && npm install -g yarn'
    sudo -u openbao -H bash -c 'echo "export PATH=/var/lib/openbao/.npm-global/bin:\$PATH" >> /var/lib/openbao/.profile'
    ```

#### Krok 4: Klonowanie i budowanie OpenBao

1. **Sklonuj repozytorium OpenBao**:

    ```bash
    sudo mkdir -p /var/lib/openbao/src/github.com/openbao
    sudo chown -R openbao:openbao /var/lib/openbao/src/github.com
    cd /var/lib/openbao/src/github.com/openbao
    sudo -u openbao git clone https://github.com/openbao/openbao.git
    ```

2. **Zbuduj OpenBao**:

    ```bash
    sudo -u openbao -H bash -c 'source /var/lib/openbao/.profile && cd /var/lib/openbao/src/github.com/openbao/openbao && export NVM_DIR="/var/lib/openbao/.nvm" && source $NVM_DIR/nvm.sh && nvm use --delete-prefix v22.3.0 --silent && export NODE_OPTIONS="--max_old_space_size=4096" && make bootstrap'
    sudo -u openbao -H bash -c 'source /var/lib/openbao/.profile && cd /var/lib/openbao/src/github.com/openbao/openbao && export NVM_DIR="/var/lib/openbao/.nvm" && source $NVM_DIR/nvm.sh && nvm use --delete-prefix v22.3.0 --silent && make static-dist dev-ui'
    sudo mv /var/lib/openbao/src/github.com/openbao/openbao/bin/bao /usr/local/bin/openbao
    ```

#### Krok 5: Konfiguracja OpenBao

1. **Utwórz katalog i plik konfiguracyjny**:

    ```bash
    sudo mkdir -p /var/lib/openbao/config
    cat << 'EOF' | sudo tee /var/lib/openbao/config/config.hcl
    ui = true
    cluster_addr  = "https://10.10.0.126:8201"
    api_addr      = "https://10.10.0.126:8200"
    disable_mlock = true
    storage "file" {
      path = "/var/lib/openbao/data"
    }
    listener "tcp" {
      address       = "10.10.0.126:8200"
      tls_cert_file = "/var/lib/openbao/tls/tls.crt"
      tls_key_file  = "/var/lib/openbao/tls/tls.key"
    }
    EOF
    sudo mkdir -p /var/lib/openbao/data
    sudo chown -R openbao:openbao /var/lib/openbao/data
    sudo chmod -R 755 /var/lib/openbao/data
    ```

#### Krok 6: Generowanie certyfikatów SSL

1. **Utwórz plik konfiguracyjny OpenSSL**:

    ```bash
    cat << 'EOF' | sudo tee /var/lib/openbao/openssl.cnf
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
    CN = 10.10.0.126
    [req_ext]
    subjectAltName = @alt_names
    [v3_ca]
    subjectAltName = @alt_names
    basicConstraints = critical, CA:true
    [alt_names]
    IP.1 = 10.10.0.126
    EOF
    ```

2. **Generowanie klucza prywatnego i certyfikatu**:

    ```bash
    sudo openssl genpkey -algorithm RSA -out /var/lib/openbao/tls.key
    sudo openssl req -new -x509 -days 365 -key /var/lib/openbao/tls.key -out /var/lib/openbao/tls.crt -config /var/lib/openbao/openssl.cnf
    sudo mkdir -p /var/lib/openbao/tls
    sudo mv /var/lib/openbao/tls.crt /var/lib/openbao/tls/
    sudo mv /var/lib/openbao/tls.key /var/lib/openbao/tls/
    sudo chown -R openbao:openbao /var/lib/openbao/tls/
    sudo cp /var/lib/openbao/tls/tls.crt /usr/local/share/ca-certificates/openbao.crt


    sudo update-ca-certificates
    ```

#### Krok 7: Inicjalizacja i odblokowanie OpenBao

1. **Inicjalizuj i odblokuj OpenBao**:

    ```bash
    sudo -u openbao -H bash -c 'source /var/lib/openbao/.bashrc && openbao server -config /var/lib/openbao/config/config.hcl &'
    sleep 30
    sudo -u openbao -H bash -c 'source /var/lib/openbao/.bashrc && openbao operator init > /tmp/init_output.txt'
    ```

2. **Odblokuj OpenBao**:

    ```bash
    UNSEAL_KEYS=$(grep 'Unseal Key' /tmp/init_output.txt | awk '{print $NF}')
    echo "$UNSEAL_KEYS" > /tmp/unseal_keys.txt
    for key in $(cat /tmp/unseal_keys.txt); do
        openbao operator unseal $key
    done
    ```

#### Krok 8: Tworzenie usług systemd

1. **Utwórz `openbao.service` i `openbao-unseal.service`**:

    ```bash
    cat << 'EOF' | sudo tee /etc/systemd/system/openbao.service
    [Unit]
    Description=OpenBao
    Documentation=https://github.com/openbao/openbao
    Requires=network-online.target
    After=network-online.target
    Requires=openbao-unseal.service
    [Service]
    User=openbao
    Group=openbao
    EnvironmentFile=/etc/openbao.d/openbao.env
    ExecStart=/usr/local/bin/openbao server -config=/var/lib/openbao/config/config.hcl
    ExecReload=/bin/kill --signal HUP $MAINPID
    KillMode=process
    KillSignal=SIGINT
    Restart=on-failure
    RestartSec=5
    LimitNOFILE=65536
    LimitMEMLOCK=infinity
    [Install]
    WantedBy=multi-user.target
    EOF

    cat << 'EOF' | sudo tee /etc/systemd/system/openbao-unseal.service
    [Unit]
    Description=Odblokuj OpenBao
    After=openbao.service
    Requires=openbao.service
    [Service]
    Type=oneshot
    ExecStart=/usr/local/bin/unseal_openbao.sh
    Environment=VAULT_ADDR=https://10.10.0.126:8200
    Environment=DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus
    [Install]
    WantedBy=multi-user.target
    EOF

    sudo systemctl daemon-reload
    sudo systemctl enable openbao-unseal.service
    sudo systemctl enable openbao.service
    sudo systemctl start openbao.service
    ```

### Dostosowywanie konfiguracji

- **Ustawienia serwera**: Dostosuj adres serwera, port i ustawienia UI.
- **Ustawienia przechowywania**: Skonfiguruj backend przechowywania zgodnie z wymaganiami (np. plik, baza danych itp.).
- **Ustawienia API**: Ustaw adres i port API.
- **Ustawienia logowania**: Określ poziom logowania i lokalizację plików.
- **Ustawienia bezpieczeństwa**: Skonfiguruj uwierzytelnianie i ustawienia bezpieczeństwa.

Zapoznaj się z dokumentacją OpenBao, aby uzyskać bardziej szczegółowe opcje konfiguracji i przykłady. Ten przykład zapewnia punkt wyjścia i powinien być dostosowany do Twoich specyficznych wymagań i środowiska. Jeśli potrzebujesz dalszej pomocy lub konkretnych opcji konfiguracji, nie wahaj się zapytać!

### Konfiguracja GitLab

1. **Zdefiniuj zmienne środowiskowe w GitLab CI/CD**:

    Dodaj zmienne CI/CD w GitLabie:

    - `VAULT_ADDR` = `https://10.10.0.126:8200`
    - `VAULT_TOKEN` = `<vault_token>`

2. **Konfiguracja `.gitlab-ci.yml`**:

    ```yaml
    stages:
      - test

    variables:
      VAULT_ADDR: "https://10.10.0.126:8200"

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

#### Podsumowanie

Powyższe kroki obejmują instalację Go, pobieranie i budowanie OpenBao z interfejsem użytkownika, konfigurowanie OpenBao i integrację z GitLabem. Pozwala to na bezpieczne przechowywanie i zarządzanie sekretami używanymi w Twoich pipeline'ach CI/CD.

#### Wideo z przewodnikiem

{{<youtube >}}
