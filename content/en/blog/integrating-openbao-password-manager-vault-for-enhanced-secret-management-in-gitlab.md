---
title: Integrating OpenBao Password Manager Vault for Enhanced Secret Management in GitLab
date: 2024-06-20T13:00:00+00:00
description: Integrating OpenBao Password Manager Vault for Enhanced Secret Management in GitLab
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

### Installing OpenBao with User Interface

#### Step 1: Install Go

1. **Download and install Go**

  ```bash
   # Check the latest version on the Go website
  wget https://go.dev/dl/go1.22.4.linux-amd64.tar.gz
  sudo tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz

  # Add Go to the system path
  echo "export PATH=$PATH:/usr/local/go/bin" >> ~/.profile
  source ~/.profile

  # Verify the installation
  go version
  ```

#### Step 2: Install OpenBao

1. **Clone the OpenBao repository**:

    ```bash
    sudo mkdir -p $GOPATH/src/github.com/openbao && cd $_
    sudo apt install -y git
    sudo git clone https://github.com/openbao/openbao.git
    cd openbao
    sudo chown -R $(whoami):$(whoami) $GOPATH/src/github.com/openbao/openbao
    ```

2. **Build OpenBao with the user interface**:

    ```bash
    sudo apt install -y make curl gnupg2
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm 
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
    nvm install 22
    npm install --global yarn
    yarn config set --home enableTelemetry 0
    export NODE_OPTIONS="--max_old_space_size=4096"
    make bootstrap
    make static-dist dev-ui
    ```

3. **Move the binary to the system path**:

    ```bash
    sudo mv bin/bao /usr/local/bin/openbao
    openbao --version
    ```

#### Step 3: Configure OpenBao

1. **Create a directory for the configuration file**:
  
    ```bash
    mkdir -p ~/openbao/config
    cd ~/openbao/config
    ```

#### Step 4: Create the `config.hcl` File

1. **Create and open the `config.hcl` file**:

  ```bash
  vim config.hcl
  ```

#### Step 5: Populate the `config.hcl` File

Here is a basic example of what a `config.hcl` file might look like. Adjust the contents based on your specific needs and the references from the test fixture files you found.

  ```hcl
  # Example OpenBao Configuration

  # Enable or disable the UI
  ui = true
  
  # Server configuration
  cluster_addr  = "https://10.10.0.120:8201"
  api_addr      = "https://10.10.0.120:8200"

  # Disable mlock
  disable_mlock = true

  # Storage configuration
  storage "file" {
    path = "/var/lib/openbao/data"
  }

  # Listener
  listener "tcp" {
    address       = "0.0.0.0:8200"
    tls_cert_file = "/home/adrian/openbao/tls/tls.crt"
    tls_key_file  = "/home/adrian/openbao/tls/tls.key"
  }
  ```

Create a directory for openBAO data.

  ```bash
  sudo mkdir -p /var/lib/openbao/data
  sudo chown -R $(whoami):$(whoami) /var/lib/openbao/data
  sudo chmod -R 755 /var/lib/openbao/data
  ```

#### Step 6: Create an OpenSSL Configuration File for Certificate with IP SAN

1.**You need to generate a new certificate that includes the IP address as a SAN:**

Create a file named `openssl.cnf`:

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
CN = 10.10.0.120

[req_ext]
subjectAltName = @alt_names

[v3_ca]
subjectAltName = @alt_names
basicConstraints = critical, CA:true

