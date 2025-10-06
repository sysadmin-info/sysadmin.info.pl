---
title: How to setup and secure Telegraf, InfluxDB and Grafana on Linux
date: 2020-09-10T19:05:29+00:00
description: How to setup and secure Telegraf, InfluxDB and Grafana on Linux
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
    image: images/2020-thumbs/grafana.webp
---
The tutorial is for Red Hat family server distributions like CentOS 7.x, Red Hat 7.x, Fedora29 or newer (current version is 32), etc.

For Debian family server distributions like (Debian, Ubuntu etc.) I recommend to read this article: <a rel="noreferrer noopener" href="https://devconnected.com/how-to-setup-telegraf-influxdb-and-grafana-on-linux/" target="_blank">How To Setup Telegraf InfluxDB and Grafana on Linux</a>, however it does not contain the own domain and fail2ban setup.

I decided to copy some parts from tutorials. References are at the end of this tutorial:

&#8222;From all the existing modern monitoring tools, the **TIG (Telegraf, InfluxDB and Grafana) stack** is probably one of the most popular ones.

This stack can be used to monitor a wide panel of different data sources: from operating systems (such as Linux or Windows performance metrics), to databases (such as MongoDB or MySQL), the possibilities are endless.

The principle of the TIG stack is easy to understand.

Telegraf is an agent responsible for gathering and aggregating data, like the current CPU usage for example.

InfluxDB will store data, and expose it to Grafana, which is a modern dashboarding solution.

In this tutorial, you will learn how to setup Telegraf, InfluxDB and Grafana. You will also learn how to secure our instances with HTTPS via secure certificates.&#8221;


![A modern monitoring infrastructure with Telegraf, InfluxDB, Grafana](/images/2020/diagram-2.webp "A modern monitoring infrastructure with Telegraf, InfluxDB, Grafana")
<figcaption>A modern monitoring infrastructure with Telegraf, InfluxDB, Grafana</figcaption>

This tutorial is going to cover steps for **Influx 1.8.x**, but I will link to the InfluxDB 2.x setup as soon as it is written.

Before starting, make sure that you have sudo privileges on the system, otherwise you won’t be able to install any packages.

All installation activities will be done as root. So you need to type in terminal:

```bash
sudo -i or sudo su -
cd
```

### I – Installing InfluxDB
#### a – Install InfluxDB as a service
##### Get the software
```bash
wget https://dl.influxdata.com/influxdb/releases/influxdb-1.8.2.x86_64.rpm
```
##### and install
```bash
yum localinstall influxdb-1.8.2.x86_64.rpm
```

#### b – Verify your InfluxDB installation

Right now, InfluxDB should run as a **service** on your server.

To verify it, run the following command:

```bash
$ systemctl status influxdb
```

InfluxDB should run automatically, but if this is not the case, make sure to start it.

```bash
systemctl start influxdb
```

![InfluxDB service](/images/2020/influxdb_service.webp "InfluxDB service")
<figcaption>InfluxDB service</figcaption>

However, even if your service is running, it does not guarantee that it is correctly working.

To verify it, **check your journal logs**.

```bash
journalctl -f -u influxdb.service
```

![InfluxDB logs](/images/2020/influxdb_logs.webp "InfluxDB logs")
<figcaption>InfluxDB logs</figcaption>

Ctrl+c will exit the logging mode.

If you are having error messages in this section, please refer to the **troubleshooting** section at the end.

To make it sure that the InfluxDB service will start with the server enable it.

```bash
systemctl enable influxdb
```

TCP port 8086 is used for client-server communication over InfluxDB’s HTTP API  
TCP port 8088 is used for the RPC service for backup and restore

You can view the current configuration with:
```bash
influxd config
```

The configuration file can be found in: /etc/influxdb/influxdb.conf

Let’s create a database and make it secure. Create an admin user with all the rights and a user used by Telegraf.

