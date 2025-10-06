---
title: Configure the NUT to manage a UPS through the Home Assistant as a Docker container
  on a Raspberry Pi
date: 2022-06-28T14:17:34+00:00
description: Configure the NUT to manage a UPS through the Home Assistant as a Docker
  container on a Raspberry Pi
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
cover:
    image: images/2022-thumbs/raspberry_pi_nut.webp
---
The primary goal of the Network UPS Tools (NUT) project is to provide support for Power Devices, such as Uninterruptible Power Supplies, Power Distribution Units, Automatic Transfer Switches, Power Supply Units and Solar Controllers. NUT provides a common protocol and set of tools to monitor and manage such devices, and to consistently name equivalent features and data points, across a vast range of vendor-specific protocols and connection media types.

{{< youtube QA3jdLkJhJg >}}
<figcaption>Configure the NUT to manage a UPS through the Home Assistant as a Docker container on a Raspberry Pi</figcaption>

Video describes the NUT configuration and how to install Docker, Docker Compose and run the Home Assistant as a Docker container. Additionally I present how to turn off the Mikrotik router from the Raspberry Pi if the battery level state is low. 

I decided to &#8222;promote&#8221; this video that is just an excellent example that explains step by step how to install and configure NUT on a Raspberry Pi. 

{{< youtube vyBP7wpN72c >}}
<figcaption>Network UPS Tools - Ultimate Guide</figcaption>

NUT documentation: <a href="https://networkupstools.org/docs/man/" target="_blank" rel="noreferrer noopener">https://networkupstools.org/docs/man/</a>

I am using this UPS: UPS Green Cell AiO 600VA 360W 

{{< youtube VqXZo2aepnM >}}
<figcaption>UPS Uninterruptible power supply by Green Cell</figcaption>


More information you can find on a vendor website: <a href="https://greencell.global/en/for-rtv-and-household-appliances/1090-ups-green-cell-aio-600va-360w.html" target="_blank" rel="noreferrer noopener">https://greencell.global/en/for-rtv-and-household-appliances/1090-ups-green-cell-aio-600va-360w.html</a>

I created a nut user on a Mikrotik and additionally tested it with RSA keys without a passphrase what in LAN is let's say secure enough. All you have to do is to save private and public key in openSSH format, but not the newest one, but instead the standard format - hope I explained it well, just because Puttygen allows you to save the RSA key in new openSSH format. Anyway you have to upload the private key into the Files in Mikrotik, and then in system - users section im port the key for a user. But you can also just use ordinary password with sshpass as I did in the password. If you want use RSA, you have to remove this from bash script: sshpass -f /root/creds 


{{< youtube ufOtQ9r7nws >}}
<figcaption>How to generate RSA keys on Raspberry Pi and upload it to a Mikrotik router to connect via ssh.</figcaption>

Video that describes how to generate RSA key, import it to the Mikrotik and then connect through the ssh from Raspberry Pi to a Mikrotik router.

All the necessary scripts are on my github account: <a href="https://github.com/sysadmin-info/NUT" target="_blank" rel="noreferrer noopener">https://github.com/sysadmin-info/NUT</a>
