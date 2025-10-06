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
cover:
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
kubectl get secret awx-admin-password -o jsonpath="{.data.password}" -n awx | base64 --decode ; echo
```

In addition, you can change the password to your own with the following command:

```bash
kubectl -n awx exec -it awx-web-65655b54bf-8lxvr -- awx-manage changepassword admin
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
      command: kubectl -n awx delete pvc {{ pvc_output.stdout }}
      when: pvc_output.stdout != ""
      ignore_errors: yes

    - name: Get persistent volume name
      command: kubectl get pv -n awx -o custom-columns=:metadata.name --no-headers
      register: pv_output
      ignore_errors: yes

    - name: Remove persistent volume
      command: kubectl -n awx delete pv {{ pv_output.stdout }}
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

Sources:
* [AWX](https://github.com/ansible/awx)
* [AWX Operator](https://github.com/ansible/awx-operator)
* [AWX Operator installation documentation](https://ansible.readthedocs.io/projects/awx-operator/en/latest/installation/basic-install.html)
* [Kustomize binary](https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/)
* [AWX releases and tags](https://github.com/ansible/awx-operator/releases)
