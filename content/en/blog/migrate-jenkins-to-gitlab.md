---
title: Migrate Jenkins to GitLab
date: 2024-05-30T12:00:00+00:00
description: Migrate Jenkins to GitLab
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
    image: images/2024-thumbs/gitlab01.webp
---

**Here is a video tutorial**

{{<youtube PAIeNMBM-Y4>}}

## Introduction

You can organize and execute your tests right within GitLab with GitLab Continuous Integration/Continuous Development, which frequently eliminates the requirement for Jenkins. Robust features that address a variety of continuous integration and delivery demands are provided by GitLab Continuous Integration/Continuous Development. The following are some arguments in favor of using GitLab Continuous Integration/Continuous Development over Jenkins:

### Advantages of GitLab Continuous Integration/Continuous Development

1. **Integrated Platform:** - GitLab offers an integrated platform that lets you handle deployment procedures, Continuous Integration/Continuous Development pipelines, and code repositories all in one location.

2. **Simplified Configuration:** - GitLab Continuous Integration/Continuous Development manages and version controls your Continuous Integration/Continuous Development setup along with your code with ease, using a single `.gitlab-ci.yml` file for pipeline configuration.

3. **Built-in Security:** - GitLab's settings allow for the safe management of environment variables and secrets.
   - Sensitive variable management and masking are supported natively by GitLab.

4. **GitLab CI/CD is scalable:** - it can grow with your project. It is possible to manage job concurrency, employ multiple runners, and run jobs in parallel.
   - GitLab Runners are a simple to set up tool for workload distribution.

5. **Flexibility:** - Handles a variety of tools and environments, such as cloud providers, Docker, and Kubernetes.
   - Permits the usage of intricate job dependencies and unique scripts.

6. **User-Friendly Interface:** - Job logs, artifacts, and pipeline status are all clearly visible through the GitLab interface.
   - Direct web interface monitoring and management of your pipelines is simple.

### How to Move from Jenkins to GitLab Continuous Integration/Continuous Development

1. **Examine your existing Jenkins pipelines**
   - Make a list of every Jenkins task, process, and stage that you have.
   - Note the use of any plugins or particular customizations.

2. **Make Jenkins Pipelines `.gitlab-ci.yml` compatible:**
   - Align every Jenkins job with a GitLab Continuous Integration/Continuous Development stage.
   - Convert Jenkinsfile logic or Groovy scripts to GitLab Continuous Integration/Continuous Development YAML syntax.
   For complex operations, use dynamic child pipelines or the matrix technique.

3. **Install and Configure GitLab Runners:** - Install and set up GitLab Runners to carry out your tasks. GitLab has shared runners that you can utilize, or you can put up your own runners.

4. **Setup Continuous Integration/Continuous Development Variables:** - Save any environment variables, credentials, and secrets that are required in the GitLab Continuous Integration/Continuous Development settings.

5. **Test Your Pipelines:** - Use GitLab Continuous Integration/Continuous Development to run the migrated pipelines and make sure everything functions as it should.
   - Examine work logs and artifacts to troubleshoot any problems.

6. **Optimize and Automate:** - Improve the performance and dependability of your pipeline arrangement.
   - Arrange triggers and pipeline scheduling to automate the Continuous Integration/Continuous Development process.

## How to set up GitLab runner

It is feasible to install Docker on a virtual machine (VM) and utilize it as a GitLab Runner. With this configuration, you can use the virtual machine (VM) to perform your Continuous Integration/Continuous Development operations as a Docker executor. Here's how to make this happen:

### Steps to Set Up a GitLab Runner on a Virtual Machine

#### 1. Prepare the Virtual Machine

Make that an appropriate operating system, such as Ubuntu, Debian, CentOS, or any other Linux distribution supported by GitLab Runner, is installed in your virtual machine.

#### 2. Install Docker on the Virtual Machine

Install Docker by following these steps:

