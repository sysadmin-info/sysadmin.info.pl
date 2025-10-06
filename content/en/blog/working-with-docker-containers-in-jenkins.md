---
title: Working with Docker containers in Jenkins
date: 2023-07-11T20:00:00+00:00
description: Working with Docker containers in Jenkins. Solving issue with missing
  space
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
    image: images/2023-thumbs/working-with-docker-containers-in-jenkins.webp
---
##### Exercises to complete:
1. Run a pipeline in job in Jenkins
2. Watch the status of docker
3. Change the name of the image to see that it has to be correct according to the pattern explained in the video
4. Fix the problem with not enough space on a logical volume

{{<youtube vbqnHwQQ8m4>}}

#### 1. Run the below pipeline in job in Jenkins

```
pipeline {
    agent {
        docker { 
          image 'alpine:latest'
          label 'docker'
        }
    }
    stages {
        stage('Test') {
            steps {
                sh '''
                cat /etc/os-release
                pwd
                cat /etc/passwd
                sleep 60
                '''
            }
        }
    }
}
```

#### 2. Watch the status of the docker

```bash
watch docker ps
```

#### 3. Change the name of the image to see that it has to be correct according to the pattern explained in the video.

#### 4. Fix the problem with missing space on a logical volume. Use the below commands to perform a check and solve the problem.

##### Check which volume is almost full or full

```bash
df -kTh
```

##### list 10 biggest files in a var directory that is a volume with not enough space
```bash
du -a /var | sort -n - r | head -n 10
# or with -h (human readable format)
du -h /var | sort -n - r | head -n 10
```

##### Run docker prune command.

The Docker prune command automatically removes the resources not associated with a container. This is a quick way to get rid of old images, containers, volumes, and networks.

```bash
docker system prune -a -f
```

##### Check the result after the cleanup

```bash
du -hx --max-depth=1 /var
```

#### 5. Resize the logical volume

```bash
# do the check
pvs
vgs
lvs
# extend the volume
lvextend -l +100%FREE /dev/docker-vg/var
# do the check
pvs
vgs
lvs
df -kTh /var
# resize the partition
resize2fs /dev/mapper/docker--vg-var
# do the chek
df -kTh /var
```

#### 6. Go back to Jenkins and rerun the job 

#### 7. See the section of the tutorial to understand difference between docker images.

Understanding difference between Docker images. Node image contains nodejs and npm that allows node command to work.
