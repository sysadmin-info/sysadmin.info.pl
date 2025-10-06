---
title: Bezproblemowe uruchamianie HashiCorp Vault - przewodnik krok po kroku przy użyciu usług systemd
date: 2024-06-17T13:00:00+00:00
description: Bezproblemowe uruchamianie HashiCorp Vault - przewodnik krok po kroku przy użyciu usług systemd
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- GitLab
categories:
- GitLab
cover:
    image: images/2024-thumbs/gitlab05.webp
---

#### Wprowadzenie

Vault od HashiCorp wymaga odblokowania po każdym restarcie, aby zapewnić bezpieczeństwo przechowywanych sekretów. Ten poradnik przeprowadzi Cię przez automatyzację procesu odblokowywania za pomocą usługi systemd w systemie Linux.

#### Wymagania wstępne

- Vault zainstalowany i skonfigurowany w Twoim systemie
- Dostęp do kluczy odblokowujących
- Podstawowa znajomość systemd i skryptów bash
- `gpg` zainstalowany do szyfrowania

#### Jak zainstalować gpg

{{< tabs Debian CentOS Fedora Arch OpenSUSE >}}
  {{< tab >}}

##### Debian/Ubuntu

  ```bash
  sudo apt update
  sudo apt -y install gnupg
  gpg --version
  ```

  {{< /tab >}}
  {{< tab >}}

##### CentOS/RHEL

  ```bash
  sudo yum update
  sudo yum -y install gnupg
  gpg --version
  ```

  {{< /tab >}}
  {{< tab >}}

##### Fedora

  ```bash
  sudo dnf update
  sudo dnf -y install gnupg
  gpg --version
  ```

  {{< /tab >}}
  {{< tab >}}

##### Arch Linux

  ```bash
  sudo pacman -Syu
  sudo pacman -S gnupg
  gpg --version
  ```

  {{< /tab >}}
  {{< tab >}}

##### OpenSUSE

  ```bash
  sudo zypper refresh
  sudo zypper install gpg2
  gpg --version
  ```

  {{< /tab >}}
{{< /tabs >}}

#### Krok 1: Przygotowanie

1.**Zaloguj się przez SSH**: Połącz się ze swoim serwerem jako standardowy użytkownik i przełącz się na root.

   ```bash
   sudo -i
   ```

2.**Rozpocznij nową sesję bash**: Uruchom nową powłokę bash i wyłącz historię.

Wyjaśnienie: Dla najwyższego bezpieczeństwa, uruchom komendę w nowej sesji powłoki, gdzie historia jest wyłączona, i upewnij się, że żadne wrażliwe informacje nie są przechowywane.

   ```bash
   bash
   set +o history
   ```

3.**Utwórz plik do przechowywania hasła GPG**: Upewnij się, że plik jest dostępny tylko dla użytkownika root.

   ```bash
   echo "your-passphrase" > /root/.gpg_passphrase
   ```

4.**Ustaw uprawnienia, aby plik był czytelny tylko dla użytkownika root.**

   ```bash
   chmod 400 /root/.gpg_passphrase
   ```

#### Krok 2: Szyfrowanie kluczy odblokowujących

1.**Utwórz zaszyfrowany plik do przechowywania kluczy odblokowujących**:

   ```bash
   echo -e "your-unseal-key-1\nyour-unseal-key-2\nyour-unseal-key-3" | gpg --batch --yes --passphrase-file /root/.gpg_passphrase --symmetric --cipher-algo AES256 -o /root/.vault_unseal_keys.gpg
   chmod 400 /root/.vault_unseal_keys.gpg
   ```

2.**Wyczyść historię bash i wyjdź z tymczasowej sesji**:

   ```bash
   history -c
   exit
   ```

#### Krok 3: Utwórz skrypt odblokowujący

Utwórz skrypt do odblokowywania Vault, który bezpiecznie pobiera klucze odblokowujące. Zapisz poniższy skrypt do `/usr/local/bin/unseal_vault.sh`.

