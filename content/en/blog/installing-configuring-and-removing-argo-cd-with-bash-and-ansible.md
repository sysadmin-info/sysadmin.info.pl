---
title: Installing, Configuring, and Removing Argo CD with Bash and Ansible
date: 2024-03-19T1:00:00+00:00
description: Learn how to install, configure, and uninstall Argo CD in Kubernetes using Bash scripts and Ansible playbooks. This tutorial offers a practical guide for managing your continuous delivery system, with tips for both beginners and current users to streamline GitOps workflows and application maintenance.
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- ansible
categories:
- ansible
cover:
    image: images/2024-thumbs/argocd1.webp
---

### Gitlab Integration with AWX - Automating Ansible Playbook Execution

**In the below videos, I explain how to install, configure and remove Argo CD with Bash and Ansible.**

{{<youtube dq3QbPp-GTA>}}
{{<youtube Wo8nFAEOtJc>}}

### Tutorial: Installing, Configuring, and Removing Argo CD with Bash and Ansible

In this tutorial, we will cover how to install, configure, and remove Argo CD, a declarative, GitOps continuous delivery tool for Kubernetes, using Bash scripts and Ansible playbooks.

---

#### Part 1: Installing and Configuring Argo CD

**Install Git and Helm:**

Start by installing Git and Helm in your environment. Helm is a package manager for Kubernetes that simplifies deployment of applications and services.

```bash
sudo apt install git
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**Enable Helm Autocomplete:**

To make your Helm experience more efficient, enable autocomplete for your bash shell:

```bash
echo "source <(helm completion bash)" >> ~/.bashrc
source ~/.bashrc
```

**Create the Argo CD Namespace:**

Namespaces help organize resources within Kubernetes. Create a namespace specifically for Argo CD:

```bash
kubectl create namespace argocd
```

**Add the Argo CD Helm Repository:**

Helm repositories store packaged Helm charts. Add the Argo CD repository to Helm:

```bash
helm repo add argo https://argoproj.github.io/argo-helm
```

**Update Your Helm Repositories:**

Ensure you have the latest chart information from all your added repositories:

```bash
helm repo update
```

**Install Argo CD with Helm:**

Deploy Argo CD into your Kubernetes cluster within the `argocd` namespace:

```bash
helm install -n argocd argocd argo/argo-cd
```

**Create an Ingress Resource for Argo CD:**

Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster. Create an ingress to access Argo CD externally:

First, create a file named `argocd-ingress.yml`:

```bash
vim argocd-ingress.yml
```

Then, insert the following YAML content:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: argocd-ingress
namespace: argocd
annotations:
nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
ingressClassName: nginx
rules:
- host: argocd.sysadmin.homes
http:
  paths:
  - path: /
    pathType: Prefix
    backend:
      service:
        name: argocd-server
        port:
          number: 443
```

Apply the ingress configuration:

```bash
kubectl apply -f argocd-ingress.yml
```

**Retrieve Initial Admin Password:**

Argo CD generates an initial admin password that you'll need for login:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d ; echo
```

You should delete the initial secret afterwards as suggested by the [Getting Started Guide](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)

**Modify Argo CD's Configuration for logout issue:**

If you encounter issues related to logout error, update the Argo CD configuration:

```bash
kubectl -n argocd get configmap argocd-cm -o yaml > argocd-cm.yml
sed -i 's/example.com/sysadmin.homes/g' argocd-cm.yml
kubectl apply -f argocd-cm.yml
```

---

#### Part 2: Automating Installation with Bash

To automate the installation process using Bash, follow these steps:

1. Create a script named `argocd-install.sh`:

```bash
vim argocd-install.sh
```

2. Insert the provided Bash script content into the file, which mirrors the manual installation steps we covered earlier.

```bash
#!/usr/bin/bash
echo "Create argocd namespace"
kubectl create namespace argocd
echo "Add Argo CD repository"
helm repo add argo https://argoproj.github.io/argo-helm
echo "Update repository using Helm"
helm repo update
echo "Install Argo CD using Helm"
helm install -n argocd argocd argo/argo-cd
echo "Create ingress for Argo CD"
cat > argocd-ingress.yml <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: argocd-ingress
namespace: argocd
annotations:
nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
ingressClassName: nginx
rules:
- host: argocd.sysadmin.homes
http:
  paths:
  - path: /
    pathType: Prefix
    backend:
      service:
        name: argocd-server
        port:
          number: 443
