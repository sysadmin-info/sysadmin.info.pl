---
title: How to Enable Full Strict Encryption in Cloudflare Using Let's Encrypt
date: 2020-10-03T15:58:03+00:00
description: How to Enable Full Strict Encryption in Cloudflare Using Let's Encrypt
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
- mikr.us
- Linux
cover:
    image: images/2020-thumbs/cloudflare.webp
---

The basic installation and configuration of Cloudflare are described here: [Installation of a Web Server on mikr.us Using MariaDB and MyISAM Engine](https://sysadmin.info.pl/pl/blog/instalacja-serwera-web-na-mikr-us-z-uzyciem-mariadb-i-silnikiem-myisam/)

In this tutorial, we will focus on configuring a full strict connection between your server and Cloudflare.

For the purposes of this tutorial and initial testing, you should first disable the orange cloud icon (click on it) in the DNS section of your domain on Cloudflare so that it becomes gray, and save the changes using the save button. This way, you can verify whether the Let's Encrypt certificate has been correctly installed, and every browser shows that your website is using SSL and a certificate from Let's Encrypt.

![Cloudflare DNS Management](/images/2020/Cloudflare_DNS_Management.webp "Cloudflare DNS Management")
<figcaption>Cloudflare DNS Management</figcaption>

Instead of an A record for www, you can have a CNAME record. I simply have a vhost on www that does a redirect. Instead of the domain name, you can use the @ symbol in the target field.

![CNAME](/images/2020/CNAME.webp "CNAME")
<figcaption>CNAME</figcaption>

You need to click on the padlock icon next to the website address in the address bar and select the option to show the certificate. Yes, I know, these are basics, but this is how you can check it.

![Let's Encrypt Certificate](/images/2020/Lets_Encrypt_Certyfikat.webp "Let's Encrypt Certificate")
<figcaption>Let's Encrypt Certificate</figcaption>

If the website shows that it has a Let's Encrypt certificate, that's great.

Now, let's proceed with the actual configuration.

You need to log in to your server via SSH and navigate to the /etc/letsencrypt/csr directory, then list the contents of the directory.

```bash
cd /etc/letsencrypt/csr
ls
```

You will see a list of files like the example below. Certbot assigns consecutive numbers when refreshing the certificate for the site.

```vim
0000_csr-certbot.pem
0001_csr-certbot.pem
0002_csr-certbot.pem
```

You can check which file has the latest date using the `ll` command (two letter "l"s). Logically, it will be the one with the highest number. Display its contents using the `cat` command.

Or you can check it with this command:

```bash
ls -alhtr
```

```bash
cat 0002_csr-certbot.pem
```

Copy the entire contents of this file, including the lines "begin certificate request" and "end certificate request."

Go to the SSL/TLS -> Origin server section on Cloudflare.

Click the "create certificate" button, select that you have your own certificate ("I have my own private key and CSR"). Paste the previously copied pem file content into the field labeled "paste certificate signing request" and set the certificate validity to 90 days, as Let's Encrypt provides the same duration.

It's best to copy and paste this CSR pem file in the Cloudflare section immediately after generating the SSL certificate for your site using Certbot.

After pasting the content, click "next." Cloudflare will generate the private key.

Copy the content of this private key and paste it, for example, into the file /etc/pki/tls/certs/origin-pull-ca.pem.

```bash
sudo vi /etc/pki/tls/certs/origin-pull-ca.pem
```

Click "insert" and right-click to paste the previously copied content from the clipboard.

Then press "Esc" on the keyboard and type `:wq` to save the file and exit the terminal.

Next, execute the following commands to set the file owner as root and give it the appropriate permissions.

```bash
sudo chown root:root /etc/pki/tls/certs/origin-pull-ca.pem
sudo chmod 644 /etc/pki/tls/certs/origin-pull-ca.pem
```

In Cloudflare, leave the domains as proposed.

In the SSL/TLS -> Origin server section, there is an option for "Authenticated Origin Pulls"; you must enable it by sliding the switch to the "On" position.

We have one last matter to address.

I will describe my case for CentOS 7 and Apache, but there is also documentation for Nginx available here:

[Authenticated Origin Pulls - Cloudflare Support](https://support.cloudflare.com/hc/en-us/articles/204899617-Authenticated-Origin-Pulls)

In CentOS, you need to go to the directory: /etc/httpd/conf.d and edit the ssl.conf file.

```bash
sudo vi /etc/httpd/conf.d/ssl.conf
```

Set the values as provided in the above Cloudflare address. Remove the hash and change 10 to 1 for the SSLVerifyDepth option. Set the value to "require" for the SSLVerifyClient option. Then provide the path to the private key file generated by Cloudflare for the SSLCACertificateFile option.

It should look like this, for example:

```vim
SSLVerifyClient require
SSLVerifyDepth 1
SSLCACertificateFile /etc/pki/tls/certs/origin-pull-ca.pem
```

After saving the changes in this file, restart the Apache/Nginx service using the following command:

```bash
sudo systemctl restart httpd
```

Then in the DNS section, enable the orange cloud icon and set encryption to "full strict" in the SSL/TLS section. This way, encryption has been enabled between the Cloudflare server and yours.

The only problem is repeating this operation every 90 days when Certbot refreshes the Let's Encrypt certificate.

The second option is with Cloudflare. You generate a certificate from Cloudflare, but then you use their pem file. You need to place the private and public key in that SSL file I mentioned earlier. I know it's a bit complicated. But the plus side is that you have a certificate for 15 years for communication between the Cloudflare server and yours. If you want me to describe the second method in detail, let me know.

Useful links:

* [Let's Encrypt and Cloudflare - How to Set](https://community.cloudflare.com/t/lets-encrypt-and-cloudflare-how-to-set/66442/2)
* [Authenticated Origin Pulls - Cloudflare Support](https://support.cloudflare.com/hc/en-us/articles/204899617-Authenticated-Origin-Pulls)
* [Apache Cloudflare Authenticated Origin Pulls Configuration](https://www.leowkahman.com/2016/03/10/apache-cloudflare-authenticated-origin-pulls-configuration/)