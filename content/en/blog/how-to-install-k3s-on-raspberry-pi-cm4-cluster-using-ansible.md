---
title: How to install k3s on Raspberry Pi CM4 cluster using Ansible
date: 2023-11-22T12:00:00+00:00
description: How to install k3s on Raspberry Pi CM4 cluster using Ansible
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
    image: images/2023-thumbs/ansible06.webp
---


{{< notice success "How to install, configure and use Ansible" >}}
Click here: [A series of articles about Ansible:](/en/categories/ansible/)
{{< /notice >}}

### Ansible+k3s on Raspberry Pi CM4 cluster

1. **Here is a video tutorial**

{{<youtube PAl4P6tii7M>}}

#### Requirements:

##### For Raspberry Pi / CM4 

```vim
cgroup_memory=1 cgroup_enable=memory
```

added to 

```vim
/boot/cmdline.txt
```

##### For Ansible

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
    master:
      hosts:
        master-node:
          ansible_host: 10.10.0.112
          ansible_user: ansible
    workers:
      hosts:
        worker-node-1:
          ansible_host: 10.10.0.102
          ansible_user: ansible
        worker-node-2:
          ansible_host: 10.10.0.104
          ansible_user: ansible
```

2. Create ansible playbook. See the video for the explanation. 

```bash
vim k3s-raspberry-cluster.yml 
```

3. Put the below content into this file.

```yaml
---
- name: Install K3s on Master Node
  hosts: master
  become: yes
  tasks:
    - name: Install K3s
      shell: curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik,servicelb" K3S_KUBECONFIG_MODE="644" sh -

    - name: Install NGINX as ingress controller
      shell: kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/baremetal/deploy.yaml
    - name: Create a patch file for NGINX ingress controller 
      shell:
        cmd: |
          cat > ingress.yaml << EOF
            spec:
              template:
                spec:
                  hostNetwork: true
          EOF
      args:
        executable: /bin/bash

    - name: patch NGINX ingress controller
      shell: kubectl patch deployment ingress-nginx-controller -n ingress-nginx --patch "$(cat ingress.yaml)"

    - name: Get K3s node token
      shell: cat /var/lib/rancher/k3s/server/node-token
      register: k3s_token
      delegate_to: "{{ inventory_hostname }}"



- name: Install K3s on Worker Nodes
  hosts: workers
  become: yes
  vars:
    k3s_url: "https://{{ hostvars['master-node']['ansible_host'] }}:6443"
    k3s_token: "{{ hostvars['master-node'].k3s_token.stdout }}"
  tasks:
    - name: Join worker nodes to the cluster
      shell: "curl -sfL https://get.k3s.io | K3S_URL={{ k3s_url }} K3S_TOKEN={{ k3s_token }} sh -"


- name: Label K3s workers on Master Node
  hosts: master
  become: yes
  tasks:
    - name: Label worker 1
      shell: kubectl label nodes worker1 kubernetes.io/role=worker
    - name: Label worker 2
      shell: kubectl label nodes worker2 kubernetes.io/role=worker
```

4. Run the playbook like below:

```bash
ansible-playbook k3s-raspberry-cluster.yml
```

5. Check on the remote k3s master node the configuration using below commands:

```bash
kubectl get nodes
kubectl get pods -A
kubectl get svc -A
kubectl get all -A
```

{{< notice success "Information" >}}
Scripts and configuration files are available [here:](https://github.com/sysadmin-info/ansible)
{{< /notice >}}