```bash
influx -precision rfc3339
> CREATE DATABASE "GRAFANA"
> SHOW DATABASES
> CREATE USER "admin" WITH PASSWORD 'secret' WITH ALL PRIVILEGES
> CREATE USER "telegraf" WITH PASSWORD 'secret'
> GRANT ALL ON "GRAFANA" to "telegraf"
> SHOW GRANTS FOR "telegraf"
> SHOW USERS
```

Of course you have to change the secret to your password. I recommend to use at least 20 digit password which contains uppercase, lowercase, numbers and special symbols. Just for security reason, because Grafana does not have a two factor authentication (2FA). 

I recommend to set up retention policy. 

```bash
influx -precision rfc3339
> CREATE RETENTION POLICY "twenty_four_hours" ON "GRAFANA" DURATION 24h REPLICATION 1 DEFAULT
> CREATE RETENTION POLICY "a_year" ON "GRAFANA" DURATION 52w REPLICATION 1
> CREATE CONTINUOUS QUERY "cq_30m" ON "GRAFANA" BEGIN SELECT mean("website") AS "mean_website",mean("phone") AS "mean_phone" INTO "a_year"."downsampled_orders" FROM "orders" GROUP BY time(30m) END
```

Explanation you will find in References and here: <a href="https://docs.influxdata.com/influxdb/v1.8/guides/downsample_and_retain/" target="_blank" rel="noreferrer noopener">InfluxDB retention policy</a>

One fact is worth to mention, that 24 hours is set as default. Just because my server does not have much space and I need only 24 hours graphs in grafana. 

To check retention policy just type:

```bash
SHOW RETENTION POLICIES ON GRAFANA
```

To remove 24 hours retention policy just type:

```bash
DROP RETENTION POLICY twenty_four_hours ON GRAFANA
```

Restart InfluxDB service.

```bash
systemctl restart influxdb
```

To get rid of logging to the /var/log/messages just edit the file /usr/lib/systemd/system/influxdb.service and add below entries in [Service] section:

```bash
StandardOutput=null
StandardError=null
```

After that restart influxdb service.

### II – Installing Telegraf

Telegraf is an agent that collects metrics related to a wide panel of different targets.

It can also be used as a tool to **process**, **aggregate**, **split** or **group** data.

The whole <a href="https://docs.influxdata.com/telegraf/v1.15/data_formats/input/" target="_blank" rel="noreferrer noopener">list of available targets</a> (also called **inputs**) is available here.

In our case, we are going to use <a href="https://docs.influxdata.com/telegraf/v1.11/plugins/plugin-list/#influxdb" target="_blank" rel="noreferrer noopener">InfluxDB </a>as an **output**.

#### a – Install Telegraf as a service

To install **Telegraf 1.15.2** on Red Hat 7.x, CentOS 7.x or Fedora 29 or newer, run the following commands:

##### Get the software
```bash
wget https://dl.influxdata.com/telegraf/releases/telegraf-1.15.2-1.x86_64.rpm
```

##### and install
```bash
yum localinstall telegraf-1.15.2-1.x86_64.rpm
```

#### b – Verify your Telegraf installation

Right now, Telegraf should run as a **service** on your server.

To verify it, run the following command:

```bash
systemctl status telegraf
```

Telegraf should run automatically, but if this is not the case, make sure to start it.

```bash
systemctl start telegraf
```

![Telegraf service](/images/2020/telegraf_service.webp "Telegraf service")
<figcaption>Telegraf service</figcaption>
However, even if your service is running, it does not guarantee that it is correctly sending data to InfluxDB.

To verify it, **check your journal logs**.

```bash
journalctl -f -u telegraf.service
```
![Telegraf logs](/images/2020/telegraf_logs.webp "Telegraf logs")
<figcaption>Telegraf logs</figcaption>
If you are having error messages in this section, please refer to the **troubleshooting** section at the end.

To make it sure that the InfluxDB service will start with the server enable it.

```bash
systemctl enable telegraf
```

### III – Configure InfluxDB Authentication

#### a – Enable HTTP authentication on your InfluxDB server

**HTTP authentication** needs to be enabled in the InfluxDB configuration file.

Head over to **/etc/influxdb/influxdb.conf** and edit the following lines.

