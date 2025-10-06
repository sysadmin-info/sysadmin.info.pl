---
title: Instalacja serwera web na mikr.us z użyciem MariaDB i silnikiem MyISAM
date: 2019-09-22T17:38:56+00:00
description: Instalacja serwera web na mikr.us z użyciem MariaDB i silnikiem MyISAM
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
    image: images/2019-thumbs/mariadb.webp
---

Cześć,

Trafiła się okazja jak ślepej kurze ziarno dawno temu i upolowałem domenę za darmo sysadmin.info.pl. Pierwotnie zamysł był taki, aby użyć jej do pracy inżynierskiej i tak też się stało. Trzy miesiące później znów nadarzyła się okazja, której nie mogłem przegapić. Tym razem wirtualna maszyna na OpenVZ za śmieszne wręcz pieniądze. Zainteresowanych odsyłam do <a rel="noreferrer noopener" aria-label=" (otwiera się na nowej zakładce)" href="https://mikr.us/?r=a101" target="_blank">https://mikr.us</a>. Po kliknięciu w link dostaniesz 5% zniżki na serwer na rok.

Tym sposobem stało się możliwe posiadanie wersji live własnej strony, której konfigurację opiszę poniżej krok po kroku. Przy okazji pokażę jak to można wszystko dobrze zabezpieczyć i udowodnić, że domyślna konfiguracja 128 MB RAM i 128 MB swap w zupełności wystarcza, aby posiadać stronę opartą o a jakże popularny CMS WordPress, który jest najczęściej atakowanym CMS-em na świecie. Ale o tym może w innym wpisie. Hardening Linux był tematem mojej pracy inżynierskiej, więc przy okazji podzielę się paroma uwagami związanymi z tą tematyką, jak i też pokażę, co na mikrusie można, a czego nie można. 

Poprosiłem o zmianę domyślnego Ubuntu 16:04 na CentOS 7 i dostałem wersję 7.6. No bomba, to mi się podoba. Po małych problemach udało mi się w końcu przywrócić moją stronę do żywych i przy okazji odświeżyć sobie wiedzę z zakresu stawiania serwera web na CentOS. A więc zaczynamy. 

### Założenie konta na cloudflare.com i ustawienie domeny

Załóż darmowe konto (free basic) na <a rel="noreferrer noopener" aria-label="https://www.cloudflare.com/ (otwiera się na nowej zakładce)" href="https://www.cloudflare.com/" target="_blank">https://www.cloudflare.com/</a>

Potwierdź maila i przejdź do konfiguracji domeny tam, gdzie masz panel od domeny. Zmień tam serwery DNS (ns1 oraz ns2) na:

> aragorn.ns.cloudflare.com
> vida.ns.cloudflare.com

Zaloguj się do cloudflare. Dodaj domenę (add domain).  
Ustaw rekord AAAA , jako name nazwę domeny i jako adres IPv6 adres w wersji IPv6. Znajdziesz ten adres wpisując w terminalu polecenie:

```bash
sudo ip a
```

Będzie on podany w tej postaci: 2001: &#8230;. 

Skopiuj go sobie, albo spisz bez ostatnich elementów: /128 

Wklej go w pole content. Zapisz zmianę.

Kliknij w ikonę SSL/TLS i ustaw jak na obrazku poniżej:

![Cloudflare Web Performance and Security](/images/2019/Cloudflare-Web_Performance_and_Security.webp "Cloudflare Web Performance and Security")
<figcaption>Cloudflare Web Performance and Security</figcaption>

Kliknij w Edge Certificates i ustaw:

![Cloudflare Edge Certificates](/images/2019/Cloudflare-Edge_Certificates.webp "Cloudflare Edge Certificates")
<figcaption>Cloudflare Edge Certificates</figcaption>

Poniżej będą opcje, które powinny być włączone:

![Cloudflare Settings](/images/2019/Cloudflare-settings1.webp)
<figcaption>Cloudflare Settings</figcaption>

![Cloudflare Settings](/images/2019/Cloudflare-settings2.webp)
<figcaption>Cloudflare Settings</figcaption>

Następnie kliknij w Page rules i dodaj regułę klikając w Create Page Rule.

