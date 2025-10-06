---
title: Analiza auditd za pomocą logwatch
date: 2020-10-14T07:13:25+00:00
description: Analiza auditd za pomocą logwatch
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
    image: images/2020-thumbs/linux-cli.webp
---
Witaj,

Próbuję zgromadzić wiedzę związana z narzędziem logwatch, ale jest wiele do nauki, aby zrozumieć kody błędów jądra.

Aktualizuję ten post o to, co znajdę i czego się nauczę. Na razie postaram się przedstawić to, co już rozumiem w prosty sposób.

Do analizy będę używać auditd, który opisałem tutaj: <https://sysadmin.info.pl/en/blog/selinux-security-policy/>

## Logwatch

Logwatch to klasyczne narzędzie służące do wysyłania codziennego raportu aktywności z dzienników systemowych w Linuxie. W domyślnej instalacji CentOS, logwatch nie ma wielu zaawansowanych funkcji włączonych. Pokażę ci, jak skonfigurować logwatch.

## Instalacja Logwatch

Wprowadź poniższą komendę w terminalu:

```bash
sudo yum install logwatch
```

Następnie przejdź do katalogu usług logwatch, który znajduje się tutaj:

```bash
cd /usr/share/logwatch/default.conf/services
```

Edytuj następujące pliki:

```bash
sudo vi zz-disk_space.conf
```

Odkomentuj linie, jak pokazano poniżej:

```vim
#Nowe opcje raportu o dyskach
#Odkomentuj to, aby pokazać rozmiary katalogów domowych
$show_home_dir_sizes = 1
$home_dir = "/home"

#Odkomentuj to, aby pokazać rozmiar skrzynki pocztowej
$show_mail_dir_sizes = 1
$mail_dir = "/var/spool/mail"

#Odkomentuj to, aby pokazać rozmiary katalogów systemowych /opt /usr/ /var/log
$show_disk_usage = 1
```

Następnie, edytuj następujący plik:

```bash
sudo vi http.conf
```

Ustaw następującą wartość na 1:

```vim
# Ustaw flagę na 1, aby włączyć ignorowanie
# lub ustaw na 0, aby wyłączyć
$HTTP_IGNORE_ERROR_HACKS = 1
```

Następnie możesz chcieć edytować adres e-mail, na który logwatch wysyła raport.

```bash
cd /usr/share/logwatch/default.conf/
sudo vi logwatch.conf
```

Zmień MailTo = na adres e-mail, który jest pożądany:

```vim
# Domyślna osoba, do której będą wysyłane raporty. Może to być lokalne konto lub pełny adres e-mail. Zmienna Print powinna być ustawiona na No,
# aby włączyć funkcję wysyłania e-maili.
#MailTo = admin
MailTo = admin@example.com
```

To praktyka powszechnie stosowana, aby przesyłać pocztę roota z wszystkich serwerów na listę mailingową, do której zapisani są wszyscy administratorzy. Po zakończeniu zmian możesz uruchomić logwatch ręcznie w wierszu poleceń bez opcji, aby przetestować:

```bash
sudo logwatch
```

Logwatch domyślnie uruchamia się w ramach codziennych zadań cron w katalogu /etc/cron.daily. 

Poniżej znajduje się przykład wyników logwatch:

