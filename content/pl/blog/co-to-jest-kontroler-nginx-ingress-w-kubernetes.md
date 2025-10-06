---
title: Co to jest kontroler NGINX Ingress w Kubernetes?
date: 2024-01-09T11:30:00+00:00
description: Artykuł wyjaśnia, czym jest kontroler NGINX Ingress w Kubernetes i porównuje go do wysoce wykwalifikowanego recepcjonisty przy głównym wejściu do budynku mieszkalnego, wyposażonego w dodatkowe możliwości i ekspertyzę.
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
    image: images/2024-thumbs/nginx-ingress-controller.webp
---
**Oto krótki film; czytaj dalej, aby dowiedzieć się więcej.**
{{<youtube FW8TP5UDq4g>}}

Kontroler NGINX Ingress w Kubernetes można najlepiej zrozumieć jako wyspecjalizowaną wersję narzędzia Ingress. To jak wysoce wykwalifikowany recepcjonista przy głównym wejściu do budynku mieszkalnego, wyposażony w dodatkowe możliwości i ekspertyzę.

![wysoce wykwalifikowany recepcjonista](/images/2024/highly-skilled-receptionist.webp "wysoce wykwalifikowany recepcjonista")<figcaption>wysoce wykwalifikowany recepcjonista</figcaption>

Podobnie jak ten wyspecjalizowany recepcjonista nie tylko kieruje odwiedzających do odpowiedniego mieszkania, ale także oferuje dodatkowe usługi takie jak kontrole bezpieczeństwa, kontroler NGINX Ingress robi więcej niż tylko kierowanie zewnętrznego ruchu do odpowiednich usług w klastrze Kubernetes. Zapewnia dodatkowe kluczowe funkcjonalności:

* **Routing Ruchu**: Efektywnie zarządza tym, jak przychodzący zewnętrzny ruch jest rozdzielany na różne usługi. To jak prowadzenie odwiedzających do różnych mieszkań w zależności od tego, kogo chcą zobaczyć.

* **Terminacja SSL/TLS**: Kontroler NGINX Ingress może obsługiwać szyfrowanie i deszyfrowanie bezpiecznego ruchu (HTTPS), przejmując to zadanie od poszczególnych usług. To jak przeprowadzanie kontroli bezpieczeństwa na recepcji, zanim pozwoli się odwiedzającym przejść dalej.

* **Bilansowanie obciążenia**: Również równoważy przychodzący ruch między wieloma instancjami usługi, aby zapewnić, że żadna pojedyncza usługa nie zostanie przeciążona, podobnie jak recepcjonista zarządzający kolejką, aby uniknąć przeciążenia jakiegokolwiek stanowiska obsługi.

Podsumowując, kontroler NGINX Ingress to bardziej zaawansowana i bogata w funkcje brama w Kubernetes, zwiększająca kontrolę i bezpieczeństwo zarządzania i kierowania zewnętrznym ruchem w Twoim klastrze.