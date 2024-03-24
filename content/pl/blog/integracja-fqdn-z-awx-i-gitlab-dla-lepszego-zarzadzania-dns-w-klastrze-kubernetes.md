---
title: Integracja FQDN z AWX i GitLab dla lepszego zarządzania DNS w klastrze Kubernetes
date: 2024-03-18T10:00:00+00:00
description: Ten poradnik to nieocenione źródło dla administratorów systemów i inżynierów sieci, którzy chcą wykorzystać FQDN z AWX i GitLab do ulepszonego zarządzania DNS w środowiskach Kubernetes.
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
image: images/2024-thumbs/ansible12.webp
---

#### Integracja FQDN z AWX i GitLab

**W tym filmie wyjaśniam, jak zaimplementować FQDN w AWX i GitLab.**

{{<youtube CF5St3wVPhI>}}

Poniżej znajdziesz poradnik podzielony na dwie ważne części. Pierwsza dotyczy Pełnych Nazw Domenowych, czyli FQDN, a druga pokaże, jak zmodyfikować konfigurację CoreDNS w Kubernetes, aby przekierować ruch na zewnętrzny adres IP serwera DNS.

#### Co to jest FQDN?

Jest to pełna nazwa domeny, która jednoznacznie identyfikuje hosta w Internecie. Składa się z nazwy hosta i domeny, zapewniając unikalny adres. Dlaczego jest to ważne? W świecie sieci komputerowych jasność i precyzja są kluczowe. FQDN umożliwiają jasną komunikację, eliminując wszelkie nieporozumienia związane z adresowaniem.

Używanie FQDN jest również najlepszą praktyką w konfigurowaniu usług i urządzeń sieciowych, ponieważ zapewniają stały punkt odniesienia, niezależnie od zmian w adresach IP. Teraz, gdy wiesz, czym jest FQDN i dlaczego jest tak ważne, przejdźmy do drugiej części naszego spotkania.

##### Dodatkowa wiedza:

Termin "fqdn" oznacza Pełną Nazwę Domenową. Reprezentuje ona kompletną nazwę domeny dla konkretnego komputera lub hosta w internecie lub w lokalnej sieci. FQDN składa się z dwóch głównych części: nazwy hosta i nazwy domeny, włącznie z domeną najwyższego poziomu. Na przykład, w "rancher.local", "rancher" jest nazwą hosta, a "local" jest nazwą domeny.

Kiedy używam FQDN w konfiguracjach, zwłaszcza w moich playbookach Ansible i AWX (Ansible dla sieci), dostrzegam kilka korzyści:

1. **Jasność i specyficzność**: FQDN są unikalne. Dzięki zastosowaniu FQDN takiego jak "rancher.local", mogę jednoznacznie identyfikować docelowy system bez żadnych niejasności, co jest niezbędne w złożonych sieciach z licznymi węzłami.

2. **Skalowalność i zarządzanie**: W większych środowiskach, FQDN pomagają mi efektywniej zarządzać i skalować moją infrastrukturę. Pozwalają mi łatwo śledzić, jakie role i usługi są przypisane do których maszyn, szczególnie gdy są zintegrowane z systemami zarządzania konfiguracją i wdrażania, takimi jak Ansible i AWX.

3. **Rozwiązywanie nazw DNS**: FQDN współpracują z DNS (Systemem Nazw Domen), aby przekształcać nazwy zrozumiałe dla ludzi na adresy IP, których używają komputery do komunikacji. Dzięki użyciu FQDN mogę zarządzać hostami przez DNS, co zwykle jest łatwiejsze niż utrzymanie adresów IP, szczególnie jeśli zmieniają się one z powodu DHCP lub innych polityk zarządzania siecią.

4. **Elastyczność**: Przyjęcie FQDN oferuje mi większą elastyczność w organizacji i dostępie do moich systemów. Mogę przenosić usługi między hostami lub zmieniać adresy IP bez konieczności aktualizacji każdej pojedynczej referencji do tego hosta w moich konfiguracjach – wystarczy zaktualizować rekord DNS.

