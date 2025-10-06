---
title: Ansible SSH prompt known_hosts issue explained and solved
date: 2023-11-19T12:00:00+00:00
description: Ansible SSH prompt known_hosts issue explained and solved
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
    image: images/2023-thumbs/ansible05.webp
---

Article about known_hosts: [What is known_hosts File in Linux](/en/blog/known-hosts-file)

1. **Here is a video tutorial**

{{<youtube Jw3x2-bynpo>}}

Scripts and configuration files are available [here:](https://github.com/sysadmin-info/ansible)

##### Working recommended solution, but only in the environment that is not compromised.

1. Cleanup known_hosts in /home/user/.ssh directory
2. Run the ansible playbook with the below command:
```bash
ansible-playbook ssh-session.yaml
```
3. Break it with ctrl+c
4. Run the below command:
```bash
./ssh-session.ssh
```
5. Check the result in known_hosts
```bash
cat ~/.ssh/known_hosts
```
6. You will see all the entries added by ssh.
7. Run the ansible playbook with the below command one more time:
```bash
ansible-playbook ssh-session.yaml
```
8. Type yes few times and then break it with ctrl+c
9. Check the result in the screen.
10. Cleanup known_hosts in /home/user/.ssh directory and then run the ansible playbook with the below command:
```bash
ansible-playbook ssh-session.yaml --ssh-common-args='-o StrictHostKeyChecking=no'
```

Problem is solved. 

##### Working solution that I do not recommend 

1. Cleanup known_hosts in /home/user/.ssh directory
2. Display global variables with the below command:
```bash
export
```
3. Perform the below command:
```bash
export ANSIBLE_HOST_KEY_CHECKING=False
```
4. Connect using ssh to the remote host
```bash
ssh username@hostname
```
5. Run the ansible playbook with the below command:
```bash
ansible-playbook ssh-session.yaml
```
6. Check the result in known_hosts
```bash
cat ~/.ssh/known_hosts
```
7. See do you have entries added into known_hosts

##### Solution that I have found in the Internet that I really do not recommend

1. Run the ansible playbook with the below command:
```bash
ansible-playbook ssh-keyscan.yaml
```
2. Check the result in known_hosts
```bash
cat ~/.ssh/known_hosts
```
3. Get rid of unecessary entries in known_hosts
4. Run the ansible playbook with the below command:
```bash
ansible-playbook ssh-session.yaml
```
5. Watch the mentioned video to understand what happened and why.