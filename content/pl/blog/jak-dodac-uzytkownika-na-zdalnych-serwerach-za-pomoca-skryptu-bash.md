---
title: Jak dodać użytkownika na zdalnych serwerach za pomocą skryptu Bash
date: 2023-11-11T17:00:00+00:00
description: Jak dodać użytkownika na zdalnych serwerach za pomocą skryptu Bash
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
    image: images/2023-thumbs/ansible01.webp
---

1. **Oto samouczek wideo**

{{<youtube BeBn8_LLPuY>}}

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
vim pass_file
```

i umieść w nim hasło dla użytkownika, który obecnie może łączyć się z zdalnymi hostami.

3. Ustaw plik skryptu jako tylko do odczytu dla tego użytkownika

```bash
chmod 400 pass_file
``` 

4. Utwórz listę serwerów z adresami IP lub nazwami hostów

```bash
vim servers
```

5. Utwórz skrypt

```bash
vim  adduser.sh
```

I dodaj poniższą zawartość

```vim
#!/bin/bash
servers=$(cat servers)
echo -n "Wpisz nazwę użytkownika: "
read userName
echo -n "Wpisz UID użytkownika: "
read userUID
echo -n "Wpisz hasło: "
read -s passwd
clear
for i in $servers; do
  sshpass -f pass_file ssh -q -t $USER@$i "hostname; sudo useradd -m -u $userUID $userName -d /home/$userName -s /bin/bash && echo '$userName:$passwd' | sudo chpasswd"
  if [ $? -eq 0 ]; then
    echo "Użytkownik '$userName' dodany na '$i'" || echo "Użytkownik '$userName' już istnieje na '$i'"
  else
    echo "Błąd na $i"
  fi
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

6. Upewnij się, że PasswordAuthentication ma ustawioną wartość logiczną na tak w pliku /etc/ssh/sshd_config na zdalnych serwerach

7. Ustaw skrypt jako wykonywalny

```bash
chmod +x adduser.sh
```

8. Wykonaj skrypt

```bash
./adduser.sh
```

9. Podaj nazwę użytkownika: ansible, UID i hasło.