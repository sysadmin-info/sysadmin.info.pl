---
title: fail2ban – instalacja i konfiguracja
date: 2019-09-28T07:04:56+00:00
description: fail2ban – instalacja i konfiguracja
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
    image: images/2019-thumbs/fail2ban.webp
---
Uwaga, poniższy tutorial jest fragmentem mojej pracy inżynierskiej pt.: &#8222;Utwardzanie serwera sieciowego opartego o system Linux.&#8221; pod kierunkiem dr. hab. Kordiana Smolińskiego w Katedrze Fizyki Teoretycznej WFiIS UŁ obronionej w czerwcu 2019.

{{< tabs CentOS Ubuntu >}}
  {{< tab >}}
  ### CentOS
  Aby zainstalować Fail2Ban na CentOS 7.6, w pierwszej kolejności trzeba będzie zainstalować repozytorium EPEL (ang. _Extra Packages for Enterprise Linux_). EPEL zawiera dodatkowe pakiety dla wszystkich wersji CentOS, jednym z tych dodatkowych pakietów jest Fail2Ban.
  ```
  sudo yum install epel-release
  sudo yum install fail2ban fail2ban-systemd
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian/Ubuntu
  Dla Debian/Ubuntu wystarczy komenda:
  ```
  sudo apt-get install fail2ban
  ```
  {{< /tab >}}
{{< /tabs >}}

W przypadku CentOS następnym kroku należy zaktualizować zasady SELinux. (uwaga: na mikr.us nie ma zainstalowanego SELinux).

```
sudo yum update -y selinux-policy*
```

Debian i Ubuntu posiadaja AppArmor. 


Po zainstalowaniu, będziemy musieli skonfigurować i dostosować oprogramowanie za pomocą pliku konfiguracyjnego jail.local. Plik jail.local zastępuje plik jail.conf i jest używany w celu zapewnienia bezpieczeństwa aktualizacji konfiguracji użytkownika.

Zrób kopię pliku jail.conf i zapisz go pod nazwą jail.local: zaktualizuj politykę SELinux:

```
cp -pf /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Otwórz plik jail.local do edycji w Vim za pomocą następującego polecenia:

```
sudo -e /etc/fail2ban/jail.local
```

Kod pliku może składać się z wielu linii kodów, które wykonują się, aby zapobiec zablokowaniu jednego lub wielu adresów IP, ustawić czas trwania bantime, itp. Typowy plik konfiguracyjny więzienia zawiera następujące linie:

```
[DEFAULT]
ignoreip = 127.0.0.1/8
ignorecommand =
bantime = 600
findtime = 600
maxretry = 5
backend = systemd
```

  * IgnoreIP służy do ustawienia listy adresów IP, które nie będą zakazane. Lista adresów IP powinna być podana z separatorem spacji. Ten parametr jest używany do ustawienia osobistego adresu IP (jeśli istnieje dostęp do serwera ze stałego adresu IP).
  * Parametr Bantime służy do ustawienia czasu trwania sekund, na które host ma zostać zbanowany.
  * Findtime jest parametrem, który służy do sprawdzenia, czy host musi zostać zbanowany czy nie. Gdy host generuje maksimum w ostatnim findtime, jest on banowany.
  * Maxretry jest parametrem używanym do ustawienia limitu liczby prób przez hosta, po przekroczeniu tego limitu, host jest banowany.

#### Dodawanie pliku więzienia (ang. jail), w celu ochrony SSH.

Utwórz nowy plik za pomocą edytora Vim.

```
sudo -e /etc/fail2ban/jail.d/sshd.local
```

Do powyższego pliku należy dodać następujące wiersze kodu.

```
[sshd]
enabled = true
port = ssh
action  = iptables-allports
# logpath = /var/log/secure # manualne ustawienie ścieżki 
logpath = %(sshd_log)s
findtime = 600
maxretry = 3
bantime = 86400
```

W przypadku, gdy używasz iptables , action ustaw jak poniżej:

```
action = iptables-allports
```

  * Parametr enable jest ustawiony na wartość true, w celu zapewnienia ochrony, aby wyłączyć ochronę, jest ustawiony na false. Parametr filtra sprawdza plik konfiguracyjny sshd, znajdujący się w ścieżce /etc/fail2ban/filter.d/sshd.conf.
  * Parametr action służy do wyprowadzenia adresu IP, który musi być zakazany za pomocą filtra dostępnego w pliku /etc/fail2ban/action.d/iptables-allports.conf.
  * Parametr port można zmienić na nową wartość, np. port=2244, jak to ma miejsce w tym przypadku. W przypadku korzystania z portu 22, nie ma potrzeby zmiany tego parametru.
  * Ścieżka logowania podaje ścieżkę, na której zapisany jest plik logu. Ten plik dziennika jest skanowany przez Fail2Ban.
  * Maxretry służy do ustawienia maksymalnego limitu nieudanych wpisów logowania.
  * Parametr Bantime służy do ustawienia czasu trwania sekund, na który host musi zostać zablokowany.

