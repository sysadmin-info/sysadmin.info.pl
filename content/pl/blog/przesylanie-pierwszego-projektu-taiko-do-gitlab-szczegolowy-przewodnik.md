---
title: Przesyłanie pierwszego projektu Taiko do GitLab - szczegółowy przewodnik
date: 2024-05-14T13:00:00+00:00
description: Przesyłanie pierwszego projektu Taiko do GitLab - szczegółowy przewodnik
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
image: images/2024-thumbs/taiko05.webp
---

[Taiko repository](https://github.com/getgauge/taiko)
[Taiko API](https://docs.taiko.dev/)

**Tutaj znajduje się tutorial wideo**

{{<youtube 2IT8vomcuds>}}

# Jak przesłać projekt Taiko do repozytorium GitLab

## Przewodnik krok po kroku

### Krok 1: Otwórz GitLab

- Otwórz przeglądarkę internetową.
- Przejdź do adresu URL swojej instancji GitLab i zaloguj się za pomocą swoich danych uwierzytelniających.

### Krok 2: Utwórz projekt w grupie Developers

- Po zalogowaniu, przejdź do górnego menu i kliknij **Projects**.
- Kliknij **Create new project**.

### Krok 3: Wybierz "Create blank project"

- Wybierz **Create blank project**.

### Krok 4: Upewnij się, że projekt jest utworzony w grupie Developers

- W polu **Project name** wprowadź nazwę projektu (np. `awx-taiko`).
- Pod **Project URL** upewnij się, że przestrzeń nazw (grupa) jest ustawiona na `developers`, gdzie dodano twojego użytkownika.
- Kliknij **Create project**.

### Krok 5: Skonfiguruj Git i utwórz repozytorium

Możesz zacząć od sklonowania repozytorium lub rozpocząć dodawanie plików za pomocą jednej z poniższych opcji. Możesz również przesłać istniejące pliki z komputera, korzystając z poniższych instrukcji.

#### Globalna konfiguracja Git

1. Otwórz terminal.
2. Skonfiguruj nazwę użytkownika i adres e-mail Git (zastąp "your_user" i "your_user@gitlab.local" swoją rzeczywistą nazwą i e-mailem):

    ```bash
    git config --global user.name "your_user"
    git config --global user.email "your_user@gitlab.local"
    ```

#### Utwórz nowe repozytorium

1. Sklonuj nowo utworzone repozytorium:

    ```bash
    git clone git@IP_OR_URL_of_your_GitLab:developers/awx-taiko.git
    ```
2. Przejdź do sklonowanego katalogu:

    ```bash
    cd awx-taiko
    ```
3. Utwórz nową gałąź o nazwie `main`:

    ```bash
    git switch --create main
    ```
4. Utwórz plik `README.md`:

    ```bash
    touch README.md
    ```
5. Dodaj plik `README.md` do obszaru przejściowego:

    ```bash
    git add README.md
    ```
6. Otwórz `README.md` w edytorze tekstu (np. `vim`) i dodaj trochę tekstu:

    ```bash
    vim README.md
    ```
    - Po dodaniu tekstu, zapisz i zamknij edytor (w `vim`, naciśnij `Esc`, wpisz `:wq` i naciśnij `Enter`).

7. Zatwierdź zmiany:

    ```bash
    git commit -m "add README"
    ```

#### Inicjalizuj i zatwierdź istniejący folder

1. Inicjalizuj nowe repozytorium Git:

    ```bash
    git init --initial-branch=main
    ```
2. Dodaj zdalne repozytorium:

    ```bash
    git remote add origin git@IP_OR_URL_of_your_GitLab:developers/awx-taiko.git
    ```
3. Dodaj wszystkie pliki do obszaru przejściowego:

    ```bash
    git add .
    ```
4. Zatwierdź zmiany:

    ```bash
    git commit -m "Initial commit"
    ```

#### Przesyłanie istniejącego repozytorium Git

1. Prześlij lokalne repozytorium do GitLab:

    ```bash
    git push --set-upstream origin main
    ```

#### Kopiowanie plików projektu do sklonowanego repozytorium

1. Przejdź do swojego katalogu domowego:

    ```bash
    cd ~
    ```
2. Skopiuj pliki projektu do sklonowanego repozytorium (zastąp `/home/username/test/` i `/home/username/cloned-project/` rzeczywistymi ścieżkami):

    ```bash
    cp -r /home/username/test/* /home/username/cloned-project/
    ```

#### Potwierdzenie nadpisania pliku `README.md`

- Jeśli zostaniesz o to poproszony, potwierdź nadpisanie pliku `README.md`, wpisując `yes`.

#### Dodaj i zatwierdź wszystkie pliki i katalogi

1. Dodaj wszystkie pliki do obszaru przejściowego:

    ```bash
    git add .
    ```
2. Zatwierdź zmiany:

    ```bash
    git commit -m "Added project AWX Taiko"
    ```

#### Prześlij zaktualizowane repozytorium

1. Prześlij zmiany do GitLab:

    ```bash
    git push origin main
    ```

### Krok 6: Sprawdź status

1. Sprawdź status swojego repozytorium Git, aby upewnić się, że wszystko zostało zatwierdzone i przesłane:

    ```bash
    git status
    ```

### Krok 7: Odśwież projekt w GitLab
- Wróć do strony projektu GitLab.
- Odśwież stronę, aby zobaczyć, że wszystkie pliki i katalogi są aktualne.

---

Postępując zgodnie z tymi krokami, pomyślnie prześlesz swój projekt Taiko do repozytorium GitLab. Jeśli napotkasz jakiekolwiek problemy, upewnij się, że adres URL instancji GitLab, ścieżki projektu i dane uwierzytelniające użytkownika są poprawnie skonfigurowane.