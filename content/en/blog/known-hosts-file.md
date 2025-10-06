---
title: What is known_hosts File in Linux
date: 2023-11-14T15:00:00+00:00
description: What is known_hosts File in Linux
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
    image: images/2023/mitm.webp
---

#### All the Important Information You Need to Know About Linux's known_hosts file

##### A known_hosts file is a crucial component of the SSH protocol and can be found in the.ssh directory. Study up on it more.

A known_hosts file can be found in your home directory's.ssh folder along with other files.

```bash
adrian@rancher:~$ ls -l .ssh
total 20
-rw------- 1 adrian adrian 136 Nov 10 09:37 authorized_keys
-rw------- 1 adrian adrian 411 Nov 11 11:00 id_ed25519
-rw-r--r-- 1 adrian adrian 103 Nov 11 11:00 id_ed25519.pub
-rw------- 1 adrian adrian 426 Nov 12 17:25 known_hosts
-rw------- 1 adrian adrian 426 Nov 12 17:04 known_hosts.ansible
```
Your private SSH key is id_ed25519 in this case.The public SSH key is pub. In SSH, profiles are created in the config file to facilitate easy connections to different servers. I specifically created it; it is not a common file.

This article focuses on known_hosts, the final file. A crucial component of SSH configuration files for clients is the ~/.ssh/known_hosts file.

Permit me to elaborate on it.

What does SSH's known hosts file mean?
The public keys of the hosts that a user has accessed are kept in the known_hosts file. This is a crucial file that saves the user's identification to your local machine, ensuring that they are connecting to a real server. Additionally, it aids in preventing [man-in-the-middle](https://www.ssh.com/academy/attack/man-in-the-middle) attacks.

You are asked if you wish to add the remote hosts to the known_hosts file whenever you establish an SSH connection to a new remote server.

```bash
adrian@rancher:~$ ssh adrian@cm4
The authenticity of host 'cm4 (10.10.0.112)' can't be established.
ED25519 key fingerprint is SHA256:8+3YxL8KFACqRmpuDB3ZFFqQErjenI+mjLWp0oJFVF4.
This host key is known by the following other names/addresses:
    ~/.ssh/known_hosts:3: [hashed name]
Are you sure you want to continue connecting (yes/no/[fingerprint])? 
```
In essence, the message asked if you would like to add the remote system's details to your own.

If you select "yes," your system saves the server's identity.

##### Steer clear of man-in-the-middle attacks

![Man-in-the-middle attack](/images/2023/mitm.webp "Man-in-the-middle attack")
<figcaption>Man-in-the-middle attack</figcaption>

Assume you have added a server to the known_hosts file and you connect to it on a regular basis.

Your system will detect any changes to the remote server's public key if they occur because of the data kept in the known_hosts file. You will receive immediate notification of this change:

```vim
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@ WARNING: POSSIBLE DNS SPOOFING DETECTED!
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
The RSA host key for xyz remote host has changed,and the key for the corresponding IP address xxx.yy.xxx.yy is unknown. This could either mean that DNS SPOOFING is happening or the IP address for the host and its host key have changed at the same time.
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@ WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that the RSA host key has just been changed.
The fingerprint for the RSA key sent by the remote host is
85:5e:aa:80:7b:64:e3:78:07:6f:b4:00:41:07:d8:9c.
Please contact your system administrator.
Add correct host key in /home/.ssh/known_hosts to get rid of this message.
Offending key in /home/.ssh/known_hosts:1
Keyboard-interactive authentication is disabled to avoid man-in-the-middle attacks.
```

Before accepting this new key in such a situation, you can get in touch with the administrator of the remote server. You can make sure that the host or remote server hasn't been compromised in this way.

**The host or server's key may occasionally be purposefully changed by the administrator or as a result of a server reinstallation.**

For whatever reason this change occurred, in order to reconnect to the remote server, you must first remove the previous key from the known_hosts file. The client host will generate a new host key for this server when you connect to it again.

##### Handling Several Authorized Users

As previously indicated, the public key of the remote server is appended to the client host's known_hosts file after a successful connection.

There are situations when you want to authenticate a server to several users simultaneously without asking them to verify the server key. For instance, you don't want the client host to request server key verification if you are using Ansible or another configuration management tool.

Therefore, there are three ways to get around the SSH interactive prompt if you have multiple users:

* Manually adding the server's public key to each user's known_hosts file.
* When connecting to the server via SSH, use the command-line option -o StrictHostKeyChecking=no with each client (not recommended)
* Create a master or primary ssh_known_hosts file, register all of your hosts there, and then distribute this file to all of your client hosts. Additionally, the ssh-keyscan command can be used to make this function:

```bash
ssh-keyscan -H -t rsa ‘your-server-ip’ >> /etc/ssh/ssh_known_hosts
```

The StrictHostKeyChecking=no option can be used as shown in the screenshot below:

```bash
adrian@rancher:~$ ssh -o StrictHostKeyChecking=no ansible@worker1
Warning: Permanently added 'worker1' (ED25519) to the list of known hosts.
```

```bash
ansible@worker1:~ $ ip a | grep "10.10"
    inet 10.10.0.102/24 brd 10.10.0.255 scope global dynamic eth0
ansible@worker1:~ $
```

Compared to the other two methods, the first method of managing multiple users for server authentication is the most laborious.

##### Accessing the known_hosts file to obtain remote system information

This task is anything but simple and easy.

Nearly all Linux systems have the SSH configuration file's HashKnownHosts parameter set to Yes. It's a safety measure.

This indicates that the known_hosts file's information is hashed. Although random numbers are visible to you, you are unable to interpret them.

```bash
adrian@rancher:~$ cat .ssh/known_hosts
|1|aeOh8SLgXmKN9/ZCsl3KBYuB31M=|gp/rwwFrYd5WXG6RRkUWujiudsM= ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINNdwc/XaGb6OrlXjZ6NCi+pmznIZ+aeono5RtrxCG9N
|1|4xuYAcjVu2xzYHuvb+tkSrZE30o=|hIE+LeM+x5y1OheDsjeB4mxs1z0= ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDFKffDl+SPuseU86dGaaLIeouPYwvOK8lvIFRgvdCVP
|1|xDn5MTbbfuR6nuBDhaPDCl5oFrQ=|J74k0UveVV4F63dXmc1E8bWEw+w= ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPffThOhGC+wkyXbtBNyuX1/vv8G6wZbDsitm/lsCfYO
|1|B5vDUlcWiKxsJ5B/S5Sq0mQnCY8=|cf2pLpzn0D/yoYoyqoYO9+W0AI8= ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINNdwc/XaGb6OrlXjZ6NCi+pmznIZ+aeono5RtrxCG9N
```

If you are aware of the system's hostname or IP address, you can obtain the relevant entries from the known_hosts.

```bash
ssh-keygen -l -F <server-IP-or-hostname>
```

However, it isn't feasible to have a single command that could provide a clear text list of all the servers and their details.

The known_hosts can be deciphered using specially designed tools and scripts, but that is outside the purview of the average user like you and me.

##### Take out a piece of the known_hosts

If you are aware of the hostname or IP address of the remote system, you can delete a particular entry from the known_hosts file.

```bash
ssh-keygen -R server-hostname-or-IP
```

This is far more efficient than using the rm command to manually remove the entries associated with a server after finding them.

##### In summary
Understanding the different SSH configuration files gives you a greater grasp of system security. One essential component of these files is "known_hosts."