Nazwę domeny na np. http://strona.com.pl (pamiętaj o http nie https).  
Wybierz Automatic HTTPS rewrites z rozwijanej listy i ustaw na ON.  
Kliknij save and deploy.

W razie pytań o inne ustawienia, napisz w komentarzu, co Ciebie nurtuje.

### Logowanie ssh oraz jego zabezpieczenie.

Dostęp do wirtualnej maszyny jest możliwy tylko i wyłącznie po ssh.  
W pierwszej kolejności należy dla bezpieczeństwa zmienić hasło root, ponieważ dostajemy tymczasowe hasło do logowania, adres serwera i możemy użyć do pierwszego logowania tylko i wyłącznie konta root, co samo w sobie bezpieczne nie jest.

```bash
passwd root
```

Po ustawieniu hasła, musimy dodać sobie użytkownika, którego będziemy używać do logowania się po ssh i w zastępstwie za root, ze względów bezpieczeństwa, Aby jednak móc w razie potrzeby wykonać czasem polecenia na prawach roota, dodamy użytkownika do grupy sudoers.

```bash
useradd user
passwd user
usermod -aG wheel user
systemctl daemon reload
```

W następnej kolejności należy zablokować użytkownika root dla połączeń ssh. W tym celu trzeba edytować plik sshd_config.

```bash
vi /etc/ssh/sshd_config
```

Znajdujemy wpis i ustawiamy go w ten sposób: `PermitRootLogin no` Aby móc edytować , wciskamy insert, zmieniamy wartość z yes na no. W następnej kolejności wciskamy Esc, wpisujemy :wq i naciskamy Enter. W ten sposób zapisaliśmy zmiany. Teraz pozostaje jeszcze restart demona ssh.

```bash
systemctl restart sshd
```

Zakładam, że każdy wie, jak się łączyć do serwera przy pomocy terminala czy putty. Poniżej opiszę dwie metody generowania pary kluczy (prywatnego i publicznego) zarówno w putty, jak i w terminalu. Otwórz PuTTYgen.exe, naciśnij przycisk Generate, porusz myszą, w celu wygenerowania losowo pary kluczy z wykorzystaniem algorytmu RSA. Po wygenerowaniu kluczy wpisz hasło (passphrase) (wybierz „trudne do odgadnięcia”). Zapisz klucz publiczny. Zapisz klucz prywatny. 2048 bitów w zupełności wystarczy, lecz jeśli ktoś chce zwiększyć poziom bezpieczeństwa, może ustawić 4096 bitów w oknie.<figure class="wp-block-image">

![PuTTYgen](/images/2019/PuTTYgen.webp)
<figcaption>PuTTYgen</figcaption>

Następnie po zalogowaniu się przy pomocy ssh i swojego konta użytkownika, w naszym przypadku będzie to user, wykonaj poniższe polecenia.

```bash
cd /home/user
sudo mkdir .ssh
sudo chmod 700 .ssh
cd .ssh
sudo vi authorized_keys
```

Kopiujemy z pola od ssh-rsa do końca wszystko, przechodzimy do zalogowanej sesji, wciskamy insert, wklejamy prawym myszki całość, następnie wciskamy Esc, wpisujemy :wq i naciskamy Enter. Potem ustawiamy plik tylko do odczytu poleceniem:

```bash
sudo chmod 600 authorized_keys
```

W następnej kolejności edytjemy plik /etc/ssh/sshd_config, jak wyżej. Zmieniamy wartości na: RSAAuthentication yes oraz PubkeyAuthentication yes, a także PermitEmptyPasswords no oraz PasswordAuthentication no. Zapisujemy plik analogicznie, jak wyżej to opisałem. (zakładam, że używanie vi już zostało zrozumiane). Restartujemy ssh poleceniem:

```bash
sudo systemctl restart sshd
```

W połączeniu w putty lub w terminalu musimy wskazać plik klucza prywatnego do autoryzacji. Lub w przypadku putty kliknąć dwa razy na plik prywatny, podać hasło i program pageant.exe powinien załadować klucz prywatny do pamięci. Jeśli nie mamy pageant, to serwer zapyta nas o hasło do klucza prywatnego (passphrase), który został ustawiony po wygenerowaniu klucza (to zwiększa poziom bezpieczeństwa, ponieważ nawet w sytuacji, gdy ktoś zdoła przechwycić klucz, nie zna do niego hasła). 

