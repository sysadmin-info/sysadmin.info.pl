---
title: Water cooling case prototype for CM4 board with Compute Module 4 and NVMe SSD
date: 2023-07-23T17:00:00+00:00
description: Water cooling case prototype for CM4 board with Compute Module 4 and
  NVMe SSD
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Water cooling for CM4 / Raspberry Pi
categories:
- Raspberry Pi
cover:
    image: images/2023-thumbs/prototype.webp
---

{{<youtube oM9VIu9QyDM>}}

##### I would like to give special thanks to the following two companies that helped me with 3D printing and laser cutting.

##### 3D components printing:
<a href="https://smk3d.pl/" target="_blank"><img src="/images/2023/smk3d.webp" align="left" alt="SMK3D - 3D Conceptual Modeling Studio"></a>
</br></br>
##### Laser cutting in acrylic:
<a href="https://crafters.com.pl/" target="_blank"><img src="/images/2023/crafters.webp" align="left" alt="Crafters.pl - Laser cutting"></a>
</br>

#### Summary of prices

##### 1. Pipes

|Name|Price|URL|
|---|---| ---|
|Transparent pipes 10 mm|82,46 PLN| https://amzn.eu/d/9NODjaX |
|Innovatek transparent pipe, 1m, 8mm (500898)|28,57 PLN|https://www.morele.net/innovatek-waz-przezroczysty-1m-8mm-500898-546513 |

In total: 111,03 PLN

##### 2. Tank

|Name|Price|URL|
|---|---| ---|
|Water tank|49,01 PLN|https://amzn.eu/d/3xT5bob |
|Two pipe fittings for the water tank|54,02 PLN|https://amzn.eu/d/frnVr65 |
|Locking screw for water tank|43,90 PLN|https://amzn.eu/d/iqybIwM |
|Pump 1 pcs|7,56 PLN|https://allegro.pl/oferta/pompa-zanurzeniowa-5v-czarna-pionowa-12988751444 |
|Coolant|108,05 PLN|https://amzn.eu/d/bwRswui |
|Acrylic brackets|19,34 PLN|https://allegro.pl/oferta/50-mm-2-cale-uchwyt-na-stojak-klamra-do-12363704998 |

**In total: 281,88 PLN**

##### 3. Fans

|Name|Price|URL|
|---|---| ---|
|Noctua fan without PWM|72,00 PLN|https://allegro.pl/oferta/wentylator-wiatrak-noctua-nf-a6x25-60x25-mm-13093668096 |
|Noctua fan with PWM|76,00 PLN|https://allegro.pl/oferta/wentylator-wiatrak-noctua-nf-a6x25-60x25-mm-13093668096 |

**In total: 148 PLN**

##### 4. Cooling solution:

|Name|Price|URL|
|---|---| ---|
|Heat sink|48,24 PLN|https://pl.aliexpress.com/item/32976072893.html?spm=a2g0o.9042311.0.0.27424c4d5G6zXq&gatewayAdapt=glo2pol |
|Water cooling block kit|165,62 PLN|https://www.etsy.com/au/listing/967199864/green-water-cooling-block-kit-for |

**In total: 213,86 PLN**

##### 5. Acrylic tiles

|Name|Price|URL|
|---|---| ---|
|Clear acrylic tile| 67,72 PLN | https://amzn.eu/d/4x6yayg |
|3 acrylic tiles white, gloss, format A4|66,52 PLN|https://studiograf.info.pl/pleksa/36-pleksa-3mm-biala-white-blyszczaca-cieta-na-wymiar-5903858430119.html |

**In total: 134,24 PLN**

##### 6. Project 3D  & laser cut parts

|Name|Price|URL|
|---|---| ---|
|CM4 case project|27,60 PLN|https://www.etsy.com/pl/listing/1209925530/raspberry-pi-cm4-io-board-case-3d-print |

**In total: 27,60 PLN**

##### 7. Tools and needed parts

|Name|Price|URL|
|---|---| ---|
|EDGELEC 120pcs Breadboard Jumper Wires|27,83 PLN|https://a.co/d/hXCWs1C |
|620 Pcs 2.54mm Pitch & Pin Connector Kit|43,70 PLN|https://a.co/d/bjGblJD |
|Connector Crimpers|58,99 PLN|https://amzn.eu/d/cSi1aQa |
|Momentary pushbutton|31,91 PLN|https://a.co/d/a9hcP5n |
|180 Pieces M2.5 Hex Brass Spacer Standoffs|105,16 PLN|https://allegro.pl/oferta/180-sztuk-m2-5-mosiezny-dystans-sl-gt-dystans-p-12649955642 |
|Methylene chloride|6 PLN|https://allegro.pl/oferta/chlorek-metylenu-dichlorometan-czysty-100ml-8758380480 |
|Glass syringe with needles|36,18 PLN|https://a.co/d/9enmZi9 |

**In total: 309,77 PLN**

##### 8. CM4 board hardware

|Name|Price|URL|
|---|---| ---|
|CM4 IO board|203,00 PLN|https://allegro.pl/oferta/raspberry-pi-cm4io-plytka-rozszerzen-dla-rpi-cm4-10818286836 |
|Compute Module 4|798,00 PLN|https://allegro.pl/moje-allegro/zakupy/kupione/41408c8c-0ee9-37d4-8b16-9dd461e56e3a/oferta/583e3120-1e28-11ee-811e-0ddda74e84da |
|Adapter M.2 NVMe Key M do PCI-e x1 SSD|18,99 PLN|https://allegro.pl/oferta/adapter-m-2-nvme-key-m-do-pci-e-x1-ssd-8900869992 |
|MW Power ER36W12V 12V/3A Switching Power Supply|42 PLN|https://allegro.pl/oferta/zasilacz-impulsowy-mw-power-er36w12v-12v-3a-11616990085 |
|OLED display|18,49 PLN|https://allegro.pl/oferta/oled-bialy-wyswietlacz-0-96-i2c-3-5v-ssd1306-10726196790 |
|Black ball screw M3x8 allen socket 10pcs.|2,70 PLN|https://allegro.pl/oferta/sruba-kulista-czarna-m3x8-gniazdo-imbus-10szt-5315915867 |
|NVMe Crucial P3 PLUS 1TB M.2 PCIe|189,90 PLN|https://allegro.pl/oferta/dysk-ssd-crucial-p3-plus-m-2-pcie-gen4-nvme-1tb-14040203933 |

**In total: 1273,08**

##### Total price: 2499,46 PLN
**~620,92 USD 
~922,55 AUD
~565,15 EUR**

**Alternatively, to buy:**

Noctua fan PWM: 
https://amzn.to/35G14Vp

Another heat sink/radiator:
https://amzn.eu/d/40fHzrI

Thermopad:
https://allegro.pl/oferta/termopad-thermal-grizzly-minus-pad-8-120x20-13073555463

Thermal paste:
https://allegro.pl/oferta/pasta-termoprzewodzaca-grizzly-kryonaut-1g-gratis-12758644837

