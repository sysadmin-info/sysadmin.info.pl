---
title: How to add ansible user to sudoers on remote servers using Bash script
date: 2023-11-11T18:00:00+00:00
description: How to add ansible user to sudoers on remote servers using Bash script
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
    image: images/2023-thumbs/ansible02.webp
---

1. **Here is a video tutorial**

{{<youtube ApKyy86wLvw>}}

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

2. Install sudo on remote hosts

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install sudo
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```bash
  sudo apt install sudo 
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```bash
  sudo dnf install sudo
  ```
  {{< /tab >}}
{{< /tabs >}}

3. Type the below command:

```bash
visudo
```

4. Change %sudo or %wheel to %admins

5. Add the below line:

```vim
%admins  ALL=(ALL) NOPASSWD: ALL
```

Save and exit

6. Add admins group

```bash
groupadd admins
```

7. Create a file on a master server where you will install ansible in the future

```bash
vim pass_file
```

and place a password for the user that is currently able to connect to remote hosts.

8. Make the script read only for this user

```bash
chmod 400 pass_file
``` 

9. Create a list of servers with IP addresses or hostnames

```bash
vim servers
```

10. Create a script

```bash
vim  ansible-sudo.sh
```

And add the below content

```vim
#!/bin/bash
servers=$(cat servers)
echo -n "Enter the username: "
read userName
clear
for i in $servers; do
  sshpass -f pass_file ssh -q -t $USER@$i "hostname; sudo usermod -aG admins $userName"
done
echo
read -n1 -s -p "Checking? (y)es or (n)o " ans
echo
if [ $ans == 'y' ] ;then
  for i in $servers; do
    sshpass -f pass_file ssh -q -t $USER@$i "hostname; id $userName"
  done
fi
```

11. Make sure that PasswordAuthentication has set boolean value to yes in /etc/ssh/sshd_config file on remote servers

12. Make the script executable

```bash
chmod +x ansible-sudo.sh
```

13. Execute the script

```bash
./ansible-sudo.sh
```

14. Provide username: ansible

15. See the result. User ansible should be added to group admins.
