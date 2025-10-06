---
title: How to connect Jenkins with GitLab and Docker
date: 2023-06-09T21:30:00+00:00
description: How to connect Jenkins with GitLab and Docker
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
    image: images/2023-thumbs/jenkins-gitlab-docker.webp
---
In this series I explain how to install Jenkins, GitLab and Docker on three separate virtual machines in Proxmox and connect them together to run the job in Jenkins, that is using Jenkins pipeline located at GitLab server and run a docker container from predefined configuration in a docker file to perform a test. Scroll down to read the tutorial, please.

Intro:
{{<youtube QoP3Pc8rvCk>}}

Part one:
{{<youtube ajMuYQML4fo>}}

Part two:
{{<youtube -NXVxxRCjqw>}}  



### Tutorial

##### Add Jenkins repository

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper addrepo http://pkg.jenkins.io/opensuse-stable/ jenkins
  sudo zypper ref
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  wget https://pkg.jenkins.io/debian-stable/jenkins.io.key
  sudo apt-key add jenkins.io.key
  echo "deb https://pkg.jenkins.io/debian-stable binary/" | tee /etc/apt/sources.list.d/jenkins.list
  sudo apt update -y
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install wget
  wget -O /etc/yum.repos.d/jenkins.repo http://pkg.jenkins-ci.org/redhat-stable/jenkins.repo
  sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
  ```
  {{< /tab >}}
{{< /tabs >}}

##### Install Java 11 open JDK

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install java-11-openjdk
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install openjdk-11-jdk
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install java-11-openjdk
  ```
  {{< /tab >}}
{{< /tabs >}}

##### Check Java version

```bash
java -version
```

##### Install Jenkins

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install jenkins
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install jenkins
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install jenkins
  ```
  {{< /tab >}}
{{< /tabs >}}

##### Enable and start Jenkins

```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins
```

{{< notice success "Solving the problem with the symbolic link for Jenkins" >}}
If you will see the error about missing file or directory during enabling the Jenkins, you have to edit the file /usr/lib/systemd/systemd-sysv-install and change the line that contains S50 and change the line to the below one:
```
symlink="$(pwd)/$1"
```
After that enable and start Jenkins once again.
{{< /notice >}}

##### Add port 8080 in firewalld, reload the configuration and check the firewall configuration status

```bash
sudo firewall-cmd --add-port=8080/tcp --permanent --zone="public"
sudo firewall-cmd --reload
sudo firewall-cmd --list-all
```

##### Check the IP address of your machine

```bash
hostname -I
```

##### Copy the URL and paste it into the address bar in your browser and continue the installation

##### Display and copy the password from the file and paste it into the admin's password field. Use combination ctrl+shift+c to copy the displayed password from the command line.

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

##### Install suggested plugins and continue

##### Create first administrator and continue. 

##### Leave Jenkins URL as it is.

##### Install locale plugin

Go to Manage Jenkins, then click Plugins, click available plugins, in search field type locale and hit Enter. Click on the button install without restart. Then click one more time on Manage Jenkins, Click System and scroll down to locale section. Set en_us language in Default language field and select Ignore browser preference and force this language to all users. Click Apply and Save buttons. Install the Restart plugin the same way and restart Jenkins. 

##### Remove initial admin's password.

```bash
sudo rm -f /var/lib/jenkins/secrets/initialAdminPassword
```

##### Summarize

Using above method you have working Jenkins that you can later connect with GitLab and Docker servers to create environment for testing purpose. 