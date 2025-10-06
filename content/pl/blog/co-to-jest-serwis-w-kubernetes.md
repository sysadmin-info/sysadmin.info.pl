---
title: Co to jest serwis w Kubernetes?
date: 2024-01-06T17:00:00+00:00
description: Artykuł wyjaśnia, czym jest serwis w Kubernetes i porównuje go do recepcjonisty w hotelu..
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
    image: images/2024-thumbs/service.webp
---
**Oto krótki film; czytaj dalej, aby dowiedzieć się więcej.**
{{<youtube xpZyYifb6NE>}}

W Kubernetes serwis to kluczowe pojęcie, działające jak brama lub recepcjonista dla podów. Jest to sposób, w jaki Kubernetes udostępnia pody, zarówno innym podom w tym samym klastrze, jak i zewnętrznym użytkownikom oraz systemom. (Reszta artykułu znajduje się pod obrazem.)

![recepcjonistka](/images/2024/receptionist.webp "recepcjonistka")<figcaption>recepcjonistka</figcaption>

Pomyśl o serwisie jako o stabilnym adresie dostępu do podów. Tak jak recepcjonista w hotelu, który kieruje twój telefon do odpowiedniej osoby, serwis zapewnia, że ruch sieciowy jest kierowany do odpowiednich podów. Jest to ważne, ponieważ pody mogą być nietrwałe – mogą być zastępowane, przemieszczane lub skalowane, więc ich adresy IP mogą się zmieniać. Serwis zapewnia spójny sposób dostępu do podów, niezależnie od tych zmian.

Istnieją różne typy serwisów w Kubernetes:

**NodePort:** Ten typ serwisu udostępnia pody ruchowi zewnętrznemu. Otwiera określony port na wszystkich węzłach (maszynach w klastrze Kubernetes) i cały ruch, który przychodzi na ten port, jest przekierowywany do podów. To jak posiadanie publicznego numeru telefonu, którego zewnętrzni dzwoniący mogą użyć, aby się dodzwonić do apartamentu (poda).

**ClusterIP:** To domyślny typ serwisu, używany do komunikacji wewnętrznej w klastrze. Przydziela unikalny adres IP serwisowi, którego inne serwisy w klastrze mogą używać do dostępu do podów. Jest to podobne do wewnętrznej linii telefonicznej w budynku, umożliwiającej komunikację między różnymi apartamentami (podami) bez wystawiania ich na świat zewnętrzny.

Podsumowując, serwis w Kubernetes działa jako pośrednik, zapewniając płynną i stabilną komunikację do i od podów, podobnie jak recepcjonista lub centrala telefoniczna zarządza połączeniami w dużym budynku.