---
title: Trwała perfekcja - opanowanie storage w projekcie AWX na Kubernetes
date: 2024-02-24T14:00:00+00:00
description: Jak naprawić problem w AWX - Nie ma dostępnych katalogów playbook w /var/lib/awx/projects.
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
    image: images/2024-thumbs/ansible09.webp
---

{{< notice success "Informacje w AWX" >}}
Nie ma dostępnych katalogów playbook w /var/lib/awx/projects. Albo ten katalog jest pusty, albo wszystkie zawartości są już przypisane do innych projektów. Utwórz tam nowy katalog i upewnij się, że pliki playbook mogą być odczytywane przez użytkownika systemowego "awx", lub pozwól AWX bezpośrednio pobierać twoje playbooki z kontroli źródła, używając opcji Typ Kontroli Źródła powyżej.
{{< /notice >}}

### Jak naprawić problem: Brak dostępnych katalogów playbook w /var/lib/awx/projects ?

**Oto samouczek wideo**

{{<youtube q03HPrUVxUw>}}

### Poniżej znajduje się poprawiony playbook, który rozwiązuje problem ze ścieżką dla projektów w GUI AWX. 
Teraz możesz utworzyć katalog /var/lib/awx/projects na swoim hoście, a także tworzyć podkatalogi w tym katalogu, aby oddzielić projekty. To, co utworzysz na hoście, zostanie automatycznie utworzone w kontenerze w podzie awx-web.

Znajdziesz więcej informacji, jak całe rozwiązanie działa, po krokach implementacji.

#### Implementacja

1. Utwórz plik playbook ansible: awx-install-fixed-projects.yml. 

```bash
vim awx-install-fixed-projects.yml
```

I wstaw poniższą zawartość do tego pliku.

```yaml
---
- name: Instalacja AWX
  hosts: localhost
  become: yes
  vars:
    awx_namespace: awx
    project_directory: /var/lib/awx/projects
    storage_size: 2Gi

  tasks:
    - name: Pobierz Kustomize za pomocą curl
      ansible.builtin.shell:
        cmd: curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
        creates: /usr/local/bin/kustomize

    - name: Przenieś Kustomize do katalogu /usr/local/bin
      ansible.builtin.shell:
        cmd: mv kustomize /usr/local/bin
      args:
        creates: /usr/local/bin/kustomize

    - name: Upewnij się, że przestrzeń nazw {{ awx_namespace }} istnieje
      ansible.builtin.shell:
        cmd: kubectl create namespace {{ awx_namespace }} --dry-run=client -o yaml | kubectl apply -f -

    - name: Generuj plik zasobów AWX
      ansible.builtin.copy:
        dest: "./awx.yaml"
        content: |
          ---
          apiVersion: awx.ansible.com/v1beta1
          kind: AWX
          metadata:
            name: awx
          spec:
            service_type: nodeport
            nodeport_port: 30060
            projects_persistence: true
            projects_existing_claim: awx-projects-claim

    - name: Pobierz najnowszy tag wydania operatora AWX
      ansible.builtin.shell:
        cmd: curl -s https://api.github.com/repos/ansible/awx-operator/releases/latest | grep tag_name | cut -d '"' -f 4
      register: release_tag
      changed_when: false

    - name: Generuj pliki zasobów PV i PVC
      ansible.builtin.copy:
        dest: "{{ item.dest }}"
        content: "{{ item.content }}"
      loop:
        - dest: "./pv.yml"
          content: |
            ---
            apiVersion: v1
            kind: PersistentVolume
            metadata:
              name: awx-projects-volume
            spec:
              accessModes:
                - ReadWriteOnce
              persistentVolumeReclaimPolicy: Retain
              capacity:
                storage: {{ storage_size }}
              storageClassName: awx-projects-volume
              hostPath:
                path: {{ project_directory }}
        - dest: "./pvc.yml"
          content: |
            ---
            apiVersion: v1
            kind: PersistentVolumeClaim
            metadata:
              name: awx-projects-claim
            spec:
              accessModes:
                - ReadWriteOnce
              volumeMode: Filesystem
              resources:
                requests:
                  storage: {{ storage_size }}
              storageClassName: awx-projects-volume

    - name: Utwórz kustomization.yaml
      ansible.builtin.copy:
        dest: "./kustomization.yaml"
        content: |
          ---
          apiVersion: kustomize.config.k8s.io/v1beta1
          kind: Kustomization
          resources:
            - github.com/ansible/awx-operator/config/default?ref={{ release_tag.stdout }}
            - pv.yml
            - pvc.yml
            - awx.yaml
          images:
            - name: quay.io/ansible/awx-operator
              newTag: {{ release_tag.stdout }}
          namespace: {{ awx_namespace }}

    - name: Zastosuj konfigurację Kustomize
      ansible.builtin.shell:
        cmd: kustomize build . | kubectl apply -f -
```

