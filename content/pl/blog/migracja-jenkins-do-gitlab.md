---
title: Migracja Jenkins do GitLab
date: 2024-05-30T12:00:00+00:00
description: Migracja Jenkins do GitLab
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- GitLab
categories:
- Taiko
- Gauge
- Node.js
- npm
- GitLab
cover:
    image: images/2024-thumbs/gitlab01.webp
---

**Oto samouczek wideo**

{{<youtube PAIeNMBM-Y4>}}

## Wprowadzenie

Możesz organizować i wykonywać swoje testy bezpośrednio w GitLab za pomocą GitLab Continuous Integration/Continuous Development, co często eliminuje konieczność korzystania z Jenkins. GitLab Continuous Integration/Continuous Development oferuje solidne funkcje, które spełniają różnorodne wymagania dotyczące ciągłej integracji i dostarczania. Oto kilka argumentów przemawiających za użyciem GitLab Continuous Integration/Continuous Development zamiast Jenkins:

### Zalety GitLab Continuous Integration/Continuous Development

1. **Zintegrowana platforma:** - GitLab oferuje zintegrowaną platformę, która pozwala zarządzać procesami wdrażania, pipeline'ami Continuous Integration/Continuous Development oraz repozytoriami kodu w jednym miejscu.

2. **Uproszczona konfiguracja:** - GitLab Continuous Integration/Continuous Development łatwo zarządza i wersjonuje twoją konfigurację Continuous Integration/Continuous Development wraz z kodem, używając jednego pliku `.gitlab-ci.yml` do konfiguracji pipeline'u.

3. **Wbudowane zabezpieczenia:** - Ustawienia GitLab pozwalają na bezpieczne zarządzanie zmiennymi środowiskowymi i sekretami.
   - GitLab natywnie obsługuje zarządzanie i maskowanie wrażliwych zmiennych.

4. GitLab Continuous Integration/Continuous Development jest skalowalny, co oznacza, że może rosnąć wraz z twoim projektem. Możliwe jest zarządzanie równoczesnością zadań, używanie wielu runnerów oraz uruchamianie zadań równolegle.
   - GitLab Runners to narzędzie proste do skonfigurowania do dystrybucji obciążenia.

5. **Elastyczność:** - Obsługuje różnorodne narzędzia i środowiska, takie jak dostawcy chmur, Docker i Kubernetes.
   - Pozwala na użycie złożonych zależności zadań i unikalnych skryptów.

6. **Przyjazny interfejs użytkownika:** - Logi zadań, artefakty i statusy pipeline'ów są wyraźnie widoczne w interfejsie GitLab.
   - Monitorowanie i zarządzanie pipeline'ami za pośrednictwem interfejsu webowego jest proste.

### Jak przejść z Jenkins do GitLab Continuous Integration/Continuous Development

1. Przeanalizuj swoje istniejące pipeline'y Jenkins.
   - Sporządź listę wszystkich zadań Jenkins, procesów i etapów, które posiadasz.
   - Zanotuj użycie wszelkich wtyczek lub specyficznych dostosowań.

2. **Dostosuj pipeline'y Jenkins do `.gitlab-ci.yml`:**
   - Dopasuj każde zadanie Jenkins do etapu GitLab Continuous Integration/Continuous Development.
   - Przekształć logikę Jenkinsfile lub skrypty Groovy do składni YAML GitLab Continuous Integration/Continuous Development.
   Dla złożonych operacji użyj dynamicznych pipeline'ów potomnych lub techniki macierzy.

3. **Zainstaluj i skonfiguruj GitLab Runners:** - Zainstaluj i skonfiguruj GitLab Runners do wykonywania twoich zadań. GitLab ma wspólne runnery, których możesz używać, lub możesz skonfigurować własne runnery.

4. **Skonfiguruj zmienne Continuous Integration/Continuous Development:** - Zapisz wszelkie zmienne środowiskowe, poświadczenia i sekrety wymagane w ustawieniach GitLab Continuous Integration/Continuous Development.

5. **Przetestuj swoje pipeline'y:** - Uruchom zmigrowane pipeline'y za pomocą GitLab Continuous Integration/Continuous Development i upewnij się, że wszystko działa poprawnie.
   - Przejrzyj logi zadań i artefakty, aby rozwiązać ewentualne problemy.

6. **Optymalizuj i automatyzuj:** - Popraw wydajność i niezawodność swojej konfiguracji pipeline'u.
   - Ustaw wyzwalacze i harmonogramy pipeline'ów, aby zautomatyzować proces Continuous Integration/Continuous Development.

