---
title: "Serwer SSH"
description: "Konfiguracja serwera SSH w celu zalogowania się do serwera ze zdalnego komputera."
date: 2023-04-01T14:50:34+02:00
hideToc: false
enableToc: true
enableTocContent: false
author: admin
authorEmoji: 🐧
pinned: false
asciinema: true
categories:
  - 
tags:
  - P-TECH
series:
  -

draft: false
image: images/2023-thumbs/ssh.webp
---
#### Ćwiczenia do wykonania:
1. Wygeneruj parę kluczy RSA za pomocą ssh-keygen
2. Wyeksportuj klucz publiczny z klienta do serwera za pomocą ssh-copy-id
3. Zaloguj się za pomocą hasła poprzez ssh do serwera i przełącz na konto root za pomocą komendy sudo - su lub sudo -i
4. Włącz logowanie kluczami i wyłącz logowanie hasłem. Zapisz zmiany i zrestartuj usługę ssh.
5. Nie zamykaj bieżącej sesji. Otwórz nową sesję ssh i zaloguj się do serwera za pomocą klucza prywatnego. 
6. Jeśli udało ci się zalogować, zabezpiecz serwer korzystając z poniższych informacji a następnie zrestartuj usługę ssh na drugiej sesji.
7. Pamiętaj, by pierwszą sesję ssh cały czas mieć otwartą, by w razie potrzeby móc cofnąć zmiany.
8. Zrestartuj usługę ssh i sprawdź, czy możesz zalogować się za pomocą trzeciej sesji do serwera. Jeśli tak, udało ci się poprawnie skonfigurować serwer ssh.
9. Dla chętnych napisz skrypt z użyciem sed lub awk, który dokona zmian po stronie serwera w pliku sshd_config, aby nie trzeba było ręcznie nanosić zmian.

<script async id="asciicast-574590" src="https://asciinema.org/a/574590.js"></script>

#### OpenSSH : KeyBoard-Intereractive Auth

OpenSSH jest już domyślnie zainstalowany, więc nie ma potrzeby instalowania nowych pakietów. Domyślnie możesz logować się za pomocą KeyBoard-Interactive Authentication, ale zmień niektóre ustawienia dla bezpieczeństwa jak poniżej.

Jeśli OpenSSH jednak nie jest jeszcze zainstalowany możesz go zainstalować za pomocą następującego polecenia:

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  Aby zainstalować OpenSSH wpisz:
  ```
  # odśwież repozytoria
  sudo zypper ref
  # zainstaluj OpenSSH
  sudo zypper -n in openssh
  # włącz OpenSSH podczas boot-owania
  sudo systemctl enable sshd
  # wystartuj openSSH
  sudo systemctl start sshd
  # włącz regułę w firewalld dla ssh
  sudo firewall-cmd --permanent --add-service=ssh
  success
  # Przeładuj reguły firewalld
  sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  Aby zainstalować OpenSSH wpisz:
  ```
  # odśwież repozytoria
  sudo apt update
  # zainstaluj OpenSSH
  sudo apt -y install openssh-server
  # włącz OpenSSH podczas boot-owania
  sudo systemctl enable sshd
  # wystartuj OpenSSH
  sudo systemctl start sshd
  # włącz regułę w ufw firewall dla ssh
  sudo ufw allow 'SSH'
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  Aby zainstalować OpenSSH wpisz:
  ```
  sudo yum install openssh-server -y
  lub
  sudo dnf install openssh-server -y
  # włącz OpenSSH podczas boot-owania
  sudo systemctl enable sshd
  # wystartuj OpenSSH
  sudo systemctl start sshd
  # włącz regułę w firewalld dla ssh
  sudo firewall-cmd --permanent --add-service=ssh
  success
  # Przeładuj reguły firewalld
  sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
{{< /tabs >}}

Następnie na maszynie z Linux, za pomocą której zamierzasz łączyć się do serwera, musisz zainstalować odpowiedniego klienta:

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  Aby zainstalować OpenSSH wpisz:
  ```
  # odśwież repozytoria
  sudo zypper ref
  # zainstaluj OpenSSH
  sudo zypper -n in openssh-clients
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  Aby zainstalować OpenSSH wpisz:
  ```
  # odśwież repozytoria
  sudo apt update
  # zainstaluj OpenSSH
  sudo apt -y install openssh-client
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  Aby zainstalować OpenSSH wpisz:
  ```
  sudo yum install openssh-clients -y
  lub
  sudo dnf install openssh-clients -y
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Instalacja firewalld

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  Aby zainstalować firewalld wpisz:
  ```
  # odśwież repozytoria
  sudo zypper ref
  # zainstaluj firewalld
  sudo zypper -n in firewalld
  # włącz firewalld podczas boot-owania
  sudo systemctl enable firewalld
  # wystartuj firewalld
  sudo systemctl start firewalld
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  Aby zainstalować firewalld wpisz:
  ```
  # odśwież repozytoria
  sudo apt update
  # zainstaluj firewalld
  sudo apt -y install firewalld
  # włącz firewalld podczas boot-owania
  sudo systemctl enable firewalld
  # wystartuj firewalld
  sudo systemctl start firewalld
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  Aby zainstalować firewalld wpisz:
  ```
  sudo yum install firewalld -y
  lub
  sudo dnf install firewalld -y
  # włącz firewalld podczas boot-owania
  sudo systemctl enable firewalld
  # wystartuj firewalld
  sudo systemctl start firewalld
  ```
  {{< /tab >}}
{{< /tabs >}}

