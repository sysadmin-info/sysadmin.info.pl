---
title: Konfiguracja i uruchamianie automatycznych testów przeglądarkowych z użyciem Taiko i Gauge w Visual Studio Code
date: 2024-05-10T16:00:00+00:00
description: Konfiguracja i uruchamianie automatycznych testów przeglądarkowych z użyciem Taiko i Gauge w Visual Studio Code
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
    image: images/2024-thumbs/taiko01.webp
---

Repozytorium Taiko: [Taiko](https://github.com/getgauge/taiko)

1. **Oto samouczek wideo**

{{<youtube Ws0XGTeQgZk>}}

Aby skonfigurować Taiko z Gauge do automatyzacji testów w przeglądarkach, przedstawiłem kompleksowy proces, który obejmuje instalację niezbędnych narzędzi, konfigurację środowiska i inicjalizację przykładowego projektu. Oto przewodnik krok po kroku, który szczegółowo opisuje każdy etap w bardziej uporządkowanym formacie, by łatwiej można było zrozumieć temat:

### Krok 1: Konfiguracja środowiska

1. **Utwórz katalog projektu**:
   ```bash
   mkdir test
   cd test
   ```

2. **Zainstaluj Node.js za pomocą NVM (Node Version Manager)**:
   ```bash
   # Instalacja NVM
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

   # Aktywacja nvm w bieżącej sesji
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

   # Instalacja i użycie konkretnej wersji Node.js
   nvm install 20
   nvm use 20

   # Weryfikacja instalacji
   node -v # Oczekiwany wynik: v20.13.1
   npm -v # Oczekiwany wynik: 10.5.2
   ```

### Krok 2: Instalacja zależności

3. **Zainstaluj specyficzne dla projektu pakiety npm**:
   ```bash
   npm install log4js eslint xml2js
   npx install-peerdeps --dev eslint-config-airbnb-base
   ```

4. **Tymczasowo skonfiguruj środowisko, aby ufać certyfikatom samo-podpisanym** (potrzebne dla niektórych pakietów npm):
   ```bash
   export NODE_TLS_REJECT_UNAUTHORIZED="0"
   npm install taiko
   export NODE_TLS_REJECT_UNAUTHORIZED="1"
   ```

5. **Zainstaluj i skonfiguruj Gauge**:
   ```bash
   npm install -g @getgauge/cli
   gauge init js
   ```

### Krok 3: Konfiguracja narzędzi developerskich

6. **Pobierz i zainstaluj Visual Studio Code**:
   - Odwiedź [stronę pobierania Visual Studio Code](https://code.visualstudio.com/download) i postępuj zgodnie z instrukcjami instalacji.

7. **Zainstaluj rozszerzenia Visual Studio Code**:
   - Otwórz Visual Studio Code i zainstaluj następujące rozszerzenia za pośrednictwem Marketplace Extensions:
     - Gauge
     - ESLint
     - Babel JavaScript

### Krok 4: Uruchamianie i pisanie testów

8. **Pisz swoje testy używając Taiko i Gauge**:
   - Użyj REPL Taiko do interaktywnego pisania skryptów automatyzacji przeglądarki.
   - Zapisz swoje skrypty i uruchom je przez Gauge, aby wykonać automatyczne testy.

9. **

Uruchom swój projekt Gauge**:
   ```bash
   gauge run specs
   ```

Ta konfiguracja zapewnia solidne środowisko testowe, wykorzystujące nowoczesne narzędzia takie jak Taiko do automatyzacji przeglądarki i Gauge do zarządzania testami. Z Visual Studio Code i jego rozszerzeniami masz również potężne środowisko IDE do programowania i debugowania.

## Visual Studio Code

Uruchamianie testów bezpośrednio z Visual Studio Code, używając rozszerzenia Gauge, jest bardzo efektywnym sposobem zarządzania i wykonania przypadków testowych. Metoda ta usprawnia proces rozwoju, szczególnie gdy często modyfikujesz i ponownie uruchamiasz testy. Oto jak możesz to zrobić efektywnie:

### Uruchamianie testów Gauge w Visual Studio Code

1. **Otwórz swój projekt**:
   - Uruchom Visual Studio Code.
   - Otwórz folder swojego projektu (`test` w tym przypadku), który zawiera twoje specyfikacje Gauge.

2. **Upewnij się, że rozszerzenie Gauge jest aktywne**:
   - Sprawdź, czy rozszerzenie Gauge jest zainstalowane i aktywne w Visual Studio Code. Jeśli nie jest zainstalowane, możesz je znaleźć w Marketplace Extensions, wyszukując "Gauge", a następnie zainstalować. Powinieneś również zainstalować i aktywować rozszerzenia Eslint oraz Babel Javascript.

3. **Pisz swoje testy**:
   - Użyj struktury projektu utworzonej przez `gauge init js`, aby napisać swoje testy. Zazwyczaj będzie to obejmować modyfikowanie lub dodawanie specyfikacji (`*.spec` pliki) oraz implementację definicji kroków w JavaScript.

4. **Uruchom testy**:
   - W Visual Studio Code możesz uruchomić testy bezpośrednio z edytora.
   - Aby uruchomić konkretny test, po prostu otwórz plik `.spec` i zobaczysz przycisk "Uruchom scenariusz" lub "Uruchom specyfikację" nad każdym scenariuszem testowym lub na górze pliku. Kliknięcie tego przycisku spowoduje wykonanie testów.
   - Możesz także użyć Terminala w Visual Studio Code, aby uruchomić testy przez wiersz poleceń używając `gauge run specs`.

5. **Obejrzyj raporty z testów**:
   - Po przeprowadzeniu testów, Gauge zwykle generuje raporty, które można bezpośrednio oglądać w Visual Studio Code. Sprawdź wynik w Terminalu lub w wyznaczonym folderze raportów Gauge w twoim katalogu projektowym.

6. **Debuguj testy**:
   - Gauge i Taiko zapewniają możliwości debugowania. Możesz ustawiać punkty przerwania w swoim kodzie JavaScript. Upewnij się, że skonfigurujesz swój `launch.json` w Visual Studio Code, aby dołączyć debugger do procesów Node.js, które uruchamia Gauge.

### Korzyści z używania Visual Studio Code z Gauge

- **Zintegrowane środowisko programistyczne**: Wszystko, od pisania po uruchamianie i debugowanie testów, jest zintegrowane w jednym środowisku.
- **Natychmiastowa informacja zwrotna**: Wyniki testów możesz zobaczyć od razu w edytorze, co ułatwia debugowanie i rozwiązywanie problemów.
- **Integracja kontroli wersji**: Silna integracja Git w Visual Studio Code ułatwia kontrolę wersji skryptów testowych i specyfikacji.

Ta konfiguracja zapewnia kompleksowe i przyjazne dla użytkownika środowisko testowe, zwiększające produktywność i zmniejszające obciążenie związane ze zmianą narzędzi. Jeśli masz konkretne scenariusze lub konfiguracje w swoim projekcie, z którymi potrzebujesz pomocy, śmiało pytaj!