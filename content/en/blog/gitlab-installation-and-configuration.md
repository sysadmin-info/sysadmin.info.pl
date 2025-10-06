---
title: GitLab installation and configuration
date: 2023-06-10T12:30:00+00:00
description: GitLab installation and configuration
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
    image: images/2023-thumbs/gitlab.webp
---
In this video I explain how to install and configure GitLab in Debian 11 however below you can read the tutorial for other Linux distributions.

{{<youtube vGcWAdMIfUY>}}

GitLab is an open source end-to-end software development platform with built-in version control, issue tracking, code review, CI/CD, and more. Self-host GitLab on your own servers, in a container, or on a cloud provider. Source: <a rel="noreferrer noopener" href="https://gitlab.com/gitlab-org/gitlab" target="_blank">GitLab CE</a>

GitLab FOSS is a read-only mirror of GitLab, with all proprietary code removed. This project was previously used to host GitLab Community Edition, but all development has now moved to <a rel="noreferrer noopener" href="https://gitlab.com/gitlab-org/gitlab" target="_blank">GitLab CE</a> Source: <a rel="noreferrer noopener" href="https://gitlab.com/gitlab-org/gitlab-foss" target="_blank">GitLab CE / Gitlab FOSS</a>


### Tutorial

Basic requirements for a a virtual machine

8 GB RAM
4 vCPUs
40 GB disk space
Disk space:

- system disk (sda) .... 40GB
-- If needed, create a separate /opt partition (~20GB) as GitLab is installed in /opt/gitlab

- data disk (sdb) ..... 60GB
-- mount on /data
-- define the GitLab data directory /data/gitlab

If needed increase partitions size.


##### Add a secondary disk and create partition.

```bash
sudo fdisk /dev/sdb
```

Then type enter the letters in sequence and set the parameters

```
n
hit Enter
p
hit Enter
1
hit Enter twice
t
hit Enter
8E
hit Enter
w
hit Enter
```

##### Install parted

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install parted
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install parted
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install parted
  ```
  {{< /tab >}}
{{< /tabs >}}


##### Perform the below command

```bash
sudo parted /dev/sdb
```

##### Add a physical volume in logical volume manager

```bash
sudo pvcreate /dev/sdb1
```

##### Create a volume group and add /dev/sdb1 to it

```bash
sudo vgcreate gitlab-data /dev/sdb1
```

##### Create a logical volume

```bash
sudo lvcreate -n gitlab-data -l 100%FREE gitlab-data
```

##### Create ext4 file system

```bash
mkfs.ext4 /dev/gitlab-data/gitlab-data
```

##### Display device

```bash
sudo ls -al /dev/mapper
```

##### Create data dir in root directory

```bash
cd /
sudo mkdir data
```

##### Add to /etc/fstab entry for the data. Save and exit.

```bash
vim /etc/fstab
# add the below
/dev/mapper/gitlab--data-gitlab--data /data ext4 defaults 0 2
```

##### Mount the entry from /etc/fstab

```bash
mount -a
```

##### Check with the below command the status of the mounted resource

```bash
sudo df -kTh
```

##### Update the system

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper ref
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt update
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf check-update
  ```
  {{< /tab >}}
{{< /tabs >}}


