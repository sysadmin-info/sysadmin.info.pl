---
title: "SSH server"
date:  2023-04-01T15:00:00+00:00
description: "Configure SSH Server to login to a server from remote computer."
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: admin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- P-TECH
series:
-
categories:
- 
image: images/2023-thumbs/ssh.webp
---
#### Exercises to complete:
1. generate an RSA key pair using ssh-keygen
2. export the public key from the client to the server using ssh-copy-id
3. log in with the password via ssh to the server and switch to the root account using the sudo - su or sudo -i command
4. enable key login and disable password login. Save the changes and restart the ssh service.
5. do not close the current session. Open a new ssh session and log in to the server with your private key. 
6. if you have successfully logged in, secure the server using the information below and then restart the ssh service on the second session.
7. remember to keep the first ssh session open all the time so you can undo changes if necessary.
8. restart the ssh service and check if you can log in with the third session to the server. If so, you have successfully configured the ssh server correctly.
9. if you are willing, write a script using sed or awk to make server-side changes to the sshd_config file so that you don't have to manually apply the changes.

<script async id="asciicast-574590" src="https://asciinema.org/a/574590.js"></script>

#### OpenSSH : KeyBoard-Intereractive Auth

OpenSSH is already installed by default, so it's not necessarry to install new packages. You can login with KeyBoard-Intereractive Authentication by default, but change some settings for security like follows.

If OpenSSH, however, is not yet installed you can install it with the following command:

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  To install OpenSSH type:
  ```
  # refresh repositories
  sudo zypper ref
  # install OpenSSH
  sudo zypper -n in openssh
  # enable OpenSSH on boot
  sudo systemctl enable sshd
  # start openSSH
  sudo systemctl start sshd
  # enable firewalld rule for ssh
  sudo firewall-cmd --permanent --add-service=ssh
  success
  # Reload firewalld rules
  sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  To install OpenSSH type:
  ```
  # refresh repositories
  sudo apt update
  # install OpenSSH
  sudo apt -y install openssh-server
  # enable OpenSSH on boot
  sudo systemctl enable sshd
  # start OpenSSH
  sudo systemctl start sshd
  # enable ufw firewall rule for ssh
  sudo ufw allow 'SSH'
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  To install OpenSSH type:
  ```
  sudo yum install openssh-server -y
  lub
  sudo dnf install openssh-server -y
  # enable OpenSSH on boot
  sudo systemctl enable sshd
  # start OpenSSH
  sudo systemctl start sshd
  # enable firewalld rule for ssh
  sudo firewall-cmd --permanent --add-service=ssh
  success
  # Reload firewalld rules
  sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
{{< /tabs >}}

Then, on the Linux machine with which you intend to connect to the server, you need to install the appropriate client:

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  To install OpenSSH type:
  ```
  # refresh repositories
  sudo zypper ref
  # install OpenSSH
  sudo zypper -n in openssh-clients
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  To install OpenSSH type:
  ```
  # refresh repositories
  sudo apt update
  # install OpenSSH
  sudo apt -y install openssh-client
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  To install OpenSSH type:
  ```
  sudo yum install openssh-clients -y
  or
  sudo dnf install openssh-clients -y
  ```
  {{< /tab >}}
{{< /tabs >}}



#### Install firewalld

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  To install firewalld type:
  ```
  # refresh repositories
  sudo zypper ref
  # install firewalld
  sudo zypper -n in firewalld
  # enable firewalld on boot
  sudo systemctl enable firewalld
  # start the firewalld
  sudo systemctl start firewalld
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  To install firewalld type:
  ```
  # refresh repositories
  sudo apt update
  # install firewalld
  sudo apt -y install firewalld
  # enable firewalld on boot
  sudo systemctl enable firewalld
  # start the firewalld
  sudo systemctl start firewalld
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  To install firewalld type:
  ```
  sudo yum install firewalld -y
  or
  sudo dnf install firewalld -y
  # enable firewalld on boot
  sudo systemctl enable firewalld
  # start the firewalld
  sudo systemctl start firewalld
  ```
  {{< /tab >}}
{{< /tabs >}}

By default the firewalld after installation has SSH service implemented as allowed. If not, you can always allow SSH service.

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  linux:~ # sudo firewall-cmd --add-service=ssh --permanent
  success
  linux:~ # sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo ufw allow 'SSH'
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  linux:~ # sudo firewall-cmd --add-service=ssh --permanent
  success
  linux:~ # sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Configure SSH Client
Connect to SSH server with a common user.

```
# ssh [login_user@hostname_or_IP_address]
adrian@client:~> ssh adrian@example.com
The authenticity of host 'example.com (10.0.0.50)' can't be established.
ECDSA key fingerprint is SHA256:h0QhlXgCZ860UjM8sAjY6Wmrr2EqSIY5UADBi0wAFV4.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'example.com,10.0.0.50' (ECDSA) to the list of known hosts.
Password:          # login user's password
adrian@example.com:~>    # just logined
```

#### SSH Key-Pair Authentication

Configure SSH server to login with Key-Pair Authentication. Create a private key for client and a public key for server to do it.

Create Key-Pair for each user, so login with a common user on SSH Server Host and work like follows.

```
# create key-pair on a client
ssh-keygen -t rsa -b 4096 -C "name and surname"
Generating public/private rsa key pair.
Enter file in which to save the key (/home/adrian/.ssh/id_rsa): /home/adrian/.ssh/p-tech
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/adrian/.ssh/p-tech
Your public key has been saved in /home/adrian/.ssh/p-tech.pub
The key fingerprint is:
SHA256:IPtApVZ/8o6mCY3lKSvcfEtkD6wzHJ0LzKeHFm3qbxs adrian@G02PLXN05963
The key's randomart image is:
+---[RSA 4096]----+
|      o          |
|     + .         |
|    = . o .      |
|   = * o +       |
|    O % S .      |
|   . ^ = o       |
| . o& E + .      |
|  oooOo=         |
|   .o+*o         |
+----[SHA256]-----+
```

To generate a passphrase you can use the following command in a separate CLI window
hexdump -vn16 -e'4/4 "%08X" 1 "\n"' /dev/urandom

List the key-pair

```
adrian@linux:~> ll ~/.ssh/p-tech*
-rw------- 1 adrian adrian 3.4K Apr  1 16:44 /home/adrian/.ssh/p-tech
-rw-r--r-- 1 adrian adrian  745 Apr  1 16:44 /home/adrian/.ssh/p-tech.pub
```

Copy the public key from the client to the server
```
ssh-copy-id -i ~/.ssh/p-tech.pub student@IP-ADDRRESS
```

The public key is saved into the ~/.ssh/authorized_keys

Provide a password

```
# login with the key to the server
ssh -i ~/.ssh/p-tech student@IP-ADDRRESS
```

Provide a passphrase

#### Automation

Add below entries to .bashrc or .zshrc file located in your /home/user directory. First entry starts ssh agent and a second loads your private key to the agent. If you did set up a passphrase on your key it will ask for it. You can add more than one key. Bear in mind, that each time the Bash or Zsh starts aftyer a reboot or boot process of the operating system, in CLI it will ask you to provide a passphrase. 

```
eval $(ssh-agent -s)
ssh-add ~/.ssh/p-tech
```

#### Secure SSH

Edit /etc/ssh/sshd_config

```
sudo vi /etc/ssh/sshd_config

