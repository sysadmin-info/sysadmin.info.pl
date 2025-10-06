---
title: How to Install Home Assistant Supervised on a Raspberry Pi 4b – the official
  way
date: 2022-07-29T09:39:10+00:00
description: How to Install Home Assistant Supervised on a Raspberry Pi 4b – the official
  way
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
- Raspberry Pi
- Home Assistant
cover:
    image: images/2022-thumbs/ha.webp
---
This video describes how to install Home Assistant Supervised. Home Assistant (former Hass.io) is a container-based system for managing your Home Assistant Core installation and related applications. The system is controlled via Home Assistant which communicates with the Supervisor. The Supervisor provides an API to manage the installation. This includes changing network settings or installing and updating software.

{{< youtube zz8dq4wi_40 >}}
<figcaption>How to Install Home Assistant Supervised on a Raspberry Pi 4b – the official way</figcaption>

##### Check the OS
```bash
sudo cat /etc/os-release
```
##### Enter your user home directory
```bash
cd /home/youruser
```
##### Update the OS
```bash
sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y
```
##### Fix broken previous installations if any
```bash
sudo apt --fix-broken install
```
##### Additionally installl dnsutils to be able to use dig command to any address
```bash
sudo apt install dnsutils
```
##### Install necessary tools for the Home Assistant Supervised

```bash
sudo apt install jq wget curl udisks2 libglib2.0-bin network-manager dbus apparmor apparmor-utils -y
```

See https://github.com/home-assistant/architecture/blob/master/adr/0014-home-assistant-supervised.md

##### For the Raspberry Pi, execute the following to get the official Docker installation script:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
```
##### After that, start the script and enjoy the ride:
```bash
sudo sh get-docker.sh
```
##### Important! User pi does not exist by default anymore for a security reason

We have to add our linux user to the Docker group, but that is easy. If your user is not username as in the example below, just change the last part of the command by replacing pi with your username:

```bash
sudo usermod -aG docker $USER
```
##### Add these entries to vim /boot/cmdline.txt at the end of the line: apparmor=1 security=apparmor
```bash
sudo vim /boot/cmdline.txt 
```

It should look like this: 

```vim
console=serial0,115200 console=tty1 root=PARTUUID=ae7ace51-02 rootfstype=ext4 fsck.repair=yes rootwait apparmor=1 security=apparmor systemd.unified_cgroup_hierarchy=false
```

##### Reboot the server
```bash
sudo reboot
```

##### Check AppArmor status
```bash
sudo aa-status
```
##### Check versions and compare. 
See system requirements: [https://github.com/home-assistant/architecture/blob/master/adr/0014-home-assistant-supervised.md](https://github.com/home-assistant/architecture/blob/master/adr/0014-home-assistant-supervised.md)
```bash
sudo dpkg -l apparmor | tee
sudo docker --version
sudo systemctl --version
sudo nmcli --version
```
##### Install the OS-Agent:

Download the latest Debian package from OS Agent GitHub release page at: [https://github.com/home-assistant/os-agent/releases/latest](https://github.com/home-assistant/os-agent/releases/latest)
```bash
wget https://github.com/home-assistant/os-agent/releases/download/1.2.2/os-agent_1.2.2_linux_aarch64.deb
```
##### Next, install (or update) the downloaded Debian package using:
```bash
sudo dpkg -i os-agent_1.2.2_linux_aarch64.deb
```
##### You can test if the installation was successful by running:
```bash
sudo gdbus introspect --system --dest io.hass.os --object-path /io/hass/os
```
##### This should not return an error. If you get an object introspection with interface etc. OS Agent is working as expected.

##### Install the Home Assisistant Supervised Debian Package:
```bash
wget https://github.com/home-assistant/supervised-installer/releases/latest/download/homeassistant-supervised.deb
```
##### Next, install (or update) the downloaded Debian package using:
```bash
sudo dpkg -i homeassistant-supervised.deb
```
##### Choose: raspberrypi4-64 

See supported machine types: [https://github.com/home-assistant/supervised-installer](https://github.com/home-assistant/supervised-installer)

##### Change DNS entries
```bash
sudo vim /etc/dhcpcd.conf
```
##### change the DNS entry to Google 8.8.4.4 and 8.8.8.8 
because there was an IP address of the Raspberry Pi that was handling requests through the DNS, but requirements says clearly that it has to be different. 

See: [https://github.com/home-assistant/operating-system/blob/dev/Documentation/network.md#static-ip](https://github.com/home-assistant/operating-system/blob/dev/Documentation/network.md#static-ip)

```vim
interface eth0
static ip_address=10.10.0.100/24 
static routers=10.10.0.1
static domain_name_servers=8.8.4.4 8.8.8.8
```
If you are using the firewall like ufw , add port which Home Assistant is using
```bash
sudo ufw allow 8123/tcp
```

##### Reboot the server
```bash
sudo reboot
```
##### log into the Home Assistant in your browser
```
http://10.10.0.100:8123/
```