---
title: "Jak odinstalować k3s i zainstalować go bezpiecznie bez traefik"
date:  2023-08-20T15:00:00+00:00
description: "Jak odinstalować k3s i zainstalować go bezpiecznie bez traefik w Raspberry Pi CM4"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- CM4
- Moduł obliczeniowy CM4
- Płyta CM4
- Kubernetes
- k3s 
series:
- Kubernetes 
categories:
- Raspberry Pi
image: images/2023-thumbs/k3s-traefik.webp
---
W tym artykule opowiem o krokach instalacji i konfiguracji k3s.

1. **Oto samouczek wideo; czytaj dalej dla listy pisemnych instrukcji.**

{{<youtube ChHXfOO1R5Q>}}

#### Ćwiczenia do wykonania:
1. Zainstaluj k3s
2. Usuń traefik
3. Zainstaluj k3s bez traefik

#### Wprowadzenie

Zdecydowałem się zainstalować k3s na płycie Raspberry Pi CM4 IO z modułem obliczeniowym 4, aby pokazać, że możliwe jest uruchomienie klastra jednowęzłowego.

#### Instalacja k3s

```bash
sudo curl -sfL https://get.k3s.io | sh
```

#### Sprawdzenie statusu k3s

```bash
sudo systemctl status k3s
```

#### Usuwanie k3s

##### Przełącz się na roota

```bash
sudo -i
cd /usr/local/bin
./k3s-killall.sh
./k3s-uninstall.sh
```

#### Bezpieczna instalacja k3s

```bash
sudo curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
lub
sudo curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE="644" sh -
```

#### Znajdowanie plików kubeconfig

```bash
sudo find / -iname "*.kubeconfig"
```

#### Sprawdzenie uprawnień plików kubeconfig

```bash
sudo stat -c %a /var/lib/rancher/k3s/agent/kubelet.kubeconfig
600
```

#### Sprawdzenie statusu k3s

```bash
sudo systemctl status k3s
```

#### Dodawanie wpisów cgroup do pliku cmdline.txt

```bash
sudo vim /boot/cmdline.txt
```

* Dodaj na końcu linii zaczynającej się od console= poniższe wpisy:

```bash 
cgroup_memory=1 cgroup_enable=memory
```

* Zapisz plik i wyjdź.

#### Restart serwera

```bash
sudo reboot
```

#### Sprawdzenie statusu węzła

```bash
kubectl get nodes
```

#### Sprawdzenie podów

```bash
kubectl get pods -A
```

#### Pozbycie się traefik

```bash
kubectl -n kube-system delete helmcharts.helm.cattle.io traefik
```

#### Zatrzymywanie k3s

```bash
sudo systemctl stop k3s
```

#### Edycja pliku usługi k3s

```bash
sudo vim /etc/systemd/system/k3s.service
```

#### Modyfikacja ExecStart

* Dodaj poniższą linię

--disable=traefik

Powinno to wyglądać tak:

```bash
ExecStart=/usr/local/bin/k3s \
	server \
	--disable=traefik \
	'--write-kubeconfig-mode' \
	'644' \
	...
```

#### Przeładowanie daemona

```bash
sudo systemctl daemon-reload
```

#### Usunięcie traefik.yaml

```bash
sudo rm /var/lib/rancher/k3s/server/manifests/traefik.yaml
```

#### Uruchomienie k3s i sprawdzenie statusu

```bash
sudo systemctl start k3s
sudo systemctl status k3s
```

#### Spr

awdzenie podów

```bash
kubectl get pods -A
```

#### Instalacja k3s bezpiecznie bez traefik

```bash
sudo curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik" sh -s - --write-kubeconfig-mode 644
lub
sudo curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik" K3S_KUBECONFIG_MODE="644" sh -
```

#### Sprawdzenie podów

```bash
kubectl get pods -A
```
