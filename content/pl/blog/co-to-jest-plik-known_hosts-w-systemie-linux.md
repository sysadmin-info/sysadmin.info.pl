---
title: "Co to jest plik known_hosts w systemie Linux"
date:  2023-11-14T15:00:00+00:00
description: "Co to jest plik known_hosts w systemie Linux"
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
- known_hosts 
- ssh
series:
- Ansible
categories:
- Ansible 
image: images/2023/mitm.webp
---

#### Wszystkie ważne informacje, które musisz znać o pliku known_hosts w systemie Linux

##### Plik known_hosts to kluczowy element protokołu SSH, który znajdziesz w katalogu .ssh. Dowiedz się o nim więcej.

Plik known_hosts można znaleźć w folderze .ssh Twojego katalogu domowego, obok innych plików.

```bash
adrian@rancher:~$ ls -l .ssh
total 20
-rw------- 1 adrian adrian 136 Nov 10 09:37 authorized_keys
-rw------- 1 adrian adrian 411 Nov 11 11:00 id_ed25519
-rw-r--r-- 1 adrian adrian 103 Nov 11 11:00 id_ed25519.pub
-rw------- 1 adrian adrian 426 Nov 12 17:25 known_hosts
-rw------- 1 adrian adrian 426 Nov 12 17:04 known_hosts.ansible
```
W tym przypadku Twoim prywatnym kluczem SSH jest id_ed25519. Publiczny klucz SSH to pub. W SSH profile są tworzone w pliku config, aby ułatwić łatwe połączenia z różnymi serwerami. Stworzyłem go specjalnie; to nie jest powszechny plik.

Ten artykuł skupia się na known_hosts, ostatnim pliku. Plik ~/.ssh/known_hosts to kluczowy element plików konfiguracyjnych SSH dla klientów.

Pozwól, że wyjaśnię to bardziej.

