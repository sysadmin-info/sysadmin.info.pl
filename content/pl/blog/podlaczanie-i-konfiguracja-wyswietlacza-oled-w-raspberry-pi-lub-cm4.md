---
title: Podłączanie i konfiguracja wyświetlacza OLED w Raspberry Pi lub CM4
date: 2023-07-27T13:00:00+00:00
description: Podłączanie i konfiguracja wyświetlacza OLED w Raspberry Pi lub CM4
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Water cooling dla CM4 / Raspberry Pi
categories:
- Raspberry Pi
cover:
    image: images/2023-thumbs/oled.webp
---
##### Ćwiczenia do wykonania:

1. Podłącz OLED za pomocą żeńskich złączek według GPIO
2. Zainstaluj wymagane oprogramowanie i skonfiguruj OLED
3. Uruchom skrypt stats.py
4. Włączanie i wyłączanie OLED za pomocą skryptów Bash

##### Wyświetlacz OLED Stats dla systemu operacyjnego Raspberry Pi - Debian 11 Bullseye

Przeprowadzę Cię przez etapy instalacji i konfiguracji w tym artykule, abyś mógł używać tego samego wyświetlacza OLED 12864 I2C z systemem operacyjnym Raspberry Pi Bullseye.

1. **Oto samouczek wideo; kontynuuj czytanie, aby zapoznać się z listą pisemnych instrukcji.**

{{<youtube B7URmK4nU_I>}}

##### Czego potrzebujesz do tego samouczka
* Raspberry Pi 4 lub płyta IO CM4 z modułem obliczeniowym 4
* Karta Micro SD lub eMMC lub dysk NVMe/SSD
* Zasilacz odpowiedni dla płyty Raspberry Pi lub CM4 IO.
* Wyświetlacz OLED I2C 128×64
* 4 żeńskie przewody

##### Używanie Raspberry Pi do podłączania wyświetlacza OLED Stats

Zaczniemy od użycia tej samej procedury do podłączenia wyświetlacza OLED Stats do naszego Raspberry Pi. Wymagany jest do tego 4-przewodowy kabel żeński do żeńskiego. Kolory są tylko po to, aby ułatwić Ci zapamiętanie, który przewód łączy się z którym złączem i nie mają innego zastosowania.

Ponieważ piny wystają z tyłu panelu OLED, złącza są oznaczone z przodu, co wydaje się dezorientować wiele osób. Jest to szczególnie trudne do zobaczenia, gdy wyświetlacz został umieszczony w obudowie, a przednia część wyświetlacza jest ukryta. Dlatego zanim umieścisz wyświetlacz w obudowie lub uchwycie, zapisz je.

Najbardziej typowa konfiguracja pinów to GND, VCC, SCL i SDA. Sprawdź swój własny wyświetlacz, zanim po prostu skopiujesz tę konfigurację, ponieważ niektóre z tych wyświetlaczy mają odwrócone piny VCC i GND. Nawet jeśli później poprawisz okablowanie, jeśli zostaną one podłączone nieprawidłowo do prądu, prawdopodobnie zostaną zniszczone i przestaną działać.

Zwróć uwagę na to, który kolor jest podłączony do którego złącza, po podłączeniu taśmy z przewodami do tych czterech pinów. Dobrym pomysłem jest zapisanie, który kolor jest dołączony do którego pinu podczas montażu monitora w obudowie, zanim podłączysz go do Raspberry Pi, abyś nie zapomniał.

Przeciwne końce przewodów zostaną następnie przyjęte przez piny GPIO Raspberry Pi. Schemat rozmieszczenia pinów GPIO dla Pi jest łatwo dostępny w Internecie i na stronie firmy.

![Rozmieszczenie pinów Raspberry Pi 4](/images/2023/Raspberry-Pi-4-Pinout.webp "Rozmieszczenie pinów Raspberry Pi 4")
<figcaption>Rozmieszczenie pinów Raspberry Pi 4</figcaption>

Przed podłączeniem lub odłączeniem przewodów od pinów GPIO, upewnij się, że twój Pi jest wyłączony i zasilanie jest wyłączone. Nie chcesz zapomnieć sprawdzić swoich połączeń przed włączeniem i przypadkowo spowodować zwarcie lub podłączyć przewód do niewłaściwego pinu.

Masz kilka opcji dla przewodów GND i VCC. Zwykle podłączam przewód GND do pinu 9 (ale możesz użyć dowolnego pinu z oznaczeniem GND). Następnie podłączam przewód VCC do pinu 1, pinu zasilania 3,3V. Każdy pin zasilania na nagłówku GPIO Raspberry Pi będzie działał z tymi wyświetlaczami, ponieważ mogą one pracować na wejściach 3,3V lub 5V.

