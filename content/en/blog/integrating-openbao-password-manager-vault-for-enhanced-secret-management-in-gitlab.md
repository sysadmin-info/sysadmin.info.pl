---
title: Integrating OpenBao Password Manager Vault for Enhanced Secret Management in GitLab
date: 2024-06-27T18:10:00+00:00
description: Integrating OpenBao Password Manager Vault for Enhanced Secret Management in GitLab
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
    image: images/2024-thumbs/gitlab07.webp
---

### Integrating OpenBao Password Manager Vault for Enhanced Secret Management in GitLab

#### Prerequisites

Ensure you have root privileges before starting the installation.

#### Automated Installation Script

To automate the installation and configuration of OpenBao, use the provided script `bao.sh`. This script handles the following:

1. Creates a system user and group for OpenBao.
2. Installs Go.
3. Installs necessary dependencies.
4. Installs NVM, Node.js, and Yarn.
5. Clones and builds the OpenBao repository.
6. Configures OpenBao.
7. Generates SSL certificates.
8. Initializes and un

seals OpenBao.
9. Creates necessary systemd services.

Download and run the script as root:

```bash
curl -O https://raw.githubusercontent.com/sysadmin-info/openbao/main/openbao.sh
```

Replace `<IP address or URL>` with real IP address or URL and run it before you will run the script. See eg. below:

```bash
sed -i 's|<IP address or URL>|10.10.0.126|g' openbao.sh
```

Make the file executable:

```bash
chmod +x bao.sh
```

Run the script with sudo:

```bash
sudo ./bao.sh
```

The script handles all the steps detailed below. However, if you prefer to understand each step or run them manually, follow the detailed guide.

### Detailed Installation Steps

#### Step 1: Create User and Setup Environment

The script will check if the `openbao` user exists and create it if necessary. It also ensures the environment is properly set up for the `openbao` user, including copying `.bashrc` and `.profile` from `/etc/skel` if not present.

#### Step 2: Install Go

1. **Download and install Go**:

    ```bash
    wget https://go.dev/dl/go1.22.4.linux-amd64.tar.gz
    sudo tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz
    sudo mkdir -p /var/lib/openbao
    sudo touch /var/lib/openbao/.profile
    echo "export PATH=\$PATH:/usr/local/go/bin" | sudo tee -a /var/lib/openbao/.profile
    sudo chown -R openbao:openbao /var/lib/openbao
    ```

#### Step 3: Install Dependencies

1. **Install required packages**:

    ```bash
    sudo apt install -y git make curl gnupg2
    ```

2. **Setup NVM, Node.js, and Yarn for the openbao user**:

    ```bash
    sudo -u openbao -H bash -c 'cd /var/lib/openbao && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash'
    sudo -u openbao -H bash -c 'export NVM_DIR="/var/lib/openbao/.nvm" && cd /var/lib/openbao && source $NVM_DIR/nvm.sh && nvm install 22'
    sudo -u openbao -H bash -c 'export NVM_DIR="/var/lib/openbao/.nvm" && cd /var/lib/openbao && source $NVM_DIR/nvm.sh && npm config set prefix /var/lib/openbao/.npm-global && npm install -g yarn'
    sudo -u openbao -H bash -c 'echo "export PATH=/var/lib/openbao/.npm-global/bin:\$PATH" >> /var/lib/openbao/.profile'
    ```

#### Step 4: Clone and Build OpenBao

1. **Clone the OpenBao repository**:

    ```bash
    sudo mkdir -p /var/lib/openbao/src/github.com/openbao
    sudo chown -R openbao:openbao /var/lib/openbao/src/github.com
    cd /var/lib/openbao/src/github.com/openbao
    sudo -u openbao git clone https://github.com/openbao/openbao.git
    ```

2. **Build OpenBao**:

    ```bash
    sudo -u openbao -H bash -c 'source /var/lib/openbao/.profile && cd /var/lib/openbao/src/github.com/openbao/openbao && export NVM_DIR="/var/lib/openbao/.nvm" && source $NVM_DIR/nvm.sh && nvm use --delete-prefix v22.3.0 --silent && export NODE_OPTIONS="--max_old_space_size=4096" && make bootstrap'
    sudo -u openbao -H bash -c 'source /var/lib/openbao/.profile && cd /var/lib/openbao/src/github.com/openbao/openbao && export NVM_DIR="/var/lib/openbao/.nvm" && source $NVM_DIR/nvm.sh && nvm use --delete-prefix v22.3.0 --silent && make static-dist dev-ui'
    sudo mv /var/lib/openbao/src/github.com/openbao/openbao/bin/bao /usr/local/bin/openbao
    ```

#### Step 5: Configure OpenBao

1. **Create configuration directory and file**:

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

#### Step 6: Generate SSL Certificates

1. **Create OpenSSL configuration file**:

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

2. **Generate private key and certificate**:

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

#### Step 7: Initialize and Unseal OpenBao

1. **Initialize and unseal OpenBao**:

    ```bash
    sudo -u openbao -H bash -c 'source /var/lib/openbao/.bashrc && openbao server -config /var/lib/openbao/config/config.hcl &'
    sleep 30
    sudo -u openbao -H bash -c 'source /var/lib/openbao/.bashrc && openbao operator init > /tmp/init_output.txt'
    ```

2. **Unseal OpenBao**:

    ```bash
    UNSEAL_KEYS=$(grep 'Unseal Key' /tmp/init_output.txt | awk '{print $NF}')
    echo "$UNSEAL_KEYS" > /tmp/unseal_keys.txt
    for key in $(cat /tmp/unseal_keys.txt); do
        openbao operator unseal $key
    done
    ```

#### Step 8: Create Systemd Services

1. **Create `openbao.service` and `openbao-unseal.service`**:

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
    Description=Unseal OpenBao
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

### Customizing the Configuration

- **Server Settings**: Adjust the server address, port, and UI settings.
- **Storage Settings**: Configure the storage backend as required (e.g., file, database, etc.).
- **API Settings**: Set the API address and port.
- **Logging Settings**: Specify the log level and file location.
- **Security Settings**: Configure authentication and security settings.

Refer to the OpenBao documentation for more detailed configuration options and examples. This example provides a starting point and should be tailored to your specific requirements and environment. If you need further assistance or specific configuration options, feel free to ask!

### GitLab Configuration

1. **Define environment variables in GitLab CI/CD**:

    Add CI/CD variables in GitLab:

    - `VAULT_ADDR` = `https://10.10.0.126:8200`
    - `VAULT_TOKEN` = `<vault_token>`

2. **Configure `.gitlab-ci.yml`**

#### Summary

The above steps cover the installation of Go, downloading and building OpenBao with the user interface, configuring OpenBao, and integrating it with GitLab. This allows you to securely store and manage secrets used in your CI/CD pipelines.

#### Walkthrough video

{{<youtube hweJTAiD-iA>}}