## Jak skonfigurować GitLab runner

Możliwe jest zainstalowanie Docker na maszynie wirtualnej (VM) i używanie jej jako GitLab Runner. Dzięki tej konfiguracji możesz używać maszyny wirtualnej (VM) do wykonywania operacji Continuous Integration/Continuous Development jako executor Docker. Oto jak to zrobić:

### Kroki do skonfigurowania GitLab Runner na maszynie wirtualnej

#### 1. Przygotuj maszynę wirtualną

Upewnij się, że na twojej maszynie wirtualnej jest zainstalowany odpowiedni system operacyjny, taki jak Ubuntu, Debian, CentOS lub inna dystrybucja Linux obsługiwana przez GitLab Runner.

#### 2. Zainstaluj Docker na maszynie wirtualnej

Zainstaluj Docker, wykonując następujące kroki:

{{< tabs Debian CentOS >}}
  {{< tab >}}
  ##### Debian/Ubuntu
  ```bash
  # Dodaj oficjalny klucz GPG Docker:
  sudo apt update
  sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc

  # Dodaj repozytorium do źródeł Apt:
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt update
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl start docker
  sudo systemctl enable docker
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### CentOS
  ```bash
  sudo yum install -y yum-utils device-mapper-persistent-data lvm2
  sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
  sudo yum install -y docker-ce
  sudo systemctl start docker
  sudo systemctl enable docker
  ```
  {{< /tab >}}
{{< /tabs >}}

Zweryfikuj, czy Docker jest poprawnie zainstalowany:

```bash
sudo docker --version
```

Zweryfikuj poprawność instalacji, uruchamiając obraz hello-world:

```bash
sudo docker run hello-world
```

#### 3. Zainstaluj GitLab Runner

Pobierz i zainstaluj GitLab Runner:

{{< tabs Debian CentOS >}}
  {{< tab >}}
  ##### Debian/Ubuntu
  ```bash
  sudo curl -L --output /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64
  sudo chmod +x /usr/local/bin/gitlab-runner
  sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash
  sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
  sudo gitlab-runner start
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### CentOS
  ```bash
  sudo yum install -y gitlab-runner
  sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
  sudo gitlab-runner start
  ```
  {{< /tab >}}
{{< /tabs >}}

#### 4. Zarejestruj GitLab Runner

Zarejestruj GitLab Runner z twoją instancją GitLab. Podczas procesu rejestracji będziesz musiał podać:

- Adres URL twojej instancji GitLab (np. `https://gitlab.example.com`).
- Token rejestracyjny (dostępny w twoim projekcie GitLab w sekcji Ustawienia > Continuous Integration/Continuous Development > Runners).
- Opis runnera (np. `my-vm-runner`).
- Tag'i identyfikujące

 runnera (np. `docker, vm`).
- Typ executora (`docker`).
- Obraz Docker do użycia (np. `docker:latest`).

##### Token

Unikalny ciąg znaków znany jako token rejestracyjny pozwala GitLab Runner na zarejestrowanie się jako runner dla konkretnego projektu, grupy lub instancji i uwierzytelnienie z twoją instancją GitLab. Token rejestracyjny dla twojego projektu GitLab można znaleźć w następujący sposób:

##### Jak znaleźć token rejestracyjny

1. **Zaloguj się do GitLab:** - Przejdź do `https://10.10.0.119/` w przeglądarce internetowej, aby uzyskać dostęp do twojej instancji GitLab.
   - Wprowadź swoje dane logowania, aby się zalogować.

2. **Przejdź do swojego projektu:** - Zlokalizuj konkretny projekt, dla którego chcesz zarejestrować runnera.
   - Możesz użyć pola wyszukiwania lub przejrzeć listę swoich projektów, aby znaleźć swój projekt.

3. Wybierz menu ustawień Continuous Integration/Continuous Development.
   - Wybierz **Ustawienia** z menu po lewej stronie projektu.
   - Wybierz **Continuous Integration/Continuous Development** z **Ustawienia**.

4. **Rozwiń sekcję Runners:** - Aby zobaczyć dodatkowe opcje, przewiń w dół do sekcji **Runners** i wybierz przycisk **Rozwiń**.

5. **Znajdź token rejestracyjny:** - Token **Registration token** można znaleźć w sekcji **Specific Runners**.
   - Aby zarejestrować swojego GitLab Runner, musisz użyć tego tokenu.

