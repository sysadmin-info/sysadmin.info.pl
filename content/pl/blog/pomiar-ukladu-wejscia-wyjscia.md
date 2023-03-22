---
title: "Pomiar układu wejścia/wyjścia"
date: 2019-12-23T16:55:46+00:00
description: "Pomiar układu wejścia/wyjścia"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧 
pinned: false
tags:
- netstat
- iostat
- lsof
series:
-
categories:
- Linux
image: images/2019-thumbs/linux-cli.webp
---
Aby monitorować zachowanie systemu, należy rozpocząć od utworzenia linii bazowej, która reprezentuje normalne zachowanie systemu. Możesz to zrobić za pomocą narzędzia takiego jak polecenie sar. Następnie możesz użyć takich narzędzi jak netstat, iostat, lsof, w i uptime do monitorowania zachowania systemu, porównując wyniki z poziomem bazowym w celu określenia, czy system ma problemy.

**netstat**

```
-g // do wyświetlania informacji o przynależności do grup multicastowych IPv4 i IPv6
-i // aby zwrócić informacje, w tym określone wartości właściwości, dla wszystkich podłączonych urządzeń sieciowych
-r // do wyświetlania informacji o tabelach routingu jądra
-s // aby wymienić podsumowanie statystyk dla każdego protokołu sieciowego
-p // aby wymienić, które procesy korzystają z których portów
-t // aby zwrócić szczegóły tylko dla połączeń, które wykorzystują TCP
```

Uwaga: netstat -r został zastąpiony przez trasę -e

**iostat**  
Polecenie to służy do monitorowania wydajności urządzeń wejściowych i wyjściowych systemu lub urządzeń we/wy, a także wykorzystania procesora. Polecenie mierzy czas, przez jaki urządzenie pracuje i porównuje go do jego średniej prędkości transferu.

Przy pierwszym uruchomieniu komenda zwraca statystyki za okres od momentu uruchomienia systemu. Każdy kolejny raport zawiera statystyki za okres od momentu utworzenia poprzedniego raportu.

Gdy iostat jest wykonywany bez argumentów, zwraca statystyki procesora, takie jak procenty pojemności procesora wykorzystane przez użytkownika i przez procesy systemowe oraz procent czasu, w którym procesor jest bezczynny. Zwraca również statystyki dotyczące partycji dyskowej dołączonej do systemu, takie jak transfery na sekundę i kilobajty odczytane i zapisane.

```
-c // aby wyświetlić raport wykorzystania procesora
-d // aby wyświetlić raport o wykorzystaniu urządzenia
-z // aby pominąć informacje dla urządzeń, które były nieaktywne podczas wykonywania polecenia
-p // aby określić urządzenie do raportowania
count - określa ilość razy do wykonania polecenia
interwał - określa liczbę sekund oczekiwania pomiędzy raportami.
```

Przykład:
```
iostat -p sda
```

**lsof**  
Aby wyświetlić listę plików i katalogów, które każdy ostatnio zalogowany użytkownik ma otwarte.

```
-i // aby zwrócić pliki, których adresy internetowe są zgodne z określonym portem lub zakresem portów, nazwą usługi lub adresem IP.
-u // aby określić użytkownika lub identyfikator użytkownika, dla którego chcesz zwrócić listę otwartych plików
-p // aby wybrać lub usunąć określony identyfikator procesu z zwracanej listy
-F // do wytworzenia wyjścia do manipulacji przez inny program
+d // aby przeszukać wszystkie otwarte instancje nazwanego katalogu oraz jego pliki najwyższego poziomu i katalogi pod kątem otwartych plików.
```

Przykład:
```
lsof -u uzytkownik1
```

**w**  
Zwraca szczegóły dotyczące użytkowników, którzy są zalogowani do systemu i procesów, które realizują.

```
-h // aby zapobiec wyświetlaniu nagłówka
-u // do ignorowania nazw użytkowników podczas określania czasu procesu i CPU
-s // aby użyć krótkiego formatu zamiast wyświetlania wszystkich informacji
-f // aby wyświetlić z pola
-V // do wyświetlania informacji o wersji
-user // do wyświetlania informacji tylko dla określonego użytkownika
```

**uptime**  
Polecenie uptime dostarcza informacji o tym, jak długo system działał od ostatniego restartu.

Podobnie jak polecenie w, również podaje liczbę użytkowników zalogowanych oraz średnie obciążenia z jednej minuty, pięciu minut i 15 minut.

```
-V // aby wyświetlić informacje o wersji
```

### Narzędzia do monitorowania wykorzystania zasobów

  * MRTG (Multi Router Traffic Grapher)
  * Cacti
  * Nagios
  * demon collectd &#8211; wymaga do działania Apache lub Nginx

Użycie collectd:
```
cp -r /contrib/collection3 /var/www/html
cd /var/www/html/collection3/
```
