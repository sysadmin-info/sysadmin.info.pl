---
title: Bash script that blocks web server (apache/nginx/litespeed) scanners.
date: 2021-02-22T20:11:29+00:00
description: Bash script that blocks web server (apache/nginx/litespeed) scanners.
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
    image: images/2021-thumbs/bash_script_that_blocks_web_server_scanners.webp
---
{{< youtube zgnijChQ45E >}}
<figcaption>Bash script that blocks web server (apache/nginx/litespeed) scanners</figcaption>

Bash script that blocks web server (apache/nginx/litespeed) scanners. It checks the 400-408 errors or any other in the log you will choose to scan and extracts IP addresses of scanners which are trying to scan a web server and adds IP addresses to the ipset which drops the connection.

```vim
#!/bin/bash

######################################################### Apache access_log ###################################################################
#Look for the file and if does not exist create it.
for x in /root/access_403.txt ; do
[ ! -f $x ] && touch $x;
done
################################################################################################################################################
# display the Apache log file and pass it to grep, grep all the lines not containing the word bot and pass it to grep, 
# grep all the lines not containing the word google and pass it to grep, 
# grep all the lines that contain the word " 403 " (spaces are specially inserted - see what the apache2 log looks like) and pass it to awk, 
# use awk to display the first column and pass it to awk, 
# use awk to display a regexp to extract IP addresses from the log file,
# use ip as the string that starts with the character listed above (something between 0 and 9) and display the string and pass it to sed, 
# use sed to remove any blank lines and pass it to uniq, 
# use uniq to show me how many times the IP address has been listed and pass it to awk, 
# use awk to select the first column and if it is 3 or more then display what is in column 2 and pass it to grep, 
# use grep to separate all this from /root/access_403.txt and the rest that is left should be put into /tmp/access_403.log
################################################################################################################################################
cat /var/log/httpd/access_log | grep -v bot | grep -v google | grep " 403 " | awk '{ print $1 }' | awk '{match($0,/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/); ip = substr($0,RSTART,RLENGTH); print ip}' | sed '/^$/d' | uniq -c | awk '$1>1{print $2}'| grep -F -x -v -f /root/access_403.txt > /tmp/access_403.log
################################################################################################################################################
# If file /tmp/ccess_403.log is not empty then add to file /root/ipaddresses.txt what is in file /tmp/access_403.log
# for IP which is in /tmp/access_403.log run a command that adds IP addresses from a file 
# and/or use commands to add each IP address to the ipset/firewalld ipset
################################################################################################################################################
if [ -s /tmp/access_403.log ]
then
cat /tmp/access_403.log >> /root/access_403.txt
#firewall-cmd --permanent --ipset=blacklist --add-entries-from-file=/tmp/access_403.log
for ip in $(cat /tmp/access_403.log); do /usr/sbin/ipset add blacklist $ip;done
for ip in $(cat /tmp/access_403.log); do firewall-cmd --permanent --ipset=blacklist --add-entry=$ip;done
#for ip in $(cat /tmp/access_403.log); do iptables -A INPUT -s $ip/32 -d 0/0 -j DROP; done
fi
# Delete the below file
rm -f /tmp/access_403.log
#echo "List of blocked IP addresses:" | cat /root/403.txt
######################################################### Apache error_log #####################################################################
for x in /root/error_403.txt ; do
[ ! -f $x ] && touch $x;
done
cat /var/log/httpd/error_log| grep " 403 " | awk '{ print $13 }' | awk '{match($0,/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/); ip = substr($0,RSTART,RLENGTH); print ip}' | sed '/^$/d' | uniq -c | awk '$1>0{print $2}'| grep -F -x -v -f /root/error_403.txt > /tmp/error_403.log
if [ -s /tmp/error_403.log ]
then
cat /tmp/error_403.log >> /root/error_403.txt
#firewall-cmd --permanent --ipset=blacklist --add-entries-from-file=/tmp/error_403.log
for ip in $(cat /tmp/error_403.log); do /usr/sbin/ipset add blacklist $ip;done
for ip in $(cat /tmp/error_403.log); do firewall-cmd --permanent --ipset=blacklist --add-entry=$ip;done
#for ip in $(cat /tmp/error_403.log); do iptables -A INPUT -s $ip/32 -d 0/0 -j DROP; done
fi
rm -f /tmp/error_403.log
#echo "List of blocked IP addresses:" | cat /root/403.txt
# Reload firewalld
firewall-cmd --reload
```