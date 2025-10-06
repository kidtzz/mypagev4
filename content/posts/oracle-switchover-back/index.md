---
date: '2025-10-06T14:47:16+07:00'
draft: false
title: 'Oracle Data Guard Switchover and Switchback Manual'
tags:
- database
- oracledb
- odg
---

## Summary

**Switchover:**  
Switchover in Oracle Data Guard is a planned role transition between primary and standby databases without data loss or downtime. It is used for maintenance, testing, or planned failover. After switchover, the standby becomes the primary and the original primary becomes the standby.

**Switchback:**  
Switchback is the reverse process of switchover, restoring the original primary as the primary database. It involves coordinated role changes ensuring no data loss and maintaining synchronization between databases.

---

## 1. Switchover

### Steps and Commands

- **Check current database status:**  
  ```sql
  select name, open_mode, db_unique_name, database_role from v$database;
  ```

- **Check for gaps on primary and standby:**  
  On Primary:  
  ```sql
  select STATUS, GAP_STATUS from V$ARCHIVE_DEST_STATUS where DEST_ID = 2;
  ```
  On Standby:  
  ```sql
  select NAME, VALUE, DATUM_TIME from V$DATAGUARD_STATS;
  ```

- **Prepare switchover on primary:**  
  ```sql
  select SWITCHOVER_STATUS from V$DATABASE;
  alter database commit to switchover to physical standby with session shutdown;
  startup mount;
  select name, open_mode, db_unique_name, database_role from v$database;
  ```

- **Convert standby to primary:**  
  On Standby:  
  ```sql
  select SWITCHOVER_STATUS from V$DATABASE;
  alter database commit to switchover to primary with session shutdown;
  alter database open;
  ```

- **Start Managed Recovery Process (MRP) on new standby:**  
  ```sql
  alter database recover managed standby database disconnect;
  ```

- **Switch logfile on primary:**  
  ```sql
  ALTER SYSTEM SWITCH LOGFILE;
  ```

- **After switchover — configure `log_archive_dest_2` on new primary:**  
  ```sql
  alter system set log_archive_dest_2='service=dbrest async valid_for=(online_logfiles,primary_role) db_unique_name=dbrest' scope=both;
  ```

### Notes for Switchover

- Ensure no gaps exist between primary and standby before switchover.  
- Always check switchover status using `select SWITCHOVER_STATUS from V$DATABASE;`  
- Use session shutdown to properly execute the switchover command.  
- Start MRP on the new standby to enable automatic recovery.  
- Update `log_archive_dest_2` on the new primary for proper log shipping.

---

## 2. Switchback

### Environments

- Primary: `oradb`  
- Standby: `drdb`

### Steps and Commands

- **On New Primary (drdb):**  
  ```sql
  select switchover_status from v$database;
  alter database commit to switchover to physical standby with session shutdown;
  startup mount;
  select name, open_mode, database_role, db_unique_name from v$database;
  ```

- **On Standby (oradb):**  
  ```sql
  select switchover_status from v$database;
  alter database commit to switchover to primary with session shutdown;
  alter database open;
  select name, open_mode, database_role, db_unique_name from v$database;
  ```

- **Back to Standby (drdb):**  
  ```sql
  alter database recover managed standby database using current logfile disconnect;
  ```

- **Verification:**  
  On Primary:  
  ```sql
  ALTER SYSTEM SWITCH LOGFILE;
  ```
  On Primary (ORADB):  
  ```sql
  archive log list;
  select max(sequence#) from v$archived_log;
  ```
  On Standby (DRDB):  
  ```sql
  select process, status, sequence# from v$managed_standby where process in ('RFS','MRP0');
  select thread#, max(sequence#) from v$archived_log group by thread#;
  ```

### Notes for Switchback

- Verify archive logs and recovery processes are running smoothly.  
- Use `archive log list;` and queries on `v$archived_log` and `v$managed_standby` to confirm synchronization.  
- Switchback safely restores the original primary role with minimal disruption.