EOF
echo "Deploy ingress for Argo CD"
kubectl apply -f argocd-ingress.yml 
echo "Fix the problem with logout to argocd.example.com"
kubectl -n argocd get configmap argocd-cm -o yaml > argocd-cm.yml
sed -i 's/example.com/sysadmin.homes/g' argocd-cm.yml
kubectl apply -f argocd-cm.yml
```
3. Save the file and make it executable:

```bash
chmod +x argocd-install.sh
```

4. Execute the script:

```bash
./argocd-install.sh
```

5. Retrieve Initial Admin Password:

Argo CD generates an initial admin password that you'll need for login:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d ; echo
```

6. You should delete the initial secret afterwards as suggested by the [Getting Started Guide](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)

---

#### Part 3: Automating Installation with Ansible

For those who prefer Ansible, the tutorial includes steps to automate the Argo CD deployment using an Ansible playbook:

1. Create an Ansible playbook named `argocd-install.yml`:

```bash
vim argocd-install.yml
```

2. Copy the provided Ansible playbook content into the file. The playbook automates the steps from the manual installation process.

```yaml
---
- name: Install Argo CD
hosts: localhost
become: yes
tasks:
- name: Create argocd namespace
  shell: kubectl create namespace argocd
  ignore_errors: yes

- name: Add Argo CD repository
  shell: helm repo add argo https://argoproj.github.io/argo-helm
  ignore_errors: yes

- name: Update repository using Helm
  shell: helm repo update
  ignore_errors: yes

- name: Install Argo CD using Helm
  shell: helm install -n argocd argocd argo/argo-cd
  environment:
    KUBECONFIG: /etc/rancher/k3s/k3s.yaml
  ignore_errors: yes

- name: Create Ingress for Argo CD
  shell: |
    kubectl apply -f - <<EOF
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: argocd-ingress
      namespace: argocd
      annotations:
        nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
    spec:
      ingressClassName: nginx
      rules:
      - host: argocd.sysadmin.homes
        http:
          paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 443
    EOF
  ignore_errors: yes

- name: Pause for 1 minute to allow Argo CD to initialize
  pause:
    minutes: 1

- name: Get argocd-cm configmap
  shell: kubectl -n argocd get configmap argocd-cm -o yaml > /tmp/argocd-cm.yml
  ignore_errors: yes

- name: Update argocd-cm configmap
  replace:
    path: /tmp/argocd-cm.yml
    regexp: 'example.com'
    replace: 'sysadmin.homes'
  ignore_errors: yes

- name: Apply the modified argocd-cm configmap
  shell: kubectl apply -f /tmp/argocd-cm.yml
  ignore_errors: yes
```

3. Save the file and run the playbook:

```bash
ansible-playbook argocd-install.yml
```

You should see similar output:

```bash
PLAY [Install Argo CD] **************************************************************************************************
TASK [Gathering Facts] **************************************************************************************************ok: [localhost]

TASK [Create argocd namespace] ******************************************************************************************changed: [localhost]

TASK [Add Argo CD repository] *******************************************************************************************changed: [localhost]

TASK [Update repository using Helm] *************************************************************************************changed: [localhost]

TASK [Install Argo CD using Helm] ***************************************************************************************changed: [localhost]

TASK [Create Ingress for Argo CD] ***************************************************************************************changed: [localhost]

TASK [Get argocd-cm configmap] ******************************************************************************************changed: [localhost]

TASK [Update argocd-cm configmap] ***************************************************************************************changed: [localhost]

TASK [Apply the modified argocd-cm configmap] ***************************************************************************changed: [localhost]

PLAY RECAP **************************************************************************************************************localhost                  : ok=9    changed=8    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```


4. Retrieve Initial Admin Password:

