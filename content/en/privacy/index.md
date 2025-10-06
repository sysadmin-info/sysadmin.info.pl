---
title: "Privacy policy"
date: 2019-09-21T19:24:59+00:00
description: "Privacy policy"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
tags:
-
series:
-
categories:
- general
cover:
  image: images/2019-thumbs/privacy.webp
---

#### Privacy Policy

This site (sysadmin.info.pl) is a static website built with Hugo. We do **not** run user accounts, do **not** offer registration or a newsletter, and do **not** collect email addresses on this site. We do not process, share, or use any user data for marketing. These constraints bolster privacy and reduce data surface.

#### Comments (utteranc.es / GitHub)

Comments are provided via **utteranc.es**, which stores each comment as a **GitHub Issue** in a repository. Authentication and identities are handled by **GitHub**. This site does not receive your email, password, or tokens and does not manage comment profiles. To edit or remove your comment, use your GitHub tools.

It’s important to note this division of responsibilities: GitHub is the controller for comment data; sysadmin.info.pl embeds the discussion widget only.

#### GDPR & Hugo privacy settings

We rely on Hugo’s privacy settings to reduce tracking:

```
privacy:
  disqus:
    disable: true
  googleAnalytics:
    anonymizeIP: true
    disable: true
    respectDoNotTrack: true
    useSessionStorage: true
  instagram:
    disable: true
    simple: true
  x:
    disable: true
    enableDNT: true
    simple: true
  vimeo:
    disable: true
    enableDNT: true
    simple: true
  youtube:
    disable: false
    privacyEnhanced: false
```

It’s important to note: `youtube.privacyEnhanced: true` uses `youtube-nocookie.com`, which helps bolster privacy for embedded videos.

#### What may be logged when you visit

As with any web service, non-personal technical logs may be recorded by our hosting/CDN for security and operations, such as:

- browser and version
- language preferences
- referrer page
- date/time of the request
- source IP address

**Purpose & legal basis:** security, abuse prevention, performance (legitimate interests). We do not attempt to identify individual users and we do not profile visitors. Logs are retained only as long as needed to operate and secure the site, then removed or aggregated. If an attack or abuse occurs, temporary IP blocking can be applied.

#### Cookies

- **First-party:** the site itself does not set marketing cookies. Hugo does not add tracking cookies by default.
- **Third-party embeds:** viewing the comments widget (utteranc.es/GitHub iframe) or playing embedded YouTube may set cookies or use local storage under those providers’ policies. Manage them in your browser settings or via the providers’ privacy pages.

This nuance matters: third-party cookies and storage are outside sysadmin.info.pl’s control.

#### Personal data

We do not intentionally collect personal data on this site. If you comment via GitHub/utteranc.es, your comment content and profile are processed by **GitHub**.

#### External links and user content

Opinions in comments belong to their authors. We are not responsible for third-party content, policies, or availability. External links may change without notice.

#### Copyright

Original materials on sysadmin.info.pl are protected by their authors’ copyrights. Copying or sharing requires consent from the author and the site administrator.

#### Your rights

Because we don’t host accounts or newsletters, typical GDPR requests usually relate to data held by third parties (e.g., GitHub for comments, YouTube for playback). Contact those providers to exercise your rights regarding their services. If you believe we hold your personal data beyond transient logs, contact us and we will unearth and delete it where applicable.

#### Contact

For privacy questions specifically about sysadmin.info.pl (not GitHub/YouTube), use the comments section on the site below.