---
title: Measuring system i/o
date: 2019-12-23T16:59:15+00:00
description: Measuring system i/o
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
- Linux
cover:
    image: images/2019-thumbs/linux-cli.webp
---
To monitor system behavior, you need to start by creating a baseline that represents normal system behavior. You can do this using a tool like the sar command. You can then use tools such as netstat, iostat, lsof, w and uptime to monitor system behavior, comparing the results to the baseline to determine whether the system is experiencing problems.

**netstat**

```
-g // to display information about IPv4 and IPv6 multicast group membership
-i // to return information,including specific property values, for all connected network devices
-r // to display information about kernel routing tables
-s // to list a summary of statistics for each networking protocol
-p // to list which processes are using which ports
-t // to return details only for connections that use TCP
```

Note: netstat -r has been replaced by route -e

**iostat**  
to monitor the performance of a system&#8217;s input and output,or I/O devices,as well as CPU utilization. The command measures the time of which a device is in operation and compares this to its average transfer rate.

The first time the command runs, it returns statistics for the period since the system was started up. Each subsequent report contains statistics for the period since the previous report was created.

When iostat is executed with no arguments, it returns CPU statistics such as the percentages of CPU capacity used by user and by system processes, and the percentage of time that the CPU is idle. It also returns statistics about the disk partition attached to the system, such as transfers per second and kilobytes read and written.

```
-c // to display CPU utilization report
-d // to display a device utilization report
-z // to omit information for devices that were inactive when the command was executed
-p // to specify a device to report on
count - specifies the number of times to run the command
interval - specifies the number of seconds to wait between reports.
```

Example:
```
iostat -p sda
```

**lsof**  
to list the files and directories that each user who&#8217;s recently logged on has open.

```
-i // to return files whose Internet addresses match a specified port or port range, service name, or IP address
-u // to specify a user or user ID for which you want to return a list of open files
-p // to select or remove a specified process ID from the returned list
-F // to produce output for manipulation by another program
+d // to search all open instances of a named directory and its top-level files and directories for open files.
```

Example:
```
lsof -u user1
```

**w**  
returns details of users who are logged on to a system and of the processes they are running.

```
-h // to prevent the header from being displayed
-u // to ignore usernames when determining process and CPU times
-s // to use a short format rather than displaying all the information
-f // to display the from field
-V // to display version information
-user // to display information only for a specified user
```

**uptime**  
The uptime command provides information about how long a system has been running since its last restart.

Like the w command it also lists the number of users logged on, and the load averages from one, five, and 15 minutes ago.

```
-V // to display version information
```

#### Monitor Resource Usage

  * MRTG (Multi Router Traffic Grapher)
  * Cacti
  * Nagios
  * collectd daemon &#8211; requires Apache or Nginx

collectd daemon usage:
```
cp -r /contrib/collection3 /var/www/html
cd /var/www/html/collection3/
```