Następnie musisz podłączyć przewody komunikacyjne SCL i SDA, które są po prostu włożone do odpowiednich pinów GPIO. Podłącz SDA do pinu 3, a SCL do pinu 5. Unikaj zamieszania, ignorując numery GPIO na schemacie i polegając wyłącznie na etykietach SDA i SCL oraz ich odpowiednich numerach pinów.

Po podwójnym sprawdzeniu wszystkich połączeń jesteś gotowy do włączenia Pi i rozpoczęcia konfiguracji wyświetlacza.

![Połączenie PIN wyświetlacza OLED I2C 128×64 Raspberry Pi 4](/images/2023/Raspberry_Pi_OLED.webp "Połączenie PIN wyświetlacza OLED I2C 128×64 Raspberry Pi 4")
<figcaption>Połączenie PIN wyświetlacza OLED I2C 128×64 Raspberry Pi 4</figcaption>

##### Programowanie wyświetlacza OLED Stats

Po podłączeniu wyświetlacza możemy zastanowić się nad zaprogramowaniem Raspberry Pi, aby wyświetlał wskaźniki wydajności. Będę to robić na zupełnie nowej instalacji systemu operacyjnego Raspberry Pi Bullseye, zapisując obraz systemu operacyjnego na zupełnie nową kartę microSD za pomocą narzędzia Raspberry Pi Imager.

Po włożeniu karty SD do gniazda karty SD Pi, podłącz zasilacz. Po uruchomieniu Pi powinieneś być na pulpicie systemu operacyjnego Raspberry Pi. Te same kroki można wykorzystać do zainstalowania tego oprogramowania na Pi bez głowy.

##### Zainstaluj bibliotekę CircuitPython i zaktualizuj Raspberry Pi

Zacznij od otwarcia nowego okna terminala i uruchomienia następujących poleceń, aby upewnić się, że oprogramowanie twojego Pi jest aktualne we wszystkich aspektach:

```bash
sudo apt-get update
sudo apt-get full-upgrade
sudo reboot
sudo apt-get install python3-pip
sudo pip3 install --upgrade setuptools
```

Następnie zainstaluj bibliotekę Adafruit CircuitPython za pomocą następujących poleceń:

```bash
cd ~
sudo pip3 install --upgrade adafruit-python-shell
wget https://raw.githubusercontent.com/adafruit/Raspberry-Pi-Installer-Scripts/master/raspi-blinka.py
sudo apt-get install python3-dev
sudo python3 raspi-blinka.py
```

Jeśli pojawią się jakieś monity, wybierz tak (Y), a następnie kliknij ponowne uruchomienie na koniec.

##### Upewnij się, że Twój wyświetlacz jest widoczny.

Łączność I2C, która jest wymagana do komunikacji z wyświetlaczem, powinna zostać aktywowana przez poprzedni skrypt instalacyjny. Możesz zweryfikować, czy jest włączona i czy Twój Pi może wykryć podłączony wyświetlacz, wykonując poniższe polecenie:

```bash
sudo i2cdetect -y 1
```

Następnie powinna pojawić się tabela z pojedynczym zestawem znaków (zwykle 3c dla tych wyświetlaczy), podobna do poniższej. Ten kod wskazuje adres I2C Twojego wyświetlacza.

Jeśli się nie pojawił, albo okablowanie jest nieprawidłowe, albo komunikacja I2C nie jest włączona, co można zrobić za pomocą narzędzia konfiguracyjnego. Jeśli zobaczysz tabelę wypełnioną znakami (wszystkie adresy są wyświetlane), najprawdopodobniej popełniłeś błąd w okablowaniu, ponieważ dzieje się to, gdy SDA jest zwarty do masy. Po ponownym uruchomieniu wróć i sprawdź ponownie połączenia z Pi i wyświetlaczem, a także czy komunikacja I2C jest włączona.

Użyj narzędzia konfiguracyjnego i wpisz następujące polecenie, aby włączyć komunikację I2C:

```bash
sudo raspi-config
```

Jeśli na tym etapie nie uzyskasz odpowiedniej odpowiedzi, przestań próbować uruchomić skrypt. Twój Raspberry Pi nie będzie w stanie komunikować się z podłączonym wyświetlaczem, aby cokolwiek wyświetlić, jeśli nie może go zobaczyć.

##### Zainstaluj skrypt wyświetlacza OLED Stats

Następnie należy zainstalować biblioteki CircuitPython związane z wyświetlaczem. Wprowadź następujące polecenia, aby rozpocząć:

```bash
sudo pip3 install adafruit-circuitpython-ssd1306
sudo apt-get install python3-pil
```

