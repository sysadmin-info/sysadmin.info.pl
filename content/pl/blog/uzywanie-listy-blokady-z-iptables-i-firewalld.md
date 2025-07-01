---
title: Używanie listy blokady z iptables i firewalld
date: 2020-10-04T10:09:30+00:00
description: Jeśli masz jakikolwiek serwer podłączony do Internetu, na pewno zdajesz sobie sprawę, że niezależnie od tego, jak mały lub nieistotny się wydaje, jest on często sondowany, testowany lub poddawany różnym próbom nadużycia.
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
image: images/2020-thumbs/firewall.webp
---
Jeśli masz jakikolwiek serwer podłączony do Internetu, na pewno zdajesz sobie sprawę, że niezależnie od tego, jak mały lub nieistotny się wydaje, jest on często sondowany, testowany lub poddawany różnym próbom nadużycia. Ataki te pochodzą od wielu złośliwych hostów, co sprawia, że niemożliwe jest ich ręczne śledzenie. Dlatego zacząłem szukać sposobu na wprowadzenie zautomatyzowanej blokady do użycia z iptables i firewalld, które stosuję na swoich serwerach.

### ipset

Istnieją dobre rozwiązania do wykrywania i blokowania hostów atakujących twój system Linux, takie jak <a href="http://denyhosts.sourceforge.net/" target="_blank" rel="noreferrer noopener">denyhosts</a> lub [fail2ban][1], i gorąco polecam zastosowanie jednego z nich, w zależności od twoich potrzeb. Jednak jeśli hosty są znane w społeczności bezpieczeństwa jako złośliwe, znacznie elegancko jest przechwycić je na wstępie, _przed_ połączeniem się z twoimi usługami. Tutaj przychodzi blokada znanych złośliwych hostów.

Oczywiście nie byłem pierwszy, który zastanawiał się nad wykorzystaniem blokad z iptables. Wiele komercyjnych rozwiązań z zakresu zapór sieciowych regularnie dystrybuuje aktualizacje, dodając sygnatury wykrywania i informacje o blokadach. Ktoś musiał jednak zrobić coś podobnego z iptables i firewalld, pomyślałem. I rzeczywiście, kilka chwil spędzonych na poszukiwaniach online ujawniło wiele pytań i kilka dobrych odpowiedzi. Metoda, która szczególnie mi się podobała, to wykorzystanie <a href="http://ipset.netfilter.org/" target="_blank" rel="noreferrer noopener">ipset</a> do zarządzania dużymi listami adresów IP wewnątrz jądra, eliminując konieczność tworzenia tysięcy reguł iptables lub firewalld. Brzmiało to dokładnie tak, jak chciałem. Teraz potrzebowałem tylko dobrej listy blokowanych hostów.

### Tworzenie listy blokowanych hostów

Trochę więcej poszukiwań doprowadziło mnie na stronę beris.nl, która zawierała zarówno skrypt powłoki do tworzenia obszernej listy blokowanych hostów, jak i sposób jej przekazywania do ipset, dzięki czemu iptables lub firewalld mogły używać tej listy. Odtwarzam ten skrypt poniżej w całości, na wypadek, gdyby oryginalny zniknął. Nie biorę na siebie żadnej odpowiedzialności za napisanie tego skryptu, który został nieco zmodyfikowany przeze mnie, tylko dlatego, że lista wizcrafts nie działa już. Zdecydowałem się użyć listy badips.com.

Zainstalowałem ipset. Następnie utworzyłem katalog w /opt o nazwie blocklist i utworzyłem plik o nazwie blocklist.sh, do którego wkleiłem zawartość poniższego skryptu.

```bash
sudo yum install ipset
cd /opt
sudo mkdir blocklist
sudo vi blocklist.sh
```

Wciśnij klawisz "Insert" w edytorze Vi, następnie skopiuj poniższy skrypt i wklej go prawym przyciskiem myszy do edytora Vi. Następnie naciśnij klawisz "Esc" na klawiaturze, wpisz :x i naciśnij Enter.

