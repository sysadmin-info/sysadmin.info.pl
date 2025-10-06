---
title: Jak włączyć szyfrowanie full strict w Cloudflare z użyciem Let’s Encrypt
date: 2020-10-03T15:58:03+00:00
description: Jak włączyć szyfrowanie full strict w Cloudflare z użyciem Let’s Encrypt
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
- mikr.us
- Linux
cover:
    image: images/2020-thumbs/cloudflare.webp
---
Podstawa instalacji i konfiguracji Cloudflare opisana jest tutaj: <https://sysadmin.info.pl/pl/blog/instalacja-serwera-web-na-mikr-us-z-uzyciem-mariadb-i-silnikiem-myisam/>

W tym tutorial zajmiemy się konfiguracją połączenia full strict pomiędzy Twoim serwerem a Cloudflare. 

Do potrzeb tego tutoriala oraz testu w pierwszej kolejności na Cloudflare należy wyłączyć tę pomarańczową chmurkę (trzeba w nią kliknąć) w sekcji DNS swojej domeny, tak aby była ona szara i zapisac zmiany za pomocą przycisku save. W ten sposób sprawdzisz, czy certyfikat Let&#8217;s Encrpt został poprawnie zainstalowany i każda przeglądarka pokazuje, że Twoja strona używa SSL i certyfikatu właśnie od Let&#8217;s Encrypt. 


![Cloudflare DNS Management](/images/2020/Cloudflare_DNS_Management.webp "Cloudflare DNS Management")
<figcaption>Cloudflare DNS Management</figcaption>

Zamiast rekordu A na ww można mieć rekord CNAME. Ja po prostu mam vhost na www, który robi redirect. Zamiast nazwy domeny można dać symbol @ w miejscu celu (target).

![CNAME](/images/2020/CNAME.webp "CNAME")
<figcaption>CNAME</figcaption>

Trzeba kliknąć w kłódkę obok adresu strony &#8211; w pasku adresu i wybrać opcję, aby pokazało certyfikat. Tak, wiem, to są podstawy, ale w ten sposób to sprawdzisz.

