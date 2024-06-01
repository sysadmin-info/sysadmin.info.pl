---
title: Nexus Repository Manager na Debianie - Instalacja, Konfiguracja i Usuwanie
date: 2024-05-15T16:00:00+00:00
description: Nexus Repository Manager na Debianie - Instalacja, Konfiguracja i Usuwanie
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Taiko
categories:
- Taiko
- Gauge
- Node.js
- npm
image: images/2024-thumbs/taiko06.webp
---

[Nexus repository](https://github.com/sonatype-nexus-community/nexus-repository-installer)
[Mój Nexus repository zawierający skrypty Bash](https://github.com/sysadmin-info/nexus)

1. **Oto tutorial wideo**

{{<youtube nUFXEMCkAho>}}

## Wymagania wstępne
Upewnij się, że masz uprawnienia root lub jesteś w grupie sudoers przed uruchomieniem skryptów.

## Krok 1: Uczyń skrypty wykonywalnymi
Najpierw ustaw uprawnienia do wykonywania dla skryptów instalacji i usuwania.

```bash
chmod +x setup_nexus.sh
chmod +x remove_nexus.sh
```

## Krok 2: Uruchom skrypt instalacyjny
Uruchom skrypt instalacyjny z uprawnieniami superużytkownika, aby zainstalować Nexus i Java.

```bash
sudo ./setup_nexus.sh
```

## Krok 3: Uruchom skrypt usuwania
Uruchom skrypt usuwania z uprawnieniami superużytkownika, aby odinstalować Nexus i Java.

```bash
sudo ./remove_nexus.sh
```

## Skrypt instalacyjny: `setup_nexus.sh`
Ten skrypt automatyzuje instalację i konfigurację Nexus Repository Manager wraz z niezbędnym środowiskiem Java na Debianie 11 i 12.

### Co robi skrypt:
1. **Sprawdzenie uprawnień roota**: Upewnia się, że skrypt jest uruchamiany z uprawnieniami roota.
2. **Instalacja niezbędnych pakietów**: Instalacja `gnupg` i dodanie repozytorium Sonatype dla Nexusa.
3. **Dodanie klucza GPG Sonatype**: Dodaje klucz GPG dla repozytorium Sonatype.
4. **Aktualizacja listy pakietów**: Aktualizuje listę pakietów, aby uwzględnić repozytorium Sonatype.
5. **Instalacja Nexusa**: Instalacja pakietu Nexus Repository Manager.
6. **Zatrzymanie usługi Nexus**: Zatrzymuje usługę Nexus, jeśli jest uruchomiona.
7. **Instalacja Java**: Pobiera i instalacja BellSoft JDK 8.
8. **Ustawienie uprawnień**: Ustawia odpowiednią własność i uprawnienia dla katalogów Nexusa.
9. **Uruchomienie usługi Nexus**: Uruchamia usługę Nexus.
10. **Instalacja Curl**: Instalacja pakietu `curl` do zapytań HTTP.
11. **Weryfikacja instalacji**: Używa `curl` do sprawdzenia, czy usługa Nexus działa i jest dostępna.
12. **Konfiguracja OrientDB**: Łączy się z konsolą OrientDB, aby zaktualizować hasło administratora.
13. **Ponowne ustawienie uprawnień**: Resetuje własność i uprawnienia po skonfigurowaniu OrientDB.
14. **Ponowne uruchomienie usługi Nexus**: Ponownie uruchamia usługę Nexus.

```bash
#!/bin/bash

##########################################################################################################
# Autor: Sysadmin                                                                                        #
# mail: admin@sysadmin.info.pl                                                                           #
# Używaj dowolnie                                                                                        #
# Kluczowe punkty:                                                                                       #
# 1. **Sprawdzenie uprawnień roota**: Skrypt weryfikuje, czy jest uruchamiany jako root.                 #
# 2. **Instalacja pakietów**: Instaluje niezbędne pakiety, w tym `gnupg` i `curl`.                       #
# 3. **Instalacja Nexus Repository**: Pobiera i instaluje Nexus Repository Manager.                      #
# 4. **Instalacja Java**: Pobiera i instaluje określoną wersję Javy.                                     #
# 5. **Uprawnienia**: Ustawia odpowiednią własność i uprawnienia dla katalogów Nexusa.                   #
# 6. **Zarządzanie usługą**: Zatrzymuje i uruchamia usługę Nexus w odpowiednich momentach.               #
# 7. **Komendy konsoli OrientDB**: Łączy się z konsolą OrientDB, aby zaktualizować hasło administratora. #
# 8. **Weryfikacja**: Używa `curl` do sprawdzenia, czy usługa Nexus działa i jest dostępna.              #
# Ten skrypt obejmuje proces instalacji i konfiguracji kompleksowo,                                      #
# w tym zarządzanie zależnościami i konfigurację niezbędnego środowiska dla Nexus Repository Manager.    #
##########################################################################################################

echo "Ten szybki instalator wymaga uprawnień roota."
echo "Sprawdzanie..."
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Nie uruchomiono jako root"
    exit 0
else
    echo "Instalacja kontynuuje"
fi

SUDO=
if [ "$UID" != "0" ]; then
    if [ -e /usr/bin/sudo -o -e /bin/sudo ]; then
        SUDO=sudo
    else
        echo "*** Ten szybki instalator wymaga uprawnień roota."
        exit 0
    fi
fi

# Instalacja niezbędnych pakietów
apt install gnupg gnupg1 gnupg2 -y
wget -P /etc/apt/sources.list.d/ https://repo.sonatype.com/repository/community-hosted/deb/sonatype-community.list
sed -i '1i deb [arch=all trusted=yes] https://repo.sonatype.com/repository/community-apt-hosted/ bionic main' /etc/apt/sources.list.d/sonatype-community.list
sed -i '2s/^/#/' /etc/apt/sources.list.d/sonatype-community.list
wget -q -O - https://repo.sonatype.com/repository/community-hosted/pki/deb-gpg/DEB-GPG-KEY-Sonatype.asc | apt-key add -
apt update && apt install nexus-repository-manager -y

# Zatrzymanie usługi Nexus Repository Manager
systemctl stop nexus-repository-manager.service

# Instalacja Java JDK 8 update 412
wget https://download.bell-sw.com/java/8u412+9/bellsoft-jdk8u412+9-linux-amd64.deb
dpkg -i bellsoft-jdk8u412+9-linux-amd64.deb
apt --fix-broken install -y
dpkg -i bellsoft-jdk8u412+9-linux-amd64.deb

# Ustawienie odpowiedniej własności i uprawnień
chown -R nexus3:nexus3 /opt/sonatype
chmod -R 750 /opt/sonatype

# Uruchomienie usługi Nexus Repository Manager
systemctl start nexus-repository-manager.service

# Instalacja curl
apt install curl -y

# Wyciągnięcie pierwszego adresu IP z `hostname -I` i zapisanie go w zmiennej
IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo "sleep 120 sekund ..."
sleep 120

# Użycie zmiennej adresu IP
echo "Adres IP to: $IP_ADDRESS"
curl http://$IP_ADDRESS:8081

# Zatrzymanie usługi Nexus Repository Manager
systemctl stop nexus-repository-manager.service

# Wykonanie komend konsoli OrientDB za pomocą dokumentu here
java -jar /opt/sonatype/nexus3/lib/support/nexus-orient-console.jar <<EOF
connect plocal:/opt/sonatype/sonatype-work/nexus3/db/security admin admin
select * from user where id = "admin"
update user SET password="\$shiro1\$SHA-512\$1024\$NE+wqQq/TmjZMvfI7ENh/g==\$V4yPw8T64UQ6GfJfxYq2hLsVrBY8D1v+bktfOxGdt4b/9BthpWPNUy/CBk6V9iA0nHpzYzJFWO8v/tZFtES8CA==" UPSERT WHERE id="admin"
exit
EOF

# Ustawienie odpowiedniej własności i uprawnień
chown -R nexus3:nexus3 /opt/sonatype
chmod -R 750 /opt/sonatype

# Uruchomienie usługi Nexus Repository Manager
system

ctl start nexus-repository-manager.service

# Sprawdzenie logów za pomocą poniższego polecenia:
# sudo tail -f /opt/sonatype/sonatype-work/nexus3/log/nexus.log
```

## Skrypt usuwania: `remove_nexus.sh`
Ten skrypt automatyzuje deinstalację i czyszczenie Nexus Repository Manager oraz środowiska Java na Debianie 11 i 12.

### Co robi skrypt:
1. **Sprawdzenie uprawnień roota**: Upewnia się, że skrypt jest uruchamiany z uprawnieniami roota.
2. **Zatrzymanie usługi Nexus**: Zatrzymuje usługę Nexus, jeśli jest uruchomiona.
3. **Wyłączenie usługi Nexus**: Wyłącza usługę Nexus, aby zapobiec jej uruchamianiu przy starcie systemu.
4. **Usunięcie skryptu przed-deinstalacyjnego**: Ręcznie usuwa problematyczny skrypt przed-deinstalacyjny, aby uniknąć błędów podczas deinstalacji.
5. **Wymuszenie usunięcia pakietu Nexus**: Wymusza usunięcie pakietu Nexus.
6. **Usunięcie katalogów Nexus**: Usuwa wszystkie katalogi i pliki związane z Nexusem.
7. **Usunięcie pakietów Java**: Usuwa pakiety BellSoft Java i Temurin JDK 8, jeśli są zainstalowane.
8. **Usunięcie resztkowych konfiguracji**: Usuwa wszelkie pozostałe pliki konfiguracyjne dla pakietów Java.
9. **Czyszczenie zależności**: Usuwa nieużywane zależności i czyści pliki menedżera pakietów.
10. **Usunięcie użytkownika i grupy Nexus**: Opcjonalnie usuwa użytkownika i grupę utworzone dla Nexusa.
11. **Ostateczne czyszczenie**: Upewnia się, że wszystkie pliki konfiguracyjne zostały usunięte.
12. **Weryfikacja usunięcia**: Sprawdza i wymienia wszelkie pozostałe pakiety Nexus i Java, aby zweryfikować całkowite usunięcie.

```bash
#!/bin/bash

echo "Ten deinstalator wymaga uprawnień roota."
echo "Sprawdzanie..."
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Nie uruchomiono jako root"
    exit 0
else
    echo "Deinstalacja kontynuuje"
fi

# Zatrzymanie usługi Nexus Repository Manager, jeśli istnieje
if systemctl is-active --quiet nexus-repository-manager.service; then
    systemctl stop nexus-repository-manager.service
fi

# Wyłączenie usługi Nexus Repository Manager, jeśli istnieje
if systemctl is-enabled --quiet nexus-repository-manager.service; then
    systemctl disable nexus-repository-manager.service
fi

# Ręczne usunięcie problematycznego skryptu przed-deinstalacyjnego nexus-repository-manager
if [ -e /var/lib/dpkg/info/nexus-repository-manager.prerm ]; then
    mv /var/lib/dpkg/info/nexus-repository-manager.prerm /var/lib/dpkg/info/nexus-repository-manager.prerm.bak
fi

# Wymuszenie usunięcia pakietu Nexus Repository Manager
dpkg --remove --force-remove-reinstreq nexus-repository-manager

# Usunięcie katalogów Nexus
rm -rf /

opt/sonatype
rm -f /etc/systemd/system/nexus-repository-manager.service
rm -f /etc/apt/sources.list.d/sonatype-community.list
rm -rf /var/cache/apt/archives/nexus-repository-manager_*.deb
rm -rf /usr/share/doc/nexus-repository-manager

# Usunięcie pakietu BellSoft Java, jeśli jest zainstalowany
if dpkg -l | grep -q bellsoft-java8; then
    dpkg --purge bellsoft-java8 || true
fi

# Usunięcie pakietu Temurin JDK 8, jeśli jest zainstalowany
if dpkg -l | grep -q temurin-8-jdk; then
    apt remove --purge temurin-8-jdk -y || true
fi

# Usunięcie resztkowych plików konfiguracyjnych
dpkg --purge ca-certificates-java java-common

# Czyszczenie nieużywanych zależności
apt autoremove -y

# Czyszczenie wszelkich pozostałych plików konfiguracyjnych
apt clean

echo "Deinstalacja zakończona."

# Opcjonalne usunięcie użytkownika i grupy utworzonej dla Nexusa
if id -u nexus3 >/dev/null 2>&1; then
    userdel nexus3
fi

if getent group nexus3 >/dev/null 2>&1; then
    groupdel nexus3
fi

# Usunięcie wszelkich pozostałych plików konfiguracyjnych
dpkg --purge nexus-repository-manager ca-certificates-java java-common

# Weryfikacja usunięcia
echo "Weryfikacja usunięcia pakietów Nexus i Java..."
dpkg -l | grep nexus
dpkg -l | grep java
```

## Uzyskiwanie dostępu do Nexusa i konfiguracja repozytorium proxy NPM

### Uzyskiwanie dostępu do Nexus Repository Manager

1. **Otwórz Nexusa w przeglądarce:**
   - Otwórz swoją preferowaną przeglądarkę internetową.
   - W pasku adresu wpisz `http://<IP_ADDRESS>:8081` i naciśnij Enter. Zamień `<IP_ADDRESS>` na rzeczywisty adres IP swojego serwera Nexus.
   
   Przykład:

   ```plaintext
   http://192.168.1.100:8081
   ```

2. **Zaloguj się do Nexusa:**
   - Na stronie logowania użyj domyślnych danych uwierzytelniających:
     - **Nazwa użytkownika:** `admin`
     - **Hasło:** `admin123`
   - Kliknij przycisk **Sign In**.

### Zmiana hasła administratora

3. **Zmień hasło administratora:**
   - Po zalogowaniu kliknij ikonę użytkownika w prawym górnym rogu interfejsu.
   - Wybierz **Change Password** z menu rozwijanego.
   - Wprowadź bieżące hasło (`admin123`), a następnie wprowadź i potwierdź nowe hasło.
   - Kliknij przycisk **Save**, aby zastosować zmiany.

### Wyłączanie dostępu anonimowego

4. **Wyłącz dostęp anonimowy:**
   - Z lewego paska bocznego przejdź do **Security** -> **Anonymous Access**.
   - Odznacz opcję **Allow anonymous users to access the server**.
   - Kliknij **Save**, aby zastosować zmiany.

5. **Wyloguj się i zaloguj ponownie z nowym hasłem:**
   - Kliknij ponownie ikonę użytkownika w prawym górnym rogu.
   - Wybierz **Sign Out** z menu rozwijanego.
   - Zaloguj się ponownie, używając nowego hasła administratora ustawionego w poprzednim kroku.

### Konfiguracja repozytorium proxy NPM

6. **Skonfiguruj repozytorium proxy NPM:**
   - Z lewego paska bocznego przejdź do **Repositories**.
   - Kliknij przycisk **Create repository**.
   - Wybierz **npm (proxy)** z listy typów repozytoriów.

7. **Konfiguracja repozytorium proxy NPM:**
   - W polu **Name** wprowadź znaczącą nazwę dla swojego repozytorium (np. `npm-proxy`).
   - W polu **Remote storage** wprowadź URL rejestru NPM:

     ```plaintext
     http://registry.npmjs.org
     ```
   - Dostosuj inne ustawienia w razie potrzeby (np. Blob store, Strict Content Validation).

8. **Zapisz konfigurację repozytorium:**
   - Przewiń na dół strony konfiguracji i kliknij przycisk **Create repository**, aby zapisać nowe repozytorium proxy NPM.

### Weryfikacja

9. **Zweryfikuj repozytorium:**
   - Przejdź do sekcji **Repositories**, aby upewnić się, że nowe repozytorium proxy NPM jest wymienione i aktywne.

### Podsumowanie poleceń i konfiguracji

- **Logowanie do Nexusa:**

  ```plaintext
  http://<IP_ADDRESS>:8081
  ```

- **Domyślne dane uwierzytelniające:**

  ```plaintext
  Nazwa użytkownika: admin
  Hasło: admin123
  ```

- **URL rejestru NPM dla repozytorium proxy

:**

  ```plaintext
  http://registry.npmjs.org
  ```

Postępując zgodnie z tymi krokami, powinieneś mieć udany dostęp do Nexus Repository Manager, zmienić hasło administratora, wyłączyć dostęp anonimowy oraz skonfigurować repozytorium proxy NPM. Teraz jesteś gotowy do zarządzania swoimi pakietami NPM za pomocą Nexusa!

---

Ten tutorial obejmuje cały cykl życia instalacji, konfiguracji i usuwania Nexus Repository Manager oraz Java na Debianie 11 i 12, a także konfigurację i zabezpieczenie środowiska Nexus.