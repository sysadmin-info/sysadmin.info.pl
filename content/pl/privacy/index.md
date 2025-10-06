---
title: "Polityka prywatności"
date: 2019-09-21T19:24:59+00:00
description: "Polityka prywatności"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
tags:
-
series:
-
categories:
- general
cover:
  image: images/2019-thumbs/privacy.webp
---

#### Polityka prywatności

Ta strona (sysadmin.info.pl) to statyczny serwis zbudowany w Hugo. **Nie** prowadzimy kont użytkowników, **nie** oferujemy rejestracji ani newslettera i **nie** zbieramy adresów e-mail na tej stronie. Nie przetwarzamy, nie udostępniamy i nie wykorzystujemy danych użytkowników do celów marketingowych. To wprost ma wzmocnić prywatność i ograniczyć powierzchnię danych.

#### Komentarze (utteranc.es / GitHub)

Komentarze działają przez **utteranc.es**, które zapisuje każdy komentarz jako **Issue na GitHubie** w repozytorium. Logowanie i tożsamość obsługuje **GitHub**. Ta strona nie otrzymuje Twojego adresu e-mail, hasła ani tokenów i nie zarządza profilami komentujących. Chcąc edytować lub usunąć komentarz, użyj narzędzi GitHuba.

Warto zauważyć istotny niuans: administratorem danych komentarzy jest GitHub; sysadmin.info.pl jedynie osadza widżet dyskusji.

#### RODO i ustawienia prywatności Hugo

Korzystamy z ustawień prywatności Hugo, aby ograniczyć śledzenie:

```
privacy:
  disqus:
    disable: true
  googleAnalytics:
    anonymizeIP: true
    disable: true
    respectDoNotTrack: true
    useSessionStorage: true
  instagram:
    disable: true
    simple: true
  x:
    disable: true
    enableDNT: true
    simple: true
  vimeo:
    disable: true
    enableDNT: true
    simple: true
  youtube:
    disable: false
    privacyEnhanced: false
```

Warto zauważyć: `youtube.privacyEnhanced: true` używa `youtube-nocookie.com`, co pomaga wzmocnić prywatność przy osadzonych filmach.

#### Co może być logowane podczas wizyty

Jak w każdym serwisie, nasz hosting/CDN może rejestrować techniczne logi na potrzeby bezpieczeństwa i działania serwisu, m.in.:

- przeglądarka i wersja
- preferencje językowe
- strona odsyłająca (referrer)
- data/godzina żądania
- adres IP źródła

**Cel i podstawa prawna:** bezpieczeństwo, zapobieganie nadużyciom, wydajność (uzasadniony interes). Nie próbujemy identyfikować użytkowników ani ich profilować. Logi przechowujemy tylko tak długo, jak to potrzebne do działania i ochrony serwisu, po czym są kasowane lub agregowane. W przypadku nadużyć możemy tymczasowo blokować wybrane IP.

#### Pliki cookie

- **Własne:** sama strona nie ustawia ciasteczek marketingowych. Hugo domyślnie nie dodaje ciasteczek śledzących.
- **Osadzone usługi:** wyświetlanie widżetu komentarzy (iframe utteranc.es/GitHub) lub odtwarzanie filmów z YouTube może powodować ustawienie ciasteczek lub użycie local storage zgodnie z zasadami tych dostawców. Zarządzaj tym w ustawieniach przeglądarki lub na stronach prywatności dostawców.

Ten niuans jest ważny: ciasteczka i storage dostawców zewnętrznych nie są pod kontrolą sysadmin.info.pl.

#### Dane osobowe

Nie zbieramy celowo danych osobowych na tej stronie. Jeśli komentujesz przez GitHub/utteranc.es, treść komentarza i Twój profil przetwarza **GitHub**.

#### Treści zewnętrzne i linki

Opinie w komentarzach należą do ich autorów. Nie odpowiadamy za treści, polityki ani dostępność usług stron trzecich. Linki zewnętrzne mogą zmieniać się bez zapowiedzi.

#### Prawa autorskie

Oryginalne materiały na sysadmin.info.pl są chronione prawem autorskim ich twórców. Kopiowanie lub udostępnianie wymaga zgody autora oraz administratora serwisu.

#### Twoje prawa

Ponieważ nie utrzymujemy kont ani newslettera, typowe wnioski RODO zwykle dotyczą danych u dostawców zewnętrznych (np. GitHub dla komentarzy, YouTube dla odtwarzania). Skontaktuj się z tymi podmiotami, aby zrealizować swoje prawa w ich usługach. Jeśli uważasz, że przechowujemy Twoje dane osobowe poza tymczasowymi logami, skontaktuj się z nami i pomożemy je odkryć i usunąć, jeśli to zasadne.

#### Kontakt

W sprawach prywatności dotyczących wyłącznie sysadmin.info.pl (nie GitHuba/YouTube) skorzystaj z sekcji kometarzy na stronie poniżej. 