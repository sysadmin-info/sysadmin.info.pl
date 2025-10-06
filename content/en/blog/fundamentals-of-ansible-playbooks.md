---
title: Fundamentals of Ansible playbooks
date: 2024-09-30T10:00:00+00:00
description: Fundamentals of Ansible playbooks
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
    image: images/2024-thumbs/ansible13.webp
---

### Introduction

Ansible playbooks are written in YAML, a simple and readable format. You don’t need to know programming or coding to start using Ansible. However, there are a few structural rules that you need to follow, and I will explain them step by step.

---

## 1. YAML Basics and Indentation

Ansible uses YAML syntax for writing playbooks, and YAML is highly dependent on indentation. In YAML, indentation organizes the hierarchy of your tasks or variables, which means you cannot use tabs—only spaces. The most common indentation rule is 2 spaces per level (or sometimes 4 spaces, but consistency is key).

Example: of Indentation

```yaml
tasks:              # This is the top-level key
  - name: Install package  # This is indented by 2 spaces
    apt:                   # Another 2 spaces for hierarchy
      name: nginx
```

Here:

- `tasks:` is at the top level.
- Each task (defined by a hyphen, `-`) is indented 2 spaces under `tasks`.
- The module name (e.g., `apt:`) is indented 2 more spaces under the task name.

### Common Pitfall

If you mix tabs and spaces or miss an indentation, Ansible will throw an error. YAML expects uniform indentation to understand the structure.

---

## 2. Key Characters in Ansible Playbooks

### 2.1 Hyphens (`-`)

- Hyphens are used to create lists in YAML. For example, in Ansible, the tasks list is defined with hyphens.
- Each task or item in a list is preceded by a hyphen.

Example:

```yaml
tasks:
  - name: Install nginx
    apt:
      name: nginx
  - name: Start nginx
    service:
      name: nginx
      state: started
```

In this example, the list contains two tasks, both starting with a hyphen.

### 2.2 Colons (`:`)

- Colons are used to separate keys from values.
- Keys in YAML are like variable names or field names.
- Values are the data or information associated with the key.

Example:

```yaml
name: nginx
state: started
```

Here:

- `name` is a key, and `nginx` is its value.
- `state` is a key, and `started` is its value.

### 2.3 Variables and Curly Brackets (`{{ }}`)

Ansible playbooks support variables to avoid hardcoding values. You use curly brackets (`{{ }}`) to reference variables within a playbook.

Example: of Variables

```yaml
vars:
  package_name: nginx

tasks:
  - name: Install a package
    apt:
      name: "{{ package_name }}"
```

In this case:

- The variable `package_name` is defined under `vars:`.
- In the task, we reference this variable using `{{ package_name }}`. So when the playbook runs, it will install nginx.

---

## 3. Variables and Loops

### 3.1 Variables in Detail

Variables allow you to reuse values and keep your playbooks dynamic. For example, if you want to install multiple packages, you can define them as variables rather than repeating the values multiple times.

Example:

```yaml
vars:
  packages:
    - nginx
    - curl
    - git

tasks:
  - name: Install multiple packages
    apt:
      name: "{{ item }}"
    loop: "{{ packages }}"
```

Here:

- `vars:` contains a list of `packages` (nginx, curl, and git).
- The task uses a loop with `{{ item }}` to install each package from the list one by one.

### 3.2 Loops in Detail

Loops in Ansible allow you to repeat the same task multiple times with different inputs. In the example above, `loop: "{{ packages }}"` tells Ansible to run the task for each package in the list.

---

## 4. A Simple Playbook Example

Let’s build a complete example of a basic playbook that installs packages and ensures a service is running.

Example:

```yaml
---
- hosts: all          # Defines that this playbook runs on all hosts
  become: yes         # Runs the tasks with root privileges (sudo)

  vars:
    package_name: nginx

  tasks:
    - name: Install nginx
      apt:
        name: "{{ package_name }}"
        state: present  # Ensures nginx is installed

    - name: Ensure nginx is running
      service:
        name: nginx
        state: started  # Starts the nginx service if it is not running
```

### Explanation

- `hosts: all` specifies that this playbook will run on all target hosts.
- `become: yes` makes sure that the playbook runs with elevated privileges (e.g., using `sudo`).
- The `vars:` section defines a variable `package_name` set to `nginx`.
- The first task installs nginx.
- The second task ensures that nginx is running.

---

## 5. Common Pitfalls and Debugging

When starting with YAML and Ansible, there are a few common mistakes you should look out for:

### Indentation Errors

YAML requires proper indentation. A simple misalignment can cause errors.

Example: of Bad Indentation

```yaml
tasks:
   - name: Install nginx  # 3 spaces instead of 2 (should be consistent)
      apt:
        name: nginx
```

### Missing Colons

Forgetting colons between keys and values can break the playbook.

Example:

```yaml
name nginx   # This is wrong. It should be `name: nginx`
```

### Undefined Variables

If you use a variable without defining it, you’ll get an error. Always check your `vars:` section for any missing variables.

---

## Conclusion

In this tutorial, we’ve covered the basic structure of an Ansible playbook, including indentations, variables, loops, and common syntax like hyphens and colons. By following these rules, you’ll be able to write readable, functional playbooks.

Key Points:

- Always maintain consistent indentation.
- Use variables to keep your playbooks flexible.
- Loops allow you to apply tasks to multiple items.
- Be mindful of common pitfalls like indentation errors and missing colons.

Feel free to experiment and build your own playbooks! Ansible is a powerful tool once you get comfortable with its structure.

#### Walkthrough video

{{<youtube mf-cpMnOBPQ>}}
