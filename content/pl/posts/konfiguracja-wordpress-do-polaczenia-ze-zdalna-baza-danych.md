---
title: "Konfiguracja WordPress do połączenia ze zdalną bazą danych"
date: 2019-09-22T17:34:27+00:00 
description: "Konfiguracja WordPress do połączenia ze zdalną bazą danych"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🎅
pinned: true
tags:
- security
series:
-
categories:
- IT Security
image: images/feature2/color-palette.png
---
Cześć,

Opiszę tutaj krok po kroku konfigurację WordPress w konfiguracji dwóch serwerów. Mogą to być serwery fizyczne, lub zainstalowane na wirtualnych maszynach, czy to za pomocą VirtualBox , czy HyperV.  
  
Zazwyczaj spotykamy się z tymi konfiguracjami powyżej, oczywiście są też inne rozwiązania, jak np. w przypadku usługodawcy hostingu, który ma w innym miejscu bazę danych, a w innym trzyma katalog na pliki strony internetowej, lecz ja zajmę się przypadkiem klasycznym, gdy rozróżniamy dwa różne serwery.  
  
Dlaczego takie rozwiązanie? Z prostego powodu &#8211; bezpieczeństwo. Do serwera bazy danych nie ma dostępu z zewnątrz, czyli z Internetu. Jest on za tzw. NAT-em.  
  
Opiszę rozwiązanie, które wdrożyłem u siebie na dwóch laptopach, które pełnią rolę serwerów w domu w celach nauki własnej.  
  
Dotarłeś do tego miejsca? Świetnie! Zaczynajmy.

  1. Serwer bazy danych &#8211; CentOS 7.6
  2. Serwer www &#8211; Debian 9.8.0 , ewentualnie Red Hat, CentOS, Fedora. 

  * _Serwer bazy danych_: Serwer z CentOS, na którym jest zainstalowana baza danych.
  * _Server www_: Serwer z Debian na którym jest zainstalowany WordPress.
  * `wordpress`: Nazwa bazy danych.
  * `user`: Użytkownik &#8211; klient bazy danych WordPress
  * `haslo_uzytkownika_bazy_danych`: hasło użytkownika bazy danych SQL &#8211; wordpress.
  * `192.168.0.11`: Prywatny adres IP serwera bazy danych.
  * `192.168.0.10`: Prywatny adres IP serwera www.
  * `example_user`: Lokalny użytkownik z prawami sudo, który nie jest rootem.
  * `190.100.100.90/example.com`: Publiczny adres serwera , lub nazwa domeny (FQDN).

Zainstaluj serwer bazy danych MariaDB 10.3 na CentOS poleceniem:

``` bash
sudo nano /etc/yum.repos.d/MariaDB.repo
```

Jeśli nie masz nano, to zainstaluj je poleceniem. Używanie jest łatwiejsze, niż vi.

``` bash
sudo yum install nano
```

wklej tę zawartość:

```
# MariaDB 10.3 CentOS repository list - created 2019-03-02 11:00 UTC
# http://downloads.mariadb.org/mariadb/repositories/
[mariadb]
name = MariaDB
baseurl = http://yum.mariadb.org/10.3/centos7-amd64
gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB
gpgcheck=1
```

Wciśnij ctrl+o , aby zapisać. Wciśnij ctrl+x , aby wyjść z nano.

Zainstaluj serwer MariaDB oraz klienta:

``` bash
sudo yum install MariaDB-server MariaDB-client
```

Wystartuj MariaDB serwer

``` bash
sudo systemctl start mariadb
```

Włącz na stałe serwer MariaDB

``` bash
sudo systemctl enable mariadb
```

Sprawdź status usługi MariaDB 

``` bash
sudo systemctl enable mariadb
```

Uruchom obsługę MariaDB poleceniem, ponieważ nie masz nadanego hasła użytkownika root bazy danych.

``` bash
sudo mysql -u root
```

Po zalogowaniu się ustal hasło roota do MariaDB poleceniem:

```
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY 'Twoje_haslo';
FLUSH PRIVILEGES;
exit
```

Zaloguj się do MariaDB wcześniej ustalonym hasłem:

``` bash
mysql -u root -p
```

Sprawdź status MariaDB:

```
status;
exit
```

Wykonaj poniższe polecenie:

``` bash
mysql_secure_installation
```