##### Przykład lokalizacji tokenu rejestracyjnego

Oto przykład, jak może wyglądać strona ustawień:

```
Settings
├── General
├── Integrations
├── CI / CD
│   ├── Pipelines
│   ├── Jobs
│   ├── Runners
│   │   ├── Shared Runners
│   │   └── Specific Runners
│   │       ├── Runner token: [your_project_specific_token]
│   │       └── Registration token: [your_registration_token]
```

##### Zarejestruj runnera za pomocą tokenu

Gdy już masz token rejestracyjny, przystąp do procesu rejestracji:

```bash
sudo gitlab-runner register
```

Gdy zostaniesz o to poproszony, wprowadź adres URL instancji GitLab i token rejestracyjny pobrany z ustawień Continuous Integration/Continuous Development:

```
Enter the GitLab instance URL (for example, https://gitlab.com/):
https://10.10.0.119/
Enter the registration token:
[your_registration_token]
```

Postępuj zgodnie z kolejnymi wskazówkami, aby dokończyć rejestrację, określając opis, tagi i typ executora (`docker`).

#### 1. Dodawanie tagów do GitLab Runner

Podczas rejestracji GitLab Runner możesz przypisać do niego tagi. Jeśli już zarejestrowałeś runner bez tagów, możesz dodać tagi, edytując konfigurację.

##### Podczas rejestracji runnera

Podczas uruchamiania polecenia `gitlab-runner register` zostaniesz poproszony o wprowadzenie tagów. Wprowadź tagi, których chcesz użyć, oddzielając je przecinkami. Na przykład:

```bash
sudo gitlab-runner register
```

Postępuj zgodnie z instrukcjami i dodaj tagi, gdy zostaniesz o to poproszony:

```
Enter the GitLab instance URL (for example, https://gitlab.com/):
https://10.10.0.119/
Enter the registration token:
[your_registration_token]
Enter a description for the runner:
[my-vm-runner]
Enter tags for the runner (comma-separated):
docker,vm,ci
```

#### Po rejestracji (Edycja `config.toml`)

Jeśli runner jest już zarejestrowany, możesz dodać tagi, edytując plik `config.toml`, zwykle znajdujący się w `/etc/gitlab-runner/config.toml`:

```toml
[[runners]]
  name = "my-vm-runner"
  url = "https://10.10.0.119/"
  token = "YOUR_REGISTRATION_TOKEN"
  executor = "docker"
  tags = ["docker", "vm", "ci"]
  [runners.custom_build_dir]
  [runners.docker]
    tls_verify = false
    image = "docker:latest"
    privileged = true
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache"]
    shm_size = 0
  [runners.cache]
```

##### 2. Użycie tagów w `.gitlab-ci.yml`

Zaktualizuj plik `.gitlab-ci.yml`, aby określić tagi dla swoich zadań. Zapewni to, że zadania zostaną przechwycone przez runnery z pasującymi tagami.

---
##### Instalowanie GitLab Runner za pomocą Docker - dodano dodatkowo, jeśli chcesz użyć Docker zamiast maszyny wirtualnej.
```bash
docker run -d --name gitlab-runner --restart always \
  -v /srv/gitlab-runner/config:/etc/gitlab-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  gitlab/gitlab-runner:latest
```
##### Rejestracja Runnera
```bash
docker run --rm -v /srv/gitlab-runner/config:/etc/gitlab-runner gitlab/gitlab-runner:latest register
```
---

#### 5. Konfiguracja runnera do używania Docker

##### Przypisz runnera do swojego projektu

1. **Zweryfikuj instalację runnera:**
   - Upewnij się, że GitLab Runner jest poprawnie zainstalowany i zarejestrowany zgodnie z wcześniejszymi krokami.
   - Sprawdź status runnera:

   ```bash
   sudo gitlab-runner status
   ```

2. **Sprawdź konfigurację runnera:**
   - Zweryfikuj, czy runner jest wymieniony w interfejsie GitLab i jest przypisany do właściwego projektu.

3. **Przypisz runner do swojego projektu:**
   - Przejdź do swojego projektu GitLab.
   - Przejdź do **Settings** > **Continuous Integration/Continuous Development**.
   - Rozwiń sekcję **Runners**.
   - Jeśli runner jest zarejestrowany, ale nie przypisany, możesz zobaczyć go w sekcji **Available specific runners**. Kliknij przycisk **Enable for this project** obok swojego runnera.