```vim
[http]
  # Determines whether HTTP endpoint is enabled.
  enabled = true
  
  # The bind address used by the HTTP service.
  bind-address = ":8086"

  # Determines whether user authentication is enabled over HTTP/HTTPS.
  auth-enabled = true
```

#### b – Configure HTTP authentication on Telegraf

Now that a user account is created for Telegraf, we are going to make sure that it uses it to write data.

Head over to the configuration file of Telegraf, located at **/etc/telegraf/telegraf.conf**.

Modify the following lines :

```vim
## HTTP Basic Auth
  username = "telegraf"
  password = "secret"
```

Restart the Telegraf service, as well as the InfluxDB service.

```bash
systemctl restart influxdb
systemctl restart telegraf
```

Again, check that you are not getting any errors when restarting the service.

```bash
journalctl -f -u telegraf.service
```

Awesome, our requests are now authenticated.

**Time to encrypt them.**

### IV – Configure HTTPS on InfluxDB

Configuring secure protocols between Telegraf and InfluxDB is a very important step.

You would not want anyone to be able to sniff data you are sending to your InfluxDB server.

If your Telegraf instances are running remotely (on a Raspberry Pi or another server for example), **securing data transfer is a mandatory step** as there is a very high chance that somebody will be able to read the data you are sending.

#### a – Create a private key for your InfluxDB server

First, install the **gnutls-utils** package that might come as gnutls-bin on Debian distributions for example.

```bash
yum install gnutls-utils
```

Now that you have the **certtool** installed, **generate a private key** for your InfluxDB server.

Head over to the **/etc/ssl** folder of your Linux distribution and create a new folder for InfluxDB.

```bash
cd /etc/ssl
mkdir influxdb && cd influxdb
certtool --generate-privkey --outfile server-key.pem --bits 2048
```

#### b – Create a public key for your InfluxDB server

```bash
certtool --generate-self-signed --load-privkey server-key.pem --outfile server-cert.pem
```

Great! You now have a** key pair** for your InfluxDB server.

Other option is to generate it this way:

```bash
openssl req -x509 -nodes -newkey rsa:2048 -keyout /etc/ssl/influxdb/influxdb-selfsigned.key -out /etc/ssl/influxdb/influxdb-selfsigned.crt -days <NUMBER_OF_DAYS>
```

When you execute the command, it will prompt you for more information. You can choose to fill out that information or leave it blank; both actions generate valid certificate files.

Do not forget to set permissions for the InfluxDB user and group.

```bash
chown influxdb:influxdb server-key.pem server-cert.pem
```
or
```bash
chown influxdb:influxdb influxdb-selfsigned.key influxdb-selfsigned.crt
```

Run the following command to give InfluxDB read and write permissions on the certificate files.

```bash
chmod 644 /etc/ssl/influxdb/server-cert.pem
chmod 600 /etc/ssl/influxdb/server-key.pem
```
or
```bash
chmod 644 /etc/ssl/influxdb/influxdb-selfsigned.crt
chmod 600 /etc/ssl/influxdb/influxdb-selfsigned.key
```

#### c – Enable HTTPS on your InfluxDB server

Now that your certificates are created, it is time to tweak our InfluxDB configuration file to enable HTTPS.

Head over to **/etc/influxdb/influxdb.conf** and modify the following lines.

```vim
# Determines whether HTTPS is enabled.
  https-enabled = true

# The SSL certificate to use when HTTPS is enabled.
https-certificate = "/etc/ssl/influxdb/server-cert.pem"

# Use a separate private key location.
https-private-key = "/etc/ssl/influxdb/server-key.pem"
```

Restart the InfluxDB service and make sure that you are not getting any errors.

```bash
systemctl restart influxdb
journalctl -f -u influxdb.service
```

#### d – Configure Telegraf for HTTPS

Now that HTTPS is available on the InfluxDB server, **it is time for Telegraf to reach InfluxDB via HTTPS.**

Head over to **/etc/telegraf/telegraf.conf** and modify the following lines.

