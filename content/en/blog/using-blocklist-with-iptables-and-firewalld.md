---
title: Using blocklist with iptables and firewalld
date: 2020-10-04T10:09:30+00:00
description: If you have any kind of server connected to the Internet, you are no
  doubt aware that no matter how small or unimportant it might seem, it is frequently
  probed, tested or subject to various attempts at abuse.
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
    image: images/2020-thumbs/firewall.webp
---
If you have any kind of server connected to the Internet, you are no doubt aware that no matter how small or unimportant it might seem, it is frequently probed, tested or subject to various attempts at abuse. These attacks come from so many malicious hosts that it is impossible to keep track by hand. So I started looking for a way to implement an automated blocklist to use with iptables and firewalld which I use on my servers.

### ipset

There are good solutions to detect and block hosts that are attacking your Linux system, such as <a href="http://denyhosts.sourceforge.net/" target="_blank" rel="noreferrer noopener">denyhosts</a> or [fail2ban][1] and I highly recommend you implement one of them depending on your needs. However, if hosts are known to be malicious in the security community, it is much more elegant to catch them at the front door, _before_ they connect to your services. This is where a blocklist of known malicious hosts comes in.

Of course I wasn’t the first to have considered using blocklists with iptables. Many commercial firewall solutions distribute updates frequently, adding detection signatures and blocklist information. Someone must have done something similar with iptables and firewalld, I thought. And indeed, a few moments spent searching online, revealed a good deal of questions and some good answers too. One method that I particularly liked, was the use of <a href="http://ipset.netfilter.org/" target="_blank" rel="noreferrer noopener">ipset</a> to administer large lists of IP addresses inside the kernel, eliminating the need for thousands upon thousands of iptables or firewalld rules. This sounded exactly like what I wanted achieve. Now all I needed was a good blocklist.

### Creating the blocklist

A bit more searching lead me to the site beris.nl, which had both a shell script to create an extensive blocklist and a way to feed it to ipset, so iptables or firewalld could use the list. I am reproducing this script in full below, should the original ever disappear. I take no credit for writing this script which has been modified by me a little bit, just because wizcrafts list does not work anymore. I decided to use badips.com list instead.

I installed the ipset. Then created the directory in /opt called blocklist and created a file called blocklist.sh where I put the content of the script published below.

```bash
sudo yum install ipset
cd /opt
sudo mkdir blocklist
sudo vi blocklist.sh
```

Press insert in vi editor, then copy the script below and put with the right button of the mouse into the vi editor. Then press Esc button on the keyboard, type :x and hit Enter.