W przypadku, gdy korzystasz z terminala, generujesz na swoim komputerze klucz z poziomu terminala poleceniem:

```bash
ssh-keygen -t rsa -b 4096 -C "twojanazwa@mikr.us"
```

Następnie kopiujesz klucz do serwera poleceniem:

```bash
ssh-copy-id root@nazwa.mikr.us -p 12345 
```

Numer portu 12345 zmieniasz na ten, który dostałeś w mailu, a nazwę analogicznie, jak numer portu. Powyżej opisałem, jak zablokować dostęp do ssh dla użytkownika root. Teraz wystarczy tylko zrestartować demona ssh.

```bash
systemctl restart sshd
```

Rozłączyć się poleceniem 

```bash
exit
```

i połączyć ponownie za pomocą 

```bash
ssh root@root@nazwa.mikr.us -p 12345 
```

Zwiększenie poziomu zabezpieczeń można jeszcze uzyskać poprzez dodanie grupy do logowania ssh i dodanie do tej grupy użytkownika. 

```bash
sudo groupadd grupassh
sudo gpasswd -a <user> grupassh
groups user
```

Wyświetli się: user : user sudo grupassh lub user : user wheel grupassh

```bash
sudo vi /etc/ssh/sshd_config
```

Dodaj: 

```vim
AllowGroups grupassh
```

```bash
sudo systemctl restart sshd
```

Dla bezpieczeństwa użytkowników Ubuntu/Debian polecam zainstalować policies.

```bash
sudo apt-get install libpam-cracklib
```

Określają one długość hasła, ile razu użytkownik może się zalogować, ile razy można używać tych samych znaków w haśle, określa kompleksowość hasła, jego siłę, liczbę cyfr, małych, dużych liter oraz znaków specjalnych. 

### Instalacja serwera web/www z użyciem Apache

W pierwszej kolejności wyczyść managera pobierania. W CentOS używany jest yum, natomiast w Debian/Ubuntu apt-get a w nowszych distro apt.

{{< tabs CentOS Debian >}}
  {{< tab >}}

  ### CentOS section

```bash
  sudo yum clean all
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Debian section

```bash
  sudo apt-get autoremove && sudo apt-get clean
  ```
  {{< /tab >}}
{{< /tabs >}}

Zainstaluj wszystkie aktualizacje:

{{< tabs CentOS Debian >}}
  {{< tab >}}

  ### CentOS section

```bash
  sudo yum -y update
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Debian section

```bash
  sudo apt-get update && sudo apt-get upgrade
  ```
  {{< /tab >}}
{{< /tabs >}}

W następnej kolejności zainstaluj Apache (httpd w CentOS, apache2 w Debian/Ubuntu)

{{< tabs CentOS Debian >}}
  {{< tab >}}

  ### CentOS section

```bash
  sudo yum -y install httpd
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Debian section

```bash
  sudo apt-get install apache2
  ```
  {{< /tab >}}
{{< /tabs >}}

Włącz Apache2 przy starcie systemui uruchom usługę.

{{< tabs CentOS Debian >}}
  {{< tab >}}

  ### CentOS section

```bash
  sudo systemctl enable httpd
  sudo systemctl start httpd
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Debian section

```bash
  sudo systemctl enable apache2
  sudo systemctl start apache2
  ```
  {{< /tab >}}
{{< /tabs >}}

Status usługi możesz sprawdzić:

{{< tabs CentOS Debian >}}
  {{< tab >}}

  ### CentOS section

