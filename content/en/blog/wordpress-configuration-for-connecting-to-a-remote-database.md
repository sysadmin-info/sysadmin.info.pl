---
title: WordPress configuration for connecting to a remote database
date: 2019-09-22T17:34:27+00:00
description: WordPress configuration for connecting to a remote database
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
- WordPress
cover:
    image: images/2019-thumbs/wp.webp
---
Hello,

I will describe here step by step configuration of WordPress in configuration of two servers. These can be physical servers, or installed on virtual machines, either using VirtualBox or HyperV.

Usually we encounter these configurations above, of course there are also other solutions, such as in the case of the hosting service provider, which has a database elsewhere, and in another location keeps a directory on the files of the website, but I will deal with the classic case, when we distinguish between two different servers.

Why such a solution? For a simple reason &#8211; security. There is no external access to the database server, i.e. from the Internet. It is in favour of the so-called NAT.

I will describe the solution that I implemented at home on two laptops, which serve as servers at home for my own learning purposes.

Have you reached this place? Great! Let&#8217;s get started.

  1. Database server &#8211; CentOS 7.6
  2. Web serwer &#8211; Debian 9.8.0 or CentOS, Red Hat, Fedora

  * _Database server_: Server with CentOS, on which the database is installed.
  * _Web server_: Server with Debian, on which the WordPress is installed.
  * `wordpress`: database name.
  * `user`: User – WordPress database client
  * `database_user_password`: SQL database user&#8217;s password for WordPress.
  * `192.168.0.11`: Private IP address of the database server.
  * `192.168.0.10`: Private IP address of the web server.
  * `example_user`: Local user with sudo privileges, who is not a root.
  * `190.100.100.90/example.com`: Public IP address of the server or full qualified domain name (FQDN).

### Install the MariaDB 10.3 database server on CentOS with the command:

```bash
sudo nano /etc/yum.repos.d/MariaDB.repo
```

If you don&#8217;t have nano, install it with a command. Use is easier than vi. Sorry old sysops, I know it can make you angry. I can use vi and vim, but nano is much easier for beginners. 

```bash
sudo yum install nano
```

Insert this into MariaDB repo file:

```bash
# MariaDB 10.3 CentOS repository list - created 2019-03-02 11:00 UTC
# http://downloads.mariadb.org/mariadb/repositories/
[mariadb]
name = MariaDB
baseurl = http://yum.mariadb.org/10.3/centos7-amd64
gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB
gpgcheck=1
```

Press ctrl+o to save. Press ctrl+x to exit nano.

Install the MariaDB server and the client:

```bash
sudo yum install MariaDB-server MariaDB-client
```

Start the MariaDB server:

```bash
sudo systemctl start mariadb
```

Turn on the MariaDB server permanently:

```bash
sudo systemctl enable mariadb
```

Check the status of the MariaDB service :

```bash
sudo systemctl enable mariadb 
```

Run MariaDB support with a command, because you do not have a root database user password. 

```bash
sudo mysql -u root 
```

After logging in, set your root password to MariaDB with a command: 

```bash
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY 'your_password'; Enter
FLUSH PRIVILEGES; Enter
exit; 
```

Enter

Log in to MariaDB with earlier pre-determined password: 

```bash
mysql -u root -p
```

Type your password for a root user to access a MariaDB.

Check the status of the MariaDB

```bash
status;
```

Enter

Exit MariaDB

```bash
exit; 
```

Enter

Perform the following command: 

```bash
mysql_secure_installation 
```

You will see the following window in which you answer the question about changing the root password with the letter n, because it was set in advance. The remaining items are confirmed with the capital letter Y. <figure class="wp-block-image">

![MariaDB aka old MySQL configuration](/images/2019/2019-03-02-12_16_25-Start.webp "MariaDB aka old MySQL configuration")
<figcaption>MariaDB aka old MySQL configuration</figcaption>


The firewall is installed by default in CentOS. Check if it is enabled. 

```bash
firewall-cmd --state
```

Listing ports and firewall services:

```bash
firewall-cmd --list-all 
```

Add mysql service and port:

```bash
firewall-cmd --permanent --add-service=mysql 
firewall-cmd --permanent --add-port=3306/tcp
```

Restart the firewall.

```bash
firewall-cmd --reload 
```

Delete a service or port. This is not needed at this point, but it may come in handy someday. Port 3306 is used by MariaDB and MySQL. If you want to add this port instead of a service, which can sometimes be a solution, replace &#8222;add&#8221; with &#8222;remove&#8221; as shown below.

```bash
firewall-cmd --permanent --remove-port=3306/tcp
firewall-cmd --permanent --remove-service=mysql 
```

Log into Maria DB.