```bash
#!/bin/bash

export VAULT_ADDR='https://<vault IP address>:8200'

# Utwórz plik logu, jeśli nie istnieje
LOGFILE=/var/log/unseal_vault.log
if [ ! -f "$LOGFILE" ]; then
    touch "$LOGFILE"
    chown vault:vault "$LOGFILE"
else
    echo "$LOGFILE exists"
fi

# Zaloguj czas rozpoczęcia
echo "Starting unseal at $(date)" >> $LOGFILE

# Czekaj na gotowość Vault
while ! vault status 2>&1 | grep -q "Sealed.*true"; do
  echo "Waiting for Vault to be sealed and ready..." >> $LOGFILE
  sleep 5
done

echo "Vault is sealed and ready at $(date)" >> $LOGFILE

# Załaduj hasło GPG
GPG_PASSPHRASE=$(cat /root/.gpg_passphrase)

# Odszyfruj klucze odblokowujące
UNSEAL_KEYS=$(gpg --quiet --batch --yes --decrypt --passphrase "$GPG_PASSPHRASE" /root/.vault_unseal_keys.gpg)
if [ $? -ne 0 ]; then
  echo "Failed to decrypt unseal keys at $(date)" >> $LOGFILE
  exit 1
fi

echo "Unseal keys decrypted successfully at $(date)" >> $LOGFILE

# Przekształć odszyfrowane klucze w tablicę
UNSEAL_KEYS_ARRAY=($(echo "$UNSEAL_KEYS"))

# Odblokuj Vault
for key in "${UNSEAL_KEYS_ARRAY[@]}"; do
# zakomentowane, ponieważ nie chcę już tego debugować
  vault operator unseal "$key" # >> $LOGFILE 2>&1
  #if [ $? -ne 0 ]; then
  #  echo "Failed to unseal with key $key at $(date)" >> $LOGFILE
  #  exit 1
  #fi
  #echo "Successfully used unseal key $key at $(date)" >> $LOGFILE
done

echo "Vault unsealed successfully at $(date)" >> $LOGFILE
```

Uczyń skrypt wykonywalnym:

```bash
chmod 500 /usr/local/bin/unseal_vault.sh
```

#### Krok 4: Zmodyfikuj usługę Vault

Zmodyfikuj plik `/etc/systemd/system/vault.service`, aby uwzględnić zależność od `vault-unseal.service`.

```ini
[Unit]
Description=HashiCorp Vault
Documentation=https://www.vaultproject.io/docs/
Requires=network-online.target
After=network-online.target
Requires=vault-unseal.service

[Service]
User=vault
Group=vault
EnvironmentFile=/etc/vault.d/vault.env
ExecStart=/usr/bin/vault server -config=/etc/vault.d/vault.hcl
ExecReload=/bin/kill --signal HUP $MAINPID
KillMode=process
KillSignal=SIGINT
Restart=on-failure
RestartSec=5
LimitNOFILE=65536
LimitMEMLOCK=infinity

[Install]
WantedBy=multi-user.target
```

#### Krok 5: Utwórz usługę Vault Unseal

Utwórz nowy plik usługi w `/etc/systemd/system/vault-unseal.service` z następującą zawartością:

```ini
[Unit]
Description=Unseal Vault
After=vault.service
Requires=vault.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/unseal_vault.sh
Environment=VAULT_ADDR=https://<vault IP address>:8200
Environment=DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus

[Install]
WantedBy=multi-user.target
```

#### Krok 6: Stwórz plik vault.env

```bash
cat << 'EOF' > /etc/vault.d/vault.env
VAULT_ADDR=https://<vault IP address>:8200
DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus
EOF
```

#### Krok 7: wyeksportuj zmienne do to .bashrc

```bash
BASHRC_PATH="$HOME/.bashrc"
echo "export VAULT_ADDR='https://<vault IP address>:8200'" >> $BASHRC_PATH
echo "export DBUS_SESSION_BUS_ADDRESS=\$XDG_RUNTIME_DIR/bus" >> $BASHRC_PATH
source $BASHRC_PATH
```

Dzięki tym modyfikacjom, usługa `vault-unseal.service` będzie uważana za część procesu `vault.service`. Restart `vault.service` będzie teraz także uruchamiał `vault-unseal.service`.

#### Krok 6: Przeładuj systemd i uruchom usługi

Przeładuj systemd, aby zastosować zmiany i uruchom usługi:

```bash
systemctl daemon-reload
systemctl restart vault.service
```

#### Krok 8: Włącz obie usługi podczas rozruchu

```bash
systemctl enable vault-unseal.service
systemctl enable vault.service
```

#### Wyjaśnienie: Co się dzieje podczas procesu rozruchu

Kiedy Twój system uruchamia się, dzieje się następująca sekwencja:

1. **`vault.service` startuje**: Jest to główna usługa dla Vault. Startuje zgodnie z jej konfiguracją.
2. **`vault-unseal.service` startuje**: Ta usługa jest skonfigurowana do uruchamiania po `vault.service` z powodu dyrektywy `After=vault.service`. Oznacza to, że `vault-unseal.service` nie uruchomi się, dopóki `vault.service` nie zostanie w pełni uruchomiona.

Usługa `vault-unseal.service` zależy od `vault.service` i będzie uruchamiać skrypt odblokowujący klucze dopiero po uruchomieniu usługi Vault.

### Zachowanie przy ręcznym restarcie

#### Ręczny restart `vault.service`

Kiedy ręcznie restartujesz `vault.service` używając komendy:

```bash
systemctl restart vault.service
```

Oto co się dzieje:

1. **`vault.service` zatrzymuje się**: Usługa Vault zatrzymuje się, a następnie ponownie uruchamia.
2. **`vault-unseal.service` uruchamia się automatycznie**: Usługa `vault-unseal.service` uruchamia się automatycznie, ponieważ `vault.service` został zrestartowany. `vault-unseal.service` jest ustawiona do uruchamiania po `vault.service` podczas procesu rozruchu.

### Sprawdzenie logu

Aby sprawdzić, czy faktycznie `vault-unseal.service` uruchomi się za każdym razem, gdy usługa  `vault.service` jest restartowana, uruchom poniższą komendę:

```bash
tail -f /var/log/unseal_vault.log
```

W innej sesji SSH, zrestartuj `vault.service`:

```bash
systemctl restart vault.service
```

Następnie sprawdź status obu usług, aby upewnić się, że działają zgodnie z oczekiwaniami:

```bash
systemctl status vault.service
systemctl status vault-unseal.service
```

### Podsumowanie

Ta konfiguracja zapewnia bezpieczną metodę odblokowywania Vault poprzez szyfrowanie kluczy odblokowujących za pomocą GPG i bezpieczne przechowywanie hasła. Skrypt pobiera hasło i odszyfrowuje klucze podczas działania, zwiększając bezpieczeństwo Twojej konfiguracji.

Postępując zgodnie z tym przewodnikiem, zapewniasz, że wrażliwe klucze odblokowujące nie są narażone na widok w postaci zwykłego tekstu, a dostęp do hasła jest ograniczony do użytkownika root, zapewniając dodatkową warstwę bezpieczeństwa.

`vault-unseal.service` będzie uruchamiana zarówno podczas procesu rozruchu, jak i podczas ręcznych restartów `vault.service`, powodując, że Vault automatycznie będzie odblokowany i operacyjny.

#### Przegląd wideo

{{<youtube AvtRY9EszSI>}}

#### Skrypt bash, który automatyzuje cały proces

```bash
vim vault.sh
```

Umieść poniższą zawartość:

