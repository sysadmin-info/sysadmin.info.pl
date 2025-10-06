---
title: Opanuj automatyzację testów wielu stron internetowych za pomocą Jenkins, GitLab, Docker, Taiko i Gauge
date: 2024-05-22T16:00:00+00:00
description: Opanuj automatyzację testów wielu stron internetowych za pomocą Jenkins, GitLab, Docker, Taiko i Gauge
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
    image: images/2024-thumbs/taiko08.webp
---

[Repozytorium Taiko](https://github.com/getgauge/taiko)
[Taiko API](https://docs.taiko.dev/)

**Oto samouczek wideo**

{{<youtube 617wPbPk2d4>}}

## Wprowadzenie

W tym samouczku przejdziemy przez proces konfiguracji automatycznych testów dla AWX i ArgoCD za pomocą Jenkins, GitLab, Docker, Taiko i Gauge. Ten przewodnik zakłada, że masz podstawową wiedzę na temat tych technologii i masz je zainstalowane na swoich maszynach wirtualnych.

## Wymagania wstępne

- Proxmox z trzema maszynami wirtualnymi: jedna dla Jenkins, jedna dla GitLab i jedna dla Docker.
- Podstawowa wiedza o Jenkins, GitLab, Docker, Taiko i Gauge.
- Zmiennie środowiskowe skonfigurowane do zarządzania poświadczeniami.

### Krok 1: Skonfiguruj swoje środowisko

Upewnij się, że twoje maszyny wirtualne są skonfigurowane i połączone w następujący sposób:

1. **Jenkins VM**: Będzie hostować Jenkins i zarządzać twoim potokiem budowania i testowania.
2. **GitLab VM**: Będzie hostować twoje repozytoria kodu.
3. **Docker VM**: Będzie uruchamiać kontenery Docker wymagane do testowania.

### Krok 2: Utwórz skrypty testowe Taiko

Utwórz następujące skrypty testowe JavaScript za pomocą Taiko:

#### Skrypt testowy AWX (`awx.js`)

```javascript
const { goto, text, button, textBox, write, click, into, waitFor, screenshot, evaluate } = require('taiko');  // Importuj niezbędne funkcje z Taiko
const assert = require('assert');  // Importuj moduł assert
const path = require('path');

step("Przejdź na stronę logowania AWX", async function () {
    await goto("awx.sysadmin.homes");
});

step("Potwierdź, że załadowała się strona logowania AWX", async () => {
    assert(await text("Welcome to AWX!").exists());  // Użyj assert do sprawdzenia, czy tekst istnieje
});

step('Użyj poświadczeń AWX <username>:<password>', async (username, password) => {
    await write(process.env.username, into(textBox("Username"), {force:true}));
    await write(process.env.password, into(textBox("Password"), {force:true}));
});

step("Kliknij przycisk logowania AWX", async () => {
    await click(button("Log In"));
    await waitFor(5000);  // Poczekaj 5 sekund, aby strona się załadowała
    await screenshot({ path: 'after-login.png' });  // Zrób zrzut ekranu po próbie logowania dla debugowania
});

step("Zweryfikuj pomyślne logowanie do AWX", async () => {
    assert(await text("Dashboard").exists());  // Użyj assert do sprawdzenia, czy tekst istnieje
});

step("Wyczyść wszystkie zadania AWX", async function () {
    await evaluate(() => localStorage.clear());
});
```

#### Skrypt testowy ArgoCD (`argocd.js`)

```javascript
const { goto, text, button, textBox, write, click, into, waitFor, screenshot, evaluate } = require('taiko');  // Importuj niezbędne funkcje z Taiko
const assert = require('assert');  // Importuj moduł assert
const path = require('path');

step("Przejdź na stronę logowania ArgoCD", async function () {
    await goto("argocd.sysadmin.homes");
});

step("Potwierdź, że załadowała się strona logowania ArgoCD", async () => {
    assert(await text("Let's get stuff deployed!").exists());
});

step('Użyj poświadczeń ArgoCD <username>:<password>', async (username, password) => {
    await write(process.env.username, into(textBox("Username"), {force:true}));
    await write(process.env.password, into(textBox("Password"), {force:true}));
});

step("Kliknij przycisk logowania ArgoCD", async () => {
    await click(button("SIGN IN"));
});

step("Zweryfikuj pomyślne logowanie do ArgoCD", async () => {
    assert(await text("Applications").exists());
});

step("Wyczyść wszystkie zadania ArgoCD", async function () {
    await evaluate(() => localStorage.clear());
});
```

#### Wspólny skrypt (`common.js`)

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

// Zwraca nazwę pliku zrzutu ekranu
gauge.customScreenshotWriter = async function () {
    const screenshotFilePath = path.join(process.env['gauge_screenshots_dir'],
        `screenshot-${process.hrtime.bigint()}.png`);

    await screenshot({
        path: screenshotFilePath
    });
    return path.basename(screenshotFilePath);
};
```

### Krok 3: Utwórz pliki specyfikacji Gauge

Utwórz pliki specyfikacji definiujące kroki dla twoich testów:

#### Specyfikacja AWX (`test-awx.spec`)

```markdown
# Test logowania AWX

Aby wykonać tę specyfikację, użyj
    npm test

To jest krok kontekstowy, który jest wykonywany przed każdym scenariuszem
* Przejdź na stronę logowania AWX

## Logowanie do AWX
* Potwierdź, że załadowała się strona logowania AWX
* Użyj poświadczeń AWX "admin":"password"
* Kliknij przycisk logowania AWX
* Zweryfikuj pomyślne logowanie do AWX
___
* Wyczyść wszystkie zadania AWX
```

#### Specyfikacja ArgoCD (`test-argocd.spec`)

```markdown
# Test logowania ArgoCD

Aby wykonać tę specyfikację, użyj
    npm test

To jest krok kontekstowy, który jest wykonywany przed każdym scenariuszem
* Przejdź na stronę logowania ArgoCD

## Logowanie do ArgoCD
* Potwierdź, że załadowała się strona logowania ArgoCD
* Użyj poświadczeń ArgoCD "admin":"password"
* Kliknij przycisk logowania ArgoCD
* Zweryfikuj pomyślne logowanie do ArgoCD
___
* Wyczyść wszystkie zadania ArgoCD
```

### Krok 4: Skonfiguruj potok Jenkins

Utwórz plik Jenkinsfile do zdefiniowania potoku Jenkins:

```groovy
pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }
    parameters {
        choice(name: 'choose_server', choices: ['ArgoCD', 'AWX', 'AdGuardHome', 'Confluence', 'GitLab', 'Grafana', 'HomeAssistant', 'Jenkins', 'NginxProxyManager', 'Proxmox', 'Synology', 'Wazuh', 'PortainerProxy', 'PortainerAdGuardHome'], description: 'Wybierz serwer')
        choice(name: 'SPEC_FILE', choices: ['test-awx.spec', 'test-argocd.spec', 'test-adguardhome.spec', 'test-confluence.spec', 'test-gitlab.spec', 'test-grafana.spec', 'test-homeassistant.spec', 'test-jenkins.spec', 'test-nginxproxymanager.spec', 'test-proxmox.spec', 'test-synology.spec', 'test-wazuh.spec', 'test-portainerproxy.spec', 'test-portainerad

guardhome.spec'], description: 'Wybierz plik specyfikacji do przetestowania modułu')
    }
    environment {
        REPO_URL = 'git@gitlab.sysadmin.homes:developers/awx-taiko.git'
        BRANCH = 'main'
        REPORT_PATH = '/workspace'
        REPORT_NAME = 'TAIKO_AUTOMATED_TESTS'
    }
    agent {
        dockerfile {
            filename './Dockerfile'
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
                            error("Nieobsługiwany serwer: ${params.choose_server}")
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

### Krok 5: Uruchom swój potok

1. **Skonfiguruj Jenkins**: Upewnij się, że twój serwer Jenkins jest skonfigurowany z niezbędnymi poświadczeniami i Docker jest poprawnie skonfigurowany.
2. **Uruchom potok**: Uruchom potok, wybierając serwer i podając poświadczenia jako parametry.
3. **Przejrzyj wyniki**: Sprawdź raporty i logi wygenerowane przez Taiko i Gauge, aby upewnić się, że wszystko działa poprawnie.

### Podsumowanie konfiguracji końcowej

1. **`common.js`**: Zapewnia, że przeglądarka jest otwierana i zamykana przed i po suite testów oraz zawiera niestandardowy pisarz zrzutów ekranu.
2. **`test-awx.spec`** i **`test-argocd.spec`**: Definiują kroki logowania do AWX i ArgoCD, w tym nawigację, logowanie, weryfikację i czyszczenie zadań.
3. **Skrypty testowe JavaScript**: `awx.js` i `argocd.js` obsługują rzeczywiste kroki testowe, wykorzystując zmienne środowiskowe do poświadczeń.
4. **Jenkinsfile**: Zarządza etapami potoku, w tym rozwiązywaniem adresów IP serwerów, inicjalizacją kontenera, ustawianiem zmiennych środowiskowych, uruchamianiem testów i archiwizowaniem artefaktów.

Ta konfiguracja zapewnia solidne i zautomatyzowane środowisko testowe, zapewniając spójność i efektywność twoich procesów testowych.

Śmiało korzystaj z tego samouczka do automatyzacji własnych procesów testowych i dostosuj kroki w miarę potrzeby do swoich specyficznych wymagań.