# Uncomment these lines and change to [no]

PasswordAuthentication no
ChallengeResponseAuthentication no

# Disable Empty Passwords
# You need to prevent remote logins from accounts with empty passwords for added security. 

PermitEmptyPasswords no

# Limit Users’ SSH Access
# To provide another layer of security, you should limit your SSH logins to only certain users 
# who need remote access. This way, you will minimize the impact of having a user with a weak password.
# Add an ‘AllowUsers’ line, followed by the list of usernames, and separate them with a space:

AllowUsers student adrian

# Disable Root Logins
# One of the most dangerous security holes you can have in your system 
# is to allow direct logging in to root through SSH. By doing so, 
# any hackers attempting brute force on your root password could 
# hypothetically access your system; and if you think about it, 
# root can do a lot more damage on a machine than a standard user can do.
# To disable logging in through SSH as root, change the line to this:

PermitRootLogin no

# Eventually you can allow root to login through SSH using a pair of keys. 
# Do this only if the server is not in the DMZ (there is no access from the Internet)

PermitRootLogin prohibit-password

# Add Protocol2
# SSH has two protocols that it can use. Protocol 1 is older and is less secure. 
# Protocol 2 is what you should be using to harden your security. 
# If you are looking for your server to become PCI compliant, then you must disable protocol 1.

Protocol 2

# Protocol
#  Specifies the protocol versions sshd(8) supports.  The possible
#  values are '1' and '2'.  Multiple versions must be comma-separated.  
#  The default is '2'.  Protocol 1 suffers from a number 
#  of cryptographic weaknesses and should not be used. 
#  It is only offered to support legacy devices.
#  Example: Protocol 2, 1

# Use Another Port
# One of the main benefits of changing the port and using a non-standard port 
# is to avoid being seen by casual scans. The vast majority of hackers 
# looking for any open SSH servers will look for port 22, since by default, 
# SSH listens for incoming connections on that port. 
# If it’s harder to scan for your SSH server, then your chances of being attacked are reduced.
# Run SSH on a non standard port above port 1024.

