---
title: Jenkins and Nexus OSS - Managing NPM Authentication
date: 2024-05-24T20:00:00+00:00
description: Jenkins and Nexus OSS - Managing NPM Authentication
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
    image: images/2024-thumbs/taiko09.webp
---

**Here is a video tutorial**

{{<youtube iEUKdKGy_jo>}}

### Introduction

In the Nexus OSS version, there is no native option to generate API tokens for users. However, we can work around this issue by creating a user specifically for npm and using their credentials in the `.npmrc` file. Here's how to do it:

### 1. Nexus Server Configuration

#### Add repositories

##### 1. Create an npm Hosted Repository
1. Click on **"Repositories"** under the **"Repository"** menu.
2. Click on the **"Create repository"** button.
3. Choose **"npm (hosted)"** from the list.
4. Configure the repository:
    - **Name**: `npm-hosted`
    - **Deployment policy**: Choose your preferred policy (e.g., `Disable redeploy`)
5. Click **"Create repository"**.

##### 2. Create an npm Proxy Repository
1. Click on **"Repositories"** under the **"Repository"** menu.
2. Click on the **"Create repository"** button.
3. Choose **"npm (proxy)"** from the list.
4. Configure the repository:
    - **Name**: `npm-proxy`
    - **Remote Storage**: `https://registry.npmjs.org`
5. Click **"Create repository"**.

##### 3. Create an npm Group Repository
1. Click on **"Repositories"** under the **"Repository"** menu.
2. Click on the **"Create repository"** button.
3. Choose **"npm (group)"** from the list.
4. Configure the repository:
    - **Name**: `npm-group`
    - **Member repositories**: Add `npm-hosted` and `npm-proxy` to the group
5. Click **"Create repository"**.

##### Create a New Role with Read-Only Permissions

1. **Navigate to "Security" -> "Roles"**.
2. **Click "Create role"**.
   - **Role ID:** `npm-read-only`
   - **Role Name:** `NPM Read Only`
   - **Description:** `Read-only access to npm repositories`
3. **In the "Privileges" tab, add the following privileges**:
    - `nx-repository-view-npm-*-add`
    - `nx-repository-view-npm-*-browse`
    - `nx-repository-view-npm-*-read`
    - `nx-repository-view-npm-npm-group-browse`
    - `nx-repository-view-npm-npm-group-read`
    - `nx-repository-view-npm-npm-hosted-browse`
    - `nx-repository-view-npm-npm-hosted-read`
    - `nx-repository-view-npm-npm-proxy-browse`
    - `nx-repository-view-npm-npm-proxy-read`

#### Create a user specifically for npm

1. **Log in to Nexus Repository Manager**.
2. **Navigate to "Security" -> "Users"**.
3. **Click "Create user"**.
   - **Username:** `npm-user`
   - **Password:** `securepassword`
   - **First Name:** `NPM`
   - **Last Name:** `User`
   - **Email:** `npm-user@example.com`
4. **Click "Create"** to save the user.

##### Assign the Role to the New User

1. **Navigate to "Security" -> "Users"**.
2. **Click on the newly created user (`npm-user`)**.
3. **In the "Roles" tab, add the `npm-read-only` role**.
4. **Click "Save"**.

### 2. Jenkinsfile Configuration

Ensure that you store the npm credentials as `Secret Text` or `Username with password` in Jenkins and use them during the build process. 
For this example, let's assume you store the username and password as `Secret Text`.

#### Add npm Credentials in Jenkins

1. Navigate to **Jenkins Dashboard** > **Manage Jenkins** > **Manage Credentials**.
2. Add new credentials:
   - **Kind:** Secret Text
   - **Secret:** `npm-user` (ID: `nexus-npm-user`)
   - **Description:** Nexus npm username
3. Add another Secret Text:
   - **Kind:** Secret Text
   - **Secret:** `securepassword` (ID: `nexus-npm-pass`)
   - **Description:** Nexus npm password

##### Use Credentials in Jenkinsfile