```bash
#!/bin/bash
exec 3>&1 4>&2
trap 'exec 2>&4 1>&3' 0 1 2 3
exec 1>log.out 2>&1
set -x
# Wszystko poniżej zostanie zapisane do pliku 'log.out':
source pid.sh
IP_TMP=/tmp/ip.tmp
IP_BLOCKLIST=/etc/ip-blocklist.conf
IP_BLOCKLIST_TMP=/tmp/ip-blocklist.tmp
IP_BLOCKLIST_CUSTOM=/etc/ip-blocklist-custom.conf # opcjonalne
BLACKLISTS=(
"http://www.projecthoneypot.org/list_of_ips.php?t=d&rss=1" # Katalog Project Honey Pot z listą IP atakujących słownikowo
"http://check.torproject.org/cgi-bin/TorBulkExitList.py?ip=1.1.1.1" # Węzły wyjścia TOR
"http://www.maxmind.com/en/anonymous_proxies" # Lista MaxMind GeoIP anonimowych proxy
"https://www.maxmind.com/en/high-risk-ip-sample-list" # Lista próbki MaxMind High Risk
"http://danger.rulez.sk/projects/bruteforceblocker/blist.php" # Lista IP BruteForceBlocker
"https://rules.emergingthreats.net/blockrules/compromised-ips.txt" # Lista rosyjskich sieci biznesowych Emerging Threats
"http://www.spamhaus.org/drop/drop.lasso" # Lista Spamhaus Don't Route Or Peer List (DROP)
"http://cinsscore.com/list/ci-badguys.txt" # Lista IP Malicious C.I. Army
"http://www.autoshun.org/files/shunlist.csv" # Lista IP Autoshun Shun
"http://lists.blocklist.de/lists/all.txt" # Usługa raportowania fail2ban blocklist.de
"https://fx.vc-mp.eu/shared/iplist.txt" # Lista ferex badlist
"https://feodotracker.abuse.ch/downloads/ipblocklist_aggressive.txt" # Tracker FEODO
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

# Pobierz listę iblocklist
wget -qO- http://list.iblocklist.com/?list=erqajhwrxiuvjxqrrwfj&fileformat=p2p&archiveformat=gz > $_input || { echo "$0: Nie można pobrać listy IP."; exit 1; }

# Połącz iblocklist w jedną listę główną
cat $_input >> $IP_BLOCKLIST_TMP

# Połącz bazę danych adresów IP shodan.io
cat /opt/blocklist/shodan.txt >> $IP_BLOCKLIST_TMP

# Posortuj listę
sort $IP_BLOCKLIST_TMP -n | uniq > $IP_BLOCKLIST

# Usuń listę tymczasową
rm $IP_BLOCKLIST_TMP

# Zlicz, ile adresów IP znajduje się na liście
wc -l $IP_BLOCKLIST

# Wyczyść ipset
/usr/sbin/ipset flush blocklist

# Dodaj adresy IP do ipset
grep -v "^#|^$" $IP_BLOCKLIST | while IFS= read -r ip;
do
    /usr/sbin/ipset add blocklist $ip;
done

### Sekcja dla firewalld
firewall-cmd --delete-ipset=blocklist --permanent
firewall-cmd --permanent --new-ipset=blocklist --type=hash:net --option=family=inet --option=hashsize=1048576 --option=maxelem=1048576
firewall-cmd --permanent --ipset=blocklist --add-entries-from-file=/etc/ip-blocklist.conf
firewall-cmd --reload
echo "Wpisy listy ipset firewalld:"
firewall-cmd --permanent --ipset=blocklist --get-entries | wc -l
echo "Wpisy listy ipset:"
cat /etc/ip-blocklist.conf | wc -l
```

### Wyjaśnienie skryptu Bash

```bash
exec 3>&1 4>&2
```

Zapisuje deskryptory plików, aby można je było przywrócić do ich stanu sprzed przekierowania lub używać ich do wyjścia do tego, do czego były przekierowane przed następnym przekierowaniem.

```bash
trap 'exec 2>&4 1>&3' 0 1 2 3
```

Przywraca deskryptory plików dla określonych sygnałów. Zazwyczaj nie jest to konieczne, ponieważ powinny być one przywracane po zakończeniu podpowłoki.

```bash
exec 1>log.out 2>&1
```

Przekierowuje stdout do pliku log.out, a następnie przekierowuje stderr do stdout. Zwróć uwagę, że kolejność jest istotna, gdy chcesz, aby oba wyprowadzały dane do tego samego pliku. stdout musi być przekierowany przed przekierowaniem stderr do stdout.

