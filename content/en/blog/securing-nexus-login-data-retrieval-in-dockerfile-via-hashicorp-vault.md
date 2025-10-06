---
title: Securing Nexus login data retrieval in Dockerfile via HashiCorp Vault
date: 2024-06-18T12:00:00+00:00
description: Securing Nexus login data retrieval in Dockerfile via HashiCorp Vault
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

## Introduction

To use HashiCorp Vault for storing and retrieving Nexus (NPM) login data during Docker image building, we need to focus on securely storing these credentials in Vault and then retrieving them inside the Docker container during the build process. The key aspect here is using the `vault` tool in the Docker container to fetch secrets directly during the image build.

### Steps to follow

1.**Storing Nexus (NPM) login data in HashiCorp Vault**.
2.**Modifying `.gitlab-ci.yml`** to fetch this data inside the Docker container.
3.**Modifying Dockerfile** to fetch login data from Vault during image build.

### Step 1: Storing NPM login data in HashiCorp Vault

First, add the Nexus (NPM) login data to HashiCorp Vault.

```bash
vault kv put secret/gitlab/npm NPM_USER="your-npm-username" NPM_PASS="your-npm-password"
```

### Step 2: Modifying `.gitlab-ci.yml`

Update `.gitlab-ci.yml` to fetch login data from Vault and use it in the Docker container.

Here is the updated YAML file with added comments:

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

build_and_test_awx:
  stage: build_and_test
  tags:
    - docker1
  image: docker:latest
  services:
    # Uses Docker-in-Docker service
    - name: docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_HOST: "tcp://docker:2375"
    DOCKER_TLS_CERTDIR: ""
  script:
    # Clones the specified branch from the repository
    - git clone --single-branch --branch $BRANCH $REPO_URL
    # Builds the Docker image with Vault credentials
    - docker build -t $DOCKER_IMAGE --build-arg VAULT_ADDR=$VAULT_ADDR --build-arg VAULT_TOKEN=$VAULT_TOKEN -f Dockerfile .
    # Runs the Docker container and executes the test script for AWX
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
    # Archives the test report if it exists
    - if [ -d "${CI_PROJECT_DIR}/reports/" ]; then
        formattedDate=$(date +"%d_%m_%Y_%H_%M");
        filename="PASS_${REPORT_NAME}_${formattedDate}_AWX.tar";
        tar -cf ${filename} ${CI_PROJECT_DIR}/reports/ ${CI_PROJECT_DIR}/logs/;
        mv ${filename} ${CI_PROJECT_DIR}/;
      fi
    # Cleans up Docker system and volumes
    - docker system prune -af
    - docker volume prune -f
  artifacts:
    # Defines paths to archive artifacts
    paths:
      - "${CI_PROJECT_DIR}/*.tar"

build_and_test_argocd:
  stage: build_and_test
  tags:
    - docker2
  image: docker:latest
  services:
    # Uses Docker-in-Docker service
    - name: docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_HOST: "tcp://docker:2375"
    DOCKER_TLS_CERTDIR: ""
  script:
    # Clones the specified branch from the repository
    - git clone --single-branch --branch $BRANCH $REPO_URL
    # Builds the Docker image with Vault credentials
    - docker build -t $DOCKER_IMAGE --build-arg VAULT_ADDR=$VAULT_ADDR --build-arg VAULT_TOKEN=$VAULT_TOKEN -f Dockerfile .
    # Runs the Docker container and executes the test script for ArgoCD
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
    # Archives the test report if it exists
    - if [ -d "${CI_PROJECT_DIR}/reports/" ]; then
        formattedDate=$(date +"%d_%m_%Y_%H_%M");
        filename="PASS_${REPORT_NAME}_${formattedDate}_ArgoCD.tar";
        tar -cf ${filename} ${CI_PROJECT_DIR}/reports/ ${CI_PROJECT_DIR}/logs/;
        mv ${filename} ${CI_PROJECT_DIR}/;
      fi
    # Cleans up Docker system and volumes
    - docker system prune -af
    - docker volume prune -f
  artifacts:
    # Defines paths to archive artifacts
    paths:
      - "${CI_PROJECT_DIR}/*.tar"

