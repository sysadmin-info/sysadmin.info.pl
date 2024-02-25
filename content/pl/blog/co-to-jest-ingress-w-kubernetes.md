---
title: Co to jest Ingress w Kubernetes?
date: 2024-01-09T10:30:00+00:00
description: Artykuł wyjaśnia, czym jest Ingress w Kubernetes i porównuje to do głównego wejścia lub recepcji.
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
image: images/2024-thumbs/ingress.webp
---
**Oto krótki film; czytaj dalej, aby dowiedzieć się więcej.**
{{<youtube DahTLuhhV60>}}

W Kubernetes Ingress to narzędzie zarządzające dostępem zewnętrznym do usług w klastrze, głównie dla ruchu HTTP i HTTPS. Działa jako kontroler kierujący zewnętrzne żądania do wewnętrznych usług. (Reszta artykułu znajduje się pod obrazkiem.)

![recepcja](/images/2024/reception.webp "recepcja")<figcaption>recepcja</figcaption>

Aby zrozumieć Ingress, można go porównać do głównego wejścia lub recepcji w budynku mieszkalnym. Podobnie jak recepcja kieruje gości do różnych mieszkań w zależności od tego, kogo chcą zobaczyć, Ingress kieruje przychodzący ruch zewnętrzny do odpowiednich usług w klastrze Kubernetes.

Ingress działa na warstwie aplikacyjnej stosu sieciowego (HTTP) i może oferować funkcje takie jak równoważenie obciążenia, zakończenie SSL oraz hosting wirtualny oparty na nazwach. To jest podobne do recepcji, która nie tylko kieruje gości, ale także świadczy dodatkowe usługi, takie jak kontrole bezpieczeństwa czy pomoc informacyjna.

Podsumowując, Ingress w Kubernetes funkcjonuje jako główny punkt wejściowy dla ruchu zewnętrznego, efektywnie kierując go do odpowiednich usług wewnątrz klastra, podobnie jak recepcja kieruje odwiedzających w dużym budynku.