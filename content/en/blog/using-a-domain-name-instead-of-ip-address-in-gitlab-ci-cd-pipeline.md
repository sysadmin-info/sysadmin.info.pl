---
title: Using a Domain Name Instead of IP Address in GitLab Continuous Integration/Continuous Development Pipeline
date: 2024-05-31T12:00:00+00:00
description: Using a Domain Name Instead of IP Address in GitLab Continuous Integration/Continuous Development Pipeline
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
- Taiko
- Gauge
- Node.js
- npm
- GitLab
cover:
    image: images/2024-thumbs/gitlab02.webp
---

**Here is a video tutorial**

{{<youtube t6e31LmgJKs>}}

### Introduction

To use a domain name instead of an IP address in the `.gitlab-ci.yml` pipeline in GitLab for cloning repositories, follow the steps below to configure your system accordingly.

#### Step-by-Step Guide

##### Adding SSH Key to User's SSH Keys Section in GitLab

To ensure secure and proper access to your GitLab repository, follow these steps to remove the public ed25519 key from the project’s deploy keys section and add it to a user's SSH keys section.

1. **Remove the SSH Key from Deploy Keys:**

   - **Navigate to Your Project:**
     1. Log in to your GitLab instance.
     2. Go to your project (e.g., `https://gitlab.sysadmin.homes/developers/taiko`).
   
   - **Access Deploy Keys:**
     1. On the left sidebar, navigate to **Settings** > **Repository**.
     2. Scroll down to the **Deploy Keys** section.
   
   - **Remove the Public Key:**
     1. Find the SSH key (ed25519.pub) you want to remove.
     2. Click the **Delete** button next to the key to remove it from the deploy keys.

2. **Add the SSH Key to a User's SSH Keys:**

   - **Access User Settings:**
     1. Click on your avatar in the top right corner of the GitLab interface.
     2. Select **Settings** from the dropdown menu.
   
   - **Navigate to SSH Keys:**
     1. In the user settings menu, click on **SSH Keys** in the left sidebar.
   
   - **Add the Public Key:**
     1. Copy the content of your `ed25519.pub` key. You can find this key on your local machine, typically located in the `~/.ssh/` directory.
       ```bash
       cat ~/.ssh/id_ed25519.pub
       ```
     2. Paste the copied key into the **Key** field.
     3. Add a descriptive **Title** for the key to help identify it later.
     4. Click the **Add key** button to save it.

3. **Verify the SSH Key:**

   After adding the SSH key, verify that it has been added correctly:

   - **List SSH Keys:**
     1. In the **SSH Keys** section of your user settings, ensure that the new key appears in the list.

By removing the public ed25519 key from the project's deploy keys and adding it to your GitLab user's SSH keys section, you enhance security and ensure that the key is associated with a specific user rather than being accessible as a deploy key. This method is more secure and provides better control over access to your repositories.

4. **Install OpenSSL (if not already installed):**

   Ensure `openssl` is installed on your machine. If not, install it using the package manager of your distribution.

   ```bash
   sudo apt-get update
   sudo apt-get install openssl
   ```

5. **Download the Certificate:**

   Use the `openssl` command to connect to your GitLab server and retrieve the certificate. Replace `gitlab.sysadmin.homes` with your GitLab server's domain.

   ```bash
   echo -n | openssl s_client -connect gitlab.sysadmin.homes:443 -servername gitlab.sysadmin.homes | openssl x509 > gitlab.crt
   ```

   This command will create a file named `gitlab.crt` in your current directory containing the server’s certificate.

6. **Verify the Certificate:**

   Verify the downloaded certificate using the following command:

   ```bash
   openssl x509 -in gitlab.crt -text -noout
   ```

   This will print out the details of the certificate, allowing you to ensure it is the correct one.

7. **Copy the Certificate to the Trusted Store:**

   Move the downloaded certificate to the system’s trusted certificate directory and update the CA certificates:

   ```bash
   sudo cp gitlab.crt /usr/local/share/ca-certificates/gitlab.crt
   sudo update-ca-certificates
   ```

8. **Test Connection to GitLab Server from GitLab Runner:**

   From gitlab-runner command line, test the SSH access to ensure it works correctly:

   ```bash
    ssh -i ~/.ssh/id_ed25519 -T git@gitlab.sysadmin.homes
    ssh -T git@gitlab.sysadmin.homes
   ```

