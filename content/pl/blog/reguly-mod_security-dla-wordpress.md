---
title: Reguły  mod_security dla WordPress
date: 2019-10-23T04:23:47+00:00
description: Reguły  mod_security dla WordPress
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
- IT Security
cover:
    image: images/2019-thumbs/mod_security.webp
---
Na tutorial odnośnie instalacji mod\_security dla apache, a być może kiedyś dla nginx przyjdzie czas. Dzisiaj wyjaśnię, jak samodzielnie dodawać sobie reguły w pliku whitelist.conf, aby mod\_security nie blokował funkcjonalności WordPress.

Po zalogowaniu przez ssh do serwera, wpisz komendę:

```bash
sudo tail -f /var/log/httpd/error_log
```

To jest log dla Apache w Centos określony w pliku httpd.conf, który możesz znaleźć poleceniem:

```bash
sudo find / -iname "httpd.conf"
```

W logu mam, co następuje:


```vim
[Wed Oct 23 06:01:58.888373 2019] [:error] [pid 29603] 
[client 162.158.102.200:59466] [client 111.111.111.100] 
ModSecurity: Access denied with code 403 (phase 2). 
Pattern match "([\\~\\!\\@\\#\\$\\\%\\^\\&\\\\(\\)\\-\\+\\
=\\{\\}\\[\\]\\|\\:\\;\"\\'\\\xc2\xb4\\\xe2\x80\x99\\\xe2\x80\x98
\\`\\<\\>].?){4,}" at ARGS:plugin. 
[file "/etc/httpd/modsecurity.d/activated_rules/
modsecurity_crs_41_sql_injection_attacks.conf"] 
[line "159"] [id "981173"] [rev "2"] 
[msg "Restricted SQL Character Anomaly Detection Alert
- Total # of special characters exceeded"] 
[data "Matched Data: - found within ARGS:plugin: 
wp-fail2ban-addon-gravity-forms"] 
[ver "OWASP_CRS/2.2.9"] [maturity "9"] [accuracy "8"] 
[tag "OWASP_CRS/WEB_ATTACK/SQL_INJECTION"] 
[hostname "example.com"] 
[uri "/wp-admin/plugin-install.php"] 
[unique_id "Xa-QtpgasGvRM2@D2yl0FAAAAAU"], 
referer: https://example.com/wp-admin/admin.php?page=wp-fail2ban-addons
```

No i co dalej? Dość prosto. Spójrz na numer id wewnątrz nawiasów kwadratowych. Edytujesz plik (jeśli go nie ma, to stwórz poleceniem touch /etc/httpd/conf.d/whitelist.conf).

```bash
sudo vi /etc/httpd/conf.d/whitelist.conf
```

Wklej to:

```vim
<LocationMatch "/wp-admin/plugin-install.php">
  SecRuleRemoveByID 981173
</LocationMatch>
```

Prawda, że proste? 

Poniżej gotowiec wykonany przeze mnie, który działa. Więcej błędów ze strony mod_security nie mam w logach.

```vim
<LocationMatch "/logowanie">
SecRuleRemoveById 950109
</LocationMatch>

<locationmatch "/wp-comments-post.php">
  SecRuleRemoveById 300013
  SecRuleRemoveById 300015
  SecRuleRemoveById 300016
  SecRuleRemoveById 300017
</locationmatch>

<LocationMatch "/wp-admin/edit-comments.php">
  SecRuleRemoveById 2000149
</LocationMatch>

<LocationMatch "/wp-admin/plugin-install.php">
  SecRuleRemoveByID 981173
</LocationMatch>

<LocationMatch "/wp-admin/post.php">
  SecRuleRemoveById 300013 300015 300016 300017 950907 950005 950006 960008 960011 960904 959006 981173
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-admin/admin-ajax.php">
  SecRuleRemoveById 300015 300016 300017 950907 950005 950006 960008 960011 960904 959006 981173
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-admin/page.php">
  SecRuleRemoveById 300015 300016 300017 950907 950005 950006 960008 960011 960904
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-admin/options.php">
  SecRuleRemoveById 300015 300016 300017 950907 950005 950006 960008 960011 960904 959006
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-admin/theme-editor.php">
  SecRuleRemoveById 300015 300016 300017 950907 950005 950006 960008 960011 960904 959006
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-content/plugins/">
  SecRuleRemoveById 300015 340151 1234234 340153 1234234 300016 300017 950907 950005 950006 960008 960011 960904 959006
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-includes/">
  SecRuleRemoveById 960010 960012 950006 959006
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-content/themes/">
  SecRuleRemoveById 340151 340153 1234234 950006 959006
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-content/plugins/sociable/">
  SecRuleRemoveById 960010 960012 950006 959006
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-content/plugins/wp-recaptcha/">
  SecRuleRemoveById 340151 340153 1234234 300015 300016 300017 950907 950005 950006 960008 960011 960904 959006
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-content/plugins/fancybox-for-wordpress/">
  SecRuleRemoveById 960010 960012 950006 959006
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-includes/js/tinymce/plugins/spellchecker/rpc.php">
  SecRuleRemoveById 960010
  SecRuleRemoveById 960012
  SecRuleRemoveById 959006
</LocationMatch>

<LocationMatch "/wp-content/themes/YOURTHEMEFOLDER/thumb.php">
  SecRuleRemoveById 340151 340153 1234234 300015 300016 300017 950907 950005 950006 960008 960011 960904 959006
  SecRuleRemoveById phpids-17
  SecRuleRemoveById phpids-20
  SecRuleRemoveById phpids-21
  SecRuleRemoveById phpids-30
  SecRuleRemoveById phpids-61
</LocationMatch>

<LocationMatch "/wp-cron.php">
SecRuleRemoveById 960015
</LocationMatch>

<LocationMatch "/feed">
SecRuleRemoveById 960015
</LocationMatch>

<LocationMatch "/category/feed">
SecRuleRemoveById 960015
</LocationMatch>
```

Na koniec restart apache.

```bash
systemctl restart httpd php-fpm
```

Gdyby dalej mod_security blokował cokolwiek, to wiesz, jak sobie poradzić.