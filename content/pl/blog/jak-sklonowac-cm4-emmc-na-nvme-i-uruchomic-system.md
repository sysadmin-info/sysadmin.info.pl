---
title: Jak sklonować CM4 eMMC na NVMe i uruchomić system
date: 2023-07-20T17:20:00+00:00
description: Jak sklonować CM4 eMMC na NVMe i uruchomić system
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- water cooling dla CM4 / Raspberry Pi
categories:
- Raspberry Pi
cover:
    image: images/2023-thumbs/how-to-clone-cm4-emmc-onto-nvme-and-boot.webp
---
#### Instrukcja wideo

{{<youtube gczLvn7Uo-I>}}

#### Jak zmienić kolejność rozruchu bootloadera EEPROM, aby móc uruchamiać system z dysku NVMe?
1. Aby to zadziałało, wystarczy włączyć płytę CM4, na której jest obecnie zainstalowany Raspberry Pi OS i sprawdzić konfigurację za pomocą polecenia:
2. Zaloguj się do Raspberry Pi OS na CM4 przez SSH. Sprawdź konfigurację w linii poleceń:

```bash
rpi-eeprom-config
```

3. Zobaczysz linię:

```
BOOT_ORDER=
```

4. Wyłącz system operacyjny na płycie CM4.

Dobry poradnik znajduje się na oficjalnej stronie Raspberry Pi: [Sprzęt Compute Module - Arkusze danych i schematy](https://www.raspberrypi.com/documentation/computers/compute-module.html "Sprzęt Compute Module - Arkusze danych i schematy")

Zobacz sekcję: [Bootloader modułu Compute 4](https://www.raspberrypi.com/documentation/computers/compute-module.html#cm4bootloader "Bootloader modułu Compute 4")

Poniższa tabela lepiej wyjaśnia poprawną kolejność.

| Wartość | Tryb           | Opis                                                                                                                    |
|---------|----------------|-------------------------------------------------------------------------------------------------------------------------|
| 0x0     | SD CARD DETECT | Próba SD, a następnie czekanie na sygnał zmiany karty - przestarzałe, teraz gdy jest dostępny Oxf (RESTART).            |
| 0x1     | SD CARD        | Karta SD (lub eMMC na Compute Module 4).                                                                                |
| 0x2     | NETWORK        | Rozruch sieciowy - patrz poradnik serwera rozruchu sieciowego                                                           |
| 0x3     | RPI BOOT       | RPIBOOT - patrz usbboot                                                                                                 |
| 0x4     | USB-MSD        | Rozruch z pamięci masowej USB - patrz rozruch z pamięci masowej USB                                                     |
| 0x5     | BCM-USB-MSD    | Rozruch USB 2.0 z gniazda USB typu C (CM4: gniazdo USB typu A na płycie CM410).                                         |
| 0x6     | NVME           | Tylko CM4: rozruch z dysku SSD NVMe podłączonego do interfejsu PCIe. Patrz rozruch NVMe, aby uzyskać więcej informacji. |
| 0x7     | HTTP           | Rozruch HTTP przez ethernet. Patrz rozruch HTTP, aby uzyskać więcej informacji.                                         |
| 0xe     | STOP           | Zatrzymaj i wyświetl wzór błędu. Wymagany jest cykl zasilania, aby wyjść z tego stanu.                                  |
| 0xf     | RESTART        | Rozpocznij ponownie od pierwszego trybu rozruchu w polu BOOT_ORDER, czyli pętla                                         |

5. Zaloguj się na komputer z Linuksem, z którego flashowałeś napęd EEMC, w moim przypadku jest to mój laptop DELL.

6. Tutaj możesz zobaczyć, że musisz użyć katalogu recovery w oprogram

owaniu usbboot, które pozwala na flashowanie EEPROM.

7. #### Korzystanie z usbboot

Jeśli potrzebujesz, możesz sklonować repozytorium za pomocą polecenia:

```bash
git clone --depth=1 https://github.com/raspberrypi/usbboot
cd usbboot
make
```

A następnie wejdź do katalogu recovery

```bash
cd recovery
```

8. Musisz zmienić linię w pliku boot.conf

```bash
vim boot.conf
```

9. Zmień kolejność zgodnie z poniższym przykładem:

```
BOOT_ORDER=0xf25416

#powyższa konfiguracja rozruchu
NVMe, karta SD, USB, USB CM4, Sieć, Restart
```

10. Podłącz kabel USB - micro USB między komputer, z którego będziesz flashować EEPROM, a wyłączoną płytę CM4.

11. Następnie podłącz kabel zasilający do płyty CM4.

12. Uruchom poniższe polecenie w katalogu /usbboot/recovery

```bash
sudo ./upddate-pieeprom.sh
```

13. Następnie wpisz poniższe polecenia, aby zflashować bootloader

```bash
cd ..
sudo ./rpiboot
```

14. Odłącz kabel USB do mini USB oraz wtyczkę zasilania i zworkę (lub kabel żeński do żeńskiego).

15. Następnie podłącz z powrotem wtyczkę zasilania, a powinieneś zobaczyć, że Raspberry Pi OS uruchamia się z pamięci EEMC.

16. Następnie połącz się przez SSH lub używając klawiatury z linią poleceń w Raspberry Pi OS.

17. Po tym musisz sklonować zawartość pamięci EEMC na dysk NVMe za pomocą poniższego polecenia:

```bash
sudo dd if=/dev/mmcblk0 of=/dev/nvme0n1 bs=4MB status=progress
```

18. Następnie musisz usunąć istniejące partycje na dysku EEMC i stworzyć jedną partycję zamiast dwóch, które zostały wcześniej utworzone (boot i /)

```bash
sudo fdisk /dev/mmcblk0
```

19. Następnie dwa razy naciśnij d na klawiaturze, aby usunąć partycje.

20. Po tym naciśnij klawisze na klawiaturze w tej kolejności:

```
1. n - nowa partycja
2. p - partycja podstawowa
3. 1 - numer partycji
4. naciśnij Enter dwa razy, aby użyć domyślnego pierwszego i ostatniego sektora dysku EEMC.
5. p - aby wydrukować tabelę partycji
6. w - aby zapisać zmiany
```

21. Teraz zrestartuj Raspberry Pi OS

```bash
sudo reboot
```

22. Sprawdź poleceniem ```lsblk``` partycje

23. Następnie użyj poniższego polecenia, aby zmienić rozmiar partycji root i postępuj zgodnie z instrukcją wideo.

```bash
sudo raspi-config
```

24. Następnie zrestartuj CM4.

```bash
sudo reboot
```

25. Następnie sprawdź rozmiar systemu plików root

```
df -kTh /
```

26. Po tym możesz dowiedzieć się, że dd wykonało swoje zadanie, sprawdzając UUID partycji za pomocą poniższych poleceń:

```bash
lsblk
cat /etc/fstab
blkid
```

27. Zaktualizuj system

```bash
sudo apt update
sudo apt list --upgradable
sudo apt upgrade -y
```

28. Zakończyłeś. Dobra robota!