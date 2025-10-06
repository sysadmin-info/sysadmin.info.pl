---
title: How to add Docker as node in Jenkins
date: 2023-06-14T14:00:00+00:00
description: How to add Docker as node in Jenkins
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
    image: images/2023-thumbs/docker-as-node.webp
---

{{<youtube jlenypFnn2I>}}


#### Tutorial:
1. Create a jenkins user on a Docker node
```bash
sudo useradd -d /var/lib/jenkins jenkins
sudo passwd jenkins
sudo mkdir /var/lib/jenkins/.ssh
sudo touch /var/lib/jenkins/.ssh/authorized_keys
sudo chmod 600 /var/lib/jenkins/.ssh/authorized_keys
sudo chmod 700 /var/lib/jenkins/.ssh
cd /var/lib/
sudo chown -R jenkins:jenkins jenkins
cd jenkins
ls -alh
```

Change shell to Bash for jenkins user

```bash
sudo vim /etc/passwd
```

Replace sh to bash for jenkins user. Save and exit

Login as jenkins user.

```bash
sudo su - jenkins
```
2. Install Java 11 open JDK on a Docker node

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

3. Check Java version

```bash
java -version
```

4. Install Git on a Docker node

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install git
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install git
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install git
  ```
  {{< /tab >}}
{{< /tabs >}}

5. Generate RSA key for Docker node on a Jenkins server

Log to a master Linux server where Jenkins is installed. and switch to a jenkins user.

```bash
sudo su - jenkins
```

Now you need to generate RSA keys for a Docker node. Do not forget to set a passphrase. You will add it later in Jenkins node management panel.

```bash
ssh-keygen -t rsa -C "The access key for Docker node" -f /var/lib/jenkins/.ssh/id_rsa_docker_node
```

6. Copy the RSA public key from Jenkins server to Docker node. Use the IP address of the Docker node.

```bash
ssh-copy-id -i id_rsa_docker_node.pub jenkins@10.10.0.121
```

7. Disable the password login, empty passwords and root login in /etc/ssh/sshd_config on Jenkins server and Docker node.

```bash
# Deny access for root via ssh
sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
# Deny password authentication via ssh
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
# Deny using empty passwords
sed -i 's/#PermitEmptyPasswords no/PermitEmptyPasswords no/g' /etc/ssh/sshd_config
# Enable public key authentication
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/g' /etc/ssh/sshd_config
```

Restart ssh daemon

```bash
systemctl restart sshd.service
```

8. Check can you login using private RSA key after disabling password login. 

```bash
ssh -i id_rsa_docker_node jenkins@10.10.0.121
```

9. Add a Linux node to a master Linux server with Jenkins

* Login to Jenkins web panel: http://10.10.0.113:8080
* Then click Manage Jenkins → Manage nodes and clouds
* Click + New Node on the left side panel.
* Provide a node name
* Select permanent agent
* Set the description the same as node name
* Set number of executors to 1 (it can be increased later)
* Set remote root directory to /var/lib/jenkins
* Set the label docker
* Usage: use this node as much as possible
* Launch method: Launch agents via SSH
*  Host: provide the IP address of the Docker node
* Credentials → add → select Jenkins
* Kind - choose from the dropdown list SSH username with private key
* Provide a username: jenkins
* Select enter directly
* Paste the private key copied from the id_rsa_docker_node on a master Linux server with Jenkins (see the part: Generate RSA key for Docker node on a Jenkins server)
* In the Description field provide a friendly name like RSA key for jenkins DOcker node or anything like that that will easily identify the credentials.
* Provide a passphrase to this RSA private key you generated previously on a master Linux server.
* Click add
* Select newly created credentials from a dropdown list
* Host Key Verification Strategy: choose: Known hosts file Verification Strategy
* Availability: Keep this agent online as much as possible
* In node properties select/check Environment variables and Tools Locations
* In Environment variables section add: 
* Name: JAVA_HOME
* Value: /usr/bin/java
* In Tools Locations section add:
* Name: Git (default)
* Value: /usr/bin/git
* Click save

10. Set the treshold for free space on a node
11. Extend var logical volume
```bash
sudo lvextend -L +2G /dev/mapper/docker--vg-var
sudo resize2fs /dev/mapper/docker--vg-var
df -kTh /var
```

12. Cleanup of the /var/tmp directory - explanation with examples

```bash
sudo find /var/tmp -type -f -mtime -1 -exec rm {} \;
sudo find /var/tmp -type -f -mtime -1 -delete
sudo find /var/tmp -type -f -mtime -1 | xargs rm
```