9. **Unregister the Runner:**

   Unregister the GitLab runner:

   ```bash
   sudo gitlab-runner unregister --all-runners
   ```

10. **Navigate to Your Project:**
   - Log in to your GitLab instance.
   - Go to your project (e.g., `https://gitlab.sysadmin.homes/developers/taiko`).

11. **Access Continuous Integration/Continuous Development Settings:**
   - On the left sidebar, navigate to **Settings** > **Continuous Integration/Continuous Development**.
   - Scroll down to the **Runners** section.

12. **Remove the GitLab Runner:**
   - In the **Runners** section, find the runner you want to remove.
   - Click on the **Edit** button next to the runner to view its details.
   - At the bottom of the runner's details page, click the **Delete** button to remove the runner from the project.

13. **Add a New Runner:**
   - Under the **Available specific runners** section, you will see an **Add Runner** button. Click on it.

14. **Fill in Runner Details:**
   - A form will appear where you need to provide details for the new runner.
   - **Description:** Enter a description for the runner (e.g., `docker-runner`).
   - **Tags:** Add tags to identify the runner (e.g., `docker`, `linux`).
   - **Run untagged jobs:** Enable or disable this option based on your preference.
   - **Locked:** Choose whether to lock the runner to the current project or not.

15. **Generate and Copy Registration Token:**
   - After filling in the details, click on the **Register Runner** button.
   - A registration token will be generated. Copy this token as you will need it for the runner registration.


16. **Register the Runner Again:**

   With the certificate now trusted, attempt to register the GitLab runner again:

   ```bash
   sudo gitlab-runner register
   ```

17. **Modify `config.toml` Again:**

   Edit the file `/etc/gitlab-runner/config.toml` with the below command:

   ```bash
   sudo vim /etc/gitlab-runner/config.toml
   ```

   Ensure the entry contains: `tags = ["docker"]`, `privileged = true`, and `services_limit = 1`.

   The configuration should look similar to this:

   ```toml
   [[runners]]
     name = "docker"
     url = "https://gitlab.sysadmin.homes/"
     id = 2
     token = "glrt-TDN6NZ-WTx5Qy3QJZMUk"
     token_obtained_at = 2024-05-28T09:38:12Z
     token_expires_at = 0001-01-01T00:00:00Z
     executor = "docker"
     tags = ["docker"]
     [runners.custom_build_dir]
     [runners.cache]
       MaxUploadedArchiveSize = 0
       [runners.cache.s3]
       [runners.cache.gcs]
       [runners.cache.azure]
     [runners.docker]
       tls_verify = false
       image = "docker:latest"
       privileged = true
       disable_entrypoint_overwrite = false
       oom_kill_disable = false
       disable_cache = false
       volumes = ["/cache"]
       shm_size = 0
       network_mtu = 0
       services_limit = 1
   ```

##### Summary

By downloading the certificate from your GitLab server and adding it to your system’s trusted certificates, you can resolve the certificate verification issue and successfully register your GitLab runner.

##### Modified .gitlab-ci.yml file

The modified `.gitlab-ci.yml` file includes the necessary steps to add the entry to `/etc/hosts` and to download and install the SSL certificate on Alpine Linux inside the `before_script` section.