[alt_names]
IP.1 = 10.10.0.120
```

2.**Generate a New Private Key and Certificate:**

Use the following commands to generate a new private key and certificate:

   ```bash
   openssl genpkey -algorithm RSA -out tls.key
   ```

   ```bash
   openssl req -new -x509 -days 365 -key tls.key -out tls.crt -config openssl.cnf
   ```

3.**Update Vault Certificate Files:**

   Copy the newly generated `tls.key` and `tls.crt` files to the appropriate directory (e.g., `~/openbao/tls/`):

   ```bash
   sudo mkdir -p ~/openbao/tls
   sudo mv tls.crt ~/openbao/tls/
   sudo mv tls.key ~/openbao/tls/
   sudo chown -R $(whoami):$(whoami) ~/openbao/tls/
   ```

4.**Update Trusted Certificates**

   Copy the certificate to the appropriate location and update the trusted certificate store:

   ```bash
   sudo cp ~/openbao/tls/tls.crt /usr/local/share/ca-certificates/openbao.crt
   sudo update-ca-certificates
   ```

#### Step 7: Start OpenBao with the Configuration File

1. **Run OpenBao with your configuration**:

    ```bash
    openbao server -config ~/openbao/config/config.hcl
    ```

#### Customizing the Configuration

- **Server Settings**: Adjust the server address, port, and UI settings.
- **Storage Settings**: Configure the storage backend as required (e.g., file, database, etc.).
- **API Settings**: Set the API address and port.
- **Logging Settings**: Specify the log level and file location.
- **Security Settings**: Configure authentication and security settings.

Refer to the OpenBao documentation for more detailed configuration options and examples. This example provides a starting point and should be tailored to your specific requirements and environment. If you need further assistance or specific configuration options, feel free to ask!

#### Step 8: Initialize and unseal OpenBao

  ```bash
  export VAULT_ADDR='https://10.10.0.120:8200'
  openbao operator init

  # Save the unseal keys and root token generated during initialization

  openbao operator unseal <unseal_key_1>
  openbao operator unseal <unseal_key_2>
  openbao operator unseal <unseal_key_3>
  openbao login <root_token>
  ```

#### Step 9: Configure Policies and Secrets

1. **Create the `gitlab-policy.hcl` policy**:

    ```hcl
    path "secret/data/gitlab/*" {
      capabilities = ["create", "read", "update", "delete", "list"]
    }
    ```

2. **Load the policy into OpenBao**:

    ```bash
    openbao policy write gitlab-policy gitlab-policy.hcl
    ```

3. **Create a secret for GitLab**:

    ```bash
    openbao secrets enable -path=secret kv-v2
    openbao kv put secret/gitlab/database username="my-username" password="my-password"
    ```

4. **Create an access token for GitLab**:

    ```bash
    openbao token create -policy=gitlab-policy -period=24h
    ```

    Save the generated token.

### GitLab Configuration

1. **Install `openbao` on runners**:

    On each GitLab runner, install `openbao`:

    ```bash
    # Copy the openbao binary to the runners
    scp /usr/local/bin/openbao user@runner:/usr/local/bin/
    ```

2. **Define environment variables in GitLab CI/CD**:

    Add CI/CD variables in GitLab:

    - `VAULT_ADDR` = `https://10.10.0.120:8200`
    - `VAULT_TOKEN` = `<vault_token>`

3. **Configure `.gitlab-ci.yml`**:

    ```yaml
    stages:
      - test

    variables:
      VAULT_ADDR: "https://10.10.0.120:8200"

    before_script:
      - apt-get update -y && apt-get install -y jq
      - echo $VAULT_TOKEN > /tmp/.vault-token

    job:
      stage: test
      script:
        - echo "Fetching secrets from OpenBao"
        - export VAULT_TOKEN=$(cat /tmp/.vault-token)
        - secrets=$(openbao kv get -format=json secret/gitlab/database)
        - export DB_USERNAME=$(echo $secrets | jq -r '.data.data.username')
        - export DB_PASSWORD=$(echo $secrets | jq -r '.data.data.password')
        - echo "Using fetched secrets"
        - echo "DB_USERNAME: $DB_USERNAME"
        - echo "DB_PASSWORD: $DB_PASSWORD"
    ```

#### Summary

The above steps cover the installation of Go, downloading and building OpenBao with the user interface, configuring OpenBao, and integrating it with GitLab. This allows you to securely store and manage secrets used in your CI/CD pipelines.

#### Walkthrough video

{{<youtube >}}
