---
title: Instalacja, konfiguracja i usuwanie Argo CD za pomocą Bash i Ansible
date: 2024-03-19T1:00:00+00:00
description: Dowiedz się, jak instalować, konfigurować i odinstalowywać Argo CD w Kubernetes za pomocą skryptów Bash i playbooków Ansible. Ten samouczek oferuje praktyczny przewodnik do zarządzania systemem ciągłej dostawy, z poradami zarówno dla początkujących, jak i obecnych użytkowników, aby usprawnić przepływy pracy GitOps i utrzymanie aplikacji.
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
    image: images/2024-thumbs/argocd1.webp
---

### Integracja Gitlab z AWX - Automatyzacja playbooków Ansible

**W poniższych filmach wyjaśniam, jak zainstalować, skonfigurować i usunąć Argo CD za pomocą Bash i Ansible.**

{{<youtube dq3QbPp-GTA>}}
{{<youtube Wo8nFAEOtJc>}}

### Samouczek: Instalacja, konfiguracja i usuwanie Argo CD za pomocą Bash i Ansible

W tym samouczku omówimy, jak zainstalować, skonfigurować i usunąć Argo CD, deklaratywne narzędzie do ciągłej dostawy GitOps dla Kubernetes, używając skryptów Bash i playbooków Ansible.

---

#### Część 1: Instalacja i konfiguracja Argo CD

**Instalacja Git i Helm:**

Zacznij od zainstalowania Git i Helm w swoim środowisku. Helm to menedżer pakietów dla Kubernetes, który upraszcza wdrażanie aplikacji i usług.

```bash
sudo apt install git
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**Włącz autouzupełnianie dla Helm:**

Aby uczynić twoje doświadczenie z Helmem bardziej efektywnym, włącz autouzupełnianie dla twojej powłoki bash:

```bash
echo "source <(helm completion bash)" >> ~/.bashrc
source ~/.bashrc
```

**Utwórz przestrzeń nazw dla Argo CD:**

Przestrzenie nazw pomagają organizować zasoby w Kubernetes. Utwórz przestrzeń nazw specjalnie dla Argo CD:

```bash
kubectl create namespace argocd
```

**Dodaj repozytorium Helm dla Argo CD:**

Repozytoria Helm przechowują zapakowane wykresy Helm. Dodaj repozytorium Argo CD do Helm:

```bash
helm repo add argo https://argoproj.github.io/argo-helm
```

**Zaktualizuj swoje repozytoria Helm:**

Upewnij się, że masz najnowsze informacje o wykresach ze wszystkich dodanych repozytoriów:

```bash
helm repo update
```

**Zainstaluj Argo CD za pomocą Helm:**

Wdroż Argo CD w swoim klastrze Kubernetes w przestrzeni nazw `argocd`:

```bash
helm install -n argocd argocd argo/argo-cd
```

**Utwórz zasób Ingress dla Argo CD:**

Ingress udostępnia trasy HTTP i HTTPS z zewnątrz klastra do usług wewnątrz klastra. Utwórz ingress, aby uzyskać dostęp do Argo CD z zewnątrz:

Najpierw utwórz plik o nazwie `argocd-ingress.yml`:

```bash
vim argocd-ingress.yml
```

Następnie wstaw poniższą zawartość YAML:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: argocd-ingress
namespace: argocd
annotations:
nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
ingressClassName: nginx
rules:
- host: argocd.sysadmin.homes
http:
  paths:
  - path: /
    pathType: Prefix
    backend:
      service:
        name: argocd-server
        port:
          number: 443
```

Zastosuj konfigurację ingress:

```bash
kubectl apply -f argocd-ingress.yml
```

**Pobierz początkowe hasło administratora:**