```groovy
pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }
    parameters {
        choice(name: 'choose_server', choices: ['AWX', 'ArgoCD', 'AdGuardHome', 'Confluence', 'GitLab', 'Grafana', 'HomeAssistant', 'Jenkins', 'NginxProxyManager', 'Proxmox', 'Synology', 'Wazuh', 'PortainerProxy', 'PortainerAdGuardHome'], description: 'Select server')
        choice(name: 'SPEC_FILE', choices: ['test-awx.spec', 'test-argocd.spec', 'test-adguardhome.spec', 'test-confluence.spec', 'test-gitlab.spec', 'test-grafana.spec', 'test-homeassistant.spec', 'test-jenkins.spec', 'test-nginxproxymanager.spec', 'test-proxmox.spec', 'test-synology.spec', 'test-wazuh.spec', 'test-portainerproxy.spec', 'test-portaineradguardhome.spec'], description: 'Choose spec file to test a module')
    }
    environment {
        REPO_URL = 'git@gitlab.sysadmin.homes:developers/awx-taiko.git'
        BRANCH = 'main'
        REPORT_PATH = '/workspace'
        REPORT_NAME = 'TAIKO_AUTOMATED_TESTS'
        DOCKER_IMAGE = "awx-taiko"
    }
    stages {
        stage('Clean Workspace Before Start') {
            steps {
                cleanWs()
            }
        }
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
        stage('Checkout Code') {
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
        stage('Set Environment Variables') {
            steps {
                script {
                    switch (params.choose_server) {
                        case 'AWX':
                            env.USERNAME_ID = 'awx-username'
                            env.PASSWORD_ID = 'awx-password'
                            break
                        case 'ArgoCD':
                            env.USERNAME_ID = 'argocd-username'
                            env.PASSWORD_ID = 'argocd-password'
                            break
                        case 'AdGuardHome':
                            env.USERNAME_ID = 'adguard-username'
                            env.PASSWORD_ID = 'adguard-password'
                            break
                        case 'Confluence':
                            env.USERNAME_ID = 'confluence-username'
                            env.PASSWORD_ID = 'confluence-password'
                            break
                        case 'GitLab':
                            env.USERNAME_ID = 'gitlab-username'
                            env.PASSWORD_ID = 'gitlab-password'
                            break
                        case 'Grafana':
                            env.USERNAME_ID = 'grafana-username'
                            env.PASSWORD_ID = 'grafana-password'
                            break
                        case 'HomeAssistant':
                            env.USERNAME_ID = 'homeassistant-username'
                            env.PASSWORD_ID = 'homeassistant-password'
                            break
                        case 'Jenkins':
                            env.USERNAME_ID = 'jenkins-username'
                            env.PASSWORD_ID = 'jenkins-password'
                            break
                        case 'NginxProxyManager':
                            env.USERNAME_ID = 'nginxproxy-username'
                            env.PASSWORD_ID = 'nginxproxy-password'
                            break
                        case 'Proxmox':
                            env.USERNAME_ID = 'proxmox-username'
                            env.PASSWORD_ID = 'proxmox-password'
                            break
                        case 'Synology':
                            env.USERNAME_ID = 'synology-username'
                            env.PASSWORD_ID = 'synology-password'
                            break
                        case 'Wazuh':
                            env.USERNAME_ID = 'wazuh-username'
                            env.PASSWORD_ID = 'wazuh-password'
                            break
                        case 'PortainerProxy':
                            env.USERNAME_ID = 'portainer-username'
                            env.PASSWORD_ID = 'portainer-password'
                            break
                        case 'PortainerAdGuardHome':
                            env.USERNAME_ID = 'portainer-username'
                            env.PASSWORD_ID = 'portainer-password'
                            break
                        default:
                            error("Unsupported server: ${params.choose_server}")
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                withCredentials([
                    string(credentialsId: 'nexus-npm-user', variable: 'NPM_USER'),
                    string(credentialsId: 'nexus-npm-pass', variable: 'NPM_PASS')
                ]) {
                    script {
                        echo "Building Docker image with Nexus credentials:"
                        sh '''
                            docker build -t ${DOCKER_IMAGE} \
                            --build-arg NPM_USER=${NPM_USER} \
                            --build-arg NPM_PASS=${NPM_PASS} -f Dockerfile .
                        '''
                    }
                }
            }
        }
        stage('Run Taiko and Gauge reports') {
            agent {
                docker {
                    image "${env.DOCKER_IMAGE}"
                    args '-v /workspace:/workspace'
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: env.USERNAME_ID, variable: 'username'),
                    string(credentialsId: env.PASSWORD_ID, variable: 'password')
                ]) {
                    script {
                        sh '''
                            export server_address=${server_address}
                            export username=${username}
                            export password=${password}
                        '''
                        sh "ln -s /usr/local/lib/node_modules/ ${WORKSPACE}/node_modules"
                        sh 'ln -s /usr/local/lib/node_modules/ /lib/node_modules'
                        sh 'rm -f *.tar downloaded//*'
                        sh 'rm -rf reports .gauge logs'
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
        stage('Clean Taiko leftovers on a Docker node') {
            steps {
                script {
                    cleanWs()
                    node('docker') {
                        cleanWs()
                        def workspaceDir = pwd()
                        sh "rm -rf ${workspaceDir}/Taiko* ${workspaceDir}/Taiko@* ${workspaceDir}/Taiko@2*"
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
##### Jenkinsfile - explanation:

This Jenkinsfile defines a pipeline for building and testing a project using Jenkins. Here is a detailed explanation of each section:

1. **Pipeline Definition**:
    ```groovy
    pipeline {
        agent any
    ```
    The pipeline can run on any available agent.

2. **Options**:
    ```groovy
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }
    ```
    - `buildDiscarder(logRotator(numToKeepStr: '5'))`: Keeps only the last 5 builds to save space.
    - `disableConcurrentBuilds()`: Ensures that only one build runs at a time.

3. **Parameters**:
    ```groovy
    parameters {
        choice(name: 'choose_server', choices: [...], description: 'Select server')
        choice(name: 'SPEC_FILE', choices: [...], description: 'Choose spec file to test a module')
    }
    ```
    - `choose_server`: Allows the user to select a server from a list.
    - `SPEC_FILE`: Allows the user to choose a specification file for testing.

4. **Environment Variables**:
    ```groovy
    environment {
        REPO_URL = 'git@gitlab.sysadmin.homes:developers/awx-taiko.git'
        BRANCH = 'main'
        REPORT_PATH = '/workspace'
        REPORT_NAME = 'TAIKO_AUTOMATED_TESTS'
        DOCKER_IMAGE = "awx-taiko"
    }
    ```
    Sets various environment variables used throughout the pipeline.

5. **Stages**:
    - **Clean Workspace Before Start**:
        ```groovy
        stage('Clean Workspace Before Start') {
            steps {
                cleanWs()
            }
        }
        ```
        Cleans the workspace before starting the build.

    - **Resolve IP**:
        ```groovy
        stage('Resolve IP') {
            steps {
                script {
                    def serverAddressMapping = [...]
                    env.server_address = serverAddressMapping[params.choose_server]
                }
            }
        }
        ```
        Maps the selected server to its IP address.

    - **Checkout Code**:
        ```groovy
        stage('Checkout Code') {
            steps {
                script {
                    sh 'mkdir -p ~/.ssh && ssh-keyscan gitlab.sysadmin.homes >> ~/.ssh/known_hosts'
                }
                checkout([...])
            }
        }
        ```
        Sets up SSH keys and checks out the code from GitLab.

    - **Set Environment Variables**:
        ```groovy
        stage('Set Environment Variables') {
            steps {
                script {
                    switch (params.choose_server) {
                        case 'AWX':
                            env.USERNAME_ID = 'awx-username'
                            env.PASSWORD_ID = 'awx-password'
                            break
                        ...
                    }
                }
            }
        }
        ```
        Sets environment variables based on the selected server.

    - **Build Docker Image**:
        ```groovy
        stage('Build Docker Image') {
            steps {
                withCredentials([
                    string(credentialsId: 'nexus-npm-user', variable: 'NPM_USER'),
                    string(credentialsId: 'nexus-npm-pass', variable: 'NPM_PASS')
                ]) {
                    script {
                        echo "Building Docker image with Nexus credentials:"
                        sh '''
                            docker build -t ${DOCKER_IMAGE} \
                            --build-arg NPM_USER=${NPM_USER} \
                            --build-arg NPM_PASS=${NPM_PASS} -f Dockerfile .
                        '''
                    }
                }
            }
        }
        ```
        Builds a Docker image using credentials from a Nexus repository.

    - **Run Taiko and Gauge Reports**:
        ```groovy
        stage('Run Taiko and Gauge reports') {
            agent {
                docker {
                    image "${env.DOCKER_IMAGE}"
                    args '-v /workspace:/workspace'
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: env.USERNAME_ID, variable: 'username'),
                    string(credentialsId: env.PASSWORD_ID, variable: 'password')
                ]) {
                    script {
                        sh '''
                            export server_address=${server_address}
                            export username=${username}
                            export password=${password}
                        '''
                        sh "ln -s /usr/local/lib/node_modules/ ${WORKSPACE}/node_modules"
                        sh 'ln -s /usr/local/lib/node_modules/ /lib/node_modules'
                        sh 'rm -f *.tar downloaded//*'
                        sh 'rm -rf reports .gauge logs'
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh """
                                gauge run ${WORKSPACE}/specs/${params.SPEC_FILE}
                            """
                        }
                    }
                }
            }
        }
        ```
        Runs tests using Taiko and Gauge within the Docker container.

    - **Archive Artifacts**:
        ```groovy
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
        ```
        Archives the test reports and logs if they exist.

    - **Clean Taiko Leftovers on a Docker Node**:
        ```groovy
        stage('Clean Taiko leftovers on a Docker node') {
            steps {
                script {
                    cleanWs()
                    node('docker') {
                        cleanWs()
                        def workspaceDir = pwd()
                        sh "rm -rf ${workspaceDir}/Taiko* ${workspaceDir}/Taiko@* ${workspaceDir}/Taiko@2*"
                    }
                }
            }
        }
        ```
        Cleans up any leftover files from the Taiko tests.

6. **Post Actions**:
    ```groovy
    post {
        always {
            cleanWs()
        }
    }
    ```
    Ensures the workspace is cleaned up after the pipeline completes, regardless of the result.

In summary, this Jenkinsfile sets up a multi-stage pipeline that checks out code from a GitLab repository, builds a Docker image, runs tests using Taiko and Gauge, archives the test reports, and cleans up the workspace. It uses several parameters and environment variables to customize the behavior based on the selected server and specification file.

#### 3. Dockerfile Configuration

You need to pass the username and password as arguments when building the Docker image.

##### Example Dockerfile

```dockerfile
FROM node:18-alpine3.17

