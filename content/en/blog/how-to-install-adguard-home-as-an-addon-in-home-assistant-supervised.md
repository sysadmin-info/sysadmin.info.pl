---
title: How to install Adguard Home as an addon in Home Assistant Supervised
date: 2022-07-29T10:13:13+00:00
description: This video describes how to install Adguard Home addon in Home Assistant
  Supervised.
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
- Raspberry Pi
- Home Assistant
cover:
    image: images/2022-thumbs/adguard.webp
---
This video describes how to install Adguard Home addon in Home Assistant Supervised. AdGuard Home is a network-wide, open source software for blocking ads & tracking and for gaining control over all traffic in your home network.

{{< youtube qNB4ldWldmU >}}
<figcaption>How to install Adguard Home as an addon in Home Assistant Supervised</figcaption>


##### Install AdGuard Home addon in the Settings -> Addons - Addons shop

Because AdGuard Home will be our resolver and we do not want to see the below warnings when we check the status:

```bash
sudo systemctl status systemd-resolved.service

Jul 25 10:11:02 raspberrypi systemd-resolved[408]: Using degraded feature set UDP instead of UDP+EDNS0 for DNS server 10.10.0.100.
Jul 25 10:11:02 raspberrypi systemd-resolved[408]: Using degraded feature set TCP instead of UDP for DNS server 10.10.0.100.
Jul 25 10:11:02 raspberrypi systemd-resolved[408]: Using degraded feature set UDP instead of TCP for DNS server 10.10.0.100.
```

##### We will configure AdGuard panel over HTTPS and DoT server for the local network

By default, after configuration, AdGuard provides an HTTP admin panel. It is possible to implement an encrypted connection with this panel, but you must first obtain a key and a certificate. We can generate these two things on any linux distribution with the command below:

```bash
$ openssl req -x509 -days 3650 -out ha.crt -keyout ha.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=example.com' -extensions EXT -config <( \
   printf "[dn]\nCN=example.com\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:example.com\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

Generating a RSA private key
.+++++
...+++++
writing new private key to 'ha.key'
-----
```

Two files should be generated for us. One of them contains the private key and the other the certificate. The content of these files must be entered in the AdGuard panel in Settings => Encryption Settings. We also need to specify the Server Name on example.com (or whatever we gave when generating the certificate) and select the ports for the web panel and the DoT server:

There is a Certificate chain is invalid error there, but it does not prevent this type of installation.

After successfully setting up AdGuard, we should have more or less netstat entries like this:

```bash
sudo netstat -napletu | grep Ad
Proto Recv-Q Send-Q Local Address           Foreign Address         State       User       Inode      PID/Program name    
tcp        0      0 127.0.0.1:45158         0.0.0.0:*               LISTEN      0          50357      8687/./AdGuardHome  
tcp        0      0 127.0.0.1:443           0.0.0.0:*               LISTEN      0          49852      8687/./AdGuardHome  
tcp        0      0 10.10.0.100:53          0.0.0.0:*               LISTEN      0          53329      8687/./AdGuardHome  
tcp        0      0 10.10.0.100:853         0.0.0.0:*               LISTEN      0          50767      8687/./AdGuardHome  
tcp        0      0 172.30.32.1:53          0.0.0.0:*               LISTEN      0          53330      8687/./AdGuardHome  
tcp        0      0 172.30.32.1:853         0.0.0.0:*               LISTEN      0          50768      8687/./AdGuardHome  
tcp        0      0 10.10.0.100:58876       1.0.0.3:443             ESTABLISHED 0          53355      8687/./AdGuardHome  
tcp        0      0 10.10.0.100:33928       1.0.0.3:853             ESTABLISHED 0          50922      8687/./AdGuardHome  
tcp       25      0 10.10.0.100:37280       9.9.9.9:853             CLOSE_WAIT  0          52562      8687/./AdGuardHome  
tcp        0      0 10.10.0.100:37290       9.9.9.9:853             ESTABLISHED 0          53504      8687/./AdGuardHome  
tcp        0      0 10.10.0.100:58870       1.0.0.3:443             ESTABLISHED 0          49887      8687/./AdGuardHome  
tcp        0      0 127.0.0.1:443           127.0.0.1:46744         ESTABLISHED 0          53310      8687/./AdGuardHome  
tcp        0      0 10.10.0.100:58874       1.0.0.3:443             ESTABLISHED 0          50764      8687/./AdGuardHome  
tcp        0      0 10.10.0.100:49114       9.9.9.9:443             ESTABLISHED 0          52441      8687/./AdGuardHome  
tcp        0      0 127.0.0.1:45158         127.0.0.1:50434         ESTABLISHED 0          53308      8687/./AdGuardHome  
tcp        0      0 10.10.0.100:37876       9.9.9.10:443            ESTABLISHED 0          50791      8687/./AdGuardHome  
udp        0      0 172.30.32.1:53          0.0.0.0:*                           0          53328      8687/./AdGuardHome  
udp        0      0 10.10.0.100:53          0.0.0.0:*                           0          53327      8687/./AdGuardHome  
udp        0      0 172.30.32.1:853         0.0.0.0:*                           0          53332      8687/./AdGuardHome  
udp        0      0 10.10.0.100:853         0.0.0.0:*                           0          53331      8687/./AdGuardHome  
```

