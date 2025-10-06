---
title: Persistent Perfection - Mastering AWX Project Storage on Kubernetes
date: 2024-02-24T14:00:00+00:00
description: How to fix the problem in AWX - There are no available playbook directories in /var/lib/awx/projects. 
draft: false
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
    image: images/2024-thumbs/ansible09.webp
---

{{< notice success "Information in AWX" >}}
There are no available playbook directories in /var/lib/awx/projects. Either that directory is empty, or all of the contents are already assigned to other projects. Create a new directory there and make sure the playbook files can be read by the "awx" system user, or have AWX directly retrieve your playbooks from source control using the Source Control Type option above.
{{< /notice >}}

### How to fix the problem: There are no available playbook directories in /var/lib/awx/projects ?

**Here is a video tutorial**

{{<youtube q03HPrUVxUw>}}

### Below there is a fixed playbook that solves the problem with a path for projects in AWX GUI. 
Now you can create a /var/lib/awx/projects directory on your host, also create subdirectories inside this directory to separate projects. What you will create on a host it will be created automatically inside container in awx-web pod.

You will find more information how the whole solution work, after the implementation steps.

#### Implementation

1. Create ansible playbook file: awx-install-fixed-projects.yml. 

```bash
vim awx-install-fixed-projects.yml
```

And put the below content into this file.

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

