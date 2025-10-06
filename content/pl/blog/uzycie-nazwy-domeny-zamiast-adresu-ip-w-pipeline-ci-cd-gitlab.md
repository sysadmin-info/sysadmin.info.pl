---
title: Użycie nazwy domeny zamiast adresu IP w pipeline CI/CD GitLab
date: 2024-05-31T12:00:00+00:00
description: Użycie nazwy domeny zamiast adresu IP w pipeline CI/CD GitLab
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
    image: images/2024-thumbs/gitlab02.webp
---

**Oto tutorial wideo**

{{<youtube t6e31LmgJKs>}}

### Wprowadzenie

Aby użyć nazwy domeny zamiast adresu IP w pliku `.gitlab-ci.yml` w GitLab do klonowania repozytoriów, wykonaj poniższe kroki, aby odpowiednio skonfigurować swój system.

#### Przewodnik Krok po Kroku

##### Dodawanie Klucza SSH do Sekcji Kluczy SSH Użytkownika w GitLab

Aby zapewnić bezpieczny i poprawny dostęp do repozytorium GitLab, wykonaj te kroki, aby usunąć klucz publiczny ed25519 z sekcji kluczy wdrożeniowych projektu i dodać go do sekcji kluczy SSH użytkownika.

1. **Usuń Klucz SSH z Kluczy Wdrożeniowych:**

   - **Przejdź do Swojego Projektu:**
     1. Zaloguj się do swojego instance GitLab.
     2. Przejdź do swojego projektu (np. `https://gitlab.sysadmin.homes/developers/taiko`).
   
   - **Uzyskaj Dostęp do Kluczy Wdrożeniowych:**
     1. W lewym pasku nawigacyjnym przejdź do **Ustawienia** > **Repozytorium**.
     2. Przewiń w dół do sekcji **Klucze Wdrożeniowe**.
   
   - **Usuń Klucz Publiczny:**
     1. Znajdź klucz SSH (ed25519.pub), który chcesz usunąć.
     2. Kliknij przycisk **Usuń** obok klucza, aby usunąć go z kluczy wdrożeniowych.

2. **Dodaj Klucz SSH do Kluczy SSH Użytkownika:**

   - **Uzyskaj Dostęp do Ustawień Użytkownika:**
     1. Kliknij na swój awatar w prawym górnym rogu interfejsu GitLab.
     2. Wybierz **Ustawienia** z menu rozwijanego.
   
   - **Przejdź do Kluczy SSH:**
     1. W menu ustawień użytkownika kliknij na **Klucze SSH** w lewym pasku bocznym.
   
   - **Dodaj Klucz Publiczny:**
     1. Skopiuj zawartość swojego klucza `ed25519.pub`. Klucz ten można znaleźć na swoim lokalnym komputerze, zazwyczaj w katalogu `~/.ssh/`.
       ```bash
       cat ~/.ssh/id_ed25519.pub
       ```
     2. Wklej skopiowany klucz do pola **Klucz**.
     3. Dodaj opisowy **Tytuł** dla klucza, aby łatwiej było go zidentyfikować później.
     4. Kliknij przycisk **Dodaj klucz**, aby zapisać go.

3. **Zweryfikuj Klucz SSH:**

   Po dodaniu klucza SSH, zweryfikuj, czy został on poprawnie dodany:

   - **Wyświetl Listę Kluczy SSH:**
     1. W sekcji **Klucze SSH** w ustawieniach użytkownika upewnij się, że nowy klucz pojawia się na liście.

Usuwając klucz publiczny ed25519 z kluczy wdrożeniowych projektu i dodając go do sekcji kluczy SSH użytkownika GitLab, zwiększasz bezpieczeństwo i zapewniasz, że klucz jest powiązany z konkretnym użytkownikiem, zamiast być dostępny jako klucz wdrożeniowy. Ta metoda jest bezpieczniejsza i daje lepszą kontrolę nad dostępem do repozytoriów.

4. **Zainstaluj OpenSSL (jeśli nie jest jeszcze zainstalowany):**

   Upewnij się, że `openssl` jest zainstalowany na twoim komputerze. Jeśli nie, zainstaluj go za pomocą menedżera pakietów swojej dystrybucji.

   ```bash
   sudo apt-get update
   sudo apt-get install openssl
   ```

