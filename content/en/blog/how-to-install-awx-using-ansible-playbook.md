---
title: How to install AWX using Ansible playbook
date: 2023-11-27T17:00:00+00:00
description: How to install AWX using Ansible playbook
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


{{< notice success "How to install, configure and use Ansible" >}}
Click here: [A series of articles about Ansible:](/en/categories/ansible/)
{{< /notice >}}

### Ansible+AWX

**Here is a video tutorial**

{{<youtube Ld06sc6H9AM>}}

#### Requirements for Ansible

* ansible user added to the machine where aansible is installed
* ansible user added to sudo/wheel/admins group
* sudo/wheel/admins group set in /etc/sudoers to perform command with elevated privileges

1. Create ansible playbook file: awx-install.yml

```bash
vim awx-install.yml
```

And put the below content into this file.

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

{{< notice success "Information" >}}
playbook file is available [here:](https://github.com/sysadmin-info/ansible)
{{< /notice >}}


2. Run the playbook like below:


```bash
ansible-playbook awx-install.yml
```

3. Open a new terminal and watch logs

```bash
kubectl logs -f deployments/awx-operator-controller-manager -c awx-manager -n awx
```

Check if pods are created in awx namespace

```bash
kubectl get pods -n awx
```

4. Check service 

```bash
kubectl get svc -n awx
```

5. Get the awx password

```bash
kubectl get secret awx-admin-password -o jsonpath="{.data.password}" -n awx | base64 --decode
```

6. Check the IP address of the host where AWX has been installed

```bash
hostname -I
```

7. Open it in a browser using a port defined in awx.yaml file. For example:

```markdown
http://10.10.0.123:30060
```

8. Uninstall AWX

Create ansible playbook file: awx-install.yml

```bash
vim awx-remove.yml
```

And put the below content into this file.

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

Run the playbook like below:

```bash
ansible-playbook awx-remove.yml
```

### Fixed playbook that solves the problem with a path for projects in AWX GUI. 
Now you can create a /var/lib/awx/projects directory on your host, also create subdirectories inside this directory to separate projects. What you will create on a host it will be created automatically inside container in awx-web pod. 

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

Sources:
* [AWX](https://github.com/ansible/awx)
* [AWX Operator](https://github.com/ansible/awx-operator)
* [AWX Operator installation documentation](https://ansible.readthedocs.io/projects/awx-operator/en/latest/installation/basic-install.html)
* [Kustomize binary](https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/)
* [AWX releases and tags](https://github.com/ansible/awx-operator/releases)