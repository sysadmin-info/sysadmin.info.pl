---
title: Tworzenie własnej strony internetowej na Dark Web
date: 2022-03-03T11:59:24+00:00
description: Treść tego artykułu pozwoli ci łatwo skonfigurować swoją własną stronę na Dark Web, zwanej również Dark Net.
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
- Linux
cover:
    image: images/2022-thumbs/darknet.webp
---
Cześć, poniższa treść pozwoli ci łatwo skonfigurować swoją własną stronę na Dark Web, zwanej również Dark Net. Pamiętaj, że ten samouczek dotyczy dystrybucji rodziny Red Hat, takich jak CentOS, Red Hat, Fedora itp. Dla dystrybucji rodziny Debian jest to nieco inaczej, ale nie jest trudne do dostosowania.

##### Bardzo podstawowa konfiguracja twojej własnej strony na Dark Web

Poniżej znajdziesz bardzo podstawową konfigurację, która pozwoli ci na skonfigurowanie tego, co jest potrzebne. Zaawansowana konfiguracja zabezpieczeń dla nginx została dodana poniżej tej sekcji, aby umożliwić ci wzmocnienie zabezpieczeń nginx. Oczywiście ten samouczek nie zawiera wszystkich kroków, ponieważ wymaga wiedzy, którą udostępniam w moich innych wpisach.

##### Aktualizacja pakietów

```bash
dnf update
```

##### Dodaj grupę adminów, która nadaje uprawnienia do sudo

```bash
groupadd admins
```

##### Dodaj użytkownika. Zastąp "user" losową nazwą.

```bash
useradd user
```

##### Dodaj użytkownika do grupy adminów

```bash
usermod -aG admins user
```

##### Ustaw hasło dla użytkownika

```bash
passwd user
```

##### Stwórz bardzo zaawansowane hasło. Polecam korzystać z menedżera haseł, takiego jak bitwarden.

##### Zastąp domyślne "wheel" na "admins"

```bash
sed -i 's/%wheel/%admins/g' /etc/sudoers
```

##### Sprawdź, czy użytkownik został dodany do grupy adminów

```bash
id user
```

##### Przełącz się na konto użytkownika

```bash
su - user
```

##### Zainstaluj edytor tekstu vim lub nano

```bash
sudo dnf install vim -y
```
##### lub

```bash
sudo dnf install nano  -y
```

##### Zainstaluj nginx i tor

```bash
sudo dnf install nginx tor -y
```
##### edytuj plik konfiguracyjny tor

```bash
sudo vim /etc/tor/torrc
```

##### Odkomentuj

```vim
Log notice file /var/log/tor/log
RunAsDaemon 1
DataDirectory /var/lib/tor
HiddenServiceDir /var/lib/tor/hidden_service/
HiddenServicePort 80 127.0.0.1:80
```

##### Zapisz i wyjdź

##### Uruchom, aktywuj podczas rozruchu i sprawdź status obu usług

```bash
sudo systemctl start nginx tor
sudo systemctl enable nginx tor
sudo systemctl status nginx tor
```

##### Wróć do roota (ctrl + D)

```bash
cat /var/lib/tor/hidden_service/hostname
```

##### Wyświetli to twój adres onion. To jest adres onion dla tego serwera. Powinieneś umieścić go w sekcji bloku serwera, zobacz "server_name" w pliku /etc/nginx/nginx.conf

##### Przełącz się z powrotem na konto użytkownika

```bash
su - user
```

##### Usuń zawartość w pliku index.html

```bash
sudo cat /dev/null > /usr/share/nginx/html/index.html
```

##### Edytuj plik index.html 

```bash
sudo vim /usr/share/nginx/html/index.html
```
##### lub

```bash
sudo nano /usr/share/nginx/html/index.html
```

##### Wklej poniższy kod:

```vim
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pl" lang="pl">
<head>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Witaj na Dark Web</title>
</head>
<body>
<p>Witaj świecie!</p>
</body>
</html>
```

##### Zapisz i wyjdź

*** Zabezpiecz nginx - bardzo podstawowa konfiguracja ***

##### Edytuj konfigurację nginx

```bash
sudo vim /etc/nginx/nginx.conf
```

##### Dodaj w sekcji bloku serwera
```vim
server_tokens off;
```

