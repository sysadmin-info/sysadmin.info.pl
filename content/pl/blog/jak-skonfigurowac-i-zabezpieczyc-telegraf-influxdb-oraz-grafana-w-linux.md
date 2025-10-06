---
title: Jak skonfigurować i zabezpieczyć Telegraf, InfluxDB oraz Grafana w Linux
date: 2020-09-10T19:05:29+00:00
description: Jak skonfigurować i zabezpieczyć Telegraf, InfluxDB oraz Grafana w Linux
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
    image: images/2020-thumbs/grafana.webp
---
Samouczek jest przeznaczony dla dystrybucji serwerów rodziny Red Hat takich jak CentOS 7.x, Red Hat 7.x, Fedora29 lub nowsze (obecna wersja to 32) itp.

Dla dystrybucji serwerów rodziny Debian (takich jak Debian, Ubuntu itp.) polecam przeczytać ten artykuł: <a rel="noreferrer noopener" href="https://devconnected.com/how-to-setup-telegraf-influxdb-and-grafana-on-linux/" target="_blank">Jak skonfigurować Telegraf, InfluxDB i Grafana w Linux</a>, jednak nie zawiera on ustawień własnej domeny i konfiguracji fail2ban.

Zdecydowałem się skopiować niektóre części z poradników. Referencje znajdują się na końcu tego samouczka:

&#8222;Spośród wszystkich istniejących nowoczesnych narzędzi do monitorowania, **stos TIG (Telegraf, InfluxDB i Grafana)** jest prawdopodobnie jednym z najpopularniejszych.

Ten stos może być używany do monitorowania szerokiej gamy różnych źródeł danych: od systemów operacyjnych (takich jak metryki wydajności Linuxa lub Windowsa), po bazy danych (takie jak MongoDB czy MySQL), możliwości są nieograniczone.

Zasada stosu TIG jest łatwa do zrozumienia.

Telegraf to agent odpowiedzialny za zbieranie i agregowanie danych, na przykład aktualnego użycia procesora.

InfluxDB będzie przechowywać dane i udostępniać je Grafanie, która jest nowoczesnym rozwiązaniem do tworzenia pulpitów nawigacyjnych.

W tym samouczku nauczysz się, jak skonfigurować Telegraf, InfluxDB i Grafanę. Dowiesz się także, jak zabezpieczyć nasze instancje za pomocą HTTPS poprzez bezpieczne certyfikaty.&#8221;


![Nowoczesna infrastruktura monitorowania z Telegrafem, InfluxDB, Grafaną](/images/2020/diagram-2.webp "Nowoczesna infrastruktura monitorowania z Telegrafem, InfluxDB, Grafaną")
<figcaption>Nowoczesna infrastruktura monitorowania z Telegrafem, InfluxDB, Grafaną</figcaption>

Ten samouczek będzie obejmował kroki dla **Influx 1.8.x**, ale podlinkuję również do konfiguracji InfluxDB 2.x, jak tylko zostanie napisana.

Przed rozpoczęciem upewnij się, że masz uprawnienia sudo w systemie, w przeciwnym razie nie będziesz mógł zainstalować żadnych pakietów.

Wszystkie działania instalacyjne będą przeprowadzane jako root. Więc musisz wpisać w terminalu:

```bash
sudo -i lub sudo su -
cd
```

### I – Instalacja InfluxDB
#### a – Instalacja InfluxDB jako usługi
##### Pobierz oprogramowanie
```bash
wget https://dl.influxdata.com/influxdb/releases/influxdb-1.8.2.x86_64.rpm
```
##### i zainstaluj
```bash
yum localinstall influxdb-1.8.2.x86_64.rpm
```

#### b – Weryfikacja instalacji InfluxDB

Obecnie InfluxDB powinno działać jako **usługa** na Twoim serwerze.

Aby to zweryfikować, uruchom następujące polecenie:

```bash
$ systemctl status influxdb
```

InfluxDB powinno automatycznie się uruchamiać, ale jeśli tak nie jest, upewnij się, że je uruchomisz.

```bash
systemctl start influxdb
```

![Usługa InfluxDB](/images/2020/influxdb_service.webp "Usługa InfluxDB")
<figcaption>Usługa InfluxDB</figcaption>

Jednak nawet jeśli Twoja usługa działa, nie gwarantuje to, że działa poprawnie.

Aby to zweryfikować, **sprawdź swoje dzienniki systemowe**.

```bash
journalctl -f -u influxdb.service
```

![Dzienniki InfluxDB](/images/2020/influxdb_logs.webp "Dzienniki InfluxDB")
<figcaption>Dzienniki InfluxDB</figcaption>

Ctrl+c pozwoli wyjść z trybu logowania.

