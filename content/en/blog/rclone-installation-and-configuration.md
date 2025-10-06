---
title: rclone – installation and configuration
date: 2019-09-26T20:30:45+00:00
description: rclone – installation and configuration
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
    image: images/2019-thumbs/rclone.webp
---
Hello,

I will use rclone from <a rel="noreferrer noopener" href="https://rclone.org" target="_blank">https://rclone to backup my backup.org</a> In this specific case I will use <a rel="noreferrer noopener" href="https://mega.nz" target="_blank">https://mega.nz</a> and the appropriate configuration to copy files from the server to mega.nz. If you don&#8217;t have an account there, you can create one. Good morning everyone gets 50 GB of space for free.

Please note that at the moment there is a problem with 2FA for mega. Trying to compile an application from the source code by following the instructions from this page <a rel="noreferrer noopener" target="_blank" href="https://github.com/meganz/MEGAsync">https://github.com/meganz/MEGAsync</a> ends in an error. This is due to a compiler error, which in this case has too little memory, 128 MB RAM, 170 MB swap and too little CPU resources to complete the compilation properly. Process cc1plus is killed (kill) and the compilation of Crypto++ fails.

We need curl

{{< tabs CentOS Ubuntu >}}
  {{< tab >}}
  ### CentOS
  ```bash
  sudo yum install curl
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian/Ubuntu
  ```bash
  sudo apt-get install curl
  ```
  or
  ```bash
  sudo apt install curl
  ```
  {{< /tab >}}
{{< /tabs >}}

Next, execute the following command:

```bash
curl https://rclone.org/install.sh | sudo bash
```

Log in with increased privileges as a sudoers user.

```bash
sudo -i
```

Run rclone configuration with a command:

```bash
rclone config
```

  * Create a configuration file with a connection to your mega.nz
  * Choose n as a new remote)
  * Create a friendly name, e.g. mega or remote.
  * Create an 18 item, i.e. type the digits 18.
  * Give your login and password to your account in mega.nz
  * Next, we select n, because we do not want an advanced configuration, which I will write about another time.
  * Confirm our configuration with the letter y.
  * A at the very end we select q to leave the configuration.

Check now that the configuration is working.

```bash
rclone lsd mega:
```

If everything went well, you will be logged in to our account. On mega you can manually create a folder called backup. Then you can manually copy files to this folder using the lower command:

```bash
rclone copy /home/user mega:backup
```

But why bother? You can write yourself a script.

```bash
cd /home/user
vi backup.sh
```

Press the insert on the keyboard (ins) and paste the following content:

```vim
#!/bin/bash
 TIME=date +%b-%d-%y
 FILENAME=backup-bin-$TIME.tar.gz
 SRCDIR=/bin
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-bin-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-bin-$TIME.tar.gz
 FILENAME=backup-boot-$TIME.tar.gz
 SRCDIR=/boot
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-boot-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-boot-$TIME.tar.gz
 FILENAME=backup-dev-$TIME.tar.gz
 SRCDIR=/dev
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-dev-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-dev-$TIME.tar.gz
 FILENAME=backup-etc-$TIME.tar.gz
 SRCDIR=/etc
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-etc-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-etc-$TIME.tar.gz
 FILENAME=backup-home-$TIME.tar.gz
 SRCDIR=/home
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-home-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-home-$TIME.tar.gz
 FILENAME=backup-lib-$TIME.tar.gz
 SRCDIR=/lib
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-lib-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-lib-$TIME.tar.gz
 FILENAME=backup-lib64-$TIME.tar.gz
 SRCDIR=/lib64
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-lib64-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-lib64-$TIME.tar.gz!/bin/bash
 FILENAME=backup-lost+found-$TIME.tar.gz
 SRCDIR=/lost+found
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-lost+found-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-lost+found-$TIME.tar.gz
 FILENAME=backup-media-$TIME.tar.gz
 SRCDIR=/media
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-media-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-media-$TIME.tar.gz
 FILENAME=backup-mnt-$TIME.tar.gz
 SRCDIR=/mnt
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-mnt-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-mnt-$TIME.tar.gz
 FILENAME=backup-opt-$TIME.tar.gz
 SRCDIR=/opt
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-opt-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-opt-$TIME.tar.gz
 FILENAME=backup-reboot-$TIME.tar.gz
 SRCDIR=/reboot
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-reboot-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-reboot-$TIME.tar.gz
 FILENAME=backup-root-$TIME.tar.gz
 SRCDIR=/root
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-root-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-root-$TIME.tar.gz
 FILENAME=backup-run-$TIME.tar.gz
 SRCDIR=/run
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-run-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-run-$TIME.tar.gz
 FILENAME=backup-sbin-$TIME.tar.gz
 SRCDIR=/sbin
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-sbin-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-sbin-$TIME.tar.gz
 FILENAME=backup-srv-$TIME.tar.gz
 SRCDIR=/srv
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-srv-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-srv-$TIME.tar.gz
 FILENAME=backup-tmp-$TIME.tar.gz
 SRCDIR=/tmp
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-tmp-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-tmp-$TIME.tar.gz
 FILENAME=backup-usr-$TIME.tar.gz
 SRCDIR=/usr
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-usr-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-usr-$TIME.tar.gz
 FILENAME=backup-var-$TIME.tar.gz
 SRCDIR=/var
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-var-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-var-$TIME.tar.gz</pre>
```

Press Esc, type in :x and press Enter.

In order for a script to be executable, it must be given appropriate permissions.

```bash
chmod +x backup.sh
```

Now you can execute the script manually:

```bash
./backup.sh
```

If you want to automate this fairly lengthy process, add a task to the cron that will execute this script for you.If you want to automate this fairly lengthy process, add a task to the cron that will execute this script for you.If you want to automate this fairly lengthy process, add a task to the cron that will execute this script for you.

```bash
crontab -e
```

Press the insert (ins) and paste it:

```bash
00 04 * * * /bin/bash /home/user/backup.sh
```

Press Esc, enter :x and press Enter.  

The script will be executed at 4 a.m. every 24 hours.

Explanation:

```vim
#!/bin/bash
# shebang, meaning that the script will be executed by a particular 
interpreter, here bash.

TIME=date +%b-%%d-%d-%y 
# A variable that adds the current date

FILENAME=backup-bin-$TIME.tar.gz 
# File name after packing

SRCDIR=/bin
# The directory you want to copy

DESDIR=/home/user/backup
# The target directory to which the data is copied

tar -cvpzf $DESDIR/$FILENAME $SRCDIR
# Compressing the catalog

rclone copy /home/user/backup/backup-bin-$TIME.tar.gz mega:backup 
# copying directory to mega.nz

rm -Rf /home/user/backup/backup-bin-$TIME.tar.gz
# Removing the compressed file from the server
```

**Finally, I&#8217;d like to make a final comment. The proc and sys directories will not allow you to make a copy, because they have files that are in use by the server, and more specifically by its processes.**