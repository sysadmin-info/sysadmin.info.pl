---
title: ""SELinux polityka bezpieczeństwa
date: 2019-09-22T17:26:09+00:00 
description: "SELinux polityka bezpieczeństwa"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🎅
pinned: true
tags:
- selinux
series:
-
categories:
- IT Security
- Linux
image: images/feature2/color-palette.png
---
Nie jestem eskpertem od SELinux, ale gdy przeczytałem wiele poradników (ang. tutorial) na ten temat i widziałem dziesiątki porad, które wszystkie jednym głosem oznajmiały: wyłącz SELinux, ponieważ sprawia problemy, uznałem, że czas podważyć tę tezę i udowodnić, że SELinux może być prosty w obsłudze. 

W sytuacji, gdy jakaś usługa nie uruchamia się, z powodu problemów z uprawnieniami, tworząc plik ID procesu (PID), należy zaktualizować politykę SELinux w zakresie egzekwowania zasad w stosunku do aplikacji, która domyślnie nie jest uwzględniona w politykach tzw. SELinux’s Type Enforcement (TE). 

<!--more-->

Znany fakt na temat SELinux: „Docelowa polityka SELinuksa z Fedory jest obecnie dystrybuowana jako 1271 plików zawierających 118815 linii konfiguracyjnych. Zalecaną praktyką nie jest zmiana tych plików, ale raczej dodanie większej ilości konfiguracji w celu zmiany zachowania SELinux.”

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Po pierwsze, potrzebne jest narzędzie audit2why, aby wyjaśnić, co zostało zablokowane i dlaczego.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Aby sprawdzić w CentOS, Red Hat, czy Fedora, jaki pakiet dostarcza w/w narzędzie, wykonaj polecenie:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code>sudo yum -q provides audit2why
policycoreutils-python-2.5-17.1.el7.x86_64 : SELinux policy core python
                                           : utilities
Repo        : base
Matched from:
Filename    : /usr/bin/audit2allow</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Należy zainstalować pakiet policycoreutils-python (i zależności):

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># CentOS 7 &lt;br />sudo yum install policycoreutils-python &lt;br />&lt;br /># CentOS 8</code>sudo yum install policycoreutils-python-utils</pre>

Następnie przeprowadzić audyt przy pomocy narzędzia audit2why oraz dziennika audytu:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># sudo audit2why -i /var/log/audit/audit.log</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Wyświetlony zostanie odpowiedni komunikat, który zawiera przykładowo takie informacje:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code>scontext=system_u:system_r:nagios_t:s0
tcontext=system_u:system_r:nagios_t:s0
...
Was caused by:
  Missing type enforcement (TE) allow rule.
  You can use audit2allow to generate a loadable module to allow this access.</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Mała podpowiedź odnośnie pierwszych dwóch linii:

<!-- /wp:paragraph -->

<!-- wp:list -->

  * scontext = Source Context (kontekst źródłowy)
  * tcontext = Target Context (kontekst docelowy)
  * \_u:\_r:_t:s# = user:role:type:security level (użytkownik, rola, typ, poziom zabezpieczeń)

<!-- /wp:list -->

<!-- wp:paragraph -->

Kontekst źródłowy i docelowy są identyczne, więc wydaje mi się, że polecenie powinno być dopuszczone do działania. Ale spróbujmy audit2allow i zobaczmy, co nam powie:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># sudo audit2allow -i /var/log/audit/audit.log

#============= nagios_t ==============
allow nagios_t initrc_var_run_t:file { lock open read write };
allow nagios_t self:capability chown;</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Nie jest dla mnie jasne, na co zezwala pierwsza zasada: czy pozwala na dostęp typu nagios (nagios\_t) do wszystkich plików initrc\_var\_run\_t? Jeśli tak, to prawdopodobnie poziom uprawnień jest zbyt duży. Jak ostrzega strona man:

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Care must be exercised while acting on the output of this utility to  
ensure that the operations being permitted do not pose a security  
threat. Often it is better to define new domains and/or types, or make  
other structural changes to narrowly allow an optimal set of operations  
to succeed, as opposed to blindly implementing the sometimes broad  
changes recommended by this utility.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