Argo CD generuje początkowe hasło administratora, które będziesz potrzebować do logowania:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d ; echo
```

Następnie powinieneś usunąć początkowy sekret, jak sugeruje [Przewodnik dla Początkujących](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)

**Modyfikuj konfigurację Argo CD w przypadku problemów z wylogowaniem:**

Jeśli napotkasz problemy związane z błędem wylogowania, zaktualizuj konfigurację Argo CD:

```bash
kubectl -n argocd get configmap argocd-cm -o yaml > argocd-cm.yml
sed -i 's/example.com/sysadmin.homes/g' argocd-cm.yml
kubectl apply -f argocd-cm.yml
```

---

#### Część 2: Automatyzacja instalacji za pomocą Bash

Aby zautomatyzować proces instalacji za pomocą Bash,

 wykonaj następujące kroki:

1. Utwórz skrypt o nazwie `argocd-install.sh`:

```bash
vim argocd-install.sh
```

2. Wstaw do pliku dostarczoną zawartość skryptu Bash, która odzwierciedla wcześniej omówione kroki instalacji ręcznej.

```bash
#!/usr/bin/bash
echo "Tworzenie przestrzeni nazw argocd"
kubectl create namespace argocd
echo "Dodaj repozytorium Argo CD"
helm repo add argo https://argoproj.github.io/argo-helm
echo "Aktualizuj repozytorium za pomocą Helm"
helm repo update
echo "Instaluj Argo CD za pomocą Helm"
helm install -n argocd argocd argo/argo-cd
echo "Utwórz ingress dla Argo CD"
cat > argocd-ingress.yml <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: argocd-ingress
namespace: argocd
annotations:
nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
ingressClassName: nginx
rules:
- host: argocd.sysadmin.homes
http:
  paths:
  - path: /
    pathType: Prefix
    backend:
      service:
        name: argocd-server
        port:
          number: 443
EOF
echo "Wdróż ingress dla Argo CD"
kubectl apply -f argocd-ingress.yml 
echo "Napraw problem z wylogowaniem do argocd.example.com"
kubectl -n argocd get configmap argocd-cm -o yaml > argocd-cm.yml
sed -i 's/example.com/sysadmin.homes/g' argocd-cm.yml
kubectl apply -f argocd-cm.yml
```
3. Zapisz plik i nadaj mu prawa do wykonywania:

```bash
chmod +x argocd-install.sh
```

4. Wykonaj skrypt:

```bash
./argocd-install.sh
```

5. Pobierz początkowe hasło administratora:

Argo CD generuje początkowe hasło administratora, które będziesz potrzebować do logowania:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d ; echo
```

6. Następnie powinieneś usunąć początkowy sekret, jak sugeruje [Przewodnik dla Początkujących](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)

---

#### Część 3: Automatyzacja instalacji za pomocą Ansible

Dla osób, które preferują Ansible, samouczek zawiera kroki umożliwiające automatyzację wdrożenia Argo CD za pomocą playbooka Ansible:

1. Utwórz playbook Ansible o nazwie `argocd-install.yml`:

```bash
vim argocd-install.yml
```

2. Skopiuj dostarczoną zawartość playbooka Ansible do pliku. Playbook automatyzuje kroki z procesu instalacji ręcznej.

```yaml
---
- name: Instalacja Argo CD
hosts: localhost
become: yes
tasks:
- name: Utwórz przestrzeń nazw argocd
  shell: kubectl create namespace argocd
  ignore_errors: yes

- name: Dodaj repozytorium Argo CD
  shell: helm repo add argo https://argoproj.github.io/argo-helm
  ignore_errors: yes

- name: Zaktualizuj repozytorium za pomocą Helm
  shell: helm repo update
  ignore_errors: yes

- name: Zainstaluj Argo CD za pomocą Helm
  shell: helm install -n argocd argocd argo/argo-cd
  environment:
    KUBECONFIG: /etc/rancher/k3s/k3s.yaml
  ignore_errors: yes

- name: Utwórz Ingress dla Argo CD
  shell: |
    kubectl apply -f - <<EOF
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: argocd-ingress
      namespace: argocd
      annotations:
        nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
    spec:
      ingressClassName: nginx
      rules:
      - host: argocd.sysadmin.homes
        http:
          paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 443
    EOF
  ignore_errors: yes

- name: Pauza na 1 minutę, aby pozwolić Argo CD zainicjować
  pause:
    minutes: 1

- name: Pobierz configmap argocd-cm
  shell: kubectl -n argocd get configmap argocd-cm -o yaml > /tmp/argocd-cm.yml
  ignore_errors: yes

- name: Zaktualizuj configmap argocd-cm
  replace:
    path: /tmp/argocd-cm.yml
    regexp: 'example.com'
    replace: 'sysadmin.homes'
  ignore_errors: yes

- name: Zastosuj zmodyfikowaną configmap argocd-cm
  shell: kubectl apply -f /tmp/argocd-cm.yml
  ignore_errors: yes
```