Pozostaje już tylko pobranie samego skryptu. Ponieważ udostępniłem go na Githubie w gotowej formie, zamiast próbować edytować go na Raspberry Pi, wystarczy, że wykonasz poniższą linię, aby skopiować go na swoje Pi:

```bash
git clone https://github.com/mklements/OLED_Stats.git
```

Teraz wpisz poniższe polecenie, aby wejść do katalogu, który już sklonowałeś:

```bash
cd OLED_Stats
```

Następnie uruchom skrypt, wpisując:

```bash
python3 stats.py
```

##### Uruchamianie skryptu automatycznie przy starcie

Teraz, kiedy wyświetlacz działa, chcielibyśmy, aby robił to automatycznie przy starcie komputera, ponieważ przestanie, gdy zamkniemy okno terminala. Użyjemy do tego crontab.

Wprowadź następujące polecenie, aby uruchomić crontab:

```bash
crontab -e
```

Jeśli otwierasz crontab po raz pierwszy, zostaniesz poproszony o wybranie edytora; wybierz 1 i naciśnij enter.

Aby uruchomić skrypt, dodaj poniższą linię na końcu pliku:

```bash
@reboot sudo python3 /home/username/stats.py &
```

Pamiętaj, aby dodać "&" na końcu, aby poinstruować Pi, aby kontynuowało rozruch i jednocześnie uruchamiało skrypt.

Skrypt stats.py oraz czcionkę również trzeba skopiować do katalogu domowego. Można bezpośrednio odwołać się do prawidłowej ścieżki w poprzednim kroku, ale uważam to za mniej niezawodne.

Upewnij się, że skopiujesz czcionkę PixelOperator oraz skrypt stats.py do katalogu /home/username.

```bash
cd OLED_Stats
cp PixelOperator.ttf ~/PixelOperator.ttf
cp stats.py ~/stats.py
cp fontawesome-webfont.ttf ~/fontawesome-webfont.ttf
```

Jeśli zdecydujesz się zostawić je w pobranym katalogu, musisz zmienić polecenie crontab tak, aby brzmiało:

```bash
@reboot cd /home/username/OLED_Stats && sudo python3 stats.py &
```

Kiedy skończysz, zapisz plik crontab, a następnie zrestartuj swoje Pi, aby sprawdzić, czy wszystko działa jak należy.

Jeśli wykonałeś dokładnie te kroki, powinieneś teraz mieć funkcjonalny wyświetlacz statystyk OLED, który uruchamia się za każdym razem, gdy twój Raspberry Pi się uruchamia. Jeśli jeszcze tego nie zrobiłeś, możesz teraz umieścić go w obudowie.

##### Jak włączyć i wyłączyć OLED

Utwórz dwa skrypty bash w katalogu OLED_Stats:

```bash
cd OLED_Stats
touch enabler.sh killer.sh
```

Teraz edytuj skrypt killer:

```bash
vim killer.sh
```

I wpisz do niego poniższą zawartość:

```bash
#!/bin/bash
cd /root/OLED_Stats
sudo pkill -f stats.py
sudo python3 stats-off.py &
```

Następnie edytuj skrypt enabler:

```bash
vim enabler.sh
```

I wpisz do niego poniższą zawartość:

```bash
#!/bin/bash
cd /root/OLED_Stats
sudo pkill -f stats-off.py
sudo python3 stats.py &
```

Teraz skopiuj skrypt stats.py do nowego pliku

```bash
cp stats.py stats-off.py
```

Edytuj skrypt stats-off.py

```bash
vim stats-off.py
```

I zmień poniższą sekcję:

```python
    # Pi Stats Display
    draw.text((0, 0), "IP: " + str(IP,'utf-8'), font=font, fill=255)
    draw.text((0, 16), str(CPU,'utf-8') + "LA", font=font, fill=255)
    draw.text((80, 16), str(Temp,'utf-8') , font=font, fill=255)
    draw.text((0, 32), str(MemUsage,'utf-8'), font=font, fill=255)
    draw.text((0, 48), str(Disk,'utf-8'), font=font, fill=255)
```

na to:

```python
    # Pi Stats Display
    draw.text((0, 0), "IP: " + str(IP,'utf-8'), font=font, fill=0)
    draw.text((0, 16), str(CPU,'utf-8') + "LA", font=

font, fill=0)
    draw.text((80, 16), str(Temp,'utf-8') , font=font, fill=0)
    draw.text((0, 32), str(MemUsage,'utf-8'), font=font, fill=0)
    draw.text((0, 48), str(Disk,'utf-8'), font=font, fill=0)
```

Zapisz i wyjdź.

Proszę podziel się swoimi przemyśleniami na temat tego samouczka w poniższym miejscu. Podziel się swoimi przemyśleniami i rekomendacjami ze mną.