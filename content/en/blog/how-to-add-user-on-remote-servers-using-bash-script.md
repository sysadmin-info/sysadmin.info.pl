---
title: How to add user on remote servers using Bash script
date: 2023-11-11T17:00:00+00:00
description: How to add user on remote servers using Bash script
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
    image: images/2023-thumbs/ansible01.webp
---

1. **Here is a video tutorial**

{{<youtube BeBn8_LLPuY>}}

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
vim pass_file
```

and place a password for the user that is currently able to connect to remote hosts.

3. Make the script read only for this user

```bash
chmod 400 pass_file
``` 

4. Create a list of servers with IP addresses or hostnames

```bash
vim servers
```

5. Create a script

```bash
vim  adduser.sh
```

And add the below content

```vim
#!/bin/bash
servers=$(cat servers)
echo -n "Enter the username: "
read userName
echo -n "Enter the user uid: "
read userUID
echo -n "Enter the password: "
read -s passwd
clear
for i in $servers; do
  sshpass -f pass_file ssh -q -t $USER@$i "hostname; sudo useradd -m -u $userUID $userName -d /home/$userName -s /bin/bash && echo '$userName:$passwd' | sudo chpasswd"
  if [ $? -eq 0 ]; then
    echo "User '$userName' added on '$i'" || echo "User '$userName' already exists on '$i'"
  else
    echo "Error on $i"
  fi
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

6. Make sure that PasswordAuthentication has set boolean value to yes in /etc/ssh/sshd_config file on remote servers

7. Make the script executable

```bash
chmod +x adduser.sh
```

8. Execute the script

```bash
./adduser.sh
```

9. Provide username: ansible, UID and password.