{{< tabs Debian CentOS >}}
  {{< tab >}}
  ##### Debian/Ubuntu
  ```bash
  # Add Docker's official GPG key:
  sudo apt update
  sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc

  # Add the repository to Apt sources:
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt update
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl start docker
  sudo systemctl enable docker
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### CentOS/RHEL
  ```bash
  sudo yum install -y yum-utils device-mapper-persistent-data lvm2
  sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
  sudo yum install -y docker-ce
  sudo systemctl start docker
  sudo systemctl enable docker
  ```
  {{< /tab >}}
{{< /tabs >}}

Verify that Docker is installed properly:


```bash
sudo docker --version
```

Verify that the installation is successful by running the hello-world image:

```bash
sudo docker run hello-world
```

#### 3. Install GitLab Runner

Download and install GitLab Runner:

{{< tabs Debian CentOS >}}
  {{< tab >}}
  ##### Debian/Ubuntu
  ```bash
  sudo curl -L --output /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64
  sudo chmod +x /usr/local/bin/gitlab-runner
  sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash
  sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
  sudo gitlab-runner start
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### CentOS/RHEL
  ```bash
  sudo yum install -y gitlab-runner
  sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
  sudo gitlab-runner start
  ```
  {{< /tab >}}
{{< /tabs >}}

#### 4. Register the GitLab Runner

Register the GitLab Runner with your GitLab instance. During the registration process, you will need to provide:

- Your GitLab instance URL (e.g., `https://gitlab.example.com`).
- A registration token (available from your GitLab project under Settings > Continuous Integration/Continuous Development > Runners).
- A description for the runner (e.g., `my-vm-runner`).
- Tags to identify the runner (e.g., `docker, vm`).
- The executor type (`docker`).
- Docker image to use (e.g., `docker:latest`).

##### Token

A unique string known as the registration token enables a GitLab Runner to register as a runner for a particular project, group, or instance and authenticate with your GitLab instance. The registration token for your GitLab project can be located as follows:

##### How to Locate the Registration Token 