##### Konfiguracja executora

Podczas rejestracji runnera określasz typ executora. Jeśli zarejestrowałeś runner z `docker` jako executor, nie musisz nic zmieniać w swoim pliku `.gitlab-ci.yml` w odniesieniu do executora. Jednak upewnij się, że konfiguracja runnera w pliku `config.toml` jest poprawna:

Poprzez modyfikację pliku `/etc/gitlab-runner/config.toml`, upewnij się, że GitLab Runner jest skonfigurowany do używania Docker. Zmień również `services_limit`, aby pozwolić na co najmniej 1 usługę:

```toml
[[runners]]
  name = "docker"
  url = "https://10.10.0.119/"
  id = 2
  token = "glrt-TDN6NZ-WTx5Qy3QJZMUk"
  token_obtained_at = 2024-05-28T09:38:12Z
  token_expires_at = 0001-01-01T00:00:00Z
  executor = "docker"
  tags = ["runner", "docker"]
  [runners.custom_build_dir]
  [runners.cache]
    MaxUploadedArchiveSize = 0
    [runners.cache.s3]
    [runners.cache.gcs]
    [runners.cache.azure]
  [runners.docker]
    tls_verify = false
    image = "docker:latest"
    privileged = true
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache"]
    shm_size = 0
    network_mtu = 0
    services_limit = 1
```
Upewnij się, że zdolność Docker-in-Docker (DinD) jest włączona poprzez ustawienie `privileged` na {true}.

**Zrestartuj GitLab Runner:**

Po zapisaniu zmian, zrestartuj GitLab Runner, aby zastosować nową konfigurację:

```bash
sudo gitlab-runner restart
```

**Zweryfikuj Konfigurację:**

Sprawdź konfigurację runnera, aby upewnić się, że zmiany zostały zastosowane:

```bash
sudo gitlab-runner list
```

#### 6.  Dodaj certyfikat SSL

##### 1. **Dodaj certyfikat serwera GitLab do magazynu zaufanych certyfikatów Runnera**

Jeśli twój serwer GitLab używa certyfikatu samopodpisanego lub wewnętrznego CA, musisz dodać certyfikat do zaufanych certyfikatów GitLab Runnera.

##### a. **Zainstaluj OpenSSL (jeśli nie jest już zainstalowany):**

Upewnij się, że `openssl` jest zainstalowany na twojej maszynie. Możesz go zainstalować używając menedżera pakietów twojej dystrybucji, jeśli nie jest już obecny.

   ```bash
   sudo apt-get update
   sudo apt-get install openssl
   ```

##### b. **Uzyskaj Certyfikat**

Użyj polecenia `openssl`, aby połączyć się z serwerem GitLab i pobrać certyfikat. Zastąp `10.10.0.119` domeną twojego serwera GitLab.

   ```bash
   echo -n | openssl s_client -connect 10.10.0.119:443 -servername 10.10.0.119 | openssl x509 > gitlab.crt
   ```

To polecenie utworzy plik nazwany `gitlab.crt` w twoim bieżącym katalogu zawierający certyfikat serwera.

##### c. **Dodaj certyfikat do magazynu zaufanych certyfikatów Runnera**

Skopiuj certyfikat do odpowiedniego katalogu dla zaufanych certyfikatów. Na większości dystrybucji Linuksa jest to `/usr/local/share/ca-certificates` lub `/etc/ssl/certs`.

```bash
sudo cp gitlab.crt /usr/local/share/ca-certificates/gitlab.crt
sudo update-ca-certificates
```

##### c. **Zrestartuj GitLab Runnera**

Po zaktualizowaniu certyfikatów, zrestartuj usługę GitLab Runner, aby zastosować zmiany:

```bash
sudo systemctl restart gitlab-runner
```

Możesz zagwarantować bezpieczne połączenie między runnerem a serwerem GitLab, dodając certyfikat serwera GitLab do magazynu zaufanych certyfikatów runnera.

#### 7. Wygeneruj parę kluczy do klonowania repozytorium Git

Błąd `exit code 128`, z którym się spotykasz, wskazuje na problem związany z weryfikacją klucza SSH hosta lub uprawnieniami podczas próby klonowania repozytorium Git. Przyjrzyjmy się temu problemowi bliżej.

#### Upewnij się, że konfiguracja kluczy SSH i znanych hostów jest poprawna

##### 1. Dodaj klucz SSH do znanych hostów

Upewnij się, że klucz SSH hosta jest poprawnie dodany do znanych hostów na runnerze:

