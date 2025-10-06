---
title: Managing Docker Build Arguments and Environment Variables in Jenkins Pipelines
date: 2024-05-25T16:00:00+00:00
description: Managing Docker Build Arguments and Environment Variables in Jenkins Pipelines
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Jenkins
categories:
- Taiko
- Gauge
- Node.js
- npm
- Jenkins
cover:
    image: images/2024-thumbs/jenkins01.webp
---

**Here is a video tutorial**

{{<youtube XVvaXgzPWKo>}}

### Introduction

In this tutorial, we will explore how to properly manage Docker build arguments and environment variables within Jenkins pipelines, focusing on the differences between defining Docker settings in the agent block versus within pipeline stages. We will use two Jenkins pipeline examples to illustrate common issues and their solutions.

### Problem Overview

The main issue arises when build arguments and credentials defined in the Jenkins environment are not properly passed to the Dockerfile during the pipeline execution. This can result in credentials not being loaded correctly, causing the build to fail. 

### Example Pipelines

We will use two Jenkins pipeline scripts to understand the problem and its solution. 

#### Pipeline 1: Using Dockerfile in the Agent Block

This pipeline defines a Dockerfile in the agent block, expecting environment variables to be available within the Docker build process.

```groovy
pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }
    parameters {
        choice(name: 'choose_server', choices: ['ArgoCD', 'AWX', 'AdGuardHome', 'Confluence', 'GitLab', 'Grafana', 'HomeAssistant', 'Jenkins', 'NginxProxyManager', 'Proxmox', 'Synology', 'Wazuh', 'PortainerProxy', 'PortainerAdGuardHome'], description: 'Select server')
        choice(name: 'SPEC_FILE', choices: ['test-argocd.spec', 'test-awx.spec', 'test-adguardhome.spec', 'test-confluence.spec', 'test-gitlab.spec', 'test-grafana.spec', 'test-homeassistant.spec', 'test-jenkins.spec', 'test-nginxproxymanager.spec', 'test-proxmox.spec', 'test-synology.spec', 'test-wazuh.spec', 'test-portainerproxy.spec', 'test-portaineradguardhome.spec'], description: 'Choose spec file to test a module')
    }
    environment {
        REPO_URL = 'git@gitlab.sysadmin.homes:developers/awx-taiko.git'
        BRANCH = 'main'
        REPORT_PATH = '/workspace'
        REPORT_NAME = 'TAIKO_AUTOMATED_TESTS'
        NPM_USER = 'nexus-npm-user'
        NPM_PASS = 'nexus-npm-pass'
    }
    agent {
        dockerfile {
            filename './Dockerfile'
            label 'docker'
            additionalBuildArgs "--build-arg REPO_URL=${env.REPO_URL} --build-arg BRANCH=${env.BRANCH} --build-arg REPORT_PATH=${env.REPORT_PATH} --build-arg REPORT_NAME=${env.REPORT_NAME} --build-arg NPM_USER=${env.NPM_USER} --build-arg NPM_PASS=${env.NPM_PASS}"
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
        stage('Taiko and Gauge reports') {
            steps {
                withCredentials([string(credentialsId: env.USERNAME_ID, variable: 'username'), string(credentialsId: env.PASSWORD_ID, variable: 'password')]) {
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

#### Pipeline 1 - modified: Using Dockerfile in the Agent Block

```groovy
pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }
    parameters {
        choice(name: 'choose_server', choices: ['ArgoCD', 'AWX', 'AdGuardHome', 'Confluence', 'GitLab', 'Grafana', 'HomeAssistant', 'Jenkins', 'NginxProxyManager', 'Proxmox', 'Synology', 'Wazuh', 'PortainerProxy', 'PortainerAdGuardHome'], description: 'Select server')
        choice(name: 'SPEC_FILE', choices: ['test-awx.spec', 'test-argocd.spec', 'test-adguardhome.spec', 'test-confluence.spec', 'test-gitlab.spec', 'test-grafana.spec', 'test-homeassistant.spec', 'test-jenkins.spec', 'test-nginxproxymanager.spec', 'test-proxmox.spec', 'test-synology.spec', 'test-wazuh.spec', 'test-portainerproxy.spec', 'test-portaineradguardhome.spec'], description: 'Choose spec file to test a module')
    }
    environment {
        REPO_URL = 'git@gitlab.sysadmin.homes:developers/awx-taiko.git'
        BRANCH = 'main'
        REPORT_PATH = '/workspace'
        REPORT_NAME = 'TAIKO_AUTOMATED_TESTS'
        DOCKER_ARGS = "--build-arg NPM_USER=${NPM_USER} --build-arg NPM_PASS=${NPM_PASS}"
    }
    agent {
        dockerfile {
            filename './Dockerfile'
            label 'docker'
            args "${env.DOCKER_ARGS}"
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
        stage('Taiko and Gauge reports') {
            steps {
                withCredentials([string(credentialsId: env.USERNAME_ID, variable: 'username'), string(credentialsId: env.PASSWORD_ID, variable: 'password')]) {
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

#### Pipeline 2: Defining Docker Settings in Build Stage

This pipeline separates the Docker image build process into a distinct stage, allowing for better management of environment variables and credentials.

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

### Detailed Analysis

#### Pipeline 1 Issues

- **Environment Variables and Credentials**: In the first pipeline, environment variables defined in the `environment` section are not automatically available as build arguments in the Dockerfile. Additionally, credentials defined in Jenkins must be explicitly loaded using the `withCredentials` block within the relevant stage.
  
- **Agent Dockerfile**: Using `agent dockerfile` means that the entire pipeline runs within the context of a Docker container built from the specified Dockerfile. If credentials and environment variables are not correctly passed as build arguments, they will not be available within the Docker container.

#### Pipeline 2 Solutions

- **Separated Build Stage**: The second pipeline explicitly separates the Docker image build process into its own stage. This allows for better control and management of environment variables and credentials.

- **WithCredentials Block**: The use of `withCredentials` within the build stage ensures that the credentials are properly loaded and available as environment variables. These can then be passed as build arguments to the Docker build process.

- **Docker Image Agent**: Subsequent stages use the built Docker image as the agent, ensuring that all necessary dependencies and environment variables are correctly set up.

### Best Practices

1. **Separate Build and Runtime Contexts**: Always separate the build process of a Docker image from its runtime execution within the pipeline. This ensures that environment variables and credentials can be managed appropriately.
  
2. **Explicit Credential Loading**: Use the `withCredentials` block to load credentials explicitly within the stages that require them. This ensures that sensitive information is handled securely and is available only when needed.

3. **Pass Build Arguments Explicitly**: When building Docker images, pass necessary build arguments explicitly using the `--build-arg` option. This ensures that all required variables are available during the build process.

4. **Modular and Maintainable Pipelines**: Structure your Jenkins pipelines in a modular way, separating different concerns (e.g., code checkout, environment setup, build, test, and deploy). This makes the pipeline easier to maintain and troubleshoot.

### Conclusion

By following these best practices and structuring your Jenkins pipelines effectively, you can ensure that environment variables, credentials, and build arguments are correctly managed, leading to more reliable and secure CI/CD workflows. The second pipeline example demonstrates a robust approach to handling Docker builds within Jenkins, addressing common issues and providing a maintainable solution.