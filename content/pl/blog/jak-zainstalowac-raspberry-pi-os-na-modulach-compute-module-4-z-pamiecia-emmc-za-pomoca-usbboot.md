---
title: Jak zainstalować Raspberry Pi OS na modułach Compute Module 4 z pamięcią eMMC
  za pomocą usbboot
date: 2023-07-16T13:45:00+00:00
description: Jak zainstalować Raspberry Pi OS na modułach Compute Module 4 z pamięcią
  eMMC za pomocą usbboot
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
    image: images/2023-thumbs/flash-compute-module-4-eMMC.webp
---
Istnieją dwie główne wersje modułu Raspberry Pi Compute Module 4: z wbudowaną pamięcią eMMC i bez niej. Jeśli wybierzesz Compute Module 4 z wbudowaną pamięcią eMMC i chcesz ręcznie zmieniać pliki w woluminie rozruchowym lub zapisywać nowy obraz systemu operacyjnego na module, możesz to zrobić tak samo jak z kartą microSD, ale najpierw musisz sprawić, aby pamięć eMMC była montowalna na innym komputerze.

Ten post na blogu pokazuje, jak zamontować pamięć eMMC na innym komputerze (w moim przypadku Linux, ale proces jest bardzo podobny na Macu), a następnie jak zainstalować na niej nowy obraz systemu operacyjnego.

#### Instrukcje wideo

Instalację i użycie rpiboot do flashowania pamięci eMMC na Windowsie, Ubuntu, Raspberry Pi OS lub macOS pokrywa wersja wideo tego postu, którą także opublikowałem oprócz poniższego pisemnego poradnika:

{{<youtube 7Yz9TlPPTtA>}}

#### Przygotowanie płyty IO do montażu
1. Umieść zworkę na pierwszym zestawie pinów na złączu 'J2' — zworka oznaczona jako "Fit jumper to disable eMMC boot": Jeśli nie masz zworki, możesz również wstawić dowolny przewodnik, na przykład złącze żeńskie-do-żeńskiego, pomiędzy dwa piny.
2. Następnie podłącz USB i kabel zasilający od komputera (w moim przypadku Linux, ale może być też Windows lub Mac) do portu micro USB 'USB Slave' na płycie IO:
3. Płyta włączy się i zobaczysz świecącą czerwoną diodę 'D1', ale moduł Compute nie uruchomi się. Następujący proces powinien być teraz możliwy przy użyciu modułu eMMC.

#### Używanie usbboot do montowania pamięci eMMC

Następnym krokiem jest pobranie pliku wykonywalnego rpiboot, którego będziesz potrzebować, aby zamontować pamięć na swoim komputerze, skonstruować repozytorium rpiboot oraz zainstalować niezbędną bibliotekę USB na swoim komputerze. Na moim Linuxie zrobiłem to wszystko za pomocą programu Terminal.

1. Sprawdź, czy zainstalowana jest biblioteka libusb. Na Linuxie (np. innym Raspberry Pi, Debian, Ubuntu), wykonaj:

```bash
sudo apt install libusb-1.0-0-dev
```

2. Sklonuj repozytorium usbboot na swój komputer:

```bash
git clone --depth=1 https://github.com/raspberrypi/usbboot
```

3. Utwórz rpiboot, wykonując poniższe polecenia:

```bash
cd usbboot
make
```

4. Teraz w katalog

u powinien znaleźć się plik wykonywalny o nazwie rpiboot. Uruchom poniższe polecenie, aby zamontować pamięć eMMC.

```bash
sudo ./rpiboot
```

5. Wolumin rozruchowy powinien być zamontowany na twoim Linuxie (lub na innym urządzeniu, którego używasz) krótko po zakończeniu pracy. Może również zacząć świecić dioda D2, wskazując na aktywność odczytu/zapisu na dysku eMMC.

#### Instalacja Raspberry Pi imager

Pamięć eMMC teraz działa dokładnie tak jak karta microSD lub dysk USB podłączony do komputera. Użyj programu takiego jak Raspberry Pi Imager, aby zainstalować na eMMC Raspberry Pi OS (lub dowolny inny wybrany system operacyjny):

{{<youtube X0yUDcN8KUY>}}

1. Pobierz Raspberry Pi Imager

```bash
wget https://downloads.raspberrypi.org/imager/imager_latest_amd64.deb
sudo apt install ./imager_latest_amd64.deb
```

#### Flashowanie Raspberry Pi OS na pamięci eMMC

Wideo przedstawia instalację Raspberry Pi OS bez i z GUI.

{{<youtube zUcWfZdYp6A>}}

Teraz możesz odłączyć płytę IO i wyjąć wolumin rozruchowy, jeśli jest jeszcze zamontowany, jeśli nie musisz niczego zmieniać w zawartości woluminu rozruchowego. Po odłączeniu zasilania, połączenia portu USB Slave i J2, zdejmij zworkę eMMC Boot disable z J2.

Podłącz ponownie zasilanie, a CM4 powinien teraz uruchamiać się z niedawno zainstalowanej pamięci eMMC!

Uruchom ponownie poniższe polecenie, jeśli kiedykolwiek będziesz musiał zamontować dysk rozruchowy lub ponownie zainstalować pamięć eMMC.

```bash
sudo./rpiboot
```

#### Konfigurowanie Raspberry Pi OS po instalacji

{{<youtube 4s3k-heKiwY>}}