```vim
#!/bin/bash
exec 3>&1 4>&2
trap 'exec 2>&4 1>&3' 0 1 2 3
exec 1>log.out 2>&1
set -x
# Everything below will go to the file 'log.out':
source pid.sh
IP_TMP=/tmp/ip.tmp
IP_BLOCKLIST=/etc/ip-blocklist.conf
IP_BLOCKLIST_TMP=/tmp/ip-blocklist.tmp
IP_BLOCKLIST_CUSTOM=/etc/ip-blocklist-custom.conf # optional
BLACKLISTS=(
"http://www.projecthoneypot.org/list_of_ips.php?t=d&rss=1" # Project Honey Pot Directory of Dictionary Attacker IPs
"http://check.torproject.org/cgi-bin/TorBulkExitList.py?ip=1.1.1.1" # TOR Exit Nodes
"http://www.maxmind.com/en/anonymous_proxies" # MaxMind GeoIP Anonymous Proxies
"https://www.maxmind.com/en/high-risk-ip-sample-list" # MaxMind High Risk Sample List
"http://danger.rulez.sk/projects/bruteforceblocker/blist.php" # BruteForceBlocker IP List
"https://rules.emergingthreats.net/blockrules/compromised-ips.txt" # Emerging Threats - Russian Business Networks List
"http://www.spamhaus.org/drop/drop.lasso" # Spamhaus Don't Route Or Peer List (DROP)
"http://cinsscore.com/list/ci-badguys.txt" # C.I. Army Malicious IP List
"http://www.autoshun.org/files/shunlist.csv" # Autoshun Shun List
"http://lists.blocklist.de/lists/all.txt" # blocklist.de fail2ban reporting service
"https://fx.vc-mp.eu/shared/iplist.txt" # ferex badlist
"https://feodotracker.abuse.ch/downloads/ipblocklist_aggressive.txt" # FEODO tracker
"https://reputation.alienvault.com/reputation.generic" # ALIENVAULT REPUTATION
"http://www.darklist.de/raw.php" # DARKLIST DE
"http://osint.bambenekconsulting.com/feeds/c2-dommasterlist-high.txt"
"http://osint.bambenekconsulting.com/feeds/c2-dommasterlist.txt"
"http://osint.bambenekconsulting.com/feeds/c2-ipmasterlist-high.txt"
"http://osint.bambenekconsulting.com/feeds/c2-ipmasterlist.txt"
"http://osint.bambenekconsulting.com/feeds/c2-masterlist.txt"
"http://osint.bambenekconsulting.com/feeds/dga-feed.txt"
"https://www.binarydefense.com/banlist.txt" # Binary Defense Systems
"https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt" # https://github.com/stamparm/ipsum
"http://sblam.com/blacklist.txt" # SBLAM
"http://blocklist.greensnow.co/greensnow.txt"
"http://charles.the-haleys.org/ssh_dico_attack_hdeny_format.php/hostsdeny.txt"
"https://www.malwaredomainlist.com/hostslist/ip.txt"
"https://www.stopforumspam.com/downloads/toxic_ip_cidr.txt"
)
for i in "${BLOCKLISTS[@]}"
do
curl "$i" > $IP_TMP
grep -Po '(?:\d{1,3}.){3}\d{1,3}(?:/\d{1,2})?' $IP_TMP >> $IP_BLOCKLIST_TMP
done

#Get the iblocklist 
wget -qO- http://list.iblocklist.com/?list=erqajhwrxiuvjxqrrwfj&fileformat=p2p&archiveformat=gz > $_input || { echo "$0: Unable to download ip list."; exit 1; }

#Consolidate iblocklist into master list
cat $_input >> $IP_BLOCKLIST_TMP

#Consolidate the shodan.io IP addresses database
cat /opt/blocklist/shodan.txt >> $IP_BLOCKLIST_TMP

#Sort the list
sort $IP_BLOCKLIST_TMP -n | uniq > $IP_BLOCKLIST

#Remove temporary list
rm $IP_BLOCKLIST_TMP

#count how many IP addresses are in the list
wc -l $IP_BLOCKLIST

#Flush the ipset
/usr/sbin/ipset flush blocklist

#Add IP addresses to the ipset
grep -v "^#|^$" $IP_BLOCKLIST | while IFS= read -r ip;
do
    /usr/sbin/ipset add blocklist $ip;
done

### Section for firewalld
firewall-cmd --delete-ipset=blocklist --permanent
firewall-cmd --permanent --new-ipset=blocklist --type=hash:net --option=family=inet --option=hashsize=1048576 --option=maxelem=1048576
firewall-cmd --permanent --ipset=blocklist --add-entries-from-file=/etc/ip-blocklist.conf
firewall-cmd --reload
echo "Firewalld ipset list entries:"
firewall-cmd --permanent --ipset=blocklist --get-entries | wc -l
echo "ipset list entries:"
cat /etc/ip-blocklist.conf | wc -l
```

### Bash script Explanation

```bash
exec 3>&1 4>&2
```

Saves file descriptors so they can be restored to whatever they were before redirection or used themselves to output to whatever they were before the following redirect.

```bash
trap 'exec 2>&4 1>&3' 0 1 2 3
```

