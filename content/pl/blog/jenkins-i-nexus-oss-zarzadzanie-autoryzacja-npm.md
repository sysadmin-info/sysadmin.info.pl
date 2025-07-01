---
title: Jenkins i Nexus OSS - Zarządzanie Autoryzacją NPM
date: 2024-05-24T20:00:00+00:00
description: Jenkins i Nexus OSS - Zarządzanie Autoryzacją NPM
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
image: images/2024-thumbs/taiko09.webp
---

**Oto tutorial wideo**

{{<youtube iEUKdKGy_jo>}}

### Wprowadzenie

W wersji Nexus OSS nie ma natywnej opcji generowania tokenów API dla użytkowników. Jednak możemy obejść ten problem, tworząc użytkownika specjalnie dla npm i używając jego poświadczeń w pliku `.npmrc`. Oto jak to zrobić:

### 1. Konfiguracja Serwera Nexus

#### Dodaj repozytoria

##### 1. Utwórz npm Hosted Repository
1. Kliknij **"Repositories"** w menu **"Repository"**.
2. Kliknij przycisk **"Create repository"**.
3. Wybierz **"npm (hosted)"** z listy.
4. Skonfiguruj repozytorium:
    - **Name**: `npm-hosted`
    - **Deployment policy**: Wybierz preferowaną politykę (np. `Disable redeploy`)
5. Kliknij **"Create repository"**.

##### 2. Utwórz npm Proxy Repository
1. Kliknij **"Repositories"** w menu **"Repository"**.
2. Kliknij przycisk **"Create repository"**.
3. Wybierz **"npm (proxy)"** z listy.
4. Skonfiguruj repozytorium:
    - **Name**: `npm-proxy`
    - **Remote Storage**: `https://registry.npmjs.org`
5. Kliknij **"Create repository"**.

##### 3. Utwórz npm Group Repository
1. Kliknij **"Repositories"** w menu **"Repository"**.
2. Kliknij przycisk **"Create repository"**.
3. Wybierz **"npm (group)"** z listy.
4. Skonfiguruj repozytorium:
    - **Name**: `npm-group`
    - **Member repositories**: Dodaj `npm-hosted` i `npm-proxy` do grupy
5. Kliknij **"Create repository"**.

##### Utwórz Nową Rolę z Uprawnieniami Tylko do Odczytu

1. **Przejdź do "Security" -> "Roles"**.
2. **Kliknij "Create role"**.
   - **Role ID:** `npm-read-only`
   - **Role Name:** `NPM Read Only`
   - **Description:** `Read-only access to npm repositories`
3. **W zakładce "Privileges", dodaj następujące uprawnienia**:
    - `nx-repository-view-npm-*-add`
    - `nx-repository-view-npm-*-browse`
    - `nx-repository-view-npm-*-read`
    - `nx-repository-view-npm-npm-group-browse`
    - `nx-repository-view-npm-npm-group-read`
    - `nx-repository-view-npm-npm-hosted-browse`
    - `nx-repository-view-npm-npm-hosted-read`
    - `nx-repository-view-npm-npm-proxy-browse`
    - `nx-repository-view-npm-npm-proxy-read`

#### Utwórz użytkownika specjalnie dla npm

1. **Zaloguj się do Nexus Repository Manager**.
2. **Przejdź do "Security" -> "Users"**.
3. **Kliknij "Create user"**.
   - **Username:** `npm-user`
   - **Password:** `securepassword`
   - **First Name:** `NPM`
   - **Last Name:** `User`
   - **Email:** `npm-user@example.com`
4. **Kliknij "Create"**, aby zapisać użytkownika.

##### Przypisz Rolę Nowemu Użytkownikowi

1. **Przejdź do "Security" -> "Users"**.
2. **Kliknij na nowo utworzonego użytkownika (`npm-user`)**.
3. **W zakładce "Roles", dodaj rolę `npm-read-only`**.
4. **Kliknij "Save"**.

### 2. Konfiguracja Jenkinsfile

Upewnij się, że przechowujesz poświadczenia npm jako `Secret Text` lub `Username with password` w Jenkins i używasz ich podczas procesu budowy. 
Dla tego przykładu załóżmy, że przechowujesz nazwę użytkownika i hasło jako `Secret Text`.

#### Dodaj Poświadczenia npm w Jenkins

1. Przejdź do **Jenkins Dashboard** > **Manage Jenkins** > **Manage Credentials**.
2. Dodaj nowe poświadczenia:
   - **Kind:** Secret Text
   - **Secret:** `npm-user` (ID: `nexus-npm-user`)
   - **Description:** Nexus npm username
3. Dodaj kolejne Secret Text:
   - **Kind:** Secret Text
   - **Secret:** `securepassword` (ID: `nexus-npm-pass`)
   - **Description:** Nexus npm password

