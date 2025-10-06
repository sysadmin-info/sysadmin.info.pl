---
title: "Serwer Web - Apache2"
date:  2023-04-06T12:00:00+00:00
description: "Zainstaluj Apache2, aby skonfigurować serwer WWW."
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: admin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- P-TECH
series:
-
categories:
- serwer web
cover:
    image: images/2023-thumbs/apache2.webp
---
#### Ćwiczenia do wykonania:
1. Zainstaluj Apache2.
2. Włącz i uruchom Apache2
3. Dodaj port do firewalld
4. Utwórz prostą stronę internetową
5. Sprawdź czy strona wyświetla się poprawnie przy użyciu adresu IP

<script async id="asciicast-575077" src="https://asciinema.org/a/575077.js"></script>

#### Zainstaluj Apache2

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  Aby zainstalować Apache2 wpisz:
  ```
  # odśwież repozytoria
  sudo zypper ref
  # zainstaluj Apache2
  sudo zypper -n in apache2
  # włącz Apache2 przy starcie systemu
  sudo systemctl enable apache2
  # uruchom Apache2
  sudo systemctl start apache2
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  Aby zainstalować Apache2 wpisz:
  ```
  # odśwież repozytoria
  sudo apt update
  # zainstaluj Apache2
  sudo apt -y install Apache2
  # włącz Apache2 przy starcie systemu
  sudo systemctl enable apache2
  # uruchom Apache2
  sudo systemctl start apache2
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  Aby zainstalować Apache2 wpisz:
  ```
  # zainstaluj Apache2
  sudo yum install httpd -y
  or
  sudo dnf install httpd -y
  # włącz Apache2 przy starcie systemu
  sudo systemctl enable httpd
  # uruchom Apache2
  sudo systemctl start httpd
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Zezwól na usługę Apache2

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  linux:~ # sudo firewall-cmd --add-service=http --permanent
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
  sudo ufw allow 'Apache'
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  linux:~ # sudo firewall-cmd --add-service=http --permanent
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

Po uruchomieniu serwera Apache można włączyć dodatkowe moduły, aby uzyskać rozszerzoną funkcjonalność.

Aby sprawdzić lsitę dodatkowych modułów, należy zajrzeć do katalogu ```/etc/apache2/mods-available``` lub ```/etc/httpd/conf.modules.d```.

Załóżmy, że chcesz zainstalować moduł uwierzytelniania MySQL. Możesz to zrobić, uruchamiając następujące polecenie:

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  sudo zypper -n in libapr1-util1-dbd-mysql
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo apt install libapr1-util1-dbd-mysql
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  sudo yum install apache-mod_authn_dbd
  or
  sudo dnf install apache-mod_authn_dbd
  ```
  {{< /tab >}}
{{< /tabs >}}

Po zainstalowaniu moduł należy włączyć za pomocą poniższej komendy:

```
sudo a2enmod authn_dbd
```

Należy przeczytać: [Różnice w sposobie włączania modułów serwera Apache między SLES/OpenSUSE, Debian/Ubuntu a RedHat/Fedora/CentOS](https://serverfault.com/questions/56394/how-do-i-enable-apache-modules-from-the-command-line-in-redhat)

Następnie należy zrestartować serwer Apache, aby włączyć uaktywnić wprowadzone zmiany:

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  sudo systemctl restart apache2
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo systemctl restart apache2
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  sudo systemctl restart httpd
  ```
  {{< /tab >}}
{{< /tabs >}}