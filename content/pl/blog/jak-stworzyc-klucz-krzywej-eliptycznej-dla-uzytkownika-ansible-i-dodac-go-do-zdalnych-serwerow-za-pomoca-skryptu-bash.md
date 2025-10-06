---
title: Jak stworzyć klucz krzywej eliptycznej dla użytkownika ansible i dodać go do
  zdalnych serwerów za pomocą skryptu Bash
date: 2023-11-11T19:00:00+00:00
description: Jak stworzyć klucz krzywej eliptycznej dla użytkownika ansible i dodać
  go do zdalnych serwerów za pomocą skryptu Bash
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Ansible
categories:
- Ansible
cover:
    image: images/2023-thumbs/ansible03.webp
---

1. **Oto samouczek wideo**

{{<youtube wS2MJ_ooI1k>}}

Skrypty i pliki konfiguracyjne są dostępne [tutaj:](https://github.com/sysadmin-info/ansible)

1. Zainstaluj sshpass

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install sshpass 
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```bash
  sudo apt install sshpass 
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```bash
  sudo dnf install sshpass 
  ```
  {{< /tab >}}
{{< /tabs >}}


2. Utwórz plik 

```bash
vim pass_file_ansible
```

i umieść w nim hasło dla użytkownika ansible, aby mógł łączyć się z zdalnymi hostami.

3. Ustaw plik skryptu jako tylko do odczytu dla tego użytkownika

```bash
chmod 400 pass_file_ansible
``` 

4. Utwórz listę serwerów z adresami IP lub nazwami hostów

```bash
vim servers
```

5. Utwórz skrypt

```bash
vim  ssh-copy-id.sh
```

I dodaj poniższą zawartość

```vim
#!/bin/bash
ssh-keygen -t ed25519 -C "ansible@rancher.local"
servers=$(cat servers)
for i in $servers; do
  sshpass -f pass_file_ansible ssh-copy-id -i ~/.ssh/id_ed25519.pub ansible@$i
done
```

6. Upewnij się, że PasswordAuthentication ma ustawioną wartość logiczną na tak w pliku /etc/ssh/sshd_config na zdalnych serwerach.

7. Ustaw skrypt jako wykonywalny

```bash
chmod +x ssh-copy-id.sh 
```

8. Wykonaj skrypt

```bash
./ssh-copy-id.sh 
```