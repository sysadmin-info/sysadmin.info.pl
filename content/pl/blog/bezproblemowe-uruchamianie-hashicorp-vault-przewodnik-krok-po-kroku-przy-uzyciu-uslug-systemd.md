---
title: Bezproblemowe uruchamianie HashiCorp Vault - przewodnik krok po kroku przy użyciu usług systemd
date: 2024-06-15T10:00:00+00:00
description: Bezproblemowe uruchamianie HashiCorp Vault - przewodnik krok po kroku przy użyciu usług systemd
draft: true
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
image: images/2024-thumbs/gitlab05.webp
---

#### Wprowadzenie

Vault firmy HashiCorp wymaga odpieczętowania po każdym ponownym uruchomieniu, aby zapewnić bezpieczeństwo przechowywanych sekretów. Ten samouczek poprowadzi Cię przez automatyzację procesu odpieczętowania przy użyciu usługi systemd na systemie Linux.

#### Wymagania wstępne

- Vault zainstalowany i skonfigurowany na Twoim systemie
- Dostęp do kluczy odpieczętowania
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

#### Krok 1: Szyfrowanie kluczy odpieczętowania

Dla najwyższego bezpieczeństwa uruchom polecenie w nowej sesji powłoki, gdzie historia jest wyłączona, i upewnij się, że żadne poufne informacje nie są przechowywane.

1. Uruchom nową sesję powłoki.

   ```bash
   bash
   ```

2. Wyłącz historię.

   ```bash
   set +o history
   ```

3. Utwórz zaszyfrowany plik do przechowywania kluczy odpieczętowania przy użyciu `gpg`.

   ```bash
   echo -e "twój-klucz-odpieczętowania-1\ntwój-klucz-odpieczętowania-2\ntwój-klucz-odpieczętowania-3" | gpg --symmetric --cipher-algo AES256 -o /root/.vault_unseal_keys.gpg
   ```

4. Zostaniesz poproszony o podanie hasła. Zapamiętaj to hasło, ponieważ będziesz go potrzebować do odszyfrowania pliku.

5. Zakończ sesję powłoki.

   ```bash
   exit
   ```

#### Krok 2: Przechowywanie hasła GPG

1. Utwórz plik do przechowywania hasła GPG. Ten plik będzie dostępny tylko dla użytkownika root.

   ```bash
   vim /root/.gpg_passphrase
   # wpisz "twoje-hasło"
   # zapisz i wyjdź
   ```

2. Ustaw uprawnienia, aby plik był czytelny tylko dla użytkownika root.
   ```bash
   chmod 400 /root/.gpg_passphrase
   ```

#### Krok 3: Utworzenie skryptu odpieczętowania

Utwórz skrypt do odpieczętowania Vault, który bezpiecznie pobiera klucze odpieczętowania. Zapisz poniższy skrypt w `/usr/local/bin/unseal_vault.sh`.

```bash
#!/bin/bash

# Załaduj hasło GPG
GPG_PASSPHRASE=$(cat /root/.gpg_passphrase)

# Odszyfruj klucze odpieczętowania
UNSEAL_KEYS=$(gpg --quiet --batch --yes --decrypt --passphrase "$GPG_PASSPHRASE" /root/.vault_unseal_keys.gpg)

# Przekształć odszyfrowane klucze w tablicę
UNSEAL_KEYS_ARRAY=($(echo "$UNSEAL_KEYS"))

# Odpieczętuj Vault
vault operator unseal ${UNSEAL_KEYS_ARRAY[0]}
vault operator unseal ${UNSEAL_KEYS_ARRAY[1]}
vault operator unseal ${UNSEAL_KEYS_ARRAY[2]}
```

Nadaj skryptowi uprawnienia do wykonywania:

```bash
chmod +x /usr/local/bin/unseal_vault.sh
```

#### Krok 4: Utworzenie usługi systemd

Następnie utwórz usługę systemd, która uruchomi skrypt odpieczętowania po uruchomieniu usługi Vault. Utwórz nowy plik usługi w `/etc/systemd/system/vault-unseal.service` z następującą zawartością:

```ini
[Unit]
Description=Odpieczętowanie Vault
After=vault.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/unseal_vault.sh

[Install]
WantedBy=multi-user.target
```

#### Krok 5: Włącz usługę odpieczętowania

Włącz usługę odpieczętowania, aby upewnić się, że uruchomi się po starcie Vault:

```bash
systemctl enable vault-unseal.service
```

Przeładuj systemd, aby zastosować zmiany:

```bash
systemctl daemon-reload
```

#### Krok 6: Zweryfikuj konfigurację

Na koniec, uruchom ponownie usługę Vault i zweryfikuj, czy skrypt odpieczętowania uruchomił się pomyślnie.

