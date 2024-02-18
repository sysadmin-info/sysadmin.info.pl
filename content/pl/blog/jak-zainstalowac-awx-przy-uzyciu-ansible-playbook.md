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
    - name: Download Kustomize with curl
      shell: curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash

    - name: Move Kustomize to the /usr/local/bin directory
      shell: mv kustomize /usr/local/bin

    - name: Create namespace awx
      shell: kubectl create namespace awx

    - name: Create awx.yaml 
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

    - name: Create variable RELEASE_TAG
      shell: RELEASE_TAG=`curl -s https://api.github.com/repos/ansible/awx-operator/releases/latest | grep tag_name | cut -d '"' -f 4`
    
    - name: Display variable RELEASE_TAG
      shell: echo $RELEASE_TAG

    - name: Create kustomization.yaml
      shell:
        cmd: |
          cat > kustomization.yaml << EOF
          ---
          apiVersion: kustomize.config.k8s.io/v1beta1
          kind: Kustomization
          resources:
            # Find the latest tag here: https://github.com/ansible/awx-operator/releases
            - github.com/ansible/awx-operator/config/default?ref=$RELEASE_TAG
            - awx.yaml
          # Set the image tags to match the git version from above
          images:
            - name: quay.io/ansible/awx-operator
              newTag: $RELEASE_TAG
          # Specify a custom namespace in which to install AWX
          namespace: awx
          EOF
      args:
        executable: /bin/bash

    - name: Kick off the building of the ansible awx
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

8. Usuń AWX

1. Utwórz plik skryptu ansible: awx-remove.yml

```bash
vim awx-remove.yml
```

I wklej poniższą zawartość do tego pliku.

```yaml
---
- name: Remove AWX
  hosts: localhost
  become: yes
  tasks:
    - name: Remove awx deployment 
      shell: kubectl delete deployment awx-operator-controller-manager -n awx
      ignore_errors: yes

    - name: Remove service account
      shell: kubectl delete serviceaccount awx-operator-controller-manager -n awx
      ignore_errors: yes

    - name: Remove role binding
      shell: kubectl delete rolebinding awx-operator-awx-manager-rolebinding -n awx
      ignore_errors: yes

    - name: remove role
      shell: kubectl delete role awx-operator-awx-manager-role -n awx
      ignore_errors: yes

    - name: scales all deployments in the awx namespace to zero replicas
      shell: kubectl scale deployment --all --replicas=0 -n awx
      ignore_errors: yes

    - name: remove deployments
      shell: kubectl delete deployments.apps/awx-web deployments.apps/awx-task -n awx 
      ignore_errors: yes

    - name: remove statefulsets
      shell: kubectl delete statefulsets.apps/awx-postgres-13 -n awx 
      ignore_errors: yes

    - name: remove services
      shell: kubectl delete service/awx-operator-controller-manager-metrics-service service/awx-postgres-13 service/awx-service -n awx
      ignore_errors: yes

    - name: Get persistent volume claim name
      command: kubectl get pvc -n awx -o custom-columns=:metadata.name --no-headers
      register: pvc_output
      ignore_errors: yes

    - name: Remove persistent volume claim
      command: kubectl delete pvc {{ pvc_output.stdout }} -n awx
      when: pvc_output.stdout != ""
      ignore_errors: yes

    - name: Get persistent volume name
      command: kubectl get pv -n awx -o custom-columns=:metadata.name --no-headers
      register: pv_output
      ignore_errors: yes

    - name: Remove persistent volume
      command: kubectl delete pv {{ pv_output.stdout }}
      when: pv_output.stdout != ""
      ignore_errors: yes

    - name: Remove namespace awx
      shell: kubectl delete namespace awx
      ignore_errors: yes
```

Uruchom skrypt jak poniżej:

```bash
ansible-playbook awx-remove.yml
```

### Naprawiony playbook, który rozwiązuje problem ze ścieżką dla projektów w AWX GUI. 
Teraz możesz utworzyć katalog /var/lib/awx/projects na swoim hoście, a także utworzyć podkatalogi wewnątrz tego katalogu, aby oddzielić projekty. To, co utworzysz na hoście, zostanie automatycznie utworzone wewnątrz kontenera w awx-web pod.

```yaml
---
- name: Install AWX
  hosts: localhost
  become: yes
  tasks:
    - name: Download Kustomize with curl
      shell: curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash

    - name: Move Kustomize to the /usr/local/bin directory
      shell: mv kustomize /usr/local/bin

    - name: Create namespace awx
      shell: kubectl create namespace awx

    - name: Create awx.yaml 
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
            projects_persistence: true
            projects_existing_claim: awx-projects-claim
          EOF
      args:
        executable: /bin/bash

    - name: Create variable RELEASE_TAG
      shell: RELEASE_TAG=$(curl -s https://api.github.com/repos/ansible/awx-operator/releases/latest | grep tag_name | cut -d '"' -f 4)

    - name: Display variable RELEASE_TAG
      shell: echo $RELEASE_TAG

    - name: Create pv.yml and pvc.yml for project directory
      shell:
        cmd: |
          cat > pv.yml << EOF
          ---
          apiVersion: v1
          kind: PersistentVolume
          metadata:
            name: awx-projects-volume
          spec:
            accessModes:
              - ReadWriteOnce
            persistentVolumeReclaimPolicy: Retain
            capacity:
              storage: 2Gi
            storageClassName: awx-projects-volume
            hostPath:
              path: /var/lib/awx/projects
          EOF

          cat > pvc.yml << EOF
          ---
          apiVersion: v1
          kind: PersistentVolumeClaim
          metadata:
            name: awx-projects-claim
          spec:
            accessModes:
              - ReadWriteOnce
            volumeMode: Filesystem
            resources:
              requests:
                storage: 2Gi
            storageClassName: awx-projects-volume
          EOF
      args:
        executable: /bin/bash

    - name: Apply pv.yml
      shell: kubectl apply -f pv.yml

    - name: Apply pvc.yml in the awx namespace
      shell: kubectl -n awx apply -f pvc.yml

    - name: Create kustomization.yaml
      shell:
        cmd: |
          cat > kustomization.yaml << EOF
          ---
          apiVersion: kustomize.config.k8s.io/v1beta1
          kind: Kustomization
          resources:
            - github.com/ansible/awx-operator/config/default?ref=$RELEASE_TAG
            - awx.yaml
          images:
            - name: quay.io/ansible/awx-operator
              newTag: $RELEASE_TAG
          namespace: awx
          EOF
      args:
        executable: /bin/bash

    - name: Kick off the building of the ansible awx
      shell: kustomize build . | kubectl apply -f -
```

Źródła:
* [AWX](https://github.com/ansible/awx)
* [Operator AWX](https://github.com/ansible/awx-operator)
* [Dokumentacja instalacji operatora AWX](https://ansible.readthedocs.io/projects/awx-operator/en/latest/installation/basic-install.html)
* [Binarka Kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/)
* [Wydania i tagi AWX](https://github.com/ansible/awx-operator/releases)