![Certyfikat Let's Encrypt](/images/2020/Lets_Encrypt_Certyfikat.webp "Certyfikat Let's Encrypt")
<figcaption>Certyfikat Let's Encrypt</figcaption>

Jeśli strona pokaże, że działa certyfikat od Let&#8217;s Encrypt, to świetnie.

Teraz zajmiemy się właściwą konfiguracją.

Musisz zalogować się do swojego serwera przez ssh i wejść do katalogu /etc/letsencrypt/csr , a następnie wylistować zawartość katalogu.

```bash
cd /etc/letsencrypt/csr
ls
```

Zobaczysz w nim listę plików przykładową jak poniżej. Certbot nadaje kolejne numery przy odświeżaniu certyfikatu dla strony.

```vim
0000_csr-certbot.pem
0001_csr-certbot.pem
0002_csr-certbot.pem
```

Za pomocą komendy ll (dwie litery l) sprawdzisz który plik ma najnowszą datę. Na logikę będzie to ten z najwyższym numerem. Wyświetlasz jego zawartość komendą cat

lub możesz sobie sprawdzić to komendą:

```bash
ls -alhtr
```

```bash
cat 0002_csr-certbot.pem
```

Skopiuj całą zawartość tego pliku, włącznie z liniami begin certificate request i end certificate request.

Wejdź do sekcji SSL/TLS -> Origin server na Cloudflare.

Kliknij w przycisk create certificate, zaznacz, że masz własny cert (I have my own private key and CSR). 

Skopiowaną wcześniej zawartość pliku pem wklej w to puste pole poniżej opisane jako paste certificate signing request i ustaw ważność certyfikatu (certificate validity) na 90 dni, ponieważ tyle samo daje Let&#8217;s Encrypt. 

Najlepiej po wygenerowaniu certyfikatu SSL dla strony przy pomocy certbot od razu ten plik CSR pem skopiować i wkleić w tej sekcji Cloudflare. 

Po wklejeniu zawartości kliknij next. Cloudflare wygeneruje klucz prywatny (private key). 

Skopiuj zawartość tego klucza prywatnego (private key) i wklej go przykładowo do pliku /etc/pki/tls/certs/origin-pull-ca.pem. 

```bash
sudo vi /etc/pki/tls/certs/origin-pull-ca.pem
```

Kliknij insert i naciśnij prawym myszki w celu wklejenia zawartości skopiowanej wcześniej do schowka.

Następnie nciśnij Esc na klawiaturze i wpisz po sobie : a potem x, aby zapisać plik i wyjść do terminala.

W następnej kolejności wykonaj poniższe komendy, aby ustawić właściciela pliku jako root oraz nadać mu odpowiednie uprawnienia.

```bash
sudo chown root:root /etc/pki/tls/certs/origin-pull-ca.pem
sudo chmod 644 /etc/pki/tls/certs/origin-pull-ca.pem
```

W Cloudflare domeny takie, jak zaproponuje zostaw. 

Poniżej w sekcji SSL/TLS ->Origin server znajduje się opcja Authenticated Origin Pulls, musisz ją właczyć suwakiem na zielono , na opcję On.

Została nam ostatnia kwestia. 

Tu opiszę mój przypadek dla CentOS 7 i Apache, ale masz opis też tutaj dla nginx:

<a href="https://support.cloudflare.com/hc/en-us/articles/204899617-Authenticated-Origin-Pulls" target="_blank" rel="noreferrer noopener">https://support.cloudflare.com/hc/en-us/articles/204899617-Authenticated-Origin-Pulls</a>

W CentOS należy wejsć do katalogu: /etc/httpd/conf.d i dokonać edycji pliku ssl.con.

```bash
sudo vi /etc/httpd/conf.d/ssl.conf
```

Należy ustawić wartości takie, jakie są podane pod powyższym adresem Cloudflare. 

Należy usunąć hash oraz zmienić 10 na 1 dla opcji: SSLVerifyDepth

Ustawić wartość na require dla opcji SSLVerifyClient

A następnie podać ścieżkę do pliku z prywatynym kluczem wygenerowanym przez Cloudlfare dla opcji SSLCACertificateFile

To ma wyglądać tak przykładowo:

```vim
SSLVerifyClient require
SSLVerifyDepth 1
SSLCACertificateFile /etc/pki/tls/certs/origin-pull-ca.pem
```

Po zapisaniu zmian w tym pliku należy wykonać restart usługi Apache/Nginx przy pomocy polecenia:

```bash
sudo systemctl restart httpd
```

Potem w sekcji DNS włącz pomarańczową chmurkę i ustaw szyfrowanie na full strict w sekcji SSL/TLS. W ten sposób zostało włączone szyfrowanie między serwerem Cloudflare i twoim.

Jedynym problemem jest powtarzanie tej operacji co90 dni, gdy certbot odświezy certyfikat od Let&#8217;s Encrypt. 

Druga opcja to ta z Cloudflare. Generujesz sobie certyfikat od Cloudflare, ale tam wtedy używasz ich pem pliku. Klucz prywatny i publiczny musisz wrzucić w ten plik ssl o którym wspomniałem. Tak wiem, nieco skomplikowane. Ale plus jest taki, że masz certyfikat na 15 lat do kumunikacji między serwerem Cloudflare i twoim. Jeśli chcesz, żebym opisał dokładnie tę drugą metodę, daj mi znać.

Przydatne linki:

* <a href="https://community.cloudflare.com/t/lets-encrypt-and-cloudflare-how-to-set/66442/2" target="_blank" rel="noreferrer noopener">https://community.cloudflare.com/t/lets-encrypt-and-cloudflare-how-to-set/66442/2</a>
* <a href="https://support.cloudflare.com/hc/en-us/articles/204899617-Authenticated-Origin-Pulls" target="_blank" rel="noreferrer noopener">https://support.cloudflare.com/hc/en-us/articles/204899617-Authenticated-Origin-Pulls</a>
* <a href="https://www.leowkahman.com/2016/03/10/apache-cloudflare-authenticated-origin-pulls-configuration/" target="_blank" rel="noreferrer noopener">https://www.leowkahman.com/2016/03/10/apache-cloudflare-authenticated-origin-pulls-configuration/</a>