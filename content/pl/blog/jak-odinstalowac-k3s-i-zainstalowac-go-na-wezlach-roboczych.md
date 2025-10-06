---
title: Jak odinstalować k3s i zainstalować go na węzłach roboczych
date: 2023-08-30T11:00:00+00:00
description: Jak odinstalować k3s i zainstalować go na węzłach roboczych na Raspberry
  Pi CM4
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
    image: images/2023-thumbs/k3s-nodes.webp
---
W tym artykule opowiem o krokach instalacji i konfiguracji k3s.

1. **Oto samouczek wideo; czytaj dalej dla listy pisemnych instrukcji.**

{{<youtube PBWAnnNlS-k>}}

#### Ćwiczenia do wykonania:
1. Usuń k3s z węzła roboczego
2. Prawidłowo usuń węzeł roboczy na węźle głównym
3. Zainstaluj k3s na węźle roboczym
4. Oznakuj węzeł
5. Przywróć usunięte węzły robocze na węźle głównym
6. Opróżnij węzeł i przywróć go
7. Sprawdź log węzła

##### Wprowadzenie

Zdecydowałem się zainstalować k3s na płytce Raspberry Pi CM4 IO z modułem obliczeniowym 4 oraz na dwóch Raspberry Pi 4b z 8GB RAM.

##### Usuń k3s z węzła roboczego

Zaloguj się na węzeł roboczy przez ssh, przełącz na roota i usuń k3s z węzła roboczego.

```bash
sudo -i 
cd /usr/local/bin
./k3s-killall.sh
./k3s-agent-uninstall.sh
```

##### Prawidłowo usuń węzeł roboczy na węźle głównym

Zaloguj się na węzeł główny i wpisz:

```bash
kubectl get nodes
```
aby sprawdzić istniejące węzły.

Bezpiecznie usuń pody z węzła roboczego.

Możesz użyć kubectl drain, aby bezpiecznie ewakuować wszystkie swoje pody z węzła przed wykonaniem na nim konserwacji (np. aktualizacja jądra, konserwacja sprzętu itp.). Bezpieczne ewakuacje pozwolą kontenerom pody na łagodne zakończenie i będą respektować podane przez Ciebie PodDisruptionBudgets.

```bash
kubectl drain worker
```

Usuń węzły

```bash
kubectl delete node worker
```

Sprawdź, czy węzeł roboczy już nie istnieje

```bash
kubectl get nodes
```
##### Zainstaluj k3s na węźle roboczym

Pobierz token z węzła głównego

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```


Pobierz adres IP węzła głównego

```bash
hostname -I
```

Zaloguj się na węzeł roboczy przez ssh i wykonaj poniższą komendę:

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://10.10.0.110:6443 K3S_TOKEN=K1035b82... sh -
```

Dodaj wpisy cgroup do pliku cmdline.txt

```bash
sudo vim /boot/cmdline.txt
```

Dodaj na końcu linii zaczynającej się od console= poniższe wpisy:

```bash
cgroup_memory=1 cgroup_enable=memory
```

Zapisz plik i wyjdź.

Zrestartuj serwer

```bash
sudo reboot
```

Sprawdź status węzłów roboczych na węźle głównym


Sprawdź status węzła

```bash
kubectl get nodes
```

##### Oznakuj węzeł

Jak oznakować węzeł

```bash
kubectl label nodes worker kubernetes.io/role=worker
```

Jak zmienić etykietę

```bash
kubectl label nodes worker kubernetes.io/role=worker-1 --overwrite
```

##### Przywróć usunięte węzły robocze na węźle głównym

Jeśli ktoś wykonał drain, a następnie usunął węzły na węźle głównym, zaloguj się na węzeł roboczy przez ssh i zrestartuj usługę k3s poniższą komendą

```bash
sudo systemctl restart k3s-agent.service
```

##### Opróżnij węzeł i przywróć go

```bash
kubectl drain worker
kubectl get nodes
kubectl uncordon worker
kubectl get nodes
```

##### Sprawdź log węzła

```bash
kubectl describe node worker
```