Domyślnie firewalld po instalacji ma zaimplementowaną usługę SSH jako dozwoloną. Jeśli nie, zawsze możesz zezwolić na usługę SSH.

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```
  linux:~ # sudo firewall-cmd --add-service=ssh --permanent
  success
  linux:~ # sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```
  sudo ufw allow 'SSH'
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```
  linux:~ # sudo firewall-cmd --add-service=ssh --permanent
  success
  linux:~ # sudo firewall-cmd --reload
  success
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Konfiguracja klienta SSH 

Połącz się z serwerem SSH za pomocą zwykłego użytkownika.

```
# ssh [login_user@hostname_or_IP_address]
adrian@client:~> ssh adrian@example.com
The authenticity of host 'example.com (10.0.0.50)' can't be established.
ECDSA key fingerprint is SHA256:h0QhlXgCZ860UjM8sAjY6Wmrr2EqSIY5UADBi0wAFV4.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'example.com,10.0.0.50' (ECDSA) to the list of known hosts.
Password:          # login user's password
adrian@example.com:~>    # just logined
```

#### Uwierzytelnianie parą kluczy SSH

Skonfiguruj serwer SSH do logowania za pomocą Key-Pair Authentication. Utwórz klucz prywatny dla klienta i klucz publiczny dla serwera, aby to zrobić.

Utwórz Key-Pair dla każdego użytkownika, więc zaloguj się wspólnym użytkownikiem na SSH Server Host i pracuj jak poniżej.

```
# utwórz parę kluczy na kliencie
ssh-keygen -t rsa -b 4096 -C "imię i nazwisko"
Generating public/private rsa key pair.
Enter file in which to save the key (/home/adrian/.ssh/id_rsa): /home/adrian/.ssh/p-tech
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/adrian/.ssh/p-tech
Your public key has been saved in /home/adrian/.ssh/p-tech.pub
The key fingerprint is:
SHA256:IPtApVZ/8o6mCY3lKSvcfEtkD6wzHJ0LzKeHFm3qbxs adrian@G02PLXN05963
The key's randomart image is:
+---[RSA 4096]----+
|      o          |
|     + .         |
|    = . o .      |
|   = * o +       |
|    O % S .      |
|   . ^ = o       |
| . o& E + .      |
|  oooOo=         |
|   .o+*o         |
+----[SHA256]-----+
```

Aby wygenerować passphrase możesz użyć następującego polecenia w osobnym oknie CLI
```
hexdump -vn16 -e'4/4 "%08X" 1 "\n"' /dev/urandom
```

Wylistuj parę kluczy

```
adrian@linux:~> ll ~/.ssh/p-tech*
-rw------- 1 adrian adrian 3.4K Apr  1 16:44 /home/adrian/.ssh/p-tech
-rw-r--r-- 1 adrian adrian  745 Apr  1 16:44 /home/adrian/.ssh/p-tech.pub
```

Skopiuj klucz publiczny z klienta na serwer

```
ssh-copy-id -i ~/.ssh/p-tech.pub student@IP-ADDRRESS
```

Podaj hasło

Zaloguj się z kluczem do serwera

```
ssh -i ~/.ssh/p-tech student@IP-ADDRRESS
```

Podaj passphrase

#### Automatyzacja

Dodaj poniższe wpisy do pliku .bashrc lub .zshrc znajdującego się w katalogu /home/user. Pierwszy wpis uruchamia agenta ssh, a drugi ładuje do niego Twój klucz prywatny. Jeśli ustawiłeś passphrase na swoim kluczu, agent zapyta o jego wpisanie. Możesz dodać więcej niż jeden klucz. Należy pamiętać, że za każdym razem, gdy Bash lub Zsh uruchomi proces restartu lub rozruchu systemu operacyjnego, w CLI poprosi o podanie passphrase.

```
eval $(ssh-agent -s)
ssh-add ~/.ssh/p-tech
```

#### Zabezpieczanie SSH

Edytuj /etc/ssh/sshd_config

```
sudo vi /etc/ssh/sshd_config