5. **Pobierz Certyfikat:**

   Użyj polecenia `openssl`, aby połączyć się z serwerem GitLab i pobrać certyfikat. Zamień `gitlab.sysadmin.homes` na domenę swojego serwera GitLab.

   ```bash
   echo -n | openssl s_client -connect gitlab.sysadmin.homes:443 -servername gitlab.sysadmin.homes | openssl x509 > gitlab.crt
   ```

   To polecenie utworzy plik o nazwie `gitlab.crt` w bieżącym katalogu, zawierający certyfikat serwera.

6. **Zweryfikuj Certyfikat:**

   Zweryfikuj pobrany certyfikat za pomocą poniższego polecenia:

   ```bash
   openssl x509 -in gitlab.crt -text -noout
   ```

   To polecenie wydrukuje szczegóły certyfikatu, umożliwiając upewnienie się, że jest to prawidłowy certyfikat.

7. **Skopiuj Certyfikat do Zaufanego Sklepu:**

   Przenieś pobrany certyfikat do systemowego katalogu zaufanych certyfikatów i zaktualizuj certyfikaty CA:

   ```bash
   sudo cp gitlab.crt /usr/local/share/ca-certificates/gitlab.crt
   sudo update-ca-certificates
   ```

8. **Przetestuj Połączenie z Serwerem GitLab z GitLab Runner:**

   Z linii poleceń gitlab-runner, przetestuj dostęp SSH, aby upewnić się, że działa poprawnie:

   ```bash
    ssh -i ~/.ssh/id_ed25519 -T git@gitlab.sysadmin.homes
    ssh -T git@gitlab.sysadmin.homes
   ```

9. **Wyrejestruj Runnera:**

   Wyrejestruj runnera GitLab:

   ```bash
   sudo gitlab-runner unregister --all-runners
   ```

10. **Przejdź do Swojego Projektu:**
   - Zaloguj się do swojego instance GitLab.
   - Przejdź do swojego projektu (np. `https://gitlab.sysadmin.homes/developers/taiko`).

11. **Uzyskaj Dostęp do Ustawień CI/CD:**
   - W lewym pasku nawigacyjnym przejdź do **Ustawienia** > **CI/CD**.
   - Przewiń w dół do sekcji **Runnery**.

12. **Usuń Runnera GitLab:**
   - W sekcji **Runnery**, znajdź runnera, którego chcesz usunąć.
   - Kliknij przycisk **Edytuj** obok runnera, aby wyświetlić jego szczegóły.
   - Na dole strony szczegółów runnera, kliknij przycisk **Usuń**, aby usunąć runnera z projektu.

13. **Dodaj Nowego Runnera:**
   - W sekcji **Dostępne określone runnery** zobaczysz przycisk **Dodaj Runnera**. Kliknij na niego.

14. **Wypełnij Szczegóły Runnera:**
   - Pojawi się formularz, w którym musisz podać szczegóły nowego runnera.
   - **Opis:** Wprowadź opis dla runnera (np. `docker-runner`).
   - **Tagi:** Dodaj tagi identyfikujące runnera (np. `docker`, `linux`).
   - **Uruchamiaj nieoznaczone zadania:** Włącz lub wyłącz tę opcję w zależności od preferencji.
   - **Zablokowany:** Wybierz, czy zablokować runnera do bieżącego projektu, czy nie.

15. **Wygeneruj i Skopiuj Token Rejestracyjny:**
   - Po wypełnieniu szczegółów, kliknij przycisk **Zarejestruj Runnera**.
   - Wygenerowany zostanie token rejestracyjny. Skopiuj ten token, ponieważ będzie potrzebny do rejestracji runnera.

16. **Zarejestruj ponownie Runnera:**

   Po zaufaniu certyfikatowi spróbuj ponownie zarejestrować GitLab runnera:

   ```bash
   sudo gitlab-runner register
   ```

