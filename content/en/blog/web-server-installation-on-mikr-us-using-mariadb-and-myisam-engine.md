---
title: "Web server installation on mikr.us using MariaDB and MyISAM engine"
date: 2019-09-22T17:40:40+00:00
description: "Web server installation on mikr.us using MariaDB and MyISAM engine"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧 
pinned: true
tags:
- security
series:
-
categories:
- mikr.us
image: images/2019-thumbs/mariadb.png
---
Hi,

There was an opportunity like a blind chicken grain long ago and I hunted the domain for free sysadmin.info.pl. Originally the idea was to use it for engineering work and so it happened. Three months later again an opportunity came up, which I couldn&#8217;t miss. This time the virtual machine on OpenVZ for funny money. If you are interested, please contact <a rel="noreferrer noopener" href="https://mikr.us/?r=a101" target="_blank">https://mikr.us</a>. After clicking on the link you will get a 5% discount on the server for the year

This way it became possible to have a live version of your own website, the configuration of which I will describe below step by step. By the way I will show you how to protect everything and prove that the default configuration of 128 MB RAM and 128 MB swap is enough to have a website based on and so popular WordPress CMS, which is the most frequently attacked CMS in the world. But about this maybe in a different entry. Hardening Linux was the subject of my engineering work, so by the way I will share a few comments on this subject, as well as show what on mikr.us can and can not do. 

I asked to change the default Ubuntu 16:04 to CentOS 7 and got version 7.6. Revelation, I like it. After some minor problems I finally managed to bring my website back to life and at the same time refresh my knowledge of building a web server on CentOS. So here we go. Little edit: now you can choose what operating system you want to use. Just ask for it through e-mail address which can be found on <a rel="noreferrer noopener" aria-label="https://mikr.us (otwiera się na nowej zakładce)" href="https://mikr.us" target="_blank">https://mikr.us</a> website.

#### Create an account on cloudflare.com and set up a domain

Create a free basic account on <a rel="noreferrer noopener" href="https://www.cloudflare.com/" target="_blank">https://www.cloudflare.com/</a>

Confirm your email and go to domain configuration where you have a panel from your domain. Change the DNS servers (ns1 and ns2) there to:

```
aragorn.ns.cloudflare.com
vida.ns.cloudflare.com
```

Log in to cloudflare. Add domain.  
Set AAAA record as a domain name and as an IPv6 IPv6 address. You will find this address by entering a command in the terminal:

```
sudo ip a
```

It will be given in this form: 2001: ….

Copy it for yourself or write it down without the last elements: /128

Paste it into the content field. Save the change.

Click on the SSL/TLS icon and set it as shown in the picture below:

![Cloudflare SSL settings](/images/2019/Cloudflare-Web_Performance_and_Security.png)
<figcaption>Cloudflare SSL settings</figcaption>

Click on Edge Certificates and set it up:

![Cloudflare SSL settings](/images/2019/Cloudflare-Edge_Certificates.png)

Below are the options that should be enabled:

![Cloudflare Settings](/images/2019/Cloudflare-settings1.png)
<figcaption>Cloudflare Settings</figcaption>

![Cloudflare Settings](/images/2019/Cloudflare-settings2.png)
<figcaption>Cloudflare Settings</figcaption>

Then click on Page Rules and add the rule by clicking on Create Page Rule.

Domain name on e.g. http://example.com.pl (remember about http not https).  
Select Automatic HTTPS rewrites from the drop-down list and set to ON.  
Click save and deploy.

If you have any questions about other settings, please write in your comment what bothers you.

#### Login to ssh and its hardening.

Access to the virtual machine is only possible after ssh.  
First you need to change your root password for security reasons, because you get a temporary password to login, server address and you can use only root account for the first login, which is not safe in itself.

```
passwd root
```

Once the password is set, we need to add a user to be used to log in to ssh and replace it with root for security reasons, but to be able to execute commands with root rights sometimes, we will add the user to the sudoers group.

```
useradd user
passwd user
usermod -aG wheel user
systemctl daemon reload
```

Next, block root user for ssh connections. To do this, you need to edit the sshd_config file.

```
vi /etc/ssh/sshd_config
```

We find the entry and set it this way: `PermitRootLogin no` To edit, press insert, change the value from yes to no. Next, press Esc, type :wq and press Enter. This is how we saved the changes. Now there is still a restart of the ssh daemon.

