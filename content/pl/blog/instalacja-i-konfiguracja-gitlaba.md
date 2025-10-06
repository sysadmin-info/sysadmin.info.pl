---
title: Instalacja i konfiguracja GitLaba
date: 2023-06-10T12:30:00+00:00
description: Instalacja i konfiguracja GitLaba
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Jenkins
categories:
- Docker
- Jenkins
- GitLab
cover:
    image: images/2023-thumbs/gitlab.webp
---
W tym filmie wyjaśniam, jak zainstalować i skonfigurować GitLaba na Debianie 11, jednak poniżej możesz przeczytać poradnik dla innych dystrybucji Linuksa.

{{<youtube vGcWAdMIfUY>}}

GitLab to otwartoźródłowa platforma rozwoju oprogramowania end-to-end z wbudowaną kontrolą wersji, śledzeniem problemów, recenzją kodu, CI/CD i więcej. Samodzielnie hostuj GitLaba na własnych serwerach, w kontenerze lub u dostawcy chmury. Źródło: <a rel="noreferrer noopener" href="https://gitlab.com/gitlab-org/gitlab" target="_blank">GitLab CE</a>

GitLab FOSS jest tylko do odczytu lustrem GitLaba, z usuniętym cały prywatnym kodem. Ten projekt był wcześniej używany do hostowania GitLab Community Edition, ale cały rozwój przeniósł się teraz do <a rel="noreferrer noopener" href="https://gitlab.com/gitlab-org/gitlab" target="_blank">GitLab CE</a> Źródło: <a rel="noreferrer noopener" href="https://gitlab.com/gitlab-org/gitlab-foss" target="_blank">GitLab CE / Gitlab FOSS</a>


### Poradnik

Podstawowe wymagania dla wirtualnej maszyny

8 GB RAM
4 vCPU
40 GB miejsca na dysku
Miejsce na dysku:

- dysk systemowy (sda) .... 40GB
-- W razie potrzeby utwórz oddzielną partycję /opt (~20GB), ponieważ GitLab jest instalowany w /opt/gitlab

- dysk danych (sdb) ..... 60GB
-- zamontuj na /data
-- zdefiniuj katalog danych GitLaba /data/gitlab

W razie potrzeby zwiększ rozmiar partycji.


##### Dodaj drugi dysk i utwórz partycję.

```bash
sudo fdisk /dev/sdb
```

Następnie wpisz litery w kolejności i ustaw parametry

```
n
naciśnij Enter
p
naciśnij Enter
1
naciśnij Enter dwa razy
t
naciśnij Enter
8E
naciśnij Enter
w
naciśnij Enter
```

##### Instalacja parted

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install parted
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install parted
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install parted
  ```
  {{< /tab >}}
{{< /tabs >}}


##### Wykonaj poniższe polecenie

```bash
sudo parted /dev/sdb
```

##### Dodaj wolumin fizyczny w menedżerze woluminów logicznych

```bash
sudo pvcreate /dev/sdb1
```

##### Utwórz grupę woluminów i dodaj do niej /dev/sdb1

```bash
sudo vgcreate gitlab-data /dev/sdb1
```

##### Utwórz wolumin logiczny

```bash
sudo lvcreate -n gitlab-data -l 100%FREE gitlab-data
```

##### Utwórz system plików ext4

```bash
mkfs.ext4 /dev/gitlab-data/gitlab-data
```

##### Wyświetl urządzenie

```bash
sudo ls -al /dev/mapper
```

##### Utwórz katalog danych w katalogu głównym

```bash
cd /
sudo mkdir data
```

##### Dodaj do /etc/fstab wpis dla danych. Zapisz i wyjdź.

```bash
vim /etc/fstab
# dodaj poniższe
/dev/mapper/gitlab--data-gitlab--data /data ext4 defaults 0 2
```

##### Zamontuj wpis z /etc/fstab

```bash
mount -a
```

##### Sprawdź poniższym poleceniem status zamontowanego zasobu

```bash
sudo df -kTh
```

##### Zaktualizuj system

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper ref
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt update
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf check-update
  ```
  {{< /tab >}}
{{< /tabs >}}