clean_workspace:
  stage: cleanup
  parallel:
    matrix:
      # Defines parallel runners for the cleanup stage
      - RUNNER: docker1
      - RUNNER: docker2
  tags:
    - ${RUNNER}
  script:
    # Cleans up the project directory
    - rm -rf $CI_PROJECT_DIR/*
```

### Step 3: Modifying Dockerfile

Update Dockerfile to fetch login data from HashiCorp Vault during the image build.

```Dockerfile
FROM node:22.2-alpine3.20

# Install dependencies
RUN apk update > /dev/null && \
    apk add --no-cache curl jq unzip git openssh bash nano wget ca-certificates openssl > /dev/null

# Use openssl to download the self-signed certificate and add it to the trusted certificates
RUN echo -n | openssl s_client -connect 10.10.0.150:8200 -servername 10.10.0.150 | openssl x509 -out /usr/local/share/ca-certificates/vault.crt && \
    update-ca-certificates

# Set environment variables for Vault
ARG VAULT_ADDR
ARG VAULT_TOKEN

# Retrieve NPM credentials from Vault and create .npmrc file
RUN NPM_SECRET=$(curl --verbose --header "X-Vault-Token: $VAULT_TOKEN" $VAULT_ADDR/v1/secret/data/gitlab/npm) && \
    NPM_USER=$(echo $NPM_SECRET | jq -r '.data.data.NPM_USER') && \
    NPM_PASS=$(echo $NPM_SECRET | jq -r '.data.data.NPM_PASS') && \
    echo "registry=https://nexus.sysadmin.homes/repository/npm-group/" > /root/.npmrc && \
    echo "//nexus.sysadmin.homes/repository/npm-group/:_auth=$(echo -n ${NPM_USER}:${NPM_PASS} | base64)" >> /root/.npmrc && \
    echo "always-auth=true" >> /root/.npmrc

# Adding GitLab SSH key to known_hosts
RUN mkdir -p /root/.ssh && ssh-keyscan gitlab.sysadmin.homes >> /root/.ssh/known_hosts

# Gauge installation
RUN curl -Ssl https://downloads.gauge.org/stable | sh

# Installing Gauge plugins.
RUN gauge install js && \
    gauge install screenshot && \
    gauge install html-report

# Set npm registry
RUN npm config set strict-ssl false
RUN npm config set registry "https://nexus.sysadmin.homes/repository/npm-group/"

# Installation of the required npm packages
ENV TAIKO_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm install --no-fund --save -g npm@latest log4js@latest xml2js@latest isomorphic-fetch@latest taiko@latest

# Disabling proxy
ENV http_proxy=
ENV https_proxy=

# Set environment variables 
ENV NPM_CONFIG_PREFIX=/usr/local/lib/node_modules
ENV PATH="${NPM_CONFIG_PREFIX}/bin:${PATH}"
ENV TAIKO_BROWSER_ARGS=--no-sandbox,--start-maximized,--disable-dev-shm-usage,--headless,--disable-gpu
ENV TAIKO_BROWSER_PATH=/usr/bin/chromium-browser

# Install Chromium browser
RUN apk add chromium
```

### Summary

In the above steps, we added the capability to retrieve NPM login data from HashiCorp Vault inside the Docker container during the build process. We used the `VAULT_ADDR` and `VAULT_TOKEN` arguments in the Dockerfile to fetch secrets directly from Vault and set them as environment variables, which are then used to configure NPM credentials in the container. This ensures that the login data is securely retrieved and used within the container without the need to store it as CI/CD variables in GitLab.

#### Walkthrough video

{{<youtube NRW9p7tJll4>}}