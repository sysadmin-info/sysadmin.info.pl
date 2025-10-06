---
title: Co to jest NodePort w Kubernetes?
date: 2024-01-06T18:00:00+00:00
description: Artykuł wyjaśnia, czym jest NodePort w Kubernetes i porównuje go do wrzutnika na listy w drzwiach mieszkania.
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
    image: images/2024-thumbs/nodeport.webp
---
**Oto krótki film; czytaj dalej, aby dowiedzieć się więcej.**
{{<youtube CZ2GQhrEC-0>}}

NodePort to typ usługi w Kubernetes, która umożliwia dostęp do poda z zewnątrz klastra Kubernetes. To jak otwarcie konkretnego kanału dla ruchu zewnętrznego, aby dotrzeć do twoich podów. (Reszta artykułu znajduje się pod obrazem.)

![wrzutnik na listy](/images/2024/mail-slot.webp "wrzutnik na listy")<figcaption>wrzutnik na listy</figcaption>

Pomyśl o NodePort jak o wrzutniku na listy w drzwiach mieszkania. Tak jak wrzutnik na listy pozwala na dostarczenie listów (ruchu sieciowego) bezpośrednio z zewnętrznego świata do mieszkania, tak NodePort umożliwia zewnętrznym żądaniom dotarcie do odpowiedniego poda w twoim klastrze Kubernetes.