W wolnym tłumaczeniu: należy zachować ostrożność i wiedzieć jak zachowuje się program oraz czy dozwolone operacje wyjścia nie stanowią zagrożenia. Często lepiej jest zdefiniować nowe domeny i/lub typy, lub stworzyć inne zmiany strukturalne, które w sposób ograniczony zezwolą na optymalny zestaw operacji, który pozwoli na działanie aplikacji, niż na ślepo implementować zbyt duży poziom uprawnień rekomendowany przez narzędzie audit2allow.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Dość nieprzyjazne zachowanie. Chociaż jeśli alternatywą jest całkowite wyłączenie SELinux, zbyt duży poziom uprawnień zaimplementowany w polityce SELinux nie jest najgorszą rzeczą na świecie.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Więc audit2allow zapewnił kilka zasad. Co teraz? Na szczęście strony audit2why i audit2allow man zawierają szczegóły, jak włączyć zasady do polityki SELinux. Po pierwsze, należy wygenerować nowy typ polityki:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># sudo audit2allow -i /var/log/audit/audit.log --module local &gt; local.te</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Obejmuje to pewne dodatkowe informacje oprócz domyślnego wyjścia:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># cat local.te

module local 1.0;

require {
        type nagios_t;
        type initrc_var_run_t;
        class capability chown;
        class file { lock open read write };
}

#============= nagios_t ==============
allow nagios_t initrc_var_run_t:file { lock open read write };
allow nagios_t self:capability chown;</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Następnie strona man mówi o:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># SELinux provides a policy devel environment under
# /usr/share/selinux/devel including all of the shipped
# interface files.
# You can create a te file and compile it by executing

$ sudo make -f /usr/share/selinux/devel/Makefile local.pp</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Jednak mój system nie miał katalogu /usr/share/selinux/devel:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># ls /usr/share/selinux/
packages  targeted</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Musiałem zainstalować pakiet policycoreutils-devel (i zależności):

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># sudo yum install policycoreutils-devel</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Teraz kompilacja pliku z polisami do pliku binarnego:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># sudo make -f /usr/share/selinux/devel/Makefile local.pp
Compiling targeted local module
/usr/bin/checkmodule:  loading policy configuration from tmp/local.tmp
/usr/bin/checkmodule:  policy configuration loaded
/usr/bin/checkmodule:  writing binary representation (version 17) to tmp/local.mod
Creating targeted local.pp policy package
rm tmp/local.mod.fc tmp/local.mod</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Następnie instalacja polityki z pliku pp, który został wcześniej wygenerowany, przy użyciu komendy make -f. Korzystam z narzędzia semodule.

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># sudo semodule -i local.pp</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Czy to rozwiązało problem?

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code># sudo systemctl start icinga
# sudo systemctl status icinga
● icinga.service - LSB: start and stop Icinga monitoring daemon
   Loaded: loaded (/etc/rc.d/init.d/icinga; bad; vendor preset: disabled)
   Active: active (running) since Tue 2017-11-14 22:35:23 EST; 6s ago
     Docs: man:systemd-sysv-generator(8)
  Process: 2661 ExecStop=/etc/rc.d/init.d/icinga stop (code=exited, status=0/SUCCESS)
  Process: 3838 ExecStart=/etc/rc.d/init.d/icinga start (code=exited, status=0/SUCCESS)
   CGroup: /system.slice/icinga.service
           └─3850 /usr/bin/icinga -d /etc/icinga/icinga.cfg

Nov 14 22:35:23 localhost.localdomain systemd[1]: Starting LSB: start and sto...
Nov 14 22:35:23 localhost.localdomain icinga[3838]: Running configuration che...
Nov 14 22:35:23 localhost.localdomain icinga[3838]: Icinga with PID  not runn...
Nov 14 22:35:23 localhost.localdomain icinga[3838]: Starting icinga: Starting...
Nov 14 22:35:23 localhost.localdomain systemd[1]: Started LSB: start and stop...
Nov 14 22:35:23 localhost.localdomain icinga[3850]: Finished daemonizing... (...
Nov 14 22:35:23 localhost.localdomain icinga[3850]: Event loop started...
Hint: Some lines were ellipsized, use -l to show in full.</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Zadziałało! Kwestie pozwoleń zostały rozwiązane bez uciekania się do wyłączenia SELinux.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Każdy problem tego typu w SELinux można rozwiązać poprzez analogię.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Na sam koniec warto zainstalować narzędzie sealert:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code>sudo yum install setroubleshoot setools</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

I sprawdzić stan alertów przy pomocy polecenia:

<!-- /wp:paragraph -->

<!-- wp:code -->

<pre class="wp-block-code"><code>sudo sealert -a /var/log/audit/audit.log</code></pre>

<!-- /wp:code -->

<!-- wp:paragraph -->

Źródło: https://osric.com/chris/accidental-developer/2017/11/selinux-audit2why-audit2allow-policy-files/

<!-- /wp:paragraph -->
