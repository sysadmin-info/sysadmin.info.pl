---
title: Ulepsz swój pierwszy test AWX za pomocą Gauge i Taiko w Visual Studio Code
date: 2024-05-14T12:00:00+00:00
description: Ulepsz swój pierwszy test AWX za pomocą Gauge i Taiko w Visual Studio Code
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
    image: images/2024-thumbs/taiko04.webp
---

[Repozytorium Taiko](https://github.com/getgauge/taiko)
[Taiko API](https://docs.taiko.dev/)

1. **Oto samouczek wideo**

{{<youtube FdoGmHA4tEQ>}}


### **Tworzenie zautomatyzowanych testów za pomocą Gauge i Taiko: Logowanie do AWX**

Witaj w tej lekcji, w której przeprowadzimy Cię przez wykorzystanie Gauge i Taiko do stworzenia podstawowego testu automatycznego. Ten test wykona podstawowe zadania i zautomatyzuje proces logowania do interfejsu administracyjnego AWX. Głównym celem tego artykułu jest zautomatyzowanie testu, który otwiera ekran logowania AWX (Ansible AWX), wprowadza dane logowania, a następnie wykonuje podstawową czynność, taką jak czyszczenie zadań.

Korzystając z niektórych funkcjonalności z przykładu Gauge, zaczniemy od zera, tworząc nowy plik specyfikacji i powiązany plik JavaScript.

#### **Wymagania wstępne**

Upewnij się, że masz zainstalowane:

- Node.js
- Gauge
- Taiko
- Visual Studio Code lub dowolne preferowane IDE

Jeśli jeszcze tego nie zainstalowałeś, zapoznaj się z krokami instalacji w moich poprzednich samouczkach.

#### **Krok 1: Inicjalizacja projektu Gauge JavaScript**

Jeśli jeszcze nie utworzyłeś projektu:

1. Utwórz nowy katalog i przejdź do niego:

```bash
mkdir awx-taiko
cd awx-taiko
```
2. Zainicjuj projekt Gauge z JavaScriptem:

```bash
gauge init js
```

To polecenie tworzy podstawową strukturę projektu z przykładowymi specyfikacjami i plikami wsparcia.

#### **Krok 2: Przeglądanie przykładowych plików**

Poświęć chwilę na zapoznanie się z przykładowymi plikami specyfikacji i JavaScript utworzonymi przez `gauge init js`. Te pliki stanowią dobry punkt wyjścia do zrozumienia, jak wchodzić w interakcje z elementami sieciowymi za pomocą Taiko.

#### **Krok 3: Tworzenie nowego pliku specyfikacji**

1. W katalogu projektu Gauge utwórz nowy plik o nazwie `login.spec`.
2. Zacznij od zdefiniowania tytułu specyfikacji i scenariusza:

```markdown
# Test logowania do AWX

aby wykonać tę specyfikację, użyj
npm test

To jest krok kontekstowy, który uruchamia się przed każdym scenariuszem
* Przejdź do strony logowania AWX

## Logowanie do AWX
* Potwierdź, że strona logowania jest załadowana
* Użyj danych logowania "admin":"password"
* Kliknij przycisk logowania
* Zweryfikuj pomyślne logowanie
___
* Wyczyść wszystkie zadania
```

#### **Krok 4: Implementacja specyfikacji w JavaScript**

Utwórz nowy plik JavaScript o nazwie `login.js` i zacznij skryptować działania:

1. Zaimportuj Taiko i niezbędne adnotacje Gauge:

```javascript
/* globals gauge*/
"use strict";
const path = require('path');
const {
    openBrowser,
    write,
    closeBrowser,
    goto,
    button,
    press,
    screenshot,
    above,
    click,
    checkBox,
    listItem,
    toLeftOf,
    link,
    text,
    into,
    textBox,
    evaluate
} = require('taiko');
const assert = require("assert");
const headless = process.env.headless_chrome.toLowerCase() === 'true';

beforeSuite(async () => {
    await openBrowser({
        headless: headless
    })
});

afterSuite(async () => {
    await closeBrowser();
});

// Zwróć nazwę pliku zrzutu ekranu
gauge.customScreenshotWriter = async function () {
    const screenshotFilePath = path.join(process.env['gauge_screenshots_dir'],
        `screenshot-${process.hrtime.bigint()}.png`);

    await screenshot({
        path: screenshotFilePath
    });
    return path.basename(screenshotFilePath);
};
```

3. Implementacja kroków:

```javascript
step("Przejdź do strony logowania AWX", async function () {
    await goto("awx.sysadmin.homes");
});

step("Potwierdź, że strona logowania jest załadowana", async () => {
    assert(await text("Welcome to AWX!").exists());
});

step('Użyj danych logowania <username>:<passwortd>', async (username, password) => {
    await write('admin', into(textBox("Username"),{force:true}));
    await write('password', into(textBox("Password"),{force:true}));
});

step("Kliknij przycisk logowania", async () => {
    await click(button("Log In"));
});

step("Zweryfikuj pomyślne logowanie", async () => {
    assert(await text("Dashboard").exists());
});
step("Wyczyść wszystkie zadania", async function () {
    await evaluate(() => localStorage.clear());
});
```

#### **Krok 5: Uruchamianie testu z wiersza poleceń**

Teraz, gdy twoja specyfikacja i implementacja są gotowe:

1. Otwórz terminal.
2. Uruchom test, wykonując polecenie:

```bash
gauge run specs
```

#### **Krok 5: Uruchamianie testu z Visual Studio Code**

1. Upewnij się, że struktura projektu jest poprawna i zapisz wszystkie pliki.
2. Rozpocznij test, wpisując 'Gauge: Run All Specifications' w Command Palette ({Ctrl+Shift+P}). Możesz również kliknąć Run spec lub scenario (dostępne w Visual Studio Code po zainstalowaniu rozszerzenia Gauge), aby uruchomić wszystkie swoje specyfikacje i zobaczyć wyniki bezpośrednio w Visual Studio Code.

#### **Wnioski**

Ten post pokazał, jak używać Gauge i Taiko do opracowania prostego testu automatycznego do logowania się do AWX. Bardziej złożone scenariusze można zautomatyzować za pomocą tego podejścia, modyfikując pliki JavaScript i specyfikacji. Wypróbuj różne funkcje i zadania według potrzeb.