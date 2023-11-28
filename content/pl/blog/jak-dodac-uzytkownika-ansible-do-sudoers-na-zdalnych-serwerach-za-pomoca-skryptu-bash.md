---
title: "Jak dodać użytkownika ansible do sudoers na zdalnych serwerach za pomocą skryptu Bash"
date:  2023-11-11T18:00:00+00:00
description: "Jak dodać użytkownika ansible do sudoers na zdalnych serwerach za pomocą skryptu Bash"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- Ansible
- Bash
- sshpass 
series:
- Ansible
categories:
- Ansible 
image: images/2023-thumbs/ansible02.webp
---

1. **Oto samouczek wideo**

{{<youtube ApKyy86wLvw>}}

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

2. Zainstaluj sudo na zdalnych hostach

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install sudo
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```bash
  sudo apt install sudo 
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```bash
  sudo dnf install sudo
  ```
  {{< /tab >}}
{{< /tabs >}}

3. Wpisz poniższe polecenie:

```bash
visudo
```

4. Zmień %sudo lub %wheel na %admins

5. Dodaj poniższą linię:

```vim
%admins  ALL=(ALL) NOPASSWD: ALL
```

Zapisz i wyjdź

6. Dodaj grupę admins

```bash
groupadd admins
```

7. Utwórz plik na głównym serwerze, gdzie w przyszłości zainstalujesz ansible

```bash
vim pass_file
```

i umieść w nim hasło dla użytkownika, który obecnie może łączyć się z zdalnymi hostami.

8. Ustaw plik skryptu jako tylko do odczytu dla tego użytkownika

```bash
chmod 400 pass_file
``` 

9. Utwórz listę serwerów z adresami IP lub nazwami hostów

```bash
vim servers
```

10. Utwórz skrypt

```bash
vim  ansible-sudo.sh
```

I dodaj poniższą zawartość

```vim
#!/bin/bash
servers=$(cat servers)
echo -n "Wpisz nazwę użytkownika: "
read userName
clear
for i in $servers; do
  sshpass -f pass_file ssh -q -t $USER@$i "hostname; sudo usermod -aG admins $userName"
done
echo
read -n1 -s -p "Sprawdzić? (t)ak lub (n)ie " ans
echo
if [ $ans == 't' ] ;then
  for i in $servers; do
    sshpass -f pass_file ssh -q -t $USER@$i "hostname; id $userName"
  done
fi
```

11. Upewnij się, że PasswordAuthentication ma ustawioną wartość logiczną na tak w pliku /etc/ssh/sshd_config na zdalnych serwerach

12. Ustaw skrypt jako wykonywalny

```bash
chmod +x ansible-sudo.sh
```

13. Wykonaj skrypt

```bash
./ansible-sudo.sh
```

14. Podaj nazwę użytkownika: ansible

15. Sprawdź wynik. Użytkownik ansible powinien zostać dodany do grupy admins.