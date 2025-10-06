---
title: Integracja GitLab z AWX - Automatyzacja wykonania skryptów Ansible Playbook
date: 2024-03-07T13:00:00+00:00
description: Odkryj kroki niezbędne do rozpoczęcia pracy z AWX, otwartą wersją Ansible Tower, wykorzystując repozytorium Gitlab do zarządzania playbookami Ansible. Ten artykuł to kompletny przewodnik krok po kroku, który pokazuje, jak skonfigurować i uruchomić swoje pierwsze zadanie w AWX, pobierając playbooki z repozytorium Gitlab. Dowiedz się, jak zainstalować AWX, skonfigurować projekty Ansible, dodawać inventory oraz tworzyć szablony zadań. Znajdziesz tu również praktyczne wskazówki oraz dodatkowe informacje na temat automatyzacji i dokumentacji. Rozpocznij swoją przygodę z automatyzacją dzięki AWX już dziś!
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- ansible
categories:
- ansible
cover:
    image: images/2024-thumbs/ansible11.webp
---

### Integracja GitLab z AWX - Automatyzacja wykonania skryptów Ansible Playbook

**W tym filmie wyjaśniam, jak skonfigurować AWX z GitLab.**

{{<youtube DR8jYqejPJw>}}

### Instalacja GitLab

Jeśli nie masz zainstalowanego GitLab, polecam obejrzenie i przeczytanie tego samouczka:: [Instalacja i konfiguracja GitLaba](/pl/blog/instalacja-i-konfiguracja-gitlaba/)

Rozpoczęcie pracy z AWX, otwartą wersją Ansible Tower, wymaga kilku kroków, aby skonfigurować i uruchomić pierwsze zadanie (job). Oto szczegółowy przewodnik krok po kroku, który pomoże Ci osiągnąć Twój cel:

### Krok 1: Instalacja AWX

Zakładam, że AWX jest już zainstalowany w systemie. Jeśli nie, najlepiej postępować zgodnie z oficjalną dokumentacją AWX, aby uzyskać najbardziej aktualne instrukcje instalacji. Możesz również zapoznać się z moim samouczkiem: [Jak zainstalować AWX przy użyciu Ansible playbook](/pl/blog/how-to-install-awx-using-ansible-playbook)

### Krok 2: Konfiguracja AWX

Po zainstalowaniu AWX, musisz go skonfigurować do użytku. Oto podstawowe kroki:

1. **Logowanie do AWX**: Użyj przeglądarki, aby przejść do interfejsu użytkownika AWX i zaloguj się przy użyciu domyślnych danych logowania (zazwyczaj `admin`/`password`, chyba że zostały zmienione podczas instalacji).

2. **Tworzenie organizacji**: W AWX, wszystko, w tym użytkownicy, zespoły i projekty, jest uporządkowane w organizacjach. 
    - Przejdź do zakładki „Organizations” i utwórz nową organizację klikając „Add”.

3. **Dodawanie użytkowników i zespołów**: W ramach organizacji możesz dodawać użytkowników i tworzyć zespoły.
    - Użyj zakładek „Users” i „Teams” w menu organizacji, aby dodać nowych użytkowników i zespoły według potrzeb.

### Krok 3: Konfiguracja projektu Ansible w AWX

1. **Tworzenie nowego projektu**:
    - Przejdź do zakładki „Projects” i kliknij „Add”.
    - Nazwij swój projekt i wybierz metodę pobierania „SCM Type” jako „Git”.
    - Podaj URL do repozytorium Git zawierającego Twoje playbooki Ansible (np. GitLab).
    - Określ gałąź, jeśli używasz innej niż domyślna.
    - Kliknij „Save”.

2. **Czekaj na synchronizację projektu**: AWX automatycznie zsynchronizuje projekt z repozytorium Git. Możesz obserwować postęp w zakładce „Projects”.

### Krok 4: Dodawanie inventory

1. **Tworzenie nowego inventory**:
    - Przejdź do zakładki „Inventories” i kliknij „Add”.
    - Nazwij swoje inventory i zdefiniuj je według potrzeb.
    - W inventory możesz dodać grupy i hosty, które będą celem Twoich playbooków Ansible.

### Krok 5: Tworzenie Job Template

1. **Tworzenie szablonu zadania (Job Template)**:
    - Przejdź do zakładki „Templates” i kliknij „Add” → „Job Template”.
    - Nadaj nazwę szablonowi, wybierz wcześniej utworzony projekt oraz playbook, który chcesz uruchomić.
    - Wybierz inventory, którego użyjesz.
    - W sekcji „Credentials” dodaj poświadczenia niezbędne do łączenia się z Twoimi serwerami (np. SSH keys).
    - Zapisz szablon.

### Krok 6: Uruchamianie Job Template

1. **Uruchomienie zadania**:
    - Znajdź swój Job Template na liście i kliknij przycisk „Launch” obok niego, aby uruchomić zadanie.
    - Możesz śledzić postęp wykonania zadania w czasie rzeczywistym.

### Dodatkowe wskazówki