W moim playbooku Ansible ("updates-rancher.yml") używam `fqdn` jako zmiennej, aby określić hosta lub grupę hostów, przeciwko którym powinien zostać uruchomiony playbook. Ustawiając `fqdn` w pliku "vars/fqdn.yml", abstrahuje nazwę docelowego hosta, czyniąc mój playbook bardziej uniwersalnym i dostosowalnym. Oznacza to, że mogę łatwo zmienić docelowy host bez zmieniania podstawowej logiki playbooka – wystarczy prosta aktualizacja pliku `fqdn.yml`.

W moim inwentarzu AWX, nazywając mój host "rancher.local", bezproblemowo integruję to ustawienie FQDN. AWX, wykorzystując Ansible w tle, rozwiązuje "rancher.local" na odpowiadający mu adres IP podczas wykonania poprzez moją konfigurację DNS. To podejście zapewnia spójność z projektem mojego playbooka i centralizuje zarządzanie moją infrastrukturą, czyniąc ją bardziej zarządzalną.

Potwierdzając, że wszystko funkcjonuje zgodnie z oczekiwaniami, przyznaję, że moja konfiguracja prawidłowo wykorzystuje FQDN dla jaśniejs

zej, bardziej zarządzalnej komunikacji sieciowej i zadań automatyzacji. Ta strategia jest zgodna z najlepszymi praktykami w administracji systemem i automatyzacji infrastruktury.

### Część 1

#### Instalacja i konfiguracja GitLab i AWX

