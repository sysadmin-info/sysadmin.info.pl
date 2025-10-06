---
title: Prototyp obudowy z chłodzeniem wodnym dla płyty CM4 z Compute Module 4 i NVMe
  SSD
date: 2023-07-23T17:00:00+00:00
description: Prototyp obudowy z chłodzeniem wodnym dla płyty CM4 z Compute Module
  4 i NVMe SSD
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- water cooling dla CM4 / Raspberry Pi
categories:
- Raspberry Pi
cover:
    image: images/2023-thumbs/prototype.webp
---

{{<youtube oM9VIu9QyDM>}}

##### Chciałbym podziękować dwóm poniższym firmom, które pomogły mi z drukiem 3D i cięciem laserowym.

##### Drukowanie komponentów 3D:
<a href="https://smk3d.pl/" target="_blank"><img src="/images/2023/smk3d.webp" align="left" alt="SMK3D - Studio modelowania koncepcyjnego 3D"></a>
</br></br>
##### Cięcie laserowe w akrylu:
<a href="https://crafters.com.pl/" target="_blank"><img src="/images/2023/crafters.webp" align="left" alt="Crafters.pl - Cięcie laserowe"></a>
</br>

#### Podsumowanie cen

##### 1. Rury

|Nazwa|Cena|URL|
|---|---| ---|
|Przezroczyste rury 10 mm|82,46 PLN| https://amzn.eu/d/9NODjaX |
|Przezroczysta rura Innovatek, 1m, 8mm (500898)|28,57 PLN|https://www.morele.net/innovatek-waz-przezroczysty-1m-8mm-500898-546513 |

Razem: 111,03 PLN

##### 2. Zbiornik

|Nazwa|Cena|URL|
|---|---| ---|
|Zbiornik na wodę|49,01 PLN|https://amzn.eu/d/3xT5bob |
|Dwie złączki do zbiornika na wodę|54,02 PLN|https://amzn.eu/d/frnVr65 |
|Śruba blokująca do zbiornika na wodę|43,90 PLN|https://amzn.eu/d/iqybIwM |
|Pompa 1 szt.|7,56 PLN|https://allegro.pl/oferta/pompa-zanurzeniowa-5v-czarna-pionowa-12988751444 |
|Płyn chłodzący|108,05 PLN|https://amzn.eu/d/bwRswui |
|Uchwyty akrylowe|19,34 PLN|https://allegro.pl/oferta/50-mm-2-cale-uchwyt-na-stojak-klamra-do-12363704998 |

**Razem: 281,88 PLN**

##### 3. Wentylatory

|Nazwa|Cena|URL|
|---|---| ---|
|Wentylator Noctua bez PWM|72,00 PLN|https://allegro.pl/oferta/wentylator-wiatrak-noctua-nf-a6x25-60x25-mm-13093668096 |
|Wentylator Noctua z PWM|76,00 PLN|https://allegro.pl/oferta/wentylator-wiatrak-noctua-nf-a6x25-60x25-mm-13093668096 |

**Razem: 148 PLN**

##### 4. Rozwiązanie chłodzące:

|Nazwa|Cena|URL|
|---|---| ---|
|Radiatorek|48,24 PLN|https://pl.aliexpress.com/item/32976072893.html?spm=a2g0o.9042311.0.0.27424c4d5G6zXq&gatewayAdapt=glo2pol |
|Zestaw bloku chłodzenia wodnego|165,62 PLN|https://www.etsy.com/au/listing/967199864/green-water-cooling-block-kit-for |

**Razem: 213,86 PLN**

##### 5. Płytki akrylowe

|Nazwa|Cena|URL|
|---|---| ---|
|Przezroczysta płyta akrylowa| 67,72 PLN | https://amzn.eu/d/4x6yayg |
|3 płytki akrylowe białe, połysk, format A4|66,52 PLN|https://studiograf.info.pl/pleksa/36-pleksa-3mm-biala-white-blyszczaca-cieta-na-wymiar-5903858430119.html |

