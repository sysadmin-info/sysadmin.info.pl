---
title: Jak podłączyć urządzenie przez moduł z przekaźnikami do Raspberry Pi lub płytki
  CM4 IO
date: 2023-08-01T09:00:00+00:00
description: Jak podłączyć urządzenie przez moduł z przekaźnikami do Raspberry Pi
  lub płytki CM4 IO
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
image: images/2023-thumbs/module-with-relays-raspberry-pi-cm4.webp
---
Przeprowadzę Cię przez kroki instalacji i konfiguracji w tym artykule, abyś mógł używać tego samego modułu z przekaźnikami do połączenia z Raspberry Pi lub płytą CM4 IO.

1. **Oto film instruktażowy; kontynuuj czytanie, aby zobaczyć listę pisemnych instrukcji.**

{{<youtube lrXF7fZe85E>}}


##### Czego potrzebujesz do tego poradnika
* Raspberry Pi 4 lub płyta CM4 IO z modułem Compute Module 4
* Karta Micro SD lub eMMC lub dysk NVMe/SSD
* Zasilacz odpowiedni do Raspberry Pi lub płyty CM4 IO.
* Moduł z dwoma przekaźnikami
* Zasilacz do modułu z przekaźnikami
* 3 kable jumper żeńskie do żeńskich
* 2 kable jumper żeńskie do męskich
* 7 kabli jumper męskich do męskich


##### Ćwiczenia do wykonania:
1. Połącz przewody zgodnie ze schematem pomiędzy modułem z przekaźnikami a Raspberry Pi / płytą CM4 IO.
2. Użyj skryptu Pythona do testowania modułu z przekaźnikami.
3. Sprawdź, czy moduł działa zgodnie z oczekiwaniami.

##### Wprowadzenie

Zdecydowałem się połączyć pompę i wentylator za pomocą modułu z dwoma przekaźnikami, aby móc je kontrolować, ponieważ sterowanie pompą 5V nie jest możliwe, ponieważ nie jest to urządzenie PWM, a sterowanie wyłącznie wentylatorem Noctua 5V z PWM nie miało dla mnie większego sensu. Gdy temperatura wzrośnie powyżej ustalonego progu (na przykład 50 stopni Celsjusza), chciałem, aby oba urządzenia się włączyły, a chciałem, aby się wyłączyły, gdy temperatura spadnie poniżej ustalonego progu.

##### Moduł z 2 przekaźnikami - szczegóły techniczne.

