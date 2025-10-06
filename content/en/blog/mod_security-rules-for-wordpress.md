---
title: Mod_security rules for WordPress
date: 2019-10-23T04:25:36+00:00
description: Mod_security rules for WordPress
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
- IT security
cover:
    image: images/2019-thumbs/mod_security.webp
---
There will be time for a tutorial on how to install mod_security for apache, and perhaps someday for nginx. Today I will explain how to add rules for yourself in the whitelist.conf file so that mod_security does not block WordPress functionality.

After logging in via ssh to the server, type in the command:

```bash
sudo tail -f /var/log/httpd/error_log
```

This is the log for Apache in Centos specified in the httpd.conf file, which you can find with the command:

```bash
sudo find / -iname "httpd.conf"
```

I have the following in my log:


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

So what happens next? Quite simply. Take a look at the id number inside square brackets. You are editing a file (if there is no file, create it with touch /etc/httpd/conf.d/whitelist.conf).

```bash
sudo vi /etc/httpd/conf.d/whitelist.conf
```

Paste it:

```vim 
<LocationMatch "/wp-admin/plugin-install.php">
  SecRuleRemoveByID 981173
</LocationMatch>
```

Isn&#8217;t it simple?

Below you can see a ready-made one made by me that works. More bugs from mod_security I don&#8217;t have in my logs.

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

Finally restart Apache.

```bash
systemctl restart httpd php-fpm
```

If mod_security is still blocking anything, you know how to handle it.