---
title: Podstawy Ansible playbooks
date: 2024-09-30T10:00:00+00:00
description: Podstawy Ansible playbooks
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Ansible
categories:
- Ansible
cover:
    image: images/2024-thumbs/ansible13.webp
---

### Wprowadzenie

Playbooki Ansible są pisane w YAML, prostym i czytelnym formacie. Nie musisz znać programowania ani kodowania, aby zacząć korzystać z Ansible. Istnieje jednak kilka zasad strukturalnych, które musisz przestrzegać, i wyjaśnię je krok po kroku.

---

## 1. Podstawy YAML i Wcięcia

Ansible korzysta ze składni YAML do pisania playbooków, a YAML jest mocno zależny od wcięć. W YAML wcięcia organizują hierarchię twoich zadań lub zmiennych, co oznacza, że nie możesz używać tabulatorów—tylko spacje. Najczęściej stosowaną zasadą jest 2 spacje na poziom (czasami 4 spacje, ale kluczowa jest konsekwencja).

### Przykład Wcięcia

```yaml
tasks:              # To jest klucz na najwyższym poziomie
  - name: Install package  # To jest wcięte o 2 spacje
    apt:                   # Kolejne 2 spacje dla hierarchii
      name: nginx
```

Tutaj:

- `tasks:` jest na najwyższym poziomie.
- Każde zadanie (zdefiniowane przez myślnik, `-`) jest wcięte o 2 spacje pod `tasks`.
- Nazwa modułu (np. `apt:`) jest wcięta o kolejne 2 spacje pod nazwą zadania.

### Częsty Błąd

Jeśli pomieszasz tabulatory i spacje lub pomylisz wcięcia, Ansible zgłosi błąd. YAML oczekuje jednolitych wcięć, aby zrozumieć strukturę.

---

## 2. Kluczowe Znaki w Playbookach Ansible

### 2.1 Myślniki (`-`)

- Myślniki służą do tworzenia list w YAML. Na przykład, w Ansible lista zadań jest definiowana za pomocą myślników.
- Każde zadanie lub element listy jest poprzedzone myślnikiem.

### Przykład

```yaml
tasks:
  - name: Install nginx
    apt:
      name: nginx
  - name: Start nginx
    service:
      name: nginx
      state: started
```

W tym przykładzie lista zawiera dwa zadania, oba zaczynają się od myślnika.

### 2.2 Dwukropki (`:`)

- Dwukropki służą do oddzielania kluczy od wartości.
- Klucze w YAML są jak nazwy zmiennych lub pól.
- Wartości to dane lub informacje związane z kluczem.

### Przykład

```yaml
name: nginx
state: started
```

Tutaj:

- `name` to klucz, a `nginx` to jego wartość.
- `state` to klucz, a `started` to jego wartość.

### 2.3 Zmienne i Nawiasy Klamrowe (`{{ }}`)

Playbooki Ansible obsługują zmienne, aby uniknąć twardego kodowania wartości. Używasz nawiasów klamrowych (`{{ }}`), aby odwoływać się do zmiennych w playbooku.

### Przykład Zmiennych

```yaml
vars:
  package_name: nginx

tasks:
  - name: Install a package
    apt:
      name: "{{ package_name }}"
```

W tym przypadku:

- Zmienna `package_name` jest zdefiniowana pod `vars:`.
- W zadaniu odwołujemy się do tej zmiennej za pomocą `{{ package_name }}`. Więc kiedy playbook zostanie uruchomiony, zainstaluje nginx.

---

## 3. Zmienne i Pętle

### 3.1 Zmienne Szczegółowo

Zmienne pozwalają na wielokrotne używanie wartości i utrzymanie dynamiczności playbooków. Na przykład, jeśli chcesz zainstalować wiele pakietów, możesz zdefiniować je jako zmienne, zamiast powtarzać wartości wiele razy.

### Przykład

```yaml
vars:
  packages:
    - nginx
    - curl
    - git

tasks:
  - name: Install multiple packages
    apt:
      name: "{{ item }}"
    loop: "{{ packages }}"
```

Tutaj:

- `vars:` zawiera listę `packages` (nginx, curl i git).
- Zadanie używa pętli z `{{ item }}`, aby instalować każdy pakiet z listy jeden po drugim.

### 3.2 Pętle Szczegółowo

Pętle w Ansible pozwalają powtarzać to samo zadanie wiele razy z różnymi wejściami. W powyższym przykładzie `loop: "{{ packages }}"` mówi Ansible, aby uruchomił zadanie dla każdego pakietu z listy.

---

## 4. Przykład Prostego Playbooka

Zbudujmy kompletny przykład podstawowego playbooka, który instaluje pakiety i upewnia się, że usługa działa.

### Przykład

```yaml
---
- hosts: all          # Definiuje, że ten playbook działa na wszystkich hostach
  become: yes         # Uruchamia zadania z uprawnieniami root (sudo)

  vars:
    package_name: nginx

  tasks:
    - name: Install nginx
      apt:
        name: "{{ package_name }}"
        state: present  # Zapewnia, że nginx jest zainstalowany

    - name: Ensure nginx is running
      service:
        name: nginx
        state: started  # Uruchamia usługę nginx, jeśli nie działa
```

### Wyjaśnienie

- `hosts: all` określa, że ten playbook zostanie uruchomiony na wszystkich docelowych hostach.
- `become: yes` zapewnia, że playbook jest uruchamiany z podwyższonymi uprawnieniami (np. za pomocą `sudo`).
- Sekcja `vars:` definiuje zmienną `package_name` ustawioną na `nginx`.
- Pierwsze zadanie instaluje nginx.
- Drugie zadanie upewnia się, że nginx działa.

---

## 5. Częste Błędy i Debugowanie

Na początku pracy z YAML i Ansible, jest kilka powszechnych błędów, na które warto zwrócić uwagę:

### Błędy Wcięcia

YAML wymaga poprawnych wcięć. Proste przesunięcie może spowodować błędy.

#### Przykład Złego Wcięcia

```yaml
tasks:
   - name: Install nginx  # 3 spacje zamiast 2 (powinno być jednolite)
      apt:
        name: nginx
```

### Brakujące Dwukropki

Pominięcie dwukropków między kluczami a wartościami może zepsuć playbook.

#### Przykład

```yaml
name nginx   # To jest niepoprawne. Powinno być `name: nginx`
```

### Niezdefiniowane Zmienne

Jeśli użyjesz zmiennej bez jej zdefiniowania, pojawi się błąd. Zawsze sprawdzaj swoją sekcję `vars:` pod kątem brakujących zmiennych.

---

## Podsumowanie

W tym poradniku omówiliśmy podstawową strukturę playbooka Ansible, w tym wcięcia, zmienne, pętle i powszechne składnie, takie jak myślniki i dwukropki. Przestrzegając tych zasad, będziesz w stanie pisać czytelne i funkcjonalne playbooki.

Kluczowe Punkty:

- Zawsze utrzymuj jednolite wcięcia.
- Używaj zmiennych, aby utrzymać elastyczność swoich playbooków.
- Pętle pozwalają stosować zadania do wielu elementów.
- Zwracaj uwagę na powszechne błędy, takie jak błędy wcięcia i brakujące dwukropki.

Śmiało eksperymentuj i twórz swoje własne playbooki! Ansible to potężne narzędzie, gdy tylko poczujesz się komfortowo z jego strukturą.

#### Film instruktażowy

{{<youtube mf-cpMnOBPQ>}}
