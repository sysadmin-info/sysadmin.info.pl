---
title: Jak stworzyć pipeline z kontenerem Docker w zadaniu Jenkins
date: 2023-07-11T12:00:00+00:00
description: Jak stworzyć pipeline z kontenerem Docker w zadaniu Jenkins. Rozwiązywanie
  problemów z uprawnieniami dla dial unix /var/run/docker.sock
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
- Docker
- Jenkins
cover:
    image: images/2023-thumbs/jenkins-pipeline.webp
---
##### Do wykonania zadania:
1. Utwórz zadanie w Jenkins
2. Utwórz potok w zadaniu
3. Dodaj etykietę dla węzła dockerowego
4. Zainstaluj wtyczki Docker
5. Napraw dial unix /var/run/docker.sock uprawnienia
6. Uruchom zadanie

{{<youtube amC3P_hhe1Q>}}

##### 1. Utwórz potok Jenkins w zadaniu

```
pipeline {
    agent {
        docker { image 'node:18.16.0-alpine' }
    }
    stages {
        stage('Test') {
            steps {
                sh 'node --version'
            }
        }
    }
}
```

##### 2. Dodaj etykietę docker, ponieważ dodany węzeł dockerowy ma etykietę: docker

```
pipeline {
    agent {
        docker { 
          image 'node:18.16.0-alpine'
          label 'docker'
        }
    }
    stages {
        stage('Test') {
            steps {
                sh 'node --version'
            }
        }
    }
}
```

##### 3. Napraw błąd: Nieprawidłowy określony typ agenta. Musi być jednym z [any, label, none] poprzez zainstalowanie wtyczek Docker:

- Docker Commons
- Docker API
- Docker
- Docker Pipeline

##### 4. Uruchom zadanie

###### 5. Napraw dial unix /var/run/docker.sock uprawnienia dla użytkownika jenkins na węźle dockerowym. Należy pamiętać, że musisz mieć uprawnienia sudo lub dostęp roota.

```bash
id jenkins
sudo usermod -aG docker jenkins
id jenkins
```

##### 6. Zrestartuj dockera na węźle dockerowym.

```bash
sudo systemctl restart docker.socket docker.service
```

##### 7. Zrestartuj Jenkins

```bash
sudo systemctl restart jenkins.service
```

##### 8. Uruchom zadanie

##### 9. Zmień system operacyjny w potoku i uruchom zadanie ponownie

```
pipeline {
    agent {
        docker { 
          image 'node:latest'
          label 'docker'
        }
    }
    stages {
        stage('Test') {
            steps {
                cat /etc/os-release
                sh 'node --version'
            }
        }
    }
}
```

##### 10. Uruchom zadanie