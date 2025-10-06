---
title: Pisanie pierwszego testu AWX od podstaw z Gauge i Taiko w Visual Studio Code
date: 2024-05-12T12:00:00+00:00
description: Pisanie pierwszego testu AWX od podstaw z Gauge i Taiko w Visual Studio Code
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
    image: images/2024-thumbs/taiko03.webp
---

[Repozytorium Taiko](https://github.com/getgauge/taiko)
[Dokumentacja API Taiko](https://docs.taiko.dev/)

1. **Oto wideo instruktażowe**

{{<youtube YwfnjKwf-HI>}}

Przyjrzymy się tutorialowi, skupiając się specjalnie na używaniu Visual Studio Code z rozszerzeniami JavaScript Gauge, ESLint i Babel do uruchamiania i zarządzania testem. Dostosowanie to wyrówna tutorial z Twoją prezentacją wideo, która pokazuje wykonanie konfiguracji i testów bezpośrednio z Visual Studio Code.

---

### **Tworzenie i uruchamianie automatycznych testów w AWX z Gauge i Taiko w Visual Studio Code**

Witamy w tym szczegółowym tutorialu, w którym stworzymy i uruchomimy automatyczny test logowania do interfejsu zarządzania AWX za pomocą Gauge i Taiko w Visual Studio Code. Poradnik przeprowadzi Cię przez konfigurację środowiska testowego, tworzenie plików spec i JavaScript oraz wykonanie testu – wszystko w Visual Studio Code.

#### **Wymagania wstępne**
Upewnij się, że masz zainstalowane:
- Node.js
- Gauge
- Taiko
- Visual Studio Code z rozszerzeniami Gauge, ESLint i Babel JavaScript

#### **Krok 1: Skonfiguruj środowisko Visual Studio Code**
1. **Otwórz Visual Studio Code** i stwórz nowy folder projektu o nazwie `awx-tests`.
2. **Otwórz terminal** w Visual Studio Code, wybierając `Terminal` > `Nowy terminal` z górnego menu.
3. Zainicjuj projekt JavaScript Gauge w tym folderze, wykonując:

```bash
gauge init js
```
To polecenie tworzy podstawową strukturę projektu z przykładowymi specyfikacjami i pomocniczymi plikami, które są użytecznymi punktami wyjścia.

#### **Krok 2: Przeglądaj i modyfikuj przykładowe pliki**
Przejrzyj pliki w oknie Explorer w Visual Studio Code. Spójrz na przykładowe pliki spec i JavaScript, aby zrozumieć podstawy interakcji Gauge i Taiko.

#### **Krok 3: Stwórz nowy plik specyfikacji**
1. **Stwórz nowy plik** o nazwie `test-awx.spec` w katalogu `specs`.
2. **Zdefiniuj specyfikację** z scenariuszem opisującym kroki logowania do AWX:

```markdown
# Test logowania AWX

do wykonania tej specyfikacji użyj
npm test

To jest krok kontekstowy, który wykonuje się przed każdym scenariuszem
* Otwórz stronę AWX

## Logowanie do AWX
* Zaloguj się za pomocą danych "admin":"password"
___
* Wyczyść wszystkie zadania
```

#### **Krok 4: Zaimplementuj kroki w JavaScript**

Stwórz odpowiadający plik JavaScript o nazwie `awx-steps.js.js` w katalogu `tests`:

1. **Skonfiguruj niezbędne importy** i adnotacje Gauge:

```javascript
/* globals gauge*/
"use strict";
const path = require('path');
const {
    openBrowser,
    write,
    closeBrowser,
    goto,
    press,
    screenshot,
    above,
    click,
    checkBox,
    listItem

,
    toLeftOf,
    link,
    text,
    into,
    textBox,
    evaluate
} = require('taiko');
const assert = require("assert");
const headless = process.env.headless_chrome.toLowerCase() === 'true';
```

2. **Zdefiniuj zachowania przed i po teście**:

```javascript
beforeSuite(async () => {
    await openBrowser({
        headless: headless
    })
});

afterSuite(async () => {
    await closeBrowser();
});

// Zwróć nazwę pliku ze zrzutem ekranu
gauge.customScreenshotWriter = async function () {
    const screenshotFilePath = path.join(process.env['gauge_screenshots_dir'],
        `screenshot-${process.hrtime.bigint()}.png`);

    await screenshot({
        path: screenshotFilePath
    });
    return path.basename(screenshotFilePath);
};
```

3. **Napisz kroki testowe** na podstawie twojej definicji specyfikacji:

```javascript
step("Otwórz stronę AWX", async function () {
    await goto("awx.sysadmin.homes");
});

step('Zaloguj się za pomocą danych <username>:<password>', async (username, password) => {
    await write('admin', into(textBox("Username"),{force:true}));
    await write('password', into(textBox("Password"),{force:true}));
    await press('Enter');
})

step("Wyczyść wszystkie zadania", async function () {
    await evaluate(() => localStorage.clear());
});
```

#### **Krok 5: Uruchom swój test z Visual Studio Code**
1. **Zapisz wszystkie pliki** i upewnij się, że struktura projektu jest poprawna.
2. **Uruchom test** otwierając Paletę poleceń (`Ctrl+Shift+P`) i wpisując 'Gauge: Run All Specifications'. To polecenie wykona wszystkie twoje specyfikacje i wyświetli wyniki bezpośrednio w Visual Studio Code, lub po prostu kliknij Uruchom specyfikację lub scenariusz (dostępne w Visual Studio Code po instalacji rozszerzenia Gauge).

#### **Zakończenie**
Ten poradnik przeprowadził Cię przez proces tworzenia i wykonania automatycznego testu logowania dla AWX, używając Visual Studio Code, Gauge i Taiko. Dzięki wykorzystaniu rozszerzeń Visual Studio Code, takich jak Gauge, ESLint i Babel JavaScript, możesz usprawnić rozwój i wykonanie testów.