# odkomentuj te linie i zmień na [no]
PasswordAuthentication no
ChallengeResponseAuthentication no

# Wyłącz puste hasła
# Musisz zapobiec zdalnym logowaniom z kont z pustymi hasłami dla zwiększenia bezpieczeństwa.

PermitEmptyPasswords no

# Ograniczenie dostępu użytkowników do SSH
# Aby zapewnić kolejną warstwę bezpieczeństwa, powinieneś ograniczyć logowanie do SSH
# tylko do niektórych użytkowników, którzy potrzebują zdalnego dostępu.
# W ten sposób zminimalizujesz wpływ posiadania użytkownika ze słabym hasłem.
# Dodaj linię "AllowUsers", a następnie listę nazw użytkowników i oddziel je spacją:

AllowUsers student adrian

# Wyłączanie logowania roota
# Jedną z najbardziej niebezpiecznych dziur w zabezpieczeniach, 
# jakie możesz mieć w swoim systemie jest umożliwienie bezpośredniego logowania się 
# do roota przez SSH. W ten sposób hakerzy próbujący złamać hasło roota mogą
# hipotetycznie uzyskać dostęp do systemu; a jeśli się nad tym zastanowić,
# root może wyrządzić dużo więcej szkód na maszynie niż zwykły użytkownik.
# Aby wyłączyć logowanie przez SSH jako root, zmień linię na taką:

PermitRootLogin no

# Ostatecznie możesz pozwolić rootowi na logowanie się przez SSH przy użyciu pary kluczy.
# Zrób to tylko jeśli serwer nie jest w DMZ (nie ma dostępu z Internetu)

PermitRootLogin prohibit-password

# Dodaj Protocol 2
# SSH posiada dwa protokoły, których może używać. Protokół 1 jest starszy i mniej bezpieczny.
# Protokół 2 jest tym, czego powinieneś używać, aby wzmocnić swoje bezpieczeństwo.
# Jeśli chcesz, aby Twój serwer był zgodny z PCI, musisz wyłączyć protokół 1.

Protocol 2

# Protocol
#  Określa wersje protokołu, które obsługuje sshd(8).  Możliwe.
#  wartości to '1' i '2'.  Wiele wersji musi być oddzielonych przecinkami.
#  Domyślnie jest to '2'.  Protokół 1 cierpi na szereg
#  słabości kryptograficznych i nie powinien być używany.
#  Jest oferowany tylko w celu wsparcia starszych urządzeń.
#  Przykład: Protocol 2, 1

# Użyj innego portu
# Jedną z głównych korzyści ze zmiany portu i użycia niestandardowego portu
# jest uniknięcie bycia widzianym przez przypadkowe skanowanie. Zdecydowana większość hakerów
# szukających otwartych serwerów SSH będzie szukała portu 22, ponieważ domyślnie,
# SSH nasłuchuje połączeń przychodzących na tym porcie.
# Jeśli trudniej jest zeskanować Twój serwer SSH, to zmniejszają się Twoje szanse na atak.
# Uruchom SSH na niestandardowym porcie powyżej portu 1024.

Port 2025

# Możesz wybrać dowolny nieużywany port, o ile nie jest on używany przez inną usługę.
# Wiele osób może wybrać 222 lub 2222 jako swój port, ponieważ
# jest to dość łatwe do zapamiętania, ale właśnie z tego powodu, hakerzy skanujący port 22
# prawdopodobnie będą również próbować portów 222 i 2222. Spróbuj wybrać numer portu
# który nie jest jeszcze używany, podążaj za tym linkiem, aby uzyskać listę numerów portów i ich znanych usług.

# Jeśli StrictModes jest ustawiony na tak, to wymagane są poniższe uprawnienia.
# sudo chmod 700 ~/.ssh
# sudo chmod 600 ~/.ssh/authorized_keys

StrictModes yes

# Konfiguracja interwału czasu bezczynności

ClientAliveInterval 360
ClientAliveCountMax 1

# ClientAliveInterval - Ustawia interwał czasowy w sekundach, po którym, jeśli nie otrzymano żadnych danych od klienta, 
# sshd wyśle wiadomość przez kanał szyfrowany, aby zażądać odpowiedzi od klienta. Domyślnie jest to 0, co oznacza, 
# że te wiadomości nie będą wysyłane do klienta. Opcja dotyczy tylko protokołu w wersji 2.

# ClientAliveCountMax - Wartość domyślna to 3. Jeśli ClientAliveInterval ustawiony jest na 15, a ClientAliveCountMax 
# na wartość domyślną, to niereagujący klienci SSH będą rozłączani po około 45 sekundach. 
# Opcja dotyczy tylko protokołu w wersji 2.

