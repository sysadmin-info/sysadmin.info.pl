---
title: "Monitorowanie wykorzystania zasobów systemu Linux"
date: 2019-12-23T16:12:05+00:00
description: "Monitorowanie wykorzystania zasobów systemu Linux"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧 
pinned: false
tags:
- top
- ps
- pstree
- sar
- vmstat
- free
series:
-
categories:
- Linux
image: images/2019-thumbs/linux-cli.webp
---
Planowanie wydajności polega na przewidywaniu, jakie będą wymagania dotyczące wydajności systemu w przyszłości i planowaniu, jak te wymagania spełnić. Monitorowanie wykorzystania zasobów systemu jest ważne dla planowania wydajności, ponieważ pozwala ustalić, czy istniejące wykorzystanie zasobów zbliża się do granic wydajności serwera lub maszyny wirtualnej.

W Linuksie można wykorzystać szereg narzędzi do monitorowania wykorzystania zasobów systemowych. Należą do nich polecenia top, ps, pstree, vmstat, sar i free.

**top**

```
-a // sortowanie procesów według przydzielonej pamięci
-b // tryb wsadowy -&gt; wysyłanie wyjścia do pliku lub innego programu
-n // określa ilość razy, ile razy polecenie top powinno zadziałać przed wyjściem
-p // pid lub ID
```

**ps**  
Inaczej niż w przypadku polecenia top, wyjście z polecenia ps nie odświeża się dynamicznie.

```
ps aux
-a // lista procesów uruchamianych przez wszystkich użytkowników, a nie tylko przez bieżącego użytkownika 
-u // szczegółowe informacje o każdym procesie
-x // obejmują procesy bez terminala sterującego, takie jak demony.
```

**pstree**  
Informacje są sformatowane w strukturze drzewa; wątki dziecięce procesów są wymienione pod procesem rodzicielskim i są zamknięte w nawiasach klamrowych 

**sar**  
Raport z aktywności systemu zbiera statystyki aktywności systemu, domyślnie co 10 minut. Dane, które powracają, można wykorzystać do stworzenia bazowego pomiaru wydajności systemu, w celu porównania z wynikami późniejszego monitoringu.

```
-b // wyświetlanie szybkości transferu oraz danych wejściowych i wyjściowych, lub I/O, statystyk
-r // wyświetlanie statystyk dotyczących używanej pamięci
-W // wyświetlanie statystyk wymiany
-u // wyświetlanie statystyk wykorzystania procesora 
&#91;odstęp w sekundach] &#91;licznik określający liczbę linii, które muszą zostać zwrócone na wyjściu]
```

**vmstat**  
Polecenie wyświetlenia statystyk pamięci wirtualnej, które są przydatne do sprawdzenia, czy dostępna jest wystarczająca ilość pamięci dla aplikacji użytkownika.

Bez opcji, polecenie vmstat zwraca pojedynczy raport, który zawiera wartości średnie, na podstawie statystyk zebranych od ostatniego uruchomienia systemu.

Polecenie vmstat można stosować z różnymi opcjami. Można również określić opóźnienie w sekundach, które musi nastąpić przed zgłoszeniem nowego zestawu statystyk oraz wartość zliczania, która określa ilość raportów, które polecenie musi wygenerować.

Składnia:
```
vmstat &#91;opcje] opóźnienie zliczania
```

Przykład:
```
vmstat -n 2 5
```

W tym przykładzie opcja n określa, że informacje w nagłówku powinny być wyświetlane tylko raz. Wartość opóźnienia wynosi 2, więc raporty będą generowane w odstępie dwóch sekund, a wartość licznika wynosi 5, więc polecenie wygeneruje w sumie pięć raportów.

Jeśli ustawiono opóźnienie, ale nie podano wartości zliczania, to polecenie będzie działać aż do jego zabicia.

```
-a // nieaktywne i aktywne statystyki strony
-m // wyświetla slabinfo, czyli informację o wykorzystaniu pamięci na poziomie slab. Jądra Linuksa wykorzystują pule slab do zarządzania pamięcią powyżej poziomu strony. 
-s // do wydrukowania tabeli pamięci wirtualnej
-V // do wyświetlania informacji o wersji
```

**free**  
Polecenie free służy do uzyskiwania statystyk w czasie rzeczywistym dotyczących ilości dostępnej pamięci &#8211; i ilości aktualnie wykorzystywanej &#8211; w systemie.

Bez żadnych opcji, wolna komenda zwraca całkowitą ilość pamięci fizycznej i wirtualnej, która jest używana i która jest obecnie wolna, jak również ilość pamięci, która jest w buforach jądra lub która jest buforowana. Wszystkie statystyki są wyrażone w kilobajtach.

Zauważ, że współdzielona kolumna jest teraz nieaktualna i powinna być ignorowana.

```
-b // aby wyświetlić statystyki w bajtach
-k // do wyświetlania statystyk w kilobajtach
-m // do wyświetlania statystyk w megabajtach
-g // do wyświetlania statystyk w gigabajtach
-o // aby zapobiec wyświetlaniu linii -/+ bufora/ pamięci podręcznej
-l // do wyświetlania szczegółowych statystyk wysokiej i niskiej pamięci
-s // skorzystaj z opcji, po której podaje się czas w sekundach, aby określić jak często statystyki powinny być aktualizowane
-t // aby wyświetlić wiersz podsumowujący, który zawiera sumaryczne informacje
-V // do wyświetlania informacji o wersji
```
