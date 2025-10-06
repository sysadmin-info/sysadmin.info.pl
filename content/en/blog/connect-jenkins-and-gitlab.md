---
title: Connect Jenkins and GitLab
date: 2023-06-11T18:00:00+00:00
description: Connect Jenkins and GitLab
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
- GitLab
cover:
    image: images/2023-thumbs/jenkins-gitlab-connection.webp
---
In this video I explain how to connect Jenkins and GitLab.

{{<youtube q4NlshhQtVw>}}

### Tutorial

1. Go to GitLab website and copy the URL. In my case it is 10.10.0.119

2. Login via SSH to Jenkins server and copy the certificate from GitLab

```bash
</dev/null openssl s_client -connect 10.10.0.119:443 -servername 10.10.0.119 | openssl x509 > $HOME/10.10.0.119.crt
```

4. 

```bash
sudo find / -iname "cacerts"
```

5. 

```bash
java -version
```

6. 

```bash
sudo find / -iname "keytool"
```

7. Import GitLab certificate to Java cacerts 

```bash
# Import GitLab certificate
sudo /usr/lib64/jvm/java-11-openjdk-11/bin/keytool -import -file /home/adrian/10.10.0.119.crt -alias gitlab -keystore /usr/lib64/jvm/java-11-openjdk-11/lib/security/cacerts

# Delete GitLab certificate
sudo /usr/lib64/jvm/java-11-openjdk-11/bin/keytool -delete -alias gitlab -keystore /usr/lib64/jvm/java-11-openjdk-11/lib/security/cacerts

# List all certificates
sudo /usr/lib64/jvm/java-11-openjdk-11/bin/keytool -list -keystore /usr/lib64/jvm/java-11-openjdk-11/lib/security/cacerts
```

8. type password 

```bash
changeit
```

9. Trust this certificate? Type: 

```
yes
```

And hit Enter

10. Restart Jenkins

```bash
sudo systemctl restart jenkins.service
```

11. Install GitLab plugin in Jenkins and restart Jenkins

12. Log into the GitLab, create a project and generate a token for project.

13. Go to Manage Jenkins -> System and scroll down to find GitLab section.

14. Provide a connection name eg. GitLab, GitLab URL and credentials (use API token generated in GitLab for the project to add credentials - see the video)

15. Test the connection.