```vim
# Configuration for sending metrics to InfluxDB
[[outputs.influxdb]]

# https, not http!
urls = ["https://127.0.0.1:8086"]

## Use TLS but skip chain & host verification
insecure_skip_verify = true
```

**Why are we enabling the insecure_skip_verify parameter?**

Because we are using a **self-signed certificate.**

As a consequence, the InfluxDB server identify is not certified by a certificate authority. 

Restart Telegraf, and again make sure that you are not getting any errors.

```bash
sudo systemctl restart telegraf
sudo journalctl -f -u telegraf.service
```

### IV – Exploring your metrics on InfluxDB

Before installing Grafana and creating our first Telegraf dashboard, let’s have a quick look at **how Telegraf aggregates our metrics.**

By default, for Linux systems, Telegraf will start gathering related to the performance of your system via plugins named **cpu, disk, diskio, kernel, mem, processes, swap and system**.

Names are pretty self-explanatory, those plugins gather some metrics on the** CPU usage**, **the memory usage** as well as the **current disk read and write IO operations**.

Let’s have a quick look at one of the measurements.

To do this, use the InfluxDB CLI with the following parameters.

Data is stored in the “**telegraf**” database, each measurement being named as the name of the input plugin.

```bash
$ influx -ssl -unsafeSsl -username 'admin' -password 'secret'
Connected to http://localhost:8086 version 1.8.2
InfluxDB shell version: 1.8.2

> USE GRAFANA
> SELECT * FROM cpu WHERE time > now() - 30s
```

![InfluxDB metrics](/images/2020/grafana-metrics-1.webp "InfluxDB metrics")
<figcaption>InfluxDB metrics</figcaption>
Great!

Data is correctly being aggregated on the InfluxDB server.

**It is time to setup Grafana and build our first system dashboard.**

### V – Installing Grafana

#### a – Install Grafana as a service

To install **Grafana 7.1.5** on Red Hat 7.x, CentOS 7.x or Fedora 29 or newer, run the following commands:

##### Get the software
```bash
wget https://dl.grafana.com/oss/release/grafana-7.1.5-1.x86_64.rpm
```

##### and install
```bash
yum localinstall grafana-7.1.5-1.x86_64.rpm
```

#### b – Verify your Grafana installation

Right now, Grafana should run as a **service** on your server.

To verify it, run the following command:

```bash
systemctl status grafana-server
```

Grafana should run automatically, but if this is not the case, make sure to start it.

```bash
systemctl start grafana-server
```

![Grafana service](/images/2020/grafana_service.webp "Grafana service")
<figcaption>Grafana service</figcaption>

Head over to /etc/grafana/grafana.ini and edit the following lines.

```vim
[server]
# The public facing domain name used to access grafana from a browser
;domain = localhost
domain = grafana.example.com

# The full public facing url you use in browser, used for redirects and emails
# If you use reverse proxy and sub path specify full url (with sub path)
root_url = %(protocol)s://%(domain)s

# Serve Grafana from subpath specified in `root_url` setting. By default it is set to `false` for compatibility reasons.
serve_from_sub_path = false
  
[security]
# disable creation of admin user on first start of grafana
disable_initial_admin_creation = true

# default admin user, created on startup
admin_user = admin

# disable protection against brute force login attempts
disable_brute_force_login_protection = false

# set to true if you host Grafana behind HTTPS. default is false.
cookie_secure = true

# set cookie SameSite attribute. defaults to `lax````bashbash. can be set to "lax", "strict", "none" and "disabled"
cookie_samesite = lax

# Set to true if you want to enable http strict transport security (HSTS) response header.
# This is only sent when HTTPS is enabled in this configuration.
# HSTS tells browsers that the site should only be accessed using HTTPS.
strict_transport_security = true

# Sets how long a browser should cache HSTS. Only applied if strict_transport_security is enabled.
strict_transport_security_max_age_seconds = 86400

# Set to true if to enable HSTS preloading option. Only applied if strict_transport_security is enabled.
strict_transport_security_preload = true

# Set to true if to enable the HSTS includeSubDomains option. Only applied if strict_transport_security is enabled.
strict_transport_security_subdomains = true

