---
title: Jak zainstalować Portainer i używać go jako dashboard K3S w Raspberry Pi CM4
date: 2023-10-05T17:20:00+00:00
description: Jak zainstalować Portainer i używać go jako dashboard K3S w Raspberry
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
    image: images/2023-thumbs/k3s-rancher-portainer.webp
---
Przeprowadzę Cię przez kroki instalacji Portainer w tym artykule.

1. **Oto video tutorial; czytaj dalej dla listy pisemnych instrukcji.**

{{<youtube EvaRxmXxV0w>}}

#### Ćwiczenia do wykonania:

1. Zainstaluj Portainer na węźle głównym
2. Otwórz URL w przeglądarce internetowej
3. Usuń Portainer jeśli potrzeba

#### Instalacja Portainer na węźle głównym

```bash
kubectl apply -f https://raw.githubusercontent.com/portainer/k8s/master/deploy/manifests/portainer/portainer.yaml
```

#### Wyświetl URL Portainer

```bash
curl -vk https://<ADRES_IP>:<NUMER_PORTU>
```

np.

```bash
curl -vk https:10.10.0.120:30777
```

Skopiuj URL i wklej go do paska adresu w przeglądarce internetowej. Następnie zaloguj się do Portainer używając loginu: admin. Wygeneruj hasło, używając generatora losowych haseł.

#### Usuwanie Portainer jeśli potrzeba

```bash
kubectl delete deployments.apps/portainer -n portainer && kubectl delete service portainer -n portainer && kubectl delete serviceaccount -n portainer portainer-sa-clusteradmin && kubectl delete pvc portainer -n portainer && kubectl delete clusterrolebinding portainer && kubectl delete namespace portainer && rm -f portainer.yaml
```