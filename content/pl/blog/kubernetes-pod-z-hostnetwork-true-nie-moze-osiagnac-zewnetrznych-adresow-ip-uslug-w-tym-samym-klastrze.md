---
title: "Kubernetes Pod z hostNetwork: true nie może osiągnąć zewnętrznych adresów IP usług w tym samym klastrze"
date: 2023-09-30T16:15:00+00:00
description: "Kubernetes Pod z hostNetwork: true nie może osiągnąć zewnętrznych adresów IP usług w tym samym klastrze"
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
- CM4 board
- CM4 compute module
- Kubernetes
- k3s
- Rancher
- Helm
series:
- Kubernetes 
categories:
- Raspberry Pi
image: images/2023-thumbs/hostnetworktrue.webp
---
### Kubernetes Pod z hostNetwork: true nie może osiągnąć zewnętrznych adresów IP usług w tym samym klastrze

Skutecznym narzędziem do zarządzania i rozwijania aplikacji jest Kubernetes, będący de facto standardem branżowym dla orkiestracji kontenerów. Jednak czasami stwarza trudne problemy. Przykładem takiego problemu jest niemożność połączenia się węzła Kubernetes z hostNetwork: true z zewnętrznymi adresami IP usług w tym samym klastrze. W tym poście na blogu szczegółowo omówimy ten problem i zaproponujemy rozwiązanie.

#### Rozpoznanie Problemu

Zanim przejdziemy do rozwiązania, przeanalizujmy najpierw problem. Gdy w specyfikacji Pod jest zdefiniowane hostNetwork: true, Pod używa przestrzeni nazw sieci hosta, a nie własnej. Może to skutkować niemożnością dostępu Pod do usług znajdujących się w tym samym klastrze poprzez ich zewnętrzne adresy IP.

Ze względu na potencjalne zakłócenie komunikacji między różnymi usługami w klastrze, ten problem może być bardzo skomplikowany i prowadzić do awarii aplikacji. Specjaliści od danych i DevOps często napotykają ten problem podczas korzystania z Kubernetes.

#### Co Powoduje Ten Problem?

Głównym czynnikiem przyczyniającym się do tego problemu jest architektura sieciowa Kubernetes. Gdy jest używane hostNetwork: true, Pod i host dzielą przestrzeń nazw sieci. Oznacza to, że Pod korzysta z adresu IP i przestrzeni portów hosta.

Wirtualny adres IP (VIP) używany do dostępu do usług Kubernetes jest zwykle dostępny tylko wewnątrz klastra. Gdy Pod z hostNetwork: true próbuje połączyć się z usługą za pomocą jej zewnętrznego adresu IP, żądanie jest wysyłane z przestrzeni nazw sieciowej hosta. Host nie może rozwiązać usługi VIP, ponieważ nie jest częścią sieci Kubernetes.

### Rozwiązaniem jest wykorzystanie DNS i iptables.

Do rozwiązania tego problemu wykorzystuje się dwa kluczowe narzędzia sieciowe Kubernetes: DNS i iptables.

#### Po pierwsze: DNS

W Kubernetes dostępna jest wbudowana usługa DNS do odkrywania usług. Gdy tworzona jest usługa, automatycznie przypisywana jest jej nazwa DNS. Pod w tym samym klastrze mogą używać tej nazwy DNS do kontaktu z usługą.

Możemy wykorzystać tę funkcjonalność w naszym przypadku. Zamiast zewnętrznego adresu IP usługi możemy użyć jej nazwy DNS. W ten sposób nasz Pod nadal może uzyskać dostęp do usługi, nawet jeśli korzysta z sieci hosta.

Oto przykład, jak uwzględnić nazwę DNS usługi w specyfikacji Pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  hostNetwork: true
  containers:
  - name: my-container
    image: my-image
    command: ['curl', 'my-service.cluster.local']
```

#### Po drugie: Instalacja iptables

Chociaż użycie DNS może rozwiązać nasz problem, nie zawsze jest to praktyczne. Na przykład, jeśli twoja aplikacja musi używać adresu IP usługi do komunikacji, potrzebujesz innego rozwiązania.

W takiej sytuacji przydaje się iptables. Iptables to narzędzie, które pozwala kontrolować ruch sieciowy za pomocą różnych reguł. W naszym przypadku iptables może być użyte do przekierowania ruchu z naszego Pod do VIP usługi.

Oto przykład, jak utworzyć regułę iptables:

```bash
iptables -t nat -A OUTPUT -d <external-ip> -j DNAT --to-destination <service-vip>
```

Ta reguła instruuje iptables, aby przekierowywało cały ruch przeznaczony dla zewnętrznego adresu IP usługi do VIP. W ten sposób twój Pod nadal może uzyskać dostęp do usługi, nawet jeśli korzysta z sieci hosta.

#### Podsumowanie

Chociaż Kubernetes jest skutecznym narzędziem do zarządzania i rozwijania aplikacji, czasami stwarza trudne sytuacje. Jednym z takich problemów jest niemożność połączenia się węzła Kubernetes z hostNetwork: true z zewnętrznymi adresami IP usług w tym samym klastrze. Możemy przezwyciężyć tę trudność, rozpoznając podstawową przyczynę problemu i korzystając z wbudowanych możliwości Kubernetes. Pamiętaj, że Kubernetes to skomplikowany system, więc aby skutecznie rozwiązywać problemy, musisz zrozumieć, jak działa. Kontynuuj eksplorację i naukę, a gdy napotkasz problem, nie bój się zagłębiać w dokumentację Kubernetes.
