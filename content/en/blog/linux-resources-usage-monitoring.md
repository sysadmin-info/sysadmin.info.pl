---
title: Linux Resources usage monitoring
date: 2019-12-23T16:12:49+00:00
description: Linux Resources usage monitoring
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
Capacity planning involves predicting what the capacity requirements for a system will be in future, and planning how to meet these requirements. Monitoring system resource use is important for capacity planning, because it establishes whether existing resource use is approaching capacity limits.

In Linux you can use a range of tools to monitor system resource use. These include the top, ps, pstree, vmstat, sar and free commands.

**top**

```
-a // sort processes by allocated memory
-b // batch mode -> send output to a file or another program
-n // specify the number of times that top should run before exiting
-p // pid or ID
```

**ps**  
Unlike for the top command, output from the ps command does not refresh dynamically.

```
ps aux
-a // list processes being run by all users instead of just by the current user 
-u // detailed information about each process
-x // include processes with no controlling terminal such as daemons.
```

**pstree**  
Information is formatted in a tree structure; child threads of processes are listed underneath the parent process and are enclosed in curly brackets 

**sar**  
The System Activity Report collects system activity statistics, by default every 10 minutes. You can use the data it returns to create a baseline measurement of system performance, for comparing to the results of later monitoring.

```
-b // display transfer rate and input and output, or I/O, statistics
-r // display statistics for used memory
-W // display swapping statistics
-u display CPU usage statistics
[interval in seconds] [count which specifies the number of lines that must be returned in the output]
```

**vmstat**  
Command to display virtual memory statistics, which are useful for checking if there is sufficient memory available for user applications.

With no options,the vmstat command returns a single report that contains average values, based on statistics gathered since the last time the system was booted up.

You can use the vmstat command with various options. You can also specify a delay in seconds that must occur before a new set of statistics is reported, and a count value to specify the number of reports that the command must generate.

Syntax: 
```
vmstat &#91;options] delay count
```

Example:
```
vmstat -n 2 5
```

In this example, the n option specifies that the header information should display only once. The delay value is 2, so reports will be generated two seconds apart, and the count value is 5, so the command will generate a total of five reports.

If a delay is set but no count value is specified, the command will continue to run until it is killed.

```
-a // inactive and active page statistics
-m // to print slabinfo, which is information about memory usage at the slab level. Linux kernels use slab pools to manage memory above the page level. 
-s // to print a virtual memory table
-V // to display version information
```

**free**  
You use the free command to obtain real-time statistics about how much memory is available &#8211; and how much is currently being used &#8211; on a system.

With no options, the free command returns the total physical and virtual memory that is in use and that is currently free, as well as the amount of memory that is in kernel buffers or that is cached. All the statistics are expressed in kilobytes.

Note that the shared column is now obsolete and should be ignored.

```
-b // to display statistics in bytes
-k // to display statistics in kilobytes
-m // to display statistics in megabytes
-g // to display statistics in gigabytes
-o // to prevent the -/+ buffer/cache line from being displayed
-l // to display detailed high and low memory statistics
-s // use the option followed by a number of seconds to specify how often the statistics should be updated
-t // to display a summary line that contains totals
-V // to display version information
```
