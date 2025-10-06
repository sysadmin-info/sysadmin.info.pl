---
title: Jak zainstalować n8n w Kubernetes - k3s
date: 2023-12-29T11:00:00+00:00
description: Jak zainstalować n8n w Kubernetes - k3s
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Kubernetes
categories:
- Home Assistant
cover:
    image: images/2023-thumbs/ulanzi09.webp
---

{{<youtube gE4O2c1H8Vw>}}

##### Jak zainstalować n8n w Kubernetes - k3s 

Szybka implementacja:

1. Zainstaluj git

```bash
sudo apt install git
```

2. Sklonuj repozytorium

```bash
git clone https://github.com/sysadmin-info/n8n-k3s.git
```

3. Wejdź do katalogu

```bash
cd n8n-k3s
```

4. Zainstaluj n8n w k3s

```bash
kubectl apply -f .
```

---

Szczegóły artykułu dotyczą ustawienia n8n, narzędzia do automatyzacji przepływu pracy, na Kubernetes. Skupia się na użyciu plików YAML do wdrożenia Kubernetes.

**Kluczowe punkty:**

1. **Przegląd n8n**: n8n to narzędzie do automatyzacji przepływu pracy w modelu fair-code, podobne do Zapierlub IFTTT, odpowiednie do samo-hostingu lub używania płatnej usługi n8n.cloud.

2. **Konfiguracja Kubernetes dla n8n**:
   - **Tworzenie Namespace**: Początkowo, tworzona jest przestrzeń nazw Kubernetes 'n8n' za pomocą `kubectl create namespace n8n`.
   - **Konfiguracja Wdrożenia i Usługi**:
     - `n8n-deployment.yaml`: Definiuje wdrożenie z jedną repliką kontenera n8n, eksponując port 5678. Zawiera sondy gotowości i zdolności działania na `/healthz`, zmienne środowiskowe z ConfigMap (`n8n-configmap`) i Secret (`n8n-secrets`), oraz limity zasobów.
     - `n8n-service.yaml`: Ustawia usługę NodePort dla n8n, mapując port 80 na port kontenera 5678.

3. **StatefulSet PostgreSQL**:
   - `postgres-statefulset.yaml` i `postgres-service.yaml`: Definiują StatefulSet i usługę dla PostgreSQL, eksponując port 5432, i powiązane z Secret (`postgres-secrets`).

4. **ConfigMaps i Secrets**:
   - `n8n-configmap.yaml`: Zawiera zmienne środowiskowe takie jak NODE_ENV, konfiguracje bazy danych i ustawienia webhook.
   - `n8n-secrets.yaml`: Zawiera sekrety dla n8n, w tym hasło do bazy danych i klucz szyfrowania.
   - `postgres-secrets.yaml`: Przechowuje dane konfiguracyjne PostgreSQL.

5. **Proces Wdrożenia**:
   - Stosowanie plików konfiguracyjnych (`kubectl apply -f`) dla n8n i PostgreSQL.
   - Używanie `kubectl rollout restart` do ponownego uruchomienia StatefulSet i Wdrożenia po zastosowaniu konfiguracji.
   - Ostateczna konfiguracja obejmuje sprawdzanie usług (`kubectl get svc -n n8n`) i dostęp do n8n za pomocą przeglądarki, korzystając z NodePort lub niestandardowej domeny przez NGINX Proxy Manager.

Artykuł podkreśla znaczenie dopasowania etykiet w konfiguracjach Kubernetes i zapewnia kompleksowy przewodnik po ustawieniu n8n z PostgreSQL na Kubernetes, wykorzystując ConfigMaps i Secrets do zarządzania konfiguracją.

---

### TLDR
Dla tych, którzy chcieliby przeczytać i dowiedzieć się więcej, zobacz artykuł:

#### Co to jest n8n{#what-is-n8n}