Restore file descriptors for particular signals. Not generally necessary since they should be restored when the sub-shell exits.

```bash
exec 1>log.out 2>&1
```

Redirect stdout to file log.out then redirect stderr to stdout. Note that the order is important when you want them going to the same file. stdout must be redirected before stderr is redirected to stdout.

```bash
set -ex
```

if it should exit upon error.

Now you can put the script in /opt/blocklist directory and run the script in the background.

```bash
nohup ./blacklist.sh &&gt;/dev/null &
```

If you want to see the progress just type:

```bash
tail -f log.out
```

To break use ctrl+c

To check is the job running type

```bash
sudo jobs
```

or

```bash
bg
```

to see it is running in the background.

Basically what this script does, is download lists of IP netblocks and IP addresses from various sites hosting such lists and a shodan.io local txt file (you can prepare more than one local bad IPs database), strip out everything that isn’t an IP netblock or address and then put all those lines in a single text file. This results in a file containing thousands of lines (at the moment well over 100.000 IP addresses). It would be impossible to manage this by hand. If you set this script to run once per day from your crontab, you’ll have a fairly up to date list of malicious hosts. Please refrain from running this script too often, since the websites where the various source lists are hosted, need to pay for this traffic. Updating too often will probably get you banned. At the very bottom, the ipset is flushed and the new list added line by line to the blocklist.

I have found in the internet one website, which contains a list of IPs databases and domains. Please note, that some of these websites are not updated or they have been disabled, hacked, deleted etc. However still a huge part of them is working, and this is a good source, where we can start: <a href="http://www.covert.io/threat-intelligence/" target="_blank" rel="noreferrer noopener">http://www.covert.io/threat-intelligence/</a> to add more resources to this script, what is quite easy, or prepare manually our own databases in txt format as I did in shodan.io case.

#### Shodan.io IP addresses

```vim
93.120.27.62
85.25.43.94
85.25.103.50
82.221.105.7
82.221.105.6
71.6.167.142
71.6.165.200
71.6.135.131
66.240.236.119
66.240.192.138
198.20.99.130
198.20.70.114
198.20.69.98
198.20.69.74
188.138.9.50
185.142.236.34
```

Please note that the instructions that follow, are written for CentOS 7 but they should translate to other distributions as well, since we are only using the command line.

### Adding the script to the crontab.

Edit the crontab with this command:

```bash
sudo crontab -e
```

Add this line:

```bash
0 0 * * sun python -c 'import random; import time; time.sleep(random.random() * 3600)' && /opt/blocklist/blocklist.sh
```

Script runs every Sunday at midnight. I added one hour (3600 seconds) random function, what avoids the situation, when everyone will try to download IP lists from servers at the same time. I recommend to change hours in this task. **<span class="has-inline-color has-vivid-red-color">Be aware, that they can ban you if you will try to download IPs too often</span>**.

Excellent cronjob examples you will find here: <a href="https://crontab.guru/" target="_blank" rel="noreferrer noopener">https://crontab.guru/</a>

### Plugging the blocklist into firewalld

Running this script from the command line will fail at the moment. While it will create the blocklist file in /etc/ip-blocklist.conf, it will not be able to load the ipset because we have not yet created an ipset called blocklist. We can create it by hand in the following way:

```bash
sudo ipset create blocklist hash:net hashsize 1048576 maxelem 1048576
sudo firewall-cmd --permanent --new-ipset=blocklist --type=hash:net --option=family=inet --option=hashsize=1048576 --option=maxelem=1048576
```

This command creates an ipset called “blocklist” of type “hash:net”. This type of ipset is used to store different sized IP network addresses, ranging from large netblocks right down to single hosts. Running the above script now will create the blocklist and populate the ipset with the created blocklist. Next we need to add a rule to firewalld so that it will use the blocklist. I recommend inserting this rule at or near the top of the INPUT chain so that it will be processed early in your ruleset. Let’s take a look at the INPUT chain, so we will know where to insert the new rule. The hash size and maxelem value is a power of two.