Jeśli w tej sekcji pojawiają się komunikaty o błędach, zapoznaj się z sekcją **rozwiązywania problemów** na końcu.

Aby upewnić się, że usługa InfluxDB uruchomi się razem z serwerem, włącz ją.

```bash
systemctl enable influxdb
```

Port TCP 8086 jest używany do komunikacji klient-serwer za pośrednictwem API HTTP InfluxDB  
Port TCP 8088 jest używany do usługi RPC do tworzenia kopii zapasowych i przywracania

Możesz zobaczyć aktualną konfigurację za pomocą:
```bash
influxd config
```

Plik konfiguracyjny można znaleźć w: /etc/influxdb/influxdb.conf

Utwórzmy bazę danych i zabezpieczmy ją. Utwórz użytkownika admina z pełnymi uprawnieniami oraz użytkownika używanego przez Telegraf.

```bash
influx -precision rfc3339
> CREATE DATABASE "GRAFANA"
> SHOW DATABASES
> CREATE USER "admin" WITH PASSWORD 'secret' WITH ALL PRIVILEGES
> CREATE USER "telegraf" WITH PASSWORD 'secret'
> GRANT ALL ON "GRAFANA" to "telegraf"
> SHOW GRANTS FOR "telegraf"
> SHOW USERS
```

Oczywiście musisz zmienić secret na swoje hasło. Polecam użyć przynajmniej 20-znakowego hasła zawierającego wielkie litery, małe litery, cyfry i symbole specjalne. Dla bezpieczeństwa, ponieważ Grafana nie ma uwierzytelnienia dwuskładnikowego (2FA).

Polecam ustawić politykę retencji.

```bash
influx -precision rfc3339
> CREATE RETENTION POLICY "twenty_four_hours" ON "GRAFANA" DURATION 24h REPLICATION 1 DEFAULT
> CREATE RETENTION POLICY "a_year" ON "GRAFANA" DURATION 52w REPLICATION 1
> CREATE CONTINUOUS QUERY "cq_30m" ON "GRAFANA" BEGIN SELECT mean("website") AS "mean_website",mean("phone") AS "mean_phone" INTO "a_year"."downsampled_orders" FROM "orders" GROUP BY time(30m) END
```

Wyjaśnienie znajdziesz w Referencjach i tutaj: <a href="https://docs.influxdata.com/influxdb/v1.8/guides/downsample_and_retain/" target="_blank" rel="noreferrer noopener">Polityka retencji InfluxDB</a>

Warto wspomnieć, że 24 godziny są ustawione jako domyślne. Wynika to z tego, że mój serwer nie ma zbyt dużo miejsca i potrzebuję tylko 24-godzinnych wykresów w Grafanie.

Aby sprawdzić politykę retencji, wystarczy wpisać:

```bash
SHOW RETENTION POLICIES ON GRAFANA
```

Aby usunąć politykę retencji 24 godzin, wystarczy wpisać:

```bash
DROP RETENTION POLICY twenty_four_hours ON GRAFANA
```

Zrestartuj usługę InfluxDB.

```bash
systemctl restart influxdb
```

Aby pozbyć się logowania do /var/log/messages, wystarczy edytować plik /usr/lib/systemd/system/influxdb.service i dodać poniższe wpisy w sekcji [Service]:

```bash
StandardOutput=null
StandardError=null
```

Po tym zrestartuj usługę influxdb.

### II – Instalacja Telegraf

Telegraf to agent, który zbiera metryki związane z szeroką gamą różnych celów.

Może być również używany jako narzędzie do **przetwarzania**, **agregacji**, **dzielenia** lub **grupowania** danych.

Cała <a href="https://docs.influxdata.com/telegraf/v1.15/data_formats/input/" target="_blank" rel="noreferrer noopener">lista dostępnych celów</a> (zwanych również **wejściami**) jest dostępna tutaj.

W naszym przypadku użyjemy <a href="https://docs.influxdata.com/telegraf/v1.11/plugins/plugin-list/#influxdb" target="_blank" rel="noreferrer noopener">InfluxDB </a>jako **wyjścia**.

#### a – Instalacja Telegraf jako usługi

Aby zainstalować **Telegraf 1.15.2** na Red Hat 7.x, CentOS 7.x lub Fedora 29 lub nowsze, wykonaj następujące polecenia:

##### Pobierz oprogramowanie
```bash
wget https://dl.influxdata.com/telegraf/releases/telegraf-1.15.2-1.x86_64.rpm
```

##### i zainstaluj
```bash
yum localinstall telegraf-1.15.2-1.x86_64.rpm
```

#### b – Weryfikacja instalacji Telegraf

