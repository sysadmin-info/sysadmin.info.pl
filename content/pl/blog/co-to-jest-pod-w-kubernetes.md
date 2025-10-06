---
title: Co to jest pod w Kubernetes?
date: 2024-01-06T16:00:00+00:00
description: Artykuł wyjaśnia, czym jest pod w Kubernetes i porównuje go do pojedynczego mieszkania w dużym bloku mieszkalnym.
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
    image: images/2024-thumbs/pod.webp
---
**Oto krótkie wideo; czytaj dalej, aby dowiedzieć się więcej.**
{{<youtube -gPQuHro0yM>}}

W kontekście Kubernetes, pod można postrzegać jako najmniejszą jednostkę wdrożeniową, podobną do pojedynczego mieszkania w dużym bloku mieszkalnym. (Reszta artykułu znajduje się pod obrazkiem.)

![duży blok mieszkalny](/images/2024/large-apartment-building.webp "duży blok mieszkalny")<figcaption>duży blok mieszkalny</figcaption>

Tak jak mieszkanie może mieć jeden lub więcej pokoi, pod może zawierać jeden lub więcej kontenerów, takich jak kontenery Docker. Te kontenery wewnątrz pod są jak pokoje w mieszkaniu, każdy z nich służy określonej funkcji lub celowi. Dzielą zasoby i są zarządzane jako pojedyncza jednostka.

![plan mieszkania](/images/2024/apartment-plan.webp "plan mieszkania")<figcaption>plan mieszkania</figcaption>

W tej analogii każdy kontener (pokój) w pod (mieszkanie) pracuje na wspólny cel, taki jak uruchamianie różnych aspektów aplikacji. Dzielą tę samą przestrzeń adresową sieci (jak adres mieszkania) i mogą łatwo ze sobą komunikować, tak jak ludzie w różnych pokojach tego samego mieszkania mogą łatwo rozmawiać ze sobą.

Pod reprezentuje więc spójną jednostkę wdrożenia w ekosystemie Kubernetes, enkapsulującą i uruchamiającą zestaw kontenerów razem.

![mieszkanie](/images/2024/apartment.webp "mieszkanie")<figcaption>mieszkanie</figcaption>