```bash
sudo iptables -L INPUT -n -v --line-numbers
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
num pkts bytes target prot opt in out source destination
1 20133 19M ACCEPT all -- * * 0.0.0.0/0 0.0.0.0/0 ctstate RELATED,ESTABLISHED
2 112 6720 ACCEPT all -- lo * 0.0.0.0/0 0.0.0.0/0
3 1232 57168 INPUT_direct all -- * * 0.0.0.0/0 0.0.0.0/0
4 1086 49520 INPUT_ZONES all -- * * 0.0.0.0/0 0.0.0.0/0
5 14 680 LOG all -- * * 0.0.0.0/0 0.0.0.0/0 ctstate INVALID LOG flags 0 level 4 prefix "STATE_INVALID_DROP: "
6 14 680 DROP all -- * * 0.0.0.0/0 0.0.0.0/0 ctstate INVALID
7 449 19404 LOG all -- * * 0.0.0.0/0 0.0.0.0/0 LOG flags 0 level 4 prefix "FINAL_REJECT: "
8 449 19404 REJECT all -- * * 0.0.0.0/0 0.0.0.0/0 reject-with icmp-host-prohibited
```

The command above will list all the rules currently in the INPUT chain of iptables, with line numbers, which makes it easy to see where to insert the new rule. A snippet of my INPUT chain can be seen above. The first rule accepts all traffic, the second rule accepts all traffic to the loopback interface and we’ll leave them at the top. The sixth rule drops all incoming packets that are in an invalid state which is good. The rule below that logs the number of incoming connections which are rejected. Since that is already quite specific, let’s insert our new rule above this one.

```bash
sudo iptables -I INPUT 7 -m set --match-set blocklist src -j DROP
sudo firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 7 -m set --match-set blocklist src -j DROP
```

This command inserts our rule at position 7 in the INPUT chain and matches incoming traffic to the set  called “blocklist”, dropping corresponding traffic. At this point, iptables is silently dropping all traffic coming from hosts and netblocks in the blocklist. However, if we want to see what is being blocked, we need to add a logging rule above rule 7 Since I am curious to see what gets blocked, I added the following rule.

```bash
sudo iptables -I INPUT 7 -m set --match-set blocklist src -j LOG --log-prefix "IP Blocked: "
sudo firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 7 -m set --match-set blocklist src -j LOG --log-prefix "IP Blocked: "
```

This rule is inserted in position 7 pushing the drop rule to position 8 Now, each incoming traffic matching our blocklist is first logged with the prefix “IP Blocked:” by rule 7 and then discarded by rule 8. A look at the logging reveals this:

```bash
Sep 23 17:57:49 mail kernel: IP Blocked: IN=eth0 OUT= MAC=52:54:00:24:58:7e:4c:5e:0c:de:ac:d4:08:00 SRC=45.129.33.17 DST=192.166.218.231 LEN=40 TOS=0x00 PREC=0x00 TTL=244 ID=61513 PROTO=TCP SPT=49899 DPT=458
23 WINDOW=1024 RES=0x00 SYN URGP=0
Sep 23 17:58:36 mail kernel: IP Blocked: IN=eth0 OUT= MAC=52:54:00:24:58:7e:4c:5e:0c:de:ac:d4:08:00 SRC=89.248.172.140 DST=192.166.218.231 LEN=40 TOS=0x00 PREC=0x00 TTL=244 ID=43698 PROTO=TCP SPT=49466 DPT=3
309 WINDOW=1024 RES=0x00 SYN URGP=0
Sep 23 17:59:39 mail kernel: IP Blocked: IN=eth0 OUT= MAC=52:54:00:24:58:7e:4c:5e:0c:de:ac:d4:08:00 SRC=45.143.221.8 DST=192.166.218.231 LEN=414 TOS=0x08 PREC=0x20 TTL=52 ID=40147 DF PROTO=UDP SPT=57989 DPT=
5060 LEN=394
Sep 23 17:59:46 mail kernel: IP Blocked: IN=eth0 OUT= MAC=52:54:00:24:58:7e:4c:5e:0c:de:ac:d4:08:00 SRC=87.251.74.6 DST=192.166.218.231 LEN=40 TOS=0x00 PREC=0x00 TTL=243 ID=62775 PROTO=TCP SPT=46103 DPT=9091
WINDOW=1024 RES=0x00 SYN URGP=0
```

