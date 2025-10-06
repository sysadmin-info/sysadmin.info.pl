---
title: Usuwanie podów w Kubernetes na Raspberry Pi CM4
date: 2023-09-01T15:00:00+00:00
description: Usuwanie podów w Kubernetes na Raspberry Pi CM4
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
- Raspberry Pi
cover:
    image: images/2023-thumbs/deleting-pods.webp
---
1. **Oto samouczek wideo; czytaj dalej dla listy pisemnych instrukcji.**
{{<youtube 6VJxxxkPeJ4>}}
#### Ćwiczenia do wykonania:
1. Usuń wszystkie pody z domyślnej przestrzeni nazw.
2. Utwórz przestrzeń nazw
3. Pobierz przestrzenie nazw
4. Utwórz pod w danej przestrzeni nazw
5. Wyświetl wszystkie pody
6. Usuń wszystkie pody z danej przestrzeni nazw

##### Usuń wszystkie pody z domyślnej przestrzeni nazw.
```bash
# wyświetla wszystkie pody we wszystkich przestrzeniach nazw
kubectl get pods -A
# Poniższe polecenie usuwa pody w domyślnej przestrzeni nazw.
kubectl delete pods --all
```
Usuń pody ręcznie lub utwórz przestrzeń nazw i usuń pody z określonej przestrzeni nazw.
##### Utwórz przestrzeń nazw
```bash
kubectl create namespace my-pods
```
##### Pobierz przestrzenie nazw
```bash
kubectl get namespace
```
##### Utwórz pod w danej przestrzeni nazw
```bash
kubectl run ubuntu --image=ubuntu -n my-pods
```
##### Wyświetl wszystkie pody
```bash
kubectl get pods -A
```
##### Usuń wszystkie pody z danej przestrzeni nazw
```bash
kubectl delete pods --all -n my-pods
```