---
title: Instalacja i konfiguracja auditd
date: 2021-02-14T14:49:24+00:00
description: Instalacja i konfiguracja auditd
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
- IT Security
image: images/2021-thumbs/sysadmin-YT-thumb.webp
---
{{< youtube jT2BjLGNtDo >}}
<figcaption>Reguły w /etc/audit/rules.d/audit.rules</figcaption>

```
#####################
# This is an example configuration suitable for most systems
# Before running with this configuration:
# - Remove or comment items which are not applicable
# - Check paths of binaries and files
#####################

#####################
# Remove any existing rules
######################
-D
#####################
# Buffer Size
# Might need to be increased, depending on the load of your system.
#####################
-b 8192

#####################
# Failure Mode
#####################
# 0=Silent
# 1=printk, print failure message
# 2=panic, halt system
-f 1

#####################
# Audit the audit logs.
#####################
 -w /var/log/audit/ -k auditlog

#####################
# Auditd configuration
#####################
## Modifications to audit configuration that occur while the audit (check your paths)
-w /etc/audit/ -p wa -k auditconfig
-w /etc/libaudit.conf -p wa -k auditconfig
-w /etc/audisp/ -p wa -k audispconfig

#####################
# Monitor for use of audit management tools
#####################
# Check your paths
-w /sbin/auditctl -p x -k audittools
-w /sbin/auditd -p x -k audittools

#####################
# Special files
#####################
-a exit,always -F arch=b32 -S mknod -S mknodat -k specialfiles
-a exit,always -F arch=b64 -S mknod -S mknodat -k specialfiles

#####################
# Mount operations
#####################
-a exit,always -F arch=b32 -S mount -S umount -S umount2 -k mount
-a exit,always -F arch=b64 -S mount -S umount2 -k mount
 
#####################
# Changes to the time
#####################
-a exit,always -F arch=b32 -S adjtimex -S settimeofday -S stime -S clock_settime -k time
-a exit,always -F arch=b64 -S adjtimex -S settimeofday -S clock_settime -k time
-w /etc/localtime -p wa -k localtime

#####################
# Use of stunnel
#####################
-w /usr/sbin/stunnel -p x -k stunnel

#####################
# Schedule jobs
#####################
-w /etc/cron.allow -p wa -k cron
-w /etc/cron.deny -p wa -k cron
-w /etc/cron.d/ -p wa -k cron
-w /etc/cron.daily/ -p wa -k cron
-w /etc/cron.hourly/ -p wa -k cron
-w /etc/cron.monthly/ -p wa -k cron
-w /etc/cron.weekly/ -p wa -k cron
-w /etc/crontab -p wa -k cron
-w /var/spool/cron/crontabs/ -k cron

##################### 
# user, group, password databases
#####################
-w /etc/group -p wa -k etcgroup
-w /etc/passwd -p wa -k etcpasswd
-w /etc/gshadow -k etcgroup
-w /etc/shadow -k etcpasswd
-w /etc/security/opasswd -k opasswd

#####################
# Monitor usage of passwd command
#####################
-w /usr/bin/passwd -p x -k passwd_modification

#####################
# Monitor user/group tools
#####################
-w /usr/sbin/groupadd -p x -k group_modification
-w /usr/sbin/groupmod -p x -k group_modification
-w /usr/sbin/addgroup -p x -k group_modification
-w /usr/sbin/useradd -p x -k user_modification
-w /usr/sbin/usermod -p x -k user_modification
-w /usr/sbin/adduser -p x -k user_modification

#####################
# Login configuration and stored info
#####################
-w /etc/login.defs -p wa -k login
-w /etc/securetty -p wa -k login
-w /var/log/faillog -p wa -k login
-w /var/log/lastlog -p wa -k login
-w /var/log/tallylog -p wa -k login

#####################
# Network configuration
#####################
-w /etc/hosts -p wa -k hosts
-w /etc/network/ -p wa -k network

#####################
# system startup scripts
#####################
-w /etc/inittab -p wa -k init
-w /etc/init.d/ -p wa -k init
-w /etc/init/ -p wa -k init

#####################
# Library search paths
#####################
-w /etc/ld.so.conf -p wa -k libpath

#####################
# Kernel parameters and modules
#####################
-w /etc/sysctl.conf -p wa -k sysctl
-w /etc/modprobe.conf -p wa -k modprobe

#####################
# PAM configuration
#####################
-w /etc/pam.d/ -p wa -k pam
-w /etc/security/limits.conf -p wa  -k pam
-w /etc/security/pam_env.conf -p wa -k pam
-w /etc/security/namespace.conf -p wa -k pam
-w /etc/security/namespace.init -p wa -k pam

#####################
# Puppet (SSL)
#####################
-w /etc/puppetlabs/puppet/ssl -p wa -k puppet_ssl

#####################
# Postfix configuration
#####################
-w /etc/aliases -p wa -k mail
-w /etc/postfix/ -p wa -k mail

#####################
# SSH configuration
#####################
-w /etc/ssh/sshd_config -k sshd

#####################
# Hostname
#####################
-a exit,always -F arch=b32 -S sethostname -k hostname
-a exit,always -F arch=b64 -S sethostname -k hostname

#####################
# Changes to issue
#####################
-w /etc/issue -p wa -k etcissue
-w /etc/issue.net -p wa -k etcissue

#####################
# Log all commands executed by root
#####################
-a exit,always -F arch=b64 -F euid=0 -S execve -k rootcmd
-a exit,always -F arch=b32 -F euid=0 -S execve -k rootcmd

#####################
# Capture all failures to access on critical elements
#####################
-a exit,always -F arch=b64 -S open -F dir=/etc -F success=0 -k unauthedfileacess
-a exit,always -F arch=b64 -S open -F dir=/bin -F success=0 -k unauthedfileacess
-a exit,always -F arch=b64 -S open -F dir=/home -F success=0 -k unauthedfileacess
-a exit,always -F arch=b64 -S open -F dir=/sbin -F success=0 -k unauthedfileacess
-a exit,always -F arch=b64 -S open -F dir=/srv -F success=0 -k unauthedfileacess
-a exit,always -F arch=b64 -S open -F dir=/usr/bin -F success=0 -k unauthedfileacess
-a exit,always -F arch=b64 -S open -F dir=/usr/local/bin -F success=0 -k unauthedfileacess
-a exit,always -F arch=b64 -S open -F dir=/usr/sbin -F success=0 -k unauthedfileacess
-a exit,always -F arch=b64 -S open -F dir=/var -F success=0 -k unauthedfileacess

#####################
# su/sudo
#####################
-w /bin/su -p x -k priv_esc
-w /usr/bin/sudo -p x -k priv_esc
-w /etc/sudoers -p rw -k priv_esc

#####################
# Poweroff/reboot tools
#####################
-w /sbin/halt -p x -k power
-w /sbin/poweroff -p x -k power
-w /sbin/reboot -p x -k power
-w /sbin/shutdown -p x -k power

#####################
# Make the configuration immutable
#####################
-e 2
```