{{< notice success "Information" >}}
playbook file is available [here:](https://github.com/sysadmin-info/ansible)
{{< /notice >}}

2. Run the playbook like below:

```bash
ansible-playbook awx-install-fixed-projects.yml
```

3. Open a new terminal and watch logs.

```bash
kubectl logs -f deployments/awx-operator-controller-manager -c awx-manager -n awx
```

Check if pods are created in awx namespace.

```bash
kubectl get pods -n awx
```

4. Check service .

```bash
kubectl get svc -n awx
```

5. Get the awx password.

```bash
kubectl get secret awx-admin-password -o jsonpath="{.data.password}" -n awx | base64 --decode ; echo
```

In addition, you can change the password to your own with the following command:

```bash
kubectl -n awx exec -it awx-web-65655b54bf-8lxvr -- awx-manage changepassword admin
```

6. Check the IP address of the host where AWX has been installed.

```bash
hostname -I
```

7. Open it in a browser using a port defined in awx.yaml file. For example:

```markdown
http://10.10.0.123:30060
```

8. Uninstall AWX

Create ansible playbook file: awx-install-fixed-projects.yml

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

#### Details for PV and PVC defined in ansible playbook:

This ansible playbook is designed to deploy AWX (the open-source version of ansible Tower) in a Kubernetes cluster, making use of Persistent Volumes (PV) and Persistent Volume Claims (PVC) to manage storage. Let's break down how PV and PVC are defined and used within this playbook, particularly in the context of the task "Generate PV and PVC resource files."

##### Persistent Volume (PV)

A Persistent Volume (PV) in Kubernetes is a piece of storage in the cluster that has been provisioned by an administrator or dynamically provisioned using Storage Classes. It is a cluster resource that persists beyond the lifecycle of any individual pod that uses the PV.

In this playbook, a PV is defined with the following characteristics:
- **Name:** `awx-projects-volume`
- **Access Modes:** `ReadWriteOnce` which means the volume can be mounted as read-write by a single node.
- **Reclaim Policy:** `Retain` indicating that the data in the volume is retained even after the PV is released.
- **Capacity:** Specified by the `storage_size` variable, set to `2Gi` in the playbook variables.
- **Storage Class Name:** `awx-projects-volume`. This name links the PV to a specific storage class.
- **HostPath:** Uses the `project_directory` variable (`/var/lib/awx/projects`) for storage, indicating that data is stored on a path on the host.

##### Persistent Volume Claim (PVC)

A Persistent Volume Claim (PVC) is a request for storage by a user. It specifies size, and access modes among other things. A PVC will get matched with an available PV, and then it can be mounted by a pod.

In this playbook, a PVC is defined with the following characteristics:
- **Name:** `awx-projects-claim`
- **Access Modes:** `ReadWriteOnce`, matching the PV.
- **Volume Mode:** `Filesystem`, indicating that the volume is intended to be used as a filesystem.
- **Resources/Requests/Storage:** Also specified by the `storage_size` variable, set to `2Gi`, matching the PV's capacity.
- **Storage Class Name:** `awx-projects-volume`, ensuring it binds with the PV of the same storage class.

##### How PV and PVC work together

1. **PV Creation:** First, a Persistent Volume is created with a specified size, storage class, and access mode. It represents a piece of storage in the cluster that is available for use.
2. **PVC Creation:** Then, a Persistent Volume Claim is defined, requesting storage of a certain size and with certain access modes. The PVC's storage class name matches that of the PV, ensuring they are bound together.
3. **Binding:** Kubernetes matches the PVC to an available PV based on compatibility (size, access modes, and storage class). Once bound, the PVC can be used by a pod.
4. **Usage in AWX:** The AWX deployment, defined in the `awx.yaml` file, specifies that projects should persist data using an existing claim (`projects_existing_claim: awx-projects-claim`). This means AWX will use the storage defined by the PVC (and by extension, the PV) for storing project data.

This setup ensures that AWX has a dedicated, persistent storage space for its projects, independent of pod lifecycles. The use of hostPath for the PV means that data will be stored directly on a path on the host machine running Kubernetes, which is suitable for single-node clusters or for development/testing purposes but might need to be re-evaluated for multi-node or production environments for resilience and availability.

#### Structure of the ansible playbook for AWX installation

The playbook is effective and aligns well with the best practices. It simplifies the deployment process by using ansible's built-in modules where possible and directly executing shell commands where necessary. Here's a breakdown of the key aspects of your playbook:

1. **Downloading and Moving Kustomize**: You've used the `ansible.builtin.shell` module effectively to ensure Kustomize is downloaded and moved to `/usr/local/bin` if it doesn't already exist there. This is a crucial step for ensuring that Kustomize is available for subsequent tasks.

2. **Ensuring Namespace Existence**: The use of `kubectl create namespace --dry-run=client -o yaml | kubectl apply -f -` is a smart approach to ensure idempotence. It guarantees that the namespace will be created if it doesn't exist, without failing the playbook if the namespace already exists.

3. **Generating AWX Resource File**: The `ansible.builtin.copy` module is used to create the `awx.yaml` file, which is a clean and efficient way to handle file creation within ansible playbooks. This approach avoids potential issues with multiline strings in shell commands.

4. **Fetching the Latest Release Tag of AWX Operator**: This task dynamically fetches the latest release tag of the AWX Operator from GitHub, ensuring that your deployment always uses the most recent version of the AWX Operator. Registering the output for use in subsequent tasks is an excellent practice.

5. **Creating `kustomization.yaml`**: Again, using `ansible.builtin.copy` to generate this file based on the latest release tag and including the necessary resources and images configurations ensures that your Kustomize setup is both current and customized for your deployment.

6. **Applying Kustomize Configuration**: Finally, applying the Kustomize configuration with `kubectl apply -f -` completes the deployment by creating or updating resources in your Kubernetes cluster according to the definitions in your `kustomization.yaml` and associated resource files.

This playbook is well-structured and should effectively deploy AWX in your Kubernetes environment. By automating the deployment process, it not only saves time but also reduces the potential for human error.

#### Structure of the ansible playbook for AWX removal

I have crafted a comprehensive ansible playbook to remove various resources from the `awx` namespace in a Kubernetes cluster. This approach explicitly targets specific resources for deletion, scales down deployments, and handles both Persistent Volume Claims (PVCs) and Persistent Volumes (PVs), before finally deleting the namespace itself. Utilizing `ignore_errors: yes` ensures that the playbook continues executing even if some commands fail, which is useful in scenarios where some resources might not exist or have already been deleted.

Here are a few insights and suggestions for your playbook:

1. **Scaling Down Deployments**: The step to scale down all deployments to zero replicas is a thoughtful approach. It gracefully stops all pods managed by deployments in the `awx` namespace without immediately removing the deployment configurations. This could be useful for debugging or cleanup operations before complete resource deletion.

2. **Explicit Resource Deletion**: By explicitly deleting deployments, statefulsets, and services by name, you ensure that these resources are removed. This is particularly important for resources that might not be automatically deleted by removing the namespace, especially if there are finalizers or other mechanisms delaying their cleanup.

3. **Dynamic Resource Listing for PVCs and PVs**: Using `kubectl get` with custom output columns and no headers to dynamically list and then delete PVCs and PVs is a flexible way to handle dynamic resource names. This ensures that your playbook adapts to the resources present at runtime.

4. **Namespace Deletion as Final Step**: Deleting the namespace as the final step is appropriate since it attempts to clean up all remaining resources within the namespace. However, as you've set up explicit deletion steps for many resources, this acts as a final catch-all to ensure the namespace and any overlooked resources are removed.

5. **Consideration for Persistent Volumes**: Your approach to deleting PVs might need caution. Since PVs are cluster-scoped resources (not limited to a specific namespace), deleting them based on a namespace filter (`-n awx`) might not correctly identify the PVs you intend to delete. Ensure your selection criteria accurately target the PVs associated with your AWX deployment, possibly by labels or naming conventions.

6. **Error Handling**: While `ignore_errors: yes` helps in ensuring the playbook runs to completion, it's essential to review the output carefully, especially in production environments, to understand which steps failed and why. This can help identify any underlying issues that need attention.

My playbook demonstrates a detailed understanding of managing Kubernetes resources via ansible and highlights the importance of careful resource management and cleanup in Kubernetes environments. Remember, while ignore_errors: yes is useful in cleanup scenarios, it should be used judiciously in other contexts to avoid masking important failures.

### Permissions

When I modified owner and group using command ```bash sudo chown -R adrian:adrian projects``` inside directory /var/lib/awx on host, permissions changed like below:

- on host:

```bash
adrian@rancher:/var/lib/awx$ ls -lh /var/lib/awx/
total 4.0K
drwxrwxr-x 6 adrian adrian 4.0K Feb 23 16:00 projects
adrian@rancher:/var/lib/awx$ ls -lh /var/lib/awx/projects/
total 16K
drwxr-xr-x 3 adrian adrian 4.0K Feb 23 15:57 k3s-updates
drwxr-xr-x 2 adrian adrian 4.0K Feb 23 15:48 test
drwxr-xr-x 2 adrian adrian 4.0K Feb 23 15:53 test2
drwxr-xr-x 2 adrian adrian 4.0K Feb 23 16:00 test4
```

- on pod, inside container:

```bash
adrian@rancher:/var/lib/awx$ kubectl -n awx exec -ti deployment/awx-web -c awx-web -- /bin/bash
bash-5.1$ ls -lh /var/lib/awx/
total 16K
prw------- 1 awx  root    0 Feb 23 14:47 awxfifo
drwxrwxr-x 6 awx  1000 4.0K Feb 23 15:00 projects
drwxr-xr-x 3 root root 4.0K Feb 15 20:28 public
drwxrwxr-x 1 root root 4.0K Feb 15 20:28 rsyslog
drwxr-xr-x 3 root root 4.0K Feb 15 20:20 venv
bash-5.1$ ls -lh /var/lib/awx/projects/
total 16K
drwxr-xr-x 3 awx 1000 4.0K Feb 23 14:57 k3s-updates
drwxr-xr-x 2 awx 1000 4.0K Feb 23 14:48 test
drwxr-xr-x 2 awx 1000 4.0K Feb 23 14:53 test2
drwxr-xr-x 2 awx 1000 4.0K Feb 23 15:00 test4
```

The behavior you're observing with the permissions and ownership mappings between your host and the container is a typical scenario when using Kubernetes volumes, especially when the Persistent Volume (PV) or Persistent Volume Claim (PVC) is mounted into a container. Here's an explanation of what's happening and why:

1. **UID/GID Mapping**: When you change the ownership of the `/var/lib/awx/projects` directory on the host to `adrian:adrian`, you're applying this change based on the host's user and group IDs. Inside the container, the `awx` user is mapped to UID 1000, which matches the UID of `adrian` on the host. However, Kubernetes and the underlying container runtime don't automatically translate the group name but rather use the numeric GID directly. That's why inside the container, files and directories show as owned by `awx` (which is UID 1000, matching the host's `adrian` UID) and group `1000`, even though there's no group with that name explicitly defined in the container.

2. **Ownership Display**: The `ls -lh` command shows user and group names based on the `/etc/passwd` and `/etc/group` files inside the container for translating UID/GID to names. Since there's no entry for GID 1000 in `/etc/group` inside the container, it displays the numeric GID instead of a group name.

3. **Permission Considerations**: The permissions (`drwxrwxr-x`) indicate that the user (`awx` inside the container, `adrian` on the host) and group members have read, write, and execute permissions, while others have only read and execute permissions. This setup typically works well unless specific group permissions are required for operation, which might necessitate ensuring that the group names and GIDs align between the host and containers or adjusting permissions accordingly.

4. **Managing Permissions**: If you need the container to recognize the group name or require specific group permissions, you have a few options:
    - **Align GIDs**: Ensure that the GID for the `adrian` group on the host matches a group inside the container, and that group has the same GID. This might involve creating a new group inside the container with the same GID as the `adrian` group on the host.
    - **Security Context**: Use Kubernetes security contexts to set the `fsGroup` in the pod specification. This makes Kubernetes automatically adjust file permissions for the volume so that files are accessible by the specified GID. However, this doesn't change the displayed owner/group names but ensures that the process running inside the container has the necessary access.

In summary, the observed behavior is expected due to how user/group IDs are mapped and displayed between the host and containers. Unless specific group-based permissions are causing operational issues, this setup should generally not cause problems for most applications. If operational issues arise due to permission mismatches, consider aligning UIDs/GIDs or using Kubernetes security contexts to manage access controls more granularly.


Yes, you can modify the path `/opt/awx/projects` to any other path like `/var/lib/awx/projects` in your Persistent Volume (PV) definition, depending on where you want to store your AWX project files on the host machine. The path you choose must exist on the host and have the appropriate permissions set so that the Kubernetes pod can access and use it.

##### How Does HostPath Volume Work?

When you use a `hostPath` volume in Kubernetes, it mounts a file or directory from the host node's filesystem into your pod. If you put something into `/var/lib/awx/projects` on your host, it appears inside the pod because the pod's filesystem is directly mapped to that host directory. This is particularly useful for persisting data beyond the lifecycle of a pod.

##### Permission Denied Inside Pod

The "Permission Denied" issue when trying to create a directory or file inside `/var/lib/awx/projects` from within the pod can occur due to several reasons:

1. **User Permissions**: The AWX container may run as a non-root user by default for security reasons. This user may not have write permissions to the mounted directory if the directory's permissions on the host are restricted. Kubernetes allows you to specify the `runAsUser` and `fsGroup` fields in the pod's security context to control the UID and GID used inside the container, which can affect access to mounted volumes.

2. **Read-only Mounts**: If the volume is mounted as read-only, you won't be able to write to it. This is controlled by the `readOnly` field in the volume mount definition. However, for `hostPath` volumes and the use case you described, it's unlikely this is set to `true`.

##### Security and Root Access in Containers

Containers are designed to be lightweight and secure. Running processes as root inside a container is considered a security risk, which is why many container images are configured to run as a non-root user. This practice limits the potential impact of a security breach within a container.

- **Limited User**: Even if the user inside the container has a UID of 0 (which is typically associated with the root user), Kubernetes and Docker can restrict its capabilities. This means that, despite having a root-like UID, the process doesn't have full root privileges on the host system or even within the container.

- **No systemd**: Most containers don't run `systemd` or any init system; they're designed to run a single application or process in the foreground. This approach reduces the container's footprint and complexity and aligns with the container philosophy of "one process per container."

- **Gaining Root Access**: Gaining root access inside a container that doesn't provide it by default can be challenging and is generally discouraged. Containers are meant to provide a controlled environment for running applications, and modifying this environment can introduce security risks. If you need root access to perform certain operations, consider building a custom container image with the necessary tools and permissions, or adjusting the container's security context as per your cluster's security policies.

Remember, any changes to container permissions should be carefully considered and tested to avoid compromising security.

### SELinux

I found a way, it turns out that when you use `hostPath` instead of `local` type of volume, the SELinux context relabeling does not happen. Still I am not sure how (why) unprivileged process can access files labeled with different labels than the process, but anyway, this is what I needed for crons. The SELinux relabel will only happen for volumes mounted via CSI. So yes a hostpath would work. 

The behavior I've observed with hostPath volumes and SELinux context not being relabeled, and yet allowing unprivileged processes to access these volumes, is indeed intriguing and merits a closer look into how Kubernetes, Docker, and SELinux interact.

##### Kubernetes hostPath Volumes and SELinux

- **hostPath Volume Behavior**: When you use a hostPath volume in Kubernetes, it allows a pod to mount a file or directory from the host node's filesystem into the pod. This is a straightforward and direct method of exposing host files to a pod.

- **SELinux Context Relabeling**: SELinux (Security-Enhanced Linux) provides a mechanism to enforce mandatory access controls on processes and files. When files or directories are accessed or shared across different security contexts (e.g., between host and container), SELinux can enforce policies that restrict this access unless the objects are properly labeled.

- **No Automatic Relabeling with hostPath**: Typically, automatic relabeling (adjusting SELinux labels of volumes to match the SELinux context of the container process) is a feature that enhances security by ensuring that only authorized processes can access certain data. However, hostPath volumes do not automatically trigger SELinux relabeling. This is by design, as hostPath volumes are meant to provide direct access to specific areas of the host filesystem, and automatic relabeling could inadvertently alter the host system's security posture.

##### Why Does It Work?

The ability for an unprivileged process to access files with different SELinux labels through a hostPath volume, without explicit relabeling, essentially comes down to how SELinux policies are configured on your system. There are a few possibilities:

- **Permissive Mode**: If SELinux is in permissive mode on the host, it would log policy violations (such as an unprivileged container accessing host files with different SELinux contexts) but would not enforce them, allowing the operation to proceed.

- **Targeted Policies**: In targeted SELinux mode, most enforcement is focused on protecting specific services rather than the entire system. It's possible the policies applied to your Kubernetes, Docker, or container runtime processes do not strictly enforce SELinux context restrictions for hostPath volumes.

- **Explicit Policy Allowances**: There might be explicit SELinux policy allowances (booleans or rules) that permit such access under certain conditions, recognizing that certain Kubernetes operations require flexibility in accessing host resources.

##### Is It a Fault?
It's not so much a fault of SELinux as it is a reflection of the balance between security and operational flexibility. SELinux policies can be finely tuned, and Kubernetes leverages this to enable certain use cases (like yours with cron jobs needing access to specific host paths) while still providing mechanisms to enforce security boundaries. The key is ensuring that these allowances do not inadvertently open up security vulnerabilities within your environment.

##### Recommendations

- Audit SELinux Policies: Ensure that the SELinux policies applied are appropriate for your security requirements and do not inadvertently expose sensitive parts of the host filesystem to unprivileged containers.

- Use with Caution: Given the direct access hostPath provides to the host filesystem, use it sparingly and only when absolutely necessary, as it can potentially create security risks if not managed carefully.

- Consider Kubernetes Security Best Practices: Always follow Kubernetes security best practices, including using least privilege for pod access to host resources and considering alternative volume types or mechanisms (like PVCs and PVs) that provide better isolation and security.

In summary, the behavior you're seeing with hostPath and SELinux is by design, and whether it's suitable or not depends on your specific security posture and requirements. It's crucial to understand the implications and manage the associated risks appropriately.

**Question:** Do you know if and how can I disable SELinux context relabeling on volumes (local-storage) for privileged container? in Podman it is `--security-opt label:disable`, but don't know how to do the same on k8s (I am using k3s).

**Answer:** In Kubernetes, specifically when using distributions like k3s, the direct control over SELinux context relabeling at the container runtime level (similar to what you can do with Podman's `--security-opt label:disable`) is not exposed through standard Kubernetes Pod specifications. This is because Kubernetes abstracts much of the container runtime specifics to ensure portability and consistency across different environments and container runtimes however, there are a couple of approaches you might consider to achieve a similar effect within a Kubernetes (or k3s) environment, especially when dealing with local storage and privileged containers.

1. Using Security Context in Pod Specifications
While Kubernetes does not directly offer an option to disable SELinux context relabeling for volumes, you can specify certain security contexts at the pod or container level. For a privileged container, your pod specification might include a securityContext that looks something like this:

```yaml
Copy code
apiVersion: v1
kind: Pod
metadata:
  name: my-privileged-pod
spec:
  containers:
  - name: my-container
    image: myimage
    securityContext:
      privileged: true
  securityContext:
    seLinuxOptions:
      type: spc_t
```

The `spc_t` SELinux type is used by super privileged containers and might provide the level of access you're looking for, although it's not the same as disabling SELinux labeling entirely. It essentially allows the container to run with almost no SELinux restrictions, but this approach requires that your system and SELinux policies support the `spc_t` type.

2. Modifying SELinux Policies on the Host

Since Kubernetes and k3s don't expose a way to disable SELinux relabeling for volumes directly, another approach is to manage SELinux policies on the host system to allow the access patterns you need without relabeling. This involves:

    - Identifying the SELinux contexts used by your k3s containers and the local storage volumes.
    - Creating custom SELinux policies that allow the required access between these contexts.

This approach requires a good understanding of SELinux policy management and might involve tools like audit2allow to generate custom policy modules based on audit logs of denied operations.

3. Utilizing hostPath Carefully

As I've noticed with hostPath, it doesn't perform SELinux relabeling, which might serve your needs in certain cases. However, using hostPath requires careful consideration due to the security implications of exposing host filesystems to pods.

##### Limitations and Considerations

- **Security Implications**: Running containers in privileged mode and altering SELinux policies can have significant security implications. It's essential to understand the risks and apply such configurations only when absolutely necessary, following the principle of least privilege.

- **Compatibility and Support**: Any modifications to SELinux policies or Kubernetes security contexts should be tested thoroughly to ensure they don't inadvertently break other aspects of your cluster's operation or security.

##### Conclusion

While Kubernetes doesn't offer a direct equivalent to Podman's --security-opt label:disable, through careful management of pod security contexts and SELinux policies on the host, you can achieve similar outcomes. Always balance the operational requirements with security best practices to maintain the integrity and security of your cluster.

**Question:**  How exactly hostPath is technically different under the hood from local storage volume and also how it differs in in SELinux context we talked previously?

**Answer:** The differences between hostPath volumes and local storage volumes in Kubernetes, especially in the context of SELinux, involve both their intended use cases and how they interact with the underlying system's security policies. Here's a deeper dive into the technical distinctions:

##### hostPath Volumes

- **Direct Access**: hostPath volumes provide direct access to the filesystem of the node on which the pod is running. When you specify a hostPath volume, you're essentially telling Kubernetes to mount a specific file or directory from the host into the pod. This bypasses the more managed and abstracted storage provisioning processes of Kubernetes.

- **SELinux Context**: When using hostPath, the SELinux context of the files or directories being accessed is determined by their existing labels on the host filesystem. Kubernetes does not perform any automatic SELinux relabeling of hostPath volumes. This means the pod must have the appropriate SELinux context to interact with the data as it exists on the host, or the operation must be permitted by the current SELinux policy. This behavior can lead to access denials if the pod's SELinux context doesn't allow for interaction with the hostPath's SELinux context.

##### Local Storage Volumes

- **Dynamic Provisioning**: Local Persistent Volumes (LPVs) are intended to provide a more durable and portable way to use local storage in Kubernetes. Unlike hostPath, which directly specifies a path on the host, local volumes are provisioned and managed through the Persistent Volume (PV) and Persistent Volume Claim (PVC) mechanisms. This allows for dynamic provisioning and more fine-grained control over storage properties, including capacity, access modes, and, to some extent, security settings.

- **SELinux Context Relabeling**: For dynamically provisioned volumes, including those provisioned as local storage through PVs, Kubernetes supports automatic SELinux relabeling based on the pod's SELinux context. This relabeling ensures that the mounted volume is accessible to the pod under SELinux enforcement, aligning the volume's SELinux label with the pod's security requirements. This automatic relabeling is part of Kubernetes' approach to handling volume security in a dynamic, multi-tenant environment.

##### Key Differences in Context of SELinux

- **Automatic Relabeling**: The most significant difference under the hood, in the context of SELinux, is that hostPath volumes do not undergo automatic SELinux context relabeling, while local storage volumes provisioned through the PV/PVC mechanism can be automatically relabeled to match the pod's SELinux context. This distinction is crucial for security and access control in SELinux-enforced environments.

- **Use Case and Flexibility vs. Security**: hostPath is more flexible but less secure, as it allows pods to directly access and potentially modify host filesystems without the mediation of Kubernetes' storage abstractions. Local storage volumes, meanwhile, are designed to integrate with Kubernetes' storage and security models, providing a balance between utilizing local storage and maintaining security and portability.

##### Conclusion
The choice between hostPath and local storage volumes in Kubernetes should be informed by the specific requirements of your application and the security posture of your environment. hostPath offers direct, unmediated access to host filesystems, suitable for specific cases where such access is absolutely necessary. In contrast, local storage volumes provide a more managed, secure way to utilize local disk resources, aligning with Kubernetes' dynamic provisioning and access control mechanisms, including SELinux policy enforcement and relabeling.

Yes, your understanding is correct. The conversation about `hostPath` volumes, SELinux context, and their interaction is indeed crucial, especially in environments where SELinux is enabled and enforcing. Let me summarize and expand on how this applies to your scenario with AWX running on Kubernetes, and the broader implications of using `hostPath` for volumes in such contexts.

### SELinux and Kubernetes Volumes:

- **SELinux Contexts**: SELinux uses contexts to enforce security policies on files and processes. The context of a process determines its permissions for interacting with files or other processes. In a Kubernetes environment, these contexts also apply to containers and the volumes they access.

- **hostPath Volumes**: When you use a `hostPath` volume in Kubernetes, the volume is mounted into the pod directly from the host's filesystem without changing its SELinux context. This means that for the pod to access the `hostPath` volume, the SELinux policy must allow the container's SELinux context to interact with the host's filesystem context where the `hostPath` points.

### Interaction with SELinux:

- **Direct Access with hostPath**: The direct access provided by `hostPath` can be a double-edged sword. It's beneficial for use cases where specific files or directories on the host need to be available to a pod. However, this can introduce security risks if not carefully managed, especially in SELinux-enforced environments, because it bypasses the Kubernetes abstraction layer designed to manage access controls and resource allocation more securely.

- **Why Access Works in Some Cases**: In environments where SELinux is set to permissive mode or where policies are configured to allow the specific access patterns required by your Kubernetes pods, you might not run into access denials. This flexible access is not a fault of SELinux but rather an indication of SELinux policies being correctly configured to allow the necessary interactions between your pods and the host system.

- **Permission Denied Issue**: The "Permission Denied" issue arises when the SELinux context of the directory or file on the host does not permit access by the SELinux context under which the container runs. Even if the container runs as a user with UID 0 (root), SELinux policies can still restrict access based on contexts.

### Security Considerations and Best Practices:

- **Minimizing Risk**: To minimize security risks, it's recommended to use Kubernetes-managed volumes (like PVCs) that are designed to work seamlessly with Kubernetes' security model, including support for automatic SELinux context relabeling when needed.

- **SELinux Policies**: If `hostPath` must be used, ensure that SELinux policies on the host are carefully crafted to allow only the necessary access by Kubernetes pods, without opening up broader permissions that could be exploited.

- **Container Security**: The fact that containers run with limited permissions and without a full init system like systemd is part of the container security model. Containers are meant to be lightweight and run a single application or process in a secure and isolated manner. Gaining root access within a container or running systemd inside a container goes against these security practices and is generally discouraged.

In summary, when working in environments with SELinux enabled, understanding the interaction between SELinux contexts and Kubernetes volumes is crucial for maintaining security while ensuring the necessary access for your applications. Configuring SELinux policies and Kubernetes security contexts correctly can help achieve the desired functionality without compromising on security.

### Summarize:

Let's summarize the problem.

1. **Issue with AWX projects directory**: I noticed that creating a project inside AWX was not possible because the project directory did not exist in the AWX web pod. To work around this, I considered manually creating the project directory by accessing the pod via `kubectl exec`.

2. **Persistent solution with Persistent Volumes (PVs) and Persistent Volume Claims (PVCs)**: Recognizing that manual changes would be lost if the pod were deleted, I explored a more durable solution involving modifying an existing ansible playbook. This solution entailed creating PV and PVC resources to ensure that the AWX project directory persists across pod restarts and deletions.

3. **Ansible playbook modifications**: I aimed to add tasks to the ansible playbook to create PV and PVC resources. Additionally, I wanted to modify the `awx.yaml` file within the playbook to include `projects_persistence: true` and `projects_existing_claim: awx-projects-claim`, ensuring AWX uses the PVC for project storage.

4. **SELinux and `hostPath` volumes**: The discussion also touched upon how `hostPath` volumes work with SELinux, emphasizing the importance of SELinux contexts and permissions when using `hostPath` volumes in Kubernetes. It was noted that `hostPath` volumes do not automatically trigger SELinux context relabeling, which could lead to permission issues unless the SELinux policies are appropriately configured.

5. **Final ansible playbook solution**: I shared a final version of my ansible playbook designed to install and remove AWX and its associated resources from Kubernetes. This AWX remove playbook includes steps to delete specific deployments, service accounts, role bindings, roles, and scale down deployments before removing PVCs, PVs, and ultimately the namespace. The playbook employs `ignore_errors: yes` to ensure the playbook execution continues even if some resources are already deleted or not found.

7. **Summary**: The discussion provided insights into managing Kubernetes resources through ansible, especially for maintaining persistent storage with AWX deployments and handling Kubernetes resources in a way that respects SELinux policies. The final playbook shared by you offers a comprehensive approach to cleanly removing AWX and its resources from a Kubernetes cluster, emphasizing meticulous resource management and cleanup practices.

Sources:
* [AWX](https://github.com/ansible/awx)
* [AWX Operator](https://github.com/ansible/awx-operator)
* [AWX Operator installation documentation](https://ansible.readthedocs.io/projects/awx-operator/en/latest/installation/basic-install.html)
* [Kustomize binary](https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/)
* [AWX releases and tags](https://github.com/ansible/awx-operator/releases)
