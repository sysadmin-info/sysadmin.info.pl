---
title: "Jak dodać Docker jako node w Jenkins"
date:  2023-06-14T14:00:00+00:00
description: "Jak dodać Docker jako node w Jenkins"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- Docker
- Jenkins
series:
- Jenkins
categories:
- Docker
- Jenkins
image: images/2023-thumbs/docker-as-node.webp
---

{{<youtube jlenypFnn2I>}}


#### Poradnik:
1. Utwórz użytkownika jenkins na węźle Docker
```bash
sudo useradd -d /var/lib/jenkins jenkins
sudo passwd jenkins
sudo mkdir /var/lib/jenkins/.ssh
sudo touch /var/lib/jenkins/.ssh/authorized_keys
sudo chmod 600 /var/lib/jenkins/.ssh/authorized_keys
sudo chmod 700 /var/lib/jenkins/.ssh
cd /var/lib/
sudo chown -R jenkins:jenkins jenkins
cd jenkins
ls -alh
```

Zmień powłokę na Bash dla użytkownika jenkins

```bash
sudo vim /etc/passwd
```

Zamień sh na bash dla użytkownika jenkins. Zapisz i wyjdź

Zaloguj się jako użytkownik jenkins.

```bash
sudo su - jenkins
```

2. Zainstaluj Java 11 open JDK na węźle Docker

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install java-11-openjdk
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install openjdk-11-jdk
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install java-11-openjdk
  ```
  {{< /tab >}}
{{< /tabs >}}

3. Sprawdź wersję Javy

```bash
java -version
```

4. Zainstaluj Git na węźle Docker

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install git
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install git
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install git
  ```
  {{< /tab >}}
{{< /tabs >}}

5. Generowanie klucza RSA dla węzła Docker na serwerze Jenkins

Zaloguj się na główny serwer Linux, gdzie zainstalowany jest Jenkins, i przełącz się na użytkownika jenkins.

```bash
sudo su - jenkins
```

Teraz musisz wygenerować klucze RSA dla węzła Docker. Nie zapomnij ustawić hasła. Dodasz je później w panelu zarządzania węzłami Jenkins.

```bash
ssh-keygen -t rsa -C "Klucz dostępu do węzła Docker" -f /var/lib/jenkins/.ssh/id_rsa_docker_node
```

6. Skopiuj publiczny klucz RSA z serwera Jenkins na węzeł Docker. Użyj adresu IP węzła Docker.

```bash
ssh-copy-id -i id_rsa_docker_node.pub jenkins@10.10.0.121
```

7. Wyłącz logowanie hasłem, puste hasła i logowanie jako root w /etc/ssh/sshd_config na serwerze Jenkins i węźle Docker.

```bash
# Zabroń dostępu dla roota przez ssh
sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
# Zabroń uwierzytelniania hasłem przez ssh
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
# Zabroń używania pustych haseł
sed -i 's/#PermitEmptyPasswords no/PermitEmptyPasswords no/g' /etc/ssh/sshd_config
# Włącz uwierzytelnianie kluczem publicznym
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/g' /etc/ssh/sshd_config
```

Zrestartuj demona ssh

```bash
systemctl restart sshd.service
```

8. Sprawdź, czy możesz zalogować się używając prywatnego klucza RSA po wyłączeniu logowania hasłem.

```bash
ssh -i id_rsa_docker_node jenkins@10.10.0.121
```

9. Dodaj węzeł Linux do głównego serwera Linux z Jenkinsem

* Zaloguj się do panelu internetowego Jenkins: http://10.10.0.113:8080
* Kliknij Zarządzaj Jenkinsem → Zarządzaj węzłami i chmurami
* Kliknij + Nowy węzeł w lewym panelu.
* Podaj nazwę węzła
* Wybierz stałego agenta
* Ustaw opis taki sam jak nazwa węzła
* Ustaw liczbę wykonawców na 1 (można to zwiększyć później)
* Ustaw katalog główny zdalny na /var/lib/jenkins
* Ustaw etykietę docker
* Użycie: używaj tego węzła jak najczęściej
* Metoda uruchamiania: Uruchamianie agentów przez SSH
* Host: podaj adres IP węzła Docker
* Poświadczenia → dodaj → wybierz Jenkins
* Rodzaj - wybierz z listy rozwijanej Nazwa użytkownika SSH z kluczem prywatnym
* Podaj nazwę użytkownika: jenkins
* Wybierz wprowadź bezpośrednio
* Wklej prywatny klucz skopiowany z id_rsa_docker_node na głównym serwerze Linux z Jenkinsem (patrz część: Generowanie klucza RSA dla węzła Docker na serwerze Jenkins)
* W polu Opis podaj przyjazną nazwę, np. Klucz RSA dla węzła Docker Jenkinsa lub coś, co łatwo zidentyfikuje poświadczenia.
* Podaj hasło do tego wygenerowanego wcześniej prywatnego klucza RSA na głównym serwerze Linux.
* Kliknij dodaj
* Wybierz nowo utworzone poświadczenia z listy rozwijanej
* Strategia weryfikacji klucza hosta: wybierz: Strategia weryfikacji znanych hostów
* Dostępność: Utrzymuj tego agenta online jak najdłużej
* W właściwościach węzła zaznacz/zaznacz Zmienne środowiskowe i Lokalizacje narzędzi
* W sekcji Zmienne środowiskowe dodaj: 
* Nazwa: JAVA_HOME
* Wartość: /usr/bin/java
* W sekcji Lokalizacje narzędzi dodaj:
* Nazwa: Git (domyślny)
* Wartość: /usr/bin/git
* Kliknij zapisz

10. Ustaw próg wolnego miejsca na węźle
11. Rozszerz wolumin logiczny var
```bash
sudo lvextend -L +2G /dev/mapper/docker--vg-var
sudo resize2fs /dev/mapper/docker--vg-var
df -kTh /var
```

12. Czyszczenie katalogu /var/tmp - wyjaśnienie z przykładami

```bash
sudo find /var/tmp -type -f -mtime -1 -exec rm {} \;
sudo find /var/tmp -type -f -mtime -1 -delete
sudo find /var/tmp -type -f -mtime -1 | xargs rm
```