Obecnie Telegraf powinien działać jako **usługa** na Twoim serwerze.

Aby to zweryfikować, uruchom następujące polecenie:

```bash
systemctl status telegraf
```

Telegraf powinien automatycznie się uruchamiać, ale jeśli tak nie jest, upewnij się, że go uruchomisz.

```bash
systemctl start telegraf
```

![Usługa Telegraf](/images/2020/telegraf_service.webp "Usługa Telegraf")
<figcaption>Usługa Telegraf</figcaption>
Jednak nawet jeśli Twoja usługa działa, nie gwarantuje to, że poprawnie wysyła dane do InfluxDB.

Aby to zweryfikować, **sprawdź swoje dzienniki systemowe**.

```bash
journalctl -f -u telegraf.service
```
![Dzienniki Telegraf](/images/2020/telegraf_logs.webp "Dzienniki Telegraf")
<figcaption>Dzienniki Telegraf</figcaption>
Jeśli w tej sekcji pojawiają się komunikaty o błędach, zapoznaj się z sekcją **rozwiązywania problemów** na końcu.

Aby upewnić się, że usługa Telegraf uruchomi się razem z serwerem, włącz ją.

```bash
systemctl enable telegraf
```

### III – Konfiguracja uwierzytelniania InfluxDB

#### a – Włącz uwierzytelnianie HTTP na serwerze InfluxDB

**Uwierzytelnianie HTTP** musi być włączone w pliku konfiguracyjnym InfluxDB.

Przejdź do **/etc/influxdb/influxdb.conf** i edytuj następujące linie.

```vim
[http]
  # Określa, czy punkt końcowy HTTP jest włączony.
  enabled = true
  
  # Adres wiązania używany przez usługę HTTP.
  bind-address = ":8086"

  # Określa, czy uwierzytelnianie użytkownika jest włączone przez HTTP/HTTPS.
  auth-enabled = true
```

#### b – Konfiguracja uwierzytelniania HTTP w Telegraf

Teraz, gdy utworzono konto użytkownika dla Telegraf, upewnimy się, że używa go do zapisywania danych.

Przejdź do pliku konfiguracyjnego Telegraf, znajdującego się w **/etc/telegraf/telegraf.conf**.

Zmodyfikuj następujące linie:

```vim
## HTTP Basic Auth
  username = "telegraf"
  password = "secret"
```

Zrestartuj usługę Telegraf oraz usługę InfluxDB.

```bash
systemctl restart influxdb
systemctl restart telegraf
```

Ponownie sprawdź, czy nie pojawiają się żadne błędy podczas restartowania usługi.

```bash
journalctl -f -u telegraf.service
```

Świetnie, nasze żądania są teraz uwierzytelniane.

**Czas je zaszyfrować.**

### IV – Konfiguracja HTTPS w InfluxDB

Konfiguracja bezpiecznych protokołów pomiędzy Telegrafem a InfluxDB jest bardzo ważnym krokiem.

Na pewno nie chcesz, aby ktokolwiek mógł podsłuchiwać dane wysyłane do Twojego serwera InfluxDB.

Jeśli Twoje instancje Telegraf działają zdalnie (na Raspberry Pi lub innym serwerze), **zabezpieczenie transferu danych jest obowiązkowym krokiem**, ponieważ istnieje duże prawdopodobieństwo, że ktoś będzie w stanie odczytać wysyłane dane.

#### a – Utwórz klucz prywatny dla swojego serwera InfluxDB

Najpierw zainstaluj pakiet **gnutls-utils**, który na dystrybucjach Debian może być dostępny jako gnutls-bin.

```bash
yum install gnutls-utils
```

Teraz, gdy masz zainstalowany **certtool**, **wygeneruj klucz prywatny** dla swojego serwera InfluxDB.

Przejdź do folderu **/etc/ssl** Twojej dystrybucji Linux i utwórz nowy folder dla InfluxDB.

```bash
cd /etc/ssl
mkdir influxdb && cd influxdb
certtool --generate-privkey --outfile server-key.pem --bits 2048
```

#### b – Utwórz klucz publiczny dla swojego serwera InfluxDB

```bash
certtool --generate-self-signed --load-privkey server-key.pem --outfile server-cert.pem
```

Świetnie! Masz teraz** parę kluczy** dla swojego serwera InfluxDB.

Inną opcją jest wygenerowanie ich w ten sposób:

```bash
openssl req -x509 -nodes -newkey rsa:2048 -keyout /etc/ssl/influxdb/influxdb-selfsigned.key -out /etc/ssl/influxdb/influxdb-selfsigned.crt -days <LICZBA_DNI>
```