Here we see several attempts by hosts with different IP addresses attempting to connect to the server. These connections will never be established because iptables is on the job.

Since the rules we have written seem to be working, we need to save them so that they will be loaded again should iptables get restarted. On CentOS 7, we can use iptables for that purpose. Issuing the command below will save the rules in /etc/sysconfig/iptables.

```bash
sudo service iptables save
```

### Creating the ipset at boot

So far, we’ve managed to download and compile an extensive blocklist, learned how to load it into ipset and plug that ipset into iptables or firewalld as a blocklist. We’ve also set up a rule to log detected connection attempts from our blocklist. So far so good. There is one remaining problem, though. The moment we reboot our server, you’ll notice the firewall fails to initialize the ruleset saves by iptables/firewalld because it is referencing an ipset that doesn’t exist. We’re going to need a way to create the ipset at boot time. I’ve done quite a bit of searching on how to do that properly but there appears to be little documentation available. In the end, I decided that creating a script to create and fill the ipset when one (or more) Ethernet interfaces come up would make sense. For that purpose, I created a script to run when initializing the networking system.

Create a file called ipset.sh located in /usr/local/bin/

```bash
sudo vi /usr/local/bin/ipset.sh
```

Put the following script into this file exactly the same way as before.

```bash
#!/bin/bash

# Script to set up ipset called blocklist 
# to be populated by update-blocklist.sh 

BLISTFILE="/etc/ip-blocklist.conf" 
IPSET=/sbin/ipset 

# Make sure no blocklist exists! 
$IPSET flush blocklist && $IPSET destroy blocklist 

# Recreate and populate blocklist 
$IPSET create blocklist hash:net 
egrep -v "^#|^$" $BLISTFILE | while IFS= read -r ip 
do         
    ipset add blocklist $ip 
done
```

What this script does, is quite simple. It first makes sure there is no ipset called blocklist by emptying and destroying any ipset of that name. It then (re-)creates the ipset called blocklist and populates it, using the /etc/ip-blocklist.conf file we’ve created before. I then integrated that script in the new systemd service unit by adding it as a post-up script in /etc/systemd/system/ipset_blocklist.service as below.

```bash
sudo vi /etc/systemd/system/ipset_blocklist.service
```

```vim
[Unit]
Description=ipset_blocklist
Before=firewalld.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/bin/ipset.sh

[Install]
WantedBy=basic.target
```

Reload the systemd process to consider newly created sample.service OR every time when sample.service gets modified.

```bash
sudo systemctl daemon-reload
```

Enable this service to start after reboot automatically.

```bash
sudo systemctl enable ipset_blocklist.service
```

Start the service.

```bash
sudo systemctl start ipset_blocklist.service
```

In Debian/Ubuntu you can integrate it a little bit different by adding it as a post-up script in /etc/network/interfaces as below:

```vim
# The primary network interface
auto eth0 
iface eth0 inet static 
address X.X.X.X 
netmask 255.255.255.0 
network X.X.X.A 
broadcast X.X.X.Z 
gateway X.X.X.Y 
dns-nameservers X.X.X.Y 8.8.8.8 8.8.4.4 
post-up /usr/local/bin/ipset.sh
```