```bash
ssh-keyscan 10.10.0.119 >> ~/.ssh/known_hosts
```

Uwzględnij ten krok w swoim skrypcie GitLab CI, aby upewnić się, że działa dla wszystkich runnerów:

##### 2. Użyj klucza SSH do klonowania

Upewnij się, że masz skonfigurowany klucz wdrożeniowy lub token dostępu osobistego z dostępem SSH do klonowania repozytorium. Jeśli nie skonfigurowałeś klucza SSH, możesz go wygenerować i dodać do swojego konta GitLab lub projektu:

```bash
ssh-keygen -t ed25519 -C "gitlab-runner"
```

Dodaj klucz publiczny (`~/.ssh/id_ed25519.pub`) do swojego projektu GitLab w sekcji **Settings** > **Repository** > **Deploy Keys**.

##### 3. Upewnij się, że GitLab Runner ma dostęp do klucza SSH

GitLab Runner musi używać klucza SSH do uwierzytelniania. Możesz dodać klucz prywatny SSH jako zmienną tajną w ustawieniach GitLab Continuous Integration/Continuous Development.

##### Dodaj klucz SSH jako zmienną tajną

1. Przejdź do swojego projektu GitLab.
2. Wejdź w **Settings** > **Continuous Integration/Continuous Development**.
3. Rozwiń sekcję **Variables**.
4. Dodaj nową zmienną:
   - **Key**: `SSH_PRIVATE_KEY`
   - **Value**: Wklej zawartość swojego prywatnego klucza SSH (`~/.ssh/id_ed25519`).
   - Zaznacz **Masked** i **Protected** jeśli to odpowiednie.

##### 4. Utwórz `.gitlab-ci.yml` aby użyć klucza SSH

Utwórz plik `.gitlab-ci.yml`, aby użyć prywatnego klucza SSH do uwierzytelniania i zbudować obraz Docker z Dockerfile oraz uruchomić testy w tym kontenerze Docker:

```yaml
variables:
  REPO_URL: 'git@10.10.0.119:developers/taiko.git'
  BRANCH: 'main'
  REPORT_PATH: '/workspace'
  REPORT_NAME: 'TAIKO_AUTOMATED_TESTS'
  DOCKER_IMAGE: "taiko"
  GIT_STRATEGY: clone
  TAIKO_SKIP_CHROMIUM_DOWNLOAD: "true"
  RUNNER_SCRIPT_TIMEOUT: 60m

stages:
  - clean
  - build_and_test
  - cleanup

before_script:
  - 'which ssh-agent || ( apt-get update -y && apt-get install openssh-client -y )'
  - eval $(ssh-agent -s)
  - mkdir -p ~/.ssh
  - chmod 700 ~/.ssh
  - touch ~/.ssh/known_hosts
  - ssh-keyscan 10.10.0.119 >> ~/.ssh/known_hosts
  - chmod 644 ~/.ssh/known_hosts
  - echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_ed25519
  - chmod 400 ~/.ssh/id_ed25519
  - ssh-add ~/.ssh/id_ed25519

build_and_test_awx:
  stage: build_and_test
  tags:
    - docker
  image: docker:latest
  services:
    - name: docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_HOST: "tcp://docker:2375"
    DOCKER_TLS_CERTDIR: ""
  script:
    - git clone --single-branch --branch $BRANCH $REPO_URL
    - docker build --build-arg NPM_USER="${NPM_USER}" --build-arg NPM_PASS="${NPM_PASS}" -t $DOCKER_IMAGE -f Dockerfile .
    - |
      docker run --rm -v ${CI_PROJECT_DIR}:/workspace $DOCKER_IMAGE bash -c '
        server_address="awx.sysadmin.homes"
        username="${AWX_USERNAME}"
        password="${AWX_PASSWORD}"
        rm -rf /workspace/node_modules
        rm -rf /lib/node_modules
        ln -s /usr/local/lib/node_modules/ /workspace/node_modules
        ln -s /usr/local/lib/node_modules/ /lib/node_modules
        rm -f *.tar downloaded//*
        rm -rf reports .gauge logs
        gauge run /workspace/specs/test-awx.spec
      '
    - if [ -d "${CI_PROJECT_DIR}/reports/" ]; then
        formattedDate=$(date +"%d_%m_%Y_%H_%M");
        filename="PASS_${REPORT_NAME}_${formattedDate}_AWX.tar";
        tar -cf ${filename} ${CI_PROJECT_DIR}/reports/ ${CI_PROJECT_DIR}/logs/;
        mv ${filename} ${CI_PROJECT_DIR}/;
      fi
    - docker system prune -af
    - docker volume prune -f
  artifacts:
    paths:
      - "${CI_PROJECT_DIR}/*.tar"
  timeout: 60m

build_and_test_argocd:
  stage: build_and_test
  tags:
    - docker
  image: docker:latest
  services:
    - name: docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_HOST: "tcp://docker:2375"
    DOCKER_TLS_CERTDIR: ""
  script:
    - git clone --single-branch --branch $BRANCH $REPO_URL
    - docker build --build-arg NPM_USER="${NPM_USER}" --build-arg NPM_PASS="${NPM_PASS}" -t $DOCKER_IMAGE -f Dockerfile .
    - |
      docker run --rm -v ${CI_PROJECT_DIR}:/workspace $DOCKER_IMAGE bash -c '
        server_address="argocd.sysadmin.homes"
        username="${ARGOCD_USERNAME}"
        password="${ARGOCD_PASSWORD}"
        rm -rf /workspace/node_modules
        rm -rf /lib/node_modules
        ln -s /usr/local/lib/node_modules/ /workspace/node_modules
        ln -s /

usr/local/lib/node_modules/ /lib/node_modules
        rm -f *.tar downloaded//*
        rm -rf reports .gauge logs
        gauge run /workspace/specs/test-argocd.spec
      '
    - if [ -d "${CI_PROJECT_DIR}/reports/" ]; then
        formattedDate=$(date +"%d_%m_%Y_%H_%M");
        filename="PASS_${REPORT_NAME}_${formattedDate}_ArgoCD.tar";
        tar -cf ${filename} ${CI_PROJECT_DIR}/reports/ ${CI_PROJECT_DIR}/logs/;
        mv ${filename} ${CI_PROJECT_DIR}/;
      fi
    - docker system prune -af
    - docker volume prune -f
  artifacts:
    paths:
      - "${CI_PROJECT_DIR}/*.tar"
  timeout: 60m

clean_workspace:
  stage: cleanup
  tags:
    - docker
  script:
    - rm -rf $CI_PROJECT_DIR/*
```