[Moduł przekaźnika 2-kanałowego z optoizolacją - kontakty 10A/250VAC - cewka 5V](https://botland.store/relays/2170-relay-2-channel-module-with-optoisolation--5904422359126.html)

##### Rozkład pinów GPIO

[Rozkład pinów GPIO Raspberry Pi](https://pinout.xyz/)

[Rozkład pinów GPIO płyty CM4 IO](https://pi4j.com/1.3/pins/rpi-cm4.html)

##### Okablowanie

![moduł z przekaźnikami - okablowanie](/images/2023/wiring.webp "moduł z przekaźnikami - okablowanie")
<figcaption>moduł z przekaźnikami - okablowanie</figcaption>

{{< notice success "Ważne informacje" >}}
Z uwagi na to, że moje GND będzie stanem niskim (logicznym zerem) z PINów GPIO, nie podłączam GND z Raspberry Pi / CM4 IO.
{{< /notice >}}

{{< notice success "jumper hat" >}}
Zasilanie obwodu jest tworzone przez jumper (zworę) łączącą JD-VCC z VCC oraz zasilanie optoizolatora z zasilaniem cewki przekaźnika. Możemy izolować obwód Raspberry Pi / CM4 od obwodu sterowania przekaźnikiem, jeśli usuniemy tę zworę. Należy wtedy podłączyć czerwony przewód z zewnętrznego źródła zasilania 5V do JD-VCC. Zwora powinna pozostać na miejscu, jeśli nie chcę używać zewnętrznego źródła zasilania dla przekaźników, ponieważ powoduje to zwiększenie obciążenia linii 5V Raspberry Pi / CM4 i powoduje (niewielkie

) zakłócenia podczas przełączania przekaźników.
{{< /notice >}}

##### Skrypt Pythona testujący moduł

```python
# pobieranie głównej biblioteki GPIO
import RPi.GPIO as GPIO
# pobieranie biblioteki czasu
import time

# ustawienie aktualnego trybu
GPIO.setmode(GPIO.BCM)
# usunięcie ostrzeżeń
GPIO.setwarnings(False)
# utworzenie listy (tablicy) z numerami używanych GPIO
pins = [12,13] 

# ustawienie trybu dla wszystkich pinów, aby wszystkie były włączone
GPIO.setup(pins, GPIO.OUT)

# pętla for, gdzie pin = 12 następnie 13
for pin in pins :
        # ustawienie GPIO na HIGH lub 1 lub true
        GPIO.output(pin,  GPIO.HIGH)
        print("GPIO HIGH")
        # odczekaj 5 sekund
        time.sleep(5)
        print("sleep")
        # ustawienie GPIO na LOW lub 0 lub false
        GPIO.output(pin,  GPIO.LOW)
        print("GPIO LOW")
        # odczekaj 5 sekund
        time.sleep(5)
        print("sleep")

        # Sprawdzenie, czy aktualny przekaźnik działa i wyświetlenie tego
        if not GPIO.input(pin) : 
                print("Pin "+str(pin)+" działa")


# to samo, ale różnica polega na tym, że mamy
# pętlę for, gdzie pin = 12 następnie 13
# w odwrotnej kolejności
print("Wstecz")
for pin in reversed(pins) :
        GPIO.output(pin,  GPIO.HIGH)
        print("GPIO HIGH")
        time.sleep(5)
        print("sleep")

        GPIO.output(pin,  GPIO.LOW)
        print("GPIO LOW")
        time.sleep(5)
        print("sleep")


# oczyszczenie wszystkich GPIO
GPIO.cleanup()
print("Oczyszczenie GPIO")
print("Zamknięcie wszystkich przekaźników")
```

##### Uruchomienie skryptu

```bash
python3 relay.py
```

##### Problemy opisane podczas procedury prototypowania.

Problem niedonapięcia i przegrzewania pojawia się, gdy podłączamy więcej urządzeń - w moim przypadku wentylatory - do pinów GPIO Raspberry Pi / CM4, gdy mam podłączone dwa urządzenia przez moduł z przekaźnikami. Ekran podłączony przez HDMI staje się ciemny (obraz znika). Upewnij się, że jest odpowiednio zasilany i że to zachowanie jest normalne.

##### Ostateczna wersja skryptu

```python
#!/usr/bin/python3
# pobieranie biblioteki os
import os
# pobieranie głównej biblioteki GPIO
import RPi.GPIO as GPIO
# pobieranie biblioteki czasu
import time
# pobieranie biblioteki datetime
import datetime
# pobieranie biblioteki sys
import sys

# */1 * * * * cd /home/nazwa_użytkownika/ && sudo python3 relay.py
# Co minutę, crontab będzie sprawdzać temperaturę.
# Skrypt uruchomi wentylator i pompę, jeśli temperatura
# wzrośnie powyżej 31 stopni Celsjusza i będzie to kontynuować,
# aż spadnie poniżej 29 stopni Celsjusza. Skrypt następnie się zakończy,
# wyłączając jednocześnie wentylator i pompę. Poprzedni skrypt zakończy się,
# jeśli zostanie uruchomiony, podczas gdy nowy jest w trakcie działania,
# pozostawiając Pi/CM4 w piekle i niezdolnym do zejścia poniżej liczby ACTION_END.

# Zidentyfikuj piny obsługujące przekaźniki.
FAN_PIN = 12 # GPIO dla wentylatora
PUMP_PIN = 13 # GPIO dla pompy
PINS = [FAN_PIN, PUMP_PIN] # Tablica do obsługi wentylatora i pompy

# Ustaw progi temperatury.
ACTION_START = 31
ACTION_END = 29

# Pobierz jaką akcję. Jeśli ręcznie włączasz/wyłączasz wentylator i pompę
action = sys.argv.pop()


def GPIOsetup():
	# usuwanie ostrzeżeń
    GPIO.setwarnings(False)
    # ustawianie aktualnego trybu
    GPIO.setmode(GPIO.BCM)
    # pętla for, gdzie pin = 12, następnie 13
    for pin in PINS:
        # ustawianie trybu dla wszystkich pinów, więc wszystkie zostaną włączone
        GPIO.setup(pin, GPIO.OUT)

def devicesON():
	GPIOsetup()
	for pin in PINS:
		GPIO.output(pin, GPIO.LOW)	#wentylator i pompa włączone. Ustawienie GPIO na LOW lub 0 lub false
	return()

def devicesOFF():
	GPIOsetup()
	for pin in PINS:
		GPIO.output(pin, GPIO.HIGH) #wentylator i pompa wyłączone. Ustawienie GPIO na HIGH lub 1 lub true
	return()

# Pobierz temperaturę z systemu
def get_temp_from_system():
	res = os.popen('vcgencmd measure_temp').readline()
	return(res.replace("temp=","").replace("'C\n",""))

def check_devices():
	GPIOsetup()
	return all(GPIO.input(pin) for pin in PINS)

def run():
	current_date = datetime.datetime.now()
	temp = get_temp_from_system()
	if float(temp) >= ACTION_START:
		print(temp+' @ '+str(current_date))
		if check_devices():
			print('Wentylator i pompa są wyłączone... Włączam je.')
			devicesON()
		else:
			print('Wentylator i pompa są włączone')
	elif float(temp) <= ACTION_END:
		print(temp+' @ '+str(current_date))
		if not check_devices():
			print('Wentylator i pompa są włączone... Wyłączam je.')
			devicesOFF()
			GPIO.cleanup()
			return 1
		else:
			print('Wentylator i pompa są wyłączone')
	else:
			pass 
			
			
if action == "on" :
   print('Włączam wentylator i pompę')
   devicesON()
elif action == "off" :
   print('Wyłączam wentylator i pompę')
   devicesOFF()

# najpierw sprawdź, czy skrypt już działa
if not check_devices():
	print('Wentylator i pompa są włączone, skrypt musi działać z innej instancji...')
else:
	temp = get_temp_from_system()
	if float(temp) < ACTION_START:
		print('Pi/CM4 działa w normalnych temperaturach.')
	else:
		try:
			while(True):
				tmp = run()
				if tmp == 1: 
					break
		except KeyboardInterrupt:
			devicesOFF()


			GPIO.cleanup()
		finally:
			devicesOFF()
			GPIO.cleanup()
```

##### Uruchamianie Skryptu Automatycznie Podczas Startu

Teraz, kiedy skrypt działa, chcielibyśmy, aby robił to automatycznie, gdy komputer się uruchamia, ponieważ przestanie działać, jak tylko zamkniemy okno terminala. Użyjemy do tego crontab.

Wpisz następujące polecenie, aby uruchomić crontab:

```bash
crontab –e
```

Jeśli otwierasz crontab po raz pierwszy, zostaniesz poproszony o wybranie edytora; wybierz 1 i naciśnij enter.

Aby wykonać skrypt, dołącz następującą linię na końcu pliku:

```bash
*/1 * * * * cd /home/nazwa_użytkownika && sudo python3 relay.py
```

Gdy skończysz, zapisz plik crontab, a następnie zrestartuj Pi/CM4, aby sprawdzić, czy wszystko działa jak należy.

Jeśli postępowałeś dokładnie według instrukcji, powinieneś teraz mieć funkcjonalny moduł z przekaźnikami, który uruchamia się za każdym razem, gdy Raspberry Pi / CM4 się uruchamia. Jeśli jeszcze tego nie zrobiłeś, możesz od razu umieścić go w swojej obudowie.

Proszę podziel się swoimi przemyśleniami na temat tego poradnika w przestrzeni poniżej. Proszę podziel się swoimi przemyśleniami i rekomendacjami ze mną.
```