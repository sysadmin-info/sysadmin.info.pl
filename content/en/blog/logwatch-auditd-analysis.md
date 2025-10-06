---
title: logwatch auditd analysis
date: 2020-10-14T07:13:25+00:00
description: logwatch auditd analysis
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
    image: images/2020-thumbs/linux-cli.webp
---
Hello,

I'm trying to gather the knowledge related to logwatch, but there is a lot of learning to understand kernel error codes.

I will update this post with what I find and what I will learn. So far, I will try to present what I understand so far in a simple way.

For the analysis I will use auditd, which I described here: <https://sysadmin.info.pl/en/blog/selinux-security-policy/>

## Logwatch

Logwatch is the classic log file email utility that emails a daily status of activity from Linux logs. On CentOS, the default install of logwatch does not have many fancy features enabled. I will show you how to configure logwatch.

## Install Logwatch

Type in the terminal:

```bash
sudo yum install logwatch
```

Next, navigate to the logwatch services directory which is located as follows:

```bash
cd /usr/share/logwatch/default.conf/services
```

Here edit the following files:

```bash
sudo vi zz-disk_space.conf
```

Uncomment the lines as shown:

```vim
#New disk report options
#Uncomment this to show the home directory sizes
$show_home_dir_sizes = 1
$home_dir = "/home"

#Uncomment this to show the mail spool size
$show_mail_dir_sizes = 1
$mail_dir = "/var/spool/mail"

#Uncomment this to show the system directory sizes /opt /usr/ /var/log
$show_disk_usage = 1
```

Next, edit the following file:

```bash
sudo vi http.conf
```

Set the following to 1

```vim
# Set flag to 1 to enable ignore
# or set to 0 to disable
$HTTP_IGNORE_ERROR_HACKS = 1
```

Next, you may want to edit the email address that logwatch emails the report.

```bash
cd /usr/share/logwatch/default.conf/
sudo vi logwatch.conf
```

Change MailTo = to an email address as desired:

```vim
# Default person to mail reports to. Can be a local account or a
# complete email address. Variable Print should be set to No to
# enable mail feature.
#MailTo = admin
MailTo = admin@example.com
```

It is common practice to send root mail from all servers to a mailing list that all admins subscribe to. Once complete, you may run logwatch manually at the command line with no options to test:

```bash
sudo logwatch
```

Logwatch by default runs with daily cron jobs in /etc/cron.daily.  
Below is an example logwatch output:

