---
title: How to install and configure ansible, create playbook and run it on remote
  servers
date: 2023-11-11T20:00:00+00:00
description: How to install and configure ansible, create playbook and run it on remote
  servers
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Ansible
categories:
- Ansible
cover:
    image: images/2023-thumbs/ansible04.webp
---

1. **Here is a video tutorial**

{{<youtube 0Gd646F4snU>}}

Scripts and configuration files are available [here:](https://github.com/sysadmin-info/ansible)

1. Install ansible

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install ansible
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```bash
  sudo apt install ansible
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```bash
  sudo dnf install ansible
  ```
  {{< /tab >}}
{{< /tabs >}}


2. Create ansible directory on /etc

```bash
sudo mkdir /etc/ansible
```

3. Create hosts file inside the /etc/ansible directory

```bash
sudo vim /etc/ansible/hosts
```

and put the below content into the file

```yaml
servers:
  hosts:
    worker1:
      ansible_host: 10.10.0.3
      ansible_user: ansible 
    worker2:
      ansible_host: 10.10.0.4
      ansible_user: ansible   
    master:
      ansible_host: 10.10.0.2
      ansible_user: ansible
```

4. Check ansible version

```bash
ansible --version
```

5. Make sure that PasswordAuthentication has set boolean value to yes in /etc/ssh/sshd_config file on remote servers.

6. Create two playbooks. See examples below:

```bash
vim ssh-session.yaml
```

```yaml
- hosts: servers
  tasks:
  - name: "connect via ssh"
    shell: for i in $(cat servers); do ssh ansible@$i; done
```

```bash
vim passwd-auth.yaml
```

```yaml
- hosts: servers 
  become: true
  tasks:
  - name: "replace on sshd_config"
    shell: sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
  - name: "Restart ssh"
    shell: systemctl restart sshd
```

7. Run these playbooks like below:

```bash
ansible-playbook ssh-session.yaml
ansible-playbook passwd-auth.yaml
ansible-playbook ssh-session.yaml
```