Upewnij się, że DOCKER_TLS_CERTDIR jest ustawiony na pustą wartość:

Zmienna środowiskowa DOCKER_TLS_CERTDIR powinna być ustawiona na pusty ciąg, aby Docker nie próbował używać TLS.

Umieść `.gitlab-ci.yml` w katalogu głównym swojego projektu GitLab.

#### 8.  Dodaj loginy i hasła jako zmienne w GitLab

W GitLab możesz przechowywać poufne informacje, takie jak loginy i hasła, jako zmienne środowiskowe Continuous Integration/Continuous Development. Te zmienne są zaszyfrowane i mogą być dostępne przez zadania w pipeline Continuous Integration/Continuous Development. Oto jak przechowywać i zarządzać tymi zmiennymi:

##### Kroki, aby dodać zmienne Continuous Integration/Continuous Development w GitLab

1. **Przejdź do swojego projektu:**
   - Otwórz swój projekt GitLab.

2. **Wejdź w Ustawienia:**
   - W lewym pasku bocznym kliknij **Settings**.

3. **Wejdź w Ustawienia Continuous Integration/Continuous Development:**
   - W menu ustawień wybierz **Continuous Integration/Continuous Development**.

4. **Rozwiń sekcję Zmienne:**
   - Przewiń w dół do sekcji **Variables** i kliknij przycisk **Expand**.

5. **Dodaj zmienną:**
   - Kliknij przycisk **Add variable**.
   - **Key:** Wprowadź nazwę zmiennej, np. `NPM_USER`, `NPM_PASS`, `AWX_USERNAME_`, `AWX_PASSWORD`, itd.
   - **Value:** Wprowadź odpowiadającą wartość dla zmiennej.
   - **Type:** Upewnij się, że typ zmiennej to `Variable`.
   - **Protected:** Zaznacz to pole, jeśli chcesz, aby zmienna była dostępna tylko dla chronionych gałęzi lub tagów.
   - **Masked:** Zaznacz to pole, jeśli chcesz, aby wartość zmiennej była maskowana w logach zadań.
   - **Environment scope:** Domyślnie dotyczy wszystkich środowisk, ale możesz określić konkretne środowisko, jeśli jest to potrzebne.

