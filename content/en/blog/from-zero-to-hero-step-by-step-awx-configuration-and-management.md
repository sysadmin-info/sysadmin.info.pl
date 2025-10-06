---
title: From Zero to Hero - Step-by-Step AWX Configuration and Management
date: 2024-02-29T10:00:00+00:00
description: Starting work with AWX, the open-source version of Ansible Tower, requires several steps to configure and launch your first job. Here is a detailed step-by-step guide to help you achieve your goal.
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
    image: images/2024-thumbs/ansible10.webp
---

### From Zero to Hero: Step-by-Step AWX Configuration and Management

**In this video, I explain how to configure the AWX.**

{{<youtube DR8jYqejPJw>}}

Starting work with AWX, the open-source version of Ansible Tower, requires several steps to configure and launch your first job. Here is a detailed step-by-step guide to help you achieve your goal:

##### Step 1: AWX Installation

Assuming AWX is already installed on your system. If not, it's best to follow the official AWX documentation for the most up-to-date installation instructions.
But you can also check my tutorial: [How to install AWX using Ansible playbook](/en/blog/how-to-install-awx-using-ansible-playbook)

### Step 2: AWX Configuration

After installing AWX, you need to configure it for use. Here are the basic steps:

1. **Log into AWX**: Use a browser to navigate to the AWX user interface and log in using the default login credentials (usually `admin`/`password`, unless changed during installation).

2. **Create an organization**: In AWX, everything, including users, teams, and projects, is organized within organizations. 
    - Go to the “Organizations” tab and create a new organization by clicking “Add”.

3. **Adding users and teams**: Within the organization, you can add users and create teams.
    - Use the “Users” and “Teams” tabs in the organization menu to add new users and teams as needed.

### Step 3: Ansible Project Configuration in AWX

1. **Creating a new project**:
    - Go to the “Projects” tab and click “Add”.
    - Name your project and select the “SCM Type” as “Manual”.
    - Click “Save”.

2. **Wait for the project to synchronize**: AWX will automatically synchronize the project with the Git repository. You can monitor the progress in the “Projects” tab.

### Step 4: Adding Inventory

1. **Creating a new inventory**:
    - Navigate to the “Inventories” tab and click “Add”.
    - Name your inventory and define it as needed.
    - In the inventory, you can add groups and hosts that will be the target of your Ansible playbooks.

### Step 5: Creating a Job Template

1. **Creating a job template**:
    - Navigate to the “Templates” tab and click “Add” → “Job Template”.
    - Name the template, select the project you created earlier, and the playbook you want to run.
    - Select the inventory you will use.
    - In the “Credentials” section, add the credentials necessary to connect to your servers (e.g., SSH keys).
    - Save the template.

### Step 6: Running the Job Template

1. **Launching the job**:
    - Find your Job Template on the list and click the “Launch” button next to it to start the job.
    - You can follow the execution of the job in real-time.

### Additional Tips

- **Automation**: Consider using AWX features to automate job launches, e.g., through schedules or webhooks.
- **Documentation and Help**: The official AWX documentation is an excellent source of knowledge about advanced features and troubleshooting.


To update systems using different package managers like `apt`, with Ansible, you can write a playbook that detects the operating system (or its family) and applies the appropriate update command. Below is an example playbook that accomplishes this task.

```yaml
---
- name: Update all systems and restart if needed only if updates are available
  hosts: all
  become: yes
  tasks:
    # Preliminary checks for available updates
    - name: Check for available updates (apt)
      apt:
        update_cache: yes
        upgrade: 'no' # Just check for updates without installing
        cache_valid_time: 3600 # Avoid unnecessary cache updates
      register: apt_updates
      changed_when: apt_updates.changed
      when: ansible_facts['os_family'] == "Debian"

    # Update systems based on the checks
    # Debian-based systems update and restart
    - name: Update apt systems if updates are available
      ansible.builtin.apt:
        update_cache: yes
        upgrade: dist
      when: ansible_facts['os_family'] == "Debian" and apt_updates.changed

    - name: Check if restart is needed on Debian based systems
      stat:
        path: /var/run/reboot-required
      register: reboot_required_file
      when: ansible_facts['os_family'] == "Debian" and apt_updates.changed

    - name: Restart Debian based system if required
      ansible.builtin.reboot:
      when: ansible_facts['os_family'] == "Debian" and apt_updates.changed and reboot_required_file.stat.exists
```

### Explanation:

- **hosts: all**: Specifies that the playbook will be run on all hosts defined in your inventory.
- **become: yes**: Elevates privileges to root (similar to sudo), which is required for package management.
- **tasks**: The section of tasks, where each task updates systems with different package managers depending on the operating system family.
- **when**: A condition that checks the type of operating system of the host to execute the appropriate update command.
- **ansible.builtin.\<module\>**: The Ansible module responsible for managing packages on different operating systems.
- **stat module**: Used to check for the presence of the `/var/run/reboot-required` file in Debian-based systems, which is created when an update requires a restart.
- **reboot module**: Triggers a system restart if needed. You can customize this module by adding parameters such as `msg` for the restart message, `pre_reboot_delay` for a delay before restarting, etc.
- **register**: Stores the result of the command or check in a variable that can later be used in conditions (`when`).

### Notes:

- **update_cache**: For package managers that require it (`apt`), this option refreshes the local package cache before attempting to update.
- **upgrade: no**: This ensures that the check does not actually update any packages.
- **cache_valid_time**: This prevents the task from updating the cache if it was updated recently (3600 seconds in this example).
- **changed_when**: This custom condition is used to determine if updates are actually available. For `apt`, it checks the command output.
- **upgrade**: For `apt`, the `dist` option means a full distribution upgrade.

### Customization:

You can customize this playbook by adding additional tasks or modifying existing ones to meet the specific requirements of your environment, such as adding a system restart after updates or filtering updates for certain packages.

### Important Notes:

- It's recommended to test this playbook in a controlled environment before running it in production, especially the sections responsible for system restarts, to ensure all tasks perform as expected and do not cause unintended service interruptions.

These preliminary tasks ensure that the system updates and potential restarts are only performed when there are new package updates available, saving time and reducing unnecessary changes in your managed environments.