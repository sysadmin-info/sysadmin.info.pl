---
title: How to upgrade Portainer on a remote host using Ansible
date: 2023-11-23T22:35:00+00:00
description: How to upgrade Portainer on a remote host using Ansible
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
    image: images/2023-thumbs/ansible07.webp
---

{{< notice success "How to install, configure and use Ansible" >}}
Click here: [A series of articles about Ansible:](/en/categories/ansible/)
{{< /notice >}}

### How to upgrade Portainer using Ansible

1. **Here is a video tutorial**

{{<youtube cMwPU4gafL4>}}

#### Requirements for Ansible:

* ansible user added to each remote node
* ansible user added to sudo/wheel/admins group
* sudo/wheel/admins group set in /etc/sudoers to perform command with elevated privileges

1. Create ansible inventory

```bash
sudo vim /etc/ansible/hosts
```

```yaml
all:
  children:
    portainer:
      hosts:
        AdGuard:
          ansible_host: 10.10.0.108
          ansible_user: ansible
        nginx-proxy-manager:
          ansible_host: 10.10.0.137 
          ansible_user: ansible
```

2. Create ansible playbook. See the video for the explanation. 

```bash
vim portainer.yml 
```

3. Put the below content into this file.

```yaml
---
- name: Upgrade Portainer on AdGuard Home LXC container in Proxmox
  hosts: portainer
  become: yes
  tasks:
    - name: Stop Portainer
      shell: docker stop portainer 

    - name: Remove Portainer
      shell: docker rm portainer

    - name: Create the volume that Portainer Server will use to store its database
      shell: docker volume create portainer_data

    - name: Download newest Portainer 
      shell: sudo docker pull portainer/portainer-ce:latest 

    - name: Run Portainer 
      shell: docker run -d -p 8000:8000 -p 9443:9443 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
```

4. Run the playbook like below:

```bash
ansible-playbook portainer.yml
```

{{< notice success "Information" >}}
Scripts and configuration files are available [here:](https://github.com/sysadmin-info/ansible)
{{< /notice >}}