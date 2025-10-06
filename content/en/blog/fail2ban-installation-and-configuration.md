---
title: fail2ban – installation and configuration
date: 2019-09-28T07:17:32+00:00
description: fail2ban – installation and configuration
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
series:
- 
categories:
- IT security
cover:
    image: images/2019-thumbs/fail2ban.webp
---
Note, the following tutorial is a part of my engineering work entitled &#8222;Hardening of a Linux-based network server&#8221; under the direction of Ph. D. Kordian Smolinski in the Department of Theoretical Physics WFiIS UŁ defended in June 2019.

To install Fail2Ban on CentOS 7.6, you will first need to install the EPEL (_Extra Packages for Enterprise Linux_) repository. EPEL contains additional packages for all versions of CentOS, one of these additional packages is Fail2Ban.

{{< tabs CentOS Ubuntu >}}
  {{< tab >}}
  ### CentOS
  To install Fail2Ban on CentOS 7.6, you will first need to install the EPEL (_Extra Packages for Enterprise Linux_) repository. EPEL contains additional packages for all versions of CentOS, one of these additional packages is Fail2Ban.
  ```bash
  sudo yum install epel-release
  sudo yum install fail2ban fail2ban-systemd
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian/Ubuntu
  For Debian/Ubuntu, a command is enough:
  ```bash
  sudo apt-get install fail2ban
  ```
  {{< /tab >}}
{{< /tabs >}}

For CentOS, the next step is to update the SELinux rules. (Note: there is no SELinux installed on mikr.us.)

```bash
sudo yum update -y selinux-policy*
```

For Debian/Ubuntu there is AppArmor. 

Once installed, you will need to configure and customize the software using the jail.local configuration file. The jail.local file replaces the jail.conf file and is used to ensure the security of user configuration updates.

Make a copy of the jail.conf file and save it under the name jail.local: update the SELinux policy:

```bash
cp -pf /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Open the jail.local file for editing in Vim with the following command:

```bash
sudo -e /etc/fail2ban/jail.local
```

A file code can consist of multiple lines of codes that execute themselves to prevent the blocking of one or more IP addresses, set the duration of bantime, etc.. A typical prison configuration file contains the following lines:

```vim
[DEFAULT]
ignoreip = 127.0.0.1/8
ignorecommand =
bantime = 600
findtime = 600
maxretry = 5
backend = systemd
```

  * IgnoreIP is used to set a list of IP addresses that will not be banned. The list of IP addresses should be given with a space separator. This parameter is used to set a personal IP address (if there is access to the server from a fixed IP address).
  * The Bantime parameter is used to set the duration of the seconds for which the host is to be banned.
  * Findtime is used to check whether the host needs to be banned or not. When the host generates the maximum in the last findtime, it is banned.
  * Maxretry is the parameter used to set the limit for the number of attempts by the host, after exceeding this limit, the host is banned.

#### Adding a jail file to protect SSH.

Create a new file using the vim editor.

```bash
sudo -e /etc/fail2ban/jail.d/sshd.local
```

The following lines of code should be added to the above file.

```vim
[sshd]
enabled = true
port = ssh
action  = iptables-allports
# logpath = /var/log/secure # manual path setting 
logpath = %(sshd_log)s
findtime = 600
maxretry = 3
bantime = 86400
```

In case you are using iptables , action set as below:

```bash
action = iptables-allports
```

  * The enable parameter is set to true, in order to provide protection to disable protection, it is set to false. The filter parameter checks the sshd configuration file in /etc/fail2ban/filter.d/sshd.conf.
  * The action parameter is used to derive the IP address, which must be disabled using the filter in /etc/fail2ban/action.d/iptables-allports.conf.
  * All ports means that all ports will be blocked automatically. You can use iptables-multiport or firewalld-multiport if you need only &#8222;attacked&#8221;, &#8222;spoofed&#8221; or &#8222;knocked&#8221;.
  * The port parameter can be changed to a new value, e.g. port=2244, as is the case here. When using port 22, there is no need to change this parameter.
  * The logging path gives the path where the log file is stored. This log file is scanned by Fail2Ban.
  * Maxretry is used to set the maximum limit of unsuccessful login entries.
  * Bantime parameter is used to set the duration of seconds for which the host must be locked.

#### Activation of the Fail2Ban service

If you are not using the CentOS firewalld yet, run it:

```bash
sudo systemctl enable firewalld
sudo systemctl start firewalld
```

If you want to use iptables

```bash
sudo yum install iptables
sudo systemctl enable iptables
sudo systemctl start iptables
```

Perform the following tasks to run Fail2Ban on the server.

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### Tracking fail2ban login entries

The following command is used to check which attempts to log in to the server via post ssh failed.

```bash
cat /var/log/secure | grep 'Failed password'
```

If you execute the above command, a list of unsuccessful attempts to enter the master password from different IP addresses will be displayed. The format of the results will be similar to the one shown below:

```bash
Feb 12 19:27:12 centos sshd[25729]: Failed password for root from 150.10.0.107 port 9074 ssh2
Feb 13 15:05:35 deb_usr sshd[1617]: Failed password for invalid user pi from 42.236.138.215 port 58182 ssh2
```

#### Checking banned IP addresses by Fail2Ban

The following command is used to obtain a list of blocked IP addresses that have been identified as threats using the brute force method.

```bash
iptables -L –n
```

#### Fail2Ban status check

Use the following command to check the status of jail files in Fail2Ban:

```bash
sudo fail2ban-client status
```

The result should be similar to this:

```bash
fail2ban-client status
Status
|- Number of jail: 1
`- Jail list: sshd
```

The following command will display banned IP addresses for the jail.

```bash
sudo fail2ban-client status sshd
```

#### Deleting a banned IP address

In order to remove the IP address from the blocked list, the IPADDRESS parameter is set to the appropriate IP address, which needs to be unbanned. The name &#8222;sshd&#8221; is the name of the prison, in this case it is the prison &#8222;sshd&#8221;, which we have configured above. The following command allows you to remove the IP address.

```bash
sudo fail2ban-client set sshd unbanip IPADDRESS
```

#### Adding your own filter to increase protection

Fail2ban allows you to create your own filters. Below is a brief description of the configuration of one of them.

1. Go to the filter.d Fail2ban directory

```bash
sudo cd /etc/fail2ban/filter.d
```

2. Create a wordpress.conf file and add a regular expression to it.

```bash
sudo -e wordpress.conf
```

```vim
#Fail2Ban filter for WordPress
[Definition]
failregex =  - - [(\d{2})/\w{3}/\d{4}:\1:\1:\1 -\d{4}] "POST /wp-login.php HTTP/1.1" 200
ignoreregex =
```

Save and close the file.

3. Add the WordPress section to the end of the jail.local file:

```bash
sudo -e /etc/fail2ban/jail.local
```

```vim
[wordpress]
enabled = true
filter = wordpress
logpath = /var/log/httpd/access_log 
#CentOS - Pay attention if it is _ or . 
#In the file /etc/httpd/conf/httpd.conf 
#you have information about where the log is stored.
#logpath = /var/log/apache2/access.log // Ubuntu/Debian
port = 80,443
```

If you want to ban bots, just add the action, ban time and number of attempts, as in the case of the sshd jail described above.

The default ban and email action will be used for this purpose. Other actions can be defined by adding an action = line.  
Save and exit and then run Fail2ban again with a command:

```bash
sudo systemctl restart fail2ban
```

Also check if your regex works:

```bash
fail2ban-regex /var/log/apache2/access.log /etc/fail2ban/filter.d/wordpress.conf
```