##### Zainstaluj wymagane pakiety

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install curl vim openssh perl postfix mailutils git
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install curl vim openssh-server ca-certificates postfix mailutils gnupg debian-archive-keyring apt-transport-https git
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf curl vim openssh-server ca-certificates postfix mailutils gnupg policycoreutils python3-policycoreutils git
  ```
  {{< /tab >}}
{{< /tabs >}}


##### Instalacja GitLab CE

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install curl perl
  # Sprawdź, czy potrzebne jest otwarcie firewalla: sudo systemctl status firewalld
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo systemctl reload firewalld

  # Dodaj repozytorium pakietów GitLab i zainstaluj pakiet
  curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.rpm.sh | sudo bash

  # Instalacja GitLab CE
  sudo zypper install gitlab-ee
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  id="os=debian&dist=bullseye"
  curl -ssf "https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/config_file.list?$id" >/etc/apt/sources.list.d/gitlab-ce.list
  curl -L https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey | gpg --dearmor > /etc/apt/trusted.gpg.d/gitlab-ce.gpg
  sudo vim /etc/apt/sources.list.d/gitlab-ce.list
  # zmień klucz gpg na:  /etc/apt/trusted.gpg.d/gitlab-ce.gpg
  # Powinno wyglądać jak poniżej:

  # ten plik został wygenerowany przez packages.gitlab.com dla
  # repozytorium na https://packages.gitlab.com/gitlab/gitlab-ce
  deb [signed-by=/etc/apt/trusted.gpg.d/gitlab-ce.gpg] https://packages.gitlab.com/gitlab/gitlab-ce/debian/ bullseye main
  deb-src [signed-by=/etc/apt/trusted.gpg.d/gitlab-ce.gpg] https://packages.gitlab.com/gitlab/gitlab-ce/debian/ bullseye main

  # Aktualizacja apt
  sudo apt update

  # Instalacja GitLab CE
  sudo apt install gitlab-ce
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  # Sprawdź, czy potrzebne jest otwarcie firewalla: sudo systemctl status firewalld
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo systemctl reload firewalld

  # Dodaj repozytoria dla GitLab CE
  sudo vim /etc/yum.repos.d/gitlab_gitlab-ce.repo

  #Dodaj poniższe linie do pliku:
  [gitlab_gitlab-ce]
  name=gitlab_gitlab-ce
  baseurl=https://packages.gitlab.com/gitlab/gitlab-ce/el/8/$basearch
  repo_gpgcheck=1
  gpgcheck=1
  enabled=1
  gpgkey=https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey
         https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey/gitlab-gitlab-ce-3D645A26AB9FBD22.pub.gpg
  sslverify=1
  sslcacert=/etc/pki/tls/certs/ca-bundle.crt
  metadata_expire=300

  [gitlab_gitlab-ce-source]
  name=gitlab_gitlab-ce-source
  baseurl=https://packages.gitlab.com/gitlab/gitlab-ce/el/8/SRPMS
  repo_gpgcheck=1
  gpgcheck=1
  enabled=1
  gpgkey=https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey
         https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey/gitlab-gitlab-ce-3D645A26AB9FBD22.pub.gpg
  sslverify=1
  sslcacert=/etc/pki/tls/certs/ca-bundle.crt
  metadata_expire=300

  # Sprawdzenie repozytoriów
  sudo dnf repolist

  # Instalacja GitLab CE
  sudo dnf install gitlab-ce -y  
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Konfiguracja

1. Konfiguracja Postfixa

```bash
sudo vim /etc/postfix/main.cf
```

Ustaw jak poniżej

```bash
compatibility_level = 2
mail_owner = postfix
setgid_group = postdrop
inet_interfaces = localhost
inet_protocols = all
mydomain = gitlab.local
mydestination = $myhostname, localhost.$mydomain, localhost
relayhost = mail.gitlab.local
unknown_local_recipient_reject_code = 550
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
```

Restartuj Postfixa

```bash
sudo systemctl restart postfix
```

2. Utwórz katalog ssl i wygeneruj certyfikaty

```bash
cd /etc/gitlab
sudo mkdir ssl
sudo openssl genrsa -out gitlab.key 2048
sudo openssl req -key gitlab.key -new -out gitlab.csr
sudo openssl x509 -signkey gitlab.key -in gitlab.csr -req -days 365 -out gitlab.crt
```

3. Edytuj główny plik konfiguracyjny: /etc/gitlab/gitlab.rb

```bash
sudo vim /etc/gitlab/gitlab.rb
```

external_url 'https://10.10.0.119'

## Domyślny katalog przechowywania danych
git_data_dirs({
"default" => { "path" => "/data/git" }
})

## Ustawienia użytkownika GitLab
user['git_user_email'] = "gitlab@gitlab.local"

## Ustawienia e-mail
gitlab_rails['gitlab_email_from'] = 'gitlab@gitlab.local'
gitlab_rails['gitlab_email_display_name'] = 'GitLab'
gitlab_rails['gitlab_email_reply_to'] = 'noreply@gitlab.local'

## GitLab NGINX
nginx['enable'] = true
nginx['redirect_http_to_https'] = true
nginx['redirect_http_to_https_port'] = 80
nginx['ssl_certificate'] = "/etc/gitlab/ssl/gitlab.crt"
nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/gitlab.key"

4. Ponowna konfiguracja GitLaba

```bash
sudo gitlab-ctl reconfigure
```

5. Włącz i uruchom GitLaba

```bash
sudo systemctl enable gitlab-runsvdir.service
sudo systemctl start gitlab-runsvdir.service
```

6. Dostęp do interfejsu sieciowego GitLab CE

> https://10.10.0.119
> Zaloguj się na konto: root
> hasło znajduje się w /etc/gitlab/initial_root_password

7. Zresetuj hasło użytkownika "root"

```bash
# sudo gitlab-rake "gitlab:password:reset"
> Wpisz nazwę użytkownika: root
> Wpisz hasło:
```

8. Usuń początkowe hasło roota

```bash
sudo rm -f /etc/gitlab/initial_root_password
```