```bash
  sudo systemctl status httpd
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Debian section

```bash
  sudo systemctl status apache2
  ```
  {{< /tab >}}
{{< /tabs >}}

### Konfiguracja wirtualnego hosta

{{< tabs CentOS Debian >}}
  {{< tab >}}

  W przypadku CentOS tworzymy plik wirtualnego hosta dla http (port 80) za pomocą poniższego polecenia:

```bash
  sudo vi /etc/httpd/conf.d/strona.com.pl.conf
  ```

  {{< /tab >}}
  {{< tab >}}

  Natomiast w przypadku Debian

```bash
  sudo vi /etc/apache2/sites-available/strona.com.pl.conf
  ```
  {{< /tab >}}
{{< /tabs >}}

```vim
<VirtualHost *:80>
   ServerName strona.com.pl
   ServerAlias www.strona.com.pl
   DocumentRoot /var/www/html/strona.com.pl/public_html
   ErrorLog /var/log/httpd/error.log
   CustomLog /var/log/httpd/access.log combined
   #ErrorLog /var/log/apache2/error.log # Debian/Ubuntu
   #CustomLog /var/log/apache2/access.log combined # Debian/Ubuntu
   DirectoryIndex index.php

   LogLevel info warn

   <FilesMatch "^\.ht">     
       Require all denied
   </FilesMatch>

   <files readme.html>
       order allow,deny
       deny from all
   </files>
</VirtualHost>
```

Dla Debian/Apache musimy jeszcze włączyć stronę

```bash
sudo a2ensite strona.com.pl.conf
```

Co spowoduje stworzenie dowiązania symbolicznego w katalogu /etc/apache2/sites-enabled.

### Tworzenie fizycznej struktury i wgranie WordPress na serwer.

Teraz należy stworzyć katalog dla strony w katalogu /var/www/html

```bash
sudo -i
```

(wpisz hasło użytkownika, którego utworzyłeś na samym początku)

```bash
cd /var/www/html
sudo mkdir strona.com.pl
```

Utwórz katalog o nazwie src w katalogu swojej witryny, aby przechowywać nowe kopie plików źródłowych WordPress. W tym przewodniku jako przykład wykorzystano katalog domowy /var/www/html/strona.com.pl/. Przejdź do tego nowego katalogu:

```bash
sudo mkdir -p /var/www/html/strona.com.pl/src/
cd /var/www/html/strona.com.pl/src/
```

Ustaw użytkownika serwera WWW, <em><strong>www-data</strong></em>, jako właściciela katalogu domowego swojej witryny. <em><strong>www-data</strong></em> jest grupą. W przypadku CentOS będzie to grupa <em><strong>apache</strong></em>.

{{< tabs CentOS Debian >}}
  {{< tab >}}

  ### CentOS section

```bash
  sudo chown -R apache:apache /var/www/html/example.com.pl/
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Debian section

```bash
  sudo chown -R www-data:www-data /var/www/html/example.com.pl/
  ```
  {{< /tab >}}
{{< /tabs >}}

Zainstaluj najnowszą wersję WordPress i wypakuj ją używając odpowiedniej nazwy w zależności od używanego systemu: 

```bash
sudo wget http://wordpress.org/latest.tar.gz
sudo -u www-data tar -xvf latest.tar.gz
sudo -u apache tar -xvf latest.tar.gz
```

Zmień nazwę pliku latest.tar.gz na wordpress, a następnie ustaw datę przechowywania kopii zapasowej oryginalnych plików źródłowych. Będzie to przydatne, jeśli zainstalujesz nowe wersje w przyszłości i będzie potrzeba powrócić do poprzedniej wersji: 

```bash
sudo mv latest.tar.gz wordpress-`date "+%Y-%m-%d"`.tar.gz
```

Utwórz katalog public\_html, który będzie katalogiem głównym WordPress. Przenieś pliki WordPress do folderu public\_html:

```bash
sudo mkdir -p /var/www/html/strona.com.pl/public_html/
sudo mv wordpress/* ../public_html/
```

Nadaj folderowi public_html uprawnienia dla grupy www-data lub apache:

{{< tabs CentOS Debian >}}
  {{< tab >}}

  ### CentOS section

```bash
  sudo chown -R www-data:www-data /var/www/html/example.com.pl/public_html
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Debian section

```bash
  sudo chown -R apache:apache /var/www/html/example.com.pl/public_html
  ```
  {{< /tab >}}
{{< /tabs >}}

Przejdź do katalogu, do którego wyodrębniono WordPress, skopiuj przykładową konfigurację i ustaw ją tak, aby korzystała ze zdalnej bazy danych:

```bash
cd /var/www/html/strona.com.pl/public_html
sudo cp wp-config-sample.php wp-config.php
```

Zmień zmienne logowania tak, aby pasowały do bazy danych i użytkownika. Edytuj plik: 

```bash
sudo vi /var/www/html/strona.com.pl/public_html/wp-config.php 
```

```vim
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'user');

