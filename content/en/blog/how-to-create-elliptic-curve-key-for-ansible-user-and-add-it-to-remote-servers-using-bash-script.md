---
title: How to create elliptic-curve key for ansible user and add it to remote servers
  using Bash script
date: 2023-11-11T19:00:00+00:00
description: How to create elliptic-curve key for ansible user and add it to remote
  servers using Bash script
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
    image: images/2023-thumbs/ansible03.webp
---

1. **Here is a video tutorial**

{{<youtube wS2MJ_ooI1k>}}

Scripts and configuration files are available [here:](https://github.com/sysadmin-info/ansible)

1. Install sshpass

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install sshpass 
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```bash
  sudo apt install sshpass 
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```bash
  sudo dnf install sshpass 
  ```
  {{< /tab >}}
{{< /tabs >}}


2. Create a file 

```bash
vim pass_file_ansible
```

and place a password for the ansible user to connect to remote hosts.

3. Make the script read only for this user

```bash
chmod 400 pass_file_ansible
``` 

4. Create a list of servers with IP addresses or hostnames

```bash
vim servers
```

5. Create a script

```bash
vim  ssh-copy-id.sh
```

And add the below content

```vim
#!/bin/bash
ssh-keygen -t ed25519 -C "ansible@rancher.local"
servers=$(cat servers)
for i in $servers; do
  sshpass -f pass_file_ansible ssh-copy-id -i ~/.ssh/id_ed25519.pub ansible@$i
done
```

6. Make sure that PasswordAuthentication has set boolean value to yes in /etc/ssh/sshd_config file on remote servers.

7. Make the script executable

```bash
chmod +x ssh-copy-id.sh 
```

8. Execute the script

```bash
./ssh-copy-id.sh 
```