3. Zapisz plik i uruchom playbook:

```bash
ansible-playbook argocd-install.yml
```

Powinieneś zobaczyć podobne wyjście:

```bash
PLAY [Install Argo CD] **************************************************************************************************
TASK [Gathering Facts] **************************************************************************************************ok: [localhost]

TASK [Create argocd namespace] ******************************************************************************************changed: [localhost]

TASK [Add Argo CD repository] *******************************************************************************************changed: [localhost]

TASK [Update repository using Helm] *************************************************************************************changed: [localhost]

TASK [Install Argo CD using Helm] ***************************************************************************************changed: [localhost]

TASK [Create Ingress for Argo CD] ***************************************************************************************changed: [localhost]

TASK [Get argocd-cm configmap] ******************************************************************************************changed: [localhost]

TASK [Update argocd-cm configmap] ***************************************************************************************changed: [localhost]

TASK [Apply the modified argocd-cm configmap] ***************************************************************************changed: [localhost]

PLAY RECAP **************************************************************************************************************localhost                  : ok=9    changed=8    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

4. Pobierz początkowe hasło administratora:

Argo CD generuje początkowe hasło administratora, którego będziesz potrzebować do logowania:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d ; echo
```

5. Następnie powinieneś usunąć początkowy sekret, jak sugeruje [Przewodnik dla Początkujących](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)

Powyższy playbook Ansible jest zorganizowany w celu automatyzacji wdrożenia i konfiguracji Argo CD w środowisku Kubernetes. Poniżej znajduje się szczegółowy opis jego komponentów i zadań:

1. **Ogólna struktura**: Playbook rozpoczyna się od front matter YAML (`---`) i definiuje pojedynczą rozgrywkę nazwaną "Install Argo CD". Jest przeznaczona do wykonania na lokalnej maszynie (oznaczonej przez `hosts: localhost`) i wymaga podniesionych uprawnień (`become: yes`), co jest podobne do uruchamiania poleceń z sudo.

2. **Zadania**: Playbook składa się z kilku zadań, z których każde jest zaprojektowane do wykonania określonego kroku w procesie konfiguracji:

- **Utwórz przestrzeń nazw argocd**: To zadanie używa polecenia `kubectl create namespace argocd` do utworzenia nowej przestrzeni nazw Kubernetes o nazwie `argocd`. Ta przestrzeń nazw jest przeznaczona dla wszystkich zasobów związanych z Argo CD. Dyrektywa `ignore_errors: yes` zapewnia, że playbook kontynuuje działanie nawet jeśli to polecenie napotka na błąd, co może być przydatne, jeśli przestrzeń nazw już istnieje.

- **Dodaj repozytorium Argo CD**: Wykonuje `helm repo add argo https://argoproj.github.io/argo-helm` aby dodać repozytorium wykresów Argo CD do Helm, umożliwiając Helmowi instalację Argo CD z tego repozytorium.

- **Aktualizuj repozytorium przy użyciu Helm**: Uruchamia `helm repo update` aby zaktualizować lokalną pamięć podręczną wykresów ze wszystkich dodanych repozytoriów, zapewniając, że najnowsze wersje są dostępne do instalacji.

- **Zainstaluj Argo CD przy użyciu Helm**: To zadanie używa Helm do zainstalowania Argo CD w wcześniej utworzonej przestrzeni nazw `argocd`. Ustawia zmienną środowiskową `KUBECONFIG` jawnie na plik kubeconfig, zapewniając, że Helm wchodzi w interakcje z odpowiednim klasterem Kubernetes.

- **Utwórz Ingress dla Argo CD**: Stosuje zasób Ingress do zewnętrznego udostępnienia serwera Argo CD. Zasób jest zdefiniowany w linii i stosowany przy użyciu `kubectl apply`. Ingress jest skonfigurowany do używania HTTPS i kieruje ruch do usługi `argocd-server`.

- **Pauza na 3 minuty, aby pozwolić Argo CD zainicjować**: Wykorzystuje moduł `pause` do zatrzymania wykonania playbooka na trzy minuty. Ten czas oczekiwania pozwala Argo CD na pełne uruchomienie się i osiągnięcie gotowości operacyjnej przed kontynuacją z dalszymi konfiguracjami.