##### Install required packages

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install curl vim openssh perl postfix mailutils git
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install curl vim openssh-server ca-certificates postfix mailutils gnupg debian-archive-keyring apt-transport-https git
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf curl vim openssh-server ca-certificates postfix mailutils gnupg policycoreutils python3-policycoreutils git
  ```
  {{< /tab >}}
{{< /tabs >}}

##### Install GitLab CE

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install curl perl
  # Check if opening the firewall is needed with: sudo systemctl status firewalld
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo systemctl reload firewalld

  #Add the GitLab package repository and install the package
  curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.rpm.sh | sudo bash

  # Install GitLab CE
  sudo zypper install gitlab-ee
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  id="os=debian&dist=bullseye"
  curl -ssf "https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/config_file.list?$id" >/etc/apt/sources.list.d/gitlab-ce.list
  curl -L https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey | gpg --dearmor > /etc/apt/trusted.gpg.d/gitlab-ce.gpg
  sudo vim /etc/apt/sources.list.d/gitlab-ce.list
  #change the gpg key to:  /etc/apt/trusted.gpg.d/gitlab-ce.gpg
  #It should looks like below:

  # this file was generated by packages.gitlab.com for
  # the repository at https://packages.gitlab.com/gitlab/gitlab-ce
  deb [signed-by=/etc/apt/trusted.gpg.d/gitlab-ce.gpg] https://packages.gitlab.com/gitlab/gitlab-ce/debian/ bullseye main
  deb-src [signed-by=/etc/apt/trusted.gpg.d/gitlab-ce.gpg] https://packages.gitlab.com/gitlab/gitlab-ce/debian/ bullseye main

  # Update apt
  sudo apt update

  # Install GitLab CE
  sudo apt install gitlab-ce
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  # Check if opening the firewall is needed with: sudo systemctl status firewalld
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo systemctl reload firewalld

  # Add repositories for GitLab CE
  sudo vim /etc/yum.repos.d/gitlab_gitlab-ce.repo

  #Add the below lines to the file:
  [gitlab_gitlab-ce]
  name=gitlab_gitlab-ce
  baseurl=https://packages.gitlab.com/gitlab/gitlab-ce/el/8/$basearch
  repo_gpgcheck=1
  gpgcheck=1
  enabled=1
  gpgkey=https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey
         https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey/gitlab-gitlab-ce-3D645A26AB9FBD22.pub.gpg
  sslverify=1
  sslcacert=/etc/pki/tls/certs/ca-bundle.crt
  metadata_expire=300

  [gitlab_gitlab-ce-source]
  name=gitlab_gitlab-ce-source
  baseurl=https://packages.gitlab.com/gitlab/gitlab-ce/el/8/SRPMS
  repo_gpgcheck=1
  gpgcheck=1
  enabled=1
  gpgkey=https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey
         https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey/gitlab-gitlab-ce-3D645A26AB9FBD22.pub.gpg
  sslverify=1
  sslcacert=/etc/pki/tls/certs/ca-bundle.crt
  metadata_expire=300

  # Check repositories
  sudo dnf repolist

  # Install GitLab CE
  sudo dnf install gitlab-ce -y  
  ```
  {{< /tab >}}
{{< /tabs >}}


#### Configuration

1. Configure Postfix

```bash
sudo vim /etc/postfix/main.cf
```

Set as below

```bash
compatibility_level = 2
mail_owner = postfix
setgid_group = postdrop
inet_interfaces = localhost
inet_protocols = all
mydomain = gitlab.local
mydestination = $myhostname, localhost.$mydomain, localhost
relayhost = mail.gitlab.local
unknown_local_recipient_reject_code = 550
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
```

Restart Postfix

```bash
sudo systemctl restart postfix
```

2. Create ssl directory and generate certificates

```bash
cd /etc/gitlab
sudo mkdir ssl
sudo openssl genrsa -out gitlab.key 2048
sudo openssl req -key gitlab.key -new -out gitlab.csr
sudo openssl x509 -signkey gitlab.key -in gitlab.csr -req -days 365 -out gitlab.crt
```

3. Edit the main config file: /etc/gitlab/gitlab.rb

```bash
sudo vim /etc/gitlab/gitlab.rb
```

external_url 'https://10.10.0.119'

## Default data storing directory
git_data_dirs({
"default" => { "path" => "/data/git" }
})

## GitLab User Settings
user['git_user_email'] = "gitlab@gitlab.local"

## Email settings
gitlab_rails['gitlab_email_from'] = 'gitlab@gitlab.local'
gitlab_rails['gitlab_email_display_name'] = 'GitLab'
gitlab_rails['gitlab_email_reply_to'] = 'noreply@gitlab.local'

## GitLab NGINX
nginx['enable'] = true
nginx['redirect_http_to_https'] = true
nginx['redirect_http_to_https_port'] = 80
nginx['ssl_certificate'] = "/etc/gitlab/ssl/gitlab.crt"
nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/gitlab.key"

4. Reconfigure the GitLab

```bash
sudo gitlab-ctl reconfigure
```

5. Enable and start GitLab

```bash
sudo systemctl enable gitlab-runsvdir.service
sudo systemctl start gitlab-runsvdir.service
```

6. Access GitLab CE Web Interface

> https://10.10.0.119
> Sign in with account: root
> the password is found in /etc/gitlab/initial_root_password

7. Reset the password for user "root"

```bash
# sudo gitlab-rake "gitlab:password:reset"
> Enter username: root
> Enter password:
```

8. Delete the initial root password

```bash
sudo rm -f /etc/gitlab/initial_root_password
```