6. **Zapisz zmienną:**
   - Kliknij przycisk **Add variable**, aby zapisać zmienną.

##### Przykład konfiguracji zmiennych

Dla zmiennych używanych w twoim pipeline, dodasz je w następujący sposób:

- `NPM_USER`
- `NPM_PASS`
- `AWX_USERNAME`
- `AWX_PASSWORD`
- `ARGOCD_USERNAME`
- `ARGOCD_PASSWORD`
- i tak dalej dla każdej usługi.

##### `NPM_USER` i `NPM_PASS`

Zaktualizuj swój `.gitlab-ci.yml`, aby przekazać te zmienne do procesu budowania Docker.

Upewnij się, że twój `Dockerfile` poprawnie używa argumentów budowania `NPM_USER` i `NPM_PASS`:

```dockerfile
FROM node:22.2-alpine3.20

ARG NPM_USER
ARG NPM_PASS
```

##### Dostęp do zmiennych w pipeline Continuous Integration/Continuous Development GitLab

W pliku `.gitlab-ci.yml` możesz uzyskać dostęp do tych zmiennych używając składni `${VARIABLE_NAME}`. GitLab Continuous Integration/Continuous Development automatycznie wstrzykuje te zmienne do środowiska pipeline.

Oto fragment konfiguracji pipeline pokazujący, jak używać tych zmiennych:

```yaml
build_docker_image:
  stage: build_docker_image
  script:
    - |
      docker build -t $DOCKER_IMAGE \
        --build-arg NPM_USER=${NPM_USER} \
        --build-arg NPM_PASS=${NPM_PASS} \
        -f Dockerfile .

run_tests:
  stage: run_tests
  script:
    - docker run --rm -v /workspace:/workspace $DOCKER_IMAGE bash -c "
      export server_address=${server_address} &&
      export username=${username} &&
      export password=${password} &&
      ln -s /usr/local/lib/node_modules/ ${CI_PROJECT_DIR}/node_modules &&
      ln -s /usr/local/lib/node_modules/ /lib/node_modules &&
      rm -f *.tar downloaded//* &&
      rm -rf reports .gauge logs &&
      gauge run ${CI_PROJECT_DIR}/specs/${SPEC_FILE}"
```

#### 9. Modyfikacja testów

argocd.js

```javascript
const { goto, text, button, textBox, write, click, into, evaluate } = require('taiko');
const assert = require('assert');

step("Navigate to the ArgoCD login page", async function () {
    await goto("http://argocd.sysadmin.homes");
});

step("Assert the ArgoCD login page is loaded", async () => {
    assert(await text("Let's get stuff deployed!").exists());
});

step('Use ArgoCD credentials <username>:<password>', async () => {
    let username = process.env.ARGOCD_USERNAME || '';
    let password = process.env.ARGOCD_PASSWORD || '';

    await write(username, into(textBox("Username")));
    await write(password, into(textBox("Password")));
});

step("Click the ArgoCD login button", async () => {
    await click(button("SIGN IN"));
});

step("Verify successful ArgoCD login", async () => {
    await text("Applications").exists();
});

step("Clear all ArgoCD tasks", async function () {
    await evaluate(() => localStorage.clear());
});
```

awx.js

```javascript
const { goto, text, button, textBox, write, click, into, evaluate } = require('taiko');
const assert = require('assert');

step("Navigate to the AWX login page", async function () {
    await goto("http://awx.sysadmin.homes");
});

step("Assert the AWX login page is loaded", async () => {
    assert(await text("Welcome to AWX!").exists());
});

step('Use AWX credentials <username>:<password>', async () => {
    let username = process.env.AWX_USERNAME || '';
    let password = process.env.AWX_PASSWORD || '';

    await write(username, into(textBox("Username")));
    await write(password, into(textBox("Password")));
});

step("Click the AWX login button", async () => {
    await click(button("Log In"));
});

step("Verify AWX login", async () => {
    await text("Dashboard").exists();
});

step("Clear all AWX tasks", async function () {
    await evaluate(() => localStorage.clear());
});

```

#### 10. Rozwiązywanie problemów

Jeśli twoje zadanie jest w stanie oczekiwania i czeka na odbiór przez runnera, istnieje kilka kroków, które możesz podjąć, aby rozwiązać ten problem:

#### 1. Sprawdź Rejestrację i Status Runnera

Upewnij się, że runner jest poprawnie zarejestrowany i online:

```bash
sudo gitlab-runner list
```