# Arguments to pass the npm user and password
ARG NPM_USER
ARG NPM_PASS

# Encode username and password in base64 and create .npmrc file
RUN echo "registry=https://nexus.sysadmin.homes/repository/npm-group/" > /root/.npmrc
RUN echo "//nexus.sysadmin.homes/repository/npm-group/:_auth=$(echo -n ${NPM_USER}:${NPM_PASS} | base64)" >> /root/.npmrc
RUN echo "always-auth=true" >> /root/.npmrc

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
RUN npm config set registry "https://nexus.sysadmin.homes/repository/npm-group/"

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

##### Dockerfile - explanation:

This Dockerfile is designed to create a Docker image containing an environment for running a Node.js application and tools for testing using Gauge and Taiko. Here is a detailed description of each line and section of this Dockerfile:

1. **Base Image**:
    ```dockerfile
    FROM node:18-alpine3.17
    ```
    The base image is `node:18-alpine3.17`, meaning we are using a lightweight version of Alpine Linux with Node.js version 18 installed.

2. **Define ARG Variables**:
    ```dockerfile
    ARG NPM_USER
    ARG NPM_PASS
    ```
    Defines argument variables `NPM_USER` and `NPM_PASS`, which will be used for authentication when fetching npm packages.

3. **Configure .npmrc**:
    ```dockerfile
    RUN echo "registry=https://nexus.sysadmin.homes/repository/npm-group/" > /root/.npmrc
    RUN echo "//nexus.sysadmin.homes/repository/npm-group/:_auth=$(echo -n ${NPM_USER}:${NPM_PASS} | base64)" >> /root/.npmrc
    RUN echo "always-auth=true" >> /root/.npmrc
    ```
    These commands create the `.npmrc` file in the root directory (`/root`), configuring the npm registry and adding base64-encoded credentials for authentication.

