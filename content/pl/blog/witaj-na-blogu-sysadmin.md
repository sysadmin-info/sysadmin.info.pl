---
title: Witaj na blogu Sysadmin
date: 2023-03-19T22:08:59+00:00
description: Witaj na blogu Sysadmin
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
series:
- 
categories:
- general
image: images/2019-thumbs/sysadmin-logo.webp
---
Cześć, 

To, co poniżej to już historia. Od tamtego momentu minęły ponad 3 lata. Czy to dużo, czy mało? Dla mnie zmieniło się bardzo dużo, zdążyłem bowiem przejść na trzecią linię w Fujitsu i przepracować ponad rok w zespole Linux a potem przeszedłem do działu Research and Development, gdzie obecnie pracuję jako Quality Assurance, jednak w zasadzie wciąż moja praca związana jest z systemem Linux, tyle tylko, że obecnie pracuję z SLES i open SUSE. W domu mam obecnie Raspberry Pi 4b rev 1.4 z 8 GB RAM i dyskiem SSD 120 GB, na którym jest zainstalowany Debian 11, Home Assistant Supervised i parę innych rzeczy oraz Fujitsu Esprimo Q920 z 16 GB RAM i dyskiem SSD o pojemności 512 GB, na którym mam Proxmox z maszynami wirtualnymi takimi jak wielonodowy klaster Wazuh chociażby, czy Portainer, którego używam do szybkiego stawiania kontenerów Docker. Zdążyłem przejść przez instalację systemu na wykupionych kilku VPS. Postawiłem serwer poczty na Postfix oraz Dovecot, Dovecot Sieve, Postgrey, SpamAssassin, ClamAV itd. Instalowałem też Apache i Nginx, które potem zabezpieczałem, tak zwany hardening. Poznałem OpenvSwitch, Qemu KVM, Proxmox, ESXi, Zabbix, Zephyr Enterprise, Jenkins, Selenium Grid, Confluence, Jira i wiele innych narzędzi i rozwiązań. Przeszedłem przez zarządzanie starymi maszynami takimi jak Solaris, SCO_SV, stare CentOS i Red Hat (wersje 4, 5, 6, 7). Nauczyłem się wielu rzeczy i wciąż uczę się. Nie stoję w miejscu. Rozwijam Stack technologiczny. Uczę się AWS i tego jak konfigurować środowiska, które są już bardziej zaawansowane pod kątem bezpieczeństwa. Nie programuję, mimo, że napisanie kodu w Java, Python, Bash, C nie stanowi dla mnie problemu. Po prostu programowanie nie jest moją pasją. Moją pasją jest Linux i szeroko pojęte bezpieczeństwo z nim związane. OSINT, mimo, że znam, też nie jest czymś, co robię, bo nie jest to dla mnie wyzwanie i nie jest moją rolą poszukiwanie ludzi przez Internet. Jeśli ktoś ma większą wiedzę ode mnie, lecz nie szanuje mnie, nie jest kulturalny i zasłania się chorobą, z czym osobiście się spotkałem ponadto wykazuje elementarne braki w czytaniu że zrozumieniem, jest dinozaurem i wciska początkującym SELinux czy AppArmor, ten nie ma tu czego szukać. Netykiety powinien był taki człowiek nauczyć się na samym początku, bo to podstawa w Internecie. Szanujmy się wzajemnie, bo to droga do profesjonalizmu. Do tego umiejętność panowania nad własnymi emocjami, a także cytat mistrza Yoda "Do or do not, there is no try" - to droga do sukcesu. 

Stary wpis z września 2019:

Blog ten poświęcony zostanie zagadnieniom z zakresu administracji serwerami Linux. Skupiłem się na popularnych dystrybucjach takich jak Debian 9.8.0, CentOS 7.6, Fedora 29. Oczywiście nie poprzestanę na tym, ponieważ mam jeszcze na Virtual Box instancję RHEL (Red Hat Enterprise Linux) 7.7. 

Opiszę rozwiązania, które wdrożyłem u siebie na trzech laptopach, które pełnią rolę serwerów w domu w celach nauki własnej. Dodatkowo wykupiłem sobie VPS, na którym skonfigurowałem sobie środowisko do hostowania tej właśnie strony. Zamierzam też dokupić w przyszłości kolejny VPS i przenieść instalację serwera poczty oraz Samba na jedną maszynę. Docelowo chcę wyłączyć dwa pozostałe laptopy (serwer poczty oraz Samba), schować je do szuflady i mieć wszystko w sieci.