##### Dodaj w sekcji bloku serwera

```vim
listen 127.0.0.1:80 default_server
```

##### Zakomentuj:

```vim
listen       80 default_server;
listen       [::]:80 default_server;
```

##### Zabroń przeglądania katalogu
##### Dodaj "autoindex off;" w ten sposób:

```vim
location / {
                autoindex off;
        }
```

##### Przetestuj konfigurację
```bash
nginx -t
```

##### Zrestartuj nginx
```bash
sudo systemctl restart nginx
```

Ciesz się swoją stroną na Dark Web!


## Zaawansowana ochrona Nginx

Możesz kontrolować i konfigurować ustawienia jądra Linux i sieciowe za pomocą pliku /etc/sysctl.conf. Pamiętaj, aby **<mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-vivid-red-color">zrestartować</mark>** serwer po wykonaniu tego kroku, proszę.

```bash
sudo vim /etc/sysctl.conf
```

```vim
# Unikaj ataku typu smurf
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Włącz ochronę przed błędnymi komunikatami ICMP
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Włącz syncookies w celu ochrony przed atakiem SYN flood
net.ipv4.tcp_syncookies = 1

# Włącz i loguj pakietów z fałszywymi źródłami, ze źródłowym trasowaniem i przekierowaniem
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Brak pakietów ze źródłowym trasowaniem
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Włącz filtrowanie trasy wstecznej
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Upewnij się, że nikt nie może zmieniać tablic routingu
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0

# Nie działa jako router
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Włącz execshild
kernel.exec-shield = 1
kernel.randomize_va_space = 1

# Dostosuj IPv6
net.ipv6.conf.default.router_solicitations = 0
net.ipv6.conf.default.accept_ra_rtr_pref = 0
net.ipv6.conf.default.accept_ra_pinfo = 0
net.ipv6.conf.default.accept_ra_defrtr = 0
net.ipv6.conf.default.autoconf = 0
net.ipv6.conf.default.dad_transmits = 0
net.ipv6.conf.default.max_addresses = 1

# Optymalizacja dla użycia portów w LBs
# Zwiększ limit deskryptorów plików systemowych
fs.file-max = 65535

# Pozwól na więcej PID (aby zredukować problemy z przepełnieniem); może uszkodzić niektóre programy 32768
kernel.pid_max = 65536

# Zwiększ limity portów IP systemu
net.ipv4.ip_local_port_range = 2000 65000

# Zwiększ maksymalny rozmiar bufora TCP ustawiany za pomocą setsockopt()
net.ipv4.tcp_rmem = 4096 87380 8388608
net.ipv4.tcp_wmem = 4096 87380 8388608

# Zwiększ maksymalne rozmiary bufora TCP podczas autotuningowania Linux
# min, domyślny i maksymalny liczba bajtów do użycia
# Ustaw maksymalną wartość na co najmniej 4 MB lub wyższą, jeśli używasz bardzo dużych ścieżek BDP
# Okna TCP itp.
net.core.rmem_max = 8388608
net.core.wmem_max = 8388608
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_window_scaling = 1
```

## Kontrola ataków typu przepełnienie bufora

Edytuj plik nginx.conf i ustaw ograniczenia rozmiaru bufora dla wszystkich klientów.

```bash
sudo vim /etc/nginx/nginx.conf
```

Edytuj i ustaw ograniczenia rozmiaru bufora dla wszystkich klientów w następujący sposób:

```vim
client_body_buffer_size  1K;
client_header_buffer_size 1k;
client_max_body_size 1k;
large_client_header_buffers 2 1k;
```

## Wyłącz niepożądane metody HTTP

Sugeruję, aby wyłączyć metody HTTP, które nie zostaną użyte i które nie są wymagane na serwerze WWW. Jeśli dodasz poniższy warunek w bloku location pliku konfiguracyjnego wirtualnego hosta nginx, serwer będzie akceptować tylko metody GET, HEAD i POST, a odrzuci metody takie jak DELETE i TRACE.

```vim
location / {
    limit_except GET HEAD POST { deny all; }
}
```