**Razem: 134,24 PLN**

##### 6. Projekt 3D i elementy cięte laserowo

|Nazwa|Cena|URL|
|---|---| ---|
|Projekt obudowy CM4|27,60 PLN|https://www.etsy.com/pl/listing/1209925530/raspberry-pi-cm4-io-board-case-3d-print |

**Razem: 27,60 PLN**

##### 7. Narzędzia i potrzebne części

|Nazwa|Cena|URL|
|---|---| ---|
|Przewody do płytki stykowej EDGELEC, 120 szt.|27,83 PLN|https://a.co/d/hXCWs1C |
|Zestaw złączek 2.54mm Pitch & Pin, 620 szt.|43,70 PLN|https://a.co/d/bjGblJD |
|Zaciskarka złącz|58,99 PLN|https://amzn.eu/d/cSi1aQa |
|Przycisk chwilowy|31,91 PLN|https://a.co/d/a9hcP5n |
|Dystanse mosiężne M2.5, 180 szt.|105,16 PLN|https://allegro.pl/oferta/180-sztuk-m2-5-mosiezny-dystans-sl-gt-dystans-p-12649955642 |
|Dichlorometan|6 PLN|https://allegro.pl/oferta/chlorek-metylenu-dichlorometan-czysty-100ml-8758380480 |
|Strzykawka szklana z igłami|36,18 PLN|https://a.co/d/9enmZi9 |

**Razem: 309,77 PLN**

##### 8. Sprzęt płyty CM4

|Nazwa|Cena|URL|
|---|---| ---|
|Płyta rozszerzeń CM4 IO|203,00 PLN|https://allegro.pl/oferta/raspberry-pi-cm4io-plytka-rozszerzen-dla-rpi-cm4-10818286836 |
|Moduł obliczeniowy Compute Module 4|798,00 PLN|https://allegro.pl/moje-allegro/zakupy/kupione/41408c8c-0ee9-37d4-8b16-9dd461e56e3a/oferta/583e3120-1e28-11ee-811e-0ddda74e84da |
|Adapter M.2 NVMe Key M do PCI-e x1 SSD|18,99 PLN|https://allegro.pl/oferta/adapter-m-2-nvme-key-m-do-pci-e-x1-ssd-8900869992 |
|Zasilacz impulsowy MW Power ER36W12V 12V/3A|42 PLN|https://allegro.pl/oferta/zasilacz-impulsowy-mw-power-er36w12v-12v-3a-11616990085 |
|Wyświetlacz OLED|18,49 PLN|https://allegro.pl/oferta/oled-bialy-wyswietlacz-0-96-i2c-3-5v-ssd1306-10726196790 |
|Śruby kuliste M3x8 czarne, z gniazdem imbusowym, 10 szt.|2,70 PLN|https://allegro.pl/oferta/sruba-kulista-czarna-m3x8-gniazdo-imbus-10szt-5315915867 |
|Dysk SSD NVMe Crucial P3 PLUS 1TB M.2 PCIe|189,90 PLN|https://allegro.pl/oferta/dysk-ssd-crucial-p3-plus-m-2-pcie-gen4-nvme-1tb-14040203933 |

**Razem: 1273,08 PLN**

##### Całkowita cena: 2499,46 PLN
**~620,92 USD 
~922,55 AUD
~565,15 EUR**

**Alternatywnie do zakupu:**

Wentylator Noctua z PWM: 
https://amzn.to/35G14Vp

Inny radiator:
https://amzn.eu/d/40fHzrI

Termopad:
https://allegro.pl/oferta/termopad-thermal-grizzly-minus-pad-8-120x20-13073555463

Pasta termoprzewodząca:
https://allegro.pl/oferta/pasta-termoprzewodzaca-grizzly-kryonaut-1g-gratis-12758644837