```vim
############# Logwatch 7.4.0 (03/01/11)
Przetwarzanie rozpoczęte: środa 14 października 2020 Data przetwarzania: wczoraj (2020-Oct-13) Okres: dzień Poziom szczegółów wyników: 0 Rodzaj wyniku/Format: stdout / tekst Dzienniki dla hosta: mail.sysadmin.info.pl
##################################################################
--------------------- Rozpoczęcie auditu jądra ------------------------
Niesparowane wpisy
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
---------------------- Zakończenie auditu jądra -------------------------


--------------------- Rozpoczęcie Clamav-milter ------------------------
Niesparowane wpisy
+++ Rozpoczęto w mar 13 października 2020
: 1 raz(y)
ClamAV: mi_stop=1
: 1 raz(y)
---------------------- Zakończenie Clamav-milter -------------------------


--------------------- Rozpoczęcie Cron ------------------------
Niesparowane wpisy
INFO (Zamykanie)
INFO (RANDOM_DELAY będzie skalowany o współczynnik 56%, jeśli jest używany.)
---------------------- Zakończenie Cron -------------------------


--------------------- Rozpoczęcie httpd ------------------------
Łącznie 15 witryn próbowało dostępu do serwera
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
Żądania z odpowiedziami błędów
400 Bad Request
/: 1 raz(y)
HTTP/1.0: 1 raz(y)
null: 1 raz(y)
403 Forbidden
/: 17 raz(y)
/.env: 2 raz(y)
/HNAP1/: 2 raz(y)
//MyAdmin/scripts/setup.php: 1 raz(y)
//myadmin/scripts/setup.php: 1 raz(y)
//phpMyAdmin/scripts/setup.php: 1 raz(y)
//phpmyadmin/scripts/setup.php: 1 raz(y)
//pma/scripts/setup.php: 1 raz(y)
/GponForm/diag_Form?images/: 1 raz(y)
/bag2: 1 raz(y)
/en/rhcsa-user-passwords-add-groups-and-users-to-groups/%5D: 1 raz(y)
/goform/webLogin: 1 raz(y)
/login/: 1 raz(y)
/muieblackcat: 1 raz(y)
/owa/auth/logon.aspx: 1 raz(y)


/pv/000000000000.cfg: 1 raz(y)
/solr/admin/info/system?wt=json: 1 raz(y)
HTTP/1.1: 1 raz(y)
404 Not Found
/sellers.json: 3 raz(y)
/tag/background/: 3 raz(y)
/css/album.css: 2 raz(y)
/tag/elementary-os/: 2 raz(y)
/tag/kevin-mitnick/: 2 raz(y)
/wp-content/plugins/wp-file-manager/lib/ph … tor.minimal.php: 2 raz(y)
/xxxss: 2 raz(y)
/?attachment_id=806: 1 raz(y)
/ads.txt: 1 raz(y)
/data/admin/allowurl.txt: 1 raz(y)
/e/admin/: 1 raz(y)
/wp/wp-login.php: 1 raz(y)
408 Request Timeout
null: 34 raz(y)
500 Internal Server Error
/en/category/rhcsa-en/: 1 raz(y)
503 Service Unavailable
/en/about-me: 1 raz(y)
/en/contact: 1 raz(y)
---------------------- Zakończenie httpd -------------------------

--------------------- Rozpoczęcie firewalla iptables ------------------------
Wymienione według źródeł hostów:
Odrzucono 87 pakietów na interfejsie eth0
Od 1.4.179.147 - 6 pakietów do tcp(80)
Od 18.162.124.176 - 1 pakiet do tcp(65143)
Od 31.0.0.215 - 5 pakietów do tcp(443)
Od 35.177.95.208 - 12 pakietów do tcp(8540,9617,23303,26527,29609,39086,43222,49478,53273,56460)
Od 50.87.195.61 - 3 pakietów do tcp(10572,41624)
Od 51.79.167.31 - 13 pakietów do tcp(443)
Od 51.81.66.31 - 1 pakiet do tcp(48126)
Od 62.113.227.26 - 1 pakiet do tcp(443)
Od 69.12.68.194 - 1 pakiet do tcp(443)
Od 95.217.235.142 - 1 pakiet do tcp(37591)
Od 102.222.182.13 - 8 pakietów do tcp(443)
Od 104.172.56.131 - 1 pakiet do tcp(5555)
Od 109.42.113.125 - 1 pakiet do tcp(912)
Od 122.225.78.4 - 1 pakiet do tcp(1433)
Od 135.181.17.36 - 3 pakietów do tcp(33993,61005,64615)
Od 173.252.107.5 - 1 pakiet do tcp(443)
Od 176.105.137.72 - 22 pakietów do tcp(993)
Od 185.167.96.138 - 2 pakietów do tcp(587)
Od 185.167.97.229 - 1 pakiet do tcp(993)
Od 192.99.86.56 - 1 pakiet do tcp(8325)
Od 213.202.247.84 - 1 pakiet do tcp(16106)
Od 217.23.4.104 - 1 pakiet do tcp(38334)
---------------------- Zakończenie firewalla iptables -------------------------


--------------------- Rozpoczęcie SpamAssassin ------------------------
Odbiorcy poczty:
sa-milt : 1 czysty, 0 spamu
spamd : 1 czysty, 0 spamu
Podsumowanie:
Łącznie Czyste: 2 (100%)
Łącznie Spam: 0 (0%)
Błędy związane z dziećmi
spamd: nie można wysłać sygnału SIGINT do procesu potomnego [_]: Brak takiego procesu: 2 razy
---------------------- Zakończenie SpamAssassin -------------------------


--------------------- Rozpoczęcie przestrzeni dyskowej ------------------------
System plików Rozmiar Użyte Dostępne Użycie% Zamontowany na
devtmpfs 1,9G 0 1,9G 0% /dev
/dev/vda2 40G 13G 28G 32% /
/dev/vda1 488M 148M 305M 33% /boot
---------------------- Zakończenie przestrzeni dyskowej -------------------------
###################### Zakończenie Logwatch #########################
```

