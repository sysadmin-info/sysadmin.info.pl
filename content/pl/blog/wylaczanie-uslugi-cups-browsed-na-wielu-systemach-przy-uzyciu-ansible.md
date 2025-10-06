---
title: Wyłączanie usługi cups-browsed na wielu systemach przy użyciu Ansible
date: 2024-09-28T21:00:00+00:00
description: Wyłączanie usługi cups-browsed na wielu systemach przy użyciu Ansible
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
    image: images/2024-thumbs/disabling_the_cups-browsed_service.webp
---

Krytyczna luka, która miała wpływać na cały system Linux, okazała się problemem w systemie drukowania CUPS (cups-browsed). Chociaż możliwe jest wykonanie zdalnego kodu (RCE) bez uwierzytelnienia, luka dotyczy jedynie systemów z włączoną usługą `cups-browsed`, co nie jest powszechne. Luka została [opublikowana wcześniej](https://www.evilsocket.net/2024/09/26/Attacking-UNIX-systems-via-CUPS-Part-I/) przez badacza bezpieczeństwa Simone Margaritelli (znanego także jako @[evilsocket](https://x.com/evilsocket)), który podkreślił, że wymaga ona specyficznych warunków, takich jak inicjowanie drukowania na podszytym się drukarce.

Chociaż luka została oceniona na CVSS 9.9/10, w praktyce jej wpływ może być mniej poważny niż początkowo sugerowano. Zgłoszono także inne potencjalne problemy, takie jak przepełnienia bufora i DoS, ale bez szczegółowych proof-of-concept (PoC).

Obecnie dostępny jest [PoC](https://gist.github.com/stong/c8847ef27910ae344a7b5408d9840ee1)

Podsumowując, pomimo alarmistycznych raportów, ta luka nie wpływa na cały system Linux. Zaleca się jednak wyłączenie `cups-browsed` i zablokowanie portu 631 dla ruchu UDP i DNS-SD, jeśli usługa nie jest wymagana.

### Krok 1: Informacje wstępne

Luka omówiona w artykule Sekurak dotyczy systemu drukowania CUPS. Aby zapobiec potencjalnym problemom, w tym poradniku zostanie skonfigurowany playbook Ansible, który sprawdzi, czy usługa `cups-browsed` działa na zdalnych maszynach i ją wyłączy.

### Krok 2: Konfiguracja środowiska Ansible

#### Plik `hosts`

Najpierw musimy skonfigurować plik `hosts`, który zawiera listę maszyn, z którymi będziemy pracować:

```ini
all:
  children:
    rhel:
      hosts:
        rhel1:
          ansible_host: 10.10.0.10
          ansible_user: ansible
        rhel2:
          ansible_host: 10.10.0.11
          ansible_user: ansible
```

Ten plik zawiera grupy i hosty, którymi będziemy zarządzać. Ważne jest, aby upewnić się, że na każdej zdalnej maszynie skonfigurowany jest użytkownik Ansible i dostęp SSH do nich.

### Krok 3: Playbook Ansible

Playbook Ansible zawiera kroki potrzebne do wyłączenia usługi `cups-browsed`. Playbook najpierw sprawdza wersję Pythona (aby dynamicznie wybrać odpowiedni interpreter), a następnie sprawdza, czy maszyna używa `systemd`, aby wybrać odpowiednie polecenia.

Oto playbook `cups_browsed_check.yml`:

```yaml
---
- name: Sprawdź i zatrzymaj/wyłącz usługę cups-browsed na wielu systemach
  hosts: all
  remote_user: ansible 
  become: yes
  become_method: sudo
  gather_facts: no  # Wyłącz zbieranie faktów, aby uniknąć SCP/SFTP
  vars:
    ansible_python_interpreter: "{{ '/usr/bin/python3' if 'Python 3' in python_version_check.stdout else '/usr/bin/python' }}"
  tasks:

    # Krok 0: Sprawdź wersję Pythona na zdalnym hoście
    - name: Sprawdź wersję Pythona
      raw: "python --version || python3 --version"
      register: python_version_check
      changed_when: false
      failed_when: false

    - name: Ustaw interpreter Pythona na podstawie sprawdzenia wersji
      set_fact:
        ansible_python_interpreter: "{{ '/usr/bin/python3' if 'Python 3' in python_version_check.stdout else '/usr/bin/python' }}"

    # Krok 1: Sprawdź, czy dostępny jest systemctl (dla systemów systemd)
    - name: Sprawdź, czy dostępny jest systemctl (neutralny Python)
      raw: "which systemctl"
      register: systemctl_check
      changed_when: False
      ignore_errors: yes

    # Krok 2: Sprawdź, czy usługa cups-browsed istnieje (systemy systemd)
    - name: Sprawdź, czy usługa cups-browsed istnieje (systemd)
      command: systemctl cat cups-browsed
      register: cups_browsed_exists
      changed_when: False
      failed_when: cups_browsed_exists.rc not in [0, 1]
      when: systemctl_check.rc == 0
      ignore_errors: yes

    # Krok 3: Sprawdź, czy usługa cups-browsed istnieje (systemy bez systemd)
    - name: Sprawdź, czy usługa cups-browsed istnieje (bez systemd)
      command: service cups-browsed status
      register: cups_browsed_exists_service
      changed_when: False
      failed_when: cups_browsed_exists_service.rc not in [0, 1]
      when: systemctl_check.rc != 0
      ignore_errors: yes

    # Krok 4: Zatrzymaj usługę cups-browsed (systemy systemd)
    - name: Zatrzymaj usługę cups-browsed (systemd)
      systemd:
        name: cups-browsed
        state: stopped
      when: cups_browsed_exists is defined and cups_browsed_exists.rc is defined and cups_browsed_exists.rc == 0

    # Krok 5: Wyłącz usługę cups-browsed (systemy systemd)
    - name: Wyłącz usługę cups-browsed (systemd)
      systemd:
        name: cups-browsed
        enabled: no
      when: cups_browsed_exists is defined and cups_browsed_exists.rc is defined and cups_browsed_exists.rc == 0

    # Krok 6: Zatrzymaj usługę cups-browsed (systemy bez systemd)
    - name: Zatrzymaj usługę cups-browsed (bez systemd)
      service:
        name: cups-browsed
        state: stopped
      when: cups_browsed_exists_service is defined and cups_browsed_exists_service.rc is defined and cups_browsed_exists_service.rc == 0

    # Krok 7: Wyłącz usługę cups-browsed (systemy bez systemd)
    - name: Wyłącz usługę cups-browsed (bez systemd)
      service:
        name: cups-browsed
        enabled: no
      when: cups_browsed_exists_service is defined and cups_browsed_exists_service.rc is defined and cups_browsed_exists_service.rc == 0

    # Krok 8: Wyświetl status usługi do weryfikacji
    - name: Wyświetl status usługi cups-browsed w formacie JSON
      debug:
        msg: |
          {
            "Maszyna": "{{ inventory_hostname }}",
            "Interpreter Pythona": "{{ ansible_python_interpreter }}",
            "Użycie systemd": "{{ 'Tak' jeśli systemctl_check.rc == 0 else 'Nie' }}",
            "Usługa cups-browsed istnieje": "{{ 'Tak' jeśli (systemctl_check.rc == 0 i cups_browsed_exists jest zdefiniowany i cups_browsed_exists.rc == 0) else 'Nie' }}",
            "Usługa cups-browsed zatrzymana i wyłączona": "{{ 'Zatrzymana i Wyłączona' jeśli (systemctl_check.rc == 0 i cups_browsed_exists jest zdefiniowany i cups_browsed_exists.rc == 0) else 'Nie dotyczy' }}"
          }
```

### Krok 4: Uruchamianie Playbooka

Aby uruchomić ten playbook, użyj następującego polecenia:

```bash
ansible-playbook -i /path/to/hosts/file cups_browsed_check.yml -l all > output.log 2>&1
```

### Krok

 5: Analizowanie wyników

Po uruchomieniu playbooka zostanie wyświetlony status usługi `cups-browsed` na każdej maszynie, wraz z informacją, czy została wyłączona. Szczegółowe wyniki operacji można dodatkowo przefiltrować przy użyciu następującego polecenia:

```bash
sed -n '/TASK \[Wyświetl status usługi cups-browsed w formacie JSON\]/,/PLAY RECAP/Ip' output.log > filtered_output.log
```

### AWX

Możesz również dodać playbook do repozytorium GitLab połączonego z AWX. W AWX można skonfigurować **Smart Inventory**, gdzie wystarczy umieścić kropkę (`.`) w **Search Filter**, aby uwzględnić wszystkie dostępne inwentarze z AWX. Dzięki temu wszystkie maszyny mogą zostać zeskanowane za pomocą szablonu, który trzeba utworzyć w AWX do uruchomienia tego playbooka.

### Podsumowanie

Ten poradnik pokazuje, jak zautomatyzować zarządzanie usługą `cups-browsed` na wielu maszynach przy użyciu Ansible. Playbook dynamicznie obsługuje różne wersje Pythona oraz różne systemy init, takie jak systemd i sysvinit.

Warto zauważyć, że uruchomienie playbooka na 15 maszynach przez CLI zajmuje mniej niż minutę, podczas gdy w AWX trwa to ponad 5 minut.

Jeśli potrzebujesz więcej informacji na temat integracji AWX i GitLab, sprawdź moje poprzednie poradniki.

#### Film instruktażowy

{{<youtube 3EAzZHHnlqk>}}