Port 2025

# You can choose any unused port as long as it’s not used by another service. 
# A lot of people might choose to use 222 or 2222 as their port since 
# it’s pretty easy to remember, but for that very reason, hackers scanning port 22 
# will likely also be trying ports 222 and 2222. Try and select a port number 
# that is not already used, follow this link for a list of port numbers and their known services.

# If StrictModes is set to yes, then the below permissions are required.
# sudo chmod 700 ~/.ssh
# sudo chmod 600 ~/.ssh/authorized_keys

StrictModes yes

# Configure Idle Timeout Interval

ClientAliveInterval 360
ClientAliveCountMax 1

# ClientAliveInterval - Sets a timeout interval in seconds after which if no data has been received from the client, 
# sshd will send a message through the encrypted channel to request a response from the client. The default is 0, 
# indicating that these messages will not be sent to the client. This option applies to Protocol version 2 only.

# ClientAliveCountMax - The default value is 3. If ClientAliveInterval is set to 15, and ClientAliveCountMax is left 
# at the default, unresponsive SSH clients will be disconnected after approximately 45 seconds. 
# This option applies to Protocol version 2 only.

# The timeout value is calculated by multiplying 
# ClientAliveInterval with ClientAliveCountMax.
# timeout interval = ClientAliveInterval * ClientAliveCountMax
#
# OpenSSH options ClientAliveInterval and ClientAliveCountMax 
# are not used to disconnect inactive sessions. 
# They are in fact preventing the connection from being closed, 
# even on inactive sessions, as long as the client and the network link is alive.
#
# This is an internal mechanism of ssh that send a null packet 
# inside the established tunnel, and wait for an answer from the client.
# In this case, it sends one packet every 360 seconds, and disconnect after 1 answer missed.
#
# While these options are helpful to detect and cleanup disconnected client sessions, 
# they will not kill sessions of clients who are still connected, even if inactive. 
# Unless their client doesn't answer the null packet.
```

To disconnect inactive clients, if you are using bash as shell you could set the TMOUT value in a system-wide default or per-user profile:

```
# TMOUT  If  set to a value greater than zero, 
# TMOUT is treated as the default timeout for the read builtin. 
#
# The select command terminates if input does not arrive after 
# TMOUT seconds when input is coming from a terminal. 
#
# In an interactive shell, the value is interpreted as the number 
# of seconds to wait for a line of input after issuing the primary prompt. 
#
# Bash terminates after waiting for that number of seconds 
# if a complete line of input does not arrive.

# For example, adding the following line to `/etc/.bashrc` 
# will close bash sessions of inactive user after 5 minutes, 
# but read the following warning before enabling this:

`export TMOUT=300`

# Warning: as a daily user of shells,
# I often let some terminal open while multitasking.
# I would personally find this TMOUT mechanism very annoying
# if set to a low value (even the 10 minutes). 
# I would not recommend it unless it's at least
# set to a very high value (at least 1 hour - 3600 seconds).

# My opinion is that OpenSSH options `ClientAliveInterval` and `ClientAliveCountMax` 
# (or `ServerAliveInterval` and `ServerAliveCountMax`, set on the server-side) 
# are enough to get rid of zombies/disconnected clients. 

# When using them you are already guaranteed that an active session 
# on the server does match an open terminal on a connected client. 
#
# It's the user's choice to keep their terminal open, while I understand 
# you want to close disconnected clients.
# I don't see the point of closing sessions from legitimate users.
```

#### Secure Configuration of Ciphers/MACs/Kex available in SSH

```
KexAlgorithms diffie-hellman-group14-sha256,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512,diffie-hellman-group-exchange-sha256,ecdh-sha2-nistp256,ecdh-sha2-nistp384,ecdh-sha2-nistp521,curve25519-sha256,curve25519-sha256@libssh.org
Ciphers aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-512

# Less secure but working:
KexAlgorithms curve25519-sha256@libssh.org,ecdh-sha2-nistp521,ecdh-sha2-nistp384,ecdh-sha2-nistp256,diffie-hellman-group-exchange-sha256
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,umac-128-etm@openssh.com,hmac-sha2-512,hmac-sha2-256,umac-128@openssh.com
```

Make sure your ssh client can use these ciphers, run:

```
ssh -Q cipher | sort -u
to see the list
```

I recommend to read this article:
[Secure Configuration of Ciphers/MACs/Kex available in SSH](https://security.stackexchange.com/questions/39756/secure-configuration-of-ciphers-macs-kex-available-in-ssh "Secure Configuration of Ciphers/MACs/Kex available in SSH")

Restart SSH service
```
sudo systemctl restart sshd
```