```vim
############# Logwatch 7.4.0 (03/01/11)
Processing Initiated: Wed Oct 14 08:51:15 2020 Date Range Processed: yesterday ( 2020-Oct-13 ) Period is day. Detail Level of Output: 0 Type of Output/Format: stdout / text Logfiles for Host: mail.sysadmin.info.pl
##################################################################
--------------------- Kernel Audit Begin ------------------------
Unmatched Entries
type=1130 audit(1602620039.963:22736593): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-random-seed comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
type=1131 audit(1602620039.963:22736594): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-random-seed comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
type=1130 audit(1602620039.978:22736595): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=auditd comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
type=1131 audit(1602620039.978:22736596): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=auditd comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
type=1130 audit(1602620039.980:22736597): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-tmpfiles-setup comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
type=1131 audit(1602620039.980:22736598): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-tmpfiles-setup comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
type=1130 audit(1602620039.982:22736599): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=rhel-import-state comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
type=1131 audit(1602620039.982:22736600): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=rhel-import-state comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
type=1130 audit(1602620039.990:22736601): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=rhel-readonly comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
type=1130 audit(1602620054.305:22736607): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-remount-fs comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
type=1131 audit(1602620054.305:22736608): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-remount-fs comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
---------------------- Kernel Audit End -------------------------


--------------------- Clamav-milter Begin ------------------------
Unmatched Entries
+++ Started at Tue Oct 13 22:25:34 2020
: 1 Time(s)
ClamAV: mi_stop=1
: 1 Time(s)
---------------------- Clamav-milter End -------------------------


--------------------- Cron Begin ------------------------
Unmatched Entries
INFO (Shutting down)
INFO (RANDOM_DELAY will be scaled with factor 56% if used.)
---------------------- Cron End -------------------------


--------------------- httpd Begin ------------------------
A total of 15 sites probed the server
102.222.182.13
108.31.230.165
139.179.152.73
160.242.146.184
176.105.137.72
185.230.225.226
186.77.193.254
200.80.240.124
212.252.142.226
213.230.96.204
31.0.0.215
41.77.89.4
83.5.234.70
87.251.75.145
91.150.178.250
Requests with error response codes
400 Bad Request
/: 1 Time(s)
HTTP/1.0: 1 Time(s)
null: 1 Time(s)
403 Forbidden
/: 17 Time(s)
/.env: 2 Time(s)
/HNAP1/: 2 Time(s)
//MyAdmin/scripts/setup.php: 1 Time(s)
//myadmin/scripts/setup.php: 1 Time(s)
//phpMyAdmin/scripts/setup.php: 1 Time(s)
//phpmyadmin/scripts/setup.php: 1 Time(s)
//pma/scripts/setup.php: 1 Time(s)
/GponForm/diag_Form?images/: 1 Time(s)
/bag2: 1 Time(s)
/en/rhcsa-user-passwords-add-groups-and-users-to-groups/%5D: 1 Time(s)
/goform/webLogin: 1 Time(s)
/login/: 1 Time(s)
/muieblackcat: 1 Time(s)
/owa/auth/logon.aspx: 1 Time(s)
/pv/000000000000.cfg: 1 Time(s)
/solr/admin/info/system?wt=json: 1 Time(s)
HTTP/1.1: 1 Time(s)
404 Not Found
/sellers.json: 3 Time(s)
/tag/background/: 3 Time(s)
/css/album.css: 2 Time(s)
/tag/elementary-os/: 2 Time(s)
/tag/kevin-mitnick/: 2 Time(s)
/wp-content/plugins/wp-file-manager/lib/ph … tor.minimal.php: 2 Time(s)
/xxxss: 2 Time(s)
/?attachment_id=806: 1 Time(s)
/ads.txt: 1 Time(s)
/data/admin/allowurl.txt: 1 Time(s)
/e/admin/: 1 Time(s)
/wp/wp-login.php: 1 Time(s)
408 Request Timeout
null: 34 Time(s)
500 Internal Server Error
/en/category/rhcsa-en/: 1 Time(s)
503 Service Unavailable
/en/about-me: 1 Time(s)
/en/contact: 1 Time(s)
---------------------- httpd End -------------------------

--------------------- iptables firewall Begin ------------------------
Listed by source hosts:
Dropped 87 packets on interface eth0
From 1.4.179.147 - 6 packets to tcp(80)
From 18.162.124.176 - 1 packet to tcp(65143)
From 31.0.0.215 - 5 packets to tcp(443)
From 35.177.95.208 - 12 packets to tcp(8540,9617,23303,26527,29609,39086,43222,49478,53273,56460)
From 50.87.195.61 - 3 packets to tcp(10572,41624)
From 51.79.167.31 - 13 packets to tcp(443)
From 51.81.66.31 - 1 packet to tcp(48126)
From 62.113.227.26 - 1 packet to tcp(443)
From 69.12.68.194 - 1 packet to tcp(443)
From 95.217.235.142 - 1 packet to tcp(37591)
From 102.222.182.13 - 8 packets to tcp(443)
From 104.172.56.131 - 1 packet to tcp(5555)
From 109.42.113.125 - 1 packet to tcp(912)
From 122.225.78.4 - 1 packet to tcp(1433)
From 135.181.17.36 - 3 packets to tcp(33993,61005,64615)
From 173.252.107.5 - 1 packet to tcp(443)
From 176.105.137.72 - 22 packets to tcp(993)
From 185.167.96.138 - 2 packets to tcp(587)
From 185.167.97.229 - 1 packet to tcp(993)
From 192.99.86.56 - 1 packet to tcp(8325)
From 213.202.247.84 - 1 packet to tcp(16106)
From 217.23.4.104 - 1 packet to tcp(38334)
---------------------- iptables firewall End -------------------------


--------------------- SpamAssassin Begin ------------------------
Mail Recipients:
sa-milt : 1 clean, 0 spam
spamd : 1 clean, 0 spam
Summary:
Total Clean: 2 (100%)
Total Spam: 0 ( 0%)
Child-related errors
spamd: cannot send SIGINT to child process [_]: No such process: 2 Time(s)
---------------------- SpamAssassin End -------------------------


--------------------- Disk Space Begin ------------------------
Filesystem Size Used Avail Use% Mounted on
devtmpfs 1.9G 0 1.9G 0% /dev
/dev/vda2 40G 13G 28G 32% /
/dev/vda1 488M 148M 305M 33% /boot
---------------------- Disk Space End -------------------------
###################### Logwatch End #########################
```