Podczas wykonywania polecenia zostaniesz poproszony o więcej informacji. Możesz wybrać wypełnienie tych informacji lub pozostawienie ich pustych; obie akcje generują ważne pliki certyfikatów.

Nie zapomnij ustawić uprawnień dla użytkownika i grupy InfluxDB.

```bash
chown influxdb:influxdb server-key.pem server-cert.pem
```
lub
```bash
chown influxdb:influxdb influxdb-selfsigned.key influxdb-selfsigned.crt
```

Uruchom następujące polecenie, aby nadać InfluxDB uprawnienia do odczytu i zapisu na plikach certyfikatów.

```bash
chmod 644 /etc/ssl/influxdb/server-cert.pem
chmod 600 /etc/ssl/influxdb/server-key.pem
```
lub
```bash
chmod 644 /etc/ssl/influxdb/influxdb-selfsigned.crt
chmod 600 /etc/ssl/influxdb/influxdb-selfsigned.key
```

#### c – Włącz HTTPS na serwerze InfluxDB

Teraz, gdy Twoje certyfikaty zostały utworzone, nadszedł czas, aby dostosować plik konfiguracyjny InfluxDB i włączyć HTTPS.

Przejdź do **/etc/influxdb/influxdb.conf** i zmodyfikuj następujące linie.

```vim
# Określa, czy włączony jest HTTPS.
  https-enabled = true

# Certyfikat SSL do użycia, gdy włączony jest HTTPS.
https-certificate = "/etc/ssl/influxdb/server-cert.pem"

# Użyj osobnego miejsca na klucz prywatny.
https-private-key = "/etc/ssl/influxdb/server-key.pem"
```

Zrestartuj usługę InfluxDB i upewnij się, że nie pojawiają się żadne błędy.

```bash
systemctl restart influxdb
journalctl -f -u influxdb.service
```

#### d – Konfiguracja Telegraf dla HTTPS

Teraz, gdy HTTPS jest dostępny na serwerze InfluxDB, **nadszedł czas, aby Telegraf łączył się z InfluxDB za pośrednictwem HTTPS.**

Przejdź do **/etc/telegraf/telegraf.conf** i zmodyfikuj następujące linie.

```vim
# Konfiguracja do wysyłania metryk do InfluxDB
[[outputs.influxdb]]

# https, nie http!
urls = ["https://127.0.0.1:8086"]

## Użyj TLS, ale pomiń weryfikację łańcucha i hosta
insecure_skip_verify = true
```

**Dlaczego włączamy parametr insecure_skip_verify?**

Ponieważ używamy **certyfikatu samopodpisanego.**

W rezultacie, tożsamość serwera InfluxDB nie jest certyfikowana przez żadną autoryzację certyfikacyjną.

Zrestartuj Telegraf i ponownie upewnij się, że nie pojawiają się żadne błędy.

```bash
sudo systemctl restart telegraf
sudo journalctl -f -u telegraf.service
```

### IV – Eksploracja metryk w InfluxDB

Zanim zainstalujemy Grafanę i utworzymy naszą pierwszą pulpit nawigacyjny Telegraf, spójrzmy szybko na **to, jak Telegraf agreguje nasze metryki.**

Domyślnie, dla systemów Linux, Telegraf rozpocznie zbieranie danych związanych z wydajnością systemu za pomocą wtyczek o nazwach **cpu, disk, diskio, kernel, mem, processes, swap i system**.

Nazwy są dość oczywiste, te wtyczki zbierają pewne metryki dotyczące **użycia procesora**, **użycia pamięci** oraz **aktualnych operacji odczytu i zapisu dysku IO**.

Spójrzmy szybko na jedną z pomiarów.

Aby to zrobić, użyj interfejsu wiersza poleceń InfluxDB z następującymi parametrami.

Dane są przechowywane w bazie danych “**telegraf**”, a każdy pomiar jest nazwany tak jak nazwa wtyczki wejściowej.

```bash
$ influx -ssl -unsafeSsl -username 'admin' -password 'secret'
Connected to http://localhost:8086 version 1.8.2
InfluxDB shell version: 1.8.2

> USE GRAFANA
> SELECT * FROM cpu WHERE time > now() - 30s
```

![Metryki InfluxDB](/images/2020/grafana-metrics-1.webp "Metryki InfluxDB")
<figcaption>Metryki InfluxDB</figcaption>
Świetnie!

Dane są poprawnie agregowane na serwerze InfluxDB.

**Nadszedł czas, aby skonfigurować Grafanę i zbudować nasz pierwszy pulpit nawigacyjny systemu.**

### V – Instalacja Grafany

#### a – Instalacja Grafany jako usługi

Aby zainstalować **Grafanę 7.1.5** na Red Hat 7.x, CentOS 7.x lub Fedora 29 lub nowsze, wykonaj następujące polecenia:

##### Pobierz oprogramowanie
```bash
wget https://dl.grafana.com/oss/release/grafana-7.1.5-1.x86_64.rpm
```

##### i zainstaluj
```bash
yum localinstall grafana-7.1.5-1.x86_64.rpm
```

#### b – Weryfikacja instalacji Grafany

Obecnie Grafana powinna działać jako **usługa** na Twoim serwerze.

Aby to zweryfikować, uruchom następujące polecenie:

```bash
systemctl status grafana-server
```

Grafana powinna automatycznie się uruchamiać, ale jeśli tak nie jest, upewnij się, że ją uruchomisz.

```bash
systemctl start grafana-server
```

![Usługa Grafana](/images/2020/grafana_service.webp "Usługa Grafana")
<figcaption>Usługa Grafana</figcaption>

Przejdź do /etc/grafana/grafana.ini i zmodyfikuj następujące linie.


I will now translate the provided Markdown content into Polish, ensuring to strictly follow your guidelines:

```vim
[server]
# Publiczna nazwa domeny używana do dostępu do grafana z przeglądarki
;domain = localhost
domain = grafana.example.com

# Pełny publiczny adres URL używany w przeglądarce, używany do przekierowań i e-maili
# Jeśli używasz odwrotnego proxy i podścieżki, podaj pełny adres URL (z podścieżką)
root_url = %(protocol)s://%(domain)s

# Obsługa Grafana z podścieżki określonej w ustawieniu `root_url`. Domyślnie ustawione na `false` ze względów kompatybilności.
serve_from_sub_path = false
  
[security]
# wyłącz tworzenie użytkownika admin przy pierwszym uruchomieniu grafana
disable_initial_admin_creation = true

# domyślny użytkownik admin, utworzony przy starcie
admin_user = admin

# wyłącz ochronę przed brutalnymi próbami logowania
disable_brute_force_login_protection = false

# ustaw na true, jeśli hostujesz Grafana za pomocą HTTPS. Domyślnie jest false.
cookie_secure = true

# ustaw atrybut SameSite ciasteczka. Domyślnie ustawione na `lax`. Można ustawić na "lax", "strict", "none" i "disabled"
cookie_samesite = lax

# Ustaw na true, jeśli chcesz włączyć nagłówek odpowiedzi HTTP strict transport security (HSTS).
# Jest to wysyłane tylko gdy HTTPS jest włączony w tej konfiguracji.
# HSTS informuje przeglądarki, że strona powinna być dostępna tylko za pomocą HTTPS.
strict_transport_security = true

# Określa, jak długo przeglądarka powinna pamiętać HSTS. Stosowane tylko gdy strict_transport_security jest włączone.
strict_transport_security_max_age_seconds = 86400

# Ustaw na true, jeśli chcesz włączyć opcję HSTS preload. Stosowane tylko gdy strict_transport_security jest włączone.
strict_transport_security_preload = true

# Ustaw na true, jeśli chcesz włączyć opcję HSTS includeSubDomains. Stosowane tylko gdy strict_transport_security jest włączone.
strict_transport_security_subdomains = true

# Ustaw na true, aby włączyć nagłówek odpowiedzi X-Content-Type-Options.
# Nagłówek odpowiedzi HTTP X-Content-Type-Options jest znacznikiem używanym przez serwer do wskazania, że reklamowane typy MIME
# w nagłówkach Content-Type nie powinny być zmieniane i powinny być przestrzegane.
x_content_type_options = true

# Ustaw na true, aby włączyć nagłówek X-XSS-Protection, który informuje przeglądarki o zatrzymaniu ładowania stron
# gdy wykryją odbite ataki skryptowe cross-site (XSS).
x_xss_protection = true

[users]
# wyłącz rejestrację / tworzenie nowych użytkowników
allow_sign_up = false

[auth.anonymous]
# włącz dostęp anonimowy
enabled = false

[log]
# "console", "file", "syslog". Domyślnie jest console i file
# Użyj spacji do oddzielenia wielu trybów, np. "console file"
mode = console file

# "debug", "info", "warn", "error", "critical", domyślnie jest "info"
level = debug

# opcjonalne ustawienia do ustawienia różnych poziomów dla konkretnych loggerów. Np. filters = sqlstore:debug
filters = context:debug

# Tylko dla trybu "console"
[log.console]
level = debug

# Tylko dla trybu "file"
[log.file]
level = debug

# format linii logu, ważne opcje to text, console i json
format = console

# To włącza automatyczne obracanie logu (zmiana poniższych opcji), domyślnie jest true
log_rotate = true

# Maksym

alna liczba linii pojedynczego pliku, domyślnie jest 1000000
max_lines = 1000000

# Maksymalny rozmiar przesunięcia pojedynczego pliku, domyślnie jest 28, czyli 1 << 28, 256MB
max_size_shift = 28

# Segmentacja logu codziennie, domyślnie jest true
daily_rotate = true

# Maksymalna liczba dni przechowywania pliku logu (usuwanie po max dniach), domyślnie jest 7
max_days = 7
```