As soon as the primary interface (in many cases eth0) is up, the ipset is created and populated by running the /usr/local/bin/ipset.sh script. By the time iptables is initialized, the ipset is available and filled so malicious hosts are blocked nearly immediately. After doing this, our blocklist will survive a reboot, ensuring we always have its protection.

### firewalld ipset

The script contains additional part for the firewalld which is a result of looking for the solution for Red Hat family distros.

```vim
firewall-cmd --delete-ipset=blocklist --permanent
firewall-cmd --permanent --new-ipset=blocklist --type=hash:net --option=family=inet --option=hashsize=1048576 --option=maxelem=1048576
firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 3 -m set --match-set blocklist src -j LOG --log-prefix "IP Blocked: "
firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 3 -m set --match-set blocklist src -j DROP
firewall-cmd --permanent --ipset=blocklist --add-entries-from-file=/etc/ip-blocklist.conf
firewall-cmd --reload
firewall-cmd --permanent --ipset=blocklist --get-entries | wc -l
ipset list blocklist | wc -l
```

First line deletes the existing ipset. Second adds it with proper hash size and maximum elements (IP addresses) which can be added to the opset. Third adds two rules for logging and dropping bad IP addresses. The fifth rules loads bad IPS from the local file created by the script. Then it reloads the firewalld to apply new ipset settings. The penultimate line counts all IPs in the firewalld ipset and the last line counts IPs in the the ipset.

To enable logging dropped connections you need to perform this command.

```bash
firewall-cmd --set-log-denied=all
```

It changes the value in file /etc/firewalld/firewalld.conf. You can check it with this command:

```bash
cat /etc/firewalld/firewalld.conf | grep -i "LogDenied=all"
```

Finally I decided to remove logging bad IPs, just because it creates a really mess in message log. So, I changed it this way.

```sudo vi /etc/firewalld/direct.xml```

The content of this files looks like this:

```xml
<?xml version="1.0" encoding="utf-8"?>
<direct>
<rule priority="3" table="filter" ipv="ipv4" chain="INPUT">-m set --match-set blacklist src -j LOG --log-prefix 'IP Blocked: '</rule>
<rule ipv="ipv4" table="filter" chain="INPUT" priority="3">-m set --match-set blacklist src -j DROP</rule>
</direct>
```

I just removed the first rule

```bash
<rule priority="3" table="filter" ipv="ipv4" chain="INPUT">-m set --match-set blacklist src -j LOG --log-prefix 'IP Blocked: '</rule>
```

To filter this I use commands like those below:

```bash
sudo tail -f /var/log/messages
sudo firewall-cmd --get-log-denied
sudo dmesg | grep -i DROP
sudo dmesg | grep -i REJECT
```

It was better, but everything went to /var/log/messages. This is wrong. I decided to redirect these messages to separate logs. This is how I did it.

```bash
sudo vi /etc/rsyslog.d/firewalld.conf
```

I added there these lines:

```vim
:msg,contains,"_DROP" /var/log/firewalld-dropped_log
:msg,contains,"_REJECT" /var/log/firewalld-rejected_log
& stop
```

I saved the file and exited. Then I decided to create a logrotate for these logs.

```bash
sudo vi /etc/logrotate.d/firewalld-dropped_log
```

Added this content:

```vim
/var/log/firewalld-dropped_log {
daily
create 0644 root root
rotate 5
size=10M
compress
delaycompress
dateext
dateformat -%d%m%Y
notifempty
postrotate
systemctl restart rsyslog
systemctl restart auditd
systemctl restart firewalld
echo "A rotation of firewalld-dropped_log just took place." | mail mail@example.com
endscript
}
```

Then I did the same for rejected.

```bash
sudo vi /etc/logrotate.d/firewalld-rejected_log
```

And added:

```vim
/var/log/firewalld-rejected_log {
daily
create 0644 root root
rotate 5
size=10M
compress
delaycompress
dateext
dateformat -%d%m%Y
notifempty
postrotate
systemctl restart rsyslog
systemctl restart auditd
systemctl restart firewalld
echo "A rotation of firewalld-rejected_log just took place." | mail mail@example.com
endscript
}
```

Great this is what I wanted, but still messages was messy, so I decided to edit rsyslog.conf and change it this way according to the solution from this website: <a href="https://serverfault.com/questions/557885/remove-iptables-log-from-kern-log-syslog-messages" target="_blank" rel="noreferrer noopener">https://serverfault.com/questions/557885/remove-iptables-log-from-kern-log-syslog-messages</a>

```bash
sudo vi /etc/rsyslog.conf
```

Look for the part with rules and modify it according to the below example.

```vim
###### RULES ######
$ Log all kernel messages to the console.
# Logging much else clutters up the screen.
#kern.*                                               /dev/console
kern.*;kern.!info;kern.!warning                       /var/log/kern
kern.info                                             /var/log/kern-info_log
kern.warning                                          /var/log/kern-warnings_log

# Log anything (except mail) of level info or higher.
# Don't log private authentication messages!
*.info;mail.none;authpriv.none;cron.none;local2.none  /var/log/messages
```
Leave everything below as it is.

After that edit the below file:

```bash
sudo vi /etc/audisp/plugins.d/syslog.conf
```

And set the line args like below:

```vim
args = LOG_INFO
```

After that restart auditd and rsyslog with the below commands:

```bash
sudo service auditd restart && sudo service rsyslog restart
```

Then I decided to download multitail to be able to monitor them at once.

```bash
sudo yum install multitail
```

Then I have run this way:

```bash
sudo multitail /var/log/firewalld-dropped_log /var/log/firewalld-rejected_log /var/log/firewalld /var/log/kern /var/log/kern-info_log /var/log/kern-warnings_log
```

It was nice, however still messy, so I decided to look for the solution about the kernel messages. And I have found it here: <a href="https://superuser.com/questions/351387/how-to-stop-kernel-messages-from-flooding-my-console" target="_blank" rel="noreferrer noopener">https://superuser.com/questions/351387/how-to-stop-kernel-messages-from-flooding-my-console</a>

The solution was simple and I changed values this way:

```bash
sudo sysctl -w kernel.printk="3 4 1 3"
```

Then I checked these values with this command:

```bash
sudo sysctl kernel.printk
```

### Configure kernel parameters at runtime- explanation

See `man sysctl` - “configure kernel parameters at runtime&” for more.

Reminder of the severity levels and the four values of kernel.printk:

  * CUR = current severity level; only messages more important than this level are printed
  * DEF = default severity level assigned to messages with no level
  * MIN = minimum allowable CUR
  * BTDEF = boot-time default CUR

On my CentOS: 7 4 1 7

```vim
                     CUR  DEF  MIN  BTDEF
0 - emergency        x              x                        
1 - alert            x         x    x
2 - critical         x              x
3 - error            x              x
4 - warning          x    x         x
5 - notice           x              x
6 - informational    V              V
7 - debug
```

This is too noisy, I just want critical and up (no errors). Unlabeled messages should be regarded as warning, so DEF is good:

```vim
                     CUR  DEF  MIN  BTDEF
0 - emergency        x              x                        
1 - alert            x         x    x
2 - critical         x              x
3 - error            V              V
4 - warning               x         
5 - notice                           
6 - informational                   
7 - debug
```

Set to: 3 4 1 3 and problem solved. Now when I use multitail to watch logs I see everything as it should be.

The last thing I had to do was to whitelist Google&#8217;s IP addresses, because e-mails from Gmail was rejected because the above solution blocked IP addresses. I did it this way.