```bash
set -ex
```

Jeśli ma to zakończyć działanie w przypadku błędu.

Teraz możesz umieścić skrypt w katalogu /opt/blocklist i uruchomić go w tle.

```bash
nohup ./blacklist.sh &>/dev/null &
```

Jeśli chcesz śledzić postęp, po prostu wpisz:

```bash
tail -f log.out
```

Aby przerwać, użyj ctrl+c.

Aby sprawdzić, czy zadanie jest uruchomione, wpisz

```bash
sudo jobs
```

lub

```bash
bg
```

Aby zobaczyć, czy działa to w tle.

W zasadzie to, co robi ten skrypt, to pobiera listy blokowanych adresów IP i adresów IP z różnych witryn hostingowych takie listy oraz lokalny plik txt shodan.io (możesz przygotować więcej niż jedną lokalną bazę złych adresów IP), usuwa wszystko, co nie jest blokiem IP ani adresem, a następnie umieszcza wszystkie te linie w jednym pliku tekstowym. Powoduje to uzyskanie pliku zawierającego tysiące linii (obecnie ponad 100 000 adresów IP). Byłoby to niemożliwe do zarządzania ręcznie. Jeśli ustawisz ten skrypt do uruchamiania raz dziennie z crontab, będziesz miał dość aktualną listę złośliwych hostów. Proszę powstrzymać się od uruchamiania tego skryptu zbyt często, ponieważ witryny, na których hostowane są różne listy źródłowe, muszą płacić za ten ruch. Zbyt częsta aktualizacja prawdopodobnie spowoduje zablokowanie dostępu. Na samym dole, zestaw ipset jest opróżniany, a nowa lista jest dodawana linia po linii do listy blokowanych.

