---
title: Automatyzacja Testów Taiko i Gauge z Użyciem Jenkins, GitLab i Docker - Kompletny Samouczek
date: 2024-05-21T17:30:00+00:00
description: Automatyzacja Testów Taiko i Gauge z Użyciem Jenkins, GitLab i Docker - Kompletny Samouczek
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
cover:
    image: images/2024-thumbs/taiko07.webp
---

[Taiko repository](https://github.com/getgauge/taiko)
[Taiko API](https://docs.taiko.dev/)

**Tutaj znajduje się samouczek wideo**

{{<youtube STCwDoYdM6o>}}

### Wprowadzenie

We wprowadzeniu znajduje się skrócona wersja tego, co należy zrobić jako zarys całości.

#### Przygotowanie Środowiska

   - Zainstaluj:
     - Jenkins [10.10.0.124]
     - GitLab [10.10.0.119]
     - Docker [10.10.0.121]
   - Skonfiguruj środowisko, łącząc Jenkins z Dockerem i GitLabem.
   - Przeczytaj wszystkie artykuły o Jenkins na [sysadmin.info.pl](https://sysadmin.info.pl/en/series/jenkins/).

{{< notice success "Informacja o zmianach" >}}
Zwróć uwagę na różnicę związaną z użytkownikiem (zamiast użytkownika jenkins, użyjemy użytkownika root - poniżej znajdziesz wyjaśnienie dlaczego) podczas dodawania węzła z Dockera do Jenkins.
{{< /notice >}}

{{< notice error "Dlaczego root zamiast jenkins na węźle Docker?" >}}
Jest znany problem z uprawnieniami. Generalnie, użytkownik, którego konfigurujesz, gdy łączysz się z węzłem Docker w konfiguracji węzła Jenkins, powinien być ustawiony jako root, a nie jenkins. Problem dotyczy GID dla użytkownika wewnątrz kontenera Docker. Jeśli użytkownik na hoście (węzeł Docker) ma inny GID niż użytkownik wewnątrz kontenera Docker, nie można kopiować plików między kontenerem Docker a hostem z powodu dwóch różnych GID, co prowadzi do błędu odmowy uprawnień w logu zadania Jenkins. Więcej znajdziesz tutaj: [problem z uprawnieniami woluminu persistent](https://sysadmin.info.pl/en/blog/persistent-perfection-mastering-awx-project-storage-on-kubernetes/)
{{< /notice >}}

#### 1. Konfiguracja GitLab
**Generowanie certyfikatu SSL**
    - Wygeneruj samopodpisany certyfikat SSL i dodaj ścieżkę do plików key i crt w gitlab.rb.

#### 2. Konfiguracja Jenkins
**Dodanie Dockera jako węzła w Jenkins**
   - Po wygenerowaniu pary kluczy ed25519 na serwerze Jenkins dla użytkownika jenkins, wyślij klucz publiczny do węzła Docker dla użytkownika root.
   - Skonfiguruj połączenie SSH między Jenkins a węzłem Docker.

#### 3. Konfiguracja Docker
- Po wygenerowaniu certyfikatu SSL na serwerze GitLab, dodaj certyfikat dla węzła Docker.

#### 4. Automatyzacja Testów Taiko i Gauge
**Konfiguracja Kontenera Docker dla Taiko**
   - Utwórz Dockerfile, który zainstaluje wszystkie wymagane zależności.
   - Skonfiguruj środowisko Node.js i przeglądarkę Chromium.

**Tworzenie Jenkinsfile**
   - Zdefiniuj pipeline w Jenkinsfile.
   - Skonfiguruj ustawienia uwierzytelniania, takie jak klucze SSH i tokeny API.

---

#### **Poniżej szczegółowe kroki - uwaga -> TLDR :) Bez tego nie osiągniesz celu.**

#### Serwer GitLab

Jest to kluczowy krok, ponieważ plik konfiguracyjny zawiera alt_names, które są niezbędne do prawidłowej identyfikacji nazwy serwera GitLab.

**Uruchom poniższy skrypt Bash za pomocą polecenia**

```bash
./gitlab.sh
```

**Zawartość pliku gitlab.sh:**

```bash
#!/bin/bash

set -e

# Konfiguracja
GITLAB_IP="10.10.0.119"
DOMAIN_NAME="gitlab.sysadmin.homes"  # Użyj rzeczywistej nazwy domeny
BACKUP_DIR="/etc/gitlab/ssl/backup_$(date +%Y%m%d_%H%M%S)"
SSL_DIR="/etc/gitlab/ssl"
CRT_FILE="$SSL_DIR/$DOMAIN_NAME.crt"
KEY_FILE="$SSL_DIR/$DOMAIN_NAME.key"
CSR_FILE="$SSL_DIR/$DOMAIN_NAME.csr"
CONFIG_FILE="$SSL_DIR/openssl.cnf"
GITLAB_CONFIG="/etc/gitlab/gitlab.rb"

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Utwórz katalog kopii zapasowej
log "Tworzenie katalogu kopii zapasowej..."
mkdir -p "$BACKUP_DIR"

# Kopiowanie istniejącego certyfikatu i plików kluczy
log "Kopiowanie istniejącego certyfikatu i plików kluczy..."
if [ -f "$CRT_FILE" ] && [ "$(realpath "$CRT_FILE")" != "$(realpath "$BACKUP_DIR/$(basename "$CRT_FILE")")" ]; then
  mv "$CRT_FILE" "$BACKUP_DIR/"
fi
if [ -f "$KEY_FILE" ] && [ "$(realpath "$KEY_FILE")" != "$(realpath "$BACKUP_DIR/$(basename "$KEY_FILE")")" ]; then
  mv "$KEY_FILE" "$BACKUP_DIR/"
fi

# Tworzenie pliku openssl.cnf
log "Tworzenie pliku konfiguracyjnego OpenSSL..."
cat <<EOF > "$CONFIG_FILE"
[ req ]
default_bits = 2048
distinguished_name = req_distinguished_name
x509_extensions = v3_req
string_mask = utf8only
prompt = no

[ req_distinguished_name ]
countryName = PL
stateOrProvinceName = Lodz
localityName = Lodz
organizationName = gitlab
organizationalUnitName = gitlab
commonName = $DOMAIN_NAME
emailAddress = admin@sysadmin.info.pl

[ v3_req ]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[ alt_names ]
IP.1 = $GITLAB_IP
DNS.1 = $DOMAIN_NAME
EOF

# Generowanie klucza prywatnego i CSR
log "Generowanie klucza prywatnego i CSR..."
openssl req -new -nodes -out "$CSR_FILE" -config "$CONFIG_FILE" -keyout "$KEY_FILE"
if [ $? -ne 0 ]; then
  log "Błąd podczas generowania CSR i klucza prywatnego"
  exit 1
fi

# Generowanie certyfikatu
log "Generowanie certyfikatu..."
openssl x509 -req -days 365 -in "$CSR_FILE" -signkey "$KEY_FILE" -out "$CRT_FILE" -extensions v3_req -extfile "$CONFIG_FILE"
if [ $? -ne 0 ]; then
  log "Błąd podczas generowania certyfikatu"
  exit 1
fi

# Czyszczenie plików tymczasowych
log "Czyszczenie plików tymczasowych..."
rm "$CONFIG_FILE" "$CSR_FILE"

# Aktualizacja gitlab.rb, aby używał nowych plików certyfikatu
log "Aktualizacja gitlab.rb, aby używał nowych plików certyfikatu..."
sed -i "s|nginx\['ssl_certificate'\] = .*|nginx['ssl_certificate'] = \"$CRT_FILE\"|g" "$GITLAB_CONFIG"
sed -i "s|nginx\['ssl_certificate_key'\] = .*|nginx['ssl_certificate_key'] = \"$KEY_FILE\"|g" "$GITLAB_CONFIG"

# Usuń błąd Let's Encrypt
sudo sed -i "s/# letsencrypt\['enable'\] = nil/letsencrypt['enable'] = false/" /etc/gitlab/gitlab.rb

# Weryfikacja zmian w gitlab.rb
log "Weryfikacja aktualizacji w gitlab.rb..."
grep "nginx\['ssl_certificate'\]" "$GITLAB_CONFIG"
grep "nginx\['ssl_certificate_key'\]" "$GITLAB_CONFIG"

# Restart GitLab, aby zastosować nowy certyfikat
log "Restart GitLab, aby zastosować nowy certyfikat..."
gitlab-ctl reconfigure
gitlab-ctl restart

log "Aktualizacja certyfikatu SSL zakończona pomyślnie."
```

#### Serwer Jenkins

**Uruchom poniższy skrypt Bash za pomocą polecenia**

```bash


./jenkins.sh
```

**Zawartość pliku jenkins.sh:**

```bash
#!/bin/bash

# Konfiguracja
GITLAB_HOST="gitlab.sysadmin.homes"
CERT_FILE="$HOME/$GITLAB_HOST.crt"
HOME_JENKINS="/var/lib/jenkins"
DOCKER_SSH_KEY_FILE="$HOME_JENKINS/.ssh/jenkins_docker_ed25519"

# Pobieranie certyfikatu GitLab
openssl s_client -connect $GITLAB_HOST:443 -servername $GITLAB_HOST < /dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > $CERT_FILE

# Konfiguracja Jenkins, aby ufał certyfikatowi SSL GitLab
sudo /usr/lib64/jvm/java-17-openjdk-17/bin/keytool -delete -alias gitlab -cacerts -storepass changeit || true
sudo /usr/lib64/jvm/java-17-openjdk-17/bin/keytool -import -trustcacerts -alias gitlab -file $CERT_FILE -cacerts -storepass changeit -noprompt
sudo systemctl restart jenkins

# Generowanie klucza ED25519 do połączenia Jenkins z Dockerem
ssh-keygen -t ed25519 -f $DOCKER_SSH_KEY_FILE

# Upewnienie się, że Jenkins ma odpowiednie uprawnienia
sudo chown -R jenkins:jenkins $HOME_JENKINS/.ssh 

# Wyświetlanie kluczy publicznych do ręcznego dodania
echo "Dodaj poniższy klucz publiczny do węzła Docker (dla Jenkins):"
cat $DOCKER_SSH_KEY_FILE.pub
```

#### Serwer Docker (Node)

**Uruchom poniższy skrypt Bash za pomocą polecenia**

```bash
./docker.sh
```

**Zawartość pliku docker.sh:**

```bash
#!/bin/bash

# Konfiguracja
GITLAB_HOST="gitlab.sysadmin.homes"
CERT_FILE="$HOME/$GITLAB_HOST.crt"

# Pobieranie certyfikatu GitLab
openssl s_client -connect $GITLAB_HOST:443 -servername $GITLAB_HOST < /dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > $CERT_FILE

# Dodawanie certyfikatu do zaufanego magazynu węzła Docker
sudo /usr/lib/jvm/java-17-openjdk-amd64/bin/keytool -delete -alias gitlab -cacerts -storepass changeit || true
sudo /usr/lib/jvm/java-17-openjdk-amd64/bin/keytool -import -trustcacerts -alias gitlab -file $CERT_FILE -cacerts -storepass changeit -noprompt
sudo systemctl restart docker
```

## Część Manualna - Niektóre Kroki Należy Wykonać Ręcznie

### Konfiguracja Połączenia Jenkins

#### 1. Konfiguracja Połączenia Jenkins z Węzłem Docker (para kluczy ed25519)

Pierwszym krokiem jest skonfigurowanie Jenkins do połączenia z węzłem Docker za pomocą pary kluczy ed25519.

**Kroki:**

1. **Generowanie kluczy:**
    - Zobacz skrypt bash

2. **Dodawanie klucza publicznego do węzła Docker:**

```bash
ssh-copy-id -i ~/.ssh/jenkins_docker_ed25519.pub root@10.10.0.121
```

{{< notice success "Informacja" >}}
Możesz wykonać to polecenie tylko wtedy, gdy PermitRootLogin jest ustawiony na yes i Password authentication jest ustawione na yes w sshd_config na węźle docker. Po tym przywróć zmiany, które wprowadziłeś w /etc/ssh/sshd_config
{{< /notice >}}

3. **Konfiguracja Jenkins:**
* Zaloguj się do panelu webowego Jenkins: 
* Następnie kliknij Manage Jenkins → Nodes
* Kliknij przycisk + New Node po prawej stronie.
* Podaj nazwę węzła
* Wybierz permanent agent
* Ustaw opis taki sam jak nazwa węzła
* Ustaw liczbę wykonawców na 1 (można to później zwiększyć)
* Ustaw katalog główny zdalny na /root
* Ustaw etykietę docker
* Użycie: używaj tego węzła tak często, jak to możliwe
* Metoda uruchamiania: Uruchamiaj agentów przez SSH
* Host: podaj adres IP węzła Docker
* Credentials → dodaj → wybierz Jenkins
* Rodzaj - wybierz z listy rozwijanej SSH username with private key
* Podaj nazwę użytkownika: root
* Wybierz wprowadzenie bezpośrednie
* Wklej klucz prywatny skopiowany z jenkins_docker_ed25519 na serwerze Linux z Jenkins
* W polu Opis podaj przyjazną nazwę, na przykład ed25519 key dla węzła Docker lub cokolwiek, co łatwo zidentyfikuje poświadczenia.
* Podaj hasło do tego prywatnego klucza ed25519, które wygenerowałeś wcześniej na serwerze Linux z Jenkins.
* Kliknij dodaj
* Wybierz nowo utworzone poświadczenia z listy rozwijanej
* Strategia weryfikacji klucza hosta: wybierz: Known hosts file Verification Strategy
* Dostępność: Utrzymuj tego agenta online tak często, jak to możliwe
* Właściwości węzła: zaznacz/wybierz Zmienne środowiskowe i Lokalizacje narzędzi
* W sekcji Zmienne środowiskowe dodaj: 
* Nazwa: JAVA_HOME
* Wartość: /usr/bin/java
* W sekcji Lokalizacje narzędzi dodaj:
* Nazwa: Git (default)
* Wartość: /usr/bin/git
* Kliknij zapisz

#### 2. Konfiguracja Połączenia Jenkins z GitLab (Token API)
Drugim krokiem jest skonfigurowanie połączenia Jenkins z GitLab za pomocą tokenu API.

**Kroki:**

Konto techniczne `jenkins-ci` powinno być utworzone jako **Zwykły użytkownik** w GitLab, a nie jako Administrator. Podejście to przestrzega zasady minimalnych uprawnień, co pomaga zminimalizować ryzyko bezpieczeństwa poprzez przyznawanie tylko niezbędnych uprawnień wymaganych przez Jenkins do wykonywania zadań.

#### Kroki do Utworzenia Konta Technicznego (`jenkins-ci`) jako Zwykłego Użytkownika w GitLab:

1. **Zaloguj się do GitLab jako Administrator**:
   - Użyj swoich poświadczeń administratora, aby zalogować się do GitLab.

2. **Przejdź do Obszaru Admina**:
   - Kliknij na swój obrazek profilowy lub inicjały w prawym górnym rogu.
   - Wybierz `Admin Area`.

3. **Utwórz Nowego Użytkownika**:
   - W lewym pasku bocznym kliknij na `Users`.
   - Kliknij przycisk `New User`.

4. **Wypełnij Dane Użytkownika**:
   - Nazwa użytkownika: `jenkins-ci`
   - Imię: `Jenkins CI`
   - Email: Użyj dedykowanego adresu email dla tego użytkownika.
   - Wybierz silne hasło.
   - Upewnij się, że `Regular user` jest wybrane, a nie `Administrator`.

5. **Ustaw Odpowiednie Uprawnienia**:
   - Po utworzeniu użytkownika przejdź do projektu lub grupy, do której Jenkins będzie potrzebował dostępu.
   - Dodaj `jenkins-ci` jako członka do konkretnego projektu lub grupy.
   - Przypisz rolę `Developer` lub `Maintainer`, w zależności od wymaganych uprawnień.

#### Przypisywanie Roli Developer lub Maintainer:

- **Developer**: Ta rola pozwala użytkownikowi na zapisywanie w repozytoriach, tworzenie gałęzi i wykonywanie innych zadań związanych z rozwojem.
- **Maintainer**: Ta rola obejmuje wszystkie uprawnienia roli Developer oraz dodaje możliwość zarządzania ustawieniami projektu i wykonywania zadań administracyjnych w ramach projektu.

Dla większości operacji Jenkins, rola `Developer` jest wystarczająca. Jeśli Jenkins potrzebuje wykonywać dodatkowe zadania, takie jak zarządzanie ustawieniami projektu, użyj roli `Maintainer`.

#### Generowanie Tokenu API GitLab dla konta technicznego:

1. **Zaloguj się jako `jenkins-ci`**:
   - Wyloguj się z konta administratora i zaloguj się przy użyciu poświadczeń `jenkins-ci`.

2. **Generowanie Tokenu API**:
   - Przejdź do `User

 Settings` > `Access Tokens`.
   - Utwórz nowy token z wymaganymi zakresami (`api`, `read_repository`).
   - Skopiuj wygenerowany token.

#### Dodawanie Tokenu API GitLab w Jenkins:

1. **Przejdź do Interfejsu Webowego Jenkins**:
   - Przejdź do `Manage Jenkins` > `Configure System`.

2. **Dodaj Token API**:
   - W sekcji `GitLab`, kliknij `Add` > `Jenkins`.
   - Wybierz `GitLab API token`.
   - Wklej token i podaj opis (np. `GitLab API Token`).

#### Dodawanie Tokenu na Poziomie Projektu w Jenkins:

1. **Generowanie Tokenu API na Poziomie Projektu w GitLab**:
   - Przejdź do konkretnego projektu GitLab.
   - Przejdź do `Settings` > `Access Tokens`.
   - Utwórz nowy token z wymaganymi zakresami (`read_repository`).
   - Skopiuj wygenerowany token.

2. **Dodawanie Tokenu na Poziomie Projektu w Jenkins**:
   - Przejdź do `Manage Jenkins` > `Manage Credentials`.
   - Wybierz odpowiednią domenę (np. `global`).
   - Kliknij `Add Credentials`.
   - Wybierz `Username with password` jako rodzaj.
   - Ustaw nazwę użytkownika na technicznego użytkownika, który jest członkiem w projekcie GitLab (np. `project_bot`).
   - Wklej wygenerowany token jako hasło.
   - Podaj opis (np. `Taiko Project Token`).
   - Zapisz zmiany.

#### Użycie w Jenkinsfile:

```groovy
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git(
                    url: 'https://gitlab.sysadmin.homes/developers/your-repo.git',
                    branch: 'main',
                    credentialsId: 'Taiko-token'
                )
            }
        }
        // Inne etapy
    }
}
```

Tworząc `jenkins-ci` jako zwykłego użytkownika i przypisując odpowiednie role, zapewniasz, że Jenkins ma niezbędne uprawnienia do interakcji z GitLab w sposób bezpieczny i efektywny, bez nadmiernego przyznawania uprawnień.

{{< notice success "Ważna informacja" >}}
Powód użycia dwóch różnych metod obsługi tokenów API w Jenkins wynika z różnych kontekstów i zakresów, w jakich są one używane:

1. **Token API GitLab do Połączenia Jenkins**:
   - Ten token jest tworzony na poziomie użytkownika (np. technicznego użytkownika `jenkins-ci`).
   - Pozwala Jenkins na interakcję z API GitLab w szerszym zakresie, takim jak zarządzanie projektami, użytkownikami i grupami, pobieranie informacji o repozytorium, uruchamianie pipeline'ów itp.
   - Jest dodawany w Jenkins jako **GitLab API token** w `Manage Jenkins > Configure System > GitLab`.

2. **Token na Poziomie Projektu do Dostępu do Repozytorium**:
   - Ten token jest specyficzny dla projektu i jest często używany do klonowania repozytoriów podczas budowy.
   - Ponieważ Jenkins musi się uwierzytelnić w GitLab, aby klonować repozytoria, używa tego tokenu jako hasła, a związanego technicznego użytkownika (np. `project_bot`) jako nazwy użytkownika.
   - Ten token jest dodawany jako **Username with password** w Jenkins w `Manage Jenkins > Manage Credentials`.

Używając tych dwóch różnych metod, zapewniasz, że Jenkins może interagować z GitLab w sposób bezpieczny i efektywny, wykorzystując odpowiedni zakres i uprawnienia do każdej interakcji.
{{< /notice >}}

#### 3. Konfiguracja Połączenia Węzła Docker z GitLab (dodanie certyfikatu SSL GitLab)

**Kroki:**
1. **Dodawanie certyfikatu:**
- Zobacz skrypt bash do automatyzacji. 

#### 4. Automatyzacja Testów Taiko i Gauge

##### Tworzenie Zadania Jenkins z Użyciem Jenkins Pipeline i Dockerfile - Krok po Kroku

1. Utwórz nowy pipeline w Jenkins.
2. Wybierz GitLab dla Docker jako połączenie z GitLab.
3. Przewiń w dół do sekcji pipeline.
4. Wybierz z listy rozwijanej "pipeline script from SCM".
5. Wybierz z listy rozwijanej SCM "Git".
6. Wprowadź URL repozytorium GitLab.
7. Wybierz token API dla projektu z listy rozwijanej.
8. Wybierz gałąź, np. "main".
9. Pozostaw nazwę Jenkinsfile bez zmian.
10. W Jenkinsfile zdefiniuj kroki i określ ścieżkę do Dockerfile znajdującego się w repozytorium GitLab, gdzie przechowywane są testy Taiko i raporty Gauge.

Przykładowy Jenkinsfile:

```groovy
pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }
    parameters {
        choice(name: 'choose_server', choices: ['ArgoCD', 'AWX', 'AdGuardHome', 'Confluence', 'GitLab', 'Grafana', 'HomeAssistant', 'Jenkins', 'NginxProxyManager', 'Proxmox', 'Synology', 'Wazuh', 'PortainerProxy', 'PortainerAdGuardHome'], description: 'Wybierz serwer')
        choice(name: 'username', choices: ['admin'], description: 'Wybierz nazwę użytkownika')
        choice(name: 'SPEC_FILE', choices: ['test-awx.spec'], description: 'Wybierz plik specyfikacji do testowania modułu')
    }
    environment {
        REPO_URL = 'git@gitlab.sysadmin.homes:developers/awx-taiko.git'
        BRANCH = 'main'
        REPORT_PATH = '/workspace'
        REPORT_NAME = 'TAIKO_AUTOMATED_TESTS'
        username = 'awx-user-id'
        password = 'awx-password-id'
    }
    agent {
        dockerfile {
            filename './Dockerfile-Taiko'
            label 'docker'
        }
    }
    stages {
        stage('Resolve IP') {
            steps {
                script {
                    def serverAddressMapping = [
                        'ArgoCD': 'argocd.sysadmin.homes',
                        'AWX': 'awx.sysadmin.homes',
                        'AdGuardHome': '10.10.0.108',
                        'Confluence': 'confluence.sysadmin.homes',
                        'GitLab': 'gitlab.sysadmin.homes',
                        'Grafana': 'grafana.sysadmin.homes',
                        'HomeAssistant': 'ha.sysadmin.info.pl',
                        'Jenkins': 'jenkins.sysadmin.homes',
                        'NginxProxyManager': 'sysadmin.homes',
                        'Proxmox': 'proxmox.sysadmin.homes',
                        'Synology': 'synology.sysadmin.homes',
                        'Wazuh': 'wazuh.sysadmin.homes',
                        'PortainerProxy': 'npm-portainer.sysadmin.homes',
                        'PortainerAdGuardHome': 'adguard-portainer.sysadmin.homes'
                    ]
                    env.server_address = serverAddressMapping[params.choose_server]
                }
            }
        }
        stage('Init container') {
            steps {
                script {
                    sh 'mkdir -p ~/.ssh && ssh-keyscan gitlab.sysadmin.homes >> ~/.ssh/known_hosts'
                }
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'main']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [
                        [$class: 'CheckoutOption', timeout: 360],
                        [$class: 'CloneOption', timeout: 360],
                    ],
                    submoduleCfg: [],
                    userRemoteConfigs: [[credentialsId: 'Taiko-token', url: "https://gitlab.sysadmin.homes/developers/awx-taiko.git"]]
                ])
            }
        }
        stage('Taiko and Gauge reports') {
            steps {
                withCredentials([string(credentialsId: username, variable: 'username'), string(credentialsId: password, variable: 'password')]) {
                    script {
                        sh '''
                            export server_address=$server_address
                            export username=$username
                            export password=$password
                        '''
                        sh '''
                            ln -s /usr/local/lib/node_modules/ $WORKSPACE/node_modules
                            ln -s /usr/local/lib/node_modules/ /lib/node_modules
                            rm -f *.tar downloaded/*
                            rm -rf reports .gauge logs
                        '''
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh """
                                gauge run ${WORKSPACE}/specs/${params.SPEC_FILE}
                            """
                        }
                    }
                }
            }
        }
        stage('Archive artifacts') {
            steps {
                script {
                    if (sh(script: "[ -d \"${WORKSPACE}/reports/\" ]", returnStatus: true) ==

 0) {
                        def formattedDate = new Date().format("dd_MM_yyyy_HH_mm")
                        def filename = "PASS_${REPORT_NAME}_${formattedDate}.tar"
                        sh """
                            tar -cf ${filename} ${WORKSPACE}/reports/ ${WORKSPACE}/logs/
                        """
                        archiveArtifacts artifacts: "${filename}"
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
```

**Dodawanie `awx-user-id` i `awx-password-id` jako Secret Text w Jenkins**

Aby bezpiecznie przechowywać i zarządzać poufnymi informacjami, dodaj `awx-user-id` i `awx-password-id` jako poświadczenia tekstowe w Jenkins. Wykonaj następujące kroki:

1. **Przejdź do Poświadczeń Jenkins:**
   - Przejdź do interfejsu webowego Jenkins.
   - Kliknij `Manage Jenkins` > `Manage Credentials`.

2. **Dodaj Poświadczenia Tekstowe:**
   - Wybierz odpowiednią domenę (np. `global`).
   - Kliknij `Add Credentials`.
   - Dla `Kind`, wybierz `Secret text`.
   - W polu `Secret` wprowadź wartość `awx-user-id`.
   - Podaj znaczący identyfikator (np. `awx-user-id`).
   - Kliknij `OK`.

3. **Powtórz dla `awx-password-id`:**
   - Powtórz kroki, aby dodać kolejne poświadczenie tekstowe.
   - Wprowadź wartość `awx-password-id` i identyfikator.

4. **Użycie Poświadczeń Tekstowych w Pipeline Jenkins:**
   - Podczas konfigurowania Jenkinsfile, użyj powiązania poświadczeń, aby uzyskać dostęp do tych sekretów:

```groovy
withCredentials([string(credentialsId: 'awx-user-id', variable: 'username'), string(credentialsId: 'awx-password-id', variable: 'password')]) {
    // Twój kod pipeline
}
```

Przykładowy Dockerfile-Taiko, który również jest dodany w projekcie GitLab:

```docker
FROM node:18-alpine3.17

# Aktualizacja apk
RUN apk update > /dev/null

# Instalowanie dodatkowych narzędzi.
RUN apk add --no-cache curl unzip git openssh bash nano wget ca-certificates openssl > /dev/null

# Czyszczenie pamięci podręcznej apk
RUN rm -rf /var/cache/apk/*

# Dodawanie klucza SSH GitLab do known_hosts
RUN mkdir -p /root/.ssh && ssh-keyscan gitlab.sysadmin.homes >> /root/.ssh/known_hosts

# Instalacja Gauge
RUN curl -Ssl https://downloads.gauge.org/stable | sh

# Instalacja wtyczek Gauge.
RUN gauge install js && \
    gauge install screenshot && \
    gauge install html-report

# Ustawienia rejestru npm
RUN npm config set strict-ssl false
RUN npm config set registry "http://registry.npmjs.org"

# Instalacja wymaganych pakietów npm
RUN npm install --no-fund --save -g npm@9.5.1 log4js@6.9.1 xml2js@0.6.2 isomorphic-fetch@3.0.0 node-ssh@13.1.0 taiko

# Wyłączanie proxy
ENV http_proxy=
ENV https_proxy=

# Ustawienia zmiennych środowiskowych 
ENV NPM_CONFIG_PREFIX=/usr/local/lib/node_modules
ENV PATH="${NPM_CONFIG_PREFIX}/bin:${PATH}"
ENV TAIKO_BROWSER_ARGS=--no-sandbox,--start-maximized,--disable-dev-shm-usage,--headless,--disable-gpu
ENV TAIKO_BROWSER_PATH=/usr/bin/chromium-browser

# Instalacja przeglądarki Chromium
RUN apk add chromium
```

Ta linia:

```
RUN npm config set registry "https://nexus.sysadmin.homes/repository/npmjs.org"
```

odpowiada za pakiety npm. Pobiera pakiety do Nexus, który działa jako cache proxy dla nodejs i npm.

#### Ustanowienie Połączenia SSH z Węzłem Docker

Przed uruchomieniem zadania pipeline w Jenkins, ustanów połączenie SSH z użytkownika root na węźle Docker do GitLab:

```bash
ssh -T git@10.10.0.119
```

#### Testowanie i Uruchamianie
5. **Tworzenie i Uruchamianie Testów**
   - Twórz skrypty testowe Taiko i Gauge.
   - Uruchamiaj testy z Jenkins, monitorując wyniki i generując raporty.

6. **Rozwiązywanie Problemów**
   - Ustawienia SSH i UID/GID dla użytkowników w Docker.
   - Rozwiązywanie problemów z uruchamianiem przeglądarki w trybie bezgłowym.

#### Podsumowanie

Dzięki powyższym instrukcjom krok po kroku, powinieneś być w stanie zautomatyzować swoje testy i stworzyć zwięzły i jasny tekstowy samouczek. Jeśli masz dalsze pytania lub potrzebujesz dodatkowej pomocy, daj mi znać!

---

### Wyjaśnienie

1. **Token API w Jenkins:**
   - Jenkins nie używa kluczy RSA ani ED25519 do komunikacji z GitLab; używa tokenów API. Ten token powinien być utworzony na poziomie technicznego użytkownika w GitLab, a nie na poziomie projektu. Oznacza to, że musisz utworzyć technicznego użytkownika w GitLab, wygenerować token API dla tego użytkownika i użyć go w konfiguracji Jenkins.

2. **Token Projektowy w Jenkinsfile:**
   - W `Jenkinsfile`, `credentialsId: 'Taiko-token'` jest zadeklarowane, co odnosi się do tokenu projektowego. Ten token nie jest dodawany w Jenkins za pomocą tokenu API GitLab, ale raczej jako zwykła nazwa użytkownika i hasło w poświadczeniach Jenkins. Oznacza to, że musisz dodać token jako hasło, a jako ID w Jenkins użyć nazwy użytkownika skopiowanej z sekcji członków projektu GitLab.

To rozwiązanie działa, ponieważ Jenkins wymaga uwierzytelnienia, aby uzyskać dostęp do repozytorium GitLab, a zamiast pełnego logowania przez API, używa poświadczeń użytkownika z tokenem jako hasłem.

#### Przykład Testu Taiko:

**awx-steps.js**

```javascript
/* globals gauge*/
"use strict";
const path = require('path');
const {
    openBrowser,
    write,
    closeBrowser,
    goto,
    button,
    press,
    screenshot,
    above,
    click,
    checkBox,
    listItem,
    toLeftOf,
    link,
    text,
    into,
    textBox,
    evaluate
} = require('taiko');
const assert = require("assert");
const headless = process.env.headless_chrome.toLowerCase() === 'true';

beforeSuite(async () => {
    await openBrowser({
        headless: headless
    })
});

afterSuite(async () => {
    await closeBrowser();
});

// Zwraca nazwę pliku z zrzutem ekranu
gauge.customScreenshotWriter = async function () {
    const screenshotFilePath = path.join(process.env['gauge_screenshots_dir'],
        `screenshot-${process.hrtime.bigint()}.png`);

    await screenshot({
        path: screenshotFilePath
    });
    return path.basename(screenshotFilePath);
};
step("Navigate to the AWX login page", async function () {
    await goto("awx.sysadmin.homes");
});

step("Assert the login page is loaded", async () => {
    assert(await text("Welcome to AWX!").exists());
});

step('Use credentials <username>:<password>', async (username, password) => {
    await write(process.env.username, into(textBox("Username"), {force:true}));
    await write(process.env.password, into(textBox("Password"), {force:true}));
});

step("Click the login button", async () => {
    await click(button("Log In"));
});

step("Verify successful login", async () => {
    assert(await text("Dashboard").exists());
});
step("Clear all tasks", async function () {
    await evaluate(() => localStorage.clear());
});
```

**test-awx.spec**

```markdown
# AWX login test

aby wykonać tę specyfikację, użyj
    npm test

To jest krok kontekstowy, który uruchamia się przed każdym scenariuszem
* Navigate to the AWX login page

## Logowanie do AWX
* Assert the login page is loaded
* Use credentials "admin":"password"
* Click the login button
* Verify successful login
___
* Clear all tasks
```