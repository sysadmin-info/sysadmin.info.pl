---
title: Automating Taiko and Gauge Tests Using Jenkins, GitLab and Docker - A Complete Tutorial
date: 2024-05-21T17:30:00+00:00
description: Automating Taiko and Gauge Tests Using Jenkins, GitLab and Docker - A Complete Tutorial
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Taiko
categories:
- Taiko
- Gauge
- Node.js
- npm
cover:
    image: images/2024-thumbs/taiko07.webp
---

[Taiko repository](https://github.com/getgauge/taiko)
[Taiko API](https://docs.taiko.dev/)

**Here is a video tutorial**

{{<youtube STCwDoYdM6o>}}

### Introduction

In the introduction, you have a shortened version of what needs to be done as an outline of the whole.

#### Environment Preparation

   - Install:
     - Jenkins [10.10.0.124]
     - GitLab [10.10.0.119]
     - Docker [10.10.0.121]
   - Configure the environment by connecting Jenkins with Docker and GitLab.
   - Read all articles about Jenkins on [sysadmin.info.pl](https://sysadmin.info.pl/en/series/jenkins/).

{{< notice success "Information about changes" >}}
Pay attention to the difference related to the user (instead of the jenkins user, we will use the root user - below you will find an explanation why) when adding a node from Docker to Jenkins.
{{< /notice >}}

{{< notice error "Why root instead of jenkins on the Docker node?" >}}
There is a known issue with permissions. Basically, the user you are configuring, when you are connecting to the Docker node in Jenkins node configuration, should be set as root, not as jenkins. The problem is related to GID for user inside the Docker container. If the user on a host (Docker node) has a different GID than a user inside the Docker container, you cannot copy files back and forth between the Docker container and host due to two different GIDs, leading to a permission denied error inside the Jenkins job's log. You will find more here: [persistent volume permissions issue](https://sysadmin.info.pl/en/blog/persistent-perfection-mastering-awx-project-storage-on-kubernetes/)
{{< /notice >}}

#### 1. GitLab Configuration
**Generating SSL certificate**
    - Generate a self-signed SSL certificate and add a path for key and crt files into gitlab.rb.

#### 2. Jenkins Configuration
**Adding Docker as a Node in Jenkins**
   - After generating an ed25519 key pair on the Jenkins server for the jenkins user, send the public key to the Docker node for the root user.
   - Configure the SSH connection between Jenkins and Docker node.

#### 3. Docker Configuration
- After generating SSL certificate on a GitLab server, add the certificate for Docker node.

#### 4. Taiko and Gauge Test Automation
**Docker Container Configuration for Taiko**
   - Create a Dockerfile that installs all required dependencies.
   - Configure the Node.js environment and Chromium browser.

**Creating Jenkinsfile**
   - Define the pipeline in the Jenkinsfile.
   - Set up authentication settings such as SSH keys and API tokens.

---

#### **Below are the detailed steps - note -> TLDR :) Without this, you won't achieve the goal.**

#### GitLab Server

This is a key step because the configuration file contains alt_names, which are essential for correctly identifying the GitLab server name.

**Run the below Bash script using command**

```bash
./gitlab.sh
```

**Content of the gitlab.sh:**

```bash
#!/bin/bash

set -e

# Configuration
GITLAB_IP="10.10.0.119"
DOMAIN_NAME="gitlab.sysadmin.homes"  # Use your actual domain name
BACKUP_DIR="/etc/gitlab/ssl/backup_$(date +%Y%m%d_%H%M%S)"
SSL_DIR="/etc/gitlab/ssl"
CRT_FILE="$SSL_DIR/$DOMAIN_NAME.crt"
KEY_FILE="$SSL_DIR/$DOMAIN_NAME.key"
CSR_FILE="$SSL_DIR/$DOMAIN_NAME.csr"
CONFIG_FILE="$SSL_DIR/openssl.cnf"
GITLAB_CONFIG="/etc/gitlab/gitlab.rb"

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Create backup directory
log "Creating backup directory..."
mkdir -p "$BACKUP_DIR"

# Backup existing certificate and key files
log "Backing up existing certificate and key files..."
if [ -f "$CRT_FILE" ] && [ "$(realpath "$CRT_FILE")" != "$(realpath "$BACKUP_DIR/$(basename "$CRT_FILE")")" ]; then
  mv "$CRT_FILE" "$BACKUP_DIR/"
fi
if [ -f "$KEY_FILE" ] && [ "$(realpath "$KEY_FILE")" != "$(realpath "$BACKUP_DIR/$(basename "$KEY_FILE")")" ]; then
  mv "$KEY_FILE" "$BACKUP_DIR/"
fi

# Create the openssl.cnf file
log "Creating OpenSSL configuration file..."
cat <<EOF > "$CONFIG_FILE"
[ req ]
default_bits = 2048
distinguished_name = req_distinguished_name
x509_extensions = v3_req
string_mask = utf8only
prompt = no

[ req_distinguished_name ]
countryName = PL
stateOrProvinceName = Lodz
localityName = Lodz
organizationName = gitlab
organizationalUnitName = gitlab
commonName = $DOMAIN_NAME
emailAddress = admin@sysadmin.info.pl

[ v3_req ]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[ alt_names ]
IP.1 = $GITLAB_IP
DNS.1 = $DOMAIN_NAME
EOF

# Generate the private key and CSR
log "Generating private key and CSR..."
openssl req -new -nodes -out "$CSR_FILE" -config "$CONFIG_FILE" -keyout "$KEY_FILE"
if [ $? -ne 0 ]; then
  log "Error generating CSR and private key"
  exit 1
fi

# Generate the certificate
log "Generating certificate..."
openssl x509 -req -days 365 -in "$CSR_FILE" -signkey "$KEY_FILE" -out "$CRT_FILE" -extensions v3_req -extfile "$CONFIG_FILE"if [ $? -ne 0 ]; then
  log "Error generating certificate"
  exit 1
fi

# Clean up temporary files
log "Cleaning up temporary files..."
rm "$CONFIG_FILE" "$CSR_FILE"

# Update gitlab.rb to use the new certificate files
log "Updating gitlab.rb to use the new certificate files..."
sed -i "s|nginx\['ssl_certificate'\] = .*|nginx['ssl_certificate'] = \"$CRT_FILE\"|g" "$GITLAB_CONFIG"
sed -i "s|nginx\['ssl_certificate_key'\] = .*|nginx['ssl_certificate_key'] = \"$KEY_FILE\"|g" "$GITLAB_CONFIG"

# Remove Let's Encrypt error
sudo sed -i "s/# letsencrypt\['enable'\] = nil/letsencrypt['enable'] = false/" /etc/gitlab/gitlab.rb

# Verify changes in gitlab.rb
log "Verifying updates in gitlab.rb..."
grep "nginx\['ssl_certificate'\]" "$GITLAB_CONFIG"
grep "nginx\['ssl_certificate_key'\]" "$GITLAB_CONFIG"

# Restart GitLab to apply the new certificate
log "Restarting GitLab to apply the new certificate..."
gitlab-ctl reconfigure
gitlab-ctl restart

log "SSL certificate update completed successfully."
```

#### Jenkins Server

**Run the below Bash script using command**

```bash
./jenkins.sh
```

**Content of the jenkins.sh:**

```bash
#!/bin/bash

# Configuration
GITLAB_HOST="gitlab.sysadmin.homes"
CERT_FILE="$HOME/$GITLAB_HOST.crt"
HOME_JENKINS="/var/lib/jenkins"
DOCKER_SSH_KEY_FILE="$HOME_JENKINS/.ssh/jenkins_docker_ed25519"

# Download the GitLab certificate
openssl s_client -connect $GITLAB_HOST:443 -servername $GITLAB_HOST < /dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > $CERT_FILE

# Configure Jenkins to trust GitLab SSL certificate
sudo /usr/lib64/jvm/java-17-openjdk-17/bin/keytool -delete -alias gitlab -cacerts -storepass changeit || true
sudo /usr/lib64/jvm/java-17-openjdk-17/bin/keytool -import -trustcacerts -alias gitlab -file $CERT_FILE -cacerts -storepass changeit -noprompt
sudo systemctl restart jenkins

# Generate ED25519 SSH key for Jenkins to Docker connection
ssh-keygen -t ed25519 -f $DOCKER_SSH_KEY_FILE

# Ensure correct permissions for Jenkins
sudo chown -R jenkins:jenkins $HOME_JENKINS/.ssh 

# Output public keys for manual addition
echo "Add the following public key to Docker node (for Jenkins):"
cat $DOCKER_SSH_KEY_FILE.pub
```

#### Docker Server (Node)

**Run the below Bash script using command**

```bash
./docker.sh
```

**Content of the docker.sh:**

```bash
#!/bin/bash

# Configuration
GITLAB_HOST="gitlab.sysadmin.homes"
CERT_FILE="$HOME/$GITLAB_HOST.crt"

# Download the GitLab certificate
openssl s_client -connect $GITLAB_HOST:443 -servername $GITLAB_HOST < /dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > $CERT_FILE

# Add certificate to Docker node's trusted store
sudo /usr/lib/jvm/java-17-openjdk-amd64/bin/keytool -delete -alias gitlab -cacerts -storepass changeit || true
sudo /usr/lib/jvm/java-17-openjdk-amd64/bin/keytool -import -trustcacerts -alias gitlab -file $CERT_FILE -cacerts -storepass changeit -noprompt
sudo systemctl restart docker
```

## Manual Part - Some Steps Need to Be Performed Manually

### Jenkins Connection Configuration

#### 1. Configuring Jenkins Connection to Docker Node (ed25519 key pair)

The first step is to configure Jenkins to connect to the Docker node using the ed25519 key pair.

**Steps:**

1. **Generating keys:**
    - See bash script

2. **Adding the public key to Docker node:**

```bash
ssh-copy-id -i ~/.ssh/jenkins_docker_ed25519.pub root@10.10.0.121
```

{{< notice success "Information" >}}
You can perform this command only if PermitRootLogin is set to yes and Password authentication is set to yes in sshd_config on a docker node. After that revert back changes that you made in /etc/ssh/sshd_config
{{< /notice >}}

3. **Configuring Jenkins:**
* Login to Jenkins web panel: 
* Then click Manage Jenkins → Nodes
* Click + New Node button on the right side.
* Provide a node name
* Select permanent agent
* Set the description the same as node name
* Set number of executors to 1 (this can be increased later)
* Set remote root directory to /root
* Set the label docker
* Usage: use this node as much as possible
* Launch method: Launch agents via SSH
*  Host: provide the IP address of the Docker node
* Credentials → add → select Jenkins
* Kind - choose from the dropdown list SSH username with private key
* Provide a username: root
* Select enter directly
* Paste the private key copied from the jenkins_docker_ed25519 on a Linux server with Jenkins
* In the Description field provide a friendly name like ed25519 key for a Docker node or anything like that that will easily identify the credentials.
* Provide a passphrase to this ed25519 private key you generated previously on a Linux server with Jenkins.
* Click add
* Select newly created credentials from a dropdown list
* Host Key Verification Strategy: choose: Known hosts file Verification Strategy
* Availability: Keep this agent online as much as possible
* In node properties select/check Environment variables and Tools Locations
* In Environment variables section add: 
* Name: JAVA_HOME
* Value: /usr/bin/java
* In Tools Locations section add:
* Name: Git (default)
* Value: /usr/bin/git
* Click save

#### 2. Configuring Jenkins Connection to GitLab (API Token)
The second step is to configure the Jenkins connection to GitLab using an API token.

**Steps:**

The technical user `jenkins-ci` should be created as a **Regular user** in GitLab, not as an Administrator. This approach adheres to the principle of least privilege, which helps in minimizing security risks by granting only the necessary permissions required for Jenkins to perform its tasks.

#### Steps to Create a Technical User (`jenkins-ci`) as a Regular User in GitLab:

1. **Log in to GitLab as an Administrator**:
   - Use your administrator credentials to log in to GitLab.

2. **Navigate to the Admin Area**:
   - Click on your profile picture or initials in the top-right corner.
   - Select `Admin Area`.

3. **Create a New User**:
   - In the left sidebar, click on `Users`.
   - Click the `New User` button.

4. **Fill in User Details**:
   - Username: `jenkins-ci`
   - Name: `Jenkins CI`
   - Email: Use a dedicated email address for this user.
   - Choose a strong password.
   - Ensure that `Regular user` is selected, not `Administrator`.

5. **Set the Appropriate Permissions**:
   - After creating the user, navigate to the project or group where Jenkins will need access.
   - Add `jenkins-ci` as a member to the specific project or group.
   - Assign the `Developer` or `Maintainer` role, depending on the required permissions.

#### Assigning Developer or Maintainer Role:

- **Developer**: This role allows the user to write to repositories, create branches, and perform other development-related tasks.
- **Maintainer**: This role includes all permissions of the Developer role and adds the ability to manage project settings and perform administrative tasks within the project.

For most Jenkins operations, the `Developer` role is sufficient. If Jenkins needs to perform additional tasks like managing project settings, use the `Maintainer` role.

#### Generating the GitLab API Token for the technical account:

1. **Log in as `jenkins-ci`**:
   - Log out of the administrator account and log in with the `jenkins-ci` credentials.

2. **Generate an API Token**:
   - Go to `User Settings` > `Access Tokens`.
   - Create a new token with the required scopes (`api`, `read_repository`).
   - Copy the generated token.

#### Adding the GitLab API Token in Jenkins:

1. **Go to Jenkins Web Interface**:
   - Navigate to `Manage Jenkins` > `Configure System`.

2. **Add the API Token**:
   - In the `GitLab` section, click `Add` > `Jenkins`.
   - Select `GitLab API token`.
   - Paste the token and give it a description (e.g., `GitLab API Token`).

#### Adding Project-Level Token in Jenkins:

1. **Generate a Project-Level API Token in GitLab**:
   - Go to the specific GitLab project.
   - Navigate to `Settings` > `Access Tokens`.
   - Create a new token with the required scopes (`read_repository`).
   - Copy the generated token.

2. **Add the Project-Level Token in Jenkins**:
   - Go to `Manage Jenkins` > `Manage Credentials`.
   - Select the appropriate domain (e.g., `global`).
   - Click `Add Credentials`.
   - Choose `Username with password` as the kind.
   - Set the username to the technical user that exists as a member in the GitLab project (e.g., `project_bot`).
   - Paste the generated token as the password.
   - Give it a description (e.g., `Taiko Project Token`).
   - Save the changes.

#### Usage in Jenkinsfile:

```groovy
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git(
                    url: 'https://gitlab.sysadmin.homes/developers/your-repo.git',
                    branch: 'main',
                    credentialsId: 'Taiko-token'
                )
            }
        }
        // Other stages
    }
}
```

By creating `jenkins-ci` as a regular user and assigning the appropriate roles, you ensure that Jenkins has the necessary permissions to interact with GitLab securely and efficiently without granting excessive privileges.

{{< notice success "Important information" >}}
The reason for using two different methods to handle API tokens in Jenkins stems from the different contexts and scopes in which they are used:

1. **GitLab API Token for Jenkins Connection**:
   - This token is created at the user level (e.g., the technical user `jenkins-ci`).
   - It allows Jenkins to interact with GitLab's API for broader functionalities, such as managing projects, users, and groups, fetching repository information, triggering pipelines, etc.
   - This is added in Jenkins as a **GitLab API token** under `Manage Jenkins > Configure System > GitLab`.

2. **Project-Level Token for Repository Access**:
   - This token is specific to the project and is often used for cloning repositories during builds.
   - Since Jenkins needs to authenticate with GitLab to clone repositories, it uses this token as a password, and the associated technical user (e.g., `project_bot`) as the username.
   - This token is added as a **Username with password** credential in Jenkins under `Manage Jenkins > Manage Credentials`.

By using these two different methods, you ensure that Jenkins can interact with GitLab securely and efficiently, utilizing the appropriate scope and permissions for each type of interaction.
{{< /notice >}}

#### 3. Configuring Docker Node Connection to GitLab (addinc GitLab SSL certificate)

**Steps:**
1. **Adding a certificate:**
- See bash script for automation. 

#### 4. Taiko and Gauge Test Automation

##### Creating a Jenkins Job Using Jenkins Pipeline and Dockerfile - Step by Step

1. Create a new pipeline in Jenkins.
2. Select GitLab for Docker as the connection to GitLab.
3. Scroll down to the pipeline section.
4. In the dropdown list, select "pipeline script from SCM".
5. In the SCM dropdown list, select "Git".
6. Enter the GitLab repository URL.
7. Select the API token for the project from the dropdown list.
8. Select the branch, e.g., "main".
9. Leave Jenkinsfile name as it is.
10. In the Jenkinsfile, define the steps and specify the path to the Dockerfile located in the GitLab repository where Taiko tests and Gauge reports are stored.

Example Jenkinsfile:

```groovy
pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }
    parameters {
        choice(name: 'choose_server', choices: ['ArgoCD', 'AWX', 'AdGuardHome', 'Confluence', 'GitLab', 'Grafana', 'HomeAssistant', 'Jenkins', 'NginxProxyManager', 'Proxmox', 'Synology', 'Wazuh', 'PortainerProxy', 'PortainerAdGuardHome'], description: 'Select server')
        choice(name: 'username', choices: ['admin'], description: 'Choose username')
        choice(name: 'SPEC_FILE', choices: ['test-awx.spec'], description: 'Choose spec file to test a module')
    }
    environment {
        REPO_URL = 'git@gitlab.sysadmin.homes:developers/awx-taiko.git'
        BRANCH = 'main'
        REPORT_PATH = '/workspace'
        REPORT_NAME = 'TAIKO_AUTOMATED_TESTS'
        username = 'awx-user-id'
        password = 'awx-password-id'
    }
    agent {
        dockerfile {
            filename './Dockerfile-Taiko'
            label 'docker'
        }
    }
    stages {
        stage('Resolve IP') {
            steps {
                script {
                    def serverAddressMapping = [
                        'ArgoCD': 'argocd.sysadmin.homes',
                        'AWX': 'awx.sysadmin.homes',
                        'AdGuardHome': '10.10.0.108',
                        'Confluence': 'confluence.sysadmin.homes',
                        'GitLab': 'gitlab.sysadmin.homes',
                        'Grafana': 'grafana.sysadmin.homes',
                        'HomeAssistant': 'ha.sysadmin.info.pl',
                        'Jenkins': 'jenkins.sysadmin.homes',
                        'NginxProxyManager': 'sysadmin.homes',
                        'Proxmox': 'proxmox.sysadmin.homes',
                        'Synology': 'synology.sysadmin.homes',
                        'Wazuh': 'wazuh.sysadmin.homes',
                        'PortainerProxy': 'npm-portainer.sysadmin.homes',
                        'PortainerAdGuardHome': 'adguard-portainer.sysadmin.homes'
                    ]
                    env.server_address = serverAddressMapping[params.choose_server]
                }
            }
        }
        stage('Init container') {
            steps {
                script {
                    sh 'mkdir -p ~/.ssh && ssh-keyscan gitlab.sysadmin.homes >> ~/.ssh/known_hosts'
                }
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'main']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [
                        [$class: 'CheckoutOption', timeout: 360],
                        [$class: 'CloneOption', timeout: 360],
                    ],
                    submoduleCfg: [],
                    userRemoteConfigs: [[credentialsId: 'Taiko-token', url: "https://gitlab.sysadmin.homes/developers/awx-taiko.git"]]
                ])
            }
        }
        stage('Taiko and Gauge reports') {
            steps {
                withCredentials([string(credentialsId: username, variable: 'username'), string(credentialsId: password, variable: 'password')]) {
                    script {
                        sh '''
                            export server_address=$server_address
                            export username=$username
                            export password=$password
                        '''
                        sh '''
                            ln -s /usr/local/lib/node_modules/ $WORKSPACE/node_modules
                            ln -s /usr/local/lib/node_modules/ /lib/node_modules
                            rm -f *.tar downloaded/*
                            rm -rf reports .gauge logs
                        '''
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh """
                                gauge run ${WORKSPACE}/specs/${params.SPEC_FILE}
                            """
                        }
                    }
                }
            }
        }
        stage('Archive artifacts') {
            steps {
                script {
                    if (sh(script: "[ -d \"${WORKSPACE}/reports/\" ]", returnStatus: true) == 0) {
                        def formattedDate = new Date().format("dd_MM_yyyy_HH_mm")
                        def filename = "PASS_${REPORT_NAME}_${formattedDate}.tar"
                        sh """
                            tar -cf ${filename} ${WORKSPACE}/reports/ ${WORKSPACE}/logs/
                        """
                        archiveArtifacts artifacts: "${filename}"
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
```

**Adding `awx-user-id` and `awx-password-id` as Secret Text in Jenkins**

To securely store and manage sensitive information, add the `awx-user-id` and `awx-password-id` as secret text credentials in Jenkins. Follow these steps:

1. **Navigate to Jenkins Credentials:**
   - Go to the Jenkins web interface.
   - Click on `Manage Jenkins` > `Manage Credentials`.

2. **Add Secret Text Credentials:**
   - Select the appropriate domain (e.g., `global`).
   - Click on `Add Credentials`.
   - For `Kind`, select `Secret text`.
   - In the `Secret` field, enter the `awx-user-id` value.
   - Add a meaningful ID (e.g., `awx-user-id`).
   - Click `OK`.

3. **Repeat for `awx-password-id`:**
   - Repeat the steps to add another secret text credential.
   - Enter the `awx-password-id` value and ID.

4. **Using the Secret Text in Jenkins Pipeline:**
   - When configuring your Jenkinsfile, use the credentials binding to access these secrets:

```groovy
withCredentials([string(credentialsId: 'awx-user-id', variable: 'username'), string(credentialsId: 'awx-password-id', variable: 'password')]) {
    // Your pipeline code
}
```

Example Dockerfile-Taiko that is also added in the GitLab project:

```docker
FROM node:18-alpine3.17

# Updating apk
RUN apk update > /dev/null

# Installing additional tools.
RUN apk add --no-cache curl unzip git openssh bash nano wget ca-certificates openssl > /dev/null

# Clean apk cache
RUN rm -rf /var/cache/apk/*

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
RUN npm config set registry "http://registry.npmjs.org"

# Installation of the required npm packages
RUN npm install --no-fund --save -g npm@9.5.1 log4js@6.9.1 xml2js@0.6.2 isomorphic-fetch@3.0.0 node-ssh@13.1.0 taiko

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

This line:

```
RUN npm config set registry "https://nexus.sysadmin.homes/repository/npmjs.org"
```

is responsible for npm packages. It fetches packages to Nexus, which acts as a cache proxy for nodejs and npm.

#### Establishing SSH Connection to Docker Node

Before running the pipeline job in Jenkins, establish an SSH connection from the root user on the Docker node to GitLab:

```bash
ssh -T git@10.10.0.119
```

#### Testing and Running
5. **Creating and Running Tests**
   - Create Taiko and Gauge test scripts.
   - Run the tests from Jenkins, monitoring results and generating reports.

6. **Troubleshooting**
   - SSH settings and UID/GID for users in Docker.
   - Troubleshooting headless browser launch issues.

#### Summary

With the above step-by-step instructions, you should be able to automate your tests and create a concise and clear textual tutorial. If you have further questions or need additional assistance, let me know!

---

### Explanation

1. **API Token in Jenkins:**
   - Jenkins does not use RSA or ED25519 keys to communicate with GitLab; it uses API tokens. This token should be created at the technical user level in GitLab, not at the project level. This means you need to create a technical user in GitLab, generate an API token for this user, and use it in the Jenkins configuration.

2. **Project Token in Jenkinsfile:**
   - In the `Jenkinsfile`, `credentialsId: 'Taiko-token'` is declared, which refers to a project-level token. This token is not added in Jenkins using the GitLab API token but rather as a regular username and password in Jenkins credentials. This means you need to add the token as the password, and as the ID in Jenkins, use the username copied from the members section of the GitLab project.

This solution works because Jenkins requires authentication to access the GitLab repository, and instead of full login through the API, it uses user credentials with the token as the password.

#### Taiko Test Example:

**awx-steps.js**

```javascript
/* globals gauge*/
"use strict";
const path = require('path');
const {
    openBrowser,
    write,
    closeBrowser,
    goto,
    button,
    press,
    screenshot,
    above,
    click,
    checkBox,
    listItem,
    toLeftOf,
    link,
    text,
    into,
    textBox,
    evaluate
} = require('taiko');
const assert = require("assert");
const headless = process.env.headless_chrome.toLowerCase() === 'true';

beforeSuite(async () => {
    await openBrowser({
        headless: headless
    })
});

afterSuite(async () => {
    await closeBrowser();
});

// Return a screenshot file name
gauge.customScreenshotWriter = async function () {
    const screenshotFilePath = path.join(process.env['gauge_screenshots_dir'],
        `screenshot-${process.hrtime.bigint()}.png`);

    await screenshot({
        path: screenshotFilePath
    });
    return path.basename(screenshotFilePath);
};
step("Navigate to the AWX login page", async function () {
    await goto("awx.sysadmin.homes");
});

step("Assert the login page is loaded", async () => {
    assert(await text("Welcome to AWX!").exists());
});

step('Use credentials <username>:<password>', async (username, password) => {
    await write(process.env.username, into(textBox("Username"), {force:true}));
    await write(process.env.password, into(textBox("Password"), {force:true}));
});

step("Click the login button", async () => {
    await click(button("Log In"));
});

step("Verify successful login", async () => {
    assert(await text("Dashboard").exists());
});
step("Clear all tasks", async function () {
    await evaluate(() => localStorage.clear());
});
```

**test-awx.spec**

```markdown
# AWX login test

to execute this specification, use
    npm test

This is a context step that runs before every scenario
* Navigate to the AWX login page

## Login to AWX
* Assert the login page is loaded
* Use credentials "admin":"password"
* Click the login button
* Verify successful login
___
* Clear all tasks
```