4. **Update Packages and Install Additional Tools**:
    ```dockerfile
    RUN apk update > /dev/null
    RUN apk add --no-cache curl unzip git openssh bash nano wget ca-certificates openssl > /dev/null
    ```
    Updates the `apk` package index and installs various tools such as `curl`, `unzip`, `git`, `openssh`, `bash`, `nano`, `wget`, `ca-certificates`, and `openssl`. Redirecting to `/dev/null` hides the operation details.

5. **Clean apk Cache**:
    ```dockerfile
    RUN rm -rf /var/cache/apk/*
    ```
    Removes the `apk` cache to reduce the image size.

6. **SSH Configuration for GitLab**:
    ```dockerfile
    RUN mkdir -p /root/.ssh && ssh-keyscan gitlab.sysadmin.homes >> /root/.ssh/known_hosts
    ```
    Creates the `.ssh` directory and adds the GitLab SSH key to the `known_hosts` file, preventing authentication prompts during SSH connections.

7. **Install Gauge**:
    ```dockerfile
    RUN curl -Ssl https://downloads.gauge.org/stable | sh
    ```
    Downloads and installs Gauge using `curl`.

8. **Install Gauge Plugins**:
    ```dockerfile
    RUN gauge install js && \
        gauge install screenshot && \
        gauge install html-report
    ```
    Installs three Gauge plugins: `js`, `screenshot`, and `html-report`.

