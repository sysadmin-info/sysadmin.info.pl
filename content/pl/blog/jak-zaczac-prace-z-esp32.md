---
title: Jak zacząć pracę z ESP32 w Debian 12 - krok po kroku
date: 2024-08-02T11:50:00+00:00
description: Jak zacząć pracę z ESP32 w Debian 12 - krok po kroku
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- ESP32
categories:
- ESP32
cover:
    image: images/2024-thumbs/esp32.webp
---

Aby podłączyć ESP32 do komputera z systemem Linux Debian 12, należy wykonać następujące kroki:

1. Kabel USB: Potrzebujesz kabla USB do micro-USB lub USB-C, w zależności od typu portu w ESP32.
2. Sterowniki: Większość nowoczesnych systemów operacyjnych automatycznie rozpoznaje ESP32, ale może być konieczne zainstalowanie sterowników CP210x USB to UART Bridge VCP.
3. Połączenie:
   - Podłącz kabel USB do ESP32.
   - Podłącz drugi koniec kabla do portu USB w komputerze.
4. Sprawdzanie połączenia:
   - W systemie Linux użyj polecenia "ls /dev/tty*" w terminalu.
Powinieneś zobaczyć nowe urządzenie szeregowe.
5. Oprogramowanie: Do programowania ESP32 możesz użyć Arduino IDE lub platformy ESP-IDF.

#### Kopia zapasowa

Wykonanie kopii zapasowej zawartości fabrycznej ESP32 jest dobrym pomysłem, zwłaszcza przed wprowadzeniem własnych zmian. Oto jak to zrobić:

1. Zainstaluj esptool:

   Jeśli jeszcze go nie masz, zainstaluj esptool. Możesz to zrobić za pomocą pip:

   ```bash
   sudo apt install python3-pip python3.11-venv python3-wxgtk4.0 python3-full
   mkdir esptool
   python3 -m venv ~/esptool/
   ~/esptool/bin/python3.11 ~/esptool/bin/pip install esptool
   ```

2. Podłącz ESP32 do komputera za pomocą USB.

Skąd mam wiedzieć, którego portu użyć?

**W systemie Linux:**

- Otwórz terminal i wpisz: `ls /dev/tty*`
- Podłącz ESP32 do komputera
- Wpisz ponownie: `ls /dev/tty*`
- Porównaj wyniki - nowy port, który się pojawił, to prawdopodobnie twoje ESP32
- Zazwyczaj będzie to coś w rodzaju `/dev/ttyUSB0` lub `/dev/ttyACM0`

Jeśli nie jesteś pewien, możesz odłączyć i ponownie podłączyć ESP32, obserwując, który port znika i pojawia się na liście.

3. Wykonaj kopię zapasową:

   Otwórz terminal i wpisz:

   ```bash
   USER=twoja_nazwa_użytkownika
   mkdir /home/$USER/backup
   sudo /home/$USER/esptool/bin/python3.11 /home/$USER/esptool/bin/esptool.py --port /dev/ttyUSB0 --baud 115200 --before default_reset --after hard_reset read_flash 0 0x400000 ~/backup/flash_content.bin
   ```

Uwaga: Zmień `/dev/ttyUSB0` na odpowiedni port dla twojego systemu.

4. To polecenie utworzy plik `flash_contents.bin`, który będzie zawierał kopię całej pamięci flash ESP32.

Kilka uwag:

- Upewnij się, że masz wystarczająco dużo miejsca na dysku (plik będzie miał około 4MB).
- Proces może potrwać kilka minut.
- Jeśli napotkasz problemy z połączeniem, może być konieczne powtórzenie polecenia, aby wykonać kopię zapasową.

Aby później przywrócić tę kopię:

```bash
sudo chmod a+rw /dev/ttyUSB0
sudo /home/$USER/esptool/bin/python3.11 /home/$USER/esptool/bin/esptool.py --port /dev/ttyUSB0 --baud 115200 write_flash 0 ~/backup/flash_contents.bin
```

Pamiętaj, że ta kopia zawiera wszystko w pamięci flash, w tym bootloader, partycje i aplikację.

#### Instalacja Arduino IDE

Aby zainstalować Arduino IDE w systemie Linux, możesz użyć jednej z dwóch głównych metod:

1. Instalacja za pomocą menedżera pakietów (łatwiejsza, ale może nie być to najnowsza wersja):

Otwórz terminal i wpisz:

```bash
sudo apt-get update
sudo apt-get install arduino
```

Ta metoda działa na systemach opartych na Debianie/Ubuntu. Dla innych dystrybucji polecenie może się różnić.

2. Instalacja z oficjalnej strony Arduino (najnowsza wersja):
   a) Przejdź na stronę [https://www.arduino.cc/en/software](https://www.arduino.cc/en/software)
   b) Pobierz wersję dla systemu Linux (64-bitową lub 32-bitową, w zależności od twojego systemu)
   c) Rozpakuj pobrany plik .tar.xz
   d) Otwórz terminal w folderze, w którym rozpakowałeś pliki
   e) Uruchom skrypt instalacyjny:

```bash
./install.sh
```

Po zainstalowaniu możesz uruchomić Arduino IDE z menu aplikacji lub wpisując `arduino` w terminalu.

Dodatkowo, aby używać Arduino IDE bez uprawnień root, musisz dodać swojego użytkownika do grupy dialout:

```bash
sudo usermod -a -G dialout $USER
```

Upewnij się również, że możesz pisać do urządzenia:

```bash
sudo chmod a+rw /dev/ttyUSB0
```

Po wykonaniu tego polecenia konieczne będzie ponowne uruchomienie systemu lub wylogowanie i ponowne zalogowanie.

Po zainstalowaniu Arduino IDE i podłączeniu ESP32, kolejne kroki to:

1. Dodanie wsparcia dla ESP32 w Arduino IDE:
   - Otwórz Arduino IDE
   - Przejdź do File > Preferences
   - W polu "Additional Boards Manager URLs" dodaj:
     `https://espressif.github.io/arduino-esp32/package_esp32_index.json`
   - Kliknij OK

   Zobacz dokumentację: [https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html)

2. Instalacja płytki ESP32:
   - Przejdź do Tools > Board > Boards Manager
   - Wyszukaj "ESP32"
   - Zainstaluj "ESP32 by Espressif Systems"

3. Konfiguracja Arduino IDE:
   - Wybierz odpowiedni model ESP32 w Tools > Board > esp32 > AI Thinker ESP32-CAM z menu Arduino IDE.
   - Wybierz właściwy port w Tools > Port
   - Wybierz odpowiednią częstotliwość - zobacz częstotliwość kryształu. Zwykle 80 lub 40 MHz

4. Testowanie połączenia:
   - Otwórz przykładowy szkic: File > Examples > WiFi > WiFiScan
   - Kliknij przycisk "Upload", aby skompilować i wgrać program

5. Programowanie:
   - Teraz możesz zacząć pisać własne programy lub modyfikować istniejące przykłady

6. Testowanie aplikacji/kodu
   - Otwórz Tools > Serial Monitor
   - Ustaw baud na 115200
   - Obserwuj wynik kodu

#### Film instruktażowy

{{<youtube jmiKZUIE_EM>}}


#### Przywracanie działania uszkodzonego ESP32 (np. Ulanzi TC001)

Czasami proces flashowania kończy się błędem i urządzenie przestaje odpowiadać (brak WiFi, brak obrazu, niewidoczne dla web flashera). W takiej sytuacji trzeba wymusić tryb bootloadera w ESP32 i wgrać firmware ręcznie.


---

Kiedy urządzenie jest „uceglone”?

brak reakcji po włączeniu

brak sieci WiFi

web flasher nie wykrywa urządzenia

esptool zwraca błędy połączenia



---

Krok 1 – Rozbierz urządzenie

Niektóre urządzenia (np. Ulanzi TC001) wymagają otwarcia obudowy, aby uzyskać dostęp do płytki.

Szukaj pinów lub padów oznaczonych jako:

GPIO0 (lub IO0)

GND



---

Krok 2 – Wymuś tryb bootowania

Aby wejść w tryb bootloadera:

1. Zewrzyj GPIO0 do GND (np. pęsetą lub przewodem)


2. Trzymając zwarcie, podłącz zasilanie USB


3. Po sekundzie rozłącz zwarcie



Warto zauważyć, że ten krok jest wymagany przy odzyskiwaniu urządzenia. Bez niego flashowanie się nie powiedzie.


---

Krok 3 – Zidentyfikuj port szeregowy

ls /dev/ttyUSB*
#### lub
dmesg | grep tty


---

Krok 4 – Wgraj firmware przy użyciu esptool

Przykładowe polecenie:

sudo esptool.py --chip esp32 \
  --port /dev/ttyUSB0 \
  --baud 921600 \
  write_flash -z \
  0x1000 bootloader.bin \
  0x8000 partitions.bin \
  0xe000 boot_app0.bin \
  0x10000 firmware.bin

Upewnij się, że używasz właściwych plików binarnych i offsetów dla swojego urządzenia.


---

Rozwiązywanie problemów

Failed to connect
→ urządzenie nie jest w trybie boot (GPIO0 nie zostało poprawnie zwarte)

brak /dev/ttyUSB0
→ niewłaściwy kabel USB (tylko do ładowania)

flashowanie kończy się sukcesem, ale urządzenie nie startuje
→ nieprawidłowy firmware lub błędne offsety



---

Krok 5 – Restart

odłącz USB

podłącz ponownie (bez zwarcia GPIO0)


Urządzenie powinno się uruchomić i ponownie udostępnić WiFi lub interfejs webowy.


---

Podsumowując

Przywrócenie działania „uceglonego” ESP32 zazwyczaj nie oznacza uszkodzenia sprzętu. W większości przypadków wystarczy uzyskać dostęp do GPIO0, wymusić tryb bootowania i ponownie wgrać firmware przy użyciu esptool.