/** MySQL database password */
define('DB_PASSWORD', 'haslo_użytkownika_bazy_danych');

/** MySQL hostname */
define('DB_HOST', 'localhost');
```

Dodaj klucze bezpieczeństwa, aby zabezpieczyć wp-admin.  
Użyj <a href="https://api.wordpress.org/secret-key/1.1/salt/" target="_blank" rel="noreferrer noopener" aria-label="Generatora kluczy bezpieczeństwa WordPress (otwiera się na nowej zakładce)">Generatora kluczy bezpieczeństwa WordPress</a>, aby utworzyć losowe, skomplikowane hashe, których WordPress użyje do zaszyfrowania danych logowania. Skopiuj wynik i zastąp odpowiednią sekcję w pliku wp-config.php:

```vim
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

### Instalacja i konfiguracja Maria DB 10.4 w CentOS 7.6.

```bash
sudo tee /etc/yum.repos.d/MariaDB.repo<<EOF 
[mariadb]
name = MariaDB
baseurl = http://yum.mariadb.org/10.4/centos7-amd64
gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB
gpgcheck=1
EOF
```

```bash
sudo yum makecache fast
sudo yum -y install MariaDB-server MariaDB-client
sudo systemctl enable mariadb
```

Podczas konfiguracji potwierdź y puste hasło root w MariaDB, a w następnym kroku ustaw hasło roota (tego od MariaDB). To hasło powinno być inne, niż hasło roota, które dostałeś w mailu po założeniu serwera na mikr.us.

```bash
mysql_secure_installation
```

```vim
NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!
      In order to log into MariaDB to secure it, we'll need the current
      password for the root user.  If you've just installed MariaDB, and
      you haven't set the root password yet, the password will be blank,
      so you should just press enter here.
      <strong>Enter current password for root (enter for none): </strong>
 OK, successfully used password, moving on…
 Setting the root password ensures that nobody can log into the MariaDB
 root user without the proper authorisation.
 <strong>Set root password? [Y/n] y
 New password: 
 Re-enter new password: </strong>
 Password updated successfully!
 Reloading privilege tables..
  … Success!
 By default, a MariaDB installation has an anonymous user, allowing anyone
 to log into MariaDB without having to have a user account created for
 them.  This is intended only for testing, and to make the installation
 go a bit smoother.  You should remove them before moving into a
 production environment.
 Remove anonymous users? [Y/n] y
  … Success!
 Normally, root should only be allowed to connect from 'localhost'.  This
 ensures that someone cannot guess at the root password from the network.
 Disallow root login remotely? [Y/n] y
  … Success!
 By default, MariaDB comes with a database named 'test' that anyone can
 access.  This is also intended only for testing, and should be removed
 before moving into a production environment.
 Remove test database and access to it? [Y/n] y
 Dropping test database…
 … Success!
 Removing privileges on test database…
 … Success! 
 Reloading the privilege tables will ensure that all changes made so far
 will take effect immediately.
 Reload privilege tables now? [Y/n] y
  … Success!
 Cleaning up…
 All done!  If you've completed all of the above steps, your MariaDB
 installation should now be secure.
 Thanks for using MariaDB!
```

```bash
sudo systemctl start mariadb
mysql -u root -p
```

#### Po zalogowaniu się do bazy danych utwórz bazę danych i przypisz ją do użytkownika.

```bash
CREATE DATABASE wordpress;
CREATE USER 'user'@'localhost' IDENTIFIED BY 'haslo_użytkownika_bazy_danych';
GRANT ALL PRIVILEGES ON wordpress.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
exit
```

```bash
mysql -u user -p 
```

Wpisz hasło użytkownika user, którego właśnie stworzyłeś

```bash
status;
```

Jeśli wyświetli się wersja MariaDB, to znaczy, że wszystko działa.

```bash
exit
```

Zrestartuj serwer baz danych oraz web poleceniami:

```bash
sudo systemctl restart mariadb && sudo systemctl restart httpd
```

### Instalacja i konfiguracja Maria DB 10.3 w Ubuntu 16.04 LTS