Argo CD generates an initial admin password that you'll need for login:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d ; echo
```

5. You should delete the initial secret afterwards as suggested by the [Getting Started Guide](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)


The above Ansible playbook is structured to automate the deployment and configuration of Argo CD in a Kubernetes environment. Below is a detailed breakdown of its components and tasks:

1. **Overall Structure**: The playbook starts with YAML front matter (`---`) and defines a single play named "Install Argo CD". It is intended to be executed on the local machine (indicated by `hosts: localhost`) and requires elevated privileges (`become: yes`), which is similar to running commands with sudo.

2. **Tasks**: The playbook comprises several tasks, each designed to accomplish a specific step in the setup process:

- **Create argocd namespace**: This task uses the `kubectl create namespace argocd` command to create a new Kubernetes namespace called `argocd`. This namespace is intended for all resources related to Argo CD. The `ignore_errors: yes` directive ensures that the playbook continues even if this command encounters an error, which might be useful if the namespace already exists.

- **Add Argo CD repository**: Executes `helm repo add argo https://argoproj.github.io/argo-helm` to add the Argo CD chart repository to Helm, enabling Helm to install Argo CD from this repository.

- **Update repository using Helm**: Runs `helm repo update` to update the local cache of charts from all added repositories, ensuring the latest versions are available for installation.

- **Install Argo CD using Helm**: This task uses Helm to install Argo CD into the previously created `argocd` namespace. It sets the `KUBECONFIG` environment variable explicitly to point to the kubeconfig file, ensuring that Helm interacts with the correct Kubernetes cluster.

- **Create Ingress for Argo CD**: Applies an Ingress resource to expose the Argo CD server externally. The resource is defined inline and applied using `kubectl apply`. The Ingress is configured to use HTTPS and directs traffic to the `argocd-server` service.

- **Pause for 3 minutes to allow Argo CD to initialize**: Utilizes the `pause` module to halt playbook execution for three minutes. This delay gives Argo CD time to fully start and become operational before proceeding with further configurations.

- **Get argocd-cm configmap**: Retrieves the `argocd-cm` ConfigMap from the `argocd` namespace and writes it to a file (`/tmp/argocd-cm.yml`). This ConfigMap contains configuration settings for Argo CD.

- **Update argocd-cm configmap**: Employs the `replace` module to modify the saved ConfigMap file, changing instances of `example.com` to `sysadmin.homes`. This task customizes Argo CD's domain settings to match the desired environment.

- **Apply the modified argocd-cm configmap**: Applies the changes to the `argocd-cm` ConfigMap back to the Kubernetes cluster using `kubectl apply`, updating the Argo CD configuration.

Each task includes the `ignore_errors: yes` option to continue execution even if errors occur. This can be useful in scripts where errors in some operations can be anticipated or are inconsequential, but it might also obscure important problems, so it's typically used with caution.

By combining these tasks, the playbook automates the setup and initial configuration of Argo CD, facilitating continuous deployment and management of applications within Kubernetes environments.

You should delete the initial secret afterwards as suggested by the [Getting Started Guide](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)

---

#### Part 4: Removing Argo CD with Ansible

When you need to remove Argo CD from your cluster, use the provided Ansible playbook designed for clean removal:

1. Create a removal playbook named `remove-argocd.yml`:

```bash
vim remove-argocd.yml
```

2. Insert the provided content aimed at systematically deleting Argo CD components.

