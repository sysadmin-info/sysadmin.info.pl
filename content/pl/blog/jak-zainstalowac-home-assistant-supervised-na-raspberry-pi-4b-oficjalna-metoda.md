---
title: Jak zainstalować Home Assistant Supervised na Raspberry Pi 4b – oficjalna metoda
date: 2022-07-29T09:39:10+00:00
description: Jak zainstalować Home Assistant Supervised na Raspberry Pi 4b – oficjalna metoda
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
series:
- 
categories:
- Raspberry Pi
- Home Assistant
cover:
    image: images/2022-thumbs/ha.webp
---
Ten film opisuje, jak zainstalować Home Assistant Supervised. Home Assistant (dawniej Hass.io) to system oparty na kontenerach do zarządzania instalacją Home Assistant Core i powiązanymi aplikacjami. System jest kontrolowany za pomocą Home Assistant, który komunikuje się z Supervisorem. Supervisor zapewnia API do zarządzania instalacją. Obejmuje to zmianę ustawień sieciowych lub instalowanie i aktualizowanie oprogramowania.

{{< youtube zz8dq4wi_40 >}}
<figcaption>Jak zainstalować Home Assistant Supervised na Raspberry Pi 4b – oficjalna metoda</figcaption>


##### Sprawdź OS

```bash
sudo cat /etc/os-release
```
##### Wejdź do katalogu domowego użytkownika
```bash
cd /home/twój_użytkownik
```

##### Zaktualizuj OS
```bash
sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y
```

##### Napraw wcześniejsze instalacje jeśli takie istnieją
```bash
sudo apt --fix-broken install
```

##### Dodatkowo zainstaluj dnsutils, aby móc używać polecenia dig do dowolnego adresu
```bash
sudo apt install dnsutils
```

##### Zainstaluj niezbędne narzędzia dla Home Assistant Supervised
```bash
sudo apt install jq wget curl udisks2 libglib2.0-bin network-manager dbus apparmor apparmor-utils -y
```

Zobacz: [https://github.com/home-assistant/architecture/blob/master/adr/0014-home-assistant-supervised.md](https://github.com/home-assistant/architecture/blob/master/adr/0014-home-assistant-supervised.md)

##### Na Raspberry Pi wykonaj następujące polecenie, aby uzyskać oficjalny skrypt instalacyjny Dockera:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
```

##### Następnie uruchom skrypt i ciesz się przejazdem:
```bash
sudo sh get-docker.sh
```

##### Ważne! Użytkownik pi nie istnieje domyślnie ze względów bezpieczeństwa

Musimy dodać naszego użytkownika Linux do grupy Docker, ale to proste. Jeśli twój użytkownik nie jest username jak w przykładzie poniżej, po prostu zmień ostatnią część polecenia, zastępując pi twoim nazwą użytkownika:

```bash
sudo usermod -aG docker nazwa_użytkownika
```

##### Dodaj te wpisy do vim /boot/cmdline.txt na końcu linii: apparmor=1 security=apparmor

```bash
sudo vim /boot/cmdline.txt 
```

##### Powinno to wyglądać tak: 

```vim
console=serial0,115200 console=tty1 root=PARTUUID=ae7ace51-02 rootfstype=ext4 fsck.repair=yes rootwait apparmor=1 security=apparmor systemd.unified_cgroup_hierarchy=false
```

##### Uruchom ponownie serwer
```bash
sudo reboot
```
##### Sprawdź status AppArmor
```bash
sudo aa-status
```
##### Sprawdź wersje i porównaj. Zobacz wymagania systemowe: [https://github.com/home-assistant/architecture/blob/master/adr/0014-home-assistant-supervised.md](https://github.com/home-assistant/architecture/blob/master/adr/0014-home-assistant-supervised.md)
```bash
sudo dpkg -l apparmor | tee
sudo docker --version
sudo systemctl --version
sudo nmcli --version
```
##### Zainstaluj OS-Agent:
Pobierz najnowszy pakiet Debian z strony wydań OS Agent GitHub: [https://github.com/home-assistant/os-agent/releases/latest](https://github.com/home-assistant/os-agent/releases/latest)

```bash
wget https://github.com/home-assistant/os-agent/releases/download/1.2.2/os-agent_1.2.2_linux_aarch64.deb
```
##### Następnie zainstaluj (lub zaktualizuj) pobrany pakiet Debian używając:

```bash
sudo dpkg -i os-agent_1.2.2_linux_aarch64.deb
```

##### Możesz sprawdzić, czy instalacja się powiodła, uruchamiając:
```bash
sudo gdbus introspect --system --dest io.hass.os --object-path /io/hass/os
```

##### To nie powinno zwrócić błędu. Jeśli otrzymasz introspekcję obiektu z interfejsem itp. OS Agent działa zgodnie z oczekiwaniami.

##### Zainstaluj pakiet Debian Home Assisistant Supervised:
```bash
wget https://github.com/home-assistant/supervised-installer/releases/latest/download/homeassistant-supervised.deb
```

##### Następnie zainstaluj (lub zaktualizuj) pobrany pakiet Debian używając:
```bash
sudo dpkg -i homeassistant-supervised.deb
```

##### Wybierz: raspberrypi4-64 

Zobacz obsługiwane typy maszyn: [https://github.com/home-assistant/supervised-installer](https://github.com/home-assistant/supervised-installer)

##### Zmień wpisy DNS

```bash
sudo vim /etc/dhcpcd.conf
```

Zmień wpis DNS na Google 8.8.4.4 i 8.8.8.8, ponieważ wcześniej był adres IP Raspberry Pi, który obsługiwał żądania przez DNS, ale wymagania jasno mówią, że musi być inny. 
Zobacz: [https://github.com/home-assistant/operating-system/blob/dev/Documentation/network.md#static-ip](https://github.com/home-assistant/operating-system/blob/dev/Documentation/network.md#static-ip)

```vim
interface eth0
static ip_address=10.10.0.100/24 
static routers=10.10.0.1
static domain_name_servers=8.8.4.4 8.8.8.8
```

Jeśli używasz zapory sieciowej, takiej jak ufw, dodaj port, który Home Assistant używa
```bash
sudo ufw allow 8123/tcp
```

##### Uruchom ponownie serwer
```bash
sudo reboot
```

##### zaloguj się do Home Assistant w swojej przeglądarce
```
http://10.10.0.100:8123/
```