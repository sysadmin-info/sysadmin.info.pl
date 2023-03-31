---
title: "rclone – instalacja i konfiguracja"
date: 2019-09-27T20:05:35+00:00 
description: "rclone – instalacja i konfiguracja"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
tags:
- rclone
series:
-
categories:
- mikr.us
image: images/2019-thumbs/rclone.webp
---
Cześć,  
Do wykonania kopii zapasowej użyję narzędzia rclone ze strony <a rel="noreferrer noopener" aria-label="https://rclone.org (otwiera się na nowej zakładce)" href="https://rclone.org" target="_blank">https://rclone.org</a> W tym konkretnym przypadku użyję <a rel="noreferrer noopener" aria-label="https://mega.nz (otwiera się na nowej zakładce)" href="https://mega.nz" target="_blank">https://mega.nz</a> oraz odpowiedniej konfiguracji, aby móc skopiować pliki z serwera do mega.nz. Jeśli nie masz tam konta, możesz je założyć. Na dzień dobry każdy dostaje 50 GB przestrzeni za darmo. 

Proszę zwrócić uwagę na to, że na chwilę bieżącą jest problem z 2FA dla mega. Próba kompilacji aplikacji z kodu źródłowego za pomocą instrukcji z tej strony <a rel="noreferrer noopener" aria-label=" (otwiera się na nowej zakładce)" target="_blank" href="https://github.com/meganz/MEGAsync">https://github.com/meganz/MEGAsync</a> kończy się błędem. Jest to związane z błędem kompilatora, który w tym przypadku ma zbyt mało pamięci 128 MB RAM, 170 MB swap i zbyt mało zasobów procesora, aby zakończyć prawidłowo proces kompilacji. Process cc1plus jest zabijany (kill) i kompilacja Crypto++ kończy się porażką.

Potrzebny nam curl

{{< tabs CentOS Ubuntu >}}
  {{< tab >}}
  ### CentOS
  ```
  sudo yum install curl
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian/Ubuntu
  ```
  sudo apt-get install curl
  ```
  lub
  ```
  sudo apt install curl
  ```
  {{< /tab >}}
{{< /tabs >}}

W następnej kolejności należy wykonać poniższą komendę:

```
sudo -v ; curl https://rclone.org/install.sh | sudo bash
```

Logujemy się z podwyższonymi uprawnieniami jako użytkownik sudoers.

```
sudo -i
```

Uruchamiamy konfigurację rclone poleceniem:

```
rclone config
```

  * Tworzymy plik konfiguracyjny z połączeniem do naszego konta mega.nz
  * Wybieramy n jako nowe połączenie (ang. new remote)
  * Wpisujemy przyjazną nazwę (ang. name) np. mega albo remote.
  * Wybieramy pozycję nr 18, czyli wpisujemy cyfry 18.
  * Podajemy login i dwukrotnie hasło do naszego konta w mega.nz
  * Następnie wybieramy n, gdyż nie chcemy zaawansowanej konfiguracji, o której może napiszę innym razem.
  * Potwierdzamy literą y naszą konfigurację.
  * A na samym końcu wybieramy q, aby wyjść z konfiguracji.

Sprawdzimy teraz, czy konfiguracja działa.

```
rclone lsd mega:
```

Jeśli wszystko przebiegło poprawnie, zostaniemy zalogowani do naszego konta. Na mega możemy utworzyć ręcznie folder o nazwie backup. Wtedy możemy ręcznie kopiować pliki do tego folderu za pomocą niższego polecenia:

```
rclone copy /home/user mega:backup
```

Jednak po co się męczyć? Można napisać sobie skrypt.

```
cd /home/user
vi backup.sh
```

Wciskamy insert na klawiaturze (ins) i wklejamy poniższą zawartość:

```
#!/bin/bash
 TIME=date +%b-%d-%y
 FILENAME=backup-bin-$TIME.tar.gz
 SRCDIR=/bin
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-bin-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-bin-$TIME.tar.gz
 FILENAME=backup-boot-$TIME.tar.gz
 SRCDIR=/boot
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-boot-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-boot-$TIME.tar.gz
 FILENAME=backup-dev-$TIME.tar.gz
 SRCDIR=/dev
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-dev-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-dev-$TIME.tar.gz
 FILENAME=backup-etc-$TIME.tar.gz
 SRCDIR=/etc
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-etc-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-etc-$TIME.tar.gz
 FILENAME=backup-home-$TIME.tar.gz
 SRCDIR=/home
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-home-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-home-$TIME.tar.gz
 FILENAME=backup-lib-$TIME.tar.gz
 SRCDIR=/lib
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-lib-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-lib-$TIME.tar.gz
 FILENAME=backup-lib64-$TIME.tar.gz
 SRCDIR=/lib64
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-lib64-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-lib64-$TIME.tar.gz!/bin/bash
 FILENAME=backup-lost+found-$TIME.tar.gz
 SRCDIR=/lost+found
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-lost+found-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-lost+found-$TIME.tar.gz
 FILENAME=backup-media-$TIME.tar.gz
 SRCDIR=/media
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-media-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-media-$TIME.tar.gz
 FILENAME=backup-mnt-$TIME.tar.gz
 SRCDIR=/mnt
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-mnt-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-mnt-$TIME.tar.gz
 FILENAME=backup-opt-$TIME.tar.gz
 SRCDIR=/opt
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-opt-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-opt-$TIME.tar.gz
 FILENAME=backup-reboot-$TIME.tar.gz
 SRCDIR=/reboot
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-reboot-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-reboot-$TIME.tar.gz
 FILENAME=backup-root-$TIME.tar.gz
 SRCDIR=/root
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-root-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-root-$TIME.tar.gz
 FILENAME=backup-run-$TIME.tar.gz
 SRCDIR=/run
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-run-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-run-$TIME.tar.gz
 FILENAME=backup-sbin-$TIME.tar.gz
 SRCDIR=/sbin
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-sbin-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-sbin-$TIME.tar.gz
 FILENAME=backup-srv-$TIME.tar.gz
 SRCDIR=/srv
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-srv-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-srv-$TIME.tar.gz
 FILENAME=backup-tmp-$TIME.tar.gz
 SRCDIR=/tmp
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-tmp-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-tmp-$TIME.tar.gz
 FILENAME=backup-usr-$TIME.tar.gz
 SRCDIR=/usr
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-usr-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-usr-$TIME.tar.gz
 FILENAME=backup-var-$TIME.tar.gz
 SRCDIR=/var
 DESDIR=/home/user/backup
 tar -cvpzf $DESDIR/$FILENAME $SRCDIR
 rclone copy /home/user/backup/backup-var-$TIME.tar.gz mega:backup
 rm -Rf /home/user/backup/backup-var-$TIME.tar.gz</pre>
