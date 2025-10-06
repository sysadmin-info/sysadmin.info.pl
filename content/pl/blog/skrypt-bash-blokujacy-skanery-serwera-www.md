---
title: Skrypt Bash blokujący skanery serwera WWW (Apache/Nginx/LiteSpeed).
date: 2021-02-22T20:11:29+00:00
description: Skrypt Bash blokujący skanery serwera WWW (Apache/Nginx/LiteSpeed).
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
- IT Security
cover:
    image: images/2021-thumbs/bash_script_that_blocks_web_server_scanners.webp
---
{{< youtube zgnijChQ45E >}}
<figcaption>Skrypt Bash blokujący skanery serwera WWW (Apache/Nginx/LiteSpeed).</figcaption>

Skrypt Bash blokujący skanery serwera WWW (Apache/Nginx/LiteSpeed). Sprawdza błędy 400-408 lub inne w wybranym dzienniku i wydobywa adresy IP skanerów próbujących skanować serwer WWW, a następnie dodaje te adresy IP do zestawu IP, który odrzuca połączenie.

```vim
#!/bin/bash

######################################################### Dziennik dostępu Apache ###################################################################
# Szukaj pliku i jeśli nie istnieje, utwórz go.
for x in /root/access_403.txt ; do
[ ! -f $x ] && touch $x;
done
################################################################################################################################################
# wyświetl plik dziennika Apache i przekaż go do grep, przefiltruj wszystkie linie niezawierające słowa "bot" i przekaż do grep, 
# przefiltruj wszystkie linie niezawierające słowa "google" i przekaż do grep, 
# przefiltruj wszystkie linie zawierające słowo " 403 " (spacje są specjalnie wstawione - zobacz, jak wygląda dziennik apache2) i przekaż do awk, 
# użyj awk do wyświetlania pierwszej kolumny i przekaż do awk, 
# użyj awk do wyświetlania wyrażenia regularnego w celu wydobycia adresów IP z pliku dziennika,
# użyj ip jako ciągu rozpoczynającego się znakiem wymienionym powyżej (coś między 0 a 9) i wyświetl ten ciąg i przekaż do sed, 
# użyj sed do usunięcia pustych linii i przekaż do uniq, 
# użyj uniq do pokazania, ile razy adres IP został umieszczony i przekaż do awk, 
# użyj awk do wybrania pierwszej kolumny i jeśli jest ich 3 lub więcej, to wyświetl, co jest w kolumnie 2 i przekaż do grep, 
# użyj grep do oddzielenia wszystkiego od /root/access_403.txt, a pozostałą część umieść w /tmp/access_403.log
################################################################################################################################################
cat /var/log/httpd/access_log | grep -v bot | grep -v google | grep " 403 " | awk '{ print $1 }' | awk '{match($0,/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/); ip = substr($0,RSTART,RLENGTH); print ip}' | sed '/^$/d' | uniq -c | awk '$1>1{print $2}'| grep -F -x -v -f /root/access_403.txt > /tmp/access_403.log
################################################################################################################################################
# Jeśli plik /tmp/access_403.log nie jest pusty, to dodaj do pliku /root/ipaddresses.txt to, co jest w pliku /tmp/access_403.log
# dla adresu IP znajdującego się w /tmp/access_403.log uruchom polecenie dodawania adresów IP z pliku 
# i/lub użyj poleceń, aby dodać każdy adres IP do zestawu IP ipset/firewalld
################################################################################################################################################
if [ -s /tmp/access_403.log ]
then
cat /tmp/access_403.log >> /root/access_403.txt
#firewall-cmd --permanent --ipset=blacklist --add-entries-from-file=/tmp/access_403.log
for ip in $(cat /tmp/access_403.log); do /usr/sbin/ipset add blacklist $ip;done
for ip in $(cat /tmp/access_403.log); do firewall-cmd --permanent --ipset=blacklist --add-entry=$ip;done
#for ip in $(cat /tmp/access_403.log); do iptables -A INPUT -s $ip/32 -d 0/0 -j DROP; done
fi
# Usuń poniższy plik
rm -f /tmp/access_403.log
#echo "Lista zablokowanych adresów IP:" | cat /root/403.txt
######################################################### Dziennik błędów Apache #####################################################################
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
#echo "Lista zablokowanych adresów IP:" | cat /root/403.txt
# Przeładuj firewalld
firewall-cmd --reload
``