Jeśli nie masz zainstalowanego GitLab i AWX, polecam obejrzeć i przeczytać te poradniki:
* [Instalacja i konfiguracja GitLab](/en/blog/gitlab-installation-and-configuration)
* [Jak zainstalować AWX używając playbooka Ansible](https://sysadmin.info.pl/en/blog/how-to-install-awx-using-ansible-playbook/)

Rozpoczęcie pracy z AWX, wersją open-source Ansible Tower, wymaga kilku kroków do skonfigurowania i uruchomienia pierwszego zadania. Poniżej znajduje się szczegółowy przewodnik krok po kroku, który pomoże Ci osiągnąć swój cel:

##### Krok 1: Dodawanie inwentarza w AWX

Pierwszym krokiem jest dodanie nowego inwentarza w AWX. Tutaj zdefiniujemy nasze urządzenia i hosty, z którymi będziemy pracować. W interfejsie AWX znajdź sekcję 'Inventories' i kliknij 'Add new inventory'. Nazwij swój inwentarz odpowiednio, na przykład 'Kubernetes Cluster'.

1. **Tworzenie nowego inwentarza**:
    - Przejdź do zakładki “Inventories” i kliknij “Add”.
    - Nazwij swój inwentarz i zdefiniuj go według potrzeb.
    - W inwentarzu możesz dodać grupy i hosty, które będą celem twoich playbooków Ansible.

##### Krok 2: Dodawanie hosta do inwentarza

Po utworzeniu inwentarza, czas dodać nasze hosty do niego. W naszym przypadku dodamy hosta z naszą nazwą domeny FQDN. W panelu inwentarza wybierz 'Hosts' i kliknij 'Add host'. W polu 'Name' wprowadź nazwę swojej domeny, na przykład 'rancher.local', zamiast tradycyjnego adresu IP. Pamiętaj, używanie FQDN zwiększa czytelność i upraszcza zarządzanie.

Jak widać na moim filmie, w AWX, w inwentarzu o nazwie rancher, zdefiniowałem hosta, przypisanego do inwentarza rancher. W polu o nazwie name, zamiast adresu IP wpisałem rancher.local dla tego hosta.

##### Krok 3: Konfiguracja repozytorium GitLab

Następnie skonfigurujemy nasze repozytorium GitLab. Musimy utworzyć katalog `vars` w głównym katalogu naszego projektu. W tym katalogu utworzymy plik o nazwie `fqdn.yml`. Otwórz ten plik i dodaj linię definiującą nasze FQDN, w ten sposób:

```yaml
fqdn: 'rancher.local'
```

Zapisz i zamknij plik. Pamiętaj, aby wysłać zmiany do repozytorium.

##### Krok 4: Modyfikacja playbooka Ansible

Teraz, gdy mamy gotowe nasze zmienne, musimy zaktualizować nasz playbook Ansible, aby korzystał z tych informacji. Otwórz swój playbook i upewnij się, że definiuje użycie zmiennych z pliku `vars/fqdn.yml` na początku:

```yaml
---
- name: Konfiguracja i zarządzanie hostem
  hosts: "{{ fqdn }}"
  become: yes
  vars_files:
    - vars/fqdn.yml
  tasks:
    # Wstaw tutaj swoje zadania
```

Ta zmiana pozwala Ansible dynamicznie korzystać z wartości FQDN, która została zdefiniowana w naszym repozytorium GitLab, zwiększając elastyczność i skalowalność naszych operacji.

##### Krok 5: Tworzenie szablonu zadania

1. **Tworzenie szablonu zadania**:
    - Przejdź do zakładki “Templates” i kliknij “Add” → “Job Template”.
    - Nazwij szablon, wybierz wcześniej utworzony projekt i playbook, który chcesz uruchomić.
    - Wybierz inwentarz, którego będziesz używać.
    - W sekcji “Credentials” dodaj dane uwierzytelniające niezbędne do połączenia z twoimi serwerami (np. klucze SSH).
    - Zapisz szablon.

##### Krok 6: Uruchamianie szablonu zadania

1. **Uruchamianie zadania**:
    - Znajdź swój szablon zadania na liście i kliknij przycisk “Launch” obok niego, aby rozpocząć zadanie.
    - Możesz śledzić wykonanie zadania w czasie rzeczywistym.

### Dodatkowe wskazówki

- **Automatyzacja**: Rozważ wykorzystanie funkcji AWX do automatyzacji uruchamiania zadań, np. poprzez harmonogramy lub webhooki.
- **Dokumentacja i pomoc**: Oficjalna dokumentacja AWX jest doskonałym źródłem wiedzy na temat zaawansowanych funkcji i rozwiązywania problemów.

Aby zaktualizować systemy za pomocą różnych menedżerów pakietów, takich jak `apt`, z Ansible, możesz napisać playbook, który wykrywa system operacyjny (lub jego rodzinę) i stosuje odpowiednią komendę aktualizacji. Poniżej znajduje się przykładowy playbook, który realizuje to zadanie.

```yaml
---
- name: Aktualizacja wszystkich systemów i restart, jeśli jest potrzebny, tylko jeśli dostępne są aktualizacje
  hosts: "{{ fqdn }}"
  become: yes
  vars_files:
    - vars/fqdn.yml
  tasks

:
    # Wstępne sprawdzenia dostępnych aktualizacji
    - name: Sprawdzenie dostępnych aktualizacji (apt)
      apt:
        update_cache: yes
        upgrade: 'no' # Tylko sprawdź aktualizacje bez instalacji
        cache_valid_time: 3600 # Unikaj niepotrzebnych aktualizacji pamięci podręcznej
      register: apt_updates
      changed_when: apt_updates.changed
      when: ansible_facts['os_family'] == "Debian"

    # Aktualizacja systemów na podstawie sprawdzeń
    # Systemy oparte na Debianie aktualizują i restartują
    - name: Aktualizacja systemów apt, jeśli dostępne są aktualizacje
      ansible.builtin.apt:
        update_cache: yes
        upgrade: dist
      when: ansible_facts['os_family'] == "Debian" and apt_updates.changed

    - name: Sprawdzenie, czy potrzebny jest restart na systemach opartych na Debianie
      stat:
        path: /var/run/reboot-required
      register: reboot_required_file
      when: ansible_facts['os_family'] == "Debian" and apt_updates.changed

    - name: Restart systemu opartego na Debianie, jeśli jest wymagany
      ansible.builtin.reboot:
      when: ansible_facts['os_family'] == "Debian" and apt_updates.changed and reboot_required_file.stat.exists
```

### Wyjaśnienie:

- **hosts: {{ fqdn }}**: Jest to zmienna placeholder w Ansible, która powinna zostać zastąpiona rzeczywistą pełną nazwą domeny docelowych hostów lub nazwą grupy Ansible z twojego inwentarza.
- **become: yes**: Podnosi uprawnienia do roota (podobnie do sudo), co jest wymagane do zarządzania pakietami.
= **vars_files**: jest dyrektywą służącą do dołączania zmiennych z zewnętrznych plików do twojego playbooka. Plik vars/fqdn.yml jest ścieżką do pliku YAML, który zawiera definicje zmiennych.
- **tasks**: Sekcja zadań, gdzie każde zadanie aktualizuje systemy z różnymi menedżerami pakietów w zależności od rodziny systemu operacyjnego.
- **when**: Warunek sprawdzający typ systemu operacyjnego hosta, aby wykonać odpowiednią komendę aktualizacji.
- **ansible.builtin.\<moduł\>**: Moduł Ansible odpowiedzialny za zarządzanie pakietami na różnych systemach operacyjnych.
- **moduł stat**: Używany do sprawdzenia obecności pliku `/var/run/reboot-required` w systemach opartych na Debianie, który jest tworzony, gdy aktualizacja wymaga restartu.
- **moduł reboot**: Uruchamia restart systemu, jeśli jest potrzebny. Możesz dostosować ten moduł, dodając parametry, takie jak `msg` dla komunikatu restartu, `pre_reboot_delay` dla opóźnienia przed restartem itp.
- **register**: Przechowuje wynik komendy lub sprawdzenia w zmiennej, która później może być użyta w warunkach (`when`).

### Uwagi:

- **update_cache**: Dla menedżerów pakietów, które tego wymagają (`apt`), ta opcja odświeża lokalną pamięć podręczną pakietów przed próbą aktualizacji.
- **upgrade: no**: Zapewnia, że sprawdzenie faktycznie nie aktualizuje żadnych pakietów.
- **cache_valid_time**: Zapobiega zadaniu aktualizacji pamięci podręcznej, jeśli została ona zaktualizowana niedawno (3600 sekund w tym przykładzie).
- **changed_when**: Ta niestandardowa warunkowość jest używana do ustalenia, czy aktualizacje są faktycznie dostępne. Dla `apt` sprawdza wynik polecenia.
- **upgrade**: Dla `apt`, opcja `dist` oznacza pełną aktualizację dystrybucji.

### Dostosowanie:

Możesz dostosować ten playbook, dodając dodatkowe zadania lub modyfikując istniejące, aby spełniały konkretn
e wymagania twojego środowiska, takie jak dodanie restartu systemu po aktualizacjach lub filtrowanie aktualizacji dla określonych pakietów.

### Ważne uwagi:

- Zaleca się przetestowanie tego playbooka w kontrolowanym środowisku przed uruchomieniem go w produkcji, szczególnie sekcje odpowiedzialne za restarty systemu, aby upewnić się, że wszystkie zadania działają zgodnie z oczekiwaniami i nie powodują niezamierzonych przerw w usługach.

Te wstępne zadania zapewniają, że aktualizacje systemu i potencjalne restarty są wykonywane tylko wtedy, gdy dostępne są nowe aktualizacje pakietów, oszczędzając czas i ograniczając niepotrzebne zmiany w zarządzanych środowiskach.

### Skup się na tym zadaniu w playbooku Ansible:

```yaml
- name: Restart systemu opartego na Debianie, jeśli jest wymagany
      ansible.builtin.reboot:
      when: ansible_facts['os_family'] == "Debian" and apt_updates.changed and reboot_required_file.stat.exists
```      

Dodanie opcji restartu maszyny po aktualizacji w playbooku Ansible może zakłócić zadanie AWX, szczególnie gdy uaktualniasz hosta, na którym zainstalowane są Kubernetes i AWX, z kilku powodów:

1. **Przerwa w usłudze**: AWX działa jako zestaw kontenerów w klastrze Kubernetes. Jeśli zainicjujesz restart maszyny hosta jako część procesu aktualizacji, doprowadzi to do tymczasowej niedostępności usługi AWX. Podczas restartu wszystkie procesy, w tym pody Kubernetes uruchamiające AWX, zostaną zatrzymane. W rezultacie zadanie AWX, które zainicjowało restart, str

aci swój kontekst wykonania - nie będzie mogło monitorować, zarządzać ani raportować stanu procesu aktualizacji ani restartu, ponieważ usługi AWX będą wyłączone.

2. **Niedokończone zadanie**: Gdy host uruchomi się ponownie, zadanie AWX może zostać oznaczone jako nieudane lub niekompletne, ponieważ proces restartu przerywa wykonanie zadania. Ansible (a co za tym idzie AWX) polega na trwałych połączeniach z zarządzanymi hostami do wykonania zadań. Restart przerywa to połączenie, uniemożliwiając AWX otrzymanie sygnału o pomyślnym zakończeniu od zaktualizowanego hosta.

3. **Integralność danych i zarządzanie stanem**: Jeśli baza danych AWX lub inne kluczowe usługi nie zostaną poprawnie zamknięte przed restartem hosta, istnieje ryzyko uszkodzenia danych lub ich utraty. Ponadto, AWX musi utrzymywać stan i kontekst dla uruchomionych zadań; nagły restart może prowadzić do niespójności lub utraty informacji o stanie.

4. **Zależność od czynników zewnętrznych**: Restart może zależeć od różnych zewnętrznych czynników, takich jak konfiguracje sieciowe, ustawienia rozruchu i sekwencja uruchamiania usług. Jeśli te nie są poprawnie skonfigurowane, host może nie powrócić do pożądanego stanu automatycznie po restarcie, wpływając nie tylko na instancję AWX, ale także na inne aplikacje działające na hoście.

5. **Kwestie związane z czasem i koordynacją**: W środowisku produkcyjnym, szczególnie podczas pracy z klastrami Kubernetes, czas i koordynacja aktualizacji i restartów są kluczowe. Jeśli restart nie jest starannie zaplanowany i skoordynowany w oknie konserwacyjnym, może to prowadzić do przedłużającego się czasu przestoju usługi poza akceptowalne limity.

Aby złagodzić te problemy, zaleca się:

- Planowanie aktualizacji i restartów podczas okien konserwacyjnych, gdy dopuszczalny jest czas przestoju usługi.
- Upewnienie się, że AWX i inne kluczowe usługi są poprawnie zatrzymane i że system jest gotowy na restart.
- Rozważenie użycia parametrów `async` i `poll` Ansible, aby poczekać, aż host wróci do trybu online po restarcie, a następnie kontynuować z niezbędnymi po-restartowych sprawdzeniami i zadaniami.
- Używanie kontroli stanu i sond gotowości w Kubernetes, aby upewnić się, że usługi, w tym AWX, są w pełni operacyjne przed uznaniem procesu aktualizacji i restartu za zakończony.
- Jeśli to możliwe, unikanie bezpośredniego zarządzania hostem Kubernetes przez AWX do aktualizacji i restartów. Zamiast tego, użyj oddzielnych mechanizmów lub bezpośrednich strategii zarządzania, aby obsłużyć kluczowe aktualizacje i restarty systemu, aby uniknąć zakłóceń w operacjach AWX.

### Część 2

Postępując zgodnie z tymi krokami, powinieneś być w stanie skonfigurować rozdzielanie DNS w swoim klastrze K3s, aby spełniało Twoje konkretne potrzeby, jednocześnie zachowując prawidłowe funkcjonowanie zarówno wewnętrznych, jak i zewnętrznych rozwiązań nazw.

#### Konfiguracja CoreDNS w Kubernetes

Domain Name System (DNS) jest używany przez Kubernetes, otwartoźródłową platformę do orkiestracji aplikacji kontenerowych, aby umożliwić komunikację między jego wieloma komponentami.

CoreDNS i ExternalDNS to dwie kluczowe technologie zarządzania DNS w klastrze Kubernetes.

##### Jak działają CoreDNS i ExternalDNS

Aby różne komponenty, w tym pody i usługi, mogły bezproblemowo komunikować się ze sobą, Kubernetes opiera się na Domain Name System (DNS).
Platforma natychmiast tworzy rekord DNS dla nowo utworzonej usługi Kubernetes, co ułatwia innym podom odnalezienie i połączenie się z tą usługą. Dodatkowo, Kubernetes wspiera ExternalDNS, co ułatwia konfigurację i utrzymanie rekordów DNS dla usług, które muszą być dostępne z zewnątrz. W rezultacie, dostęp do usług wewnątrz klastra jest uproszczony dla klientów zewnętrznych.

Innymi słowy, Kubernetes używa DNS do pomocy podom i usługom w odnajdywaniu się i nawiązywaniu komunikacji opartej na nazwach hostów.
- Dla usługi Kubernetes automatycznie generowany jest rekord DNS w momencie jej utworzenia.
- Kubernetes wspiera ExternalDNS, który pomaga zarządzać rekordami DNS dla usług, które muszą być dostępne z zewnątrz klastra.

**external DNS**

Krótko mówiąc, externalDNS to pod, który monitoruje wszystkie twoje wejścia (ingresses) podczas działania w twoim klastrze EKS. Automatycznie zbiera nazwę hosta i punkt końcowy po wykryciu wejścia z określonym hostem, tworząc rekord dla tego zasobu w Route53. Jeśli host zostanie zmieniony lub usunięty, External DNS natychmiastowo aktualizuje Route53.

Dzięki wspieranym dostawcom DNS, ta technologia umożliwia automatyczne tworzenie i utrzymanie wpisów DNS dla publicznie dostępnych usług. Poprzez przypisywanie nazwy hosta usługi do zewnętrznego adresu IP klastra Kubernetes, umożliwia zewnętrznym klientom dostęp do działających wewnątrz klastra usług.

**coreDNS**

Specjalnie zaprojektowany dla Kubernetes, ten serwer DNS jest obecnie standardowym serwerem DNS dla Kubernetes 1.14 i wyższych. CoreDNS to elastyczny i rozszerzalny serwer DNS, który może być używany do rozpoznawania nazw i odkrywania usług wewnątrz klastra. Dzięki drobnym zmianom konfiguracji, może być również używany do dostępu do zewnętrznych dostawców DNS.

![schemat Kubernetes DNS](/images/2024/k3s-dns.webp "schemat Kubernetes DNS")
<figcaption>schemat Kubernetes DNS</figcaption>

**Powody, dla których ExternalDNS jest użytecznym uzupełnieniem klastra K8s:**

Kube-DNS, znany również jako CoreDNS, to wbudowany system DNS dla Kubernetes, który obsługuje rozwiązywanie nazw DNS dla podów i usług wewnątrz klastra. Niemniej jednak, ze względu na szereg korzyści, firmy często decydują się na korzystanie z zewnętrznego systemu DNS.

1. **Zaawansowane funkcje:** Zarządzanie ruchem oparte na DNS, automatyczne przełączanie awaryjne i globalne równoważenie obciążenia to tylko niektóre z dodatkowych możliwości, które mogą zapewnić zewnętrzne systemy DNS. Ponadto mają one wbudowane funkcje bezpieczeństwa, takie jak DNSSEC, które chronią przed atakami typu spoofing i manipulacją. Te cechy są niezbędne dla firm, które przetwarzają wrażliwe dane, zarządzają ruchem w kilku lokalizacjach lub obsługują duże obciążenia ruchem.

2. **Spójna architektura DNS:** Niezależnie od tego, czy firma używa Kubernetes, może nadal utrzymać spójną infrastrukturę DNS we wszystkich swoich aplikacjach, korzystając z zewnętrznego systemu DNS. Poprawia to bezpieczeństwo i usprawnia zarządzanie.

3. **Dynamiczna i szczegółowa kontrola** nad rekordami DNS lub instrukcjami tekstowymi przechowywanymi na serwerach DNS jest możliwa dzięki ExternalDNS. Jego główną funkcją jest służenie jako most, umożliwiający korzystanie z dostawców DNS z konkretną wiedzą poza Kubernetes. ExternalDNS może obsługiwać miliony rekordów DNS i oferuje dodatkowe możliwości zarządzania.

4. **Skalowalność:** System Kube-DNS może stać się wąskim gardłem, gdy liczba usług i podów w klastrze Kubernetes rośnie. Aby zapobiec staniu się systemu DNS wąskim gardłem dla reszty klastra, zewnętrzny system DNS może obsługiwać znacznie większą liczbę zapytań DNS.

5. **Elastyczność:** Używając External DNS z Kubernetes, masz więcej opcji, jeśli chodzi o typy serwerów DNS. W zależności od potrzeb i preferencji możesz wybierać spośród różnych komercyjnych rozwiązań DNS, takich jak Google Cloud DNS, Amazon Route 53, BIND lub Microsoft DNS, a także opcji open-source, takich jak CoreDNS, SkyDNS czy Knot DNS, Adguard Home, Pi-hole.

Integracja zewnętrznego systemu DNS z Kubernetes oferuje przedsiębiorstwom zaawansowaną i elastyczną infrastrukturę oraz zarządzanie DNS. Ponieważ Kubernetes może być używany z wieloma znanymi zewnętrznymi dostawcami DNS, korzystanie z zewnętrznego DNS jest zalecane podczas wdrażania Kubernetes w produkcji.

#### Konfiguracja CoreDNS w Kubernetes

CoreDNS to potężny, elastyczny i rozszerzalny serwer DNS, szeroko stosowany w Kubernetes. Jednak czasami musimy dostosować jego działanie do naszych konkretnych potrzeb, na przykład, poprzez przekierowanie zapytań DNS do zewnętrznych serwerów. Jak to zrobić?

Zacznijmy od otwarcia pliku konfiguracyjnego CoreDNS, który znajdziesz w Kubernetes pod nazwą ConfigMap. Pokażę Ci, jak edytować ten plik, dodając sekcję 'forward'. Ta sekcja odpowiada za przekierowanie ruchu na zewnętrzny serwer DNS.

Jest bardzo ważne, aby dokonywać tych zmian ostrożnie, ponieważ błędy w konfiguracji DNS mogą powodować problemy z łącznością w całym klastrze. Po dokonaniu i zapisaniu zmian zrestartujemy CoreDNS, aby nowa konfiguracja weszła w życie. Pamiętaj, aby sprawdzić, czy wszystko działa poprawnie po tych zmianach.

Chcesz edytować swoją konfigurację CoreDNS, aby dodać niestandardowe reguły przekierowania dla zewnętrznych zapytań DNS. Możesz dodać te reguły bezpośrednio w ConfigMapie CoreDNS, konkretnie w sekcji Corefile.

Oto co powinieneś zrobić:

1. **Zapisz i ConfigMap**:
   
Najpierw zapisz ConfigMap CoreDNS do edycji:

```bash
kubectl -n kube-system get configmap coredns -o yaml > coredns.yml
```

Następnie edytuj go:

```bash
vim coredns.yml 
```

2. **Modyfikuj Corefile**:

W edytorze znajdź sekcję `Corefile`. Dodasz niestandardowe reguły przekierowania pod istniejącą dyrektywą `forward . /etc/resolv.conf`. 

Na przykład, jeśli chcesz, aby wszystkie zapytania DNS, z wyjątkiem tych dla wewnętrznych usług Kubernetes (`cluster.local` itd.),

 były kierowane do Twojego domowego serwera DNS (powiedzmy, że to `10.10.0.108`), przy jednoczesnym zachowaniu rozwiązania nazw wewnętrznych Kubernetes, możesz zmodyfikować Corefile w następujący sposób:

```yaml
.:53 {
   errors
   health
   ready
   kubernetes cluster.local in-addr.arpa ip6.arpa {
     pods insecure
     fallthrough in-addr.arpa ip6.arpa
   }
   hosts /etc/coredns/NodeHosts {
     ttl 60
     reload 15s
     fallthrough
   }
   prometheus :9153
   forward . /etc/resolv.conf {
     except cluster.local in-addr.arpa ip6.arpa
   }
   forward . 10.10.0.108 # Zewnętrzny adres IP DNS
   cache 30
   loop
   reload
   loadbalance
   import /etc/coredns/custom/*.override
}
import /etc/coredns/custom/*.server
```

W tej konfiguracji:
- Linia `forward . /etc/resolv.conf { except ... }` określa, że ogólne zapytania powinny korzystać z systemowego pliku resolv.conf (który zwykle wskazuje na domyślną usługę DNS Kubernetes), z wyjątkiem określonych wewnętrznych domen.
- Linia `forward . 10.10.0.108` następnie określa, że wszystkie inne zapytania niezłapane przez pierwszą regułę powinny być przekierowane na Twój domowy serwer DNS.

3. **Zapisz i wyjdź**:

Po dodaniu niestandardowych reguł przekierowania, zapisz i wyjdź z edytora. 

Kubernetes zaktualizuje ConfigMap, gdy wpiszesz poniższe polecenie:
   
```bash
kubectl apply -f coredns.yaml 
```

Powinno wyświetlić informacje

```bash
configmap/coredns configured
```

4. **Zrestartuj pody CoreDNS**:

Po zaktualizowaniu ConfigMap musisz zrestartować pody CoreDNS, aby zastosować zmiany. Możesz to zrobić, usuwając istniejące pody CoreDNS, a Kubernetes automatycznie odtworzy je z zaktualizowaną konfiguracją:

```bash
kubectl -n kube-system delete pods -l k8s-app=kube-dns
```

5. **Przetestuj konfigurację**:

Po ponownym uruchomieniu podów CoreDNS przetestuj rozwiązanie nazw DNS, aby upewnić się, że:
- Wewnętrzne usługi Kubernetes są poprawnie rozwiązane.
- Zewnętrzne domeny są rozwiązane za pośrednictwem Twojego domowego serwera DNS.

Możesz to zrobić, wykonując wewnątrz testowego poda w twoim klastrze polecenia takie jak `nslookup` lub `dig`, aby rozwiązać zarówno wewnętrzne, jak i zewnętrzne nazwy DNS.

```bash
kubectl run -it --rm --restart=Never busybox --image=busybox:1.28 -- /bin/sh

nslookup rancher.local
```

### **Cofnij zmiany**

1. **Zapisz i ConfigMap**:
   
Najpierw zapisz ConfigMap CoreDNS do edycji:

```bash
kubectl -n kube-system get configmap coredns -o yaml > coredns.yml
```

Następnie edytuj go:

```bash
vim coredns.yml 
```

2. **Modyfikuj Corefile**:

Przywróć stan do:

```yaml
.:53 {
   errors
   health
   ready
   kubernetes cluster.local in-addr.arpa ip6.arpa {
     pods insecure
     fallthrough in-addr.arpa ip6.arpa
   }
   hosts /etc/coredns/NodeHosts {
     ttl 60
     reload 15s
     fallthrough
   }
   prometheus :9153
   forward . /etc/resolv.conf
   cache 30
   loop
   reload
   loadbalance
   import /etc/coredns/custom/*.override
}
import /etc/coredns/custom/*.server
```

3. **Zapisz i wyjdź**:

Po dodaniu niestandardowych reguł przekierowania, zapisz i wyjdź z edytora. 

Kubernetes zaktualizuje ConfigMap, gdy wpiszesz poniższe polecenie:
   
```bash
kubectl apply -f coredns.yml 
```

Powinno wyświetlić informacje

```bash
configmap/coredns configured
```

4. **Zrestartuj pody CoreDNS**:

Po zaktualizowaniu ConfigMap musisz zrestartować pody CoreDNS, aby zastosować zmiany. Możesz to zrobić, usuwając istniejące pody CoreDNS, a Kubernetes automatycznie odtworzy je z zaktualizowaną konfiguracją:

```bash
kubectl -n kube-system delete pods -l k8s-app=kube-dns
```

**Wnioski:**

To wszystko na dziś. Mam nadzieję, że ten poradnik był jasny i pomocny. Jeśli masz jakieś pytania lub wątpliwości, śmiało zadawaj je w komentarzach poniżej. Zachęcam również do subskrypcji mojego kanału i udostępniania tego filmu, jeśli uznasz go za wartościowy. Dziękuję za oglądanie i do zobaczenia w następnym poradniku!