##### Użyj Poświadczeń w Jenkinsfile

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
                            env

.PASSWORD_ID = 'adguard-password'
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
##### Jenkinsfile - wyjaśnienie:

Ten Jenkinsfile definiuje pipeline do budowania i testowania projektu za pomocą Jenkins. Oto szczegółowe wyjaśnienie każdej sekcji:

1. **Definicja Pipeline**:
    ```groovy
    pipeline {
        agent any
    ```
    Pipeline może działać na dowolnym dostępnym agencie.

2. **Opcje**:
    ```groovy
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }
    ```
    - `buildDiscarder(logRotator(numToKeepStr: '5'))`: Przechowuje tylko ostatnie 5 budów, aby zaoszczędzić miejsce.
    - `disableConcurrentBuilds()`: Zapewnia, że w danym momencie działa tylko jedna budowa.

3. **Parametry**:
    ```groovy
    parameters {
        choice(name: 'choose_server', choices: [...], description: 'Select server')
        choice(name: 'SPEC_FILE', choices: [...], description: 'Choose spec file to test a module')
    }
    ```
    - `choose_server`: Pozwala użytkownikowi wybrać serwer z listy.
    - `SPEC_FILE`: Pozwala użytkownikowi wybrać plik specyfikacji do testowania.

4. **Zmienne Środowiskowe**:
    ```groovy
    environment {
        REPO_URL = 'git@gitlab.sysadmin.homes:developers/awx-taiko.git'
        BRANCH = 'main'
        REPORT_PATH = '/workspace'
        REPORT_NAME = 'TAIKO_AUTOMATED_TESTS'
        DOCKER_IMAGE = "awx-taiko"
    }
    ```
    Ustawia różne zmienne środowiskowe używane w całym pipeline.

5. **Etapy**:
    - **Clean Workspace Before Start**:
        ```groovy
        stage('Clean Workspace Before Start') {
            steps {
                cleanWs()
            }
        }
        ```
        Czyści obszar roboczy przed rozpoczęciem budowy.

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
        Mapuje wybrany serwer na jego adres IP.

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
        Konfiguruje klucze SSH i pobiera kod z GitLab.

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
        Ustawia zmienne środowiskowe na podstawie wybranego serwera.

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
        Buduje obraz Docker za pomocą poświadczeń z repozytorium Nexus.

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
        Uruchamia testy za pomocą

 Taiko i Gauge wewnątrz kontenera Docker.

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
        Archiwizuje raporty i logi testów, jeśli istnieją.

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
        Czyści wszelkie pozostałości po testach Taiko.

6. **Działania Post**:
    ```groovy
    post {
        always {
            cleanWs()
        }
    }
    ```
    Zapewnia, że obszar roboczy jest czyszczony po zakończeniu pipeline, niezależnie od wyniku.

Podsumowując, ten Jenkinsfile ustawia wieloetapowy pipeline, który pobiera kod z repozytorium GitLab, buduje obraz Docker, uruchamia testy za pomocą Taiko i Gauge, archiwizuje raporty testów oraz czyści obszar roboczy. Używa kilku parametrów i zmiennych środowiskowych, aby dostosować działanie w oparciu o wybrany serwer i plik specyfikacji.

#### 3. Konfiguracja Dockerfile

Musisz przekazać nazwę użytkownika i hasło jako argumenty podczas budowania obrazu Docker.

##### Przykładowy Dockerfile

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

##### Dockerfile - wyjaśnienie:

Ten Dockerfile został zaprojektowany, aby stworzyć obraz Docker zawierający środowisko do uruchamiania aplikacji Node.js oraz narzędzia do testowania za pomocą Gauge i Taiko. Oto szczegółowy opis każdej linii i sekcji tego Dockerfile:

1. **Obraz Bazowy**:
    ```dockerfile
    FROM node:18-alpine3.17
    ```
    Obraz bazowy to `node:18-alpine3.17`, czyli lekka wersja Alpine Linux z zainstalowanym Node.js w wersji 18.

2. **Definicja ARG Variables**:
    ```dockerfile
    ARG NPM_USER
    ARG NPM_PASS
    ```
    Definiuje zmienne argumentów `NPM_USER` i `NPM_PASS`, które będą używane do uwierzytelniania podczas pobierania pakietów npm.

3. **Konfiguracja .npmrc**:
    ```dockerfile
    RUN echo "registry=https://nexus.sysadmin.homes/repository/npm-group/" > /root/.npmrc
    RUN echo "//nexus.sysadmin.homes/repository/npm-group/:_auth=$(echo -n ${NPM_USER}:${NPM_PASS} | base64)" >> /root/.npmrc
    RUN echo "always-auth=true" >> /root/.npmrc
    ```
    Te polecenia tworzą plik `.npmrc` w katalogu root (`/root`), konfigurując rejestr npm i dodając zakodowane w base64 poświadczenia do uwierzytelniania.