Innym podejściem jest dodanie następującego warunku do sekcji serwera (lub bloku serwera). Można to uznać za bardziej uniwersalne, ale <a href="https://www.nginx.com/resources/wiki/start/topics/depth/ifisevil/" target="_blank" rel="noreferrer noopener"><mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-vivid-red-color">b</mark></a><a href="https://www.nginx.com/resources/wiki/start/topics/depth/ifisevil/" target="_blank" rel="noreferrer noopener nofollow"><mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-vivid-red-color">ądź ostrożny z instrukcjami warunkowymi w kontekście lokalizacji.</mark></a>

```vim
if ($request_method !~ ^(GET|HEAD|POST)$ ) {
    return 444; }
```

## Konfiguracja Nginx w celu uwzględnienia nagłówków zabezpieczeń

Aby dodatkowo zabezpieczyć swój serwer WWW nginx, możesz dodać kilka różnych nagłówków HTTP w bloku http.

#### X-Frame-Options

Aby zapobiec atakom typu clickjacking, możesz używać nagłówka odpowiedzi HTTP X-Frame-Options, aby określić, czy przeglądarka powinna mieć zezwolenie na renderowanie strony w elemencie <frame> lub <iframe>. W związku z tym zalecamy włączenie tej opcji dla twojego serwera nginx.

Aby to zrobić, dodaj następujący parametr do pliku konfiguracyjnego nginx w sekcji serwera:

```vim
add_header X-Frame-Options "SAMEORIGIN";
```

#### Strict-Transport-Security

HTTP Strict Transport Security (HSTS) to metoda używana przez strony internetowe do deklaracji, że powinny być dostępne tylko za pomocą bezpiecznego połączenia (HTTPS). Jeśli witryna deklaruje politykę HSTS, przeglądarka musi odrzucić wszystkie połączenia HTTP i uniemożliwić użytkownikom akceptowanie niezabezpieczonych certyfikatów SSL. Aby dodać nagłówek HSTS do swojego serwera nginx, możesz dodać następującą dyrektywę do sekcji serwera:

```vim
add_header Strict-Transport-Security "max-age=31536000; includeSubdomains; preload";
```

#### CSP i X-XSS-Protection

Polityka zabezpieczeń zawartości (CSP) chroni twój serwer WWW przed pewnymi rodzajami ataków, w tym atakami typu Cross-site Scripting (XSS) i atakami na wstrzykiwanie danych. Możesz wdrożyć CSP, dodając następujący przykład nagłówka Content-Security-Policy (zauważ, że rzeczywisty nagłówek powinien być skonfigurowany zgodnie z twoimi unikalnymi wymaganiami):

