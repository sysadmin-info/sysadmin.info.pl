---
title: Co to są Port i TargetPort w Kubernetes?
date: 2024-01-09T10:00:00+00:00
description: Artykuł wyjaśnia, czym są Port i TargetPort w Kubernetes i porównuje je do numeru, który wybierasz w wewnętrznym systemie telefonicznym w budynku mieszkalnym, aby skontaktować się z kimś w konkretnym mieszkaniu.
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
    image: images/2024-thumbs/port.webp
---
**Oto krótki film; czytaj dalej, aby dowiedzieć się więcej.**
{{<youtube chU2pqzuC2I>}}

W Kubernetes "Port" i "TargetPort" to kluczowe ustawienia w usłudze (Service), które kontrolują sposób kierowania ruchu sieciowego do podów. (Reszta artykułu znajduje się pod obrazkiem).

![wewnętrzny system telefoniczny](/images/2024/internal-phone-system.webp "wewnętrzny system telefoniczny")<figcaption>wewnętrzny system telefoniczny</figcaption>

* **Port:** Odnosi się do numeru portu w samej usłudze. Jest to punkt kontaktowy dla innych usług lub użytkowników zewnętrznych, gdy chcą komunikować się z podami zarządzanymi przez tę usługę.

	* **Analogia:** Wyobraź sobie, że jest to numer w wewnętrznym systemie telefonicznym w budynku mieszkalnym. Kiedy chcesz skontaktować się z kimś w budynku, wybierasz ten numer. Podobnie, gdy ktoś chce uzyskać dostęp do usługi (Service) w Kubernetes, używa tego numeru "Port".

* **TargetPort:** Jest to konkretny port w podzie, do którego usługa przekierowuje ruch przychodzący. Jest to miejsce, w którym aplikacja wewnątrz poda faktycznie nasłuchuje żądań.

	* **Analogia:** Potraktuj "TargetPort" jako rzeczywisty numer mieszkania w budynku. Kiedy wybierasz numer w wewnętrznym systemie telefonicznym (Port), jesteś połączony z konkretnym mieszkaniem (TargetPort), w którym mieszka osoba, z którą chcesz porozmawiać.

Razem, "Port" i "TargetPort" zapewniają, że zewnętrzne lub wewnętrzne żądania docierają do właściwego miejsca docelowego wewnątrz klastra, podobnie jak dobrze zorganizowany wewnętrzny system telefoniczny zapewnia połączenie z właściwym mieszkaniem w dużym budynku.