---
title: Jak zainstalować Red Hat OpenShift CodeReady Containers w systemie Linux
date: 2023-11-19T16:00:00+00:00
description: Jak zainstalować Red Hat OpenShift CodeReady Containers w systemie Linux
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- OpenShift
categories:
- OpenShift
image: images/2023-thumbs/openshift01.webp
---

1. **Oto samouczek wideo**

{{<youtube Sc4O96nh4aw>}}


Skrypty i pliki konfiguracyjne są dostępne [tutaj:](https://github.com/sysadmin-info/openshift)

{{< notice info "info" >}}
Proszę pamiętać, że użytkownik, którego używasz do instalacji (ten, który jest obecnie zalogowany przez ssh), musi znajdować się w grupie sudoers.
{{< /notice >}}

##### Wymagania systemowe:
* 4 fizyczne rdzenie CPU lub vCPU
* 9 GB wolnej pamięci RAM, więc maszyna powinna mieć co najmniej 12 GB RAM w sumie
* 35 GB miejsca na dysku
* AMD64/Intel 64
* Microsoft Windows 10 (wersja 1709 lub nowsza)
* MacOS 10.14 Mojave lub nowszy
* Red Hat Enterprise Linux/CentOS 7.5 lub nowszy

To jest tymczasowa konfiguracja klastra i nie powinieneś przechowywać żadnych ważnych danych ani aplikacji wewnątrz klastra CRC.

* Przeznaczone do rozwoju i testowania
* Brak bezpośredniej aktualizacji do nowszej wersji CRC
* Jednowęzłowy klaster OpenShift (wspólny węzeł główny i roboczy)
* Domyślnie wyłączony operator monitorowania klastra
* Uruchamianie jako maszyna wirtualna

##### Procedura instalacji OpenShift

1. Przejdź do: https://console.redhat.com/openshift
2. Zarejestruj konto, jeśli go nie masz.
3. Zaloguj się.
5. Przejdź do zakładki lokalnej.
4. Pobierz CRC i sekret pobierania
5. Prześlij na serwer, na którym chcesz zainstalować OpenShift.
6. Rozpakuj
```bash
tar xvf crc-linux-amd64.tar.xz
```
7. Dodaj zmienną do pliku .bashrc
```bash
echo 'export PATH=$PATH:~/crc-linux-2.29.0-amd64' >> ~/.bashrc
```
8. Wykonaj poniższe polecenie:
```bash
source ~/.bashrc
```
9. Wpisz
```bash
crc version
```
aby upewnić się, że plik wykonywalny działa poprawnie

10. Wykonaj poniższe polecenia jeden po drugim, aby zainstalować OpenShift

```bash
crc setup
crc config set cpus 4
crc config set memory 10000
crc start -p pull-secret
```

##### Procedura instalacji HAProxy
{{< notice warning "Ostrzeżenie" >}}
Wykonaj tę procedurę tylko w lokalnej sieci. Eksponowanie niezabezpieczonego serwera w Internecie ma wiele implikacji bezpieczeństwa.
{{< /notice >}}

1. Upewnij się, że klaster pozostaje uruchomiony podczas tej procedury.
2. Zainstaluj pakiet haproxy i inne narzędzia, uruchamiając skrypt haproxy.sh stąd: [haproxy.sh](https://github.com/sysadmin-info/openshift)
3. Zmień uprawnienia dla pliku
```bash
chmod +x haproxy.sh
```
4. Uruchom skrypt
```bash
./haproxy.sh
```
5. Dodaj symbol wieloznaczny

 w Adguard Home / Pi-Hole dla adresu IP. Zobacz wideo.
6. Teraz przetestuj klaster za pomocą CLI openshift lub w skrócie oc
```bash
echo 'eval $(crc oc-env)' >> ~/.bashrc
source ~/.bashrc
oc login -u kubeadmin https://api.crc.testing:6443
oc get projects
oc get nodes
oc get pods -A
oc get all -A
```

##### Zatrzymanie, usunięcie i czyszczenie OpenShift

1. Wykonaj poniższe polecenia jeden po drugim:

```bash
crc stop
crc delete
crc cleanup
```

2. Uruchom poniższe polecenie:
```bash
chmod +x haproxy-remove.sh
./haproxy-remove.sh
```

Plik znajdziesz tutaj: [haproxy-remove.sh](https://github.com/sysadmin-info/openshift) 