Jednak nawet jeśli twoja usługa działa, nie gwarantuje to, że poprawnie wysyła dane do InfluxDB.

Aby to sprawdzić, **sprawdź swoje logi systemowe**.

```bash
journalctl -f -u grafana-server.service
```
![Logi Grafana](/images/2020/grafana_logs.webp "Logi Grafana")
<figcaption>Logi Grafana</figcaption>
Jeśli w tej sekcji pojawiają się komunikaty o błędach, zapoznaj się z sekcją **rozwiązywania problemów** na końcu.

Aby upewnić się, że usługa Grafana będzie startować razem z serwerem, włącz ją.

```bash
systemctl enable grafana-server
```

#### c - Konfiguracja serwera internetowego Nginx

W pliku konfiguracyjnym Nginx dodaj nowy blok `server`:

```vim
server { 
    listen 80; 
    root /usr/share/nginx/html; 
    index index.html index.htm; 

    location / { 
        proxy_pass http://localhost:3000/; 
    } 
}
```

Przeładuj konfigurację Nginx.

Aby skonfigurować NGINX do obsługi Grafana pod _podścieżką_, zaktualizuj blok `location`:

```vim
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html index.htm;

    location /grafana/ {
        proxy_pass http://localhost:3000/;
    }
}
```

#### d - Konfiguracja serwera internetowego Apache

W pliku konfiguracyjnym Apache dodaj nowy blok `server`:

```vim
ProxyPreserveHost On
ProxyPass "/" "http://localhost:3000/"
ProxyPassReverse "/" "http://localhost:3000/"

<Location />
    Require all granted 
</Location>

<Directory "/var/www/html/grafana.example.com/public_html/">
    Options Indexes FollowSymLinks Includes IncludesNOEXEC SymLinksIfOwnerMatch 
    AllowOverride All 
    Require all granted 
    RewriteEngine On
</Directory>
```

Jeśli używasz proxy php-fpm, dodatkowo powinieneś dodać to w hostingu wirtualnym:

```vim
# Przekierowanie do proxy
<FilesMatch \.php$> 
    SetHandler proxy:fcgi://php-fpm 
</FilesMatch>
```

Jeśli będziesz miał jakiekolwiek problemy z konfiguracją hostingu wirtualnego, skontaktuj się ze mną. Pomogę. Używam grafana z SSL od <a href="https://letsencrypt.org" target="_blank" rel="noreferrer noopener">Let&#8217;s Encrypt</a>.

#### e – Dodawanie InfluxDB jako źródła danych w Grafana

W lewym menu kliknij na sekcję **Konfiguracja > Źródła danych**.<figure class="wp-block-image size-large is-style-default">

![Konfiguracja Grafana źródło danych](/images/2020/config-datasource.webp "Konfiguracja Grafana źródło danych")
<figcaption>Konfiguracja Grafana źródło danych</figcaption>

W następnym oknie kliknij na “**Dodaj źródło danych**“.

![Grafana dodaj źródło danych](/images/2020/add-data-source.webp "Grafana dodaj źródło danych")
<figcaption>Grafana dodaj źródło danych</figcaption>

W panelu wyboru źródła danych wybierz InfluxDB jako źródło danych.

![InfluxDB jako źródło danych](/images/2020/influxdb-option.webp "InfluxDB jako źródło danych")
<figcaption>InfluxDB jako źródło danych</figcaption>

Oto konfiguracja, którą musisz dopasować, aby skonfigurować InfluxDB w Grafana.

![Konfiguracja InfluxDB](/images/2020/influxdb-config-1.webp "Konfiguracja InfluxDB")
<figcaption>Konfiguracja InfluxDB</figcaption>

Kliknij na “Zapisz i Testuj”, i upewnij się, że nie otrzymujesz żadnych błędów.

![Źródło danych działa](/images/2020/data-source-is-working-1.webp "Źródło danych działa")
<figcaption>Źródło danych działa</figcaption>

> Otrzymujesz błąd 502 Bad Gateway? Upewnij się, że pole URL jest ustawione na HTTPS, a nie HTTP.

Jeśli wszystko jest w porządku, **nadszedł czas na stworzenie naszego dashboardu Telegraf.**

#### f – Importowanie dashboardu Grafana