The TCP protocol entries from LISTEN are responsible for the web server on port 443. Next we have a DoT server on port 853. Port 53 for both TCP and UDP is responsible for the DNS server for the local network. And entries with 9.9.9.9 and 1.0.0.3 in Foreign Address are responsible for upstream DNS servers to which queries will be sent.

If you enable AdGuard browsing security web service, XXX.XXX.XXX.XXX:443 will appear.

Now switch all three switchers and start the AdGuard Home addon in Home Assistant and select show on the sidebar

It will not work. Why? Because you need to allow the port that the container is using. How to check it? See the below command:

```bash
sudo ss -tulpn | grep LISTEN
sudo netstat -napletu | grep LISTEN
```

##### It should show something similar:
```bash
tcp   LISTEN 0      511                    172.30.32.1:62048      0.0.0.0:*    users:(("nginx",pid=7740,fd=5),("nginx",pid=7709,fd=5))
```

##### Important! Ignore entries with port 53, because it is default DNS port. 

Usually docker containers have similar IP pool and only this is important when you check the port of the addon which is running in a docker container.

```
172.30.32.1
```

##### So you need to allow this port 62048 in ufw
```bash
sudo ufw allow 62048/tcp
```

##### Now the AdGuard Home panel will load

The same situation is with every addon you will install , that contains a switcher (link) on a sidebar on the left side. You check the port and allow the port.

```
Exclusions:
@@||t.co^$important
@@||facebook.com^$important
```

Additional filters:

[MajkiIT Polish PiHole](https://raw.githubusercontent.com/MajkiIT/polish-ads-filter/master/polish-pihole-filters/all_ads_filters.txt)
[MajkiIT Polish Adguard](https://raw.githubusercontent.com/MajkiIT/polish-ads-filter/master/polish-adblock-filters/adblock_adguard.txt)
[Cert Polska](https://hole.cert.pl/domains/domains.txt)
[KAD hosts](https://raw.githubusercontent.com/FiltersHeroes/KADhosts/master/KADhosts.txt)
[URLHaus](https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-agh.txt)
[UncheckyAds](https://raw.githubusercontent.com/FadeMind/hosts.extras/master/UncheckyAds/hosts)
[Phishing Hosts Blocklist](https://malware-filter.gitlab.io/malware-filter/phishing-filter-hosts.txt)
[Dandelion Sprout's Anti-Malware Hosts (Alpha)](https://raw.githubusercontent.com/DandelionSprout/adfilt/master/Alternate%20versions%20Anti-Malware%20List/AntiMalwareHosts.txt)