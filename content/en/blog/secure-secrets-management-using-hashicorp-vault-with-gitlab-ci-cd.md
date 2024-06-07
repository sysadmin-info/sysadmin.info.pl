---
title: Secure Secrets Management - Using HashiCorp Vault with GitLab CI/CD
date: 2024-06-07T13:00:00+00:00
description: Secure Secrets Management - Using HashiCorp Vault with GitLab CI/CD
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

**Here is a video tutorial**

{{<youtube>}}

## Introduction

Below is an integrated tutorial covering the installation of HashiCorp Vault on a separate server and its integration with GitLab Runners. This ensures secure storage and management of secrets and their utilization in GitLab CI/CD pipelines.

### Installing HashiCorp Vault on a Separate Server

1. **Install Vault**:

    On a Linux server, execute the following steps:

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

2. **Configure Vault**:

    Create the Vault configuration file (`config.hcl`):

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

    Ensure that the directory `/path/to/vault/data` exists and has appropriate permissions.

3. **Start Vault**:

    ```bash
    vault server -config=config.hcl
    ```

    Vault will now be running at `http://<vault_server_ip>:8200`.

4. **Initialize and Unseal Vault**:

    In a new terminal, execute the following commands:

    ```bash
    export VAULT_ADDR='http://<vault_server_ip>:8200'
    
    # Initialize Vault
    vault operator init

    # Save the keys and root token generated during initialization
    ```

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

1. **Create a Policy and Secret in Vault**:

    Create the policy file `gitlab-policy.hcl`:

    ```hcl
    path "secret/data/gitlab/*" {
      capabilities = ["create", "read", "update", "delete", "list"]
    }
    ```

    Load the policy into Vault:

    ```bash
    vault policy write gitlab-policy gitlab-policy.hcl
    ```

    Create a secret for GitLab:

    ```bash
    vault secrets enable -path=secret kv-v2
    
    vault kv put secret/gitlab/database username="my-username" password="my-password"
    ```

2. **Create an Access Token for GitLab**:

    ```bash
    vault token create -policy=gitlab-policy -period=24h
    ```

    Save the generated token.

### Configuring GitLab Runners

1. **Install `vault` on the Runners**:

    On each GitLab runner, install `vault`:

    ```bash
    curl -O https://releases.hashicorp.com/vault/1.10.4/vault_1.10.4_linux_amd64.zip
    unzip vault_1.10.4_linux_amd64.zip
    sudo mv vault /usr/local/bin/
    vault --version
    ```

2. **Define Environment Variables in GitLab CI/CD**:

    Add the environment variables to the CI/CD configuration in GitLab:

    - `VAULT_ADDR` = `http://<vault_server_ip>:8200`
    - `VAULT_TOKEN` = `<vault_token>`

3. **Configure `.gitlab-ci.yml`**:

    Add steps to the `.gitlab-ci.yml` file:

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
        - echo "Fetching secrets from Vault"
        - export VAULT_TOKEN=$(cat /tmp/.vault-token)
        - secrets=$(vault kv get -format=json secret/gitlab/database)
        - export DB_USERNAME=$(echo $secrets | jq -r '.data.data.username')
        - export DB_PASSWORD=$(echo $secrets | jq -r '.data.data.password')
        - echo "Using fetched secrets"
        - echo "DB_USERNAME: $DB_USERNAME"
        - echo "DB_PASSWORD: $DB_PASSWORD"
    ```

### Summary

Installing Vault on a separate server provides greater flexibility and scalability in managing secrets. With this tutorial, you have configured Vault to securely store and manage secrets and integrated it with GitLab, allowing secure use of these secrets in CI/CD pipelines. Ensure that the network configuration and security settings are appropriately configured to allow secure connections between GitLab runners and Vault.