4. **Aktualizacja Pakietów i Instalacja Dodatkowych Narzędzi**:
    ```dockerfile
    RUN apk update > /dev/null
    RUN apk add --no-cache curl unzip git openssh bash nano wget ca-certificates openssl > /dev/null
    ```
    Aktualizuje indeks pakietów `apk` i instaluje różne narzędzia, takie jak `curl`, `unzip`, `git`, `openssh`, `bash`, `nano`, `wget`, `ca-certificates` i `openssl`. Przekierowanie do `/dev/null` ukrywa szczegóły operacji.

5. **Czyszczenie Cache apk**:
    ```dockerfile
    RUN rm -rf /var/cache/apk/*
    ```
    Usuwa cache `apk`, aby zmniejszyć rozmiar obrazu.

6. **Konfiguracja SSH dla GitLab**:
    ```dockerfile
    RUN mkdir -p /root/.ssh && ssh-keyscan gitlab.sysadmin.homes >> /root/.ssh/known_hosts
    ```
    Tworzy katalog `.ssh` i dodaje klucz SSH GitLab do pliku `known_hosts`, zapobiegając pytaniom o uwierzytelnienie podczas połączeń SSH.

7. **Instalacja Gauge**:
    ```dockerfile
    RUN curl -Ssl https://downloads.gauge.org/stable | sh
    ```
    Pobiera i instaluje Gauge za pomocą `curl`.

8. **Instalacja Wtyczek Gauge**:
    ```dockerfile
    RUN gauge install js && \
        gauge install screenshot && \
        gauge install html-report
    ```
    Instaluje trzy wtyczki Gauge: `js`, `screenshot` i `html-report`.

9. **Konfiguracja npm**:
    ```dockerfile
    RUN npm config set strict-ssl false
    RUN npm config set registry "https://nexus.sysadmin.homes/repository/npm-group/"
    ```
    Konfiguruje npm, wyłączając ścisłą kontrolę SSL i ustawiając niestandardowy rejestr npm.

10. **Instalacja Pakietów npm**:
    ```dockerfile
    RUN npm install --no-fund --save -g npm@9.5.1 log4js@6.9.1 xml2js@0.6.2 isomorphic-fetch@3.0.0 node-ssh@13.1.0 taiko
    ```
    Instaluje różne pakiety npm globalnie, takie jak `npm`, `log4js`, `xml2js`, `isomorphic-fetch`, `node-ssh` i `taiko`.

11. **Wyłączenie Proxy**:
    ```dockerfile
    ENV http_proxy=
    ENV https_proxy=
    ```
    Usuwa zmienne środowiskowe proxy.

12. **Ustawienie Zmiennych Środowiskowych**:
    ```dockerfile
    ENV NPM_CONFIG_PREFIX=/usr/local/lib/node_modules
    ENV PATH="${NPM_CONFIG_PREFIX}/bin:${PATH}"
    ENV TAIKO_BROWSER_ARGS=--no-sandbox,--start-maximized,--disable-dev-shm-usage,--headless,--disable-gpu
    ENV TAIKO_BROWSER_PATH=/usr/bin/chromium-browser
    ```
    Ustawia kilka zmiennych środowiskowych, w tym ścieżkę instalacji npm, argumenty przeglądarki Taiko i ścieżkę do przeglądarki Chromium.

13. **Inst

alacja Przeglądarki Chromium**:
    ```dockerfile
    RUN apk add chromium
    ```
    Instaluje przeglądarkę Chromium z repozytoriów Alpine.

Podsumowując, ten Dockerfile ustawia środowisko Node.js oparte na Alpine Linux, instaluje różne narzędzia potrzebne do testowania aplikacji za pomocą Gauge i Taiko oraz konfiguruje uwierzytelnianie npm i SSH.

### Podsumowanie

1. Utwórz użytkownika specjalnie dla npm w Nexus i przypisz rolę użytkownikowi do odczytu repozytorium npm.
2. Przechowuj nazwę użytkownika i hasło jako poświadczenia (Secret text) w Jenkins i przekaż je jako argumenty podczas budowania obrazu Docker.
3. Skonfiguruj plik `.npmrc` w Dockerfile, używając nazwy użytkownika i hasła w formacie base64.

Stosując te modyfikacje, powinieneś być w stanie budować obrazy Docker z bezpiecznie przekazywanymi poświadczeniami npm z Jenkins, zapewniając, że twoje pakiety npm są pobierane z Nexus z odpowiednim uwierzytelnieniem.