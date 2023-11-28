---
title: "Jak zainstalować i skonfigurować Ansible, utworzyć playbook i uruchomić go na zdalnych serwerach"
date:  2023-11-11T20:00:00+00:00
description: "Jak zainstalować i skonfigurować Ansible, utworzyć playbook i uruchomić go na zdalnych serwerach"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- Ansible
- Bash
- sshpass 
series:
- Ansible
categories:
- Ansible 
image: images/2023-thumbs/ansible04.webp
---

1. **Oto samouczek wideo**

{{<youtube 0Gd646F4snU>}}

Skrypty i pliki konfiguracyjne są dostępne [tutaj:](https://github.com/sysadmin-info/ansible)

1. Zainstaluj Ansible

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


2. Utwórz katalog Ansible w /etc

```bash
sudo mkdir /etc/ansible
```

3. Utwórz plik hosts w katalogu /etc/ansible

```bash
sudo vim /etc/ansible/hosts
```

i wprowadź poniższą zawartość do pliku

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

4. Sprawdź wersję Ansible

```bash
ansible --version
```

5. Upewnij się, że PasswordAuthentication ma ustawioną wartość logiczną na tak w pliku /etc/ssh/sshd_config na zdalnych serwerach.

6. Utwórz dwa playbooki. Zobacz poniższe przykłady:

```bash
vim ssh-session.yaml
```

```yaml
- hosts: servers
  tasks:
  - name: "połącz się przez ssh"
    shell: for i in $(cat servers); do ssh ansible@$i; done
```

```bash
vim passwd-auth.yaml
```

```yaml
- hosts: servers 
  become: true
  tasks:
  - name: "zamień w sshd_config"
    shell: sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
  - name: "Restartuj ssh"
    shell: systemctl restart sshd
```

7. Uruchom te playbooki w następujący sposób:

```bash
ansible-playbook ssh-session.yaml
ansible-playbook passwd-auth.yaml
ansible-playbook ssh-session.yaml
```