## Logwatch log analysis

Look at the kernel section. In case of every error you have a specific type, e.g: 1130, 1131. You can find the error messages here: <a href="https://github.com/torvalds/linux/blob/master/include/uapi/linux/audit.h" target="_blank" rel="noreferrer noopener">https://github.com/torvalds/linux/blob/master/include/uapi/linux/audit.h</a> Thank you very much Linus Torvalds! The section which is important:

```vim
/* The netlink messages for the audit system is divided into blocks:
* 1000 - 1099 are for commanding the audit system
* 1100 - 1199 user space trusted application messages
* 1200 - 1299 messages internal to the audit daemon
* 1300 - 1399 audit event messages
* 1400 - 1499 SE Linux use
* 1500 - 1599 kernel LSPP events
* 1600 - 1699 kernel crypto events
* 1700 - 1799 kernel anomaly records
* 1800 - 1899 kernel integrity events
* 1900 - 1999 future kernel use
* 2000 is for otherwise unclassified kernel audit messages (legacy)
* 2001 - 2099 unused (kernel)
* 2100 - 2199 user space anomaly records
* 2200 - 2299 user space actions taken in response to anomalies
* 2300 - 2399 user space generated LSPP events
* 2400 - 2499 user space crypto events
* 2500 - 2999 future user space (maybe integrity labels and related events)
*
* Messages from 1000-1199 are bi-directional. 1200-1299 & 2100 - 2999 are
* exclusively user space. 1300-2099 is kernel --> user space
* communication.
*/
```

## Using auditd to perform an analysis of logwatch errors

At least now we know what we are dealing with. But that is not all. Look at auid=4294967295 as an example. You can use auditd to look for auid.

```bash
ausearch -x sudo -ua 4294967295
```

A small example what I have found:

```vim
time->Wed Oct 14 09:06:04 2020
type=CRED_REFR msg=audit(1602659164.991:369688): pid=24197 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:unconfined_service_t:s0 msg='op=PAM:setcred grantors=pam_env,pam_unix acct="root" exe="/usr/bin/sudo" hostname=? addr=? terminal=? res=success'

time->Wed Oct 14 09:06:05 2020
type=CRED_DISP msg=audit(1602659165.130:369689): pid=24197 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:unconfined_service_t:s0 msg='op=PAM:setcred grantors=pam_env,pam_unix acct="root" exe="/usr/bin/sudo" hostname=? addr=? terminal=? res=success'
```

This shows that I was using the sudo command. According to this:

```vim
* 1100 - 1199 user space trusted application messages
```

## References

* <a href="https://github.com/torvalds/linux/blob/master/include/uapi/linux/audit.h" target="_blank" rel="noreferrer noopener">https://github.com/torvalds/linux/blob/master/include/uapi/linux/audit.h</a>
* <a href="https://www.server-world.info/en/note?os=CentOS_8&p=audit&f=3" target="_blank" rel="noreferrer noopener">https://www.server-world.info/en/note?os=CentOS_8&p=audit&f=3</a>
* <a href="https://serverfault.com/questions/868689/what-exactly-do-these-kernel-audit-entries-in-logwatch-report-mean" target="_blank" rel="noreferrer noopener">https://serverfault.com/questions/868689/what-exactly-do-these-kernel-audit-entries-in-logwatch-report-mean</a>