{{< notice success "Informacja" >}}
plik playbook jest dostępny [tutaj:](https://github.com/sysadmin-info/ansible)
{{< /notice >}}

2. Uruchom playbook jak poniżej:

```bash
ansible-playbook awx-install-fixed-projects.yml
```

3. Otwórz nowy terminal i obserwuj logi

```bash
kubectl logs -f deployments/awx-operator-controller-manager -c awx-manager -n awx
```

Sprawdź, czy pody zostały utworzone w przestrzeni nazw awx

```bash
kubectl get pods -n awx
```

4. Sprawdź usługę 

```bash
kubectl get svc -n awx
```

5. Pobierz hasło awx

```bash
kubectl get secret awx-admin-password -o jsonpath="{.data.password}" -n awx | base64 --decode ; echo
```

Dodatkowo możesz zmienić hasło na swoje własne za pomocą poniższej komendy:

```bash
kubectl -n awx exec -it awx-web-65655b54bf-8lxvr -- awx-manage changepassword admin
```

6. Sprawdź adres IP hosta, na którym zainstalowano AWX

```bash
hostname -I
```

7. Otwórz to w przeglądarce używając portu zdefiniowanego w pliku awx.yaml. Na przykład:

```markdown
http://10.10.0.123:30060
```

8. Odinstaluj AWX

Utwórz plik playbook ansible: awx-install-fixed-projects.yml

```bash
vim awx-remove.yml
```

I wstaw poniższą zawartość do tego pliku.

```yaml
---
- name: Usuń AWX
  hosts: localhost
  become: yes
  tasks:
    - name: Usuń wdrożenie awx 
      shell: kubectl delete deployment awx-operator-controller-manager -n awx
      ignore_errors: yes

    - name: Usuń konto usługi
      shell: kubectl delete serviceaccount awx-operator-controller-manager -n awx
      ignore_errors: yes

    - name: Usuń powiązanie roli
      shell: kubectl delete rolebinding awx-operator-awx-manager-rolebinding -n awx
      ignore_errors: yes

    - name: Usuń rolę
      shell: kubectl delete role awx-operator-awx-manager-role -n awx
      ignore_errors: yes

    - name: Zmniejsz liczbę replik wszystkich wdrożeń w przestrzeni nazw awx do zera
      shell: kubectl scale deployment --all --replicas=0 -n awx
      ignore_errors: yes

    - name: Usuń wdrożenia
      shell: kubectl delete deployments.apps/awx-web deployments.apps/awx-task -n awx 
      ignore_errors: yes

    - name: Usuń zestawy stanowe
      shell: kubectl delete statefulsets.apps/awx-postgres-13 -n awx 
      ignore_errors: yes

    - name: Usuń usługi
      shell: kubectl delete service/awx-operator-controller-manager-metrics-service service/awx-postgres-13 service/awx-service -n awx
      ignore_errors: yes

    - name: Pobierz nazwę persistent volume claim
      command: kubectl get pvc -n awx -o custom-columns=:metadata.name --no-headers
      register: pvc_output
      ignore_errors: yes

    - name: Usuń Persistent volume claim
      command: kubectl -n awx delete pvc {{ pvc_output.stdout }}
      when: pvc_output.stdout != ""
      ignore_errors: yes

    - name: Pobierz nazwę objętości trwałej
      command: kubectl get pv -n awx -o custom-columns=:metadata.name --no-headers
      register: pv_output
      ignore_errors: yes

    - name: Usuń Persistent volume
      command: kubectl -n awx delete pv {{ pv_output.stdout }}
      when: pv_output.stdout != ""
      ignore_errors: yes

    - name: Usuń przestrzeń nazw awx
      shell: kubectl delete namespace awx
      ignore_errors: yes
```

Uruchom playbook jak poniżej:

```bash
ansible-playbook awx-remove.yml
```

#### Szczegóły dla PV i PVC zdefiniowanych w playbooku ansible:

Ten playbook ansible jest zaprojektowany do wdrożenia AWX (wersji open-source ansible Tower) w klastrze Kubernetes, wykorzystując persistent volume (PV) i persistent volume claim (PVC) do zarządzania przechowywaniem danych. Przeanalizujmy, jak PV i PVC są zdefiniowane i używane w tym playbooku, szczególnie w kontekście zadania "Generuj pliki zasobów PV i PVC".

##### Persistent volume (PV)

Persistent volume (PV) w Kubernetes to element pamięci masowej w klastrze, który został przydzielony przez administratora lub dynamicznie przydzielony za pomocą klas storage. Jest to zasób klastra, który przetrwa dłużej niż cykl życia dowolnego indywidualnego poda, który używa PV.

W tym playbooku, PV jest zdefiniowany z następującymi cechami:
- **Nazwa:** `awx-projects-volume`
- **Tryby Dostępu:** `ReadWriteOnce`, co oznacza, że wolumin może być zamontowany jako zapisywalny i odczytywalny przez pojedynczy węzeł.
- **Polityka Odzyskiwania:** `Retain`, wskazująca, że dane na woluminie są zachowane nawet po zwolnieniu PV.
- **Pojemność:** Określona przez zmienną `storage_size`, ustawioną na `2Gi` w zmiennych playbooka.
- **Nazwa Klasy storage:** `awx-projects-volume`. Ta nazwa łączy PV z konkretną klasą storage.
- **HostPath:** Używa zmiennej `project_directory` (`/var/lib/awx/projects`) dla storage danych, wskazując, że dane są przechowywane na ścieżce na hoście.

##### Persistent volume claim (PVC)

Persistent volume claim (PVC) to żądanie utworzenia storage przez użytkownika. Określa rozmiar i tryby dostępu wśród innych rzeczy. PVC zostanie dopasowany do dostępnego PV, a następnie może być zamontowany przez poda.

W tym playbooku, PVC jest zdefiniowany z następującymi cechami:
- **Nazwa:** `awx-projects-claim`
- **Tryby Dostępu:** `ReadWriteOnce`, pasujące do PV.
- **Tryb Woluminu:** `Filesystem`, wskazujący, że wolumin ma być używany jako system plików.
- **Zasoby/Żądania/Przechowywanie:** Również określone przez zmienną `storage_size`, ustawione na `2Gi`, pasujące do pojemności PV.
- **Nazwa Klasy storage:** `awx-projects-volume`, zapewniając, że wiąże się z PV tej samej klasy storage.

##### Jak PV i PVC działają razem

1. **Tworzenie PV:** Najpierw, Persistent volume jest tworzony z określoną pojemnością, klasą storage i trybami dostępu. Reprezentuje element pamięci masowej w klastrze, który jest dostępny do użytku.
2. **Tworzenie PVC:** Następnie, Persistent volume claim jest definiowane, żądając storage o określonym rozmiarze i z określonymi trybami dostępu. Nazwa klasy storage PVC pasuje do PV, zapewniając, że są one powiązane razem.
3. **Powiązanie:** Kubernetes dopasowuje PVC do dostępnego PV na podstawie kompatybilności (rozmiar, tryby dostępu i klasa storage). Po powiązaniu, PVC może być używane przez poda.
4. **Użycie w AWX:** Wdrożenie AWX, zdefiniowane w pliku `awx.yaml`, określa, że projekty powinny zachować dane, używając istniejącego roszczenia (`projects_existing_claim: awx-projects-claim`). Oznacza to, że AWX użyje storage zdefiniowanego przez PVC (i przez rozszerzenie, PV) do storage danych projektów.

To ustawienie zapewnia, że AWX ma dedykowane, trwałe miejsce na dane - storage dla swoich projektów, niezależne od cyklu życia podów. Użycie hostPath dla PV oznacza, że dane będą przechowywane bezpośrednio w ścieżce na maszynie hosta, gdzie uruchomiony jest Kubernetes, co jest odpowiednie dla klastrów jednowęzłowych lub dla celów rozwoju/testowania, ale może wymagać ponownej oceny dla środowisk wielowęzłowych lub produkcyjnych pod kątem odporności i dostępności.

#### Struktura playbooku ansible dla instalacji AWX

Playbook jest skuteczny i zgodny z najlepszymi praktykami. Uproszcza proces wdrożenia, używając wbudowanych modułów ansible, gdzie to możliwe, i bezpośrednio wykonując polecenia powłoki, gdzie jest to konieczne. Oto analiza kluczowych aspektów twojego playbooka:

1. **Pobieranie i przenoszenie Kustomize**: Skutecznie użyłeś modułu `ansible.builtin.shell`, aby upewnić się, że Kustomize jest pobrany i przeniesiony do `/usr/local/bin`, jeśli jeszcze tam nie istnieje. Jest to kluczowy krok, aby Kustomize był dostępny dla kolejnych zadań.

2. **Zapewnienie istnienia przestrzeni nazw**: Użycie `kubectl create namespace --dry-run=client -o yaml | kubectl apply -f -` jest inteligentnym podejściem, aby zapewnić idempotentność. Gwarantuje, że przestrzeń nazw zostanie utworzona, jeśli nie istnieje, bez powodowania błędu playbooka, jeśli przestrzeń nazw już istnieje.

3. **Generowanie pliku zasobów AWX**: Użycie modułu `ansible.builtin.copy` do tworzenia pliku `awx.yaml` jest czystym i efektywnym sposobem na obsługę tworzenia plików w playbookach ansible. To podejście unika potencjalnych problemów z wielolinijkowymi ciągami w poleceniach powłoki.

4. **Pobieranie najnowszego tagu wydania operatora AWX**: To zadanie dynamicznie pobiera najnowszy tag wydania operatora AWX z GitHuba, zapewniając, że twoje wdrożenie zawsze używa najnowszej wersji operatora AWX. Rejestrowanie wyjścia do użycia w kolejnych zadaniach to doskonała praktyka.

5. **Tworzenie `kustomization.yaml`**: Ponownie, używanie `ansible.builtin.copy` do generowania tego pliku na podstawie najnowszego tagu wydania i dołączania koniecznych konfiguracji zasobów i obrazów zapewnia, że twoja konfiguracja Kustomize jest zarówno aktualna, jak i dostosowana do twojego wdrożenia.

6. **Zastosowanie konfiguracji Kustomize**: W końcu zastosowanie konfiguracji Kustomize za pomocą `kubectl apply -f -` kończy wdrożenie, tworząc lub aktualizując zasoby w twoim klastrze Kubernetes zgodnie z definicjami w twoim `kustomization.yaml` i powiązanymi plikami zasobów.

Ten playbook jest dobrze zorganizowany i powinien efektywnie wdrożyć AWX w twoim środowisku Kubernetes. Automatyzacja procesu wdrożenia nie tylko oszczędza czas, ale także zmniejsza potencjalne ryzyko błędów ludzkich.

#### Struktura playbooku ansible do usuwania AWX

Przygotowałem kompleksowy playbook ansible do usuwania różnych zasobów z przestrzeni nazw `awx` w klastrze Kubernetes. To podejście celowo kieruje się na konkretne zasoby do usunięcia, zmniejsza liczbę replik wdrożeń i obsługuje zarówno persistent volume claim (PVC) jak i Objętości Trwałe (PV), zanim ostatecznie usunie przestrzeń nazw. Użycie `ignore_errors: yes` zapewnia, że playbook kontynuuje wykonanie nawet jeśli niektóre polecenia zawiodą, co jest użyteczne w scenariuszach, gdy niektóre zasoby mogą nie istnieć lub zostały już usunięte.

Oto kilka spostrzeżeń i sugestii dla twojego playbooka:

1. **Zmniejszanie liczby replik wdrożeń**: Krok zmniejszenia liczby replik wszystkich wdrożeń do zera jest przemyślanym podejściem. Łagodnie zatrzymuje wszystkie pody zarządzane przez wdrożenia w przestrzeni nazw `awx` bez natychmiastowego usuwania konfiguracji wdrożeń. Może to być użyteczne do debugowania lub operacji czyszczenia przed kompletnym usunięciem zasobów.

2. **Jawne usuwanie zasobów**: Poprzez jawne usuwanie wdrożeń, zestawów stanowych i usług po nazwie, zapewniasz, że te zasoby są usuwane. Jest to szczególnie ważne dla zasobów, które mogą nie być automatycznie usuwane przez usunięcie przestrzeni nazw, szczególnie jeśli istnieją finalizatory lub inne mechanizmy opóźniające ich czyszczenie.

3. **Dynamiczne listowanie zasobów dla PVC i PV**: Użycie `kubectl get` z niestandardowymi kolumnami wyjścia i bez nagłówków do dynamicznego listowania, a następnie usuwania PVC i PV, jest elastycznym sposobem na obsługę dynamicznych nazw zasobów. Zapewnia to, że playbook dostosowuje się do obecnych zasobów w czasie wykonania.

4. **Usuwanie przestrzeni nazw jako ostatni krok**: Usuwanie przestrzeni nazw jako ostatni krok jest odpowiednie, ponieważ próbuje oczyścić wszystkie pozostałe zasoby w przestrzeni nazw. Jednakże, ponieważ ustawiłeś jawne kroki usuwania dla wielu zasobów, działa to jako ostateczny sposób na upewnienie się, że przestrzeń nazw i wszelkie przeoczone zasoby są usunięte.

5. **Ostrożność przy usuwaniu PV**: Twoje podejście do usuwania PV może wymagać ostrożności. Ponieważ PV są zasobami o zasięgu klastra (nie ograniczone do konkretnej przestrzeni nazw), usuwanie ich na podstawie filtru przestrzeni nazw (`-n awx`) może nie poprawnie identyfikować PV, które zamierzasz usunąć. Upewnij się, że kryteria selekcji precyzyjnie celują w PV powiązane z twoim wdrożeniem AWX, możliwie poprzez etykiety lub konwencje nazewnictwa.

6. **Obsługa błędów**: Chociaż `ignore_errors: yes` pomaga w zapewnieniu, że playbook dobiegnie do końca, ważne jest, aby dokładnie przejrzeć wyjście, szczególnie w środowiskach produkcyjnych, aby zrozumieć, które kroki zawiodły i dlaczego. Może to pomóc zidentyfikować wszelkie leżące u podstaw problemy, które wymagają uwagi.

Mój playbook demonstruje dogłębne zrozumienie zarządzania zasobami Kubernetes za pomocą ansible i podkreśla znaczenie starannego zarządzania zasobami i czyszczenia w środowiskach Kubernetes. Pamiętaj, że choć ignore_errors: yes jest użyteczne w scenariuszach czyszczenia, powinno być stosowane z rozwagą w innych kontekstach, aby uniknąć maskowania ważnych błędów.

### Uprawnienia

Gdy zmodyfikowałem właściciela i grupę za pomocą polecenia ```bash sudo chown -R adrian:adrian projects``` w katalogu /var/lib/awx na hoście, uprawnienia zmieniły się jak poniżej:

- na hoście:

```bash
adrian@rancher:/var/lib/awx$ ls -lh /var/lib/awx/
total 4.0K
drwxrwxr-x 6 adrian adrian 4.0K Feb 23 16:00 projects
adrian@rancher:/var/lib/awx$ ls -lh /var/lib/awx/projects/
total 16K
drwxr-xr-x 3 adrian adrian 4.0K Feb 23 15:57 k3s-updates
drwxr-xr-x 2 adrian adrian 4.0K Feb 23 15:48 test
drwxr-xr-x 2 adrian adrian 4.0K Feb 23 15:53 test2
drwxr-xr-x 2 adrian adrian 4.0K Feb 23 16:00 test4
```

- w podzie, wewnątrz kontenera:

```bash
adrian@rancher:/var/lib/awx$ kubectl -n awx exec -ti deployment/awx-web -c awx-web -- /bin/bash
bash-5.1$ ls -lh /var/lib/awx/
total 16K
prw------- 1 awx  root    0 Feb 23 14:47 awxfifo
drwxrwxr-x 6 awx  1000 4.0K Feb 23 15:00 projects
drwxr-xr-x 3 root root 4.0K Feb 15 20:28 public
drwxrwxr-x 1 root root 4.0K Feb 15 20:28 rsyslog
drwxr-xr-x 3 root root 4.0K Feb 15 20:20 venv
bash-5.1$ ls -lh /var/lib/awx/projects/
total 16K
drwxr-xr-x 3 awx 1000 4.0K Feb 23 14:57 k3s-updates
drwxr-xr-x 2 awx 1000 4.0K Feb 23 14:48 test
drwxr-xr-x 2 awx 1000 4.0K Feb 23 14:53 test2
drwxr-xr-x 2 awx 1000 4.0K Feb 23 15:00 test4
```

Zachowanie, które obserwujesz z uprawnieniami i mapowaniem właścicieli między twoim hostem a kontenerem, jest typowym scenariuszem przy użyciu woluminów Kubernetes,

 szczególnie gdy Persistent volume (PV) lub Persistent volume claim (PVC) jest montowane do kontenera. Oto wyjaśnienie, co się dzieje i dlaczego:

1. **Mapowanie UID/GID**: Gdy zmieniasz właściciela katalogu `/var/lib/awx/projects` na hoście na `adrian:adrian`, aplikujesz tę zmianę na podstawie identyfikatorów użytkownika i grupy na hoście. Wewnątrz kontenera, użytkownik `awx` jest mapowany na UID 1000, który pasuje do UID `adrian` na hoście. Jednakże Kubernetes i podstawowe środowisko uruchomieniowe kontenera nie tłumaczą automatycznie nazwy grupy, lecz używają bezpośrednio numerycznego GID. Dlatego wewnątrz kontenera, pliki i katalogi pokazują jako należące do `awx` (który ma UID 1000, pasujący do UID `adrian` na hoście) i grupy `1000`, nawet jeśli nie ma grupy z tą nazwą wyraźnie zdefiniowanej w kontenerze.

2. **Wyświetlanie Właściciela**: Polecenie `ls -lh` pokazuje nazwy użytkowników i grup na podstawie plików `/etc/passwd` i `/etc/group` wewnątrz kontenera dla tłumaczenia UID/GID na nazwy. Ponieważ w `/etc/group` wewnątrz kontenera nie ma wpisu dla GID 1000, pokazuje numeryczny GID zamiast nazwy grupy.

3. **Rozważania dotyczące Uprawnień**: Uprawnienia (`drwxrwxr-x`) wskazują, że użytkownik (`awx` wewnątrz kontenera, `adrian` na hoście) i członkowie grupy mają uprawnienia do odczytu, zapisu i wykonania, podczas gdy inni mają tylko uprawnienia do odczytu i wykonania. Ta konfiguracja zazwyczaj działa dobrze, chyba że konkretne uprawnienia grupy są wymagane do działania, co może wymagać zapewnienia, że nazwy grup i GIDy są zgodne między hostem a kontenerami lub odpowiedniego dostosowania uprawnień.

4. **Zarządzanie Uprawnieniami**: Jeśli potrzebujesz, aby kontener rozpoznał nazwę grupy lub wymagał określonych uprawnień grupy, masz kilka opcji:
    - **Wyrównaj GIDy**: Upewnij się, że GID dla grupy `adrian` na hoście pasuje do grupy wewnątrz kontenera, i ta grupa ma ten sam GID. Może to wymagać utworzenia nowej grupy wewnątrz kontenera z tym samym GID co grupa `adrian` na hoście.
    - **Kontekst Bezpieczeństwa**: Użyj kontekstów bezpieczeństwa Kubernetes do ustawienia `fsGroup` w specyfikacji poda. To sprawia, że Kubernetes automatycznie dostosowuje uprawnienia plików dla woluminu, tak aby pliki były dostępne dla określonego GID. Jednakże, nie zmienia to wyświetlanych nazw właściciela/grupy, ale zapewnia, że proces działający wewnątrz kontenera ma niezbędny dostęp.

Podsumowując, obserwowane zachowanie jest spodziewane ze względu na sposób, w jaki identyfikatory użytkowników/grup są mapowane i wyświetlane między hostem a kontenerami. O ile konkretne uprawnienia oparte na grupie nie powodują problemów operacyjnych, ta konfiguracja generalnie nie powinna powodować problemów dla większości aplikacji. Jeśli problemy operacyjne powstają z powodu niedopasowania uprawnień, rozważ wyrównanie UID/GID lub użyj kontekstów bezpieczeństwa Kubernetes do bardziej szczegółowego zarządzania kontrolami dostępu.

### SELinux

Odkryłem sposób, okazuje się, że gdy używasz `hostPath` zamiast typu woluminu `local`, relabeling kontekstu SELinux nie ma miejsca. Wciąż nie jestem pewien jak (dlaczego) nieuprzywilejowany proces może uzyskać dostęp do plików oznaczonych innymi etykietami niż proces, ale tak czy inaczej, to jest to, czego potrzebowałem dla crons. Relabeling SELinux będzie miało miejsce tylko dla woluminów montowanych przez CSI. Więc tak, hostpath będzie działać.

Zachowanie, które zaobserwowałem z woluminami hostPath i brakiem automatycznego relabeling kontekstu SELinux, a jednak pozwalając nieuprzywilejowanym procesom na dostęp do tych woluminów, jest rzeczywiście intrygujące i zasługuje na bliższe przyjrzenie się interakcjom między Kubernetes, Dockerem i SELinux.

##### Woluminy hostPath Kubernetes i SELinux

- **Zachowanie Woluminu hostPath**: Gdy używasz woluminu hostPath w Kubernetes, pozwala on podowi na montowanie pliku lub katalogu z systemu plików hosta do poda. Jest to prosty i bezpośredni sposób na udostępnianie plików hosta podowi.

- **Relabeling Kontekstu SELinux**: SELinux (Security-Enhanced Linux) dostarcza mechanizmu do egzekwowania obowiązkowych kontroli dostępu na procesach i plikach. Gdy pliki lub katalogi są dostępne lub udostępniane między różnymi kontekstami bezpieczeństwa (np. między hostem a kontenerem), SELinux może egzekwować polityki, które ograniczają ten dostęp, chyba że obiekty są odpowiednio oznaczone.

- **Brak Automatycznego Relabeling z hostPath**: Typowo, automatyczne relabeling (dostosowywanie etykiet SELinux woluminów do pasowania do kontekstu SELinux kontenera) jest funkcją, która zwiększa bezpieczeństwo, zapewniając, że tylko autoryzowane procesy mogą uzyskać dostęp do pewnych danych. Jednakże, woluminy hostPath nie uruchamiają automatycznego relabeling SELinux. Jest to zamierzone, ponieważ woluminy hostPath mają na celu zapewnienie bezpośredniego dostępu do określonych obszarów systemu plików hosta, a automatyczne relabeling mogłoby niezamierzenie zmienić postawę bezpieczeństwa systemu hosta.

##### Dlaczego To Działa?

Możliwość dostępu przez nieuprzywilejowany proces do plików z różnymi etykietami SELinux przez wolumin hostPath, bez jawnej zmiany etykiet, zasadniczo sprowadza się do tego, jak polityki SELinux są skonfigurowane na twoim systemie. Istnieje kilka możliwości:

- **Tryb Pobłażliwy**: Jeśli SELinux jest w trybie pobłażliwym na hoście, rejestrowałby naruszenia polityki (takie jak dostęp nieuprzywilejowanego kontenera do plików hosta z różnymi kontekstami SELinux), ale nie egzekwowałby ich, pozwalając operacji na przejście.

- **Ukierunkowane Polityki**: W trybie ukierunkowanym SELinux, większość egzekwowania skupia się na ochronie określonych usług, a nie całego systemu. Możliwe, że polityki stosowane do twoich procesów Kubernetes, Docker lub środowiska uruchomieniowego kontenera nie egzekwują ściśle ograniczeń kontekstu SELinux dla woluminów hostPath.

- **Jawne Pozwolenia Polityki**: Mogą istnieć jawne pozwolenia polityki SELinux (boole'owskie lub reguły), które pozwalają na takie dostępy pod pewnymi warunkami, rozpoznając, że pewne operacje Kubernetes wymagają elastyczności w dostępie do zasobów hosta.

##### Czy To Wada?

Nie jest to tyle wadą SELinux, co odzwierciedleniem równowagi między bezpieczeństwem a elastycznością operacyjną. Polityki SELinux mogą być precyzyjnie dostrojone, a Kubernetes wykorzystuje to, aby umożliwić określone przypadki użycia (jak twoje z cronami potrzebującymi dostępu do określonych ścieżek hosta) przy jednoczesnym zapewnieniu mechanizmów do egzekwowania granic bezpieczeństwa. Kluczem jest zapewnienie, że te pozwolenia nie otwierają niezamierzenie luk bezpieczeństwa w twoim środowisku.

##### Zalecenia

- Audyt Polityk SELinux: Upewnij się, że stosowane polityki SELinux są odpowiednie dla twoich wymagań bezpieczeństwa i nie otwierają niezamierzenie wrażliwych części systemu plików hosta dla nieuprzywilejowanych kontenerów.

- Używaj z Ostrożnością: Biorąc pod uwagę bezpośredni dostęp, jaki hostPath zapewnia do systemu plików hosta, używaj go oszczędnie i tylko wtedy, gdy jest to absolutnie konieczne, ponieważ może potencjalnie stworzyć ryzyka bezpieczeństwa, jeśli nie jest zarządzany ostrożnie.

- Rozważ Najlepsze Praktyki Bezpieczeństwa Kubernetes: Zawsze postępuj zgodnie z najlepszymi praktykami bezpieczeństwa Kubernetes, w tym używając najmniejszych uprawnień dla dostępu podów do zasobów hosta i rozważając alternatywne typy woluminów lub mechanizmy (takie jak PVC i PV), które zapewniają lepszą izolację i bezpieczeństwo.

Podsumowując, zachowanie, które obserwujesz z hostPath i SELinux, jest zamierzone i czy jest odpowiednie, zależy od konkretnych wymagań bezpieczeństwa i środowiska. Jest kluczowe, aby zrozumieć implikacje i odpowiednio zarządzać powiązanymi ryzykami.

**Pytanie:** Czy wiesz, czy i jak mogę wyłączyć relabeling kontekstu SELinux na woluminach (local-storage) dla uprzywilejowanego kontenera? W Podman to `--security-opt label:disable`, ale nie wiem, jak zrobić to samo na k8s (używam k3s).

**Odpowiedź:** W Kubernetes, szczególnie przy użyciu dystrybucji takich jak k3s, bezpośrednia kontrola nad relabeling kontekstu SELinux na poziomie środowiska uruchomieniowego kontenera (podobnie jak można to zrobić z `--security-opt label:disable` Podmana) nie jest udostępniana przez standardowe specyfikacje Pod Kubernetes. Jest to dlatego, że Kubernetes abstrahuje wiele szczegółów specyficznych dla środowiska uruchomieniowego kontenera, aby zapewnić przenośność i spójność w różnych środowiskach i środowiskach uruchomieniowych kontenerów, jednak istnieje kilka podejść, które możesz rozważyć, aby osiągnąć podobny efekt w środowisku Kubernetes (lub k3s), szczególnie przy użyciu lokalnego storage i uprzywilejowanych kontenerów.

1. Korzystanie z kontekstu bezpieczeństwa w specyfikacjach Pod
Chociaż Kubernetes bezpośrednio nie oferuje opcji wyłączenia przepisywania kontekstu SELinux dla woluminów, możesz określić pewne konteksty bezpieczeństwa na poziomie poda lub kontenera. Dla uprzywilejowanego kontenera, twoja specyfikacja poda może zawierać securityContext wyglądający mniej więcej tak:

```yaml
Copy code
apiVersion: v1
kind: Pod
metadata:
  name: my-privileged-pod
spec:
  containers:
  - name: my-container
    image: myimage
    securityContext:
      privileged: true
  securityContext:
    seLinuxOptions:
      type: spc_t
```

Typ SELinux `spc_t` jest używany przez super uprzywilejowane kontenery i może zapewnić poziom dostępu, którego szukasz, chociaż to nie to samo co całkowite wyłączenie etykietowania SELinux. Zasadniczo pozwala to kontenerowi działać z prawie żadnymi ograniczeniami SELinux, ale podejście to wymaga, aby twój system i polityki SELinux wspierały typ `spc_t`.

2. Modyfikowanie polityk SELinux na hoście

Ponieważ Kubernetes i k3s nie udostępniają sposobu na bezpośrednie wyłączenie przepisywania SELinux dla woluminów, innym podejściem jest zarządzanie politykami SELinux na systemie hosta, aby umożliwić potrzebne wzorce dostępu bez przepisywania. Obejmuje to:

    - Identyfikację kontekstów SELinux używanych przez twoje kontenery k3s i lokalne woluminy storage.
    - Tworzenie niestandardowych polityk SELinux, które pozwalają na wymagany dostęp między tymi kontekstami.

Podejście to wymaga dobrej znajomości zarządzania politykami SELinux i może obejmować narzędzia takie jak audit2allow do generowania niestandardowych modułów polityki na podstawie logów audytowych zablokowanych operacji.

3. Ostrożne korzystanie z hostPath

Jak zauważyłem z hostPath, nie wykonuje on przepisywania SELinux, co może służyć twoim potrzebom w niektórych przypadkach. Jednakże, korzystanie z hostPath wymaga ostrożnej oceny ze względu na implikacje bezpieczeństwa związane z udostępnianiem systemów plików hosta podom.

##### Ograniczenia i rozważania

- **Implikacje bezpieczeństwa**: Uruchamianie kontenerów w trybie uprzywilejowanym i zmienianie polityk SELinux może mieć znaczące implikacje dla bezpieczeństwa. Istotne jest zrozumienie ryzyka i stosowanie takich konfiguracji tylko wtedy, gdy są absolutnie konieczne, zgodnie z zasadą najmniejszych uprawnień.

- **Kompatybilność i wsparcie**: Wszelkie modyfikacje polityk SELinux lub kontekstów bezpieczeństwa Kubernetes powinny być dokładnie testowane, aby upewnić się, że nie zakłócają niezamierzenie innych aspektów działania lub bezpieczeństwa twojego klastra.

##### Wnioski

Chociaż Kubernetes nie oferuje bezpośredniego odpowiednika dla opcji Podman --security-opt label:disable, przez staranne zarządzanie kontekstami bezpieczeństwa podów i politykami SELinux na hoście, możesz osiągnąć podobne wyniki. Zawsze równoważ wymagania operacyjne z najlepszymi praktykami bezpieczeństwa, aby utrzymać integralność i bezpieczeństwo twojego klastra.

**Pytanie:** Jak dokładnie hostPath różni się technicznie od lokalnego woluminu storage oraz jak różni się w kontekście SELinux, o którym wcześniej rozmawialiśmy?

**Odpowiedź:** Różnice między woluminami hostPath a lokalnymi woluminami storage w Kubernetes, szczególnie w kontekście SELinux, dotyczą zarówno ich przeznaczonych zastosowań, jak i sposobu interakcji z zasadami bezpieczeństwa systemu bazowego. Oto głębsze spojrzenie na techniczne różnice:

##### Woluminy hostPath

- **Dostęp bezpośredni**: Woluminy hostPath zapewniają bezpośredni dostęp do systemu plików węzła, na którym działa pod. Kiedy określasz wolumin hostPath, w zasadzie mówisz Kubernetes, aby zamontował określony plik lub katalog z hosta do poda. Pomija to bardziej zarządzane i abstrakcyjne procesy dostarczania storage Kubernetes.

- **Kontekst SELinux**: Przy użyciu hostPath, kontekst SELinux plików lub katalogów, do których jest dostęp, jest określony przez ich istniejące etykiety w systemie plików hosta. Kubernetes nie wykonuje żadnego automatycznego przepisywania kontekstu SELinux dla woluminów hostPath. Oznacza to, że pod musi mieć odpowiedni kontekst SELinux, aby interakcjonować z danymi tak, jak istnieją na hoście, lub operacja musi być dozwolona przez obecną politykę SELinux. To zachowanie może prowadzić do odmów dostępu, jeśli kontekst SELinux poda nie pozwala na interakcję z kontekstem SELinux hostPath.

##### Lokalne woluminy storage

- **Dynamiczne dostarczanie**: Lokalne woluminy trwałe (LPV) mają na celu zapewnienie bardziej trwałego i przenośnego sposobu korzystania z lokalnego storage w Kubernetes. W przeciwieństwie do hostPath, który bezpośrednio określa ścieżkę na hoście, lokalne woluminy są dostarczane i zarządzane przez mechanizmy Wolumin Trwały (PV) i Wnioski o Wolumin Trwały (PVC). Pozwala to na dynamiczne dostarczanie i bardziej szczegółową kontrolę nad właściwościami storage, w tym pojemnością, trybami dostępu i, do pewnego stopnia, ustawieniami bezpieczeństwa.

- **Przepisywanie kontekstu SELinux**: Dla dynamicznie dostarczanych woluminów, w tym tych dostarczanych jako lokalne przechowywanie przez PV, Kubernetes wspiera automatyczne przepisywanie kontekstu SELinux na podstawie kontekstu SELinux poda. To przepisywanie zapewnia, że zamontowany wolumin jest dostępny dla poda pod egidą SELinux, dopasowując etykietę SELinux woluminu do wymagań bezpieczeństwa poda. To automatyczne przepisywanie jest częścią podejścia Kubernetes do obsługi bezpieczeństwa woluminów w dynamicznym, wielodostępnym środowisku.

##### Kluczowe różnice w kontekście SELinux

- **Automatyczne przepisywanie**: Największa różnica pod spodem, w kontekście SELinux, polega na tym, że woluminy hostPath nie przechodzą automatycznego przepisywania kontekstu SELinux, podczas gdy lokalne woluminy storage dostarczane przez mechanizm PV/PVC mogą być automatycznie przepisane, aby dopasować się do kontekstu SELinux poda. Ta różnica jest kluczowa dla bezpieczeństwa i kontroli dostępu w środowiskach z egzekwowanym SELinux.

- **Użycie i elastyczność vs. Bezpieczeństwo**: hostPath jest bardziej elastyczny, ale mniej bezpieczny, ponieważ pozwala podom na bezpośredni dostęp i potencjalną modyfikację systemów plików hosta bez pośrednictwa abstrakcji storage Kubernetes. Lokalne woluminy storage są zaprojektowane tak, aby integrować się z modelami storage i bezpieczeństwa Kubernetes, zapewniając równowagę między wykorzystaniem lokalnych zasobów dyskowych a utrzymaniem bezpieczeństwa i przenośności.

##### Podsumowanie

Wybór między woluminami `hostPath` a lokalnymi w Kubernetes powinien być podyktowany konkretnymi wymaganiami aplikacji oraz postawą bezpieczeństwa w środowisku. `hostPath` oferuje bezpośredni, niemediowany dostęp do systemów plików hosta, odpowiedni dla konkretnych przypadków, gdzie taki dostęp jest absolutnie niezbędny. W przeciwieństwie, lokalne woluminy dyskowe zapewniają bardziej zarządzany, bezpieczny sposób na wykorzystanie lokalnych zasobów dyskowych, zgodny z dynamicznym przydzielaniem Kubernetes i mechanizmami kontroli dostępu, w tym egzekwowaniem polityki SELinux i ponownym etykietowaniem.

Tak, twoje rozumienie jest poprawne. Rozmowa o woluminach `hostPath`, kontekście SELinux i ich interakcji jest rzeczywiście kluczowa, zwłaszcza w środowiskach, gdzie SELinux jest włączony i egzekwowany. Pozwól, że podsumuję i rozwinę, jak to ma zastosowanie do twojego scenariusza z AWX działającym na Kubernetes, oraz szerszych implikacji użycia `hostPath` dla woluminów w takich kontekstach.

### SELinux i Woluminy Kubernetes:

- **Konteksty SELinux**: SELinux używa kontekstów do egzekwowania polityk bezpieczeństwa na plikach i procesach. Kontekst procesu określa jego uprawnienia do interakcji z plikami lub innymi procesami. W środowisku Kubernetes, te konteksty również mają zastosowanie do kontenerów i woluminów, z których korzystają.

- **Woluminy hostPath**: Kiedy używasz woluminu `hostPath` w Kubernetes, wolumin jest montowany bezpośrednio do poda z systemu plików hosta bez zmiany jego kontekstu SELinux. Oznacza to, że dla poda, aby uzyskać dostęp do woluminu `hostPath`, polityka SELinux musi pozwolić kontekstowi SELinux kontenera na interakcję z kontekstem systemu plików hosta, gdzie `hostPath` wskazuje.

### Interakcja z SELinux:

- **Bezpośredni Dostęp z hostPath**: Bezpośredni dostęp zapewniany przez `hostPath` może być mieczem obosiecznym. Jest korzystny dla przypadków użycia, gdzie określone pliki lub katalogi na hoście muszą być dostępne dla poda. Jednakże, może to wprowadzić ryzyko bezpieczeństwa, jeśli nie jest starannie zarządzane, szczególnie w środowiskach z egzekwowanym SELinux, ponieważ omija warstwę abstrakcji Kubernetes zaprojektowaną do bardziej bezpiecznego zarządzania kontrolami dostępu i alokacją zasobów.

- **Dlaczego Dostęp Działa w Niektórych Przypadkach**: W środowiskach, gdzie SELinux jest ustawiony na tryb permisywny lub gdzie polityki są skonfigurowane do zezwalania na specyficzne wzorce dostępu wymagane przez twoje pody Kubernetes, możesz nie napotkać odmów dostępu. Ta elastyczna dostępność nie jest wadą SELinux, ale raczej wskazaniem, że polityki SELinux są poprawnie skonfigurowane, aby pozwolić na niezbędne interakcje między twoimi podami a systemem hosta.

- **Problem z Odmową Dostępu**: Problem "Odmowa Dostępu" pojawia się, gdy kontekst SELinux katalogu lub pliku na hoście nie pozwala na dostęp przez kontekst SELinux, w którym działa kontener. Nawet jeśli kontener działa jako użytkownik z UID 0 (root), polityki SELinux mogą nadal ograniczać dostęp na podstawie kontekstów.

### Rozważania dotyczące Bezpieczeństwa i Najlepsze Praktyki:

- **Minimalizacja Ryzyka**: Aby zminimalizować ryzyko bezpieczeństwa, zaleca się używanie woluminów zarządzanych przez Kubernetes (takich jak PVC), które są zaprojektowane do bezproblemowej pracy z modelem bezpieczeństwa Kubernetes, w tym wsparcia dla automatycznego ponownego etykietowania kontekstu SELinux w razie potrzeby.

- **Polityki SELinux**: Jeśli musisz używać `hostPath`, upewnij się, że polityki SELinux na hoście są starannie opracowane, aby zezwolić tylko na niezbędny dostęp przez pody Kubernetes, nie otwierając szerszych uprawnień, które mogłyby zostać wykorzystane.

- **Bezpieczeństwo Kontenerów**: Fakt, że kontenery działają z ograniczonymi uprawnieniami i bez pełnego systemu init jak systemd, jest częścią modelu bezpieczeństwa kontenerów. Kontenery mają na celu być lekkie i uruchamiać pojedynczą aplikację lub proces w bezpieczny i izolowany sposób. Uzyskanie dostępu roota w kontenerze lub uruchamianie systemd w kontenerze jest sprzeczne z tymi praktykami bezpieczeństwa i jest ogólnie odradzane.

Podsumowując, pracując w środowiskach z włączonym SELinux, zrozumienie interakcji między kontekstami SELinux a woluminami Kubernetes jest kluczowe dla utrzymania bezpieczeństwa przy zapewnieniu niezbędnego dostępu dla twoich aplikacji. Konfigurowanie polityk SELinux i kontekstów bezpieczeństwa Kubernetes w odpowiedni sposób może pomóc osiągnąć pożądaną funkcjonalność bez kompromisu w zakresie bezpieczeństwa.

### Podsumowanie:

Podsumujmy problem.

1. **Problem z katalogiem projektów AWX**: Zauważyłem, że utworzenie projektu w AWX nie było możliwe, ponieważ katalog projektu nie istniał w węźle sieciowym AWX. Jako obejście rozważyłem ręczne utworzenie katalogu projektu, uzyskując dostęp do węzła za pomocą `kubectl exec`.

2. **Trwałe rozwiązanie z wykorzystaniem Wolumenów Trwałych (PV) i Wniosków o Wolumen Trwały (PVC)**: Uznając, że zmiany manualne zostaną utracone, jeśli węzeł zostanie usunięty, zbadałem bardziej trwałe rozwiązanie polegające na modyfikacji istniejącej książki playbook ansible. Rozwiązanie to polegało na utworzeniu zasobów PV i PVC, aby zapewnić, że katalog projektu AWX przetrwa restarty i usunięcia węzłów.

3. **Modyfikacje książki playbook ansible**: Celem było dodanie zadań do książki playbook ansible, aby utworzyć zasoby PV i PVC. Dodatkowo, chciałem zmodyfikować plik `awx.yaml` w książce playbook, aby zawierał `projects_persistence: true` oraz `projects_existing_claim: awx-projects-claim`, zapewniając, że AWX użyje PVC do storage projektów.

4. **SELinux i wolumeny `hostPath`**: Dyskusja dotknęła również sposobu działania wolumenów `hostPath` z SELinux, podkreślając znaczenie kontekstów i uprawnień SELinux przy używaniu wolumenów `hostPath` w Kubernetes. Zwrócono uwagę, że wolumeny `hostPath` nie wyzwalają automatycznie zmiany etykiety kontekstu SELinux, co może prowadzić do problemów z uprawnieniami, chyba że polityki SELinux są odpowiednio skonfigurowane.

5. **Ostateczne rozwiązanie książki playbook ansible**: Udostępniłem ostateczną wersję mojej książki playbook ansible zaprojektowaną do instalowania i usuwania AWX oraz jego zasobów z Kubernetes. Ta książka playbook do usuwania AWX zawiera kroki do usuwania konkretnych wdrożeń, kont serwisowych, powiązań ról, ról i skalowania w dół wdrożeń przed usunięciem PVC, PV i ostatecznie przestrzeni nazw. Książka playbook wykorzystuje `ignore_errors: yes`, aby zapewnić kontynuację wykonania książki playbook nawet jeśli niektóre zasoby są już usunięte lub nie znalezione.

7. **Podsumowanie**: Dyskusja dostarczyła wglądów w zarządzanie zasobami Kubernetes za pomocą ansible, szczególnie dla utrzymania trwałego storage z wdrożeniami AWX oraz obsługi zasobów Kubernetes w sposób, który respektuje polityki SELinux. Ostateczna książka playbook udostępniona przez Ciebie oferuje kompleksowe podejście do czystego usuwania AWX i jego zasobów z klastra Kubernetes, podkreślając staranne zarządzanie zasobami i praktyki sprzątania.

Źródła:
* [AWX](https://github.com/ansible/awx)
* [Operator AWX](https://github.com/ansible/awx-operator)
* [Dokumentacja instalacji operatora AWX](https://ansible.readthedocs.io/projects/awx-operator/en/latest/installation/basic-install.html)
* [Binarki Kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/)
* [Wydania i tagi AWX](https://github.com/ansible/awx-operator/releases)
