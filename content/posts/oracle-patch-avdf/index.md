---
date: '2025-09-24T13:39:51+07:00'
draft: false
title: 'Upgrade In-place AVDF 20.12 to 20.15'
tags:
- database
- oracledb
- avdf
---

## Summary

This runbook provides a clear and ordered sequence for upgrading **Oracle Audit Vault & Database Firewall (AVDF)** from **20.12 to 20.15**. It covers:

* Preparing the environment and downloads.
* Performing pre-checks.
* Upgrading AVS in HA mode (standby first, then primary).
* Post-upgrade steps for AVS including password hardening.
* Verifying agent upgrades.
* Upgrading Database Firewall nodes, handling certificates, and re-registering if needed.
* Applying post-upgrade hardening patch and optional kernel cleanup.
* Final validation with pre/post comparisons and useful monitoring commands.

Following this guide ensures minimal downtime, verified HA functionality, and secured configuration after the upgrade.


## 1. Inventory

* AVS01 (HA Primary): 192.168.xxx.121
* AVS02 (HA Standby): 192.168.xxx.120
* DBFW01: 192.168.xxx.178
* DBFW02: 192.168.xxx.179
* DB Target (Oracle): 192.168.xxx.232

## 2. Download

* ISO Patch 38322746 — AVDF 20.15 ISO
* Patch 35303191 — Post Upgrade Agent User Security Hardening
* Doc ID 2458154.1 for Kernel Cleanup (optional)

## 3. Pre-checks Before Upgrade

* Capture current version of:

  * AVS
  * DBFW
  * HA status
  * Agent versions (audit & host monitoring)
  * Dashboard health

## 4. Upgrade AVS (HA)

### 4.1 Upgrade Standby AVS

1. Run pre-upgrade RPM on standby.
2. Transfer 20.15 ISO to appliance.
3. Run update script.
4. Reboot when requested.

Monitor upgrade process:

```bash
watch -n 5 "/opt/avdf/bin/privmigutl --status"
/opt/avdf/bin/privmigutl --history
tail -f /var/log/messages
tail -f /var/log/debug
```

### 4.2 Stop All Audit Trails on Primary

* AVS Console → Targets → Audit Trails → Stop all audit trails.

### 4.3 Upgrade Primary AVS

1. Run pre-upgrade RPM on primary.
2. Transfer ISO to appliance.
3. Run update script.
4. Reboot when requested.

## 5. Post-upgrade AVS (HA)

* Login to web console → verify version.
* Change default/old passwords (admin, audit).
* Confirm HA observer status.

## 6. Verify Agents

* Confirm Audit Vault Agent updated.
* Confirm Host Monitoring Agent updated.
* Verify logs and connectivity.

## 7. Upgrade DBFW (Primary Node)

### 7.1 Stop Monitoring Points

* AVS Console → Database Firewalls → Database Firewall Monitoring → Stop all monitoring points.

### 7.2 Run Pre-upgrade RPM on DBFW Node

### 7.3 Transfer ISO to DBFW Node and Run Update Script

Monitor upgrade process:

```bash
watch -n 5 "/opt/avdf/bin/privmigutl --status"
/opt/avdf/bin/privmigutl --history
tail -f /var/log/messages
tail -f /var/log/debug
```

### 7.4 Re-register DBFW (if certificate error)

* AVS Console → Database Firewalls → Reset Firewall.
* Start monitoring points and verify status UP.

## 8. Post-upgrade Hardening

1. Apply patch 35303191 (Agent User Security Hardening).
2. (Optional) Run kernel-cleanup.rb (Doc ID 2458154.1).
3. Verify HA Observer status.
4. Start audit trails.

## 9. Post-checks After Upgrade

* Confirm versions:

  * AVS
  * DBFW
  * HA status
  * Agent versions
  * Dashboard health

* Validate DBFW registration and monitoring points status UP.

## 10. Elapsed Time (Example)

* Start: Sep 23 06:48:51
* Finish: Sep 23 10:23:46
* Elapsed: 3h 34m 55s

## 11. Useful Commands

```bash
/opt/avdf/bin/privmigutl --status
/opt/avdf/bin/privmigutl --history
tail -f /var/log/messages
tail -f /var/log/debug
```

## 12. References

* Patching Oracle Audit Vault and Database Firewall Release 20 [Link Here](https://docs.oracle.com/en/database/oracle/audit-vault-database-firewall/20/sigig/patch.html#GUID-02CF1C94-134F-459A-8A15-CF7A9864DE9C)
*  Unlocking and Locking the AVSYS User [Link Here](https://docs.oracle.com/en/database/oracle/audit-vault-database-firewall/20/sigad/user_accounts.html#GUID-648E1EB2-1324-4413-B77B-67BC4BDC8228)


## PDF Implementation
{{< embed-pdf url="./upgrade_avdf.pdf" >}}