9. **npm Configuration**:
    ```dockerfile
    RUN npm config set strict-ssl false
    RUN npm config set registry "https://nexus.sysadmin.homes/repository/npm-group/"
    ```
    Configures npm by disabling strict SSL checking and setting a custom npm registry.

10. **Install npm Packages**:
    ```dockerfile
    RUN npm install --no-fund --save -g npm@9.5.1 log4js@6.9.1 xml2js@0.6.2 isomorphic-fetch@3.0.0 node-ssh@13.1.0 taiko
    ```
    Installs various npm packages globally, such as `npm`, `log4js`, `xml2js`, `isomorphic-fetch`, `node-ssh`, and `taiko`.

11. **Disable Proxy**:
    ```dockerfile
    ENV http_proxy=
    ENV https_proxy=
    ```
    Removes proxy environment variables.

12. **Set Environment Variables**:
    ```dockerfile
    ENV NPM_CONFIG_PREFIX=/usr/local/lib/node_modules
    ENV PATH="${NPM_CONFIG_PREFIX}/bin:${PATH}"
    ENV TAIKO_BROWSER_ARGS=--no-sandbox,--start-maximized,--disable-dev-shm-usage,--headless,--disable-gpu
    ENV TAIKO_BROWSER_PATH=/usr/bin/chromium-browser
    ```
    Sets several environment variables, including the npm installation path, Taiko browser arguments, and the path to the Chromium browser.

13. **Install Chromium Browser**:
    ```dockerfile
    RUN apk add chromium
    ```
    Installs the Chromium browser from the Alpine repositories.

In summary, this Dockerfile sets up a Node.js environment based on Alpine Linux, installs various tools needed for testing applications using Gauge and Taiko, and configures npm and SSH authentication.


### Summary

1. Create a user specifically for npm in Nexus and asign a role to the user to read npm repository.
2. Store the username and password as credentials (Secret text) in Jenkins and pass them as arguments when building the Docker image.
3. Configure the `.npmrc` file in the Dockerfile, using the username and password in base64 format.

By following these modifications, you should be able to build your Docker images with the npm credentials securely passed from Jenkins, ensuring that your npm packages are fetched from Nexus with the appropriate authentication.