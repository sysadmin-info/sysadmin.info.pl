---
title: "Jak zainstalować Docker"
date:  2023-05-24T08:50:00+00:00
description: "Jak zainstalować Docker"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: admin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- Docker
series:
- Docker
categories:
- Docker
image: images/2023-thumbs/docker.webp
---
#### Exercises to complete:
1. Zaktualizuj swój system
2. Dodaj repozytorium Docker i odśwież repozytoria, jeśli jest to wymagane
3. Zainstaluj Docker
4. Włącz i uruchom usługę Docker
5. Zweryfikuj instalację Docker

<script async id="asciicast-587002" src="https://asciinema.org/a/587002.js"></script>

#### Aby zainstalować Docker, możesz postępować zgodnie z poniższymi krokami. Pamiętaj, że musisz mieć uprawnienia sudo lub dostęp root.


{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES 15 / openSUSE Leap 15.4
  1. **Zaktualizuj swój system:**

Najpierw upewnij się, że lista pakietów i system są aktualne.

```bash
sudo zypper refresh
sudo zypper update
```

2. **Zainstaluj Docker:**

Teraz możesz zainstalować Docker przy użyciu następującego polecenia.

```bash
sudo zypper install docker
```

3. **Włącz i uruchom usługę Docker:**

Po instalacji musisz uruchomić Docker i włączyć go do uruchamiania przy starcie.

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

4. **Zweryfikuj instalację Docker:**

Aby upewnić się, że Docker został poprawnie zainstalowany, możesz sprawdzić zainstalowaną wersję Docker.

```bash
docker --version
```

To powinno wyświetlić wersję Docker zainstalowaną na twoim systemie. Możesz również uruchomić prostą komendę Docker, taką jak:

```bash
sudo docker run hello-world
```

To polecenie pobiera obraz testowy i uruchamia go w kontenerze. Jeśli działa bez błędów, jest to dobrym dowodem na to, że Docker działa poprawnie.

Pamiętaj, aby uruchomić polecenia Docker jako użytkownik nie-root bez poprzedzania sudo, musisz dodać użytkownika do grupy docker:

```bash
sudo usermod -aG docker $USER
```

Następnie musisz się wylogować i zalogować ponownie, aby twoje członkostwo w grupie zostało odświeżone.

To wszystko! Pomyślnie zainstalowałeś Docker.
  {{< /tab >}}
  {{< tab >}}
  ### Debian 11
  Aby zainstalować Docker na Debianie 11, wykonaj następujące kroki:

**Krok 1: Aktualizacja systemu**

Najpierw zaktualizuj swoją istniejącą listę pakietów:

```bash
sudo apt update
```

Następnie zaktualizuj pakiety:

```bash
sudo apt upgrade -y
```

**Krok 2: Instalacja niezbędnego oprogramowania**

Docker wymaga niektórych pakietów, które nie są domyślnie zainstalowane, w tym pakietów umożliwiających apt korzystanie z repozytorium przez HTTPS:

```bash
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release -y
```

**Krok 3: Dodaj klucz GPG Dockera**

Następnie dodaj oficjalny klucz GPG Dockera:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

**Krok 4: Ustaw stałe repozytorium Dockera**

Następnie użyj poniższego polecenia, aby skonfigurować stabilne repozytorium Dockera:

```bash
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

**Krok 5: Instalacja Docker CE (Community Edition)**

Zaktualizuj listę pakietów `apt` i zainstaluj najnowszą wersję Docker CE:

```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

**Krok 6: Weryfikacja instalacji Dockera**

Na koniec sprawdź, czy Docker CE jest poprawnie zainstalowany, uruchamiając obraz hello-world Dockera:

```bash
sudo docker run hello-world
```

To polecenie pobiera obraz testowy i uruchamia go w kontenerze. Jeśli uruchomi się poprawnie, wyświetli komunikat informacyjny i zakończy działanie.

Powinieneś teraz mieć zainstalowany Docker na swoim systemie Debian 11. Jeśli chcesz uruchamiać polecenia Dockera jako użytkownik nie będący rootem, bez poprzedzania `sudo`, musisz dodać swojego użytkownika do grupy `docker`:

```bash
sudo usermod -aG docker ${USER}
```

Może być konieczne wylogowanie się i ponowne zalogowanie, aby te zmiany odniosły skutek.
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat 9
  Red Hat Enterprise Linux 9 usunął Docker z oficjalnych repozytoriów. Jednak nadal można zainstalować Docker, korzystając z innych metod.

Alternatywą jest użycie Podmana, który jest silnikiem kontenerów bez demonów, przeznaczonym do tworzenia, zarządzania i uruchamiania kontenerów OCI na systemie Linux. Kontenery można uruchamiać jako root lub w trybie bez roota.

Jeśli chcesz zainstalować Docker, oto jak to zrobić:

1. Ustaw repozytorium:

```bash
sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
```

2. Zainstaluj Docker Engine:

```bash
sudo dnf install docker-ce docker-ce-cli containerd.io
```

3. Uruchom Docker:

```bash
sudo systemctl start docker
```

4. Sprawdź, czy Docker Engine został poprawnie zainstalowany, uruchamiając obraz hello-world:

```bash
sudo docker run hello-world
```

5. Włącz Docker, aby uruchamiał się podczas bootowania:

```bash
sudo systemctl enable docker
```

Pamiętaj, że proces instalacji może nieco różnić się w zależności od dokładnej wersji twojego systemu RHEL i konfiguracji systemu. Jeśli którykolwiek z kroków nie działa zgodnie z oczekiwaniami, odwołaj się do oficjalnej dokumentacji Docker.

Pamiętaj, że korzystanie z Dockera wymaga uprawnień roota, więc upewnij się, że używasz sudo z poleceniami Docker, lub odpowiednio nadaj Docker uprawnienia.

Jeśli chcesz korzystać z bardziej natywnego dla RHEL rozwiązania, rozważ użycie Podman i Buildah. Te narzędzia oferują podobne funkcje do Dockera, ale są zaprojektowane z inną architekturą, która nie wymaga demona i uruchamia się jako normalny użytkownik.

Pamiętaj też, że uruchomienie demona Docker na twoim systemie może mieć implikacje dla bezpieczeństwa; powinieneś je zrozumieć przed decyzją o użyciu Dockera.
  {{< /tab >}}
{{< /tabs >}}
