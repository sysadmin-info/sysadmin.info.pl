---
title: Disabling the cups-browsed service on multiple systems using Ansible
date: 2024-09-28T21:00:00+00:00
description: Disabling the cups-browsed service on multiple systems using Ansible
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
    image: images/2024-thumbs/disabling_the_cups-browsed_service.webp
---

The critical vulnerability that was supposed to affect the entire Linux system turned out to be an issue with the CUPS (cups-browsed) printing system. While remote code execution (RCE) without authentication is possible, the flaw only affects systems with the `cups-browsed` service enabled, which is not common. The vulnerability was [published early](https://www.evilsocket.net/2024/09/26/Attacking-UNIX-systems-via-CUPS-Part-I/) by security researcher Simone Margaritelli (also known as @[evilsocket](https://x.com/evilsocket)), who emphasized that it requires specific conditions, such as initiating printing on a spoofed printer.

Although the vulnerability was rated CVSS 9.9/10, in practice, its impact may be less severe than initially suggested. Other potential issues, such as buffer overflows and DoS, were also reported but without detailed proof-of-concept (PoC).

Currently there is a [PoC](https://gist.github.com/stong/c8847ef27910ae344a7b5408d9840ee1)

In summary, despite alarmist reports, this vulnerability does not affect the entire Linux system. However, it is recommended to disable `cups-browsed` and block port 631 for UDP and DNS-SD traffic if the service is not required.

### Step 1: Preliminary Information

The vulnerability discussed in the Sekurak article pertains to the CUPS printing system. To prevent potential issues, this tutorial will configure an Ansible playbook that checks if the `cups-browsed` service is running on remote machines and disables it.

### Step 2: Ansible Environment Configuration

#### `hosts` File

First, we need to configure the `hosts` file that contains the list of machines we will be working with:

```ini
all:
  children:
    rhel:
      hosts:
        rhel1:
          ansible_host: 10.10.0.10
          ansible_user: ansible
        rhel2:
          ansible_host: 10.10.0.11
          ansible_user: ansible
```

This file contains the groups and hosts that we will manage. It’s important to ensure that you have an Ansible user set up on each remote machine and SSH access to them.

### Step 3: Ansible Playbook

The Ansible playbook contains the steps needed to disable the `cups-browsed` service. The playbook first checks the Python version (to dynamically select the appropriate interpreter) and then checks if the machine is using `systemd` to select the appropriate commands.

Here’s the `cups_browsed_check.yml` playbook:

```yaml
---
- name: Check and stop/disable cups-browsed service on multiple systems
  hosts: all
  remote_user: ansible 
  become: yes
  become_method: sudo
  gather_facts: no  # Disable fact gathering to avoid SCP/SFTP
  vars:
    ansible_python_interpreter: "{{ '/usr/bin/python3' if 'Python 3' in python_version_check.stdout else '/usr/bin/python' }}"
  tasks:

    # Step 0: Check Python version on the remote host
    - name: Check Python version
      raw: "python --version || python3 --version"
      register: python_version_check
      changed_when: false
      failed_when: false

    - name: Set Python binary based on version check
      set_fact:
        ansible_python_interpreter: "{{ '/usr/bin/python3' if 'Python 3' in python_version_check.stdout else '/usr/bin/python' }}"

    # Step 1: Check if systemctl is available (for systemd systems)
    - name: Check if systemctl is available (neutral Python)
      raw: "which systemctl"
      register: systemctl_check
      changed_when: False
      ignore_errors: yes

    # Step 2: Check if cups-browsed service exists (systemd systems)
    - name: Check if cups-browsed service exists (systemd)
      command: systemctl cat cups-browsed
      register: cups_browsed_exists
      changed_when: False
      failed_when: cups_browsed_exists.rc not in [0, 1]
      when: systemctl_check.rc == 0
      ignore_errors: yes

    # Step 3: Check if cups-browsed service exists (non-systemd systems)
    - name: Check if cups-browsed service exists (non-systemd)
      command: service cups-browsed status
      register: cups_browsed_exists_service
      changed_when: False
      failed_when: cups_browsed_exists_service.rc not in [0, 1]
      when: systemctl_check.rc != 0
      ignore_errors: yes

    # Step 4: Stop cups-browsed service (systemd systems)
    - name: Stop cups-browsed service (systemd)
      systemd:
        name: cups-browsed
        state: stopped
      when: cups_browsed_exists is defined and cups_browsed_exists.rc is defined and cups_browsed_exists.rc == 0

    # Step 5: Disable cups-browsed service (systemd systems)
    - name: Disable cups-browsed service (systemd)
      systemd:
        name: cups-browsed
        enabled: no
      when: cups_browsed_exists is defined and cups_browsed_exists.rc is defined and cups_browsed_exists.rc == 0

    # Step 6: Stop cups-browsed service (non-systemd systems)
    - name: Stop cups-browsed service (non-systemd)
      service:
        name: cups-browsed
        state: stopped
      when: cups_browsed_exists_service is defined and cups_browsed_exists_service.rc is defined and cups_browsed_exists_service.rc == 0

    # Step 7: Disable cups-browsed service (non-systemd systems)
    - name: Disable cups-browsed service (non-systemd)
      service:
        name: cups-browsed
        enabled: no
      when: cups_browsed_exists_service is defined and cups_browsed_exists_service.rc is defined and cups_browsed_exists_service.rc == 0

    # Step 8: Display service status for verification
    - name: Display cups-browsed service status in JSON format
      debug:
        msg: |
          {
            "Machine": "{{ inventory_hostname }}",
            "Python binary": "{{ ansible_python_interpreter }}",
            "Systemd used": "{{ 'Yes' if systemctl_check.rc == 0 else 'No' }}",
            "Cups-browsed service exists": "{{ 'Yes' if (systemctl_check.rc == 0 and cups_browsed_exists is defined and cups_browsed_exists.rc == 0) else 'No' }}",
            "Cups-browsed service stopped and disabled": "{{ 'Stopped and Disabled' if (systemctl_check.rc == 0 and cups_browsed_exists is defined and cups_browsed_exists.rc == 0) else 'Not applicable' }}"
          }
```

### Step 4: Running the Playbook

To run this playbook, use the following command:

```bash
ansible-playbook -i /path/to/hosts/file cups_browsed_check.yml -l all > output.log 2>&1
```

### Step 5: Analyzing Results

After running the playbook, the status of the `cups-browsed` service on each machine will be displayed, along with whether it was disabled. Detailed results of the operation can be further filtered using the following command:

```bash
sed -n '/TASK \[Display cups-browsed service status in JSON format\]/,/PLAY RECAP/Ip' output.log > filtered_output.log
```

### AWX

You can also add the playbook to a GitLab repository that’s connected to AWX. In AWX, you can configure a **Smart Inventory**, where simply placing a dot (`.`) in the **Search Filter** will include all available inventories from AWX. This way, all machines can be scanned using the template that needs to be created in AWX to run this playbook.

### Summary

This tutorial shows how to automate the management of the `cups-browsed` service on multiple machines using Ansible. The playbook dynamically handles different Python versions and different init systems like systemd and sysvinit.

It’s worth noting that running the playbook on 15 machines via CLI takes under a minute, while in AWX it takes over 5 minutes.

If you need more information about AWX and GitLab integration, check my previous tutorials.

#### Walkthrough video

{{<youtube 3EAzZHHnlqk>}}
