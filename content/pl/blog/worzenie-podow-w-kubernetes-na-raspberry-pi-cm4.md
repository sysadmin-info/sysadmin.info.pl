---
title: Tworzenie podów w Kubernetes na Raspberry Pi CM4
date: 2023-09-01T11:00:00+00:00
description: Tworzenie podów w Kubernetes na Raspberry Pi CM4
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
image: images/2023-thumbs/creating-pods.webp
---
1. **Oto samouczek wideo; czytaj dalej dla listy pisemnych instrukcji.**
{{<youtube c1MwmZEHdfI>}}
#### Ćwiczenia do wykonania:
1. Utwórz pod.
2. Utwórz pod z inną wersją obrazu.
3. Wyświetl pody.
4. Użyj polecenia watch, aby na bieżąco obserwować zmiany.
##### Utwórz pod. Pamiętaj, że nazwa poda musi być unikalna.
```bash
kubectl run apache1 --image=httpd
```
httpd to w rzeczywistości serwer apache
##### Utwórz pod z inną wersją obrazu.
```bash
kubectl run apache1-older --image=httpd:2.2
```
##### Wyświetl pody.
```bash
kubecetl get pods
```
##### Użyj polecenia watch, aby na bieżąco obserwować zmiany.
```bash
watch kubecetl get pods
```
ctrl+c wychodzi z okna watch