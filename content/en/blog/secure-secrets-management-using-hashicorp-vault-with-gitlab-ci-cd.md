---
title: Secure Secrets Management - Using HashiCorp Vault with GitLab CI/CD
date: 2024-06-14T08:00:00+00:00
description: Secure Secrets Management - Using HashiCorp Vault with GitLab CI/CD
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
    image: images/2024-thumbs/gitlab04.webp
---

**Here is a video tutorial**

{{<youtube HHuRUZCUs-0>}}

## Introduction

Below is an integrated tutorial covering the installation of HashiCorp Vault on a separate server and its integration with GitLab Runners. This will ensure secure storage of secrets and their use in GitLab CI/CD pipelines.

[HashiCorp Vault Documentation](https://developer.hashicorp.com/vault/install?product_intent=vault)

### Installing HashiCorp Vault on a Separate Server

1. **Install Vault**:

    On a Linux server, execute the following steps:

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

2. **Reconfigure Certificate for Vault**:

The error "tls: failed to verify certificate: x509: cannot validate certificate for 10.10.0.150 because it doesn't contain any IP SANs" means that the SSL certificate used by Vault does not include the IP information in the Subject Alternative Name (SAN) field. It is recommended to generate a correct SSL certificate with the appropriate SAN field. After performing these steps, Vault should correctly accept HTTPS connections and allow further configuration and initialization.

2a. **Create an OpenSSL Configuration File for Certificate with IP SAN**

You need to generate a new certificate that includes the IP address as a SAN.

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
   CN = 10.10.0.150

   [req_ext]
   subjectAltName = @alt_names

   [v3_ca]
   subjectAltName = @alt_names
   basicConstraints = critical, CA:true

   [alt_names]
   IP.1 = 10.10.0.150
   ```

2b. **Generate a New Private Key and Certificate**

Use the following commands to generate a new private key and certificate:

   ```bash
   openssl genpkey -algorithm RSA -out tls.key
   ```

   ```bash
   openssl req -new -x509 -days 365 -key tls.key -out tls.crt -config openssl.cnf
   ```

2c. **Update Vault Certificate Files**

   Copy the newly generated `tls.key` and `tls.crt` files to the appropriate directory (e.g., `/opt/vault/tls/`):

   ```bash
   sudo mv tls.crt /opt/vault/tls/tls.crt
   sudo mv tls.key /opt/vault/tls/tls.key
   sudo chown -R vault:vault /opt/vault/tls/
   ```

3. **Configure Vault**:

    Check the Vault configuration file (`vault.hcl`) in the `/etc/vault.d` directory:

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

    Ensure that the `/opt/vault/data` directory exists and has the appropriate permissions.

4. **Update Trusted Certificates**

   Copy the certificate to the appropriate location and update the trusted certificate store:

   ```bash
   sudo cp /opt/vault/tls/tls.crt /usr/local/share/ca-certificates/vault.crt
   sudo update-ca-certificates
   ```

5. **Vault Environment File:**

   Create the `vault.env` file in `/etc/vault.d/` with the appropriate environment variables.

   ```sh
   VAULT_ADDR=https://<vault_server_ip>
   DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus
   ```

### Create Systemd Service File

6. **Create Systemd Service File:**

   Create the `vault.service` file in the `/etc/systemd/system/` directory:

   ```bash
   sudo vim /etc/systemd/system/vault.service
   ```

7. **Add the Following Configuration to the `vault.service` File:**

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

### Configure User and Permissions

8. **Create User and Group for Vault if needed - by default it is created:**

   ```bash
   sudo useradd --system --home /var/lib/vault --shell /bin/false vault
   ```

9. **Set Appropriate Permissions for Directories:**

   ```bash
   sudo mkdir -p /var/lib/vault /opt/vault/data
   sudo chown -R vault:vault /var/lib/vault /opt/vault/data
   sudo chown -R vault:vault /etc/vault.d
   sudo chmod 640 /etc/vault.d/vault.hcl
   ```

### Start and Check Service Status

10. **Update Systemd to Load the New Service:**

   ```bash
   sudo systemctl daemon-reload
   ```

11. **Enable Vault Service to Start Automatically on System Boot:**

   ```bash
   sudo systemctl enable vault
   ```

12. **Start Vault Service:**

   ```bash
   sudo systemctl start vault
   ```

13. **Check Vault Service Status:**

   ```bash
   sudo systemctl status vault
   ```

    Vault will now run at `https://<vault_server_ip>:8200`.

### Initializing Vault

14. **Initialize and Unseal Vault**:

    In a new terminal, run the following commands:

    ```bash
    echo "export VAULT_ADDR='https://<vault_server_ip>:8200'" >> ~/.bashrc    
    source ~/.bashrc
    ```

    ### Solve the problem with DBUS_SESSION_BUS_ADDRESS

    When you run the command `sudo journalctl -u vault.service` you see warn:

    ```bash
    WARN[0000]log.go:244 gosnowflake.(*defaultLogger).Warn DBUS_SESSION_BUS_ADDRESS envvar looks to be not set, this can lead to runaway dbus-daemon processes. To avoid this, set envvar DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus (if it exists) or DBUS_SESSION_BUS_ADDRESS=/dev/null.
    ```

    The warning message `DBUS_SESSION_BUS_ADDRESS envvar looks to be not set, this can lead to runaway dbus-daemon processes` indicates that the `DBUS_SESSION_BUS_ADDRESS` environment variable is not set. This can lead to runaway dbus-daemon processes, which might cause resource issues.

    To solve this problem, you need to set the `DBUS_SESSION_BUS_ADDRESS` environment variable in `.bashrc` file.

    ```bash
    echo "export DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus" >> ~/.bashrc
    source ~/.bashrc
    ```
    
    Initialize Vault

    ```bash
    vault operator init
    ```

    Save the keys and root token generated during initialization

    You will receive several unseal keys and one root token. Save them in a secure place.

    ```bash
    # Unseal Vault using the unseal keys
    vault operator unseal <unseal_key_1>
    vault operator unseal <unseal_key_2>
    vault operator unseal <unseal_key_3>
    ```

    Log in using the root token:

    ```bash
    vault login <root_token>
    ```

### Configuring HashiCorp Vault

15. **Create Policy and Secret in Vault**:

    Create a policy file `gitlab-policy.hcl` in any location on the server, e.g., in the root directory:

    ```bash
    sudo vim /root/gitlab-policy.hcl
    ```
    Add the policy content to the file:

    ```hcl
    path "secret/data/gitlab/*" {
      capabilities = ["create", "read", "update", "delete", "list"]
    }
    ```

    Save the file and close the editor.

    Load the policy into Vault:

    ```bash
    vault policy write gitlab-policy gitlab-policy.hcl
    ```

    Create secrets for the AWX and ArgoCD applications tested in GitLab:

    ```bash
    vault secrets enable -path=secret kv-v2
    vault kv put secret/gitlab/awx login="admin" password='adminpassword'
    vault kv put secret/gitlab/argocd login="admin" password='adminpassword'
    ```

16. **Create Access Token for GitLab**:

    ```bash
    vault token create -policy=gitlab-policy -period=24h
    ```

    Save the generated token.

### Configuring GitLab CI/CD

17. **Define Environment Variables in CI/CD Project Settings**:

    - `VAULT_ADDR` = `https://<vault_server_ip>:8200`
    - `VAULT_TOKEN` = `<vault_token>`

If you add the VAULT_TOKEN and VAULT_ADDR environment variables in the CI/CD project settings in GitLab, you do not need to declare them again in the .gitlab-ci.yml file. GitLab will automatically pass these variables to all jobs in the pipeline.

### Add Vault Certificate in GitLab Runners

18. **Download SSL Certificate from Vault**:
   
   First, download the SSL certificate used by Vault:

   ```bash
   echo -n | openssl s_client -connect 10.10.0.150:8200 | openssl x509 > vault.crt
   ```

19. **Add Certificate to Trusted Certificates**:

   Copy the downloaded certificate to the system's trusted certificates:

   **On the machine trying to connect to Vault (e.g., GitLab):**

   ```bash
   sudo cp vault.crt /usr/local/share/ca-certificates/
   sudo update-ca-certificates
   ```

### Check Connection

20. **Check Connection to Vault Using OpenSSL**:

   ```bash
   openssl s_client -connect 10.10.0.150:8200 -CAfile /usr/local/share/ca-certificates/vault.crt
   ```

21. **Check Connection to Vault Using curl**:

```bash
curl --cacert /usr/local/share/ca-certificates/vault.crt https://10.10.0.150:8200/v1/sys/health
```

22. **Configure `.gitlab-ci.yml`**:

```yaml
variables:
  # Defines repository URL
  REPO_URL: 'git@gitlab.sysadmin.homes:developers/taiko.git'
  # Defines branch to use
  BRANCH: 'main'
  # Path to store reports
  REPORT_PATH: '/workspace'
  # Report name
  REPORT_NAME: 'TAIKO_AUTOMATED_TESTS'
  # Docker image to use
  DOCKER_IMAGE: "taiko"
  # Git strategy to use
  GIT_STRATEGY: clone
  # Skips Chromium download for Taiko
  TAIKO_SKIP_CHROMIUM_DOWNLOAD: "true"

stages:
  # Defines stages for CI/CD pipeline
  - clean
  - build_and_test
  - cleanup

before_script:
  # Checks if ssh-agent is installed, if not, installs openssh-client
  - 'which ssh-agent || ( apk update && apk add openssh-client )'
  # Starts ssh-agent in the background
  - eval $(ssh-agent -s)
  # Creates .ssh directory if it doesn't exist
  - mkdir -p ~/.ssh
  # Sets permissions of .ssh directory to 700
  - chmod 700 ~/.ssh
  # Creates an empty known_hosts file if it doesn't exist
  - touch ~/.ssh/known_hosts
  # Sets permissions of known_hosts file to 644
  - chmod 644 ~/.ssh/known_hosts
  # Adds private key from environment variable to file and removes carriage return characters  
  - echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_ed25519
  # Sets permissions of private key file to 400
  - chmod 400 ~/.ssh/id_ed25519
  # Adds private key to ssh-agent
  - ssh-add ~/.ssh/id_ed25519
  # Creates SSH configuration file with settings for GitLab host
  - echo -e "Host gitlab.sysadmin.homes\n\tUser git\n\tHostname gitlab.sysadmin.homes\n\tIdentityFile ~/.ssh/id_ed25519\n\tIdentitiesOnly yes\n\tStrictHostKeyChecking no" > ~/.ssh/config
  # Adds GitLab server IP address to /etc/hosts
  - echo "10.10.0.119 gitlab.sysadmin.homes" >> /etc/hosts
  # Installs OpenSSL, jq, and curl if not already installed
  - apk add --no-cache openssl jq curl
  # Downloads SSL certificate from GitLab server and saves it to a file
  - echo -n | openssl s_client -connect gitlab.sysadmin.homes:443 -servername gitlab.sysadmin.homes | openssl x509 > gitlab.crt
  # Copies the downloaded certificate to the trusted certificates directory
  - cp gitlab.crt /usr/local/share/ca-certificates/gitlab.crt
  # Downloads SSL certificate from HashiCorp Vault server and saves it to a file
  - echo -n | openssl s_client -connect 10.10.0.150:8200 -servername 10.10.0.150 | openssl x509 > vault.crt
  # Copies the downloaded certificate to the trusted certificates directory
  - cp vault.crt /usr/local/share/ca-certificates/vault.crt
  # Updates the trusted certificates list
  - update-ca-certificates
  # Exports AWX credentials from HashiCorp Vault
  - |
    export AWX_SECRET=$(curl --silent --header "X-Vault-Token: $VAULT_TOKEN" $VAULT_ADDR/v1/secret/data/gitlab/awx)
    export AWX_USERNAME=$(echo $AWX_SECRET | jq -r '.data.data.login')
    export AWX_PASSWORD=$(echo $AWX_SECRET | jq -r '.data.data.password')
  # Exports ArgoCD credentials from HashiCorp Vault
  - |
    export ARGOCD_SECRET=$(curl --silent --header "X-Vault-Token: $VAULT_TOKEN" $VAULT_ADDR/v1/secret/data/gitlab/argocd)
    export ARGOCD_USERNAME=$(echo $ARGOCD_SECRET | jq -r '.data.data.login')
    export ARGOCD_PASSWORD=$(echo $ARGOCD_SECRET | jq -r '.data.data.password')
  
  # The NPM_USER and NPM_PASS variables are not properly passed to the Dockerfile when exported in the before_script section. 
  # Docker builds the image before running the before_script, so these variables are not available when building the Docker image. 
  # To solve this problem, the NPM_USER and NPM_PASS variables should be defined as CI/CD variables at the project level in GitLab, 
  # and then passed as arguments when building the Docker image.

build_and_test_awx:
  stage: build_and_test
  tags:
    # Use runner with tag 'docker1'
    - docker1
  image: docker:latest
  services:
    # Use Docker-in-Docker service
    - name: docker:dind
  variables:
    # Use overlay2 driver for Docker
    DOCKER_DRIVER: overlay2
    # Set Docker host
    DOCKER_HOST: "tcp://docker:2375"
    # Disable TLS certificates directory for Docker
    DOCKER_TLS_CERTDIR: ""
  script:
    # Clone repository
    - git clone --single-branch --branch $BRANCH $REPO_URL
    # Build Docker image with NPM credentials
    - docker build --build-arg NPM_USER="${NPM_USER}" --build-arg NPM_PASS="${NPM_PASS}" -t $DOCKER_IMAGE -f Dockerfile .
    # Run tests inside Docker container
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
    # Archive reports if they exist
    - if [ -d "${CI_PROJECT_DIR}/reports/" ]; then
        formattedDate=$(date +"%d_%m_%Y_%H_%M");
        filename="PASS_${REPORT_NAME}_${formattedDate}_AWX.tar";
        tar -cf ${filename} ${CI_PROJECT_DIR}/reports/ ${CI_PROJECT_DIR}/logs/;
        mv ${filename} ${CI_PROJECT_DIR}/;
      fi
    # Clean up Docker system
    - docker system prune -af
    # Clean up Docker volumes
    - docker volume prune -f
  artifacts:
    # Define artifact paths
    paths:
      - "${CI_PROJECT_DIR}/*.tar"

build_and_test_argocd:
  stage: build_and_test
  tags:
    # Use runner with tag 'docker2'
    - docker2
  image: docker:latest
  services:
    # Use Docker-in-Docker service
    - name: docker:dind
  variables:
    # Use overlay2 driver for Docker
    DOCKER_DRIVER: overlay2
    # Set Docker host
    DOCKER_HOST: "tcp://docker:2375"
    # Disable TLS certificates directory for Docker
    DOCKER_TLS_CERTDIR: ""
  script:
    # Clone repository
    - git clone --single-branch --branch $BRANCH $REPO_URL
    # Build Docker image with NPM credentials
    - docker build --build-arg NPM_USER="${NPM_USER}" --build-arg NPM_PASS="${NPM_PASS}" -t $DOCKER_IMAGE -f Dockerfile .
    # Run tests inside Docker container
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
    # Archive reports if they exist
    - if [ -d "${CI_PROJECT_DIR}/reports/" ]; then
        formattedDate=$(date +"%d_%m_%Y_%H_%M");
        filename="PASS_${REPORT_NAME}_${formattedDate}_ArgoCD.tar";
        tar -cf ${filename} ${CI_PROJECT_DIR}/reports/ ${CI_PROJECT_DIR}/logs/;
        mv ${filename} ${CI_PROJECT_DIR}/;
      fi
    # Clean up Docker system
    - docker system prune -af
    # Clean up Docker volumes
    - docker volume prune -f
  artifacts:
    # Define artifact paths
    paths:
      - "${CI_PROJECT_DIR}/*.tar"

clean_workspace:
  stage: cleanup
  parallel:
    matrix:
      # Use runners with tag 'docker1' and 'docker2'
      - RUNNER: docker1
      - RUNNER: docker2
  tags:
    - ${RUNNER}
  script:
    # Clean up workspace directory
    - rm -rf $CI_PROJECT_DIR/*
```

### Summary

Installing Vault on a separate server provides greater flexibility and scalability in managing secrets. With the above tutorial, you have configured Vault to securely store and manage secrets, and integrated it with GitLab, enabling secure use of these secrets in CI/CD pipelines. Ensure that network configuration and security settings are properly configured to allow secure connections between GitLab runners and Vault.