Nie będziemy tworzyć dashboardu Grafana dla Telegraf, zamiast tego **skorzystamy z gotowego**, który został już opracowany przez społeczność.

Jeśli w przyszłości będziesz chciał stworzyć własny dashboard, śmiało to zrób.

Aby zaimportować dashboard Grafana, wybierz opcję **Importuj** w lewym menu, **pod ikoną Plus.**

![import dashboardu](/images/2020/import-dashboard.webp "import dashboardu")
<figcaption>import dashboardu</figcaption>

Na następnym ekranie zaimportuj dashboard z **ID 5955**.

To dashboard stworzony przez <a href="https://grafana.com/orgs/jmutai" target="_blank" rel="noreferrer noopener">jmutai</a>, który wyświetla metryki systemowe zbierane przez Telegraf.

![import dashboardu stworzonego przez jmutai](/images/2020/import-dashboard-5955.webp "import dashboardu stworzonego przez jmutai")
<figcaption>import dashboardu stworzonego przez jmutai</figcaption>

Stamtąd, Grafana powinna automatycznie spróbować zaimportować ten dashboard.

Dodaj wcześniej skonfigurowane InfluxDB jako źródło danych dashboardu i kliknij na “**Importuj**“.

![dodaj InfluxDB jako źródło danych dashboardu](/images/2020/import-dashboard-influxdb.webp "dodaj InfluxDB jako źródło danych dashboardu")
<figcaption>dodaj InfluxDB jako źródło danych dashboardu</figcaption>

Świetnie!

Mamy teraz **nasz pierwszy dashboard Grafana wyświetlający metryki Telegraf.**

To co teraz powinieneś zobaczyć na swoim ekranie.

![ostateczny dashboard Grafana](/images/2020/final-dashboard.webp "ostateczny dashboard Grafana")
<figcaption>ostateczny dashboard Grafana</figcaption>

#### g – Modyfikowanie zapytań InfluxQL w eksploratorze zapytań Grafana

Czasami podczas projektowania dashboardu, twórca określa nazwę hosta jako “example”, która oczywiście różni się od jednego hosta do drugiego (mój na przykład nazywa się “mail.sysadmin.info.pl”)

Aby to zmodyfikować, przejdź do **eksploratora zapytań** najedź na tytuł panelu i kliknij na “Edytuj”.

![edycja dashboardu Grafana](/images/2020/edit-dashboard.webp "edycja dashboardu Grafana")
<figcaption>edycja dashboardu Grafana</figcaption>

W panelu “**zapytania**” **zmień hosta**, a panel powinien zacząć wyświetlać dane.

![zmiana hosta](/images/2020/changing-host.webp "zmiana hosta")
<figcaption>zmiana hosta</figcaption>

Wróć do dashboardu, i to co powinieneś teraz zobaczyć, to:

![dashboard CPU](/images/2020/cpu-dashboard.webp "dashboard CPU")
<figcaption>dashboard CPU</figcaption>

### VI – Podsumowanie

W tym poradniku nauczyłeś się, jak skonfigurować kompletny stos Telegraf, InfluxDB i Grafana na swoim serwerze.

Co powinieneś zrobić dalej?

Pierwszą rzeczą będzie podłączenie Telegraf do <a rel="noreferrer noopener" href="https://docs.influxdata.com/telegraf/v1.15/plugins/" target="_blank">różnych wejść</a>, poszukiwanie <a href="https://grafana.com/grafana/dashboards" target="_blank" rel="noreferrer noopener">istniejących dashboardów w Grafana</a> lub projektowanie własnych.

### Rozwiązywanie problemów

* **Błąd podczas zapisywania do wyjścia [influxdb]: nie można było zapisać na żaden adres**

![Błąd wyjścia Telegraf](/images/2020/error-output-telegraf.webp "Błąd wyjścia Telegraf")
<figcaption>Błąd wyjścia Telegraf</figcaption>

**Możliwe rozwiązanie**: upewnij się, że InfluxDB poprawnie działa na porcie 8086.

```bash
$ sudo lsof -i -P -n | grep influxdb
influxd   17737    influxdb  128u  IPv6 1177009213    0t0  TCP *:8086 (LISTEN)
```

Jeśli używasz innego portu, zmień konfigurację Telegraf, aby przekierowywać metryki na niestandardowy port przypisany do twojego serwera InfluxDB.

<hr />