```bash
sudo mysql -u root -p 
```

Execute the following command to add a database named wordpress.

```bash
CREATE DATABASE wordpress;
```

Follow the command to create a user who will use this database. It should not be a root user for security reasons.

```bash
CREATE USER 'user'@'localhost' IDENTIFIED BY 'database_user_password'; 
```

Assign privileges to a user.

```bash
GRANT ALL PRIVILEGES ON wordpress.* TO 'user'@'localhost'; 
```

Create a user and assign remote access rights to the wordpress database to the user. The IP address is the local IP address of the web server where WordPress is located. The password is the same as the password of the user created above. 

```bash
CREATE USER 'user'@'192.168.0.10' IDENTIFIED BY 'database_user_password';
GRANT ALL PRIVILEGES ON wordpress.* TO 'user'@'192.168.0.10'; 
```

Then perform below commands:

```bash
FLUSH PRIVILEGES;
exit;
```

Check if you are able to log in with the created user: 

```bash
mysql -u user -p
```

Type user&#8217;s password.

Then check the status:

```bash
status;
exit;
```

### On a Debian web server, run the following command: 

```bash
sudo apt update
sudo apt install mariadb-client php-mysql 
```

Check if you can log in with the following command: 

```bash
mysql -u user -h 192.168.0.11 -p
```

Check MariaDB status:

```bash
status;
```

Close the connection by leaving MariaDB.

```bash
exit;
```

#### WordPress installation

Create a directory named src in your site directory to store new copies of WordPress source files. This guide uses the home directory /var/wwww/html/example.com/ as an example. Go to this new directory: 

```bash
sudo mkdir -p /var/www/html/example.com/src/
cd /var/www/html/example.com/src/ 
```

Set the user of the web server, www-data, as the owner of the home directory of your website. www-data is a group.

```bash
sudo chown -R www-data:www-data /var/www/html/example.com/ 
```

Install the latest version of WordPress and extract it:

```bash
sudo wget http://wordpress.org/latest.tar.gz
sudo -u www-data tar -xvf latest.tar.gz 
```

Rename the latest.tar.gz file to wordpress, then set the backup date for the original source files. This will be useful if you install new versions in the future and need to return to the previous version:

```bash
sudo mv latest.tar.gz wordpress-`date "+%Y-%m-%d"`.tar.gz 
```

Create the public\_html directory, which will be the WordPress root directory. Move the WordPress files to the public\_html folder: 

```bash
sudo mkdir -p /var/www/html/example.com/public_html/
sudo mv wordpress/* ../public_html/ 
```

Give the public_html folder permissions for the www-data group: 

```bash
sudo chown -R www-data:www-data /var/www/html/example.com/public_html 
```

Go to the directory where WordPress was extracted, copy the sample configuration and set it to use the remote database: 

```bash
cd /var/www/html/example.com/public_html
sudo cp wp-config-sample.php wp-config.php 
```

Change the login variables to match the database and the user. Replace 192.168.0.11 with a private IP address for the database server. Edit the file: /var/wwww/html/example.com/public_html/wp-config.php 

```bash
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'user');

/** MySQL database password */
define('DB_PASSWORD', 'haslo_użytkownika_bazy_danych');

/** MySQL hostname */
define('DB_HOST', '192.168.0.11'); 
```

Add security keys to protect your wp-admin. Use <a rel="noreferrer noopener" href="https://api.wordpress.org/secret-key/1.1/salt/" target="_blank">WordPress Security Key Generator</a> to create random, complex hashes that WordPress will use to encrypt your login data. Copy the result and replace the corresponding section in the wp-config.php file: 

```bash
/**#@+
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
/**#@-*/ 
```

#### Security of traffic to and from the WordPress database using SSL

By default, CentOS has created a directory with certificates and no directory needs to be created. You can enter it: 

```bash
cd /etc/pki/tls/certs/ 
```

Generate a certification authority key and create a certificate and a private key. Response to appropriate prompts. The key in this example expires in 100 years. Change the days of 36500 days in this and the following steps to set certificates to expire if necessary: 

```bash
sudo openssl genrsa 4096 > ca-key.pem
sudo openssl req -new -x509 -nodes -days 36500 -key ca-key.pem -out cacert.pem 
```

Common Name set as: MariaDB

Create a server certificate and save the RSA key. The common name should be the FQDN name or IP address of your web server. In this case, 190.100.100.90

```bash
sudo openssl req -newkey rsa:4096 -days 36500 -nodes -keyout server-key.pem -out server-req.pem
sudo openssl rsa -in server-key.pem -out server-key.pem 
```

Sign the certificate:

```bash
sudo openssl x509 -req -in server-req.pem -days 36500 -CA cacert.pem -CAkey ca-key.pem -set_serial 01 -out server-cert.pem 
```

