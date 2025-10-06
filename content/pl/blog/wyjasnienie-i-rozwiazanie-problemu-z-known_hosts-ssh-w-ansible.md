---
title: Wyjaśnienie i rozwiązanie problemu z known_hosts SSH w Ansible
date: 2023-11-19T12:00:00+00:00
description: Wyjaśnienie i rozwiązanie problemu z known_hosts SSH w Ansible
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Ansible
categories:
- Ansible
cover:
    image: images/2023-thumbs/ansible05.webp
---

Artykuł o known_hosts: [Co to jest plik known_hosts w systemie Linux](/en/blog/known-hosts-file)

1. **Oto samouczek wideo**

{{<youtube Jw3x2-bynpo>}}

Skrypty i pliki konfiguracyjne są dostępne [tutaj:](https://github.com/sysadmin-info/ansible)

##### Zalecane rozwiązanie, ale tylko w środowisku niezagrożonym.

1. Wyczyść known_hosts w katalogu /home/user/.ssh
2. Uruchom playbook ansible za pomocą poniższego polecenia:
```bash
ansible-playbook ssh-session.yaml
```
3. Przerwij to za pomocą ctrl+c
4. Uruchom poniższe polecenie:
```bash
./ssh-session.ssh
```
5. Sprawdź wynik w known_hosts
```bash
cat ~/.ssh/known_hosts
```
6. Zobaczysz wszystkie wpisy dodane przez ssh.
7. Uruchom playbook ansible jeszcze raz za pomocą poniższego polecenia:
```bash
ansible-playbook ssh-session.yaml
```
8. Wpisz kilka razy tak, a następnie przerwij to za pomocą ctrl+c
9. Sprawdź wynik na ekranie.
10. Wyczyść known_hosts w katalogu /home/user/.ssh, a następnie uruchom playbook ansible za pomocą poniższego polecenia:
```bash
ansible-playbook ssh-session.yaml --ssh-common-args='-o StrictHostKeyChecking=no'
```

Problem został rozwiązany.

##### Rozwiązanie działające, którego nie polecam

1. Wyczyść known_hosts w katalogu /home/user/.ssh
2. Wyświetl zmienne globalne za pomocą poniższego polecenia:
```bash
export
```
3. Wykonaj poniższe polecenie:
```bash
export ANSIBLE_HOST_KEY_CHECKING=False
```
4. Połącz się za pomocą ssh z zdalnym hostem
```bash
ssh username@hostname
```
5. Uruchom playbook ansible za pomocą poniższego polecenia:
```bash
ansible-playbook ssh-session.yaml
```
6. Sprawdź wynik w known_hosts
```bash
cat ~/.ssh/known_hosts
```
7. Zobacz, czy masz wpisy dodane do known_hosts

##### Rozwiązanie, które znalazłem w Internecie, którego naprawdę nie polecam

1. Uruchom playbook ansible za pomocą poniższego polecenia:
```bash
ansible-playbook ssh-keyscan.yaml
```
2. Sprawdź wynik w known_hosts
```bash
cat ~/.ssh/known_hosts
```
3. Pozbądź się niepotrzebnych wpisów w known_hosts
4. Uruchom playbook ansible za pomocą poniższego polecenia:
```bash
ansible-playbook ssh-session.yaml
```
5. Obejrzyj wspomniany film wideo, aby zrozumieć, co się stało i dlaczego.