* **[outputs.influxdb] podczas zapisywania do [http://localhost:8086]: 401 Unauthorized: autoryzacja nie powiodła się**

**Możliwe rozwiązanie:** upewnij się, że poświadczenia są poprawnie ustawione w konfiguracji Telegraf. Upewnij się także, że utworzyłeś konto dla Telegraf na swoim serwerze InfluxDB.

<hr />

* **http: serwer odpowiedział odpowiedzią HTTP na klienta HTTPS**

**Możliwe rozwiązanie**: upewnij się, że włączyłeś parametr https-authentication w pliku konfiguracyjnym InfluxDB. Domyślnie jest ustawiony na false.

<hr />

* **x509: nie można zweryfikować certyfikatu dla 127.0.0.1, ponieważ nie zawiera żadnych IP SANs**

**Możliwe rozwiązanie**: weryfikacja TLS jest ustawiona, musisz włączyć parametr insecure_skip_verify, ponieważ tożsamość serwera nie może być zweryfikowana dla certyfikatów samopodpisanych.

<hr />

* **klient odrzucony przez konfigurację serwera: proxy:http://localhost:3000/api/datasources/proxy/3/query**

**Możliwe rozwiązania**:

Jeśli używasz OWASP, polecam przeczytać ten artykuł: <https://sysadmin.info.pl/en/blog/mod_security-rules-for-wordpress/>. Błędy będą widoczne w /var/log/httpd/error_log i /var/log/httpd/modsec_audit. Ewentualnie możesz ustawić w pliku konfiguracyjnym hosta wirtualnego wartość: SecRuleEngine Off zamiast On, aby wyłączyć mod_security dla hosta wirtualnego grafana.

Musisz także zmodyfikować plik konfiguracyjny mod_evasive znajdujący się w katalogu /etc/httpd/conf.d i ustawić poniższe wartości, aby grafana działała poprawnie z włączonym mod_evasive.

```vim
DOSHashTableSize 3097
DOSPageCount 20
DOSSiteCount 100
DOSPageInterval 1
DOSSiteInterval 1
DOSBlockingPeriod 10
DOSLogDir /var/log/mod_evasive
```

### Konfiguracja Fail2ban do ochrony grafana przed atakami.

Wejdź do katalogu zawierającego filtry dla fail2ban, znajdującego się w **/etc/fail2ban/filter.d**

Utwórz nowy filtr o nazwie grafana.conf. Wpisz w terminalu:

```bash
vi grafana.conf
```

Następnie naciśnij przycisk insert (ins), aby wkleić poniższą treść:

```vim
[INCLUDES]
before = common.conf
[Definition]
failregex = ^ lvl=[a-zA-z]* msg=\"Invalid username or password\" (?:\S=(?:\".\"|\S) )remote_addr=
ignoreregex =
[Init]
datepattern = ^t=%%Y-%%m-%%dT%%H:%%M:%%S%%z
```

Naciśnij przycisk Esc, a następnie wpisz :x bez spacji i naciśnij Enter, aby zapisać i wyjść.

Wejdź do katalogu zawierającego jail dla fail2ban, znajdującego się w **/etc/fail2ban/jail.d**

Utwórz nowy jail o nazwie grafana.local. Wpisz w terminalu:

```bash
vi grafana.local
```

Następnie naciśnij przycisk insert (ins), aby wkleić poniższą treść:

```vim
[grafana]
enabled = true
port = http,https
filter = grafana
action = iptables-allports
#action = firewallcmd-allports //jeśli używasz firewalld zamiast iptables
logpath = /var/log/grafana/grafana.log
bantime = 172800
maxretry = 1
```

Naciśnij przycisk Esc, a następnie wpisz :x bez spacji i naciśnij Enter, aby zapisać i wyjść.

Zrestartuj fail2ban, wpisując w terminalu:

```bash
systemctl restart fail2ban
```

Sprawdź swój filtr fail2ban, wpisując w terminalu:

```bash
fail2ban-regex /var/log/grafana/grafana.log /etc/fail2ban/filter.d/grafana.conf
```

### Referencje

* <a href="https://devconnected.com/how-to-setup-telegraf-influxdb-and-grafana-on-linux/" target="_blank" rel="noreferrer noopener">https://devconnected.com/how-to-setup-telegraf-influxdb-and-grafana-on-linux/</a>
* <a href="https://www.petersplanet.nl/index.php/2018/11/18/basic-installation-of-grafana-influxdb-and-telegraf-on-centos-7/" target="_blank" rel="noreferrer noopener">https://www.petersplanet.nl/index.php/2018/11/18/basic-installation-of-grafana-influxdb-and-telegraf-on-centos-7/</a>
* <a href="https://docs.influxdata.com/influxdb/v1.8/guides/downsample_and_retain/" target="_blank" rel="noreferrer noopener">https://docs.influxdata.com/influxdb/v1.8/guides/downsample_and_retain/</a>
* <a href="https://portal.influxdata.com/downloads/" target="_blank" rel="noreferrer noopener">https://portal.influxdata.com/downloads/</a>