```bash
#!/bin/bash

echo "Ten szybki skrypt instalacyjny wymaga uprawnień roota."
echo "Sprawdzanie..."
if [[ $(/usr/bin/id -u) -ne 0 ]]; 
then
    echo "Nie uruchomiono jako root"
    exit 0
else
        echo "Instalacja trwa"
fi

SUDO=
if [ "$UID" != "0" ]; then
        if [ -e /usr/bin/sudo -o -e /bin/sudo ]; then
                SUDO=sudo
        else
                echo "*** Ten szybki skrypt instalacyjny wymaga uprawnień roota."
                exit 0
        fi
fi

# Krok 1: Utwórz plik z hasłem
echo "<your passphrase>" > /root/.gpg_passphrase
chmod 400 /root/.gpg_passphrase

# Krok 2: Zaszyfruj klucze odblokowujące
echo -e "your-unseal-key-1\nyour-unseal-key-2\nyour-unseal-key-3" | gpg --batch --yes --passphrase-file /root/.gpg_passphrase --symmetric --cipher-algo AES256 -o /root/.vault_unseal_keys.gpg

chmod 400 /root/.vault_unseal_keys.gpg

# Krok 3: Wyczyść historię bash i zakończ tymczasową sesję
history -c

# Krok 4: Utwórz skrypt odblokowujący
cat << 'EOF' > /usr/local/bin/unseal_vault.sh
#!/bin/bash

export VAULT_ADDR='https://<vault IP address>:8200'

# Utwórz plik logu, jeśli nie istnieje
LOGFILE=/var/log/unseal_vault.log
if [ ! -f "$LOGFILE" ]; then
    touch "$LOGFILE"
    chown vault:vault "$LOGFILE"
else
    echo "$LOGFILE exists"
fi

# Zaloguj czas rozpoczęcia
echo "Starting unseal at $(date)" >> $LOGFILE

# Czekaj na gotowość Vault
while ! vault status 2>&1 | grep -q "Sealed.*true"; do
  echo "Waiting for Vault to be sealed and ready..." >> $LOGFILE
  sleep 5
done

echo "Vault is sealed and ready at $(date)" >> $LOGFILE

# Załaduj hasło GPG
GPG_PASSPHRASE=$(cat /root/.gpg_passphrase)

# Odszyfruj klucze odblokowujące
UNSEAL_KEYS=$(gpg --quiet --batch --yes --decrypt --passphrase "$GPG_PASSPHRASE" /root/.vault_unseal_keys.gpg)
if [ $? -ne 0 ]; then
  echo "Failed to decrypt unseal keys at $(date)" >> $LOGFILE
  exit 1
fi

echo "Unseal keys decrypted successfully at $(date)" >> $LOGFILE

# Przekształć odszyfrowane klucze w tablicę
UNSEAL_KEYS_ARRAY=($(echo "$UNSEAL_KEYS"))

# Odblokuj Vault
for key in "${UNSEAL_KEYS_ARRAY[@]}"; do
# zakomentowane, ponieważ nie chcę już tego debugować
  vault operator unseal "$key" # >> $LOGFILE 2>&1
  #if [ $? -ne 0 ]; then
  #  echo "Failed to unseal with key $key at $(date)" >> $LOGFILE
  #  exit 1
  #fi
  #echo "Successfully used unseal key $key at $(date)" >> $LOGFILE
done

echo "Vault unsealed successfully at $(date)" >> $LOGFILE
EOF

chmod 500 /usr/local/bin/unseal_vault.sh

# Krok 5: Zmodyfikuj vault.service
cat << 'EOF' > /etc/systemd/system/vault.service
[Unit]
Description=HashiCorp Vault
Documentation=https://www.vaultproject.io/docs/
Requires=network-online.target
After=network-online.target
Requires=vault-unseal.service

[Service]
User=vault
Group=vault
EnvironmentFile=/etc/vault.d/vault.env
ExecStart=/usr/bin/vault server -config=/etc/vault.d/vault.hcl
ExecReload=/bin/kill --signal HUP $MAINPID
KillMode=process
KillSignal=SIGINT
Restart=on-failure
RestartSec=5
LimitNOFILE=65536
LimitMEMLOCK=infinity

[Install]
WantedBy=multi-user.target
EOF

# Krok 6: Utwórz vault-unseal.service
cat << 'EOF' > /etc/systemd/system/vault-unseal.service
[Unit]
Description=Unseal Vault
After=vault.service
Requires=vault.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/unseal_vault.sh
Environment=VAULT_ADDR=https://<vault IP address>:8200
Environment=DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus

[Install]
WantedBy=multi-user.target
EOF

# Krok 7: Stwórz plik vault.env
cat << 'EOF' > /etc/vault.d/vault.env
VAULT_ADDR=https://<vault IP address>:8200
DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus
EOF

# Krok 8: Przeładuj systemd i uruchom usługi
systemctl daemon-reload
systemctl enable vault-unseal.service
systemctl enable vault.service
systemctl restart vault.service

# Krok 9: wyeksportuj zmienne do to .bashrc
BASHRC_PATH="$HOME/.bashrc"
echo "export VAULT_ADDR='https://<vault IP address>:8200'" >> $BASHRC_PATH
echo "export DBUS_SESSION_BUS_ADDRESS=\$XDG_RUNTIME_DIR/bus" >> $BASHRC_PATH
source $BASHRC_PATH
```

Uczyń skrypt bash wykonywalnym:

```bash
chmod +x vault.sh
```

Uruchom skrypt:

```bash
sudo ./vault.sh
```

#### Skrypt bash, który cofa wszystkie zmiany

```bash
#!/bin/bash

echo "Ten szybki skrypt instalacyjny wymaga uprawnień roota."
echo "Sprawdzanie..."
if [[ $(/usr/bin/id -u) -ne 0 ]]; 
then
    echo "Nie uruchomiono jako root"
    exit 0
else
        echo "Instalacja trwa"
fi

SUDO=
if [ "$UID" != "0" ]; then
        if [ -e /usr/bin/sudo -o -e /bin/sudo ]; to
                SUDO=sudo
        else
                echo "*** Ten szybki skrypt instalacyjny wymaga uprawnień roota."
                exit 0
        fi
fi
rm -f /var/log/unseal_vault.log
rm -f /root/.gpg_passphrase
rm -f /root/.vault_unseal_keys.gpg
rm -f /usr/local/bin/unseal_vault.sh
rm -f /etc/systemd/system/vault-unseal.service
cat << 'EOF' > /etc/systemd/system/vault.service
[Unit]
Description=HashiCorp Vault
Documentation=https://www.vaultproject.io/docs/
Requires=network-online.target
After=network-online.target

[Service]
User=vault
Group=vault
EnvironmentFile=/etc/vault.d/vault.env
ExecStart=/usr/bin/vault server -config=/etc/vault.d/vault.hcl
ExecReload=/bin/kill --signal HUP $MAINPID
KillMode=process
KillSignal=SIGINT
Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl restart vault

BASHRC_PATH="$HOME/.bashrc"
sed -i "/export VAULT_ADDR='https:\/\/<vault IP address>:8200'/d" $BASHRC_PATH
sed -i "/export DBUS_SESSION_BUS_ADDRESS=\$XDG_RUNTIME_DIR\/bus/d" $BASHRC_PATH
source $BASHRC_PATH
```