Aby zainstalować MariaDB 10.3 na Ubuntu 16.04, musisz dodać repozytorium MariaDB do systemu. Uruchom następujące polecenia, aby zaimportować klucz PGP repozytorium MariaDB i dodać repozytorium. 

```bash
sudo apt -y install software-properties-common dirmngr
sudo apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8
sudo add-apt-repository 'deb [arch=amd64] http://mirror.zol.co.zw/mariadb/repo/10.3/ubuntu xenial main'
```

Zaktualizuj listę pakietów systemowych i zainstaluj MariaDB.

```bash
sudo apt update
sudo apt -y install mariadb-server mariadb-client
```

Zostaniesz poproszony o podanie hasła roota MariaDB. Musisz podać je dwukrotnie. Zatwierdź zmianę hasła. Możesz potwierdzić zainstalowaną wersję MariaDB, logując się jako użytkownik root. 

```bash
mysql -u root -p
```

Po zalogowaniu się wpisz status; (pamiętaj o średnikach w składni SQL). Następnie wpisz exit.

Zalecam przeprowadzenie dokładnie tej samej procedury, co w przypadku instalacji na CentOS. Powyżej widać, jakie kroki po kolei muszą zostać podjęte.

```bash
mysql_secure_installation
```

Następnie należy wykonać poniższe polecenia:

```bash
sudo systemctl enable mariadb
sudo systemctl start mariadb
sudo systemctl status mariadb
sudo systemctl restart mariadb
```

Bazę użytkownika utwórz identycznie, jak w przypadku tworzenia bazy w CentOS.

### Instalacja i konfiguracja certyfikatu SSL za pomocą Let&#8217;s Encrypt.

Wykorzystamy do tego stronę <https://certbot.eff.org>

Z rozwijanej listy Software wybieramy Apache, system operacyjny, to albo Ubuntu 16.04, albo Debian 9, albo CentOS/RHEL 7 i postępujemy zgodnie ze wskazówkami.

Wybierz stronę bez www, lub z www, jak tobie pasuje, ponieważ certbot nam rozpozna wirtualny host dla http, który utworzony został wcześniej. 

Nie włączaj przekierowania z http na https, ponieważ to zrobisz po stronie Cloudflare. Inaczej napotkasz błąd. Dlatego wybierz 1 , gdy zapyta o redirect.

Certbot zainstaluje automatycznie certyfikat, utworzy plik wirtualnego hosta. Teraz tylko trzeba wejść do katalogu:

```bash
sudo -i
cd /etc/apache2/sites-available
ls -al
a2ensite strona.com.pl-le-ssl.conf
```

Polecam zmodyfikować plik wirtualnego hosta dla https, aby ostatecznie wyglądał tak:

{{< tabs CentOS Debian >}}
  {{< tab >}}

  ### CentOS section

```bash
  sudo vi /etc/httpd/conf.d/strona.com.pl-le-ssl.conf
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Debian section

```bash
  sudo vi /etc/apache2/sites-available/strona.com.pl-le-ssl.conf
  ```

  {{< /tab >}}
{{< /tabs >}}

```vim
<IfModule mod_ssl.c>
 SSLStaplingCache shmcb:/run/httpd/ssl_stapling(32768)
  <VirtualHost *:443>
   Header always set Strict-Transport-Security "max-age=15768000"
   SSLEngine on
   ServerName strona.com.pl
   ServerAlias www.strona.com.pl
   DocumentRoot /var/www/html/strona.com.pl/public_html
   LogLevel debug
   ErrorLog /var/log/httpd/error.log
   CustomLog /var/log/httpd/access.log combined

    <Directory /var/www/html/strona.com.pl/public_html>
     Options Indexes FollowSymLinks Includes IncludesNOEXEC SymLinksIfOwnerMatch                     
     AllowOverride All
     Require all granted
     DirectoryIndex index.php
     RewriteEngine On
    </Directory>

Include /etc/letsencrypt/options-ssl-apache.conf
SSLUseStapling on
SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite HIGH:!aNULL:!MD5
SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AE$
SSLHonorCipherOrder on
SSLCompression off
SSLSessionTickets off

    <FilesMatch "^\.ht">
       Require all denied
    </FilesMatch>

    <files readme.html>
       order allow,deny
       deny from all
    </files>

