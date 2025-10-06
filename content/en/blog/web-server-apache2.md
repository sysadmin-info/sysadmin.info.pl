---
title: "Web Server - Apache2"
date:  2023-04-06T12:00:00+00:00
description: "Install Apache2 to configure Web Server."
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: admin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
-
categories:
- web server
cover:
    image: images/2023-thumbs/apache2.webp
---
#### Exercises to complete:
1. Install Apache2
2. Enable and start Apache2
3. Add a port to firewalld
4. Create a simple website
5. Check does the website display correctly using IP address

<script async id="asciicast-575077" src="https://asciinema.org/a/575077.js"></script>

#### Install Apache2

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  To install Apache2 type:
  ```
  # refresh repositories
  sudo zypper ref
  # install Apache2
  sudo zypper -n in apache2
  # enable Apache2 on boot
  sudo systemctl enable apache2
  # start the Apache2
  sudo systemctl start apache2
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  To install apache2 type:
  ```
  # refresh repositories
  sudo apt update
  # install apache2
  sudo apt -y install apache2
  # enable apache2 on boot
  sudo systemctl enable apache2
  # start the apache2
  sudo systemctl start apache2
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  To install apache2 type:
  ```
  sudo yum install httpd -y
  or
  sudo dnf install httpd -y
  # enable apache2 on boot
  sudo systemctl enable httpd
  # start the apache2
  sudo systemctl start httpd
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Allow Apache2 service

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  linux:~ # sudo firewall-cmd --add-service=http --permanent
  success
  linux:~ # sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo ufw allow 'WWW'
  or
  sudo ufw allow 'Apache'
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  linux:~ # sudo firewall-cmd --add-service=http --permanent
  success
  linux:~ # sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Create a simple webiste

```
echo 'Linux fundamentals - lab' | sudo tee -a /srv/www/htdocs/index.html
```

#### Check does the website display correctly using IP address

```
curl http://checkip.amazonaws.com
curl http://IP-ADDRESS
```

#### Additional modules

Once the Apache server is up and running, additional modules can be enabled for extended functionality.

To check the lsite of additional modules, look in the ```/etc/apache2/mods-available``` directory or ```/etc/httpd/conf.modules.d``` directory.

Suppose you want to install the MySQL authentication module. You can do that by running the following command:

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  sudo zypper -n in libapr1-util1-dbd-mysql
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo apt install libapr1-util1-dbd-mysql
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  sudo yum install apache-mod_authn_dbd
  or
  sudo dnf install apache-mod_authn_dbd
  ```
  {{< /tab >}}
{{< /tabs >}}

After installation, the module should be turned on using the following command:

```
sudo a2enmod authn_dbd
```

Must read: [Differences in the way Apache server modules are enabled between SLES/OpenSUSE, Debian/Ubuntu and RedHat/Fedora/CentOS](https://serverfault.com/questions/56394/how-do-i-enable-apache-modules-from-the-command-line-in-redhat)

Then restart the Apache server to enable activating the changes made:

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  sudo systemctl restart apache2
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo systemctl restart apache2
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  sudo systemctl restart httpd
  ```
  {{< /tab >}}
{{< /tabs >}}