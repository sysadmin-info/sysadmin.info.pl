---
title: Zarządzanie argumentami kompilacji Docker i zmiennymi środowiskowymi w Jenkins Pipelines
date: 2024-05-25T16:00:00+00:00
description: Zarządzanie argumentami kompilacji Docker i zmiennymi środowiskowymi w Jenkins Pipelines
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
    image: images/2024-thumbs/jenkins01.webp
---

**Tutaj jest wideo tutorial**

{{<youtube XVvaXgzPWKo>}}

### Wstęp

W tym poradniku omówimy, jak prawidłowo zarządzać argumentami kompilacji Docker i zmiennymi środowiskowymi w pipeline Jenkins, koncentrując się na różnicach między definiowaniem ustawień Docker w bloku agent a w etapach pipeline. Użyjemy dwóch przykładów pipeline Jenkins, aby zilustrować typowe problemy i ich rozwiązania.

### Przegląd Problemów

Główny problem pojawia się, gdy argumenty kompilacji i poświadczenia zdefiniowane w środowisku Jenkins nie są prawidłowo przekazywane do Dockerfile podczas wykonywania pipeline. Może to skutkować niezaładowaniem poświadczeń, co powoduje błąd kompilacji.

### Przykłady Pipeline

Użyjemy dwóch skryptów pipeline Jenkins, aby zrozumieć problem i jego rozwiązanie.

#### Pipeline 1: Używanie Dockerfile w Bloku Agent

Ten pipeline definiuje Dockerfile w bloku agent, oczekując, że zmienne środowiskowe będą dostępne w procesie budowy Docker.

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

#### Pipeline 1 - zmodyfikowany: Używanie Dockerfile w Bloku Agent

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

#### Pipeline 2: Definiowanie Ustawień Docker w Etapie Budowy

Ten pipeline oddziela proces budowy obrazu Docker do osobnego etapu, umożliwiając lepsze zarządzanie zmiennymi środowiskowymi i poświadczeniami.

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
                        'AdGuardHome': '

10.10.0.108',
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

### Szczegółowa Analiza

#### Problemy Pipeline 1

- **Zmienne Środowiskowe i Poświadczenia**: W pierwszym pipeline zmienne środowiskowe zdefiniowane w sekcji `environment` nie są automatycznie dostępne jako argumenty kompilacji w Dockerfile. Dodatkowo, poświadczenia zdefiniowane w Jenkins muszą być wyraźnie załadowane przy użyciu bloku `withCredentials` w odpowiednim etapie.
  
- **Agent Dockerfile**: Użycie `agent dockerfile` oznacza, że cały pipeline działa w kontekście kontenera Docker zbudowanego z określonego Dockerfile. Jeśli poświadczenia i zmienne środowiskowe nie są poprawnie przekazywane jako argumenty kompilacji, nie będą one dostępne w kontenerze Docker.

#### Rozwiązania Pipeline 2

- **Oddzielony Etap Budowy**: Drugi pipeline wyraźnie oddziela proces budowy obrazu Docker do własnego etapu. Umożliwia to lepszą kontrolę i zarządzanie zmiennymi środowiskowymi oraz poświadczeniami.

- **Blok WithCredentials**: Użycie `withCredentials` w etapie budowy zapewnia, że poświadczenia są prawidłowo załadowane i dostępne jako zmienne środowiskowe. Mogą one być następnie przekazane jako argumenty kompilacji do procesu budowy Docker.

- **Agent Obrazu Docker**: Kolejne etapy używają zbudowanego obrazu Docker jako agenta, zapewniając, że wszystkie niezbędne zależności i zmienne środowiskowe są poprawnie skonfigurowane.

### Najlepsze Praktyki

1. **Oddzielanie Kontekstów Budowy i Wykonania**: Zawsze oddzielaj proces budowy obrazu Docker od jego wykonania w pipeline. Zapewnia to odpowiednie zarządzanie zmiennymi środowiskowymi i poświadczeniami.
  
2. **Wyraźne Ładowanie Poświadczeń**: Używaj bloku `withCredentials` do wyraźnego ładowania poświadczeń w etapach, które tego wymagają. Zapewnia to, że wrażliwe informacje są przetwarzane bezpiecznie i są dostępne tylko wtedy, gdy są potrzebne.

3. **Przekazywanie Argumentów Kompilacji Wyraźnie**: Podczas budowania obrazów Docker przekazuj niezbędne argumenty kompilacji wyraźnie za pomocą opcji `--build-arg`. Zapewnia to, że wszystkie wymagane zmienne są dostępne podczas procesu budowy.

4. **Modularne i Utrzymywalne Pipelines**: Strukturyzuj swoje pipelines Jenkins w sposób modularny, oddzielając różne zadania (np. pobieranie kodu, konfiguracja środowiska, budowa, testowanie i wd

rażanie). Ułatwia to utrzymanie i rozwiązywanie problemów w pipeline.

### Podsumowanie

Przestrzegając tych najlepszych praktyk i efektywnie strukturyzując swoje pipelines Jenkins, możesz zapewnić, że zmienne środowiskowe, poświadczenia i argumenty kompilacji są prawidłowo zarządzane, co prowadzi do bardziej niezawodnych i bezpiecznych workflow CI/CD. Drugi przykład pipeline demonstruje solidne podejście do obsługi budów Docker w Jenkins, rozwiązując typowe problemy i zapewniając utrzymywalne rozwiązanie.