Znalazłem w internecie jedną witrynę, która zawiera listy baz danych IP i domen. Proszę pamiętać, że niektóre z tych witryn nie są aktualizowane lub zostały wyłączone, zhakowane, usunięte itp. Jednak nadal duża część z nich działa, i jest to dobre źródło, od którego możemy zacząć: [http://www.covert.io/threat-intelligence/](http://www.covert.io/threat-intelligence/) aby dodać więcej zasobów do tego skryptu, co jest dosyć proste, lub przygotować ręcznie własne bazy danych w formacie txt, tak jak zrobiłem to w przypadku shodan.io.

#### Adresy IP z Shodan.io

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

Proszę zauważyć, że instrukcje, które następują, są napisane dla CentOS 7, ale powinny być odpowiednie dla innych dystrybucji, ponieważ używamy tylko wiersza poleceń.

### Dodawanie skryptu do crontab.

Edytuj crontab za pomocą tego polecenia:

```bash
sudo crontab -e
```

Dodaj tę linię:

```bash
0 0 * * sun python -c 'import random; import time; time.sleep(random.random() * 3600)' && /opt/blocklist/blocklist.sh
```

Skrypt uruchamia się każdego niedzielnego północu. Dodałem funkcję losowej godziny (3600 sekund), co zapobiega sytuacji, gdy wszyscy próbują pobierać listy IP z serwerów o tej samej porze. Zalecam zmianę godzin w tym zadaniu. **Bądź ostrożny, bo mogą cię zbanować, jeśli będziesz próbował pobierać IP zbyt często**.

Doskonałe przykłady cronjobów znajdziesz tutaj: [https://crontab.guru/](https://crontab.guru/)

### Podłączanie listy blokowanej do firewalld

Uruchomienie tego skryptu z wiersza poleceń nie powiedzie się w tej chwili. Chociaż utworzy plik listy blokowanej w /etc/ip-blocklist.conf, nie będzie w stanie załadować ipset, ponieważ jeszcze nie utworzyliśmy ipset o nazwie "blocklist". Możemy utworzyć go ręcznie w następujący sposób:

```bash
sudo ipset create blocklist hash:net hashsize 1048576 maxelem 1048576
sudo firewall-cmd --permanent --new-ipset=blocklist --type=hash:net --option=family=inet --option=hashsize=1048576 --option=maxelem=1048576
```

To polecenie tworzy ipset o nazwie "blocklist" o typie "hash:net". Ten typ ipset służy do przechowywania adresów IP o różnych rozmiarach, począwszy od dużych bloków sieciowych aż do pojedynczych hostów. Uruchomienie powyższego skryptu teraz utworzy listę blokowaną i wypełni ipset utworzoną listą blokowaną. Następnie musimy dodać regułę do firewalld, aby używał listy blokowanej. Zalecam wstawienie tej reguły na początku lub blisko początku łańcucha INPUT, aby była przetwarzana wcześnie w twoim zestawie reguł. Spójrzmy teraz na łańcuch INPUT, aby wiedzieć, gdzie wstawić nową regułę. Rozmiar hasha i wartość maxelem to potęga liczby 2.

```bash
sudo iptables -L INPUT -n -v --line-numbers
Łańcuch INPUT (polityka ACCEPT 0 pakietów, 0 bajtów)
num pkts bajty target prot opt in out source destination
1 20133 19M ACCEPT all -- * * 0.0.0.0/0 0.0.0.0/0 ctstate RELATED,ESTABLISHED
2 112 6720 ACCEPT all -- lo * 0.0.0.0/0 0.0.0.0/0
3 1232 57168 INPUT_direct all -- * * 0.0.0.0/0 0.0.0.0/0
4 1086 49520 INPUT_ZONES all -- * * 0.0.0.0/0 0.0.0.0/0
5 14 680 LOG all -- * * 0.0.0.0/0 0.0.0.0/0 ctstate INVALID LOG flags 0 level 4 prefix "STATE_INVALID_DROP: "
6 14 680 DROP all -- * * 0.0.0.0/0 0.0.0.0/0 ctstate INVALID
7 449 19404 LOG all -- * * 0.0.0.0/0 0.0.0.0/0 LOG flags 0 level 4 prefix "FINAL_REJECT: "
8 449 19404 REJECT all -- * * 0.0.0.0/0 0.0.0.0/0 reject-with icmp-host-prohibited
```

Powyższa komenda wyświetla wszystkie obecne reguły w łańcuchu INPUT iptables, z numerami linii, co ułatwia wstawienie nowej reguły. Fragment mojego łańcucha INPUT można zobaczyć powyżej. Pierwsza reguła akceptuje cały ruch, druga reguła akceptuje cały ruch na interfejsie pętli zwrotnej, i zostawimy je na górze. Szósta reguła odrzuca wszystkie przychodzące pakiety w nieprawidłowym stanie, co jest dobrze. Reguła poniżej tego loguje liczbę odrzuconych przychodzących połączeń. Ponieważ jest to już dość konkretne, wstawmy naszą nową regułę powyżej tej.

```bash
sudo iptables -I INPUT 7 -m set --match-set blocklist src -j DROP
sudo firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 7 -m set --match-set blocklist src -j DROP
```

To polecenie wstawia naszą regułę na pozycji 7 w łańcuchu INPUT i dopasowuje przychodzący ruch do zbioru o nazwie „blocklist”, odrzucając odpowiedni ruch. W tym momencie iptables cicho odrzuca cały ruch pochodzący od hostów i bloków sieciowych znajdujących się na liście blokowanej. Jednak jeśli chcemy zobaczyć, co jest blokowane, musimy dodać regułę logowania powyżej reguły 7. Ponieważ jestem ciekawy, co jest blokowane, dodałem następującą regułę:

```bash
sudo iptables -I INPUT 7 -m set --match-set blocklist src -j LOG --log-prefix "IP Blocked: "
sudo firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 7 -m set --match-set blocklist src -j LOG --log-prefix "IP Blocked: "
```

Ta reguła jest wstawiana na pozycji 7, przesuwając regułę odrzucania na pozycję 8. Teraz każdy przychodzący ruch odpowiadający naszej liście blokowanej jest najpierw logowany z prefiksem „IP Blocked:” przez regułę 7, a następnie odrzucany przez regułę 8. W logach możemy zobaczyć coś takiego:

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

Tutaj widzimy kilka prób połączenia się z serwerem przez hosty o różnych adresach IP. Te połączenia nig

dy nie zostaną nawiązane, ponieważ iptables jest gotowy do pracy.

Ponieważ reguły, które napisaliśmy, wydają się działać, musimy je zapisać, aby zostały ponownie załadowane, jeśli iptables zostanie ponownie uruchomiony. W CentOS 7 możemy użyć do tego celu iptables. Wydanie poniższej komendy zapisze reguły w /etc/sysconfig/iptables.

```bash
sudo service iptables save
```

#### Tworzenie ipset przy uruchamianiu systemu

Do tej pory udało nam się pobrać i skompilować obszerną listę blokowanych adresów, nauczyliśmy się, jak wczytać ją do ipset i podłączyć to ipset do iptables lub firewalld jako listę blokowaną. Ustawiliśmy również regułę do logowania prób połączenia z naszej listy blokowanej. Jak dotąd wszystko jest w porządku. Jednak istnieje jeszcze jeden problem. W momencie ponownego uruchomienia serwera, zauważysz, że zapora nie może zainicjować zapisanych przez iptables/firewalld reguł, ponieważ odwołuje się do ipset, który nie istnieje. Będziemy potrzebować sposobu na tworzenie ipset podczas uruchamiania systemu. Przeszukałem wiele dokumentacji, ale wydaje się, że jest niewiele dostępnych informacji. Ostatecznie zdecydowałem, że stworzenie skryptu do tworzenia i wypełniania ipset, gdy jedna lub więcej interfejsów Ethernetowych zostaną uruchomione, ma sens. W tym celu stworzyłem skrypt do uruchamiania podczas inicjalizacji systemu sieciowego.

1. Utwórz plik o nazwie `ipset.sh` w lokalizacji `/usr/local/bin/`:

```bash
sudo vi /usr/local/bin/ipset.sh
```

2. Wstaw następujący skrypt dokładnie w taki sam sposób jak wcześniej:

```bash
#!/bin/bash

# Skrypt do konfiguracji ipset o nazwie "blocklist"
# do zapełniania go za pomocą skryptu "update-blocklist.sh"

BLISTFILE="/etc/ip-blocklist.conf"
IPSET=/sbin/ipset

# Upewnij się, że nie istnieje lista blokowana!
$IPSET flush blocklist && $IPSET destroy blocklist

# Ponownie tworzy i zapełnia listę blokowaną
$IPSET create blocklist hash:net
egrep -v "^#|^$" $BLISTFILE | while IFS= read -r ip
do
    ipset add blocklist $ip
done
```

Ten skrypt najpierw sprawdza, czy nie istnieje ipset o nazwie "blocklist", opróżnia i usuwa jakikolwiek istniejący ipset o tej nazwie. Następnie (ponownie) tworzy ipset o nazwie "blocklist" i zapełnia go, używając pliku `/etc/ip-blocklist.conf`, który wcześniej utworzyliśmy. Następnie zintegrowałem ten skrypt z nową jednostką usługi systemd, dodając go jako skrypt uruchamiany po konfiguracji interfejsu sieciowego w pliku `/etc/systemd/system/ipset_blocklist.service`:

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

3. Przeładuj proces systemd, aby uwzględniał nowo utworzoną usługę:

```bash
sudo systemctl daemon-reload
```

4. Włącz tę usługę, aby uruchamiała się automatycznie po ponownym uruchomieniu:

```bash
sudo systemctl enable ipset_blocklist.service
```

5. Uruchom usługę:

```bash
sudo systemctl start ipset_blocklist.service
```

W systemie Debian/Ubuntu można zintegrować to nieco inaczej, dodając go jako skrypt uruchamiany po konfiguracji interfejsu sieciowego w pliku `/etc/network/interfaces`:

```vim
# Główny interfejs sieciowy
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

Kiedy interfejs główny (w wielu przypadkach eth0) jest gotowy, ipset jest tworzony i zapełniany, uruchamiając skrypt `/usr/local/bin/ipset.sh`. W momencie inicjalizacji iptables ipset jest dostępny i wypełniony, więc szkodliwe hosty są blokowane niemal natychmiast. Po wykonaniu tych kroków nasza lista blokowanych adresów przetrwa ponowne uruchomienie, zapewniając nam ciągłą ochronę.

### firewalld ipset

Skrypt zawiera dodatkową część dla firewalld, która jest wynikiem poszukiwań rozwiązania dla dystrybucji z rodziny Red Hat.

```vim
firewall-cmd --delete-ipset=blocklist --permanent
firewall-cmd --permanent --new-ipset=blocklist --type=hash:net --option=family=inet --option=hashsize=1048576 --option=maxelem=1048576
firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 3 -m set --match-set blocklist src -j LOG --log-prefix "Zablokowany IP: "
firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 3 -m set --match-set blocklist src -j DROP
firewall-cmd --permanent --ipset=blocklist --add-entries-from-file=/etc/ip-blocklist.conf
firewall-cmd --reload
firewall-cmd --permanent --ipset=blocklist --get-entries | wc -l
ipset list blocklist | wc -l
```

Pierwsza linia usuwa istniejący ipset. Druga dodaje go z odpowiednim rozmiarem hasha i maksymalną ilością elementów (adresów IP), które można dodać do ipset. Trzecia dodaje dwie reguły do rejestrowania i odrzucania złych adresów IP. Piąta reguła wczytuje złe adresy IP z lokalnego pliku utworzonego przez skrypt. Następnie przeładowuje firewalld, aby zastosować nowe ustawienia ipset. Przedostatnia linia liczy wszystkie adresy IP w ipsecie firewalld, a ostatnia linia liczy adresy IP w ipsecie.

Aby włączyć rejestrowanie odrzuconych połączeń, wykonaj ten polecenie.

```bash
firewall-cmd --set-log-denied=all
```

Zmienia to wartość w pliku `/etc/firewalld/firewalld.conf`. Możesz sprawdzić to polecenie:

```bash
cat /etc/firewalld/firewalld.conf | grep -i "LogDenied=all"
```

Ostatecznie zdecydowałem się wyłączyć rejestrowanie złych adresów IP, ponieważ tworzyło to duży bałagan w dzienniku wiadomości. Zmieniłem to w ten sposób.

```sudo vi /etc/firewalld/direct.xml```

Zawartość tego pliku wygląda następująco:

```xml
<?xml version="1.0" encoding="utf-8"?>
<direct>
<rule priority="3" table="filter" ipv="ipv4" chain="INPUT">-m set --match-set blacklist src -j LOG --log-prefix 'Zablokowany IP: '</rule>
<rule ipv="ipv4" table="filter" chain="INPUT" priority="3">-m set --match-set blacklist src -j DROP</rule>
</direct>
```

Usunąłem tylko pierwszą regułę:

```bash
<rule priority="3" table="filter" ipv="ipv4" chain="INPUT">-m set --match-set blacklist src -j LOG --log-prefix 'Zablokowany IP: '</rule>
```

Do filtrowania używam poleceń takich jak te poniżej:

```bash
sudo tail -f /var/log/messages
sudo firewall-cmd --get-log-denied
sudo dmesg | grep -i DROP
sudo dmesg | grep -i REJECT
```

Było to lepsze, ale wszystko trafiło do `/var/log/messages`. To jest błąd. Postanowiłem przekierować te wiadomości do osobnych dzienników. Oto, jak to zrobiłem.

```bash
sudo vi /etc/rsyslog.d/firewalld.conf
```

Dodałem tam te linie:

```vim
:msg,contains,"_DROP" /var/log/firewalld-dropped_log
:msg,contains,"_REJECT" /var/log/firewalld-rejected_log
& stop
```

Zapisałem plik i zakończyłem. Następnie postanowiłem stworzyć logrotate dla tych dzienników.

```bash
sudo vi /etc/logrotate.d/firewalld-dropped_log
```

Dodałem ten zawartość:

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
echo "Wykonała się rotacja firewalld-dropped_log." | mail mail@example.com
endscript
}
```

Następnie zrobiłem to samo dla odrzuconych.

```bash
sudo vi /etc/logrotate.d/firewalld-rejected_log
```

I dodałem:

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
echo "Wykonała się rotacja firewalld-rejected_log." | mail mail@example.com
endscript
}
```

Świetnie, to było to, co chciałem, ale nadal wiadomości były nieczytelne, więc postanowiłem edytować `rsyslog.conf` i zmienić go zgodnie z rozwiązaniem z tej strony internetowej: [https://serverfault.com/questions/557885/remove-iptables-log-from-kern-log-syslog-messages](https://serverfault.com/questions/557885/remove-iptables-log-from-kern-log-syslog-messages)

```bash
sudo vi /etc/rsyslog.conf
```

Znajdź część z regułami i zmodyfikuj ją zgodnie z poniższym przykładem.

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

Zostaw wszystko p

oniżej bez zmian.

Następnie edytuj poniższy plik:

```bash
sudo vi /etc/audisp/plugins.d/syslog.conf
```

I ustaw linię `args` w ten sposób:

```vim
args = LOG_INFO
```

Następnie zrestartuj `auditd` i `rsyslog` za pomocą poniższych poleceń:

```bash
sudo service auditd restart && sudo service rsyslog restart
```

Następnie zdecydowałem się pobrać `multitail`, aby móc monitorować je jednocześnie.

```bash
sudo yum install multitail
```

Następnie uruchomiłem to w ten sposób:

```bash
sudo multitail /var/log/firewalld-dropped_log /var/log/firewalld-rejected_log /var/log/firewalld /var/log/kern /var/log/kern-info_log /var/log/kern-warnings_log
```

To było fajne, ale nadal nieczytelne, więc postanowiłem poszukać rozwiązania dotyczącego wiadomości jądra. I znalazłem je tutaj: [https://superuser.com/questions/351387/how-to-stop-kernel-messages-from-flooding-my-console](https://superuser.com/questions/351387/how-to-stop-kernel-messages-from-flooding-my-console)

Rozwiązanie było proste, i zmieniłem wartości w ten sposób:

```bash
sudo sysctl -w kernel.printk="3 4 1 3"
```

Następnie sprawdziłem te wartości tym poleceniem:

```bash
sudo sysctl kernel.printk
```

### Konfiguracja parametrów jądra w czasie rzeczywistym - wyjaśnienie

Zobacz `man sysctl` - „konfiguracja parametrów jądra w czasie rzeczywistym” aby dowiedzieć się więcej.

Przypomnienie o poziomach ważności i czterech wartościach kernel.printk:

  * CUR = bieżący poziom ważności; tylko komunikaty ważniejsze niż ten poziom są wyświetlane
  * DEF = domyślny poziom ważności przypisywany do komunikatów bez poziomu
  * MIN = minimalny dopuszczalny CUR
  * BTDEF = domyślny CUR przy uruchamianiu

Na moim CentOS: 7 4 1 7

```vim
                     CUR  DEF  MIN  BTDEF
0 - awaryjny         x              x                        
1 - alarm            x         x    x
2 - krytyczny        x              x
3 - błąd             x              x
4 - ostrzeżenie      x    x         x
5 - ogłoszenie       x              x
6 - informacyjny     V              V
7 - debugowanie
```

To jest zbyt głośne, chcę tylko krytyczne i wyżej (bez błędów). Komunikaty bez etykiety powinny być traktowane jako ostrzeżenia, więc DEF jest dobry:

```vim
                     CUR  DEF  MIN  BTDEF
0 - awaryjny         x              x                        
1 - alarm            x         x    x
2 - krytyczny        x              x
3 - błąd             V              V
4 - ostrzeżenie           x         
5 - ogłoszenie                           
6 - informacyjny                       
7 - debugowanie
```

Ustaw na: 3 4 1 3 i problem rozwiązany. Teraz, gdy używam multitail do oglądania logów, widzę wszystko jak należy.

Ostatnią rzeczą, którą musiałem zrobić, było dodanie do białej listy adresów IP Google, ponieważ e-maile z Gmaila były odrzucane, ponieważ powyższe rozwiązanie blokowało adresy IP. Zrobiłem to w ten sposób.

```bash
sudo -i 
(wprowadź swoje hasło sudo)
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

Powyższe polecenia pozwalają zapisać ich adresy IP w dwóch plikach. **<span class="has-inline-color has-vivid-red-color">Musisz je oczyścić i pozostawić tylko adresy IP (jeden IP na linię)</span>**. Następnie utworzyłem białą listę i dodałem do niej adresy IP z tych dwóch plików.

Po tym naciśnij ctrl+d, aby się wylogować i wrócić do standardowego użytkownika.

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

Wówczas wystarczy tylko ponownie załadować zasady firewalld.

```bash
sudo firewall-cmd --reload
```

Jeśli masz jakiekolwiek poprawki lub wskazówki dotyczące powyższego, chętnie je usłyszę. Jeśli ten post w jakikolwiek sposób Ci pomógł, również chciałbym o tym usłyszeć.

### Referencje

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