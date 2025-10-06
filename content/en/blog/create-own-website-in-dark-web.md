---
title: Create own website in Dark Web
date: 2022-03-03T11:59:24+00:00
description: The content of this article will let you easily set up your own website
  in the Dark Web aka Dark Net easily.
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
- Linux
cover:
    image: images/2022-thumbs/darknet.webp
---
Hi, The below content will let you easily set up your own website in the Dark Web aka Dark Net easily. Bear in mind that this is the tutorial for the Red Hat family distros like CentOS, Red Hat, Fedora etc. For Debian family distros it is a little bit different, but not so hard to modify it. 

###### Very basic setup of your own website in Dark Web

Below you have a very basic configuration that allows you to setup what is needed. Advanced security configuration for nginx has been added additionally below this section, to allow you to harden the nginx. Of course this tutorial does not contain all the steps, just because it requires a knowledge that I share in my other posts. 


##### Update packages

```bash
dnf update
```

##### Add admins group that gives permissions to sudo

```bash
groupadd admins
```

##### Add user. Replace user with a random name.

```bash
useradd user
```

##### Add user to admins group

```bash
usermod -aG admins user
```

##### Set the password for the user

```bash
passwd user
```

##### Make a very advance password. I recommend to use a password manager like bitwarden

##### Replace the default wheel to admins

```bash
sed -i 's/%wheel/%admins/g' /etc/sudoers
```

##### Check is user added to admins group

```bash
id user
```

##### Switch to user account

```bash
su - user
```

##### Install vim or nano text editor

```bash
sudo dnf install vim -y
```
##### or

```bash
sudo dnf install nano  -y
```

#Install nginx and tor

```bash
sudo dnf install nginx tor -y
```

##### edit the tor configuration file

```bash
sudo vim /etc/tor/torrc
```
##### Uncomment

```vim
Log notice file /var/log/tor/log
RunAsDaemon 1
DataDirectory /var/lib/tor
HiddenServiceDir /var/lib/tor/hidden_service/
HiddenServicePort 80 127.0.0.1:80
```

##### Save and exit

##### Start, enable during boot and then check status of both services

```bash
sudo systemctl start nginx tor
sudo systemctl enable nginx tor
sudo systemctl status nginx tor
```

##### go back into root (ctrl + D)

```bash
cat /var/lib/tor/hidden_service/hostname
```

##### it will display your onion address. This is onion address for this server. You should put it in server block section, see server_name in /etc/nginx/nginx.conf

##### switch back to user

```bash
su - user
```

##### delete the content in index.html

```bash
sudo cat /dev/null > /usr/share/nginx/html/index.html
```

##### Edit the index.html 

```bash
sudo vim /usr/share/nginx/html/index.html
```
##### or

```bash
sudo nano /usr/share/nginx/html/index.html
```

##### Paste the below:

```vim
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Welcome to the Dark Web</title>
</head>
<body>
<p>Hello world!</p>
</body>
</html>
```

##### Save and exit

*** secure nginx - very basic configuration ***

##### Edit nginx configuration
```bash
sudo vim /etc/nginx/nginx.conf
```

##### add in server block section
```vim
server_tokens off;
```

##### add in server block section
```vim
listen 127.0.0.1:80 default_server
```

##### Comment out:

```vim
listen       80 default_server;
listen       [::]:80 default_server;
```

##### Deny the directory traversal
##### Add autoindex off; this way:

```vim
location / {
                autoindex off;
        }
```

##### Test the configuration

```bash
nginx -t
```

##### Restart nginx

```bash
sudo systemctl restart nginx
```

Enjoy your dark web website!

###### Advanced Nginx protection

You can control and configure Linux kernel and networking settings via /etc/sysctl.conf. Remember to **<mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-vivid-red-color">reboot</mark>** the server after this step, please.

```bash
sudo vim /etc/sysctl.conf
```

