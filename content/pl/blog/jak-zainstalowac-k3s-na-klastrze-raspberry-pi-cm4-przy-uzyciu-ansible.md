---
title: Jak zainstalować k3s na klastrze Raspberry Pi CM4 przy użyciu Ansible
date: 2023-11-22T12:00:00+00:00
description: Jak zainstalować k3s na klastrze Raspberry Pi CM4 przy użyciu Ansible
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


{{< notice success "Jak zainstalować, skonfigurować i używać Ansible" >}}
Kliknij tutaj: [Seria artykułów o Ansible:](/en/categories/ansible/)
{{< /notice >}}

### Ansible+k3s na klastrze Raspberry Pi CM4

1. **Oto samouczek wideo**

{{<youtube PAl4P6tii7M>}}

#### Wymagania:

##### Dla Raspberry Pi / CM4 

```vim
cgroup_memory=1 cgroup_enable=memory
```

dodane do

```vim
/boot/cmdline.txt
```

##### Dla Ansible

* użytkownik ansible dodany do każdego zdalnego węzła
* użytkownik ansible dodany do grupy sudo/wheel/admins
* grupa sudo/wheel/admins ustawiona w /etc/sudoers do wykonywania poleceń z podwyższonymi uprawnieniami

1. Utwórz inwentarz ansible

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

2. Utwórz playbook ansible. Zobacz wideo, aby uzyskać wyjaśnienie.

```bash
vim k3s-raspberry-cluster.yml 
```

3. Wprowadź poniższą zawartość do tego pliku.

```yaml
---
- name: Zainstaluj K3s na node Master
  hosts: master
  become: yes
  tasks:
    - name: Zainstaluj K3s
      shell: curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik,servicelb" K3S_KUBECONFIG_MODE="644" sh -

    - name: Zainstaluj NGINX ingress controller
      shell: kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/baremetal/deploy.yaml
    - name: Utwórz plik patch dla NGINX  ingress controller
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

    - name: Patch dla NGINX ingress controller
      shell: kubectl patch deployment ingress-nginx-controller -n ingress-nginx --patch "$(cat ingress.yaml)"

    - name: Pobierz token K3s
      shell: cat /var/lib/rancher/k3s/server/node-token
      register: k3s_token
      delegate_to: "{{ inventory_hostname }}"



- name: Zainstaluj K3s na nodach workers
  hosts: workers
  become: yes
  vars:
    k3s_url: "https://{{ hostvars['master-node']['ansible_host'] }}:6443"
    k3s_token: "{{ hostvars['master-node'].k3s_token.stdout }}"
  tasks:
    - name: Dołącz nody workers do klastra
      shell: "curl -sfL https://get.k3s.io | K3S_URL={{ k3s_url }} K3S_TOKEN={{ k3s_token }} sh -"


- name: Nadaj etykiety dla nodów workers na węźle Master
  hosts: master
  become: yes
  tasks:
    - name: Etykieta dla worker 1
      shell: kubectl label nodes worker1 kubernetes.io/role=worker
    - name: Etykieta dla worker 2
      shell: kubectl label nodes worker2 kubernetes.io/role=worker
```

4. Uruchom playbook jak poniżej:

```bash
ansible-playbook k3s-raspberry-cluster.yml
```

5. Sprawdź na zdalnym node master k3s konfigurację za pomocą poniższych poleceń:

```bash
kubectl get nodes
kubectl get pods -A
kubectl get svc -A
kubectl get all -A
```

{{< notice success "Informacja" >}}
Skrypty i pliki konfiguracyjne są dostępne [tutaj:](https://github.com/sysadmin-info/ansible)
{{< /notice >}}