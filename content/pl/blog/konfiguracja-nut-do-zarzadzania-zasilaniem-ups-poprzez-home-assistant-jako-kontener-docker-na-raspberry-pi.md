---
title: Konfiguracja NUT do zarządzania zasilaniem UPS poprzez Home Assistant jako kontener Docker na Raspberry Pi
date: 2022-06-28T14:17:34+00:00
description: Konfiguracja NUT do zarządzania zasilaniem UPS poprzez Home Assistant jako kontener Docker na Raspberry Pi
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
cover:
    image: images/2022-thumbs/raspberry_pi_nut.webp
---

Głównym celem projektu Network UPS Tools (NUT) jest zapewnienie wsparcia dla Urządzeń Zasilających, takich jak Zasilacze UPS, Jednostki Dystrybucji Zasilania, Automatyczne Przełączniki Transferu, Jednostki Zasilające i Kontrolery Solarne. NUT dostarcza wspólny protokół i zestaw narzędzi do monitorowania i zarządzania tymi urządzeniami oraz jednolite nazewnictwo równoważnych funkcji i punktów danych, niezależnie od szerokiego zakresu protokołów dostawców i typów mediów komunikacyjnych.

{{< youtube QA3jdLkJhJg >}}
<figcaption>Konfiguracja NUT do zarządzania zasilaniem UPS poprzez Home Assistant jako kontener Docker na Raspberry Pi</figcaption>

Wideo opisuje konfigurację NUT oraz jak zainstalować Docker, Docker Compose i uruchomić Home Assistant jako kontener Docker. Dodatkowo prezentuję, jak wyłączyć router Mikrotik z Raspberry Pi, jeśli poziom naładowania baterii jest niski.

Zdecydowałem się "promować" to wideo jako doskonały przykład krok po kroku, jak zainstalować i skonfigurować NUT na Raspberry Pi.

{{< youtube vyBP7wpN72c >}}
<figcaption>Network UPS Tools - Przewodnik Ultimate</figcaption>

Dokumentacja NUT: <a href="https://networkupstools.org/docs/man/" target="_blank" rel="noreferrer noopener">https://networkupstools.org/docs/man/</a>

Używam tego UPS: UPS Green Cell AiO 600VA 360W

{{< youtube VqXZo2aepnM >}}
<figcaption>Zasilacz awaryjny UPS firmy Green Cell</figcaption>

Więcej informacji można znaleźć na stronie producenta: <a href="https://greencell.global/en/for-rtv-and-household-appliances/1090-ups-green-cell-aio-600va-360w.html" target="_blank" rel="noreferrer noopener">https://greencell.global/en/for-rtv-and-household-appliances/1090-ups-green-cell-aio-600va-360w.html</a>

Utworzyłem użytkownika nut na Mikrotiku i dodatkowo przetestowałem go za pomocą kluczy RSA bez hasła, co w sieci LAN jest wystarczająco bezpieczne. Wystarczy zapisać klucz prywatny i publiczny w formacie openSSH, ale nie najnowszym, a standardowym formacie - mam nadzieję, że wyjaśniłem to dobrze, ponieważ Puttygen pozwala zapisać klucz RSA w nowym formacie openSSH. W każdym razie trzeba wgrać klucz prywatny do plików na Mikrotiku, a następnie w sekcji systemu - użytkownicy zaimportować klucz dla użytkownika. Ale można też użyć zwykłego hasła za pomocą sshpass, tak jak zrobiłem w haśle. Jeśli chcesz używać RSA, musisz usunąć to z skryptu bash: sshpass -f /root/creds

{{< youtube ufOtQ9r7nws >}}
<figcaption>Jak generować klucze RSA na Raspberry Pi i przesyłać je do routera Mikrotik w celu nawiązania połączenia przez ssh.</figcaption>

Wideo opisuje, jak generować klucz RSA, importować go do Mikrotika, a następnie łączyć się przez ssh z Raspberry Pi z routerem Mikrotik.

Wszystkie niezbędne skrypty znajdują się na moim koncie na GitHubie: <a href="https://github.com/sysadmin-info/NUT" target="_blank" rel="noreferrer noopener">https://github.com/sysadmin-info/NUT</a>