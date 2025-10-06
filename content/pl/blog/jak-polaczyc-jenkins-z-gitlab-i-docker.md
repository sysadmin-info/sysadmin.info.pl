---
title: Jak połączyć Jenkins z GitLab i Docker
date: 2023-06-09T21:30:00+00:00
description: Jak połączyć Jenkins z GitLab i Docker
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
    image: images/2023-thumbs/jenkins-gitlab-docker.webp
---
W tej serii wyjaśniam, jak zainstalować Jenkins, GitLab i Docker na trzech oddzielnych maszynach wirtualnych w Proxmox i połączyć je razem, aby uruchomić zadanie w Jenkins, które korzysta z potoku Jenkinsa znajdującego się na serwerze GitLab i uruchamia kontener Docker z predefiniowanej konfiguracji w pliku Docker, aby przeprowadzić test. Przewiń w dół, aby przeczytać samouczek, proszę.

Wprowadzenie:
{{<youtube QoP3Pc8rvCk>}}

Część pierwsza:
{{<youtube ajMuYQML4fo>}}

Część druga:
{{<youtube -NXVxxRCjqw>}}

### Samouczek

##### Dodaj repozytorium Jenkinsa

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper addrepo http://pkg.jenkins.io/opensuse-stable/ jenkins
  sudo zypper ref
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  wget https://pkg.jenkins.io/debian-stable/jenkins.io.key
  sudo apt-key add jenkins.io.key
  echo "deb https://pkg.jenkins.io/debian-stable binary/" | tee /etc/apt/sources.list.d/jenkins.list
  sudo apt update -y
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install wget
  wget -O /etc/yum.repos.d/jenkins.repo http://pkg.jenkins-ci.org/redhat-stable/jenkins.repo
  sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
  ```
  {{< /tab >}}
{{< /tabs >}}

##### Zainstaluj Java 11 open JDK

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

##### Sprawdź wersję Java

```bash
java -version
```

##### Zainstaluj Jenkinsa

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install jenkins
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install jenkins
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install jenkins
  ```
  {{< /tab >}}
{{< /tabs >}}

##### Włącz i uruchom Jenkinsa

```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins
```

{{< notice success "Rozwiązanie problemu z linkiem symbolicznym dla Jenkinsa" >}}
Jeśli zobaczysz błąd o brakującym pliku lub katalogu podczas włączania Jenkinsa, musisz edytować plik /usr/lib/systemd/systemd-sysv-install i zmienić linię zawierającą S50 na poniższą:
```
symlink="$(pwd)/$1"
```
Po tym włącz i uruchom Jenkinsa ponownie.
{{< /notice >}}

##### Dodaj port 8080 w firewalld, przeładuj konfigurację i sprawdź status konfiguracji firewalla

```bash
sudo firewall-cmd --add-port=8080/tcp --permanent --zone="public"
sudo firewall-cmd --reload
sudo firewall-cmd --list-all
```

##### Sprawdź adres IP swojej maszyny

```bash
hostname -I
```

##### Skopiuj URL i wklej go do paska adresu w przeglądarce, a następnie kontynuuj instalację

##### Wyświetl i skopiuj hasło z pliku, a następnie wklej je do pola hasła administratora. Użyj kombinacji ctrl+shift+c, aby skopiować wyświetlone hasło z linii poleceń.

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

##### Zainstaluj sugerowane wtyczki i kontynuuj

##### Utwórz pierwszego administratora i kontynuuj.

##### Pozostaw URL Jenkinsa bez zmian.

##### Zainstaluj wtyczkę locale

Przejdź do Zarządzaj Jenkins, następnie kliknij Wtyczki, kliknij dostępne wtyczki, w polu wyszukiwania wpisz locale i naciśnij Enter. Kliknij na przycisk zainstaluj bez restartu. Następnie kliknij jeszcze raz na Zarządzaj Jenkins, Kliknij System i przewiń w dół do sekcji locale. Ustaw język en_us w polu Domyślny język i wybierz Ignoruj preferencje przeglądarki i wymuś ten język dla wszystkich użytkowników. Kliknij przyciski Zastosuj i Zapisz. Zainstaluj wtyczkę Restart w ten sam sposób i zrestartuj Jenkinsa.

##### Usuń początkowe hasło administratora.

```bash
sudo rm -f /var/lib/jenkins/secrets/initialAdminPassword
```

##### Podsumowanie

Korzystając z powyższej metody, masz działającego Jenkinsa, który możesz później połączyć z serwerami GitLab i Docker, aby stworzyć środowisko do celów testowych.