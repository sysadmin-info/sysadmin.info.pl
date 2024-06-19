---
title: Integrating OpenBao Password Manager Vault for Enhanced Secret Management in GitLab
date: 2024-06-19T08:00:00+00:00
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
  wget https://go.dev/dl/go1.20.5.linux-amd64.tar.gz  # Check the latest version on the Go website
  sudo tar -C /usr/local -xzf go1.20.5.linux-amd64.tar.gz

  # Add Go to the system path
  echo "export PATH=$PATH:/usr/local/go/bin" >> ~/.profile
  source ~/.profile

  # Verify the installation
  go version
  ```

#### Step 2: Install OpenBao

1. **Clone the OpenBao repository**:

    ```bash
    git clone https://github.com/openbao/openbao.git
    cd openbao
    ```

2. **Build OpenBao with the user interface**:

    ```bash
    make static-dist dev-ui
    ```

3. **Move the binary to the system path**:

    ```bash
    sudo mv bin/vault /usr/local/bin/openbao
    openbao --version
    ```

#### Step 3: Configure OpenBao

1. **Create the configuration file `config.hcl`**:

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

2. **Run OpenBao**:

    ```bash
    openbao server -config=config.hcl
    ```

3. **Initialize and unseal OpenBao**:

    ```bash
    export VAULT_ADDR='http://127.0.0.1:8200'
    openbao operator init

    # Save the unseal keys and root token generated during initialization

    openbao operator unseal <unseal_key_1>
    openbao operator unseal <unseal_key_2>
    openbao operator unseal <unseal_key_3>
    openbao login <root_token>
    ```

#### Step 4: Configure Policies and Secrets

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

    - `VAULT_ADDR` = `http://127.0.0.1:8200`
    - `VAULT_TOKEN` = `<vault_token>`

3. **Configure `.gitlab-ci.yml`**:

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
        - echo "Fetching secrets from OpenBao"
        - export VAULT_TOKEN=$(cat /tmp/.vault-token)
        - secrets=$(openbao kv get -format=json secret/gitlab/database)
        - export DB_USERNAME=$(echo $secrets | jq -r '.data.data.username')
        - export DB_PASSWORD=$(echo $secrets | jq -r '.data.data.password')
        - echo "Using fetched secrets"
        - echo "DB_USERNAME: $DB_USERNAME"
        - echo "DB_PASSWORD: $DB_PASSWORD"
    ```

### Summary

The above steps cover the installation of Go, downloading and building OpenBao with the user interface, configuring OpenBao, and integrating it with GitLab. This allows you to securely store and manage secrets used in your CI/CD pipelines.

#### Walkthrough video

{{<youtube >}}