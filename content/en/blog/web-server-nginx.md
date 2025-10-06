---
title: "Web Server - Nginx"
date:  2023-04-21T10:30:00+00:00
description: "Install Nginx to configure a WWW server."
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
    image: images/2023-thumbs/nginx.webp
---
#### Exercises to perform:
1. Install Nginx.
2. Enable and start Nginx.
3. Add a port to firewalld.
4. Create a simple website.
5. Check if the page displays correctly using the IP address.

<script async id="asciicast-579041" src="https://asciinema.org/a/579041.js"></script>
<script async id="asciicast-579046" src="https://asciinema.org/a/579046.js"></script>

#### Install Nginx

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  To install Nginx, type:
  ```
  # refresh repositories
  sudo zypper ref
  # install Nginx
  sudo zypper -n in nginx
  # enable Nginx at system startup
  sudo systemctl enable nginx
  # start Nginx
  sudo systemctl start nginx
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  To install Nginx, type:
  ```
  # refresh repositories
  sudo apt update
  # install Nginx
  sudo apt -y install nginx
  # enable Nginx at system startup
  sudo systemctl enable nginx
  # start Nginx
  sudo systemctl start nginx
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  To install Nginx, type:
  ```
  # install Nginx
  sudo yum install nginx -y
  or
  sudo dnf install nginx -y
  # enable Nginx at system startup
  sudo systemctl enable nginx
  # start Nginx
  sudo systemctl start nginx
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Allow Nginx service

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  linux:~ # sudo firewall-cmd --add-service=http --permanent
  linux:~ # sudo firewall-cmd --add-service=https --permanent
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
  sudo ufw allow 'Nginx'
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  linux:~ # sudo firewall-cmd --add-service=http --permanent
  linux:~ # sudo firewall-cmd --add-service=https --permanent
  success
  linux:~ # sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Create a simple website

```
echo 'Linux Basics - laboratory' | sudo tee -a /srv/www/htdocs/index.html
```

#### Check if the site displays correctly using the IP address

```
curl http://checkip.amazonaws.com
curl http://IP-ADDRESS
```

#### Additional modules

After starting the Nginx server, you can enable additional modules to obtain extended functionality.

To check the list of additional modules, write the command:

```
sudo zypper search nginx
```

Assuming you want to install the ModSecurity module. You can do this by running the following command:

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  sudo zypper -n in nginx-module-modsecurity
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo apt install nginx-plus-module-modsecurity
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  sudo yum install nginx-plus-module-modsecurity
  or
  sudo dnf install nginx-plus-module-modsecurity
  ```
  {{< /tab >}}
{{< /tabs >}}

Add the following line to the main section in the /etc/nginx/nginx.conf file

```
load_module modules/ngx_http_modsecurity_module.so;
```

Restart Nginx.

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  sudo systemctl restart nginx
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo systemctl restart nginx
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  sudo systemctl restart nginx
  ```
  {{< /tab >}}
{{< /tabs >}}

Run the following command to check if the module has loaded successfully:

```
sudo nginx -t
```

The result should be as below:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

More about WAF configuration here: [Configuring the NGINX ModSecurity WAF with a Simple Rule](https://docs.nginx.com/nginx-waf/admin-guide/nginx-plus-modsecurity-waf-installation-logging/)