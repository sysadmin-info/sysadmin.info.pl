---
title: Jak zainstalować dodatek Adguard Home w Home Assistant Supervised
date: 2022-07-29T10:13:13+00:00
description: Ten film opisuje, jak zainstalować dodatek Adguard Home w Home Assistant Supervised
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

Ten film opisuje, jak zainstalować dodatek Adguard Home w Home Assistant Supervised. AdGuard Home to sieciowe, otwarte oprogramowanie do blokowania reklam i śledzenia oraz do kontrolowania całego ruchu w sieci domowej.

{{< youtube qNB4ldWldmU >}}
<figcaption>Jak zainstalować dodatek Adguard Home w Home Assistant Supervised</figcaption>


##### Instalacja dodatku AdGuard Home w Ustawienia -> Dodatki - Sklep z dodatkami

Ponieważ AdGuard Home będzie naszym resolverem i nie chcemy widzieć poniższych ostrzeżeń, gdy sprawdzamy status:

```bash
sudo systemctl status systemd-resolved.service

Jul 25 10:11:02 raspberrypi systemd-resolved[408]: Using degraded feature set UDP instead of UDP+EDNS0 for DNS server 10.10.0.100.
Jul 25 10:11:02 raspberrypi systemd-resolved[408]: Using degraded feature set TCP instead of UDP for DNS server 10.10.0.100.
Jul 25 10:11:02 raspberrypi systemd-resolved[408]: Using degraded feature set UDP instead of TCP for DNS server 10.10.0.100.
```

##### Skonfigurujemy panel AdGuard za pomocą HTTPS i serwera DoT dla lokalnej sieci

Domyślnie po konfiguracji AdGuard zapewnia panel administracyjny HTTP. Możliwe jest zaimplementowanie zaszyfrowanego połączenia z tym panelem, ale najpierw musisz uzyskać klucz i certyfikat. Możemy wygenerować te dwie rzeczy na dowolnej dystrybucji linuxowej za pomocą poniższego polecenia:

```bash
$ openssl req -x509 -days 3650 -out ha.crt -keyout ha.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=example.com' -extensions EXT -config <( \
   printf "[dn]\nCN=example.com\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:example.com\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

Generowanie prywatnego klucza RSA
.+++++
...+++++
zapis nowego prywatnego klucza do 'ha.key'
-----
```

Dwa pliki powinny zostać dla nas wygenerowane. Jeden z nich zawiera klucz prywatny, a drugi certyfikat. Zawartość tych plików musi zostać wprowadzona w panelu AdGuard w Ustawienia => Ustawienia szyfrowania. Musimy również określić Nazwę serwera na example.com (lub cokolwiek podaliśmy podczas generowania certyfikatu) i wybrać porty dla panelu sieciowego oraz serwera DoT:

Tam występuje błąd Nieprawidłowy łańcuch certyfikatów, ale nie przeszkadza to w tego typu instalacji.

Po pomyślnym skonfigurowaniu AdGuard powinniśmy mieć mniej więcej takie wpisy netstat jak poniżej:

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

Wpisy protokołu TCP z LISTEN odpowiadają za serwer sieciowy na porcie 443. Następnie mamy serwer DoT na porcie 853. Port 53 dla protokołów TCP i UDP jest odpowiedzialny za serwer DNS dla lokalnej sieci. A wpisy z 9.9.9.9 i 1.0.0.3 w Adresie Zagranicznym odpowiadają za serwery DNS, do których będą wysyłane zapytania.

Jeśli włączysz usługę bezpieczeństwa przeglądania AdGuard, pojawi się XXX.XXX.XXX.XXX:443.

Teraz przełącz wszystkie trzy przełączniki i uruchom dodatek AdGuard Home w Home Assistant oraz wybierz pokaż na pasku bocznym

Nie będzie działać. Dlaczego? Ponieważ musisz zezwolić na port, którego używa kontener. Jak to sprawdzić? Zobacz poniższe polecenie:

```bash
sudo ss -tulpn | grep LISTEN
sudo netstat -napletu | grep LISTEN
```

##### Powinno pokazać coś podobnego:

```bash
tcp   LISTEN 0      511                    172.30.32.1:62048      0.0.0.0:*    users:(("nginx",pid=7740,fd=5),("nginx",pid=7709,fd=5))
```

##### Ważne! Ignoruj wpisy z portem 53, ponieważ jest to domyślny port DNS.

Zazwyczaj kontenery docker mają podobną pulę IP i tylko to jest ważne, gdy sprawdzasz port dodatku, który działa w kontenerze docker.

```
172.30.32.1
```

##### Więc musisz zezwolić na ten port 62048 w ufw

```bash
sudo ufw allow 62048/tcp
```

##### Teraz panel AdGuard Home będzie się ładować

Ta sama sytuacja dotyczy każdego dodatku, który instalujesz, zawierającego przełącznik (link) na pasku bocznym po lewej stronie. Sprawdzasz port i zezwalasz na port.

```
Wyjątki:
@@||t.co^$important
@@||facebook.com^$important
```

Dodatkowe filtry:

[MajkiIT Polski PiHole](https://raw.githubusercontent.com/MajkiIT/polish-ads-filter/master/polish-pihole-filters/all_ads_filters.txt)
[MajkiIT Polski Adguard](https://raw.githubusercontent.com/MajkiIT/polish-ads-filter/master/polish-adblock-filters/adblock_adguard.txt)
[Cert Polska](https://hole.cert.pl/domains/domains.txt)
[KAD hosts](https://raw.githubusercontent.com/FiltersHeroes/KADhosts/master/KADhosts.txt)
[URLHaus](https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-agh.txt)
[UncheckyAds](https://raw.githubusercontent.com/FadeMind/hosts.extras/master/UncheckyAds/hosts)
[Phishing Hosts Blocklist](https://malware-filter.gitlab.io/malware-filter/phishing-filter-hosts.txt)
[Dandelion Sprout's Anti-Malware Hosts (Alpha)](https://raw.githubusercontent.com/DandelionSprout/adfilt/master/Alternate%20versions%20Anti-Malware%20List/AntiMalwareHosts.txt)