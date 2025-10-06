---
title: Server basic configuration after installing RHEL 8.5 (minimal).
date: 2022-03-03T11:48:18+00:00
description: Server basic configuration after installing RHEL 8.5 (minimal).
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
    image: images/2022-thumbs/hardened.webp
---
I saved it as script.sh, gave it chmod u+x script.sh executable permissions and ran it as root ./script.sh, although I know that scripts should be run from sudo for security. But I know what I’m doing and why. Everything is described with comments in English. User was created during installation of the system, hence the change. I use sudo and user on a daily basis. Here it is a quick solution. These commands can be executed equally well using sudo.

```vim
#!/bin/bash
# Create a group admins
groupadd admins
# Add user user to group admins
usermod -a -G admins user
# Check which groups user has assigned
id user
# Remove user from group wheel
gpasswd -d user wheel
# Check which groups user has assigned
id user
# Create directory .ssh
mkdir -p /home/user/.ssh
# Create a file authorized_keys
touch /home/user/.ssh/authorized_keys
# Change permissions for .ssh directory
chmod 700 /home/user/.ssh
# Generate RSA key and put it into authorized_keys
echo "ssh-rsa A....." >> /home/user/.ssh/authorized_keys
# Change permissions for authorized_keys
chmod 600 /home/user/.ssh/authorized_keys
# Change the owner to user for the whole /home/user directory
chown -R user:user /home/user
# Create hosts.allow and hosts.deny . Skip these steps if you are using a dynamic IP assigned by your ISO from DHCP
touch /etc/hosts.{allow,deny}
# Deny the ssh access for all
echo "sshd: ALL" >> /etc/hosts.deny
# Allow ssh access only from the specific IP address Replace XXX.XXX.XXX.XX with your public, static IP address 
echo "sshd: XXX.XXX.XXX.XX" >> /etc/hosts.allow
#Change default wheel group to admins
sed -i 's/%wheel/%admins/g' /etc/sudoers
# This enforces the use of key-based authentication instead of the use of passwords 
# for logging in as root and reduces risks by preventing brute-force attacks.
sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/g' /etc/ssh/sshd_config
# Disable password authentication
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
# Disable empty passwords
sed -i 's/#PermitEmptyPasswords no/PermitEmptyPasswords no/g' /etc/ssh/sshd_config
# Change default port 22 to higher for ssh 22222 is to obvious - it is an example
sed -i 's/#Port 22/Port 22222/g' /etc/ssh/sshd_config
# Enable SELinux rule for a defined port
semanage port -a -t ssh_port_t -p tcp 22222
# Add a firewalld rule to allow traffic on a defined port
firewall-cmd --add-port 22222/tcp
# remove ssh firewalld rule
firewall-cmd --permanent --remove-service=ssh
# remove cockpit firewalld rule
firewall-cmd --permanent --remove-service=cockpit
# set rules to be permanent
firewall-cmd --runtime-to-permanent
# reload firewalld rules - changes will take effect
firewall-cmd --reload
# list firewalld rules
firewall-cmd --list-all
# Restricting access to specific group
echo "AllowGroups admins" >> /etc/ssh/sshd_config
# restart ssh daemon
systemctl restart sshd
# Now we have a secured ssh on a very basic level that should be sufficient. 
# set timezone to Warsaw. Use timedatectl list-timezones to check the proper zone.
timedatectl set-timezone Europe/Warsaw
# remove cockpit from the system. Pardon, but web-based server management is not secure. No matter how it will be written. Pure CLI rulez.
systemctl stop cockpit
systemctl disable cockpit
dnf remove cockpit -y
rm -f /etc/issue.d/cockpit.issue
rpm -e subscription-manager-cockpit
rpm -e cockpit-storaged
rpm -e cockpit-system
rpm -e cockpit-podman
rpm -e cockpit-packagekit
rpm -e cockpit-bridge
rpm -e cockpit-ws
rm -R -f /run/cockpit
rm -R -f /etc/cockpit
rm -R -f /usr/share/cockpit
rm -R -f /var/lib/selinux/targeted/active/modules/100/cockpit
rm -R -f /usr/share/selinux/targeted/default/active/modules/100/cockpit
## ****** Additionall steps if needed ******
# adding insights from Red Hat https://red.ht/insights-dashboard Of course only if needed
insights-client --register
# install epel release to be able to install additional tools
dnf -y install https://dl.fedoraproject.org/.../epel-release-latest-8...
# install additional tools
# https://www.tecmint.com/view-multiple-files-in-linux/
dnf install multitail -y
# https://linuxize.com/post/how-to-use-linux-screen/
dnf install screen -y
# https://www.linux-magazine.com/.../2017/196/Tutorials-lnav
dnf install lnav -y 
# Disable splash screen during boot. Splash screen is not very informative to be honest. I prefer to see what is going on during the boot.
sed -i 's/rhgb quiet//g' /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
```