1. **Log in to GitLab:** - Go to `https://10.10.0.119/} in your web browser to access your GitLab instance.
   - Enter your login information to log in.

2. **Go to Your Project:** - Locate the particular project for which you wish to sign up the runner.
   - You can use the search box or go through your list of projects to find your project.

3. Select the Continuous Integration/Continuous Development Settings menu.
   - Select **Settings** from the menu on the left sidebar of your project.
   - Choose **Continuous Integration/Continuous Development** from **Settings**.

4. **Expand the Runners Section:** - To view additional options, scroll down to the **Runners** section and select the **Expand** button.

5. **Find the Registration Token:** - The **Registration token** token can be found under the **Specific Runners** section.
   - To register your GitLab Runner, you must use this token.

##### Example of the Registration Token Location

Here’s an example of what the settings page might look like:

```
Settings
├── General
├── Integrations
├── CI / CD
│   ├── Pipelines
│   ├── Jobs
│   ├── Runners
│   │   ├── Shared Runners
│   │   └── Specific Runners
│   │       ├── Runner token: [your_project_specific_token]
│   │       └── Registration token: [your_registration_token]
```

##### Register the Runner with the Token

Once you have the registration token, proceed with the registration process:

```bash
sudo gitlab-runner register
```

When prompted, enter the GitLab instance URL and the registration token you retrieved from the Continuous Integration/Continuous Development settings:

```
Enter the GitLab instance URL (for example, https://gitlab.com/):
https://10.10.0.119/
Enter the registration token:
[your_registration_token]
```

Follow the remaining prompts to complete the registration, specifying the description, tags, and executor type (`docker`).

#### 1. Adding Tags to the GitLab Runner

When you register the GitLab Runner, you can assign tags to it. If you have already registered the runner without tags, you can add tags by editing the configuration.

##### During Runner Registration

When running the `gitlab-runner register` command, you will be prompted to enter tags. Enter the tags you want to use, separated by commas. For example:

```bash
sudo gitlab-runner register
```

Follow the prompts and add tags when prompted:

```
Enter the GitLab instance URL (for example, https://gitlab.com/):
https://10.10.0.119/
Enter the registration token:
[your_registration_token]
Enter a description for the runner:
[my-vm-runner]
Enter tags for the runner (comma-separated):
docker,vm,ci
```

#### After Registration (Editing `config.toml`)

If the runner is already registered, you can add tags by editing the `config.toml` file, usually located at `/etc/gitlab-runner/config.toml`:

```toml
[[runners]]
  name = "my-vm-runner"
  url = "https://10.10.0.119/"
  token = "YOUR_REGISTRATION_TOKEN"
  executor = "docker"
  tags = ["docker", "vm", "ci"]
  [runners.custom_build_dir]
  [runners.docker]
    tls_verify = false
    image = "docker:latest"
    privileged = true
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache"]
    shm_size = 0
  [runners.cache]
```

##### 2. Using Tags in `.gitlab-ci.yml`

Update your `.gitlab-ci.yml` file to specify the tags for your jobs. This ensures that the jobs are picked up by the runners with matching tags.

---
##### Installing GitLab Runner with Docker - added additionally if you want to use Docker instead a virtual machine.
```bash
docker run -d --name gitlab-runner --restart always \
  -v /srv/gitlab-runner/config:/etc/gitlab-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  gitlab/gitlab-runner:latest
```
##### Registering the Runner
```bash
docker run --rm -v /srv/gitlab-runner/config:/etc/gitlab-runner gitlab/gitlab-runner:latest register
```
---

#### 5. Configure the Runner to Use Docker

##### Assign a Runner to Your Project

1. **Verify Runner Installation:**
   - Ensure that the GitLab Runner is properly installed and registered as described in the previous steps.
   - Check the status of the runner:

   ```bash
   sudo gitlab-runner status
   ```

2. **Check Runner Configuration:**
   - Verify that the runner is listed in the GitLab UI and is assigned to the correct project.

3. **Assign Runner to Your Project:**
   - Go to your GitLab project.
   - Navigate to **Settings** > **Continuous Integration/Continuous Development**.
   - Expand the **Runners** section.
   - If the runner is registered but not assigned, you might see it under the **Available specific runners** section. Click the **Enable for this project** button next to your runner.

##### Configure the Executor

When registering your runner, you specify the executor type. If you registered the runner with `docker` as the executor, you don't need to change anything in your `.gitlab-ci.yml` file regarding the executor. However, ensure that your runner's configuration in `config.toml` is correct:

By modifying the `/etc/gitlab-runner/config.toml` file, make sure the GitLab Runner is set up to use Docker. Also modify the `services_limit` to allow at least 1 service:

```toml
[[runners]]
  name = "docker"
  url = "https://10.10.0.119/"
  id = 2
  token = "glrt-TDN6NZ-WTx5Qy3QJZMUk"
  token_obtained_at = 2024-05-28T09:38:12Z
  token_expires_at = 0001-01-01T00:00:00Z
  executor = "docker"
  tags = ["runner", "docker"]
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
Make sure that Docker-in-Docker (DinD) capability is enabled by setting the `privileged` mode to {true}.

**Restart the GitLab Runner:**

After saving the changes, restart the GitLab Runner to apply the new configuration:

```bash
sudo gitlab-runner restart
```

**Verify the Configuration:**

Check the runner configuration to ensure the changes have been applied:

```bash
sudo gitlab-runner list
```

#### 6.  Add SSL certificate

##### 1. **Add the GitLab Server Certificate to the Runner's Trust Store**

If your GitLab server is using a self-signed certificate or an internal CA, you need to add the certificate to the GitLab Runner’s trusted certificates.

##### a. **Install OpenSSL (if not already installed):**

Make sure `openssl` is installed on your machine. You can install it using the package manager of your distribution if it's not already present.

   ```bash
   sudo apt-get update
   sudo apt-get install openssl
   ```

##### b. **Obtain the Certificate**

Use the `openssl` command to connect to your GitLab server and retrieve the certificate. Replace `10.10.0.119` with your GitLab server's domain.

   ```bash
   echo -n | openssl s_client -connect 10.10.0.119:443 -servername 10.10.0.119 | openssl x509 > gitlab.crt
   ```

This command will create a file named `gitlab.crt` in your current directory containing the server’s certificate.

##### c. **Add the Certificate to the Runner’s Trust Store**

Copy the certificate to the appropriate directory for trusted certificates. On most Linux distributions, this is `/usr/local/share/ca-certificates` or `/etc/ssl/certs`.

```bash
sudo cp gitlab.crt /usr/local/share/ca-certificates/gitlab.crt
sudo update-ca-certificates
```

##### c. **Restart GitLab Runner**

After updating the certificates, restart the GitLab Runner service to apply the changes:

```bash
sudo systemctl restart gitlab-runner
```

You may guarantee safe connection between the runner and the GitLab server by adding the GitLab server certificate to the runner's trust store. 

#### 7. Generate a pair of keys to clone Git repository

The persistent `exit code 128` error you're encountering indicates an issue related to the SSH host key verification or permissions when trying to clone the Git repository. Let's further address this problem.

#### Ensure SSH Keys and Known Hosts Configuration

##### 1. Add SSH Key to Known Hosts

Ensure the SSH host key is correctly added to the known hosts on the runner:

```bash
ssh-keyscan 10.10.0.119 >> ~/.ssh/known_hosts
```

Include this step in your GitLab CI script to make sure it works for all runners:

##### 2. Use SSH Key for Cloning

Make sure you have a deploy key or personal access token with SSH access set up for cloning the repository. If you haven't set up an SSH key, you can generate one and add it to your GitLab account or project:

```bash
ssh-keygen -t ed25519 -C "gitlab-runner"
```

Add the public key (`~/.ssh/id_ed25519.pub`) to your GitLab project under **Settings** > **Repository** > **Deploy Keys**.

##### 3. Ensure GitLab Runner Can Access SSH Key

The GitLab Runner needs to use the SSH key to authenticate. You can add the SSH private key as a secret variable in GitLab Continuous Integration/Continuous Development settings.

##### Add SSH Key as a Secret Variable

1. Navigate to your GitLab project.
2. Go to **Settings** > **Continuous Integration/Continuous Development**.
3. Expand the **Variables** section.
4. Add a new variable:
   - **Key**: `SSH_PRIVATE_KEY`
   - **Value**: Paste the contents of your private SSH key (`~/.ssh/id_ed25519`).
   - Check **Masked** and **Protected** if appropriate.

##### 4. Create `.gitlab-ci.yml` to use SSH key

Create your `.gitlab-ci.yml` file to use the SSH private key for authentication and to build a Docker image from a Dockerfile and run your tests inside that Docker container:

```yaml
variables:
  REPO_URL: 'git@10.10.0.119:developers/taiko.git'
  BRANCH: 'main'
  REPORT_PATH: '/workspace'
  REPORT_NAME: 'TAIKO_AUTOMATED_TESTS'
  DOCKER_IMAGE: "taiko"
  GIT_STRATEGY: clone
  TAIKO_SKIP_CHROMIUM_DOWNLOAD: "true"
  RUNNER_SCRIPT_TIMEOUT: 60m

stages:
  - clean
  - build_and_test
  - cleanup

before_script:
  - 'which ssh-agent || ( apt-get update -y && apt-get install openssh-client -y )'
  - eval $(ssh-agent -s)
  - mkdir -p ~/.ssh
  - chmod 700 ~/.ssh
  - touch ~/.ssh/known_hosts
  - ssh-keyscan 10.10.0.119 >> ~/.ssh/known_hosts
  - chmod 644 ~/.ssh/known_hosts
  - echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_ed25519
  - chmod 400 ~/.ssh/id_ed25519
  - ssh-add ~/.ssh/id_ed25519

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
  timeout: 60m

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
  timeout: 60m

clean_workspace:
  stage: cleanup
  tags:
    - docker
  script:
    - rm -rf $CI_PROJECT_DIR/*
```

Ensure DOCKER_TLS_CERTDIR is Set to an Empty Value:

The DOCKER_TLS_CERTDIR environment variable should be set to an empty string to ensure Docker does not try to use TLS.

Put `.gitlab-ci.yml` in the root directory of your GitLab project.

#### 8.  Add logins and passwords as variables in GitLab

In GitLab, you can store sensitive information such as logins and passwords as Continuous Integration/Continuous Development environment variables. These variables are encrypted and can be accessed by your Continuous Integration/Continuous Development pipeline jobs. Here’s how to store and manage these variables:

##### Steps to Add Continuous Integration/Continuous Development Variables in GitLab

1. **Navigate to Your Project:**
   - Open your GitLab project.

2. **Go to Settings:**
   - On the left sidebar, click on **Settings**.

3. **Access Continuous Integration/Continuous Development Settings:**
   - In the settings menu, select **Continuous Integration/Continuous Development**.

4. **Expand Variables Section:**
   - Scroll down to the **Variables** section and click on the **Expand** button.

5. **Add a Variable:**
   - Click on the **Add variable** button.
   - **Key:** Enter the name of the variable, e.g., `NPM_USER`, `NPM_PASS`, `AWX_USERNAME_`, `AWX_PASSWORD`, etc.
   - **Value:** Enter the corresponding value for the variable.
   - **Type:** Ensure the variable type is `Variable`.
   - **Protected:** Check this box if you want the variable to be available only to protected branches or tags.
   - **Masked:** Check this box if you want the variable's value to be masked in job logs.
   - **Environment scope:** By default, it applies to all environments, but you can specify a particular environment if needed.

6. **Save the Variable:**
   - Click on the **Add variable** button to save the variable.

##### Example Variables Configuration

For the variables used in your pipeline, you would add them as follows:

- `NPM_USER`
- `NPM_PASS`
- `AWX_USERNAME`
- `AWX_PASSWORD`
- `ARGOCD_USERNAME`
- `ARGOCD_PASSWORD`
- and so on for each service.

##### `NPM_USER` and `NPM_PASS`

Update your `.gitlab-ci.yml` to pass these variables to the Docker build process.

Ensure your `Dockerfile` correctly uses the `NPM_USER` and `NPM_PASS` build arguments:

```dockerfile
FROM node:22.2-alpine3.20

ARG NPM_USER
ARG NPM_PASS
```

##### Accessing Variables in the GitLab Continuous Integration/Continuous Development Pipeline

In your `.gitlab-ci.yml` file, you can access these variables using the `${VARIABLE_NAME}` syntax. GitLab Continuous Integration/Continuous Development automatically injects these variables into the pipeline's environment.

Here is a snippet from the pipeline configuration showing how to use these variables:

```yaml
build_docker_image:
  stage: build_docker_image
  script:
    - |
      docker build -t $DOCKER_IMAGE \
        --build-arg NPM_USER=${NPM_USER} \
        --build-arg NPM_PASS=${NPM_PASS} \
        -f Dockerfile .

run_tests:
  stage: run_tests
  script:
    - docker run --rm -v /workspace:/workspace $DOCKER_IMAGE bash -c "
      export server_address=${server_address} &&
      export username=${username} &&
      export password=${password} &&
      ln -s /usr/local/lib/node_modules/ ${CI_PROJECT_DIR}/node_modules &&
      ln -s /usr/local/lib/node_modules/ /lib/node_modules &&
      rm -f *.tar downloaded//* &&
      rm -rf reports .gauge logs &&
      gauge run ${CI_PROJECT_DIR}/specs/${SPEC_FILE}"
```

#### 9. Tests modification

argocd.js

```javascript
const { goto, text, button, textBox, write, click, into, evaluate } = require('taiko');
const assert = require('assert');

step("Navigate to the ArgoCD login page", async function () {
    await goto("http://argocd.sysadmin.homes");
});

step("Assert the ArgoCD login page is loaded", async () => {
    assert(await text("Let's get stuff deployed!").exists());
});

step('Use ArgoCD credentials <username>:<password>', async () => {
    let username = process.env.ARGOCD_USERNAME || '';
    let password = process.env.ARGOCD_PASSWORD || '';

    await write(username, into(textBox("Username")));
    await write(password, into(textBox("Password")));
});

step("Click the ArgoCD login button", async () => {
    await click(button("SIGN IN"));
});

step("Verify successful ArgoCD login", async () => {
    await text("Applications").exists();
});

step("Clear all ArgoCD tasks", async function () {
    await evaluate(() => localStorage.clear());
});
```

awx.js

```javascript
const { goto, text, button, textBox, write, click, into, evaluate } = require('taiko');
const assert = require('assert');

step("Navigate to the AWX login page", async function () {
    await goto("http://awx.sysadmin.homes");
});

step("Assert the AWX login page is loaded", async () => {
    assert(await text("Welcome to AWX!").exists());
});

step('Use AWX credentials <username>:<password>', async () => {
    let username = process.env.AWX_USERNAME || '';
    let password = process.env.AWX_PASSWORD || '';

    await write(username, into(textBox("Username")));
    await write(password, into(textBox("Password")));
});

step("Click the AWX login button", async () => {
    await click(button("Log In"));
});

step("Verify AWX login", async () => {
    await text("Dashboard").exists();
});

step("Clear all AWX tasks", async function () {
    await evaluate(() => localStorage.clear());
});

```

#### 10. Troubleshooting

If your job is in a pending state and waiting to be picked by a runner, there are a few steps you can take to troubleshoot and resolve the issue:

#### 1. Check Runner Registration and Status

Ensure that the runner is correctly registered and online:

```bash
sudo gitlab-runner list
```

This command will list all the registered runners and their status.

#### 2. Check Runner Tags

Make sure the runner has the correct tags and that the tags match the ones specified in your `.gitlab-ci.yml` file. You can add or modify tags by editing the `config.toml` file and then restarting the runner.

#### 3. Ensure Runner is Assigned to the Project

Ensure the runner is enabled for your project:
1. Navigate to your GitLab project.
2. Go to **Settings** > **Continuous Integration/Continuous Development**.
3. Expand the **Runners** section.
4. Ensure that your runner is listed under **Available specific runners** and is enabled for your project.

#### 4. Review Runner Logs

Check the runner logs for any errors that might indicate why jobs are not being picked up:

```bash
sudo journalctl -u gitlab-runner -f
```

#### 5. Restart the Runner

Restarting the GitLab Runner can sometimes resolve issues:

```bash
sudo gitlab-runner restart
```

#### 6. Example `.gitlab-ci.yml` with Tags

Make sure the relevant tags are specified in the `.gitlab-ci.yml` file according to your runner setup.

#### Ensure the Runner is Enabled for the Project

1. **Go to your GitLab project.**
2. **Navigate to Settings > Continuous Integration/Continuous Development.**
3. **Expand the Runners section.**
4. **Check if the runner is listed under "Available specific runners" and ensure it is enabled.**

#### 7. Review Runner Logs

The logs for the `gitlab-runner` service are typically managed by the system's logging service, which is usually `systemd` on most modern Linux distributions. Here are the common ways to access the logs for the `gitlab-runner` service:

### Viewing GitLab Runner Logs

1. **Using `journalctl`:**

   The `journalctl` command can be used to view logs for services managed by `systemd`. To view the logs for the `gitlab-runner` service, you can use:

   ```bash
   sudo journalctl -u gitlab-runner.service
   ```

   This command shows all logs for the `gitlab-runner` service. You can use additional options to filter the logs, such as `-f` to follow the logs in real-time or `--since` to view logs since a specific time:

   ```bash
   sudo journalctl -u gitlab-runner.service -f
   sudo journalctl -u gitlab-runner.service --since "2024-05-28 00:00:00"
   ```

#### 8. Configuring GitLab Runner Logging

If you want to configure where GitLab Runner writes its logs, you can adjust the service configuration. Here are the steps to change logging configurations:

1. **Redirect Logs in the Service File:**

   If you need to redirect logs to a specific file, you can modify the `gitlab-runner` service file. This is generally located at `/etc/systemd/system/gitlab-runner.service` or similar.

   ```bash
   sudo vim /etc/systemd/system/gitlab-runner.service
   ```

   Add `StandardOutput` and `StandardError` after the `ExecStart` line to redirect logs:

   ```ini
   [Service]
   ExecStart=/usr/local/bin/gitlab-runner "run" "--working-directory" "/home/gitlab-runner" "--config" "/etc/gitlab-runner/config.toml" "--service" "gitlab-runner" "--user" "gitlab-runner
   StandardOutput=file:/var/log/gitlab-runner/runner-std.log
   StandardError=file:/var/log/gitlab-runner/runner-err.log
   ```

   Create a directory:

   ```bash
   sudo mkdir -p /var/log/gitlab-runner
   ```

   Create files:

   ```bash
   sudo touch /var/log/gitlab-runner/runner-std.log
   sudo touch /var/log/gitlab-runner/runner-err.log
   ```

   Reload the `systemd` configuration and restart the service:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart gitlab-runner
   ```