```
systemctl restart sshd
```

I assume that everyone knows how to connect to the server using a terminal or putty. Below I will describe two methods of generating a pair of keys (private and public) both in putty and in terminal. Open PuTTYgen.exe, press the Generate button, move the mouse to randomly generate a key pair using the RSA algorithm. After generating the keys, type in a password (passphrase) (select &#8222;hard to guess&#8221;). Save the public key. Save your private key. 2048 bits is enough, but if you want to increase the security level, you can set 4096 bits in the window.<figure class="wp-block-image">

![PuTTYgen](/images/2019/PuTTYgen.png)
<figcaption>PuTTYgen</figcaption>

After logging in with ssh and your user account, in our case it will be a user, follow the instructions below.

```
cd /home/user
sudo mkdir .ssh
sudo chmod 700 .ssh
cd .ssh
sudo vi authorized_keys
```

Copy from the field from ssh-rsa to the end of everything, go to the logged-in session, press the insert, paste the whole thing with the right mouse, then press Esc, type :wq and press Enter. Then set the file to read only with the command:

```
sudo chmod 600 authorized_keys
```

```
sudo systemctl restart sshd
```

Next, edit the /etc/ssh/sshd_config file, as above. Change the values to: `RSAAuthentication yes` and `PubkeyAuthentication yes`, as well as PermitEmptyPasswords no and PasswordAuthentication no. Save the file as described above. (I assume that using vi has already been understood). Restart ssh with a command:

```
sudo systemctl restart sshd
```

In connection with the putty or terminal we have to indicate the private key file for authorization. Or in the case of putty, double-click the private file, enter the password and the program pageant.exe should load the private key into the memory. If we don&#8217;t have a pageant, the server will ask us for the password for the private key (passphrase) that was set after the key was generated (this increases the security level, because even if someone manages to capture the key, they don&#8217;t know the password).

If you are using a terminal, you generate a command to generate a key on your computer from the terminal level:

```
ssh-keygen -t rsa -b 4096 -C "username@mikr.us"
```

Then you copy the key to the server with a command:

```
ssh-copy-id root@name.mikr.us -p 12345 
```

You change the port number 12345 to the one you received in the email, and the name is the same as the port number. I described above how to block access to ssh for root user. Now all you need to do is restart ssh daemon.

```
systemctl restart sshd
```

Hang up the exit command and connect again using ssh root@root@name.mikr.us -p 12345.

The security level can be further increased by adding a group to the ssh login and adding a user to this group.

```
sudo groupadd grupassh
sudo gpasswd -a &lt;user> grupassh
groups user
```

Wyświetli się: user : user sudo grupassh lub user : user wheel grupassh

```
sudo vi /etc/ssh/sshd_config
```

Dodaj: AllowGroups grupassh

```
sudo systemctl restart sshd
```

For the safety of Ubuntu/Debian users I recommend to install policies.

```
sudo apt-get install libpam-cracklib
```

They specify the length of the password, how many times the user can log in, how many times the same characters can be used in the password, the complexity of the password, its strength, number of digits, lowercase, uppercase letters and special characters.

#### Web/www server installation with Apache

First clear the download manager. CentOS uses yum, while Debian/Ubuntu uses apt-get and in the newer distro apt.

{{< tabs CentOS Debian >}}
  {{< tab >}}

  ### CentOS section

  ```
  sudo yum clean all
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Debian section

  ```
  sudo apt-get autoremove && sudo apt-get clean
  ```
  {{< /tab >}}
{{< /tabs >}}

Install all updates:

{{< tabs CentOS Debian >}}
  {{< tab >}}

  ### CentOS section

  ```
  sudo yum -y update
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Debian section

  ```
  sudo apt-get update && sudo apt-get upgrade
  ```
  {{< /tab >}}
{{< /tabs >}}

Next, install Apache (httpd in CentOS, apache2 in Debian/Ubuntu).

```
sudo yum -y install httpd
sudo apt-get install apache2
```

Enable Apache at system startup and run the service.

```
sudo systemctl enable httpd
sudo systemctl enable apache2
sudo systemctl start httpd
sudo systemctl start apache2
```

You can check the status of the service:

```
sudo systemctl status httpd
sudo systemctl status apache2
```

#### Virtual host configuration

In the case of CentOS we create a virtual host file for http (port 80) using the following command:

sudo vi /etc/httpd/conf.d/example.com.pl.conf

In the case of Debian/Ubuntu.

sudo vi /etc/apache2/sites-available/example.com.pl.conf

<pre class="wp-block-preformatted">&lt;VirtualHost *:80&gt;
   ServerName example.com.pl
   ServerAlias www.example.com.pl
   DocumentRoot /var/www/html/example.com.pl/public_html
   ErrorLog /var/log/httpd/error.log
   CustomLog /var/log/httpd/access.log combined
   #ErrorLog /var/log/apache2/error.log # Debian/Ubuntu
   #CustomLog /var/log/apache2/access.log combined # Debian/Ubuntu
   DirectoryIndex index.php

   LogLevel info warn

 <code>  &lt;FilesMatch "^\.ht"&gt;     </code>
       <code>Require all denied</code>
   <code>&lt;/FilesMatch&gt;</code>

   <code>&lt;files readme.html&gt;</code>
       <code>order allow,deny</code>
       <code>deny from all</code>
   <code>&lt;/files&gt;</code>
&lt;/VirtualHost&gt;</pre>

For Debian/Apache we still have to turn on the page.

sudo a2ensite example.com.pl.conf

This will create a symbolic link in the /etc/apache2/sites-enabled directory.

#### Create a physical structure and upload WordPress to the server.

Now you need to create a directory for the page in /var/www/html directory.

sudo -i
(enter the password of the user you created at the beginning)
cd /var/www/html
sudo mkdir example.com.pl

Create a directory named src in your site directory to store new copies of WordPress source files. This guide uses the home directory /var/www/html/example.com.pl/ as an example. Go to this new directory:

sudo mkdir -p /var/www/html/example.com.pl/src/
cd /var/www/html/example.com.pl/src/

<pre class="wp-block-preformatted">Set the web server user, <em><strong>www-data</strong></em>, as the owner of the home directory of your site. <em><strong>www-data</strong></em> is a group. In the case of CentOS it will be an <em><strong>apache</strong></em> group.</pre>

sudo chown -R apache:apache /var/www/html/example.com.pl/
sudo chown -R www-data:www-data /var/www/html/example.com.pl/

Install the latest version of WordPress and extract it using the appropriate name depending on the system you are using:

sudo wget http://wordpress.org/latest.tar.gz
sudo -u www-data tar -xvf latest.tar.gz
sudo -u apache tar -xvf latest.tar.gz

Rename the latest.tar.gz file to wordpress, then set the backup date for the original source files. This will be useful if you install new versions in the future and need to return to the previous version:

sudo mv latest.tar.gz wordpress-`date "+%Y-%m-%d"`.tar.gz

Create the public\_html directory, which will be the WordPress root directory. Move the WordPress files to the public\_html folder:

sudo mkdir -p /var/www/html/example.com.pl/public_html/
sudo mv wordpress/* ../public_html/

Give the public_html folder permissions for the www-data or apache group:

sudo chown -R www-data:www-data /var/www/html/example.com.pl/public_html
sudo chown -R apache:apache /var/www/html/example.com.pl/public_html

Go to the directory where WordPress was extracted, copy the sample configuration and set it to use the remote database:

cd /var/www/html/example.com.pl/public_html
sudo cp wp-config-sample.php wp-config.php

Change the login variables to match the database and the user. Edit the file:

sudo vi /var/www/html/example.com.pl/public_html/wp-config.php 

/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'user');

/** MySQL database password */
define('DB_PASSWORD', 'db_user_password');

/** MySQL hostname */
define('DB_HOST', 'localhost');

Add security keys to protect wp-admin.  
Use <a href="https://api.wordpress.org/secret-key/1.1/salt/" target="_blank" rel="noreferrer noopener">Security Key Generator WordPress</a> to create random, complex hashes that WordPress will use to encrypt your login data. Copy the result and replace the corresponding section in the file wp-config.php:

<pre class="wp-block-preformatted">/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
define('AUTH_SALT',        'put your unique phrase here');
define('SECURE_AUTH_SALT', 'put your unique phrase here');
define('LOGGED_IN_SALT',   'put your unique phrase here');
define('NONCE_SALT',       'put your unique phrase here');
/**#@-*/</pre>

#### Installation and configuration of Maria DB 10.4 in CentOS 7.6.

sudo tee /etc/yum.repos.d/MariaDB.repo&lt;&lt;EOF 
[mariadb]
name = MariaDB
baseurl = http://yum.mariadb.org/10.4/centos7-amd64
gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB
gpgcheck=1
EOF

sudo yum makecache fast
sudo yum -y install MariaDB-server MariaDB-client
sudo systemctl enable mariadb

When configuring, confirm the empty root password in MariaDB, and in the next step set the root password (the one from MariaDB). This password should be different from the root password you got in the email after setting up the server on mikr.us.

<pre class="wp-block-preformatted">$ mysql_secure_installation
 NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
       SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!
 In order to log into MariaDB to secure it, we'll need the current
 password for the root user.  If you've just installed MariaDB, and
 you haven't set the root password yet, the password will be blank,
 so you should just press enter here.
 <strong>Enter current password for root (enter for none): </strong>
 OK, successfully used password, moving on…
 Setting the root password ensures that nobody can log into the MariaDB
 root user without the proper authorisation.
 <strong>Set root password? [Y/n] y
 New password: 
 Re-enter new password: </strong>
 Password updated successfully!
 Reloading privilege tables..
  … Success!
 By default, a MariaDB installation has an anonymous user, allowing anyone
 to log into MariaDB without having to have a user account created for
 them.  This is intended only for testing, and to make the installation
 go a bit smoother.  You should remove them before moving into a
 production environment.
 Remove anonymous users? [Y/n] y
  … Success!
 Normally, root should only be allowed to connect from 'localhost'.  This
 ensures that someone cannot guess at the root password from the network.
 Disallow root login remotely? [Y/n] y
  … Success!
 By default, MariaDB comes with a database named 'test' that anyone can
 access.  This is also intended only for testing, and should be removed
 before moving into a production environment.
 Remove test database and access to it? [Y/n] y
 Dropping test database…
 … Success!
 Removing privileges on test database…
 … Success! 
 Reloading the privilege tables will ensure that all changes made so far
 will take effect immediately.
 Reload privilege tables now? [Y/n] y
  … Success!
 Cleaning up…
 All done!  If you've completed all of the above steps, your MariaDB
 installation should now be secure.
 Thanks for using MariaDB!</pre>

sudo systemctl start mariadb
mysql -u root -p

#### After logging in to the database, create a database and assign it to the user.

CREATE DATABASE wordpress;
CREATE USER 'user'@'localhost' IDENTIFIED BY 'haslo_użytkownika_bazy_danych';
GRANT ALL PRIVILEGES ON wordpress.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
exit
Enter
mysql -u user -p Enter
wpisz hasło użytkownika user, którego właśnie stworzyłeś
status;
Jeśli wyświetli się wersja MariaDB, to znaczy, że wszystko działa.
exit
Enter

Restart the database server and web commands:

sudo systemctl restart mariadb && sudo systemctl restart httpd

#### Installation and configuration of Maria DB 10.3 in Ubuntu 16.04 LTS

To install MariaDB 10.3 on Ubuntu 16.04, you need to add the MariaDB repository to your system. Run the following commands to import the PGP key of the MariaDB repository and add the repository.

sudo apt -y install software-properties-common dirmngr
sudo apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8
sudo add-apt-repository 'deb [arch=amd64] http://mirror.zol.co.zw/mariadb/repo/10.3/ubuntu xenial main'

Update the list of system packages and install MariaDB.

sudo apt update
sudo apt -y install mariadb-server mariadb-client

You will be asked to enter the password of the MariaDB root. You will have to enter it twice. Confirm the change of password. You can confirm the installed version of MariaDB by logging in as root user.

mysql -u root -p

After logging in, enter the status; (remember about semicolons in SQL syntax). Then type exit.

I recommend performing exactly the same procedure as for CentOS installation. Above you can see what steps need to be taken.

mysql_secure_installation

Then follow the instructions below:

sudo systemctl enable mariadb
sudo systemctl start mariadb
sudo systemctl status mariadb
sudo systemctl restart mariadb

Create a user database in the same way as creating a database in CentOS.

#### Installation and configuration of SSL certificate using Let&#8217;s Encrypt.

We will use the <https://certbot.eff.org> website to do this.

From the Software drop-down list, select Apache, the operating system, either Ubuntu 16.04, Debian 9, or CentOS/RHEL 7 and follow the instructions.

For Ubuntu 16.04

sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot python-certbot-apache
sudo certbot --apache

Choose a web page without a www or with a www as you like, because certbot will recognize the virtual host for http that was created earlier.

Do not enable redirection from http to https, as you will do so on the Cloudflare side. Otherwise you will encounter an error. So choose 1 when it asks for redirect.

Certbot will automatically install the certificate, create a virtual host file. Now all you have to do is go to the directory:

sudo -i
cd /etc/apache2/sites-available
ls -al
a2ensite example.com.pl-le-ssl.conf

I recommend to modify the virtual host file for https to make it look like this:

sudo vi /etc/apache2/sites-available/example.com.pl-le-ssl.conf
or
sudo vi /etc/httpd/conf.d/example.com.pl-le-ssl.conf

<pre class="wp-block-preformatted">&lt;IfModule mod_ssl.c&gt;
 SSLStaplingCache shmcb:/run/httpd/ssl_stapling(32768)
  &lt;VirtualHost *:443&gt;
   Header always set Strict-Transport-Security "max-age=15768000"
   SSLEngine on
   ServerName example.com.pl
   ServerAlias www.example.com.pl
   DocumentRoot /var/www/html/example.com.pl/public_html
   LogLevel debug
   ErrorLog /var/log/httpd/error.log
   CustomLog /var/log/httpd/access.log combined

 <code>   &lt;Directory /var/www/html/example.com.pl/public_html&gt;</code>
     <code>Options Indexes FollowSymLinks Includes IncludesNOEXEC SymLinksIfOwnerMatch                     </code>
     <code>AllowOverride All</code>
     <code>Require all granted</code>
     <code>DirectoryIndex index.php</code>
     <code>RewriteEngine On</code>
    <code>&lt;/Directory&gt;</code>

<code>Include /etc/letsencrypt/options-ssl-apache.conf</code>
<code>SSLUseStapling on</code>
<code>SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1</code>
<code>SSLCipherSuite HIGH:!aNULL:!MD5</code>
<code>SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AE$</code>
<code>SSLHonorCipherOrder on</code>
<code>SSLCompression off</code>
<code>SSLSessionTickets off</code>

    <code>&lt;FilesMatch "^\.ht"&gt;</code>
       <code>Require all denied</code>
    <code>&lt;/FilesMatch&gt;</code>

    <code>&lt;files readme.html&gt;</code>
       <code>order allow,deny</code>
       <code>deny from all</code>
    <code>&lt;/files&gt;</code>

SSLCertificateFile /etc/letsencrypt/live/example.com.pl/cert.pem
SSLCertificateKeyFile /etc/letsencrypt/live/example.com.pl/privkey.pem
SSLCertificateChainFile /etc/letsencrypt/live/example.com.pl/chain.pem

 &lt;/VirtualHost&gt;
&lt;/IfModule&gt;</pre>

#### Configuration of MyISAM engine in MariaDB instead of InnoDB.

In CentOS we edit the my.cnf file.

sudo vi /etc/my.cnf

Now basically it is enough to replace this file with what is shown below:

# This group is read both both by the client and the server use it for options that affect everything
 [mysqld]
 MyISAM Settings
 skip-innodb
 default-storage-engine           = MyISAM
 MyISAM Settings
 query_cache_limit               = 4M    # UPD - Option supported up to MySQL v5.7
 query_cache_size                = 4M   # UPD - Option supported up to MySQL v5.7
 query_cache_type                = 1     # Option supported up to MySQL v5.7
 key_buffer_size                 = 4M   # UPD
 low_priority_updates            = 1
 concurrent_insert               = 2
 Connection Settings
 max_connections                 = 10   # UPD
 back_log                        = 512
 thread_cache_size               = 100
 thread_stack                    = 192K
 interactive_timeout             = 20
 wait_timeout                    = 20
 Buffer Settings
 join_buffer_size                = 4M    # UPD
 read_buffer_size                = 3M    # UPD
 read_rnd_buffer_size            = 4M    # UPD
 sort_buffer_size                = 4M    # UPD
 table_definition_cache          = 400
 table_open_cache                = 58
 open_files_limit                = 116
 max_heap_table_size             = 64M
 tmp_table_size                  = 64M
 Search Settings
 ft_min_word_len                 = 3     # Minimum length of words to be indexed for search results
 Default settings
 [client-server]
 [mysqld_safe]
 log-error=/var/log/mariadb/error.log
 # include all files from the config directory
 !includedir /etc/my.cnf.d

Save changes, restart httpd/apache2 and mariadb.

sudo systemctl restart mariadb httpd

In the case of Ubuntu 16.04, the location of the file is slightly different.

sudo vi /etc/mysql/my.cnf

Just paste into this file what is in the [mysqld] section above. However, I recommend that you enable error logging to mariadb and set the error logging in my.cnf, as above it is visible.

sudo -i
cd /var/log/
mkdir mariadb
cd mariadb
touch error.log

#### PHP 7.3 installation &#8211; Ubuntu 16.04

sudo LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php7.3 php7.3-cli php7.3-common
sudo php -v
sudo apt-cache search php7.3
sudo apt install php-pear php7.3-curl php7.3-dev php7.3-gd php7.3-mbstring php7.3-zip php7.3-mysql php7.3-xml php7.3-fpm libapache2-mod-php7.3 php7.3-imagick php7.3-recode php7.3-tidy php7.3-xmlrpc php7.3-intl
sudo update-alternatives --set php /usr/bin/php7.3
sudo a2dismod php7.0
sudo a2enmod php7.3
sudo systemctl restart apache2

#### PHP 7.3 installation &#8211; CentOS 7.6

The assumption is that there is a user added to the wheel group (sudoers) at the very beginning of the tutorial. After sudo -i the user password is given, not root.

sudo -i
cd /tmp
wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
wget http://rpms.remirepo.net/enterprise/remi-release-7.rpm
rpm -Uvh remi-release-7.rpm epel-release-latest-7.noarch.rpm
yum install yum-utils
yum-config-manager --disable remi-php54
yum-config-manager --enable remi-php73
yum -y install php php-cli php-fpm php-mysqlnd php-zip php-devel php-gd php-mcrypt php-mbstring php-curl php-xml php-pear php-bcmath php-json php-mysql php-mysqlnd
yum update
php -v

#### Setting the memory limit in PHP

sudo find / -iname "php.ini"
For CentOS 7.6: sudo vi /etc/php.ini 
For Ubuntu 16.04: sudo vi /etc/php/7.3/apache2/php.ini
Set:
memory_limit = 10M

#### Apache optimization

sudo vi /etc/apache2/mods-enabled/mpm_prefork.conf # Ubuntu 
sudo vi /etc/httpd/conf/httpd.conf

Add this at the end of this file:

<pre class="wp-block-preformatted">HostnameLookups Off
MaxKeepAliveRequests 500
KeepAliveTimeout 5
KeepAlive Off
&lt;IfModule prefork.c&gt;
    StartServers        2    
    MinSpareServers     2
    MaxSpareServers     2
    MaxClients          50
    MaxRequestsPerChild 100
&lt;/IfModule&gt;</pre>

Save the file and exit.

#### Installation and configuration of iptables in CentOS 7.6

Turn off the firewalld:

sudo systemctl stop firewalld
sudo systemctl disable firewalld
sudo systemctl mask firewalld

Install iptables and turn it on.

sudo yum install iptables-services
sudo systemctl start iptables
sudo systemctl start iptables6
sudo systemctl enable iptables
sudo systemctl enable iptables6

Check the status of the iptables and the rules.

sudo systemctl status iptables
sudo systemctl status iptables6
sudo iptables -nvL
sudo iptables6 -nvL

Add rules for iptables.

sudo iptables -A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp -m tcp --dport 443 -j ACCEPT
sudo iptables -A OUTPUT -p tcp -m tcp --dport 443 -j ACCEPT

Save changes.

sudo service iptables save
sudo service ip6tables save
sudo systemctl restart iptables
sudo systemctl restart ip6tables

#### Installation and configuration of iptables in Ubuntu 16.04

sudo apt-get install iptables-persistent

During installation, it will ask you whether you want to keep the current rules and whether you want to use both IPv4 and IPv6. All these questions will be answered in the affirmative.

sudo systemctl start iptables
sudo systemctl start iptables6
sudo systemctl enable iptables
sudo systemctl enable iptables6

Add ports.

sudo iptables -A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp -m tcp --dport 443 -j ACCEPT
sudo iptables -A OUTPUT -p tcp -m tcp --dport 443 -j ACCEPT

Save changes and reload the service:

service netfilter-persistent save
service netfilter-persistent reload

Now go to https://example.com.pl and install WordPress.

I recommend installing Cloudflare plug-in and integrating it with the service after the installation.