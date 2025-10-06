---
title: Odkrywanie API Taiko dla zautomatyzowanych testów w przeglądarkach
date: 2024-05-11T16:00:00+00:00
description: Odkrywanie API Taiko dla zautomatyzowanych testów w przeglądarkach
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Taiko
categories:
- Taiko
- Gauge
- Node.js
- npm
cover:
    image: images/2024-thumbs/taiko02.webp
---

[Repozytorium Taiko](https://github.com/getgauge/taiko)
[API Taiko](https://docs.taiko.dev/)

1. **Oto samouczek wideo**

{{<youtube Tk5eCTpO0rA>}}

Witamy w tym samouczku, w którym zgłębimy możliwości API Taiko. Taiko to biblioteka Node.js zaprojektowana do automatyzacji przeglądarek internetowych z jasnym i zwięzłym API. W tej sesji użyjemy interaktywnego pętli Read-Eval-Print Loop (REPL) Taiko, aby zbadać i zademonstrować, jak skutecznie używać różnych funkcji API.

#### **Rozpoczęcie**

Przed rozpoczęciem upewnij się, że masz zainstalowane Taiko. Jeśli jeszcze nie zainstalowałeś Taiko, możesz to zrobić, postępując zgodnie z moim poprzednim samouczkiem.

[Konfiguracja i uruchamianie automatycznych testów przeglądarkowych z użyciem Taiko i Gauge w Visual Studio Code](/en/blog/konfiguracja-i-uruchamianie-automatycznych-testow-przegladarkowych-z-uzyciem-taiko-i-gauge-w-visual-studio-code)

To zainstaluje Taiko oraz niezbędne komponenty do rozpoczęcia.

#### **Uruchamianie REPL Taiko**

Aby zacząć eksplorować API Taiko, musimy uruchomić REPL. Otwórz swoje terminal i wpisz:

```bash
npx taiko
```

To polecenie otworzy wiersz poleceń Taiko, gdzie możesz zacząć wpisywać komendy Taiko bezpośrednio.

#### **Eksploracja funkcji API**

Gdy znajdziesz się w REPL, możesz wylistować wszystkie dostępne funkcje API, wpisując:

```javascript
.api
```

To wyświetli listę wszystkich poleceń, które możesz użyć, wraz z ich krótkimi opisami.

##### **Szczegółowe informacje o funkcji**

Aby uzyskać więcej informacji o konkretnej funkcji, takich jak przykłady użycia i parametry, użyj polecenia `.api` po którym następuje nazwa funkcji. Przyjrzyjmy się kilku kluczowym funkcjom:

- **Goto**
  
  ```javascript
  .api goto
  ```
  
  Użyj funkcji `goto`, aby przejść do URL. Oto jak możesz jej użyć:

  ```javascript
  goto('https://google.com')
  ```

- **Click**
  
  ```javascript
  .api click
  ```
  
  Funkcja `click` służy do symulowania kliknięć myszą na elementach. Na przykład:

  ```javascript
  click('Zaloguj się')
  ```

- **Write**
  
  ```javascript
  .api write
  ```
  
  `write` służy do wpisywania tekstu w pola wejściowe:

  ```javascript
  write('hello@taiko.dev', into(textBox({placeholder: 'Email'})))
  ```

- **Evaluate**
  
  ```javascript
  .api evaluate
  ```
  
  Użyj `evaluate` do wykonania niestandardowego kodu JavaScript na stronie:

  ```javascript
  evaluate(() => document.title)
  ```

#### **Łączenie poleceń**

Teraz połączmy kilka tych poleceń, aby wykonać sekwencję działań, które prawdziwy użytkownik mógłby wykonać:

1. Otwórz przeglądarkę i przejdź na stronę internetową.
2. Wyszukaj termin.
3. Kliknij na wynik wyszukiwania.

Oto jak to wygląda w REPL:

```javascript
await openBrowser();
await goto('https://google.com');
await write('automatyzacja testów Taiko', into(textBox({id: 'search'})));
await click('Szukaj w Google');
await click(link('Taiko GitHub'));
```

#### **Generowanie skryptu**

Po zakończeniu sekwencji poleceń w REPL możesz wygenerować skrypt używając polecenia `.code`. Jest to przydatne do zapisania sesji jako wykonywalnego skryptu:

```javascript
.code
```

#### **Zakończenie**

Ten samouczek omówił, jak interaktywnie eksplorować i używać API Taiko do automatyzacji przeglądarki. Dzięki zrozumieniu tych funkcji możesz napisać bardziej solidne i łatwe do utrzymania skrypty automatyzujące przeglądarkę.

Zachęcam do eksperymentowania z innymi funkcjami API i eksploracji bardziej złożonych interakcji na własną rękę. Powodzenia w testowaniu!