SSLCertificateFile /etc/letsencrypt/live/strona.com.pl/cert.pem
SSLCertificateKeyFile /etc/letsencrypt/live/strona.com.pl/privkey.pem
SSLCertificateChainFile /etc/letsencrypt/live/strona.com.pl/chain.pem

 </VirtualHost>
</IfModule>
```

### Konfiguracja silnika MyISAM w MariaDB zamiast InnoDB.

{{< tabs CentOS Ubuntu >}}
  {{< tab >}}

  ### CentOS 7.6 section

W CentOS edytujemy plik my.cnf

```bash
sudo vi /etc/my.cnf
```

Teraz w zasadzie wystarczy zastąpić ten plik tym, co poniżej:

```vim
# This group is read both both by the client and the server use it for options that affect everything
 [mysqld]
 MyISAM Settings
 skip-innodb
 default-storage-engine           = MyISAM
 MyISAM Settings
 query_cache_limit               = 4M    # UPD - Option supported up to MySQL v5.7
 query_cache_size                = 4M   # UPD - Option supported up to MySQL v5.7
 query_cache_type                = 1     # Option supported up to MySQL v5.7
 key_buffer_size                 = 4M   # UPD
 low_priority_updates            = 1
 concurrent_insert               = 2
 Connection Settings
 max_connections                 = 10   # UPD
 back_log                        = 512
 thread_cache_size               = 100
 thread_stack                    = 192K
 interactive_timeout             = 20
 wait_timeout                    = 20
 Buffer Settings
 join_buffer_size                = 4M    # UPD
 read_buffer_size                = 3M    # UPD
 read_rnd_buffer_size            = 4M    # UPD
 sort_buffer_size                = 4M    # UPD
 table_definition_cache          = 400
 table_open_cache                = 58
 open_files_limit                = 116
 max_heap_table_size             = 64M
 tmp_table_size                  = 64M
 Search Settings
 ft_min_word_len                 = 3     # Minimum length of words to be indexed for search results
 Default settings
 [client-server]
 [mysqld_safe]
 log-error=/var/log/mariadb/error.log
 # include all files from the config directory
 !includedir /etc/my.cnf.d
```

Zapisać zmiany, zrestartować httpd oraz mariadb

```bash
sudo systemctl restart mariadb httpd
```

  {{< /tab >}}
  {{< tab >}}

  ### Ubuntu 16.04 section

W przypadku Ubuntu 16.04 lokalizacja pliku jest nieco inna.

```bash
sudo vi /etc/mysql/my.cnf
```

Wystarczy wkleić w ten plik to, co jest w sekcji [mysqld] powyżej. Aczkolwiek zalecam włączenie logowania błędów do mariadb i ustawić w my.cnf logowanie błędów, jak poniżej jest to widoczne.

```bash
sudo -i
cd /var/log/
mkdir mariadb
cd mariadb
touch error.log
```
Zapisać zmiany, zrestartować apache2 oraz mariadb

```bash
sudo systemctl restart mariadb apache2
```

  {{< /tab >}}
{{< /tabs >}}

### Instalacja PHP 7.3

{{< tabs CentOS Ubuntu >}}
  {{< tab >}}

  ### CentOS 7.6 section

Założenie jest takie, że istnieje użytkownik dodany do grupy wheel (sudoers) na samym początku tutoriala. Po sudo -i podaje się hasło użytkownika, nie roota.

```bash
sudo -i
cd /tmp
wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
wget http://rpms.remirepo.net/enterprise/remi-release-7.rpm
rpm -Uvh remi-release-7.rpm epel-release-latest-7.noarch.rpm
yum install yum-utils
yum-config-manager --disable remi-php54
yum-config-manager --enable remi-php73
yum -y install php php-cli php-fpm php-mysqlnd php-zip php-devel php-gd php-mcrypt php-mbstring php-curl php-xml php-pear php-bcmath php-json php-mysql php-mysqlnd
yum update
php -v
```

  {{< /tab >}}
  {{< tab >}}

  ### Ubuntu 16.04 section

```bash
  sudo LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php7.3 php7.3-cli php7.3-common