# Set to true to enable the X-Content-Type-Options response header.
# The X-Content-Type-Options response HTTP header is a marker used by the server to indicate that the MIME types advertised
# in the Content-Type headers should not be changed and be followed.
x_content_type_options = true

# Set to true to enable the X-XSS-Protection header, which tells browsers to stop pages from loading
# when they detect reflected cross-site scripting (XSS) attacks.
x_xss_protection = true

[users]
# disable user signup / registration
allow_sign_up = false

[auth.anonymous]
# enable anonymous access
enabled = false

[log]
# Either "console", "file", "syslog". Default is console and  file
# Use space to separate multiple modes, e.g. "console file"
mode = console file

# Either "debug", "info", "warn", "error", "critical", default is "info"
level = debug

# optional settings to set different levels for specific loggers. Ex filters = sqlstore:debug
filters = context:debug

# For "console" mode only
[log.console]
level = debug

# For "file" mode only
[log.file]
level = debug

# log line format, valid options are text, console and json
format = console

# This enables automated log rotate(switch of following options), default is true
log_rotate = true

# Max line number of single file, default is 1000000
max_lines = 1000000

# Max size shift of single file, default is 28 means 1 &lt;&lt; 28, 256MB
max_size_shift = 28

# Segment log daily, default is true
daily_rotate = true

# Expired days of log file(delete after max days), default is 7
max_days = 7
```

However, even if your service is running, it does not guarantee that it is correctly sending data to InfluxDB.

To verify it, **check your journal logs**.

```bash
journalctl -f -u grafana-server.service
```
![Grafana logs](/images/2020/grafana_logs.webp "Grafana logs")
<figcaption>Grafana logs</figcaption>
If you are having error messages in this section, please refer to the **troubleshooting** section at the end.

To make it sure that the Grafana service will start with the server enable it.

```bash
systemctl enable grafana-server
```

#### c - Configure web server Nginx

In your Nginx configuration file, add a new `server` bash block:

```vim
server { 
    listen 80; 
    root /usr/share/nginx/html; 
    index index.html index.htm; 

    location / { 
        proxy_pass http://localhost:3000/; 
    } 
}
```

Reload Nginx configuration.

To configure NGINX to serve Grafana under a _sub path_, update the `location````bashbash block:

```vim
server {
    listen 80;
  root /usr/share/nginx/html;
   index index.html index.htm;

    location /grafana/ {
        proxy_pass http://localhost:3000/;
    }
}
```

#### d - Configure web server Apache

In your Apache configuration file, add a new `server````bashbash block:

```vim
ProxyPreserveHost On
ProxyPass "/" "http://localhost:3000/"
ProxyPassReverse "/" "http://localhost:3000/"

<Location />
    Require all granted 
</Location>

<Directory "/var/www/html/grafana.example.com/public_html/">
    Options Indexes FollowSymLinks Includes IncludesNOEXEC SymLinksIfOwnerMatch 
    AllowOverride All 
    Require all granted 
    RewriteEngine On
</Directory>
```

If you are using php-fpm proxy, additionally you should add this in virtual host:

```vim
# Redirect to the proxy
<FilesMatch \.php$> 
    SetHandler proxy:fcgi://php-fpm 
