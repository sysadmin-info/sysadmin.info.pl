---
title: SELinux security policy
date: 2019-09-22T17:27:50+00:00
description: SELinux security policy
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
- Linux
cover:
    image: images/2019-thumbs/selinux.webp
---
I&#8217;m not an SELinux expert, but when I read many tutorials on the subject and saw dozens of tips that all said in one voice: turn off SELinux, because it causes problems, I thought it was time to challenge this thesis and prove that SELinux could be easy to use. 

In a situation where a service does not run because of problems with permissions, creating a process ID (PID) file, you should update SELinux&#8217;s policy on enforcing the rules against the application, which by default is not included in SELinux&#8217;s Type Enforcement (TE) policies.

A known fact about SELinux: &#8222;The target policy of SELinux of Fedora is currently distributed as 1271 files containing 118815 configuration lines. The recommended practice is not to change these files, but rather to add more configurations to change the behavior of SELinux.&#8221;

First of all, you need the audit2why tool to explain what has been blocked and why.

To check in CentOS, Red Hat, whether Fedora, what package it provides, follow the command:

```bash
sudo yum -q provides audit2why policycoreutils-python-2.5-17.1.el7.x86_64 : SELinux policy core python                                             : utilities  
Repo        : base  
Matched from:  Filename    : /usr/bin/audit2allow
```

You need to install the policycoreutils-python package (and dependencies):

{{< tabs CentOS_7 CentOS_8 >}}
  {{< tab >}}

  ### CentOS 7 section

  ```bash
  sudo yum install policycoreutils-python
  ```

  {{< /tab >}}
  {{< tab >}}

  ### CentOS 8 section

  ```bash
  sudo yum install policycoreutils-python-utils
  ```
  {{< /tab >}}
{{< /tabs >}}

Subsequently, perform the audit using the audit2why tool and the audit log:

```bash
sudo audit2why -i /var/log/audit/audit.log
```

A corresponding message will be displayed, which contains, for example, this information:

```bash
scontext=system_u:system_r:nagios_t:s0
tcontext=system_u:system_r:nagios_t:s0
...
Was caused by:
  Missing type enforcement (TE) allow rule.
  You can use audit2allow to generate a loadable module to allow this access.
```

A little hint about the first two lines:

```bash
  * scontext = Source Context
  * tcontext = Target Context 
  * \_u:\_r:_t:s# = user:role:type:security level
```

The source and target contexts are identical, so it seems to me that the command should be allowed to work. But let&#8217;s try audit2allow and see what it says:

```bash
sudo audit2allow -i /var/log/audit/audit.log

#============= nagios_t ==============
allow nagios_t initrc_var_run_t:file { lock open read write };
allow nagios_t self:capability chown;
```

It&#8217;s not clear to me what the first rule allows: does it allow naked (nagios\_t) access to all initrc\_var\_run\_t files? If so, it&#8217;s probably too high a level of permission. As the man page warns:

> Care must be exercised while acting on the output of this utility to  
> ensure that the operations being permitted do not pose a security  
> threat. Often it is better to define new domains and/or types, or make  
> other structural changes to narrowly allow an optimal set of operations  
> to succeed, as opposed to blindly implementing the sometimes broad  
> changes recommended by this utility.


In Free Translation: Be careful and know how the program behaves and whether the allowed output operations do not pose a threat. It is often better to define new domains and/or types, or to create other structural changes that allow only a limited set of operations that will allow the application to run, than to blindly implement too high a level of permissions recommended by the audit2allow tool.

Pretty unfriendly behavior. Although if the alternative is to completely disable SELinux, too much power implemented in the SELinux policy is not the worst thing in the world.

So audit2allow provided some rules. What now? Fortunately, the audit2why and audit2allow man pages contain details on how to incorporate the principles into the SELinux policy. First of all, you should generate a new type of policy:

```bash
sudo audit2allow -i /var/log/audit/audit.log --module local > local.te
```

This includes some additional information in addition to the default output:

```bash
# cat local.te

module local 1.0;

require {
        type nagios_t;
        type initrc_var_run_t;
        class capability chown;
        class file { lock open read write };
}

#============= nagios_t ==============
allow nagios_t initrc_var_run_t:file { lock open read write };
allow nagios_t self:capability chown;
```

The next page of the man says about:

```bash
# SELinux provides a policy devel environment under
# /usr/share/selinux/devel including all of the shipped
# interface files.
# You can create a te file and compile it by executing

$ sudo make -f /usr/share/selinux/devel/Makefile local.pp
```

But my system didn&#8217;t have a directory /usr/share/selinux/devel:

```bash
# ls /usr/share/selinux/
packages  targeted
```

I had to install the policycoreutils-devel package and dependencies.

```bash
sudo yum install policycoreutils-devel
```

Now compile a policy file to a binary file:

```bash
sudo make -f /usr/share/selinux/devel/Makefile local.pp
Compiling targeted local module
/usr/bin/checkmodule:  loading policy configuration from tmp/local.tmp
/usr/bin/checkmodule:  policy configuration loaded
/usr/bin/checkmodule:  writing binary representation (version 17) to tmp/local.mod
Creating targeted local.pp policy package
rm tmp/local.mod.fc tmp/local.mod
```

Then install the policy from the pp file that was previously generated using the make -f command. I use the semodule tool.

```bash
sudo semodule -i local.pp
```

Did it solve the problem?

```bash
sudo systemctl start icinga
sudo systemctl status icinga
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
Hint: Some lines were ellipsized, use -l to show in full.
```

It worked! The licensing issues were resolved without resorting to the exclusion of SELinux. Every problem of this type in SELinux can be solved by analogy. At the very end it is worth to install the sealert tool:

```bash
sudo yum install setroubleshoot setools
```

And check the status of alerts with a command:

```bash
sudo sealert -a /var/log/audit/audit.log
```

Source: [SELinux audit2why audit2allow policy files](https://osric.com/chris/accidental-developer/2017/11/selinux-audit2why-audit2allow-policy-files/) 
