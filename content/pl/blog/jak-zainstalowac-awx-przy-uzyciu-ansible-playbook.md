---
title: Jak zainstalować AWX przy użyciu Ansible playbook
date: 2023-11-27T17:00:00+00:00
description: Jak zainstalować AWX przy użyciu Ansible playbook
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
image: images/2023-thumbs/ansible08.webp
---


{{< notice success "Jak zainstalować, skonfigurować i używać Ansible" >}}
Kliknij tutaj: [Seria artykułów o Ansible:](/pl/categories/ansible/)
{{< /notice >}}

### Ansible+AWX

**Oto samouczek wideo**

{{<youtube Ld06sc6H9AM>}}

#### Wymagania dla Ansible

* użytkownik ansible dodany do maszyny, na której zainstalowano ansible
* użytkownik ansible dodany do grupy sudo/wheel/admins
* grupa sudo/wheel/admins ustawiona w /etc/sudoers do wykonywania poleceń z podwyższonymi uprawnieniami

1. Utwórz plik skryptu ansible: awx-install.yml

```bash
vim awx-install.yml
```

I wklej poniższą zawartość do tego pliku.

```yaml
---
- name: Install AWX
  hosts: localhost
  become: yes
  tasks:
    - name: Pobierz Kustomize przy użyciu curl
      shell: curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash

    - name: Przenieś Kustomize do katalogu /usr/local/bin
      shell: mv kustomize /usr/local/bin

    - name: Utwórz przestrzeń nazw awx
      shell: kubectl create namespace awx

    - name: Utwórz plik awx.yaml 
      shell:
        cmd: |
          cat > awx.yaml << EOF
          ---
          apiVersion: awx.ansible.com/v1beta1
          kind: AWX
          metadata:
            name: awx
          spec:
            service_type: nodeport
            nodeport_port: 30060
          EOF
      args:
        executable: /bin/bash

    - name: Utwórz kustomization.yaml
      shell:
        cmd: |
          cat > kustomization.yaml << EOF
          ---
          apiVersion: kustomize.config.k8s.io/v1beta1
          kind: Kustomization
          resources:
            # Znajdź najnowszy tag tutaj: https://github.com/ansible/awx-operator/releases
            - github.com/ansible/awx-operator/config/default?ref=2.8.0
            - awx.yaml
          # Ustaw tagi obrazów, aby pasowały do wersji git z powyżej
          images:
            - name: quay.io/ansible/awx-operator
              newTag: 2.8.0
          # Określ niestandardową przestrzeń nazw, w której zainstalujesz AWX
          namespace: awx
          EOF
      args:
        executable: /bin/bash

    - name: Rozpocznij budowę ansible awx
      shell: kustomize build . | kubectl apply -f - 
```

{{< notice success "Informacje" >}}
plik skryptu jest dostępny [tutaj:](https://github.com/sysadmin-info/ansible)
{{< /notice >}}


2. Uruchom skrypt jak poniżej:


```bash
ansible-playbook awx-install.yml
```

3. Otwórz nowe okno terminala i obserwuj logi

```bash
kubectl logs -f deployments/awx-operator-controller-manager -c awx-manager -n awx
```

Sprawdź, czy pody zostały utworzone w przestrzeni nazw awx

```bash
kubectl get pods -n awx
```

4. Sprawdź usługę

```bash
kubectl get svc -n awx
```

5. Pobierz hasło awx

```bash
kubectl get secret awx-admin-password -o jsonpath="{.data.password}" -n awx | base64 --decode
```

6. Sprawdź adres IP hosta, na którym zainstalowano AWX

```bash
hostname -I
```

7. Otwórz to w przeglądarce, używając portu zdefiniowanego w pliku awx.yaml. Na przykład:

```markdown
http://10.10.0.123:30060
```

Źródła:
* [AWX](https://github.com/ansible/awx)
* [Operator AWX](https://github.com/ansible/awx-operator)
* [Dokumentacja instalacji operatora AWX](https://ansible.readthedocs.io/projects/awx-operator/en/latest/installation/basic-install.html)
* [Binarka Kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/)
* [Wydania i tagi AWX](https://github.com/ansible/awx-operator/releases)