## Analiza dziennika Logwatch

Zacznijmy od sekcji kernela. W przypadku każdego błędu masz określony typ, na przykład: 1130, 1131. Możesz znaleźć wiadomości o błędach tutaj: [https://github.com/torvalds/linux/blob/master/include/uapi/linux/audit.h](https://github.com/torvalds/linux/blob/master/include/uapi/linux/audit.h). Dziękuję bardzo, Linusie Torvaldsie! Ważna jest sekcja:

```vim
/* Wiadomości netlink dla systemu audytu są podzielone na bloki:
* 1000 - 1099 służą do komunikowania się z systemem audytu
* 1100 - 1199 są dla wiadomości zaufanych aplikacji użytkownika
* 1200 - 1299 to wiadomości wewnętrzne demona audytu
* 1300 - 1399 to wiadomości zdarzeń audytu
* 1400 - 1499 to wykorzystanie SE Linux
* 1500 - 1599 to zdarzenia jądra LSPP
* 1600 - 1699 to zdarzenia kryptograficzne jądra
* 1700 - 1799 to rekordy anomalii jądra
* 1800 - 1899 to zdarzenia integralności jądra
* 1900 - 1999 to przyszłe wykorzystanie jądra
* 2000 jest przeznaczone na pozostałe nieklasyfikowane wiadomości audytu jądra (legacy)
* 2001 - 2099 nieużywane (jądro)
* 2100 - 2199 to rekordy anomalii przestrzeni użytkownika
* 2200 - 2299 to działania przestrzeni użytkownika podejmowane w odpowiedzi na anomalie
* 2300 - 2399 to generowane przez przestrzeń użytkownika zdarzenia LSPP
* 2400 - 2499 to zdarzenia kryptograficzne przestrzeni użytkownika
* 2500 - 2999 to przyszłe wykorzystanie przestrzeni użytkownika (może to być związane z etykietami integralności i związanych z nimi zdarzeniami)
*
* Wiadomości od 1000 do 1199 są dwukierunkowe. 1200-1299 i 2100 - 2999 są
* wyłącznie przestrzenią użytkownika. 1300-2099 to komunikacja jądro -> przestrzeń użytkownika.
*/
```

## Korzystanie z auditd do analizy błędów logwatch

Teraz, przynajmniej wiemy, z czym mamy do czynienia. Ale to nie wszystko. Zwróć uwagę na auid=4294967295 jako przykład. Możesz użyć auditd, aby szukać auid.

```bash
ausearch -x sudo -ua 4294967295
```

Oto mały przykład tego, co znalazłem:

```vim
time->Wed Oct 14 09:06:04 2020
type=CRED_REFR msg=audit(1602659164.991:369688): pid=24197 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:unconfined_service_t:s0 msg='op=PAM:setcred grantors=pam_env,pam_unix acct="root" exe="/usr/bin/sudo" hostname=? addr=? terminal=? res=success'

time->Wed Oct 14 09:06:05 2020
type=CRED_DISP msg=audit(1602659165.130:369689): pid=24197 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:unconfined_service_t:s0 msg='op=PAM:setcred grantors=pam_env,pam_unix acct="root" exe="/usr/bin/sudo" hostname=? addr=? terminal=? res=success'
```

To pokazuje, że używałem polecenia sudo. Zgodnie z tym:

```vim
* 1100 - 1199 to wiadomości zaufanych aplikacji użytkownika
```

## Referencje

* [https://github.com/torvalds/linux/blob/master/include/uapi/linux/audit.h](https://github.com/torvalds/linux/blob/master/include/uapi/linux/audit.h)
* [https://www.server-world.info/en/note?os=CentOS_8&p=audit&f=3](https://www.server-world.info/en/note?os=CentOS_8&p=audit&f=3)
* [https://serverfault.com/questions/868689/what-exactly-do-these-kernel-audit-entries-in-logwatch-report-mean](https://serverfault.com/questions/868689/what-exactly-do-these-kernel-audit-entries-in-logwatch-report-mean)