```bash
sudo -i 
(type your sudo password)
dig gmail.com txt
dig _spf.google.com txt
touch /etc/gmail_v4
touch /etc/gmail_v6
dig _netblocks.google.com txt >> /etc/gmail_v4
dig _netblocks2.google.com txt >> /etc/gmail_v6
dig _netblocks3.google.com txt >> /etc/gmail_v4
vi /etc/gmail_v4
vi /etc/gmail_v6
```

Above commands let save their IP addresses into two files. **<span class="has-inline-color has-vivid-red-color">You need to clean them and leave only IP addresses (one IP per line)</span>**. Then I created a whitelist and added IP addresses from these two files.

After that hit ctrl+d to log out and go back to the standard user.

```bash
sudo firewall-cmd --permanent --new-ipset=whitelist4 --type=hash:net --option=maxelem=256 --option=family=inet --option=hashsize=4096
sudo firewall-cmd --permanent --new-ipset=whitelist6 --type=hash:net --option=maxelem=256 --option=family=inet6 --option=hashsize=4096
sudo firewall-cmd --permanent --zone=trusted --add-source=ipset:whitelist4
sudo firewall-cmd --permanent --zone=trusted --add-source=ipset:whitelist6
sudo firewall-cmd --permanent --ipset=whitelist4 --add-entries-from-file=/etc/gmail_v4
sudo firewall-cmd --permanent --ipset=whitelist6 --add-entries-from-file=/etc/gmail_v6
sudo firewall-cmd --permanent --ipset=whitelist4 --get-entries | wc -l
sudo firewall-cmd --permanent --ipset=whitelist6 --get-entries | wc -l
```

Then all you have to do is to reload firewalld rules.

```bash
sudo firewall-cmd --reload
```

If you have any corrections or tips pertaining to the above, I am all ears. If this post helps you in any way, I’d also like to hear about it.

### References

* <https://www.beris.nl/2015/04/22/using-blacklists-with-iptables/>
* <https://fedoramagazine.org/protect-your-system-with-fail2ban-and-firewalld-blacklists/>
* <a href="https://www.thegeekdiary.com/centos-rhel-7-how-to-make-custom-script-to-run-automatically-during-boot/" target="_blank" rel="noreferrer noopener">https://www.thegeekdiary.com/centos-rhel-7-how-to-make-custom-script-to-run-automatically-during-boot/</a>
* <a href="https://www.howtoforge.com/tutorial/protect-your-server-computer-with-badips-and-fail2ban/" target="_blank" rel="noreferrer noopener">https://www.howtoforge.com/tutorial/protect-your-server-computer-with-badips-and-fail2ban/</a>
* <a href="https://serverfault.com/questions/842749/firewalld-logging-denied-packets-enabled-not-logging" target="_blank" rel="noreferrer noopener">https://serverfault.com/questions/842749/firewalld-logging-denied-packets-enabled-not-logging</a>
* <a href="https://www.cyberciti.biz/faq/enable-firewalld-logging-for-denied-packets-on-linux/" target="_blank" rel="noreferrer noopener">https://www.cyberciti.biz/faq/enable-firewalld-logging-for-denied-packets-on-linux/</a>
* <a href="https://serverfault.com/questions/859572/missed-kernel-messages" target="_blank" rel="noreferrer noopener">https://serverfault.com/questions/859572/missed-kernel-messages</a>
* <a href="https://serverfault.com/questions/557885/remove-iptables-log-from-kern-log-syslog-messages" target="_blank" rel="noreferrer noopener">https://serverfault.com/questions/557885/remove-iptables-log-from-kern-log-syslog-messages</a>
* <a href="https://superuser.com/questions/351387/how-to-stop-kernel-messages-from-flooding-my-console" target="_blank" rel="noreferrer noopener">https://superuser.com/questions/351387/how-to-stop-kernel-messages-from-flooding-my-console</a>
* <https://wiki.gentoo.org/wiki/Rsyslog>

[1]: http://www.fail2ban.org/wiki/index.php/Main_Page
