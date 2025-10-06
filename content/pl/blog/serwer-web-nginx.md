---
title: "Serwer Web - Nginx"
date:  2023-04-21T10:30:00+00:00
description: "Zainstaluj Nginx, aby skonfigurować serwer WWW."
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: admin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
-
categories:
- serwer web
cover:
    image: images/2023-thumbs/nginx.webp
---
#### Ćwiczenia do wykonania:
1. Zainstaluj Nginx.
2. Włącz i uruchom Nginx
3. Dodaj port do firewalld
4. Utwórz prostą stronę internetową
5. Sprawdź czy strona wyświetla się poprawnie przy użyciu adresu IP

<script async id="asciicast-579041" src="https://asciinema.org/a/579041.js"></script>
<script async id="asciicast-579046" src="https://asciinema.org/a/579046.js"></script>

#### Zainstaluj Nginx

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  Aby zainstalować Nginx wpisz:
  ```
  # odśwież repozytoria
  sudo zypper ref
  # zainstaluj Nginx
  sudo zypper -n in nginx
  # włącz Nginx przy starcie systemu
  sudo systemctl enable nginx
  # uruchom Nginx
  sudo systemctl start nginx
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  Aby zainstalować Nginx wpisz:
  ```
  # odśwież repozytoria
  sudo apt update
  # zainstaluj Nginx
  sudo apt -y install nginx
  # włącz Nginx przy starcie systemu
  sudo systemctl enable nginx
  # uruchom Nginx
  sudo systemctl start nginx
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  Aby zainstalować Nginx wpisz:
  ```
  # zainstaluj Nginx
  sudo yum install nginx -y
  or
  sudo dnf install nginx -y
  # włącz Nginx przy starcie systemu
  sudo systemctl enable nginx
  # uruchom Nginx
  sudo systemctl start nginx
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Zezwól na usługę Nginx

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  linux:~ # sudo firewall-cmd --add-service=http --permanent
  linux:~ # sudo firewall-cmd --add-service=https --permanent
  success
  linux:~ # sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo ufw allow 'WWW'
  lub
  sudo ufw allow 'Nginx'
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  linux:~ # sudo firewall-cmd --add-service=http --permanent
  linux:~ # sudo firewall-cmd --add-service=https --permanent
  success
  linux:~ # sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Utwórz prostą stronę internetową

```
echo 'Podstawy Linux - laboratorium' | sudo tee -a /srv/www/htdocs/index.html
```

#### Sprawdź czy strona wyświetla się poprawnie przy użyciu adresu IP

```
curl http://checkip.amazonaws.com
curl http://IP-ADDRESS
```

#### Dodatkowe moduły

Po uruchomieniu serwera Nginx można włączyć dodatkowe moduły, aby uzyskać rozszerzoną funkcjonalność.

Aby sprawdzić lsitę dodatkowych modułów, należy napisać komendę: 

```
sudo zypper search nginx
```

Załóżmy, że chcesz zainstalować moduł ModSecurity. Możesz to zrobić, uruchamiając następujące polecenie:

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  sudo zypper -n in nginx-module-modsecurity
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo apt install nginx-plus-module-modsecurity
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  sudo yum install nginx-plus-module-modsecurity
  or
  sudo dnf install nginx-plus-module-modsecurity
  ```
  {{< /tab >}}
{{< /tabs >}}

Dodaj poniższą linię do sekcji main w pliku /etc/nginx/nginx.conf

```
load_module modules/ngx_http_modsecurity_module.so;
```

Zrestartuj Nginx.

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  sudo systemctl restart nginx
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo systemctl restart nginx
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  sudo systemctl restart nginx
  ```
  {{< /tab >}}
{{< /tabs >}}

Uruchom następujące polecenie, aby sprawdzić, czy moduł załadował się pomyślnie:

```
sudo nginx -t
```

Wynik powinien być taki, jak poniżej:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Więcej na temat konfiguracji WAF tutaj: [Configuring the NGINX ModSecurity WAF with a Simple Rule](https://docs.nginx.com/nginx-waf/admin-guide/nginx-plus-modsecurity-waf-installation-logging/)
