---
title: Jak kontrolować uruchamianie testów w GitLab dla swoich projektów
date: 2024-06-07T13:00:00+00:00
description: Jak kontrolować uruchamianie testów w GitLab dla swoich projektów
draft: true
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
- GitLab
cover:
    image: images/2024-thumbs/gitlab03.webp
---

**Oto film instruktażowy**

{{<youtube -De_Tg9R6rA>}}

#### Wstęp

Istnieje wiele sposobów na powstrzymanie GitLab przed automatycznym uruchamianiem testów po każdym zatwierdzeniu w projekcie. Jedną z najprostszych metod jest użycie zmiennych warunkowych w pliku `.gitlab-ci.yml` do zdefiniowania, kiedy testy powinny być uruchamiane. Oto kilka ilustracji, jak to zrobić:

##### 1. Użycie `only` i `except`

Możesz skonfigurować zadania w pliku `.gitlab-ci.yml`, aby były uruchamiane tylko w określonych gałęziach, tagach lub przy określonych commit message.

Przykład:

```yaml
test:
  script:
    - echo "Running tests"
  only:
    - master
    - /^release-.*$/
  except:
    - /^hotfix-.*$/
```

W tym przykładzie testy będą uruchamiane tylko w gałęzi `master` i we wszystkich gałęziach zaczynających się od `release-`, ale nie w gałęziach zaczynających się od `hotfix-`.

##### 2. Użycie `rules`

Zasady (rules) pozwalają na bardziej złożoną logikę warunkową w pliku `.gitlab-ci.yml`.

Przykład:

```yaml
test:
  script:
    - echo "Running tests"
  rules:
    - if: '$CI_COMMIT_BRANCH == "master"'
    - if: '$CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/'
```

W tym przykładzie testy będą uruchamiane tylko w gałęzi `master` lub gdy commit jest oznaczony tagiem, który pasuje do wzorca wersji (`vX.X.X`).

##### 3. Użycie zmiennej środowiskowej

Możesz także użyć zmiennej środowiskowej, aby decydować, czy uruchomić testy.

Przykład:

```yaml
test:
  script:
    - echo "Running tests"
  rules:
    - if: '$RUN_TESTS == "true"'
```

W tym przypadku musisz ustawić zmienną środowiskową `RUN_TESTS` na `true`, aby testy zostały uruchomione. Możesz to zrobić w ustawieniach projektu w GitLabie lub w samym commitcie, dodając do niego odpowiednią zmienną.

##### 4. Wyłączanie testów globalnie

Jeżeli chcesz wyłączyć wszystkie testy globalnie dla wszystkich commitów, możesz po prostu zakomentować lub usunąć odpowiednie zadania z pliku `.gitlab-ci.yml`.

Przykład:

```yaml
# test:
#   script:
#     - echo "Running tests"
```

W ten sposób żadne testy nie zostaną uruchomione, dopóki nie odkomentujesz tej sekcji.

##### 5. Użycie `[ci skip]`

Możesz także dodawać `[ci skip]` lub `[skip ci]` do wiadomości commita, aby pominąć uruchamianie CI/CD dla tego konkretnego commita.

Przykład wiadomości commita:

```
Commit message [ci skip]
```

##### 6. Wyłączanie specyficznych Runnerów

Jeśli chcesz wyłączyć specyficzne Runniery, możesz użyć tagów, aby decydować, które Runniery powinny być używane do uruchamiania określonych zadań.

Przykład w pliku `.gitlab-ci.yml`:

```yaml
test:
  script:
    - echo "Running tests"
  tags:
    - my-special-runner
```

Następnie w ustawieniach Runnera w GitLabie upewnij się, że dany Runner ma przypisane odpowiednie tagi.

Wybierz rozwiązanie, które najlepiej pasuje do Twojego scenariusza i potrzeb.