```

Wciskamy Esc, wpisujemy :x i wciskamy Enter

Aby skrypt był wykonywalny, trzeba nadać mu odpowiednie uprawnienia.

```
chmod +x backup.sh
```

Teraz możemy wykonać skrypt ręcznie:

```
./backup.sh
```

Jeśli chcemy zautomatyzować ten dość długotrwały proces dodajemy zadanie do crona, które będzie wykonywać ten skrypt za nas.

```
crontab -e
```

Wciskamy insert (ins) i wklejamy:

```
00 04 * * * /bin/bash /home/user/backup.sh
```

Wciskamy Esc, wpisujemy :x i wciskamy Enter.  

Skrypt będzie wykonywać się o 4 w nocy co 24 godziny.

Legenda:

```
#!/bin/bash
# shebang, oznaczający, że skrypt będzie wykonywany 
przez konkretny interpreter, tutaj bash.

TIME=date +%b-%d-%y 
# zmienna dopisująca aktualną datę

FILENAME=backup-bin-$TIME.tar.gz 
# nazwa pliku po spakowaniu

SRCDIR=/bin 
# katalog, który chcesz skopiować

DESDIR=/home/user/backup 
# docelowy katalog, do którego kopiowane są dane

tar -cvpzf $DESDIR/$FILENAME $SRCDIR 
# kompresowanie katalogu

rclone copy /home/user/backup/backup-bin-$TIME.tar.gz mega:backup 
# kopiowanie katalogu do mega.nz

rm -Rf /home/user/backup/backup-bin-$TIME.tar.gz 
# usunięcie skompresowanego pliku z serwera</pre>
```

Na koniec uwaga. Katalogi proc oraz sys nie pozwolą na wykonanie kopii, ponieważ posiadają pliki, które są w użyciu przez serwer, a konkretniej przez jego procesy.