sudo php -v
sudo apt-cache search php7.3
sudo apt install php-pear php7.3-curl php7.3-dev php7.3-gd php7.3-mbstring php7.3-zip php7.3-mysql php7.3-xml php7.3-fpm libapache2-mod-php7.3 php7.3-imagick php7.3-recode php7.3-tidy php7.3-xmlrpc php7.3-intl
sudo update-alternatives --set php /usr/bin/php7.3
sudo a2dismod php7.0
sudo a2enmod php7.3
sudo systemctl restart apache2
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Ustawienie limitu pamięci w PHP

```bash
sudo find / -iname "php.ini"
```

{{< tabs CentOS Ubuntu >}}
  {{< tab >}}

  ### CentOS 7.6 section

```bash
  sudo vi /etc/php.ini
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Ubuntu 16.04 section
  
```bash
  sudo vi /etc/php/7.3/apache2/php.ini
  ```
  {{< /tab >}}
{{< /tabs >}}

Ustaw:

```bash
memory_limit = 10M
```

### Optymalizacja Apache

{{< tabs CentOS Ubuntu >}}
  {{< tab >}}

  ### CentOS 7.6 section

```bash
  sudo vi /etc/httpd/conf/httpd.conf
  ```

  {{< /tab >}}
  {{< tab >}}

  ### Ubuntu 16.04 section

```bash
  sudo vi /etc/apache2/mods-enabled/mpm_prefork.conf
  ```
  {{< /tab >}}
{{< /tabs >}}

Na końcu tego pliku dodaj to:

```vim
HostnameLookups Off
MaxKeepAliveRequests 500
KeepAliveTimeout 5
KeepAlive Off
<IfModule prefork.c>
    StartServers        2    
    MinSpareServers     2
    MaxSpareServers     2
    MaxClients          50
    MaxRequestsPerChild 100
</IfModule>
```

Zapisz plik i wyjdź z edycji.

### Instalacja i konfiguracja iptables

{{< tabs CentOS Ubuntu >}}
  {{< tab >}}

  ### CentOS 7.6 section

### Instalacja i konfiguracja iptables w CentOS 7.6

Wyłącz firewalld:

```bash
sudo systemctl stop firewalld
sudo systemctl disable firewalld
sudo systemctl mask firewalld
```

Zainstaluj iptables i włącz.

```bash
sudo yum install iptables-services
sudo systemctl start iptables
sudo systemctl start iptables6
sudo systemctl enable iptables
sudo systemctl enable iptables6
```

Sprawdź status iptables oraz reguły

```bash
sudo systemctl status iptables
sudo systemctl status iptables6
sudo iptables -nvL
sudo iptables6 -nvL
```

Dodaj reguły dla iptables

```bash
sudo iptables -A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp -m tcp --dport 443 -j ACCEPT
sudo iptables -A OUTPUT -p tcp -m tcp --dport 443 -j ACCEPT
```

Zapisz zmiany

```bash
sudo service iptables save
sudo service ip6tables save
sudo systemctl restart iptables
sudo systemctl restart ip6tables
```

  {{< /tab >}}
  {{< tab >}}

  ### Ubuntu 16.04 section

### Instalacja i konfiguracja iptables w Ubuntu 16.04

```bash
sudo apt-get install iptables-persistent
```

Podczas instalacji zapyta czy zachować bieżące reguły oraz czy chcesz używać zarówno IPv4, jaki IPv6. Na wszystkie te pytania odpowiedz twierdząco.

```bash
sudo systemctl start iptables
sudo systemctl start iptables6
sudo systemctl enable iptables
sudo systemctl enable iptables6
```
Dodaj porty:

```bash
sudo iptables -A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp -m tcp --dport 443 -j ACCEPT
sudo iptables -A OUTPUT -p tcp -m tcp --dport 443 -j ACCEPT
```

Zapisz zmiany i przeładuj usługę:

```bash
service netfilter-persistent save
service netfilter-persistent reload
```

  {{< /tab >}}
{{< /tabs >}}

Przejdź teraz po adres https://strona.com.pl i zainstaluj WordPress.

Zalecam po skończonej instalacji, instalację wtyczki Cloudflare i integrację z serwisem.
