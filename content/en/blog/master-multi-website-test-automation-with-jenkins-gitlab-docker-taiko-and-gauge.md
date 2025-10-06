---
title: Master Multi-Website Test Automation with Jenkins, GitLab, Docker, Taiko, and Gauge
date: 2024-05-22T16:00:00+00:00
description: Master Multi-Website Test Automation with Jenkins, GitLab, Docker, Taiko, and Gauge
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

[Taiko repository](https://github.com/getgauge/taiko)
[Taiko API](https://docs.taiko.dev/)

**Here is a video tutorial**

{{<youtube 617wPbPk2d4>}}

## Introduction

In this tutorial, we will walk through the process of setting up automated tests for AWX and ArgoCD using Jenkins, GitLab, Docker, Taiko, and Gauge. This guide assumes you have basic knowledge of these technologies and have them installed on your virtual machines. 

## Prerequisites

- Proxmox with three VMs: one for Jenkins, one for GitLab, and one for Docker.
- Basic knowledge of Jenkins, GitLab, Docker, Taiko, and Gauge.
- Environment variables set up for credentials management.

### Step 1: Set Up Your Environment

Ensure your virtual machines are set up and connected as follows:

1. **Jenkins VM**: This will host Jenkins and manage your build and test pipeline.
2. **GitLab VM**: This will host your code repositories.
3. **Docker VM**: This will run Docker containers required for testing.

### Step 2: Create Taiko Test Scripts

Create the following JavaScript test scripts using Taiko:

#### AWX Test Script (`awx.js`)

```javascript
const { goto, text, button, textBox, write, click, into, waitFor, screenshot, evaluate } = require('taiko');  // Import necessary functions from Taiko
const assert = require('assert');  // Import assert module
const path = require('path');

step("Navigate to the AWX login page", async function () {
    await goto("awx.sysadmin.homes");
});

step("Assert the AWX login page is loaded", async () => {
    assert(await text("Welcome to AWX!").exists());  // Use assert to check if the text exists
});

step('Use AWX credentials <username>:<password>', async (username, password) => {
    await write(process.env.username, into(textBox("Username"), {force:true}));
    await write(process.env.password, into(textBox("Password"), {force:true}));
});

step("Click the AWX login button", async () => {
    await click(button("Log In"));
    await waitFor(5000);  // Wait for 5 seconds to allow the page to load
    await screenshot({ path: 'after-login.png' });  // Capture a screenshot after login attempt for debugging
});

step("Verify successful AWX login", async () => {
    assert(await text("Dashboard").exists());  // Use assert to check if the text exists
});

step("Clear all AWX tasks", async function () {
    await evaluate(() => localStorage.clear());
});
```

#### ArgoCD Test Script (`argocd.js`)

```javascript
const { goto, text, button, textBox, write, click, into, waitFor, screenshot, evaluate } = require('taiko');  // Import necessary functions from Taiko
const assert = require('assert');  // Import assert module
const path = require('path');

step("Navigate to the ArgoCD login page", async function () {
    await goto("argocd.sysadmin.homes");
});

step("Assert the ArgoCD login page is loaded", async () => {
    assert(await text("Let's get stuff deployed!").exists());
});

step('Use ArgoCD credentials <username>:<password>', async (username, password) => {
    await write(process.env.username, into(textBox("Username"), {force:true}));
    await write(process.env.password, into(textBox("Password"), {force:true}));
});

step("Click the ArgoCD login button", async () => {
    await click(button("SIGN IN"));
});

step("Verify successful ArgoCD login", async () => {
    assert(await text("Applications").exists());
});

step("Clear all ArgoCD tasks", async function () {
    await evaluate(() => localStorage.clear());
});
```

#### Common Script (`common.js`)

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
```

### Step 3: Create Gauge Specification Files

Create specification files to define the steps for your tests:

#### AWX Specification (`test-awx.spec`)

```markdown
# AWX login test

To execute this specification, use
    npm test

This is a context step that runs before every scenario
* Navigate to the AWX login page

## Login to AWX
* Assert the AWX login page is loaded
* Use AWX credentials "admin":"password"
* Click the AWX login button
* Verify successful AWX login
___
* Clear all AWX tasks
```

#### ArgoCD Specification (`test-argocd.spec`)

```markdown
# ArgoCD login test

To execute this specification, use
    npm test

This is a context step that runs before every scenario
* Navigate to the ArgoCD login page

## Login to ArgoCD
* Assert the ArgoCD login page is loaded
* Use ArgoCD credentials "admin":"password"
* Click the ArgoCD login button
* Verify successful ArgoCD login
___
* Clear all ArgoCD tasks
```

### Step 4: Set Up Jenkins Pipeline

Create a Jenkinsfile to define your Jenkins pipeline:

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

### Step 5: Run Your Pipeline

1. **Configure Jenkins**: Ensure your Jenkins server is configured with the necessary credentials and Docker is set up correctly.
2. **Trigger the Pipeline**: Run the pipeline by selecting the server and providing the credentials as parameters.
3. **Review the Results**: Check the reports and logs generated by Taiko and Gauge to ensure everything is working correctly.

### Final Configuration Summary

1. **`common.js`**: Ensures the browser is opened and closed before and after the test suite respectively, and includes a custom screenshot writer.
2. **`test-awx.spec`** and **`test-argocd.spec`**: Define the steps for logging into AWX and ArgoCD, including navigation, login, verification, and clearing tasks.
3. **JavaScript Test Scripts**: `awx.js` and `argocd.js` handle the actual test steps, making use of environment variables for credentials.
4. **Jenkinsfile**: Manages the pipeline stages, including resolving server IPs, initializing the container, setting environment variables, running tests, and archiving artifacts.

This setup ensures a robust and automated testing environment, providing consistency and efficiency in your testing processes.

Feel free to follow this tutorial to automate your own testing workflows, and adjust the steps as needed to fit your specific requirements.