To polecenie wyświetli wszystkie zarejestrowane runnery i ich status.

#### 2. Sprawdź Tagowanie Runnera

Upewnij się, że runner ma poprawne tagi i że tagi te pasują do tych określonych w pliku `.gitlab-ci.yml`. Możesz dodać lub zmodyfikować tagi, edytując plik `config.toml` i następnie restartując runnera.

#### 3. Upewnij się, że Runner jest Przypisany do Projektu

Upewnij się, że runner jest włączony dla twojego projektu:
1. Przejdź do swojego projektu GitLab.
2. Wejdź w **Settings** > **Continuous Integration/Continuous Development**.
3. Rozwiń sekcję **Runners**.
4. Upewnij się, że twój runner jest wymieniony w sekcji **Available specific runners** i jest włączony dla twojego projektu.

#### 4. Przeglądaj Logi Runnera

Sprawdź logi runnera, aby zobaczyć, czy pojawiają się jakieś błędy, które mogą wskazywać, dlaczego zadania nie są odbierane:

```bash
sudo journalctl -u gitlab

-runner -f
```

#### 5. Zrestartuj Runnera

Restartowanie GitLab Runnera czasami może rozwiązać problemy:

```bash
sudo gitlab-runner restart
```

#### 6. Przykład `.gitlab-ci.yml` z Tagami

Upewnij się, że odpowiednie tagi są określone w pliku `.gitlab-ci.yml` zgodnie z konfiguracją twojego runnera.

#### Upewnij się, że Runner jest Włączony dla Projektu

1. **Przejdź do swojego projektu GitLab.**
2. **Wejdź w Ustawienia > Continuous Integration/Continuous Development.**
3. **Rozwiń sekcję Runners.**
4. **Sprawdź, czy runner jest wymieniony w "Available specific runners" i upewnij się, że jest włączony.**

#### 7. Przeglądaj Logi Runnera

Logi dla usługi `gitlab-runner` są zazwyczaj zarządzane przez systemowy serwis logowania, który zazwyczaj jest `systemd` w większości nowoczesnych dystrybucji Linuksa. Oto najczęstsze sposoby na dostęp do logów dla usługi `gitlab-runner`:

### Przeglądanie Logów GitLab Runnera

1. **Używając `journalctl`:**

   Polecenie `journalctl` może być używane do przeglądania logów dla usług zarządzanych przez `systemd`. Aby przeglądać logi dla usługi `gitlab-runner`, możesz użyć:

   ```bash
   sudo journalctl -u gitlab-runner.service
   ```

   To polecenie pokazuje wszystkie logi dla usługi `gitlab-runner`. Możesz użyć dodatkowych opcji, aby filtrować logi, takich jak `-f` aby śledzić logi w czasie rzeczywistym lub `--since` aby przeglądać logi od określonego czasu:

   ```bash
   sudo journalctl -u gitlab-runner.service -f
   sudo journalctl -u gitlab-runner.service --since "2024-05-28 00:00:00"
   ```

#### 8. Konfigurowanie Logowania Runnera GitLab

Jeśli chcesz skonfigurować, gdzie GitLab Runner zapisuje swoje logi, możesz zmodyfikować plik `config.toml` lub dostosować konfigurację usługi. Oto kroki, aby zmienić ustawienia logowania:

1. **Zmodyfikuj `config.toml`:**

   Plik `config.toml` dla GitLab Runnera znajduje się zazwyczaj w `/etc/gitlab-runner/config.toml`. Możesz dodać lub zmodyfikować ustawienia logowania tam. Jednak `gitlab-runner` nie obsługuje natywnie specyfikacji pliku logów w `config.toml`.

2. **Przekierowanie Logów w Pliku Usługi:**

   Jeśli chcesz przekierować logi do konkretnego pliku, możesz zmodyfikować plik usługi `gitlab-runner`. Zazwyczaj znajduje się on w `/etc/systemd/system/gitlab-runner.service` lub podobnym.

   ```bash
   sudo vim /etc/systemd/system/gitlab-runner.service
   ```

   Dodaj lub zmodyfikuj linię `ExecStart`, aby przekierować logi:

   ```ini
   [Service]
   ExecStart=/usr/local/bin/gitlab-runner run --working-directory /home/gitlab-runner --config /etc/gitlab-runner/config.toml --log-level debug >> /var/log/gitlab-runner.log 2>&1
   ```

   Załaduj ponownie konfigurację `systemd` i zrestartuj usługę:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart gitlab-runner
   ```