```vim
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

Nagłówek HTTP X-XSS-Protection jest obsługiwany przez przeglądarki Internet Explorer i Safari i nie jest konieczny dla nowoczesnych przeglądarek, jeśli masz silną politykę zabezpieczeń zawartości (CSP). Jednakże, aby pomóc w zapobieganiu atakom XSS w przypadku starszych przeglądarek (które jeszcze nie obsługują CSP), możesz dodać nagłówek X-XSS Protection do sekcji serwera:

```vim
add_header X-XSS-Protection "1; mode=block";
```

Oto pełna konfiguracja serwera nginx po dokonanych zmianach:

```vim
# Więcej informacji na temat konfiguracji znajdziesz pod adresem:
#   * Oficjalna dokumentacja w języku angielskim: http://nginx.org/en/docs/
#   * Oficjalna dokumentacja w języku rosyjskim: http://nginx.org/ru/docs/

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# Ładuj dynamiczne moduły. Zobacz /usr/share/doc/nginx/README.dynamic.
include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    # Ładuj pliki konfiguracyjne modułów z katalogu /etc/nginx/conf.d.
    # Zobacz http://nginx.org/en/docs/ngx_core_module.html#include
    # dla więcej informacji.
    include /etc/nginx/conf.d/*.conf;

    server {
        # Dodatkowe ustawienia ze względów bezpieczeństwa
        server_tokens off;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubdomains; preload";
        client_body_buffer_size 1k;
        client_header_buffer_size 1k;
        client_max_body_size 1k;

        # Nasłuchuj na porcie 127.0.0.1:80 jako domyślny serwer
        listen 127.0.0.1:80 default_server;

        # Twój adres onion
        server_name  q.......sga.onion;
        root         /usr/share/nginx/html;

        # Ładuj pliki konfiguracyjne dla domyślnego bloku serwera.
        include /etc/nginx/default.d/*.conf;

        location / {
            autoindex off;
            limit_except GET HEAD POST { deny all; }
            proxy_http_version 1.1;
            proxy_set_header   "Connection" "";
        }

        error_page 404 /404.html;
        location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
        }
    }

    # Ustawienia dla serwera z obsługą TLS.
    #
    #    server {
    #        listen       443 ssl http2 default_server;
    #        listen       [::]:443 ssl http2 default_server;
    #        server_name  _;
    #        root         /usr/share/nginx/html;
    #
    #        ssl_certificate "/etc/pki/nginx/server.crt";
    #        ssl_certificate_key "/etc/pki/nginx/private/server.key";
    #        ssl_session_cache shared:SSL:1m;
    #        ssl_session_timeout  10m;
    #        ssl_ciphers PROFILE=SYSTEM;
    #        ssl_prefer_server_ciphers on;
    #
    #        # Ładuj pliki konfiguracyjne dla domyślnego bloku serwera.
    #        include /etc/nginx/default.d/*.conf;
    #
    #        location / {
    #        }
    #
    #        error_page 404 /404.html;
    #        location = /40x.html {
    #        }
    #
    #        error_page 500 502 503 504 /50x.html;
    #        location = /50x.html {
    #        }
    #    }

}
```

### Sprawdź dzienniki (naciśnij Ctrl+C, aby zakończyć tail)

```bash
tail -f /var/log/tor/log
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

Zalecam zainstalowanie bardziej wygodnego narzędzia o nazwie "multitail":

```bash
sudo dnf install multitail
```

Następnie możesz wyświetlać dzienniki za pomocą tego narzędzia w ten sposób:

```bash
multitail /var/log/tor/log /var/log/nginx/access.log /var/log/nginx/error.log
```

Aby wyjść z multitail, naciśnij "q".

### Instalacja Vanguards

Jeśli prowadzisz serwis cebulowy o wysokim poziomie bezpieczeństwa, który jest atakowany przez zaawansowanych przeciwników, zalecam instalację dodatku Vanguards, który obroni przed różnymi zaawansowanymi atakami. <a href="https://blog.torproject.org/announcing-vanguards-add-onion-services/" target="_blank" rel="noreferrer noopener nofollow">Proszę przeczytaj post na blogu projektu Tor</a> o tym, jak zainstalować i używać tego narzędzia.

Możesz zainstalować Vanguards, aby chronić serwis z repozytorium GitHub <a href="https://github.com/mikeperry-tor/vanguards" target="_blank" rel="noreferrer noopener nofollow">https://github.com/mikeperry-tor/vanguards</a>

Wszystko, co musisz zrobić, to zainstalować kilka pakietów w RHEL 8:

```bash
sudo dnf install git python3-stem
```

W następnym kroku musisz sklonować repozytorium:

```bash
# Przełącz się na konto root
sudo -i 
cd /home/root
git clone https://github.com/mikeperry-tor/vanguards.git
```

Edytuj plik vanguards.py:

```bash
vim /root/vanguards/src/vanguards.py
```

Zmień shebang na ścieżkę, gdzie jest zainstalowany Twój Python3. Domyślnie będzie to /usr/bin/python3, więc powinno to wyglądać tak:

```vim
#!/usr/bin/python3
```

Naciśnij Esc, następnie wpisz :x i naciśnij Enter.

Następnie edytuj crontab za pomocą polecenia (otworzy się w domyślnym edytorze tekstu, w moim przypadku jest to Vim, ponieważ nie używam Nano):

```bash
crontab -e
```

Dodaj tę linię:

```bash
@reboot /usr/bin/python3 /root/vanguards/src/vanguards.py
```

Naciśnij Esc, następnie wpisz :x i naciśnij Enter.

Następnie możesz zrestartować serwer, a skrypt zostanie uruchomiony podczas restartu.

### Unikanie 10 najczęstszych błędów konfiguracji NGINX

Proszę odwiedzić tę stronę internetową, aby przeczytać artykuł na ten temat: <a href="https://www.nginx.com/blog/avoiding-top-10-nginx-configuration-mistakes/" target="_blank" rel="noreferrer noopener">https://www.nginx.com/blog/avoiding-top-10-nginx-configuration-mistakes/</a>