- **Automatyzacja**: Rozważ wykorzystanie funkcji AWX do automatyzacji uruchamiania zadań, np. przez harmonogramy lub webhooki.
- **Dokumentacja i pomoc**: Oficjalna dokumentacja AWX jest doskonałym źródłem wiedzy na temat zaawansowanych funkcji i rozwiązywania problemów.

Aby zaktualizować systemy używające różnych menedżerów pakietów takich jak `apt` przy użyciu Ansible, możesz napisać scenariusz (playbook), który wykrywa system operacyjny (lub jego rodzinę) i stosuje odpowiednią komendę aktualizacji. Poniżej znajduje się przykładowy scenariusz, który realizuje to zadanie.

```yaml
---
- name: Aktualizuj wszystkie systemy i zrestartuj jeśli potrzeba tylko jeśli dostępne są aktualizacje
  hosts: all
  become: yes
  tasks:
    # Wstępne sprawdzenia dostępnych aktualizacji
    - name: Sprawdź dostępne aktualizacje (apt)
      apt:
        update_cache: yes
        upgrade: 'no' # Tylko sprawdź dostępność aktualizacji bez instalacji
        cache_valid_time: 3600 # Unikaj niepotrzebnych aktualizacji pamięci podręcznej
      register: apt_updates
      changed_when: apt_updates.changed
      when: ansible_facts['os_family'] == "Debian"

    # Aktualizacja systemów na podstawie sprawdzeń
    # Systemy oparte na Debianie aktualizują i restartują
    - name: Aktualizuj systemy apt jeśli dostępne są aktualizacje
      ansible.builtin.apt:
        update_cache: yes
        upgrade: dist
      when: ansible_facts['os_family'] == "Debian" and apt_updates.changed

    - name: Sprawdź czy restart jest potrzebny w systemach opartych na Debianie
      stat:
        path: /var/run/reboot-required
      register: reboot_required_file
      when: ansible_facts['os_family'] == "Debian" and apt_updates.changed

    - name: Restartuj system oparty na Debianie jeśli jest to wymagane
      ansible.builtin.reboot:
      when: ansible_facts['os_family'] == "Debian" and apt_updates.changed and reboot_required_file.stat.exists
```

### Wyjaśnienie:

- **hosts: all**: Określa, że scenariusz będzie uruchamiany na wszystkich hostach zdefiniowanych w twoim inwentarzu.
- **become: yes**: Podnosi uprawnienia do roota (podobnie do sudo), co jest wymagane do zarządzania pakietami.
- **tasks**: Sekcja zadań, gdzie każde zadanie aktualizuje systemy z różnymi menedżerami pakietów w zależności od rodziny systemu operacyjnego.
- **when**: Warunek, który sprawdza typ systemu operacyjnego hosta, aby wykonać odpowiednią komendę aktualizacji.
- **ansible.builtin.<moduł>**: Moduł Ansible odpowiedzialny za zarządzanie pakietami na różnych systemach operacyjnych.
- **moduł stat**: Używany do sprawdzania obecności pliku `/var/run/reboot-required` w systemach opartych na Debianie, który jest tworzony, gdy aktualizacja wymaga restartu.
- **moduł reboot**: Wywołuje restart systemu, jeśli jest to potrzebne. Możesz dostosować ten moduł, dodając parametry takie jak `msg` dla komunikatu restartu, `pre_reboot_delay` dla opóźnienia przed restartem itp.
- **register**: Przechowuje wynik komendy lub sprawdzenia w zmiennej, która może być później użyta w warunkach (`when`).

### Notatki:

- **update_cache**: Dla menedżerów pakietów, które tego wymagają (`apt`), ta opcja odświeża lokalną pamięć podręczną pakietów przed próbą aktualizacji.
- **upgrade: no**: Zapewnia, że sprawdzenie faktycznie nie aktualizuje żadnych pakietów.
- **cache_valid_time**: Zapobiega aktualizacji pamięci podręcznej, jeśli została zaktualizowana niedawno (3600 sekund w tym przykładzie).
- **changed_when**: Ta niestandardowa warunkowość jest używana do określenia, czy aktualizacje są faktycznie dostępne. Dla `apt`, sprawdza wynik komendy.
- **upgrade**: Dla `apt`, opcja `dist` oznacza pełną aktualizację dystrybucji.

### Dostosowanie:

Możesz dostosować ten scenariusz, dodając dodatkowe zadania lub modyfikując istniejące, aby spełniały konkretne wymagania twojego środowiska, takie jak dodanie restartu systemu po aktualizacjach lub filtrowanie aktualizacji dla określonych pakietów.

### Ważne uwagi:

- Zaleca się testowanie tego scenariusza w kontrolowanym środowisku przed uruchomieniem go w produkcji, szczególnie sekcje odpowiedzialne za restarty systemów, aby upewnić się, że wszystkie zadania działają zgodnie z oczekiwaniami i nie powodują niezamierzonych przerw w usługach.

Te wstępne zadania zapewniają, że aktualizacje systemu i potencjalne restarty są wykonywane tylko wtedy, gdy dostępne są nowe aktualizacje pakietów, oszczędzając czas i redukując niepotrzebne zmiany w zarządzanych środowiskach.