17. **Ponownie zmodyfikuj `config.toml`:**

   Edytuj plik `/etc/gitlab-runner/config.toml` za pomocą poniższego polecenia:

   ```bash
   sudo vim /etc/gitlab-runner/config.toml
   ```

   Upewnij się, że wpis zawiera: `tags = ["docker"]`, `privileged = true`, oraz `services_limit = 1`.

   Konfiguracja powinna wyglądać podobnie do tej:

   ```toml
   [[runners]]
     name = "docker"
     url = "https://gitlab.sysadmin.homes/"
     id = 2
     token = "glrt-TDN6NZ-WTx5Qy3QJZMUk"
     token_obtained_at = 2024-05-28T09:38:12Z
     token_expires_at = 0001-01-01T00:00:00Z
     executor = "docker"
     tags = ["docker"]
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

##### Podsumowanie

Poprzez pobranie certyfikatu z serwera GitLab i dodanie go do zaufanych certyfikatów systemowych, można rozwiązać problem weryfikacji certyfikatu i pomyślnie zarejestrować GitLab runnera.

##### Zmodyfikowany plik .gitlab-ci.yml

Zmodyfikowany plik `.gitlab-ci.yml` zawiera niezbędne kroki, aby dodać wpis do `/etc/hosts` oraz pobrać i zainstalować certyfikat SSL na Alpine Linux w sekcji `before_script`.

```yaml
variables:
  REPO_URL: 'git@gitlab.sysadmin.homes:developers/taiko.git'
  BRANCH: 'main'
  REPORT_PATH: '/workspace'
  REPORT_NAME: 'TAIKO_AUTOMATED_TESTS'
  DOCKER_IMAGE: "taiko"
  GIT_STRATEGY: clone
  TAIKO_SKIP_CHROMIUM_DOWNLOAD: "true"

stages:
  - clean
  - build_and_test
  - cleanup

before_script:
  # Sprawdź, czy zainstalowany jest ssh-agent, jeśli nie, zainstaluj openssh-client
  - 'which ssh-agent || ( apk update && apk add openssh-client )'
  # Uruchom ssh-agent w tle
  - eval $(ssh-agent -s)
  # Utwórz katalog .ssh, jeśli nie istnieje
  - mkdir -p ~/.ssh
  # Ustaw uprawnienia katalogu .ssh na 700
  - chmod 700 ~/.ssh
  # Utwórz pusty plik known_hosts, jeśli nie istnieje
  - touch ~/.ssh/known_hosts
  # Ustaw uprawnienia pliku known_hosts na 644
  - chmod 644 ~/.ssh/known_hosts
  # Dodaj klucz prywatny z zmiennej środowiskowej do pliku i usuń znaki powrotu karetki
  - echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_ed25519
  # Ustaw uprawnienia pliku klucza prywatnego na 400
  - chmod 400 ~/.ssh/id_ed25519
  # Dodaj klucz prywatny do ssh-agent
  - ssh-add ~/.ssh/id_ed25519
  # Utwórz plik konfiguracyjny SSH z ustawieniami dla hosta GitLab
  - echo -e "Host gitlab.sysadmin.homes\n\tUser git\n\tHostname gitlab.sysadmin.homes\n\tIdentityFile ~/.ssh/id_ed25519\n\tIdentitiesOnly yes\n\tStrictHostKeyChecking no" > ~/.ssh/config
  # Dodaj adres IP serwera GitLab do /etc/hosts
  - echo "10.10.0.119 gitlab.sysadmin.homes" >> /etc/hosts
  # Zainstaluj OpenSSL, jeśli nie jest zainstalowany
  - apk add --no-cache openssl
  # Pobierz certyfikat SSL z serwera GitLab i zapisz go do pliku
  - echo -n | openssl s_client -connect gitlab.sysadmin.homes:443 -servername gitlab.sysadmin.homes | openssl x509 > gitlab.crt
  # Skopiuj pobrany certyfikat do katalogu z zaufanymi certyfikatami
  - cp gitlab.crt /usr/local/share/ca-certificates/gitlab.crt
  # Zaktualizuj listę zaufanych certyfikatów
  - update-ca-certificates

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
        ln -s /usr/local/lib/node_modules/ /lib/node_modules
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

clean_workspace:
  stage: cleanup
  tags:
    - docker
  script:
    - rm -rf $CI_PROJECT_DIR/*
```

W zaktualizowanym pliku `.gitlab-ci.yml`, sekcja `before_script` zawiera niezbędne kroki, aby dodać wpis do `/etc/hosts` oraz pobrać i zainstalować certyfikat SSL dla serwera GitLab na kontenerze opartym na Alpine. Zapewnia to

, że GitLab Runner może poprawnie połączyć się z serwerem GitLab podczas wykonywania zadania. Dodanie [[ -f /.dockerenv ]] && echo -e “Host *StrictHostKeyChecking no” > ~/.ssh/config powinno wyłączyć sprawdzanie kluczy hosta dla połączeń SSH, co może pomóc rozwiązać problem z dostępem.