- **Pobierz configmap argocd-cm**: Pobiera ConfigMap `argocd-cm` z przestrzeni nazw `argocd` i zapisuje go do pliku (`/tmp/argocd-cm.yml`). Ta ConfigMap zawiera ustawienia konfiguracyjne dla Argo CD.

- **Zaktualizuj configmap argocd-cm**: Wykorzystuje moduł `replace` do modyfikacji zapisanego pliku ConfigMap, zmieniając wystąpienia `example.com` na `sysadmin.homes`. To zadanie dostosowuje ustawienia domeny Argo CD do pasującego środowiska.

- **Zastosuj zmodyfikowaną configmap argocd-cm**: Stosuje zmiany do ConfigMap `argocd-cm` z powrotem do klastra Kubernetes przy użyciu `kubectl apply`, aktualizując konfigurację Argo CD.

Każde zadanie zawiera opcję `ignore_errors: yes`, aby kontynuować wykonanie nawet jeśli wystąpią błędy. Może to być przydatne w skryptach, gdzie można przewidzieć błędy w niektórych operacjach lub są one nieistotne, ale może to także ukryć ważne problemy, więc zazwyczaj używa się tego z ostrożnością.

Łącząc te zadania, playbook automatyzuje konfigurację i początkowe ustawienie Argo CD, ułatwiając ciągłe wdrażanie i zarzą

dzanie aplikacjami w środowiskach Kubernetes.

Następnie powinieneś usunąć początkowy sekret, jak sugeruje [Przewodnik dla Początkujących](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)

---

#### Część 4: Usuwanie Argo CD z Ansible

Gdy potrzebujesz usunąć Argo CD ze swojego klastra, użyj dostarczonego playbooka Ansible zaprojektowanego do czystego usunięcia:

1. Utwórz playbook usuwania o nazwie `remove-argocd.yml`:

```bash
vim remove-argocd.yml
```

2. Wprowadź dostarczoną zawartość mającą na celu systematyczne usuwanie komponentów Argo CD.

```yaml
---
- name: Usuń Argo CD
hosts: localhost
become: yes
tasks:
- name: skaluj wszystkie wdrożenia w przestrzeni nazw argocd do zera replik
  shell: kubectl scale deployment --all --replicas=0 -n argocd
  ignore_errors: yes

- name: Usuń wdrożenia Argo CD
  shell: kubectl delete deployment argocd-repo-server argocd-applicationset-controller argocd-notifications-controller argocd-redis argocd-dex-server argocd-server -n argocd
  ignore_errors: yes

- name: Usuń usługi Argo CD
  shell: kubectl delete service argocd-applicationset-controller argocd-repo-server argocd-dex-server argocd-redis argocd-server -n argocd
  ignore_errors: yes 

- name: Usuń statefulsety Argo CD
  shell: kubectl delete statefulset argocd-application-controller -n argocd
  ignore_errors: yes            

- name: Usuń konta usługowe Argo CD
  shell: kubectl delete serviceaccount default argocd-dex-server argocd-application-controller argocd-server argocd-notifications-controller argocd-applicationset-controller argocd-repo-server -n argocd
  ignore_errors: yes

- name: Usuń powiązania ról Argo CD
  shell: kubectl delete rolebinding argocd-repo-server argocd-application-controller argocd-dex-server argocd-server argocd-notifications-controller argocd-applicationset-controller -n argocd
  ignore_errors: yes

- name: Usuń role Argo CD
  shell: kubectl delete role argocd-server argocd-applicationset-controller argocd-dex-server argocd-repo-server argocd-notifications-controller argocd-application-controller -n argocd
  ignore_errors: yes

- name: Usuń ingress Argo CD w przestrzeni nazw argocd
  shell: kubectl delete ingress argocd-ingress -n argocd 
  ignore_errors: yes

- name: Usuń przestrzeń nazw argocd
  shell: kubectl delete namespace argocd
  ignore_errors: yes
```

3. Wykonaj playbook usuwania:

```bash
ansible-playbook remove-argocd.yml
```

Ten playbook obniża skalę, usuwa wdrożenia, usługi, statefulsety, konta usługowe, powiązania ról, role, ingressy i w końcu całą przestrzeń nazw `argocd`, skutecznie czyści wszystkie komponenty Argo CD z twojego klastra.

Więcej szczegółów poniżej:

Ten playbook Ansible jest zaprojektowany do systematycznego usuwania Argo CD i jego powiązanych zasobów z klastra Kubernetes. Każde zadanie w playbooku używa modułu `shell` do bezpośredniego wykonania poleceń `kubectl`, wchodząc w interakcje z klastrem w celu usunięcia określonych komponentów Argo CD. Playbook działa na lokalnej maszynie (`hosts: localhost`) i wymaga podniesionych uprawnień (`become: yes`). Oto szczegółowy podział:

1. **skaluje wszystkie wdrożenia w przestrzeni nazw argocd do zera replik**: To zadanie obniża skalę wszystkich wdrożeń w przestrzeni nazw `argocd` do zera replik, skutecznie zatrzymując wszystkie działające komponenty Argo CD. Jest to często robione jako wstępny krok przed usunięciem, aby zapewnić łagodne zamknięcie usług.

2. **Usuń wdrożenia Argo CD**: Usuwa określone wdrożenia Argo CD, w tym serwer repozytorium, kontroler ApplicationSet, kontroler powiadomień, serwer Redis, serwer Dex i główny serwer Argo CD, wszystko w przestrzeni nazw `argocd`.

3. **Usuń usługi Argo CD**: Usuwa usługi związane z tymi samymi komponentami wymienionymi powyżej. W Kubernetes usługi zapewniają dostęp do sieci do zestawu podów, więc usuwając te usługi, odetniesz dostęp do sieci do odpowiadających komponentów Argo CD.

4. **Usuń statefulsety Argo CD**: Usuwa StatefulSet `argocd-application-controller`. W Argo CD, kontroler aplikacji zarządza cyklem życia aplikacji i ciągle monitoruje stany aplikacji. Ponieważ jest wdrożony jako StatefulSet, wymaga osobnego polecenia od Wdrożeń.

5. **Usuń konta usługowe Argo CD**: Usuwa konta usługowe Kubernetes używane przez komponenty Argo CD. Konta usługowe zapewniają tożsamość procesom, które działają w Podzie i pozwalają komponentom Argo CD na interakcje z interfejsem API Kubernetes.

6. **Usuń powiązania ról Argo CD**: Usuwa RoleBinding w przestrzeni nazw `argocd`. RoleBinding łączą Role z użytkownikami lub grupami, przyznając uprawnienia do zasobów opisanych w rolach. Ten krok usuwa uprawnienia, które komponenty Argo CD miały w przestrzeni nazw.

7. **Usuń role Argo CD**: Usuwa Role w przestrzeni nazw `argocd`. Role definiują zestaw uprawnień, takich jak jakie operacje są dozwolone na zestawie zas

obów. Ten krok skutecznie usuwa te zdefiniowane uprawnienia.

8. **Usuń ingress Argo CD w przestrzeni nazw argocd**: Usuwa zasób Ingress dla Argo CD, który był używany do udostępnienia serwera Argo CD światu zewnętrznemu za pomocą URL.

9. **Usuń przestrzeń nazw argocd**: Na końcu usuwa całą przestrzeń nazw `argocd`, co usuwa wszystkie pozostałe zasoby pod przestrzenią nazw, czyści środowisko. Jest to ostateczny krok, aby upewnić się, że wszystkie komponenty, w tym te możliwie pominięte przez wcześniejsze zadania, zostaną usunięte.

Każde zadanie jest ustawione z `ignore_errors: yes`, co oznacza, że playbook będzie kontynuowany, nawet jeśli wystąpią błędy w jakichkolwiek zadaniach. Może to być przydatne, gdy nie jesteś pewien, czy wszystkie komponenty są obecne, lub jeśli chcesz zapewnić, że playbook przebiegnie do końca bez względu na indywidualne błędy poleceń. Jednak ważne jest, aby być ostrożnym z tym ustawieniem, ponieważ może to również oznaczać, że prawdziwe błędy są ignorowane, co może prowadzić do niekompletnego czyszczenia.

---

Gratulacje! Pomyślnie nauczyłeś się, jak instalować, konfigurować, automatyzować i usuwać Argo CD w klastrze Kubernetes, używając zarówno skryptów Bash, jak i playbooków Ansible. Ten samouczek dostarcza narzędzi niezbędnych zarówno do ręcznego, jak i zautomatyzowanego zarządzania Argo CD, zaspokajając różnorodne preferencje operacyjne.