```yaml
---
- name: Remove Argo CD
hosts: localhost
become: yes
tasks:
- name: scales all deployments in the argocd namespace to zero replicas
  shell: kubectl scale deployment --all --replicas=0 -n argocd
  ignore_errors: yes

- name: Remove Argo CD deployments
  shell: kubectl delete deployment argocd-repo-server argocd-applicationset-controller argocd-notifications-controller argocd-redis argocd-dex-server argocd-server -n argocd
  ignore_errors: yes

- name: Remove Argo CD services
  shell: kubectl delete service argocd-applicationset-controller argocd-repo-server argocd-dex-server argocd-redis argocd-server -n argocd
  ignore_errors: yes 

- name: Remove Argo CD statefulsets
  shell: kubectl delete statefulset argocd-application-controller -n argocd
  ignore_errors: yes            

- name: Remove Argo CD service accounts
  shell: kubectl delete serviceaccount default argocd-dex-server argocd-application-controller argocd-server argocd-notifications-controller argocd-applicationset-controller argocd-repo-server -n argocd
  ignore_errors: yes

- name: Remove Argo CD role bindings
  shell: kubectl delete rolebinding argocd-repo-server argocd-application-controller argocd-dex-server argocd-server argocd-notifications-controller argocd-applicationset-controller -n argocd
  ignore_errors: yes

- name: remove Argo CD roles
  shell: kubectl delete role argocd-server argocd-applicationset-controller argocd-dex-server argocd-repo-server argocd-notifications-controller argocd-application-controller -n argocd
  ignore_errors: yes

- name: Remove Argo CD ingress in namespace argocd
  shell: kubectl delete ingress argocd-ingress -n argocd 
  ignore_errors: yes

- name: Remove namespace argocd
  shell: kubectl delete namespace argocd
  ignore_errors: yes
```

3. Execute the removal playbook:

```bash
ansible-playbook remove-argocd.yml
```

This playbook de-scales, deletes deployments, services, statefulsets, service accounts, role bindings, roles, ingresses, and finally, the entire `argocd` namespace, effectively cleaning up all Argo CD components from your cluster.

More details below:

This Ansible playbook is designed to systematically remove Argo CD and its associated resources from a Kubernetes cluster. Each task in the playbook uses the `shell` module to execute `kubectl` commands directly, interacting with the cluster to delete specific Argo CD components. The playbook operates on the local machine (`hosts: localhost`) and requires elevated privileges (`become: yes`). Here's a detailed breakdown:

1. **scales all deployments in the argocd namespace to zero replicas**: This task scales down all deployments in the `argocd` namespace to zero replicas, effectively stopping all running Argo CD components. This is often done as a preliminary step before deletion to ensure a graceful shutdown of services.

2. **Remove Argo CD deployments**: Deletes specific Argo CD deployments, including the repository server, ApplicationSet controller, notifications controller, Redis server, Dex server, and the main Argo CD server itself, all within the `argocd` namespace.

3. **Remove Argo CD services**: Deletes services associated with the same components listed above. In Kubernetes, services provide network access to set of pods, so removing these services cuts off network access to the corresponding Argo CD components.

4. **Remove Argo CD statefulsets**: Deletes the `argocd-application-controller` StatefulSet. In Argo CD, the application controller manages the lifecycle of applications and continuously monitors application states. Since it's deployed as a StatefulSet, it requires a separate command from Deployments.

5. **Remove Argo CD service accounts**: Deletes Kubernetes service accounts used by Argo CD components. Service accounts provide an identity for processes that run in a Pod and allow the Argo CD components to interact with the Kubernetes API.

6. **Remove Argo CD role bindings**: Deletes RoleBindings in the `argocd` namespace. RoleBindings link Roles to users or groups, granting permissions to the resources described in the roles. This step removes the permissions that Argo CD components had within the namespace.

7. **Remove Argo CD roles**: Deletes Roles within the `argocd` namespace. Roles define a set of permissions, such as what operations are allowed on a set of resources. This step effectively removes those defined permissions.

8. **Remove Argo CD ingress in namespace argocd**: Deletes the Ingress resource for Argo CD, which would have been used to expose the Argo CD server to the outside world via a URL.

9. **Remove namespace argocd**: Finally, deletes the entire `argocd` namespace, which removes all remaining resources under the namespace, cleaning up the environment. This is the final step to ensure that all components, including those possibly missed by earlier tasks, are removed.

Each task is set with `ignore_errors: yes`, meaning the playbook will continue executing even if errors occur in any tasks. This can be useful when you are unsure if all components are present or if you want to ensure the playbook runs through to completion regardless of individual command failures. However, it's important to be cautious with this setting, as it can also mean real errors are ignored, which could lead to incomplete cleanup.

---

Congratulations! You have successfully learned how to install, configure, automate, and remove Argo CD in a Kubernetes cluster using both Bash scripts and Ansible playbooks. This tutorial provides the tools necessary for both manual and automated management of Argo CD, catering to a variety of operational preferences.