Wyświetli się poniższe okno, w którym na pytanie o zmianę hasła root odpowiadasz literą n, ponieważ ustalone zostało wcześniej. Pozostałe pozycje potwierdzasz drukowaną literą Y.

![Konfiguracja MariaDB aka dawne MySQL](/images/2019/2019-03-02-12_16_25-Start.png "Konfiguracja MariaDB aka dawne MySQL")
<figcaption>Konfiguracja MariaDB aka dawne MySQL</figcaption>

W CentOS firewall jest zainstalowany domyślnie. Sprawdź, czy jest włączony.

``` bash
firewall-cmd --state
```

Listowanie portów i serwisów firewall

``` bash
firewall-cmd --list-all
```

Dodaj usługę mysql

```bash
firewall-cmd --permanent --add-service=mysql
```

Zrestartuj firewall

``` bash
firewall-cmd --reload
```

Usunięcie usługi lub portu. Nie jest to potrzebne w tym momencie, ale może się przydać kiedyś. Z portu 3360 korzysta MariaDB oraz MySQL. Jeśi chcesz dodać ten port zamiast usługi, co czasem może być rozwiązaniem problemu, to zastąp remove słowem add. 

``` bash
firewall-cmd --permanent --remove-port=3306/tcp
firewall-cmd --permanent --remove-service=mysql
```

Zaloguj się do MariaDB

``` bash
sudo mysql -u root -p
```

Wykonaj poniższe polecenie aby dodać bazę danych o nazwie wordpress

```
CREATE DATABASE wordpress;
```

Wykonaj polecenie, aby utworzyć użytkownika, który będzie korzystać z tej bazy. Nie powinien być to użytkownik root ze względów bezpieczeństwa.

```
CREATE USER 'user'@'localhost' IDENTIFIED BY 'haslo_użytkownika_bazy_danych';
```

Przydziel uprawnienia użytkownikowi _user_

```
GRANT ALL PRIVILEGES ON wordpress.* TO 'user'@'localhost';
```

Utwórz użytkownika oraz przydziel uprawnienia do zdalnego dostępu do bazy danych _wordpress_ dla użytkownika _user_. Adres IP to lokalny adres IP serwera www, na którym znajduje się WordPress. Hasło jest takie samo, jak hasło użytkownika, utworzonego wyżej.

```
CREATE USER 'user'@'192.168.0.10' IDENTIFIED BY 'haslo_użytkownika_bazy_danych';
GRANT ALL PRIVILEGES ON wordpress.* TO 'user'@'192.168.0.10';
```

Wykonaj poniższe polecenia:

```
FLUSH PRIVILEGES;
exit
```

Sprawdź, czy jesteś w stanie zalogować się stworzonym użytkownikiem:

```
mysql -u user -p
status;
exit
```

Na serwerze www z Debian wykonaj następujące polecenie:

``` bash
sudo apt update && sudo apt install mariadb-client php-mysql
```

Sprawdź, czy możesz się zalogować przy pomocy poniższego polecenia:

``` bash
mysql -u user -h 192.168.0.11 -p
```

Sprawdź status MariaDB

```
status;
```

Zamknij połączenie wychodząc z MariaDB.

```
exit
```

### Instalacja WordPress

Utwórz katalog o nazwie src w katalogu swojej witryny, aby przechowywać nowe kopie plików źródłowych WordPress. W tym przewodniku jako przykład wykorzystano katalog domowy /var/www/html/example.com/. Przejdź do tego nowego katalogu:

``` bash
sudo mkdir -p /var/www/html/example.com/src/
cd /var/www/html/example.com/src/
```

Ustaw użytkownika serwera WWW, _www-data_, jako właściciela katalogu domowego swojej witryny. www-data jest grupą.

``` bash
sudo chown -R www-data:www-data /var/www/html/example.com/
```

Zainstaluj najnowszą wersję WordPress i wypakuj ją:

``` bash
sudo wget http://wordpress.org/latest.tar.gz
sudo -u www-data tar -xvf latest.tar.gz
```

Zmień nazwę pliku latest.tar.gz na wordpress, a następnie ustaw datę przechowywania kopii zapasowej oryginalnych plików źródłowych. Będzie to przydatne, jeśli zainstalujesz nowe wersje w przyszłości i będzie potrzeba powrócić do poprzedniej wersji: 

``` bash
sudo mv latest.tar.gz wordpress-`date "+%Y-%m-%d"`.tar.gz
```

Utwórz katalog public\_html, który będzie katalogiem głównym WordPress. Przenieś pliki WordPress do folderu public\_html:

``` bash
sudo mkdir -p /var/www/html/example.com/public_html/
sudo mv wordpress/* ../public_html/
```

Nadaj folderowi public_html uprawnienia dla grupy www-data:

``` bash
sudo chown -R www-data:www-data /var/www/html/example.com/public_html
```

Przejdź do katalogu, do którego wyodrębniono WordPress, skopiuj przykładową konfigurację i ustaw ją tak, aby korzystała ze zdalnej bazy danych:

``` bash
cd /var/www/html/example.com/public_html
sudo cp wp-config-sample.php wp-config.php
```

Zmień zmienne logowania tak, aby pasowały do bazy danych i użytkownika. Zastąp 192.168.0.11 prywatnym adresem IP serwera bazy danych. Edytuj plik:  
/var/www/html/example.com/public_html/wp-config.php 

```
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'user');

/** MySQL database password */
define('DB_PASSWORD', 'haslo_użytkownika_bazy_danych');

/** MySQL hostname */
define('DB_HOST', '192.168.0.11');
```

Dodaj klucze bezpieczeństwa, aby zabezpieczyć wp-admin.  

Użyj <a href="https://api.wordpress.org/secret-key/1.1/salt/" target="_blank" rel="noreferrer noopener" aria-label="Generatora kluczy bezpieczeństwa WordPress (otwiera się na nowej zakładce)">Generatora kluczy bezpieczeństwa WordPress</a>, aby utworzyć losowe, skomplikowane hashe, których WordPress użyje do zaszyfrowania danych logowania. Skopiuj wynik i zastąp odpowiednią sekcję w pliku wp-config.php:

```
/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
define('AUTH_SALT',        'put your unique phrase here');
define('SECURE_AUTH_SALT', 'put your unique phrase here');
define('LOGGED_IN_SALT',   'put your unique phrase here');
define('NONCE_SALT',       'put your unique phrase here');
/**#@-*/
```

### Zabezpieczenie ruchu do i z bazy danych WordPress za pomocą SSL

Domyślnie CentOS ma utworzony katalog z certyfikatami i nie trzeba żadnego katalogu tworzyć. Wejść do niego można:

``` bash
cd /etc/pki/tls/certs/
```

Wygeneruj klucz urzędu certyfikacji i utwórz certyfikat oraz klucz prywatny. Odpowiadaj na odpowiednie monity. Klucz w tym przykładzie wygasa za 100 lat. Zmień wartość dni-dni 36500 w tym i następnych krokach, aby ustawić certyfikaty do wygaśnięcia w razie potrzeby:

``` bash
sudo openssl genrsa 4096 > ca-key.pem
sudo openssl req -new -x509 -nodes -days 36500 -key ca-key.pem -out cacert.pem
```

Common Name ustaw na MariaDB

Utwórz certyfikat serwera i zapisz klucz RSA. Nazwa zwykła (common name) powinna być nazwą FQDN lub adresem IP twojego serwera WWW. W tym przypadku  
190.100.100.90 

``` bash
sudo openssl req -newkey rsa:4096 -days 36500 -nodes -keyout server-key.pem -out server-req.pem
sudo openssl rsa -in server-key.pem -out server-key.pem
```

Podpisz certyfikat:

``` bash
sudo openssl x509 -req -in server-req.pem -days 36500 -CA cacert.pem -CAkey ca-key.pem -set_serial 01 -out server-cert.pem
```

Przenieś klucze i certyfikat na stałe miejsce:

``` bash
mv *.* /etc/pki/tls/certs/ && cd /etc/pki/tls/certs/
```

Wygeneruj klucz klienta. Odpowiadaj na odpowiednie monity i ustaw wspólną nazwę na FQDN lub adres IP swojego serwera WWW: 190.100.100.90 

``` bash
sudo openssl req -newkey rsa:2048 -days 36500 -nodes -keyout client-key.pem -out client-req.pem
```

Zapisz jako klucz RSA

``` bash
sudo openssl rsa -in client-key.pem -out client-key.pem
```

Podpisz certyfikat klienta

``` bash
sudo openssl x509 -req -in client-req.pem -days 36500 -CA cacert.pem -CAkey ca-key.pem -set_serial 01 -out client-cert.pem
```

Zweryfikuj certyfikaty

``` bash
openssl verify -CAfile cacert.pem server-cert.pem client-cert.pem
```