</FilesMatch>
```

If you will have any troubles with the virtual host configuration contact me. I will help. I use grafana with SSL from <a href="https://letsencrypt.org" target="_blank" rel="noreferrer noopener">Let&#8217;s Encrypt</a>. 

#### e – Add InfluxDB as a datasource on Grafana

In the left menu, click on the **Configuration > Data sources** section.<figure class="wp-block-image size-large is-style-default">

![Grafana config datasource](/images/2020/config-datasource.webp "Grafana config datasource")
<figcaption>Grafana config datasource</figcaption>

In the next window, click on “**Add datasource**“.

![Grafana add data source](/images/2020/add-data-source.webp "Grafana add data source")
<figcaption>Grafana add data source</figcaption>

In the datasource selection panel, choose InfluxDB as a datasource.

![InfluxDB as datasource](/images/2020/influxdb-option.webp "InfluxDB as datasource")
<figcaption>InfluxDB as datasource</figcaption>

Here is the configuration you have to match to configure InfluxDB on Grafana.

![InfluxDB config](/images/2020/influxdb-config-1.webp "InfluxDB config")
<figcaption>InfluxDB config</figcaption>

Click on “Save and Test”, and make sure that you are not getting any errors.

![data source is working](/images/2020/data-source-is-working-1.webp "data source is working")
<figcaption>data source is working</figcaption>

> Getting a 502 Bad Gateway error? Make sure that your URL field is set to HTTPS and not HTTP.

If everything is okay, **it is time to create our Telegraf dashboard.**

#### f – Importing a Grafana dashboard

We are not going to create a Grafana dashboard for Telegraf, we are going to **use a pre-existing one** already developed by the community.

If in the future you want to develop your own dashboard, feel free to do it.

To import a Grafana dashboard, select the **Import** option in the left menu, **under the Plus icon.**

![import dashboard](/images/2020/import-dashboard.webp "import dashboard")
<figcaption>import dashboard</figcaption>

On the next screen, import the dashboard with the **5955** ID.

This is a dashboard created by <a href="https://grafana.com/orgs/jmutai" target="_blank" rel="noreferrer noopener">jmutai</a> that displays system metrics collected by Telegraf.

![import dashboard created by jmutai](/images/2020/import-dashboard-5955.webp "import dashboard created by jmutai")
<figcaption>import dashboard created by jmutai</figcaption>

From there, Grafana should automatically try to import this dashboard.

Add the previous configured InfluxDB as the dashboard datasource and click on “**Import**“.

![add InfluxDB as dashboard](/images/2020/import-dashboard-influxdb.webp "add InfluxDB as dashboard")
<figcaption>add InfluxDB as dashboard</figcaption>

Great!

We now have **our first Grafana dashboard displaying Telegraf metrics.**

This is what you should now see on your screen.

![final Grafana dashboard](/images/2020/final-dashboard.webp "final Grafana dashboard")
<figcaption>final Grafana dashboard</figcaption>

#### g – Modifying InfluxQL queries in Grafana query explorer

Sometimes when designing the dashboard, the creator specifies the hostname as “example”, which is obviously different from one host to another (mine is for example named “mail.sysadmin.info.pl”)

To modify it, head over to the **query explorer** by hovering the panel title, and clicking on “Edit”.

![edit Grafana dashboard](/images/2020/edit-dashboard.webp "edit Grafana dashboard")
<figcaption>edit Grafana dashboard</figcaption>

In the “**queries**” panel, **change the host**, and the panel should starting displaying data.

![changing host](/images/2020/changing-host.webp "changing host")
<figcaption>changing host</figcaption>

Go back to the dashboard, and this is what you should see.

![CPU dashboard](/images/2020/cpu-dashboard.webp "CPU dashboard")
<figcaption>CPU dashboard</figcaption>

### VI – Conclusion

In this tutorial, you learned how to setup a complete Telegraf, InfluxDB and Grafana stack on your server.

So where should you go from there?

The first thing would be to connect Telegraf to <a rel="noreferrer noopener" href="https://docs.influxdata.com/telegraf/v1.15/plugins/" target="_blank">different inputs</a>, look for <a href="https://grafana.com/grafana/dashboards" target="_blank" rel="noreferrer noopener">existing dashboards in Grafana</a> or design your own ones.

### Troubleshooting

* **Error writing to output [influxdb] : could not write any address**

![Telegraf output error](/images/2020/error-output-telegraf.webp "Telegraf output error")
<figcaption>Telegraf output error</figcaption>

**Possible solution**: make sure that InfluxDB is correctly running on the port 8086.

```bash
$ sudo lsof -i -P -n | grep influxdb
influxd   17737    influxdb  128u  IPv6 1177009213    0t0  TCP *:8086 (LISTEN)
```

If you are having a different port, change your Telegraf configuration to forward metrics to the custom port that your InfluxDB server was assigned.

<hr />

* **[outputs.influxdb] when writing to [http://localhost:8086] : 401 Unauthorized: authorization failed**

**Possible solution:** make sure that the credentials are correctly set in your Telegraf configuration. Make sure also that you created an account for Telegraf on your InfluxDB server.

<hr />

* **http: server gave HTTP response to HTTPS client**

**Possible solution**: make sure that you enabled the https-authentication parameter in the InfluxDB configuration file. It is set by default to false.

<hr />

* **x509: cannot validate certificate for 127.0.0.1 because it does not contain any IP SANs**

**Possible solution**: your TLS verification is set, you need to enable the insecure_skip_verify parameter as the server identify cannot be verified for self-signed certificates.

<hr />

* **client denied by server configuration: proxy:http://localhost:3000/api/datasources/proxy/3/query**


**Possible solutions**:

If you are using OWASP I recommend to read this article: <https://sysadmin.info.pl/en/blog/mod_security-rules-for-wordpress/>. Errors will be visible in /var/log/httpd/error_log and /var/log/httpd/modsec_audit. Eventually you can set in virtual host config file the value: SecRuleEngine Off instead On to disable mod_security for grafana virtual host.

You need to also modify the mod_evasive config file located in /etc/httpd/conf.d directory and set these values mentioned below to let grafana works properly with mod_evasive enabled.

```vim
DOSHashTableSize 3097
DOSPageCount 20
DOSSiteCount 100
DOSPageInterval 1
DOSSiteInterval 1
DOSBlockingPeriod 10
DOSLogDir /var/log/mod_evasive
```

### Fail2ban configuration to protect grafana against attacks.

Enter the directory which contains filters for fail2ban, located at **/etc/fail2ban/filter.d**

Create a new filter called grafana.conf. Type in terminal:

```bash
vi grafana.conf
```

Then hit the insert button (ins) to paste the below content:

```vim
[INCLUDES]
before = common.conf
[Definition]
failregex = ^ lvl=[a-zA-z]* msg=\"Invalid username or password\" (?:\S=(?:\".\"|\S) )remote_addr=
ignoreregex =
[Init]
datepattern = ^t=%%Y-%%m-%%dT%%H:%%M:%%S%%z
```

Hit Esc button, then type : and x without spaces and hit Enter to save and exit.

Enter the directory which contains jails for fail2ban, located at **/etc/fail2ban/jail.d** 

Create a new jail called grafana.local. Type in terminal&#8221;

```bash
vi grafana.local
```

Then hit the insert button (ins) to paste the below content:

```vim
[grafana]
enabled = true
port = http,https
filter = grafana
action = iptables-allports
#action = firewallcmd-allports //if you are using firewalld instead iptables
logpath = /var/log/grafana/grafana.log
bantime = 172800
maxretry = 1
```

Hit Esc button, then type : and x without spaces and hit Enter to save and exit.

Restart the fail2ban by typing in terminal:

```bash
systemctl restart fail2ban
```

Check your fail2ban filter by typing in terminal:

```bash
fail2ban-regex /var/log/grafana/grafana.log /etc/fail2ban/filter.d/grafana.conf
```

### References

* <a href="https://devconnected.com/how-to-setup-telegraf-influxdb-and-grafana-on-linux/" target="_blank" rel="noreferrer noopener">https://devconnected.com/how-to-setup-telegraf-influxdb-and-grafana-on-linux/</a>
* <a href="https://www.petersplanet.nl/index.php/2018/11/18/basic-installation-of-grafana-influxdb-and-telegraf-on-centos-7/" target="_blank" rel="noreferrer noopener">https://www.petersplanet.nl/index.php/2018/11/18/basic-installation-of-grafana-influxdb-and-telegraf-on-centos-7/</a>
* <a href="https://docs.influxdata.com/influxdb/v1.8/guides/downsample_and_retain/" target="_blank" rel="noreferrer noopener">https://docs.influxdata.com/influxdb/v1.8/guides/downsample_and_retain/</a>
* <a href="https://portal.influxdata.com/downloads/" target="_blank" rel="noreferrer noopener">https://portal.influxdata.com/downloads/</a>