```bash
systemctl restart vault.service
```

Sprawdź status usługi odpieczętowania:

```bash
systemctl status vault-unseal.service
```

Upewnij się, że Vault jest odpieczętowany, sprawdzając jego status:

```bash
vault status
```

#### Co dzieje się podczas procesu startu

Kiedy system się uruchamia, następuje kolejność:

1. **`vault.service` się uruchamia**: Jest to główna usługa dla Vault. Uruchomi się zgodnie z jej konfiguracją.
2. **`vault-unseal.service` się uruchamia**: Ta usługa jest skonfigurowana, aby uruchomić się po `vault.service` z powodu dyrektywy `After=vault.service`. Oznacza to, że `vault-unseal.service` nie uruchomi się, dopóki `vault.service` nie zostanie w pełni uruchomiona.

Usługa `vault-unseal.service` zależy od `vault.service` i uruchomi skrypt odpieczętowania dopiero po uruchomieniu usługi Vault.

### Zachowanie przy ręcznym ponownym uruchomieniu

#### Ręczne ponowne uruchomienie `vault.service`

Kiedy ręcznie ponownie uruchomisz `vault.service` za pomocą polecenia:

```bash
systemctl restart vault.service
```

Oto, co się dzieje:

1. **`vault.service` się zatrzymuje**: Usługa Vault zatrzymuje się, a następnie uruchamia ponownie.
2. **`vault-unseal.service` nie uruchamia się automatycznie ponownie**: Domyślnie `vault-unseal.service` nie uruchamia się automatycznie ponownie tylko dlatego, że `vault.service` została ponownie uruchomiona. Usługa `vault-unseal.service` jest ustawiona do uruchomienia po `vault.service` podczas procesu startu, ale nie wiąże się automatycznie z ponownymi uruchomieniami `vault.service`.

### Zapewnienie odpieczętowania po ponownym uruchomieniu

Aby upewnić się, że `vault-unseal.service` uruchamia się za każdym razem, gdy `vault.service` jest ponownie uruchamiana, musisz dodać zależność w pliku `vault.service`.

#### Modyfikacja `vault.service`

Edytuj plik `vault.service` (zazwyczaj znajduje się w `/etc/systemd/system/` lub `/lib

/systemd/system/`), aby uwzględnić `vault-unseal.service` jako zależność:

```ini
[Unit]
Description="HashiCorp Vault - Narzędzie do zarządzania sekretami"
Documentation=https://www.vaultproject.io/docs/
Requires=network-online.target
After=network-online.target
# Dodaj poniższą linię, aby upewnić się, że vault-unseal.service uruchamia się po vault.service
PartOf=vault-unseal.service

[Service]
User=vault
Group=vault
ExecStart=/usr/local/bin/vault server -config=/etc/vault.d/vault.hcl
ExecReload=/bin/kill -HUP $MAINPID
LimitNOFILE=65536
# Inne opcje...

[Install]
WantedBy=multi-user.target
```

I zmodyfikuj plik `vault-unseal.service`, aby uwzględnić:

```ini
[Unit]
Description=Odpieczętowanie Vault
After=vault.service
Requires=vault.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/unseal_vault.sh

[Install]
WantedBy=multi-user.target
```

Po tych modyfikacjach `vault-unseal.service` będzie uznawana za część procesu `vault.service`. Ponowne uruchomienie `vault.service` teraz również uruchomi `vault-unseal.service`.

### Testowanie konfiguracji

Po dokonaniu tych zmian, przeładuj konfigurację systemd i ponownie uruchom usługę Vault:

```bash
systemctl daemon-reload
systemctl restart vault.service
```

Następnie sprawdź status obu usług, aby upewnić się, że działają zgodnie z oczekiwaniami:

```bash
systemctl status vault.service
systemctl status vault-unseal.service
```

### Podsumowanie

Ta konfiguracja zapewnia bezpieczną metodę odpieczętowania Vault poprzez zaszyfrowanie kluczy odpieczętowania za pomocą GPG i bezpieczne przechowywanie hasła. Skrypt pobiera hasło i odszyfrowuje klucze w czasie rzeczywistym, zwiększając bezpieczeństwo konfiguracji.

Postępując zgodnie z tym przewodnikiem, zapewnisz, że poufne klucze odpieczętowania nie są wystawione w formie zwykłego tekstu, a dostęp do hasła jest ograniczony do użytkownika root, co zapewnia dodatkową warstwę bezpieczeństwa.

Usługa `vault-unseal.service` będzie działać zarówno podczas procesu startu, jak i przy ręcznych ponownych uruchomieniach `vault.service`, utrzymując Vault automatycznie odpieczętowanym i operacyjnym.

#### Film instruktażowy

{{<youtube >}}