#### Uruchomienie usługi Fail2Ban

Jeśli jeszcze nie używasz zapory sieciowej CentOS, uruchom ją:

```
sudo systemctl enable firewalld
sudo systemctl start firewalld
```

Jeśli używasz iptables, to:

```
sudo systemctl enable iptables
sudo systemctl start iptables
```

Wykonaj poniższe plecenia, aby uruchomić Fail2Ban na serwerze.

```
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### Śledzenie wpisów logowania fail2ban

Poniższe polecenie służy do sprawdzenia, które próby zalogowania się do serwera przez post ssh nie powiodły się.

```
cat /var/log/secure | grep 'Failed password'
```

Wykonanie powyższej komendy spowoduje wyświetlenie listy nieudanych prób wprowadzenia hasła głównego z różnych adresów IP. Format wyników będzie podobny do pokazanego poniżej:

```
Feb 12 19:27:12 centos sshd[25729]: Failed password for root from 150.10.0.107 port 9074 ssh2
Feb 13 15:05:35 deb_usr sshd[1617]: Failed password for invalid user pi from 42.236.138.215 port 58182 ssh2
```

#### Sprawdzanie zbanowanych adresów IP przez Fail2Ban

Poniższe polecenie służy do uzyskania listy zablokowanych adresów IP, które zostały rozpoznane jako zagrożenia metodą brute force.

```
iptables -L –n
```

#### Sprawdzanie statusu Fail2Ban

Użyj następującej komendy, aby sprawdzić status plików jail w Fail2Ban:

```
sudo fail2ban-client status
```

Wynik powinien być podobny do tego:

```
# fail2ban-client status
Status
|- Number of jail: 1
`- Jail list: sshd
```

Poniższe polecenie wyświetli zbanowane adresy IP dla danego więzienia (jail).

```
sudo fail2ban-client status sshd
```
#### Usunięcie zbanowanego adresu IP

W celu usunięcia adresu IP z zablokowanej listy, parametr IPADDRESS jest ustawiony na odpowiedni adres IP, który wymaga odbanowania. Nazwa &#8222;sshd&#8221; jest nazwą więzienia, w tym przypadku jest to więzienie &#8222;sshd&#8221;, które skonfigurowaliśmy powyżej. Poniższe polecenie pozwala usunąć adres IP.

```
sudo fail2ban-client set sshd unbanip IPADDRESS
```
#### Dodawanie własnego filtra w celu zwiększenia ochrony

Fail2ban umożliwia tworzenie własnych filtrów. Poniżej krótki opis konfiguracji jednego z nich.

1.Należy przejść do katalogu filter.d Fail2ban:

```
sudo cd /etc/fail2ban/filter.d
```

2.Utworzyć plik wordpress.conf i dodać do niego wyrażenie regularne.

```
sudo -e wordpress.conf
```

```
#Fail2Ban filter for WordPress
[Definition]
failregex =  - - [(\d{2})/\w{3}/\d{4}:\1:\1:\1 -\d{4}] "POST /wp-login.php HTTP/1.1" 200
ignoreregex =
```

Zapisać i zamknąć plik.

3.Dodać sekcję WordPress na końcu pliku jail.local:

```
$ sudo -e /etc/fail2ban/jail.local
```

```
[wordpress]
enabled = true
filter = wordpress
logpath = /var/log/httpd/access_log 
#CentOS Zwróć uwagę, czy jest _ czy . 
# W pliku /etc/httpd/conf/httpd.conf masz informację, 
# gdzie jest zapisywany log.
# logpath = /var/log/apache2/access.log // Ubuntu/Debian
port = 80,443
```

Jeśli chcemy banować boty, wystarczy dodać akcję, czas bana oraz ilość prób, jak w przypadku jail sshd opisanego wyżej.

W tym celu użyty zostanie domyślny ban i akcja e-mail. Inne akcje mogą być zdefiniowane przez dodanie akcji = linia.  
Zapisz i wyjdź, a następnie uruchom ponownie Fail2ban poleceniem:

```
sudo systemctl restart fail2ban
```

Sprawdź również, czy Twój regex działa:

```
fail2ban-regex /var/log/apache2/access.log /etc/fail2ban/filter.d/wordpress.conf
```