```yaml
variables:
  REPO_URL: 'git@gitlab.sysadmin.homes:developers/taiko.git'
  BRANCH: 'main'
  REPORT_PATH: '/workspace'
  REPORT_NAME: 'TAIKO_AUTOMATED_TESTS'
  DOCKER_IMAGE: "taiko"
  GIT_STRATEGY: clone
  TAIKO_SKIP_CHROMIUM_DOWNLOAD: "true"

stages:
  - clean
  - build_and_test
  - cleanup

before_script:
  # Check if ssh-agent is installed, if not, install openssh-client
  - 'which ssh-agent || ( apk update && apk add openssh-client )'
  # Start the ssh-agent in the background
  - eval $(ssh-agent -s)
  # Create the .ssh directory if it doesn't exist
  - mkdir -p ~/.ssh
  # Set the permissions of the .ssh directory to 700
  - chmod 700 ~/.ssh
  # Create an empty known_hosts file if it doesn't exist
  - touch ~/.ssh/known_hosts
  # Set the permissions of the known_hosts file to 644
  - chmod 644 ~/.ssh/known_hosts
  # Add the private key from the environment variable to a file and remove carriage returns
  - echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_ed25519
  # Set the permissions of the private key file to 400
  - chmod 400 ~/.ssh/id_ed25519
  # Add the private key to the ssh-agent
  - ssh-add ~/.ssh/id_ed25519
  # Create an SSH configuration file with settings for the GitLab host
  - echo -e "Host gitlab.sysadmin.homes\n\tUser git\n\tHostname gitlab.sysadmin.homes\n\tIdentityFile ~/.ssh/id_ed25519\n\tIdentitiesOnly yes\n\tStrictHostKeyChecking no" > ~/.ssh/config
  # Add the GitLab server's IP address to /etc/hosts
  - echo "10.10.0.119 gitlab.sysadmin.homes" >> /etc/hosts
  # Install OpenSSL if not already installed
  - apk add --no-cache openssl
  # Retrieve the SSL certificate from the GitLab server and save it to a file
  - echo -n | openssl s_client -connect gitlab.sysadmin.homes:443 -servername gitlab.sysadmin.homes | openssl x509 > gitlab.crt
  # Copy the retrieved certificate to the trusted certificates directory
  - cp gitlab.crt /usr/local/share/ca-certificates/gitlab.crt
  # Update the list of trusted certificates
  - update-ca-certificates

build_and_test_awx:
  stage: build_and_test
  tags:
    - docker
  image: docker:latest
  services:
    - name: docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_HOST: "tcp://docker:2375"
    DOCKER_TLS_CERTDIR: ""
  script:
    - git clone --single-branch --branch $BRANCH $REPO_URL
    - docker build --build-arg NPM_USER="${NPM_USER}" --build-arg NPM_PASS="${NPM_PASS}" -t $DOCKER_IMAGE -f Dockerfile .
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
    - if [ -d "${CI_PROJECT_DIR}/reports/" ]; then
        formattedDate=$(date +"%d_%m_%Y_%H_%M");
        filename="PASS_${REPORT_NAME}_${formattedDate}_AWX.tar";
        tar -cf ${filename} ${CI_PROJECT_DIR}/reports/ ${CI_PROJECT_DIR}/logs/;
        mv ${filename} ${CI_PROJECT_DIR}/;
      fi
    - docker system prune -af
    - docker volume prune -f
  artifacts:
    paths:
      - "${CI_PROJECT_DIR}/*.tar"

build_and_test_argocd:
  stage: build_and_test
  tags:
    - docker
  image: docker:latest
  services:
    - name: docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_HOST: "tcp://docker:2375"
    DOCKER_TLS_CERTDIR: ""
  script:
    - git clone --single-branch --branch $BRANCH $REPO_URL
    - docker build --build-arg NPM_USER="${NPM_USER}" --build-arg NPM_PASS="${NPM_PASS}" -t $DOCKER_IMAGE -f Dockerfile .
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
    - if [ -d "${CI_PROJECT_DIR}/reports/" ]; then
        formattedDate=$(date +"%d_%m_%Y_%H_%M");
        filename="PASS_${REPORT_NAME}_${formattedDate}_ArgoCD.tar";
        tar -cf ${filename} ${CI_PROJECT_DIR}/reports/ ${CI_PROJECT_DIR}/logs/;
        mv ${filename} ${CI_PROJECT_DIR}/;
      fi
    - docker system prune -af
    - docker volume prune -f
  artifacts:
    paths:
      - "${CI_PROJECT_DIR}/*.tar"

clean_workspace:
  stage: cleanup
  tags:
    - docker
  script:
    - rm -rf $CI_PROJECT_DIR/*
```

In this updated `.gitlab-ci.yml`, the `before_script` section includes the necessary steps to add the entry to `/etc/hosts` and to download and install the SSL certificate for the GitLab server on an Alpine-based Docker container. This ensures that the GitLab Runner can properly connect to your GitLab server during the job execution. Adding [[ -f /.dockerenv ]] && echo -e “Host *StrictHostKeyChecking no” > ~/.ssh/config should disable host key checking for SSH connections, which may help solve the access problem.