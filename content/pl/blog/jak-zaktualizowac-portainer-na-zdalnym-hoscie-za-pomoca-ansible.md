---
title: Jak zaktualizować Portainer na zdalnym hoście za pomocą Ansible
date: 2023-11-23T22:35:00+00:00
description: Jak zaktualizować Portainer na zdalnym hoście za pomocą Ansible
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

{{< notice success "Jak zainstalować, skonfigurować i używać Ansible" >}}
Kliknij tutaj: [Cykl artykułów o Ansible:](/en/categories/ansible/)
{{< /notice >}}

### Jak zaktualizować Portainer za pomocą Ansible

1. **Oto samouczek wideo**

{{<youtube cMwPU4gafL4>}}

#### Wymagania dla Ansible:

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
    portainer:
      hosts:
        AdGuard:
          ansible_host: 10.10.0.108
          ansible_user: ansible
        nginx-proxy-manager:
          ansible_host: 10.10.0.137 
          ansible_user: ansible
```

2. Utwórz playbook ansible. Zobacz wideo dla wyjaśnienia.

```bash
vim portainer.yml 
```

3. Wprowadź poniższą zawartość do tego pliku.

```yaml
---
- name: Aktualizacja Portainer na kontenerze LXC AdGuard Home w Proxmox
  hosts: portainer
  become: yes
  tasks:
    - name: Zatrzymaj Portainer
      shell: docker stop portainer 

    - name: Usuń Portainer
      shell: docker rm portainer

    - name: Utwórz wolumen, którego Portainer Server będzie używać do przechowywania swojej bazy danych
      shell: docker volume create portainer_data

    - name: Pobierz najnowszy Portainer 
      shell: sudo docker pull portainer/portainer-ce:latest 

    - name: Uruchom Portainer 
      shell: docker run -d -p 8000:8000 -p 9443:9443 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
```

4. Uruchom playbook w następujący sposób:

```bash
ansible-playbook portainer.yml
```

{{< notice success "Informacja" >}}
Skrypty i pliki konfiguracyjne są dostępne [tutaj:](https://github.com/sysadmin-info/ansible)
{{< /notice >}}
```