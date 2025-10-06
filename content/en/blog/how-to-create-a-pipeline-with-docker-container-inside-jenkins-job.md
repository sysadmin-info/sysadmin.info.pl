---
title: How to create a pipeline with docker container inside Jenkins job
date: 2023-07-11T12:00:00+00:00
description: How to create a pipeline with docker container inside Jenkins job. Fixing
  issues with dial unix /var/run/docker.sock permissions
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
##### Exercises to complete:
1. Create a job inside a Jenkins
2. Create a pipeline inside a job
3. Add a label for a docker node
4. Install Docker plugins
5. Fix dial unix /var/run/docker.sock permissions
6. Run the job

{{<youtube amC3P_hhe1Q>}}

##### 1. Create a jenkins pipeline inside the job

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

##### 2. Add a label docker, because the added docker node has label: docker

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

##### 3. Fix issue: Invalid agent type specified. Must be one of [any, label, none]  by installing Docker plugins:

- Docker Commons
- Docker API
- Docker
- Docker Pipeline

##### 4. Run the job

###### 5. Fix dial unix /var/run/docker.sock permissions for jenkins user on a docker node. Please note that you need to have sudo privileges or root access.

```bash
id jenkins
sudo usermod -aG docker jenkins
id jenkins
```

##### 6. Restart docker on a docker node. 

```bash
sudo systemctl restart docker.socket docker.service
```

##### 7. Restart jenkins

```bash
sudo systemctl restart jenkins.service
```

##### 8. Run the job

##### 9. Change the operating system in pipeline and run the job again

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

##### 10. Run the job