# Wartość timeout jest obliczana przez pomnożenie
# ClientAliveInterval i ClientAliveCountMax.
# timeout interval = ClientAliveInterval * ClientAliveCountMax
# Opcje OpenSSH ClientAliveInterval i ClientAliveCountMax
# nie są używane do rozłączania nieaktywnych sesji.
# W rzeczywistości zapobiegają one zamknięciu połączenia,
# nawet na nieaktywnych sesjach, tak długo jak klient i łącze sieciowe jest żywe.
# Jest to wewnętrzny mechanizm ssh, który wysyła pakiet "null
# wewnątrz ustanowionego tunelu, i czeka na odpowiedź od klienta.
# W tym przypadku wysyła jeden pakiet co 360 sekund, i rozłącza się po 1 brakującej odpowiedzi.
# Chociaż te opcje są pomocne w wykrywaniu i czyszczeniu rozłączonych sesji klientów,
# nie zabiją one sesji klientów, którzy nadal są połączeni, nawet jeśli są nieaktywni.
# Chyba, że ich klient nie odpowie na pakiet null.
```

Aby odłączyć nieaktywnych klientów, jeśli używasz bash jako powłoki, możesz ustawić wartość TMOUT w ogólnosystemowym profilu domyślnym lub na użytkownika:

```
# TMOUT Jeśli ustawione na wartość większą od zera,
# TMOUT traktowane jest jako domyślny limit czasu (tiomeout) 
# dla wbudowanego odczytu (read).
#
# Polecenie select kończy pracę jeśli nie otrzyma danych na wejściu 
# z terminala po TMOUT sekund.
#
# W powłoce interaktywnej, wartość ta interpretowana jest jako liczba
# sekund oczekiwania na wiersz wejścia po wydaniu głównej zachęty.
#
# Bash kończy pracę po odczekaniu tej liczby sekund
# jeśli nie nadejdzie pełny wiersz wejścia.

# Na przykład, dodanie następującej linii do `/etc/.bashrc`.
# zamknie sesje bashowe nieaktywnego użytkownika po 5 minutach,
# ale przeczytaj następujące ostrzeżenie przed włączeniem tego:

`export TMOUT=300`

# Ostrzeżenie: jako codzienny użytkownik powłoki, często pozwalam,
# aby jakiś terminal był otwarty podczas wielozadaniowości.
# Osobiście uznałbym ten mechanizm TMOUT za bardzo denerwujący,
# jeśli byłby ustawiony na niską wartość (nawet 10 minut).
# Nie polecam tego, chyba że jest przynajmniej ustawiony
# na bardzo wysoką wartość (co najmniej 1 godzinę - 3600 sekund).

# Moja opinia jest taka, że opcje OpenSSH `ClientAliveInterval` i `ClientAliveCountMax`
# (lub `ServerAliveInterval` i `ServerAliveCountMax`, ustawiane po stronie serwera),
# wystarczą, aby pozbyć się zombie/rozłączonych klientów.
# Używając ich, masz już gwarancję, że aktywna sesja na serwerze
# odpowiada otwartemu terminalowi na podłączonym kliencie.
#
# To jest wybór użytkownika, aby utrzymać swój terminal otwarty, 
# podczas gdy rozumiem. że chcesz zamknąć rozłączonych klientów.
# Nie widzę sensu zamykania sesji od legalnych użytkowników.
```

#### Bezpieczna konfiguracja szyfrów/MAC/Kex dostępnych w SSH 

```
KexAlgorithms diffie-hellman-group14-sha256,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512,diffie-hellman-group-exchange-sha256,ecdh-sha2-nistp256,ecdh-sha2-nistp384,ecdh-sha2-nistp521,curve25519-sha256,curve25519-sha256@libssh.org
Ciphers aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-512

# Mniej bezpieczne, lecz działające
KexAlgorithms curve25519-sha256@libssh.org,ecdh-sha2-nistp521,ecdh-sha2-nistp384,ecdh-sha2-nistp256,diffie-hellman-group-exchange-sha256
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,umac-128-etm@openssh.com,hmac-sha2-512,hmac-sha2-256,umac-128@openssh.com
```

Upewnij się, że twój klient ssh może używać tych szyfrów, uruchom:

```
ssh -Q cipher | sort -u
to see the list
```

Polecam przeczytać ten artykuł::
[Secure Configuration of Ciphers/MACs/Kex available in SSH](https://security.stackexchange.com/questions/39756/secure-configuration-of-ciphers-macs-kex-available-in-ssh "Secure Configuration of Ciphers/MACs/Kex available in SSH")

Zrestartuj usługę SSH

```
sudo systemctl restart sshd
```