```vim
##### Avoid a smurf attack
net.ipv4.icmp_echo_ignore_broadcasts = 1
 
##### Turn on protection for bad icmp error messages
net.ipv4.icmp_ignore_bogus_error_responses = 1
 
##### Turn on syncookies for SYN flood attack protection
net.ipv4.tcp_syncookies = 1
 
##### Turn on and log spoofed, source routed, and redirect packets
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
 
##### No source routed packets here
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
 
##### Turn on reverse path filtering
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
 
##### Make sure no one can alter the routing tables
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
 
##### Don't act as a router
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
 
 
##### Turn on execshild
kernel.exec-shield = 1
kernel.randomize_va_space = 1
 
##### Tuen IPv6
net.ipv6.conf.default.router_solicitations = 0
net.ipv6.conf.default.accept_ra_rtr_pref = 0
net.ipv6.conf.default.accept_ra_pinfo = 0
net.ipv6.conf.default.accept_ra_defrtr = 0
net.ipv6.conf.default.autoconf = 0
net.ipv6.conf.default.dad_transmits = 0
net.ipv6.conf.default.max_addresses = 1
 
##### Optimization for port usefor LBs
##### Increase system file descriptor limit
fs.file-max = 65535
 
##### Allow for more PIDs (to reduce rollover problems); may break some programs 32768
kernel.pid_max = 65536
 
##### Increase system IP port limits
net.ipv4.ip_local_port_range = 2000 65000
 
##### Increase TCP max buffer size setable using setsockopt()
net.ipv4.tcp_rmem = 4096 87380 8388608
net.ipv4.tcp_wmem = 4096 87380 8388608
 
##### Increase Linux auto tuning TCP buffer limits
##### min, default, and max number of bytes to use
##### set max to at least 4MB, or higher if you use very high BDP paths
##### Tcp Windows etc
net.core.rmem_max = 8388608
net.core.wmem_max = 8388608
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_window_scaling = 1
```

###### Controlling Buffer Overflow Attacks

Edit nginx.conf and set the buffer size limitations for all clients.

```bash
sudo vim /etc/nginx/nginx.conf
```

Edit and set the buffer size limitations for all clients as follows:

```vim
client_body_buffer_size  1K;
  client_header_buffer_size 1k;
  client_max_body_size 1k;
  large_client_header_buffers 2 1k;
```

###### Disable Any Unwanted HTTP methods

I suggest that you disable any HTTP methods, which are not going to be utilized and which are not required to be implemented on the web server. If you add the following condition in the location block of the nginx virtual host configuration file, the server will only allow GET, HEAD, and POST methods and will filter out methods such as DELETE and TRACE.

```vim
location / {
    limit_except GET HEAD POST { deny all; }
}
```

Another approach is to add the following condition to the server section (or server block). It can be regarded as more universal but <a href="https://www.nginx.com/resources/wiki/start/topics/depth/ifisevil/" target="_blank" rel="noreferrer noopener"><mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-vivid-red-color">y</mark></a><a href="https://www.nginx.com/resources/wiki/start/topics/depth/ifisevil/" target="_blank" rel="noreferrer noopener nofollow"><mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-vivid-red-color">ou should be careful with if statements in the location context.</mark></a>

```vim
if ($request_method !~ ^(GET|HEAD|POST)$ ) {
    return 444; }
```

###### Configure Nginx to Include Security Headers

To additionally harden your nginx web server, you can add several different HTTP headers. in http block .

######## X-Frame-Options

You use the X-Frame-Options HTTP response header to indicate if a browser should be allowed to render a page in a or an . This could prevent clickjacking attacks. Therefore, we recommend that you enable this option for your nginx server. 

To do this, add the following parameter to the nginx configuration file in the server section:

```vim
add_header X-Frame-Options "SAMEORIGIN";
```

######## Strict-Transport-Security

HTTP Strict Transport Security (HSTS) is a method used by websites to declare that they should only be accessed using a secure connection (HTTPS). If a website declares an HSTS policy, the browser must refuse all HTTP connections and prevent users from accepting insecure SSL certificates. To add an HSTS header to your nginx server, you can add the following directive to your server section:

```vim
add_header Strict-Transport-Security "max-age=31536000; includeSubdomains; preload";
```

######## CSP and X-XSS-Protection

Content Security Policy (CSP) protects your web server against certain types of attacks, including Cross-site Scripting attacks (XSS) and data injection attacks. You can implement CSP by adding the following example Content-Security-Policy header (note that the actual header should be configured to match your unique requirements):

