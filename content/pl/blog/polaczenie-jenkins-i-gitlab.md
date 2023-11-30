---
title: "Połączenie Jenkins i GitLab"
date:  2023-06-11T18:00:00+00:00
description: "Połączenie Jenkins i GitLab"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- Docker
- Jenkins
- GitLab
series:
- Jenkins
categories:
- Docker
- Jenkins
- GitLab
image: images/2023-thumbs/jenkins-gitlab-connection.webp
---
W tym filmie wyjaśniam, jak połączyć Jenkins i GitLab.

{{<youtube q4NlshhQtVw>}}

### Poradnik

1. Wejdź na stronę GitLab i skopiuj URL. W moim przypadku to 10.10.0.119

2. Zaloguj się przez SSH na serwer Jenkins i skopiuj certyfikat z GitLab

```bash
</dev/null openssl s_client -connect 10.10.0.119:443 -servername 10.10.0.119 | openssl x509 > $HOME/10.10.0.119.crt
```

4. ```bash
sudo find / -iname "cacerts"
```
5. 
```bash
java -version
```
6. 
```bash
sudo find / -iname "keytool"
```
7. Importuj certyfikat GitLab do Java cacerts 

```bash
# Import certyfikatu GitLab
sudo /usr/lib64/jvm/java-11-openjdk-11/bin/keytool -import -file /home/adrian/10.10.0.119.crt -alias gitlab -keystore /usr/lib64/jvm/java-11-openjdk-11/lib/security/cacerts

# Usuń certyfikat GitLab
sudo /usr/lib64/jvm/java-11-openjdk-11/bin/keytool -delete -alias gitlab -keystore /usr/lib64/jvm/java-11-openjdk-11/lib/security/cacerts

# Wyświetl wszystkie certyfikaty
sudo /usr/lib64/jvm/java-11-openjdk-11/bin/keytool -list -keystore /usr/lib64/jvm/java-11-openjdk-11/lib/security/cacerts

```
8. wpisz hasło 
```bash
changeit
```

9. Czy ufać temu certyfikatowi? Wpisz: 

```
yes
```

I naciśnij Enter

10. Zrestartuj Jenkins

```bash
sudo systemctl restart jenkins.service
```

11. Zainstaluj wtyczkę GitLab w Jenkinsie i zrestartuj Jenkins

12. Zaloguj się do GitLab, utwórz projekt i wygeneruj token dla projektu.

13. Wejdź w Zarządzanie Jenkinsem -> System i przewiń w dół, aby znaleźć sekcję GitLab.

14. Podaj nazwę połączenia np. GitLab, URL GitLab oraz dane uwierzytelniające (użyj wygenerowanego w GitLabie tokena API dla projektu, aby dodać dane uwierzytelniające - zobacz film)

15. Przetestuj połączenie.