Powinien przy obu wyświetlić OK.

Wyedytuj plik server.cnf na CentOS

``` bash
sudo nano /etc/my.cnf.d/server.cnf
```

Dodaj w sekcji [mysqld]:

```
ssl-ca=/etc/pki/tls/certs/cacert.pem
ssl-cert=/etc/pki/tls/certs/server-cert.pem
ssl-key=/etc/pki/tls/private/server-key.pem
ssl-cipher=ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK
```

Znajdź zakomentowaną linię #bind-address, usuń # , co spowoduje odkomentowanie i ustaw jak poniżej. Adres IP oczywiście zmień na lokalny adres IP serwera CentOS, na którym jest zainstalowana baza danych MariaDB.

```
bind-address    = 192.168.0.11 
```

Wciśnij ctrl+o, a następnie ctrl+x

Przenieś plik server-key do folderu private

``` bash
mv /etc/pki/tls/certs/server-key.pem /etc/pki/tls/private/
```

Zaloguj się do MariaDB i wymagaj protokołu SSL dla wszystkich logowań do bazy danych. Zastąp 192.168.0.10 prywatnym adresem IP

``` bash
sudo mysql -u root -p
```

```
GRANT ALL PRIVILEGES ON wordpress.* TO 'user'@'192.168.0.10' REQUIRE SSL;
FLUSH PRIVILEGES;
exit
```

Zrestartuj serwer MariaDB:

``` bash
sudo systemctl restart mysql
```

Skopiuj certyfikaty i klucz do serwera WWW. Zamień użytkownika example_user na użytkownika serwera WWW, a 192.168.0.10 na prywatny adres IP serwera WWW:

```
scp cacert.pem client-cert.pem client-key.pem example_user@192.168.0.10:~/certs
```

Na serwerze www utwórz katalog i przenieś certyfikaty i klucz do /etc/mysql/ssl:

``` bash
sudo mkdir /etc/mysql/ssl && sudo mv ~/certs/*.* /etc/mysql/ssl
```

Jeśli katalog /etc/mysql/ssl już istnieje, to wykonaj samo polecenie po znaczkach &&.

Skonfiguruj klienta MariaDB serwera WWW do korzystania z SSL. Znajdź sekcję [mysql] w pliku 50-mysql-clients.cnf i dodaj lokalizacje dla certyfikatów i klucza:

``` bash
sudo nano /etc/mysql/mariadb.conf.d/50-mysql-clients.cnf
```

wklej poniższą zawartość w sekcji [mysql]

```
ssl-ca=/etc/mysql/ssl/cacert.pem
ssl-cert=/etc/mysql/ssl/client-cert.pem
ssl-key=/etc/mysql/ssl/client-key.pem
```

W przypadku, gdy masz dwa serwery oparte o Red Hat, CentOS, lub Fedora, wyedytuj plik mysql-clients.cnf

``` bash
sudo nano /etc/my.cnf.d/mysql-clients.cnf
```

wklej do niego poniższa zawartość w sekcję [mysql]

```
ssl-ca=/etc/mysql/ssl/cacert.pem
ssl-cert=/etc/mysql/ssl/client-cert.pem
ssl-key=/etc/mysql/ssl/client-key.pem
```

Zaloguj się z serwera www z Debian do serwera bazy danych MariaDB z CentOS przy pomocy poniższego polecenia:

```
mysql -u user -h 192.168.0.11 -p
```

Jeśli się połączy, wyświetlony zostanie wiersz zachęty MariaDB. Wpisz polecenie:

```
status;
exit
```

Dodaj dyrektywę przed zdalną bazą danych w wp-config, która zmusza WordPress do używania SSL do połączenia z bazą danych:

```
...
define( 'MYSQL_CLIENT_FLAGS', MYSQLI_CLIENT_SSL );

/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'user');

/** MySQL database password */
define('DB_PASSWORD', 'haslo_użytkownika_bazy_danych');

/** MySQL hostname */
define('DB_HOST', '192.168.0.11');
...
```

Uzyskaj dostęp do interfejsu instalacyjnego WordPress poprzez wp-admin. Użyj przeglądarki, aby przejść do example.com/wp-admin. Jeśli połączenie z bazą danych zakończy się powodzeniem, zobaczysz ekran instalacji:

![Instalacja WordPress](/images/2019/remote-db-wp-installation-956x1024.png "Instalacja WordPress")
<figcaption>Instalacja WordPress</figcaption>