```vim
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

The HTTP X-XSS-Protection header is supported by IE and Safari and is not necessary for modern browsers if you have a strong Content Security Policy. However, to help prevent XSS in the case of older browsers (that don’t support CSP yet), you can add the X-XSS Protection header to your server section:

```vim
add_header X-XSS-Protection "1; mode=block";
```

The whole nginx configuration after the modification should looks like this:

```vim
##### For more information on configuration, see:
#####   * Official English Documentation: http://nginx.org/en/docs/
#####   * Official Russian Documentation: http://nginx.org/ru/docs/

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

##### Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.
include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    ##### Load modular configuration files from the /etc/nginx/conf.d directory.
    ##### See http://nginx.org/en/docs/ngx_core_module.html#include
    ##### for more information.
    include /etc/nginx/conf.d/*.conf;

    server {
        ##### Additional settings for security reason
        server_tokens off;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubdomains; preload";
        client_body_buffer_size 1k;
        client_header_buffer_size 1k;
        client_max_body_size 1k;

        #listen       80 default_server;
        #listen       [::]:80 default_server;
        listen 127.0.0.1:80 default_server;

        #your onion address
        server_name  q.......sga.onion;
        root         /usr/share/nginx/html;

        ##### Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        location / {
            autoindex off;
            limit_except GET HEAD POST { deny all; }
            proxy_http_version 1.1;
            proxy_set_header   "Connection" "";
        }

        error_page 404 /404.html;
            location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }
    }

##### Settings for a TLS enabled server.
#
#####    server {
#####        listen       443 ssl http2 default_server;
#####        listen       [::]:443 ssl http2 default_server;
#####        server_name  _;
#####        root         /usr/share/nginx/html;
#
#####        ssl_certificate "/etc/pki/nginx/server.crt";
#####        ssl_certificate_key "/etc/pki/nginx/private/server.key";
#####        ssl_session_cache shared:SSL:1m;
#####        ssl_session_timeout  10m;
#####        ssl_ciphers PROFILE=SYSTEM;
#####        ssl_prefer_server_ciphers on;
#
#####        ##### Load configuration files for the default server block.
#####        include /etc/nginx/default.d/*.conf;
#
#####        location / {
#####        }
#
#####        error_page 404 /404.html;
#####            location = /40x.html {
#####        }
#
#####        error_page 500 502 503 504 /50x.html;
#####            location = /50x.html {
#####        }
#####    }

}
```

Check logs: (press ctrl+c to exit tail)

```bash
tail -f /var/log/tor/log
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

I recommend to install more convenient tool called multitail

```bash
sudo dnf install multitail
```

Then you can view logs with this tools this way:

```bash
multitail /var/log/tor/log /var/log/nginx/access.log /var/log/nginx/error.log
```

Press q to exit multitail.

###### Install vanguards

If you run a high-security onion service which is under attack by sophisticated adversaries, you should install the Vanguards addon which defends against various advanced attacks. <a href="https://blog.torproject.org/announcing-vanguards-add-onion-services/" target="_blank" rel="noreferrer noopener nofollow">Please read Tor project’s blog post</a> on how to install and use this tool.

You can install vanguards to protect the service from github repository <a href="https://github.com/mikeperry-tor/vanguards" target="_blank" rel="noreferrer noopener nofollow">https://github.com/mikeperry-tor/vanguards</a>

All you need to do is to install few packages in RHEL 8

```bash
sudo dnf install git python3-stem
```

In the next step you need to clone the repository

```bash
#Switch to root
sudo -i 
cd /home/root
git clone https://github.com/mikeperry-tor/vanguards.git
```

Edit the vanguards.py file

```bash
vim /root/vanguards/src/vanguards.py
```

Change shebang to the path where your python3 is installed. By default it will be /usr/bin/python3 so it should look like this:

```vim
#!/usr/bin/python3
```
Press Esc, then type :x and hit enter

After that edit the crontab with the command: (it will open in the default text editor, in my case it is vim I installed, because I do not use nano).

```bash
crontab -e
```

Add this line

```bash
@reboot /usr/bin/python3 /root/vanguards/src/vanguards.py
```
Press Esc, then type :x and hit enter

Then you can reboot the server and the script will run during the reboot.

###### Avoiding the Top 10 NGINX Configuration Mistakes

Please visit this website to read an article about it: <a href="https://www.nginx.com/blog/avoiding-top-10-nginx-configuration-mistakes/" target="_blank" rel="noreferrer noopener">https://www.nginx.com/blog/avoiding-top-10-nginx-configuration-mistakes/</a>