Co oznacza plik known hosts w SSH?
Plik known_hosts przechowuje publiczne klucze hostów, z którymi użytkownik się połączył. Jest to kluczowy plik, który zapisuje identyfikację użytkownika na Twoim lokalnym komputerze, zapewniając, że łączą się z prawdziwym serwerem. Ponadto pomaga w zapobieganiu atakom [man-in-the-middle](https://www.ssh.com/academy/attack/man-in-the-middle).

Za każdym razem, gdy nawiązujesz połączenie SSH z nowym zdalnym serwerem, zadawane jest pytanie, czy chcesz dodać zdalne hosty do pliku known_hosts.

```bash
adrian@rancher:~$ ssh adrian@cm4
The authenticity of host 'cm4 (10.10.0.112)' can't be established.
ED25519 key fingerprint is SHA256:8+3YxL8KFACqRmpuDB3ZFFqQErjenI+mjLWp0oJFVF4.
This host key is known by the following other names/addresses:
    ~/.ssh/known_hosts:3: [hashed name]
Are you sure you want to continue connecting (yes/no/[fingerprint])? 
```
W istocie, pytanie brzmi, czy chcesz dodać szczegóły zdalnego systemu do własnego.

Jeśli wybierzesz "tak", Twój system zapisze tożsamość serwera.

##### Unikaj ataków man-in-the-middle

![Atak man-in-the-middle](/images/2023/mitm.webp "Atak man-in-the-middle")
<figcaption>Atak man-in-the-middle</figcaption>

Załóżmy, że dodałeś serwer do pliku known_hosts i regularnie się z nim łączysz.

Twój system wykryje wszelkie zmiany publicznego klucza zdalnego serwera, jeśli wystąpią, ze względu na dane przechowywane w pliku known_hosts. Natychmiast otrzymasz powiadomienie o tej zmianie:

```vim
@@@@

@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@ WARNING: POSSIBLE DNS SPOOFING DETECTED!
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
The RSA host key for xyz remote host has changed,and the key for the corresponding IP address xxx.yy.xxx.yy is unknown. This could either mean that DNS SPOOFING is happening or the IP address for the host and its host key have changed at the same time.
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@ WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that the RSA host key has just been changed.
The fingerprint for the RSA key sent by the remote host is
85:5e:aa:80:7b:64:e3:78:07:6f:b4:00:41:07:d8:9c.
Please contact your system administrator.
Add correct host key in /home/.ssh/known_hosts to get rid of this message.
Offending key in /home/.ssh/known_hosts:1
Keyboard-interactive authentication is disabled to avoid man-in-the-middle attacks.
```

Zanim zaakceptujesz ten nowy klucz w takiej sytuacji, możesz skontaktować się z administratorem zdalnego serwera. W ten sposób możesz upewnić się, że host lub zdalny serwer nie został skompromitowany.

**Klucz hosta lub serwera może być czasami celowo zmieniany przez administratora lub w wyniku ponownej instalacji serwera.**

Bez względu na powód tej zmiany, aby ponownie połączyć się ze zdalnym serwerem, musisz najpierw usunąć poprzedni klucz z pliku known_hosts. Gdy ponownie połączysz się z tym serwerem, host klienta wygeneruje dla niego nowy klucz hosta.

##### Obsługa wielu autoryzowanych użytkowników

Jak wcześniej wskazano, publiczny klucz zdalnego serwera jest dołączany do pliku known_hosts hosta klienta po pomyślnym połączeniu.

Istnieją sytuacje, kiedy chcesz uwierzytelnić serwer dla wielu użytkowników jednocześnie, bez konieczności proszenia ich o weryfikację klucza serwera. Na przykład, jeśli używasz Ansible lub innego narzędzia do zarządzania konfiguracją, nie chcesz, aby host klienta prosił o weryfikację klucza serwera.

Dlatego istnieją trzy sposoby, aby obejść interaktywne monity SSH, jeśli masz wielu użytkowników:

* Ręczne dodanie publicznego klucza serwera do pliku known_hosts każdego użytkownika.
* Użycie opcji wiersza poleceń -o StrictHostKeyChecking=no przy każdym połączeniu z serwerem przez SSH (niezalecane)
* Utworzenie głównego lub podstawowego pliku ssh_known_hosts, zarejestrowanie tam wszystkich hostów, a następnie dystrybucja tego pliku do wszystkich hostów klienta. Dodatkowo można użyć polecenia ssh-keyscan, aby to zrealizować:

```bash
ssh-keyscan -H -t rsa ‘your-server-ip’ >> /etc/ssh/ssh_known_hosts
```

Opcja StrictHostKeyChecking=no może być użyta, jak pokazano na poniższym zrzucie ekranu:

```bash
adrian@rancher:~$ ssh -o StrictHostKeyChecking=no ansible@worker1
Warning: Permanently added 'worker1' (ED25519) to the list of known hosts.
```

```bash
ansible@worker1:~ $ ip a | grep "10.10"
    inet 10.10.0.102/24 brd 10.10.0.255 scope global dynamic eth0
ansible@worker1:~ $
```

W porównaniu z dwoma innymi metodami, pierwsza metoda zarządzania wieloma użytkownikami do uwierzytelniania serwera jest najbardziej pracochłonna.

##### Dostęp do pliku known_hosts w celu uzyskania informacji o zdalnym systemie

To zadanie jest wszystkim, tylko nie prostym i łatwym.

Prawie wszystkie systemy Linux mają ustawiony parametr HashKnownHosts pliku konfiguracyjnego SSH na wartość Yes. Jest to środek bezpieczeństwa.

Oznacza to, że informacje z pliku known_hosts są hashowane. Chociaż widzisz losowe liczby, nie jesteś w stanie ich zinterpretować.

```bash
adrian@rancher:~$ cat .ssh/known_hosts
|1|aeOh8SLgXmKN9/ZCsl3KBYuB31M=|gp/rwwFrYd5WXG6RRkUWujiudsM= ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINNdwc/XaGb6OrlXjZ6NCi+pmznIZ+aeono5RtrxCG9N
|1|4xuYAcjVu2xzYHuvb+tkSrZE30o=|hIE+LeM+x5y1OheDsjeB4mxs1z

0= ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDFKffDl+SPuseU86dGaaLIeouPYwvOK8lvIFRgvdCVP
|1|xDn5MTbbfuR6nuBDhaPDCl5oFrQ=|J74k0UveVV4F63dXmc1E8bWEw+w= ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPffThOhGC+wkyXbtBNyuX1/vv8G6wZbDsitm/lsCfYO
|1|B5vDUlcWiKxsJ5B/S5Sq0mQnCY8=|cf2pLpzn0D/yoYoyqoYO9+W0AI8= ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINNdwc/XaGb6OrlXjZ6NCi+pmznIZ+aeono5RtrxCG9N
```

Jeśli znasz nazwę hosta lub adres IP systemu, możesz uzyskać odpowiednie wpisy z pliku known_hosts.

```bash
ssh-keygen -l -F <server-IP-or-hostname>
```

Jednak nie jest możliwe, aby jedno polecenie mogło dostarczyć czytelną listę wszystkich serwerów i ich szczegółów.

Plik known_hosts można rozszyfrować przy użyciu specjalnie zaprojektowanych narzędzi i skryptów, ale to wykracza poza zakres zwykłego użytkownika, takiego jak Ty i ja.

##### Usuwanie części z pliku known_hosts

Jeśli znasz nazwę hosta lub adres IP zdalnego systemu, możesz usunąć konkretny wpis z pliku known_hosts.

```bash
ssh-keygen -R server-hostname-or-IP
```

Jest to znacznie bardziej efektywne niż ręczne usuwanie wpisów związanych z serwerem za pomocą polecenia rm, po ich znalezieniu.

##### Podsumowanie
Zrozumienie różnych plików konfiguracyjnych SSH daje ci większą wiedzę o bezpieczeństwie systemu. Jednym z kluczowych elementów tych plików jest "known_hosts."