Move the keys and certificate to a permanent location: 

```bash
mv *.* /etc/pki/tls/certs/ && cd /etc/pki/tls/certs/ 
```

Generate a client key. Answer the appropriate prompts and set the common name to FQDN or the IP address of your web server: 190.100.100.90

```bash
sudo openssl req -newkey rsa:2048 -days 36500 -nodes -keyout client-key.pem -out client-req.pem 
```
Save it as an RSA key. 

```bash
sudo openssl rsa -in client-key.pem -out client-key.pem 
```

Sign the customer&#8217;s certificate.

```bash
sudo openssl x509 -req -in client-req.pem -days 36500 -CA cacert.pem -CAkey ca-key.pem -set_serial 01 -out client-cert.pem
```

Verify certificates .

```bash
openssl verify -CAfile cacert.pem server-cert.pem client-cert.pem 
```

It should display OK next to both.

Edit server.cnf file to CentOS 

```bash
sudo nano /etc/my.cnf.d/server.cnf 
```

Add in the [mysqld] section: 

```bash
ssl-ca=/etc/pki/tls/certs/cacert.pem
ssl-cert=/etc/pki/tls/certs/server-cert.pem
ssl-key=/etc/pki/tls/private/server-key.pem
ssl-cipher=ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK 
```

Find the commented #bind-address line, delete # , which will cause uncommentation and set as below. Of course, change the IP address to the local IP address of the CentOS server where the MariaDB database is installed. 

```bash
bind-address    = 192.168.0.11  
```

Press ctrl+o, then ctrl+x 

Move the server-key file to the private folder 

```bash
mv /etc/pki/tls/certs/server-key.pem /etc/pki/tls/private/ 
```

Log in to MariaDB and require SSL protocol for all logins to the database. Replace 192.168.0.10 with a private IP address. 

```bash
sudo mysql -u root -p
```
```bash
GRANT ALL PRIVILEGES ON wordpress.* TO 'user'@'192.168.0.10' REQUIRE SSL;
FLUSH PRIVILEGES;
exit;
```

Restart the MariaDB server: 

```bash
sudo systemctl restart mysql 
```

Copy certificates and the key to the web server. Replace example_user user with WWW server user and 192.168.0.10 with private IP address of WWW server: 

```bash
scp cacert.pem client-cert.pem client-key.pem example_user@192.168.0.10:~/certs 
```

Create a directory on your web server and transfer the certificates and key to /etc/mysql/ssl: 

```bash
sudo mkdir /etc/mysql/ssl && sudo mv ~/certs/*.* /etc/mysql/ssl 
```

If the /etc/mysql/ssl directory already exists, execute the command itself with &&& tags. 

Configure the MariaDB client of your web server to use SSL. Find the [mysql] section in the 50-mysql-clients.cnf file and add locations for certificates and keys: 

```bash
sudo nano /etc/mysql/mariadb.conf.d/50-mysql-clients.cnf 
```

Paste the following content in the [mysql] section :

```bash
ssl-ca=/etc/mysql/ssl/cacert.pem
ssl-cert=/etc/mysql/ssl/client-cert.pem
ssl-key=/etc/mysql/ssl/client-key.pem 
```

In case you have two servers based on Red Hat, CentOS, or Fedora, edit the file mysql-clients.cnf 

```bash
sudo nano /etc/my.cnf.d/mysql-clients.cnf 
```
paste the following content into the [mysql] section of this page 

```bash
ssl-ca=/etc/mysql/ssl/cacert.pem
ssl-cert=/etc/mysql/ssl/client-cert.pem
ssl-key=/etc/mysql/ssl/client-key.pem 
```

Log in from the Debian web server to the CentOS MariaDB database server using the following command: 

```bash
mysql -u user -h 192.168.0.11 -p 
```

If it connects, the MariaDB prompt is displayed. Type the command: 

```bash
status;
exit;
```

Add a directive before the remote database in wp-config, which forces WordPress to use SSL to connect to the database: 

```bash
...
define( 'MYSQL_CLIENT_FLAGS', MYSQLI_CLIENT_SSL );

/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'user');

/** MySQL database password */
define('DB_PASSWORD', 'haslo_użytkownika_bazy_danych');

/** MySQL hostname */
define('DB_HOST', '192.168.0.11');
... 
```

Access the WordPress installation interface via wp-admin. Use your browser to go to example.com/wp-admin. If the database connection is successful, you will see the installation screen: <figure class="wp-block-image">

![WordPress installation](/images/2019/remote-db-wp-installation-956x1024.webp "WordPress installation")
<figcaption>WordPress installation</figcaption>
