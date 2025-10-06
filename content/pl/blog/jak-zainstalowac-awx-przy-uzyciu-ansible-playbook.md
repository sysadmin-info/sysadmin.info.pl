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
cover:
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
  vars:
    awx_namespace: awx

  tasks:
    - name: Download Kustomize with curl
      ansible.builtin.shell:
        cmd: curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
        creates: /usr/local/bin/kustomize

    - name: Move Kustomize to the /usr/local/bin directory
      ansible.builtin.shell:
        cmd: mv kustomize /usr/local/bin
      args:
        creates: /usr/local/bin/kustomize

    - name: Ensure namespace {{ awx_namespace }} exists
      ansible.builtin.shell:
        cmd: kubectl create namespace {{ awx_namespace }} --dry-run=client -o yaml | kubectl apply -f -

    - name: Generate AWX resource file
      ansible.builtin.copy:
        dest: "./awx.yaml"
        content: |
          ---
          apiVersion: awx.ansible.com/v1beta1
          kind: AWX
          metadata:
            name: awx
          spec:
            service_type: nodeport
            nodeport_port: 30060         

    - name: Fetch latest release tag of AWX Operator
      ansible.builtin.shell:
        cmd: curl -s https://api.github.com/repos/ansible/awx-operator/releases/latest | grep tag_name | cut -d '"' -f 4
      register: release_tag
      changed_when: false

    - name: Create kustomization.yaml
      ansible.builtin.copy:
        dest: "./kustomization.yaml"
        content: |
          ---
          apiVersion: kustomize.config.k8s.io/v1beta1
          kind: Kustomization
          resources:
            - github.com/ansible/awx-operator/config/default?ref={{ release_tag.stdout }}
            - awx.yaml
          images:
            - name: quay.io/ansible/awx-operator
              newTag: {{ release_tag.stdout }}
          namespace: {{ awx_namespace }}          

    - name: Apply Kustomize configuration
      ansible.builtin.shell:
        cmd: kustomize build . | kubectl apply -f -
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
kubectl get secret awx-admin-password -o jsonpath="{.data.password}" -n awx | base64 --decode ; echo
```

Dodatkowo możesz zmienić hasło na swoje własne za pomocą poniższej komendy:

```bash
kubectl -n awx exec -it awx-web-65655b54bf-8lxvr -- awx-manage changepassword admin
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
- name: Usuń AWX
  hosts: localhost
  become: yes
  tasks:
    - name: Usuń wdrożenie awx 
      shell: kubectl delete deployment awx-operator-controller-manager -n awx
      ignore_errors: yes

    - name: Usuń konto usługi
      shell: kubectl delete serviceaccount awx-operator-controller-manager -n awx
      ignore_errors: yes

    - name: Usuń powiązanie roli
      shell: kubectl delete rolebinding awx-operator-awx-manager-rolebinding -n awx
      ignore_errors: yes

    - name: Usuń rolę
      shell: kubectl delete role awx-operator-awx-manager-role -n awx
      ignore_errors: yes

    - name: Zmniejsz liczbę replik wszystkich wdrożeń w przestrzeni nazw awx do zera
      shell: kubectl scale deployment --all --replicas=0 -n awx
      ignore_errors: yes

    - name: Usuń wdrożenia
      shell: kubectl delete deployments.apps/awx-web deployments.apps/awx-task -n awx 
      ignore_errors: yes

    - name: Usuń zestawy stanowe
      shell: kubectl delete statefulsets.apps/awx-postgres-13 -n awx 
      ignore_errors: yes

    - name: Usuń usługi
      shell: kubectl delete service/awx-operator-controller-manager-metrics-service service/awx-postgres-13 service/awx-service -n awx
      ignore_errors: yes

    - name: Pobierz nazwę persistent volume claim
      command: kubectl get pvc -n awx -o custom-columns=:metadata.name --no-headers
      register: pvc_output
      ignore_errors: yes

    - name: Usuń Persistent volume claim
      command: kubectl -n awx delete pvc {{ pvc_output.stdout }}
      when: pvc_output.stdout != ""
      ignore_errors: yes

    - name: Pobierz nazwę objętości trwałej
      command: kubectl get pv -n awx -o custom-columns=:metadata.name --no-headers
      register: pv_output
      ignore_errors: yes

    - name: Usuń Persistent volume
      command: kubectl -n awx delete pv {{ pv_output.stdout }}
      when: pv_output.stdout != ""
      ignore_errors: yes

    - name: Usuń przestrzeń nazw awx
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
  vars:
    awx_namespace: awx
    project_directory: /var/lib/awx/projects
    storage_size: 2Gi

  tasks:
    - name: Download Kustomize with curl
      ansible.builtin.shell:
        cmd: curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
        creates: /usr/local/bin/kustomize

    - name: Move Kustomize to the /usr/local/bin directory
      ansible.builtin.shell:
        cmd: mv kustomize /usr/local/bin
      args:
        creates: /usr/local/bin/kustomize

    - name: Ensure namespace {{ awx_namespace }} exists
      ansible.builtin.shell:
        cmd: kubectl create namespace {{ awx_namespace }} --dry-run=client -o yaml | kubectl apply -f -

    - name: Generate AWX resource file
      ansible.builtin.copy:
        dest: "./awx.yaml"
        content: |
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

    - name: Fetch latest release tag of AWX Operator
      ansible.builtin.shell:
        cmd: curl -s https://api.github.com/repos/ansible/awx-operator/releases/latest | grep tag_name | cut -d '"' -f 4
      register: release_tag
      changed_when: false

    - name: Generate PV and PVC resource files
      ansible.builtin.copy:
        dest: "{{ item.dest }}"
        content: "{{ item.content }}"
      loop:
        - dest: "./pv.yml"
          content: |
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
                storage: {{ storage_size }}
              storageClassName: awx-projects-volume
              hostPath:
                path: {{ project_directory }}
        - dest: "./pvc.yml"
          content: |
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
                  storage: {{ storage_size }}
              storageClassName: awx-projects-volume

    - name: Create kustomization.yaml
      ansible.builtin.copy:
        dest: "./kustomization.yaml"
        content: |
          ---
          apiVersion: kustomize.config.k8s.io/v1beta1
          kind: Kustomization
          resources:
            - github.com/ansible/awx-operator/config/default?ref={{ release_tag.stdout }}
            - pv.yml
            - pvc.yml
            - awx.yaml
          images:
            - name: quay.io/ansible/awx-operator
              newTag: {{ release_tag.stdout }}
          namespace: {{ awx_namespace }}

    - name: Apply Kustomize configuration
      ansible.builtin.shell:
        cmd: kustomize build . | kubectl apply -f -
```

Źródła:
* [AWX](https://github.com/ansible/awx)
* [Operator AWX](https://github.com/ansible/awx-operator)
* [Dokumentacja instalacji operatora AWX](https://ansible.readthedocs.io/projects/awx-operator/en/latest/installation/basic-install.html)
* [Binarka Kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/)
* [Wydania i tagi AWX](https://github.com/ansible/awx-operator/releases)