W skrócie, n8n to rozwiązanie do automatyzacji przepływu pracy oparte na modelu dystrybucji fair-code, które jest darmowe i rozszerzalne. Jeśli znasz rozwiązania low-code/no-code takie jak [Zapier](https://zapier.com/) czy [IFTTT](https://ifttt.com/), n8n może być obsługiwane niezależnie i jest do nich podobne.

Bycie fair-code oznacza, że zawsze masz prawo używać i rozpowszechniać kod źródłowy. Jedynym minusem jest to, że możesz musieć zapłacić za licencję na korzystanie z n8n, jeśli zarabiasz na nim pieniądze. Istnieją doskonałe ilustracje, jak ta metoda różni się od tradycyjnych projektów "open-source" w tej dyskusji społeczności [temat](https://community.n8n.io/t/doubts-about-fair-code-license/2502).

Przepływy pracy są wykonywane za pomocą serwera webowego NodeJS. Został założony w [czerwcu 2019](https://github.com/n8n-io/n8n/commit/9cb9804eeec1576d935817ecda6bd345480b97fa) i już zgromadził [+280 węzłów](https://n8n.io/integrations) i [+500 przepływów pracy](https://n8n.io/workflows/). Społeczność jest również dość dynamiczna; często zajmuje kilka dni, aby łatka została połączona i udostępniona, co jest niesamowite!

Oznacza to, że samodzielne hostowanie n8n jest dość proste. Ponadto istnieje [n8n.cloud](https://www.n8n.cloud/), hostowana wersja, która jest płatna i eliminuje konieczność martwienia się o skalowanie, bezpieczeństwo lub konserwację.

---

#### Dlaczego używać n8n, a nie Zapiera?

Dla mnie to wysoka cena. 💸

Chociaż Zapier jest fantastyczny i najprawdopodobniej zdolny do obsługi każdego przypadku użycia, który na niego rzucisz, ostatecznie darmowy poziom staje się nieprzydatny. Można projektować tylko bardzo proste procesy "dwuetapowe" i szybko osiąga się limity "zapów". Tylko klienci, którzy dokonują płatności, mają dostęp do bardziej skomplikowanych przepływów.

Ponadto, nie jest on hostowany w "twoim środowisku" (samodzielne hostowanie lub wdrożenie lokalne), co może być problematyczne, jeśli masz rygorystyczne zasady dotyczące dzielenia się danymi z zewnętrznymi dostawcami, na przykład. Ponieważ Zapier jest gotowy dla przedsiębiorstw, możesz być pewien, że otrzymasz wszystkie potrzebne funkcje i wyjątkowe wsparcie klienta 💰.

Jeśli nie przeszkadza Ci kontrolowanie własnej instancji (skalowalność, trwałość, dostępność itp.), to n8n będzie działać równie dobrze jak każdy z jego konkurentów, którzy nie są darmowi.

Jednak celem tego artykułu jest pokazanie, jak skonfigurowaliśmy n8n na naszym klastrze Kubernetes, a nie dyskusja na temat korzyści płynących z korzystania z Zapierlub n8n.

---

#### Jak skonfigurować n8n w Kubernetes

Zamiast zaczynać od zera z całkowicie nową konfiguracją Kubernetes, będziemy korzystać z przykładów podanych przez [@bacarini](https://community.n8n.io/u/bacarini), użytkownika forum społecznościowego n8n, który zaoferował swoją [konfigurację](https://community.n8n.io/t/running-with-kubernetes/681/13).

Do konfiguracji mojego klastra lokalnie używam K3s. Jeśli jest to Twój pierwszy raz z nim, możesz po prostu śledzić [serię o Kubernetes](https://sysadmin.info.pl/en/series/kubernetes/).

Po zainstalowaniu K3s użyj następującego polecenia, aby wdrożyć n8n w klastrze:

Zaczniesz od konfiguracji wdrożenia n8n i udostępnisz ją za pomocą jego konfiguracji usługi.

Ale najpierw musisz utworzyć przestrzeń nazw n8n:

```bash
kubectl create namespace n8n
```

Następnie utwórz poniższe pliki:

```yaml
# n8n-deployment.yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n-deployment
  namespace: n8n
  labels: &labels
    app: n8n
    component: deployment
spec:
  replicas: 1
  selector:
    matchLabels: *labels
  template:
    metadata:
      labels: *labels
    spec:
      containers:
      - name: n8n
        image: n8nio/n8n:latest
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 5678
        envFrom:
        - configMapRef:
            name: n8n-configmap
        - secretRef:
            name: n8n-secrets
        livenessProbe:
          httpGet:
            path: /healthz
            port: 5678
        readinessProbe:
          httpGet:
            path: /healthz
            port: 5678
        resources:
          limits:
            cpu: "1.0"
            memory: "1024Mi"
          requests:
            cpu: "0.5"
            memory: "512Mi"
```

```yaml
# n8n-service.yaml
---
apiVersion: v1
kind: Service
metadata:
  name: n8n-service
  namespace: n8n
  labels:
    app: n8n
    component: service
spec:
  type: NodePort
  selector:
    app: n8n
    component: deployment
  ports:
  - protocol: TCP
    name: http
    port: 80
    targetPort: 5678
```

Te pliki YAML są kluczowe dla konfiguracji n8n w Kubernetes. `n8n-deployment.yaml` definiuje wdrożenie aplikacji n8n, określając replikę, obraz kontenera, porty, zmienne środowiskowe oraz sondy gotowości i zdolności działania. `n8n-service.yaml` tworzy usługę Kubernetes dla n8n, definiując, jak aplikacja jest eksponowana na zewnątrz klastra.

Ważne rzeczy, o których należy pamiętać tutaj:
* Aby uniknąć kopiowania i wklejania tych samych etykiet wewnątrz siebie, przydzieliłem zmienną &labels w konfiguracji yaml (dotyczy to większości moich ustawień).
* w moim pliku n8n-deployment.yaml, ustawiłem port kontenera n8n na 5678, co odpowiada domyślnemu portowi n8n. Poprzez przekierowanie ruchu z portu 80 (http) na targetPort kontenera, mój n8n-service.yaml eksponuje kontener na tym porcie.
* Mój kontener n8n jest połączony zarówno z moimi plikami n8n-configmap.yaml, jak i n8n-secrets.yaml, chociaż wciąż muszę je stworzyć. Zajmę się tym teraz.
* Aby sprawdzić, czy usługa działa, n8n oferuje punkt końcowy /healthz. Używam tego punktu końcowego do ustawienia Sond Gotowości i Zdolności Działania dla mojego wdrożenia.
* Na koniec optymalizuję zasoby mojego kontenera, aby wykorzystywać maksymalnie 1 CPU i 1 GB RAM na moim klastrze.

Zwróć szczególną uwagę na wybór n8n-service. Nie będziemy mogli dotrzeć do naszego serwera n8n, jeśli konfiguracja yaml w kontenerze n8n-deployment nie będzie pasować do tych samych etykiet.

Możesz dowiedzieć się więcej o selektorach i o tym, jak wdrożenia działają z nimi tutaj: [tworzenie wdrożenia Kubernetes](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#creating-a-deployment)

Korzystając z tych dwóch układów, będę miał zatem następujące:

```bash
kubectl apply -f n8n-deployment.yaml,n8n-service.yaml
deployment.apps/n8n-deployment created
service/n8n-service created
```

Jeśli to sprawdzisz, możesz zauważyć, że pod ```kubectl get pods -n n8n``` jest obecnie w stanie "CreateContainerConfigError". Jest to wynik braku konfiguracji ConfigMap i Secrets. Szybko to naprawię.

#### PostgreSQL StatefulSet

Konfiguracja StatefulSet Postgres jest bardzo podobna do naszych poprzednich konfiguracji wdrożenia i wygląda następująco:

```yaml
# postgres-statefulset.yaml
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-statefulset
  namespace: n8n
  labels: &labels
    app: postgres
    component: statefulset
spec:
  serviceName: postgres-statefulset
  replicas: 1
  selector:
    matchLabels: *labels
  template:
    metadata:
      labels: *labels
    spec:
      containers:
      - name: postgres
        image: postgres:10
        ports:
        - name: postgres
          containerPort: 5432
        envFrom:
        - secretRef:
            name: postgres-secrets
```

```yaml
# postgres-service.yaml
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: n8n
  labels: &labels
    app: postgres
    component: service
spec:
  clusterIP: None
  selector:
    app: postgres
    component: statefulset
  ports:
  - name: postgres
    port: 5432
    targetPort: 5432
```
Jak możesz zauważyć, główne różnice to:

* Domyślny port dla serwera PostgreSQL to 5432, który jest portem, który obecnie udostępniam w obu moich plikach postgres-statefulset.yaml i postgres-service.yaml.
* Podobnie jak w poprzedniej konfiguracji, zwróć szczególną uwagę na selektor usługi, ponieważ musi on być zgodny z etykietami kontenera zestawu stanowego.

Korzystając z obu konfiguracji K8S, należy wykonać poniższe komendy:

```bash
kubectl apply -f postgres-statefulset.yaml,postgres-service.yaml
statefulset.apps/postgres-statefulset created
service/postgres-service created
```

#### ConfigMaps i Secrets

Muszę tylko zainicjować wszystkie podstawowe konfiguracje PostgreSQL i n8n, aby połączyć te elementy:

* Moje wdrożenie n8n jest połączone z konfiguracją Secrets o nazwie "n8n-secrets" oraz z ConfigMap o nazwie "n8n-configmap";
* Statefulset Postgres jest po prostu połączony z konfiguracją Secrets o nazwie "postgres-secrets."

```yaml
# n8n-configmap.yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: n8n-configmap
  namespace: n8n
  labels:
    app: n8n
    component: configmap
data:
  NODE_ENV: "production"
  GENERIC_TIMEZONE: "Europe/Lisbon"
  WEBHOOK_TUNNEL_URL: "https://your.domain.com/"  # well come back to this later
  # Database configurations
  DB_TYPE: "postgresdb"
  DB_POSTGRESDB_USER: "n8n"
  DB_POSTGRESDB_DATABASE: "n8n"
  DB_POSTGRESDB_HOST: "postgres-service"
  DB_POSTGRESDB_PORT: "5432"
  # Turn on basic auth
  N8N_BASIC_AUTH_ACTIVE: "true"
  N8N_BASIC_AUTH_USER: "n8n"
```

```yaml
# n8n-secrets.yaml
---
apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: n8n-secrets
  namespace: n8n
  labels:
    app: n8n
    component: secrets
stringData:
  # Database password
  DB_POSTGRESDB_PASSWORD: "n8n"
  # Basic auth credentials
  N8N_BASIC_AUTH_PASSWORD: "n8n"
  # Encryption key to hash all data
  N8N_ENCRYPTION_KEY: "n8n"
```

```yaml
# postgres-secrets.yaml
---
apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: postgres-secrets
  namespace: n8n
  labels:
    app: postgres
    component: secrets
stringData:
  PGDATA: "/var/lib/postgresql/data/pgdata"
  POSTGRES_USER: "n8n"
  POSTGRES_DB: "n8n"
  POSTGRES_PASSWORD: "n8n"
```

Większość tych konfiguracji to kopie i wklejki z [podręcznika n8n](https://docs.n8n.io/reference/configuration.html) lub przykładu udostępnionego przez [@bacarini](https://community.n8n.io/t/running-with-kubernetes/681/13), ale wszystkie one są bardzo powszechne. Kluczem jest, jak poprzednio:

* ```DB_POSTGRESDB_HOST``` w n8n-configmap. Dla mojej usługi PostgreSQL, konfiguracja yaml musi być zgodna z nazwą usługi.
* Dodatkowo, środowisko ```WEBHOOK_TUNNEL_URL``` musi być zaktualizowane. Będzie to głównie wykorzystywane do wywoływania webhooków, jednak nie będzie działać, jeśli adres URL hosta nie jest prawidłowy.

FAQ n8n radzi używać [ngrok do ustawienia tego URL](https://docs.n8n.io/credentials/twist/#how-to-configure-the-oauth-credentials-for-the-local-environment), ale odkryłem, że w k3s będzie to funkcjonować bez konieczności instalowania jakichkolwiek dodatkowych usług w systemie. Będę po prostu używał portu usługi, który będzie wyświetlany przy użyciu poniższego polecenia:

```bash
kubectl get svc -n n8n
```

W moim środowisku używam menedżera proxy NGINX, w którym zdefiniowałem URL w sposób, jaki przedstawiłem na filmie. Więc zamiast http://10.10.0.112:31600 używam n8n.local.

```yaml
# ~/k8s/n8n-configmap.yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: n8n-configmap
  namespace: default
  labels:
    app: n8n
    component: configmap
data:
  WEBHOOK_TUNNEL_URL: "http://n8n.local/"
  (...)
```

Teraz mogę po prostu zastosować wszystkie trzy pliki konfiguracyjne, zrestartować Statefulset i Deployment, a te konfiguracje zostaną ponownie załadowane:

```bash
kubectl apply -f kn8n-configmap.yaml,n8n-secrets.yaml,postgres-secrets.yaml
configmap/n8n-configmap created
secret/n8n-secrets created
secret/postgres-secrets created

$ kubectl rollout restart statefulset postgres-statefulset -n n8n
statefulset.apps/postgres-statefulset restarted

$ kubectl rollout restart deployment n8n-deployment -n n8n
deployment.apps/n8n-deployment restarted

$ kubectl get all -n n8n
NAME                                  READY   STATUS    RESTARTS       AGE
pod/n8n-deployment-5c97d55b5f-2tv5b   1/1     Running   55 (27h ago)   2d
pod/postgres-statefulset-0            1/1     Running   1 (27h ago)    28h

NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/n8n-service        NodePort    10.43.184.200   <none>        80:31600/TCP   2d22h
service/postgres-service   ClusterIP   None            <none>        5432/TCP       2d22h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/n8n-deployment   1/1     1            1           2d22h

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/n8n-deployment-84d7b5cd76   0         0         0       2d22h
replicaset.apps/n8n-deployment-65dfc7d567   0         0         0       2d22h
replicaset.apps/n8n-deployment-5c97d55b5f   1         1         1       2d22h

NAME                                    READY   AGE
statefulset.apps/postgres-statefulset   1/1     2d22h
```

#### Teraz wszystko razem 🚀

Powinieneś mieć coś podobnego w swoim katalogu roboczym, jeśli zapisywałeś konfiguracje wymienione powyżej:

```bash
adrian@cm4:~ $ ls -lha n8n-deployment/
razem 36K
drwxr-xr-x  2 adrian adrian 4.0K 19 gru 15:46 .
drwxr-xr-x 12 adrian adrian 4.0K 21 gru 10:13 ..
-rw-r--r--  1 adrian adrian  509 19 gru 15:30 n8n-configmap.yaml
-rw-r--r--  1 adrian adrian  904 19 gru 15:29 n8n-deployment.yaml
-rw-r--r--  1 adrian adrian  328 19 gru 11:40 n8n-secrets.yaml
-rw-r--r--  1 adrian adrian  276 19 gru 11:38 n8n-service.yaml
-rw-r--r--  1 adrian adrian  275 19 gru 11:41 postgres-secrets.yaml
-rw-r--r--  1 adrian adrian  289 19 gru 11:39 postgres-service.yaml
-rw-r--r--  1 adrian adrian  523 19 gru 11:39 postgres-statefulset.yaml
```

Wszystkie konfiguracje mogą być wdrożone jednocześnie poprzez wykonanie:

```bash
kubectl apply -f.
```
Nadszedł wreszcie czas, aby uruchomić nasz serwer n8n w przeglądarce!

Więc, sprawdź serwis

```bash
kubectl get svc -n n8n
```

i adres IP maszyny, na której działa K3s

```bash
hostname -I
```

i użyj NodePort, który eksponuje usługę.

Ostatecznie powinno to być np. http://10.10.0.112:31600 lub po prostu http://n8n.local, ponieważ używam własnego serwera DNS (Adguard Home).