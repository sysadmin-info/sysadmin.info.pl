---
title: "Praca z kontenerami Docker w Jenkins"
date:  2023-07-11T20:00:00+00:00
description: "Praca z kontenerami Docker w Jenkins. Rozwiązywanie problemu z brakującą przestrzenią"
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
series:
- Jenkins
categories:
- Docker
- Jenkins
image: images/2023-thumbs/working-with-docker-containers-in-jenkins.webp
---
##### Do wykonania zadania:
1. Uruchom potok w zadaniu w Jenkins
2. Obserwuj status Docker
3. Zmień nazwę obrazu, aby zobaczyć, że musi być poprawna zgodnie z wzorcem wyjaśnionym w filmie
4. Rozwiąż problem z brakiem miejsca na woluminie logicznym

{{<youtube vbqnHwQQ8m4>}}

#### 1. Uruchom poniższy potok w zadaniu w Jenkins

```
pipeline {
    agent {
        docker { 
          image 'alpine:latest'
          label 'docker'
        }
    }
    stages {
        stage('Test') {
            steps {
                sh '''
                cat /etc/os-release
                pwd
                cat /etc/passwd
                sleep 60
                '''
            }
        }
    }
}
```

#### 2. Obserwuj status Docker

```bash
watch docker ps
```

#### 3. Zmień nazwę obrazu, aby zobaczyć, że musi być poprawna zgodnie z wzorcem wyjaśnionym w filmie.

#### 4. Rozwiąż problem z brakującą przestrzenią na woluminie logicznym. Użyj poniższych poleceń do wykonania kontroli i rozwiązania problemu.

##### Sprawdź, który wolumin jest prawie pełny lub pełny

```bash
df -kTh
```

##### Wypisz 10 największych plików w katalogu var, który jest woluminem z niewystarczającą ilością miejsca
```bash
du -a /var | sort -n -r | head -n 10
# lub z -h (format czytelny dla człowieka)
du -h /var | sort -n -r | head -n 10
```

##### Uruchom polecenie docker prune.

Polecenie Docker prune automatycznie usuwa zasoby niepowiązane z kontenerem. Jest to szybki sposób na pozbycie się starych obrazów, kontenerów, woluminów i sieci.

```bash
docker system prune -a -f
```

##### Sprawdź wynik po czyszczeniu

```bash
du -hx --max-depth=1 /var
```

#### 5. Zmiana rozmiaru woluminu logicznego

```bash
# wykonaj sprawdzenie
pvs
vgs
lvs
# rozszerz wolumin
lvextend -l +100%FREE /dev/docker-vg/var
# wykonaj sprawdzenie
pvs
vgs
lvs
df -kTh /var
# zmień rozmiar partycji
resize2fs /dev/mapper/docker--vg-var
# wykonaj sprawdzenie
df -kTh /var
```

#### 6. Wróć do Jenkins i ponownie uruchom zadanie

#### 7. Zobacz sekcję poradnika, aby zrozumieć różnicę między obrazami Docker.

Rozumienie różnicy między obrazami Docker. Obraz Node zawiera Node.js i npm, co umożliwia działanie polecenia node.