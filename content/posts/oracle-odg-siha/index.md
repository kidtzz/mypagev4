---
date: '2025-10-06T15:13:39+07:00'
draft: false
title: 'Oracle Data Guard on SIHA'
---

## Summary

A comprehensive guide for installing and configuring **Oracle Data Guard** in an **Oracle Single Instance High Availability (SIHA)** environment.  

This document covers all key stages, including **prerequisites**, **Data Guard parameter configuration**, **network listener setup**, **standby instance creation**, and **replication/synchronization verification** between databases.  
Main reference: *Doc ID 2283978.1 — Setup Oracle Data Guard in RAC*.

---

### 1. Prerequisites

#### On Primary Servers
```sql
select name, open_mode, log_mode from v$database;
archive log list;

shutdown immediate;
startup mount;
alter database archivelog;
alter database force logging;
alter database open;

show parameter db_reco;
ALTER SYSTEM SET DB_RECOVERY_FILE_DEST_SIZE=5G SCOPE=BOTH SID='*';
ALTER SYSTEM SET DB_RECOVERY_FILE_DEST='+RECO01' SCOPE=BOTH SID='*';
alter database flashback on;
```

---

### 2. Configure Parameter Data Guard

#### On Primary Database
```sql
ALTER SYSTEM SET LOG_ARCHIVE_CONFIG='DG_CONFIG=(dbrest,dbrestdrc)' SCOPE=BOTH SID='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_1='LOCATION=USE_DB_RECOVERY_FILE_DEST VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=dbrest' SCOPE=BOTH SID='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_2='SERVICE=dbrestdrc ASYNC VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=dbrestdrc' SCOPE=BOTH SID='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_STATE_2=ENABLE SCOPE=BOTH SID='*';
ALTER SYSTEM SET FAL_SERVER=dbrestdrc SCOPE=BOTH SID='*';
ALTER SYSTEM SET FAL_CLIENT=dbrest SCOPE=BOTH SID='*';
ALTER SYSTEM SET STANDBY_FILE_MANAGEMENT=AUTO scope=both sid='*';

select thread#,group#,bytes,status from v$log;

ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 GROUP 4 ('+DATA01') SIZE 200M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 GROUP 5 ('+DATA01') SIZE 200M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 GROUP 6 ('+DATA01') SIZE 200M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 GROUP 7 ('+DATA01') SIZE 200M;

SELECT group#, thread#, bytes, status FROM v$standby_log;
```

---

### 3. Configure Network Listener (Both Server)

#### tnsnames.ora
```bash
DBREST =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = dbrestart)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = dbrest)
    )
  )

DBRESTDRC =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = dbrest-standby)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = dbrestdrc)
    )
  )

LISTENER_DBREST =
  (ADDRESS = (PROTOCOL = TCP)(HOST = dbrestart)(PORT = 1521))
```

---

### 4. Optional: run ASM in Grid User

```bash
export ORACLE_HOME=/u01/app/grid/19.3/gridhome_1
export ORACLE_SID=+ASM
export PATH=$ORACLE_HOME/bin:$PATH
asmcmd
```

---

### 5. Configure Instance in Standby

#### On Primary
```bash
srvctl config database -d dbrest | grep 'Password file'
asmcmd cp --local +DATA01/DBREST/PASSWORD/pwddbrest /home/oracle/backup

create pfile='/home/oracle/backup/primary.pfile' from spfile;
ALTER DATABASE CREATE STANDBY CONTROLFILE AS '/home/oracle/backup/dbrestdrc.ctl';

cd /home/oracle/backup/
scp * oracle@192.168.200.117:/home/oracle/backup
```

#### Add Database Standby in Grid
```bash
srvctl add database \
  -db dbrestdrc \
  -oraclehome /u01/app/oracle/product/19.3/dbhome_1 \
  -instance dbrestdrc \
  -dbname dbrest \
  -diskgroup RECO01,DATA01 \
  -role PHYSICAL_STANDBY
```

#### Create Structure ASM in Standby
```bash
asmcmd mkdir +DATA01/DBRESTDRC
asmcmd mkdir +DATA01/DBRESTDRC/PASSWORD
asmcmd mkdir +DATA01/DBRESTDRC/CONTROLFILE
asmcmd cp --local /home/oracle/backup/pwddbrest +DATA01/DBRESTDRC/PASSWORD/orapwdbrestdrc
asmcmd cp --local /home/oracle/backup/dbrestdrc.ctl +DATA01/DBRESTDRC/CONTROLFILE/dbrestdrc.ctl
```

---

### 6. Create and Modify Standby PFILE/SPFILE 

```bash
mkdir -p /u01/app/oracle/admin/dbrestdrc/adump
rman target /
startup nomount pfile='/home/oracle/backup/standby.pfile'
alter database mount;

sqlplus / as sysdba
create spfile='+DATA01/DBRESTDRC/spfiledbrestdrc.ora' from pfile='/home/oracle/backup/standby.pfile';
shutdown immediate;

srvctl modify database -d dbrestdrc -p '+DATA01/DBRESTDRC/spfiledbrestdrc.ora'
srvctl modify database -d dbrestdrc -pwfile +DATA01/DBRESTDRC/PASSWORD/orapwdbrestdrc
srvctl start database -d dbrestdrc -o mount
```

---

### 7. Listener Configuration on Standby

```sql
SHOW PARAMETER local_listener;
ALTER SYSTEM SET LOCAL_LISTENER='(ADDRESS=(PROTOCOL=TCP)(HOST=dbrest-standby)(PORT=1521))' SCOPE=BOTH;
ALTER SYSTEM REGISTER;
```

Verify:
```bash
lsnrctl status
```

---

### 8. RMAN Restore Database from Primary

#### On Standby
```bash
rman target /
CONFIGURE DEFAULT DEVICE TYPE TO DISK;
CONFIGURE DEVICE TYPE DISK PARALLELISM 3;
restore database from service dbrest;
backup spfile;
shutdown immediate;
srvctl start database -d dbrestdrc -o mount;
```

---

### 9. Clear Standby Log Files

```sql
begin
 for log_cur in ( select group# group_no from v$log )
 loop
 execute immediate 'alter database clear logfile group '||log_cur.group_no;
 end loop;
end;
/

begin
 for log_cur in ( select group# group_no from v$standby_log )
 loop
 execute immediate 'alter database clear logfile group '||log_cur.group_no;
 end loop;
end;
/ 
```

---

### 10. Start Managed Recovery in Standby

```sql
ALTER DATABASE RECOVER MANAGED STANDBY DATABASE DISCONNECT FROM SESSION;
```

---

### 11. Verification

```sql
SELECT SEQUENCE#, APPLIED FROM V$ARCHIVED_LOG ORDER BY SEQUENCE#;
SELECT NAME, DB_UNIQUE_NAME, OPEN_MODE, DATABASE_ROLE FROM V$DATABASE;
ALTER SYSTEM SWITCH LOGFILE;
```

#### Synchronization Status Check
```sql
SELECT al.thrd "Thread", almax "Last Seq Received", lhmax "Last Seq Applied",
       almax-lhmax "Gap", decode(almax-lhmax, 0, 'Sync', 'Gap') "Result"
FROM (SELECT thread# thrd, MAX(sequence#) almax FROM v$archived_log WHERE resetlogs_change#=(SELECT resetlogs_change# FROM v$database) GROUP BY thread#) al,
     (SELECT thread# thrd, MAX(sequence#) lhmax FROM v$log_history WHERE resetlogs_change#=(SELECT resetlogs_change# FROM v$database) GROUP BY thread#) lh
WHERE al.thrd = lh.thrd;

SELECT PROCESS, STATUS, SEQUENCE#, INST_ID FROM GV$MANAGED_STANDBY ORDER BY 1,3,2;
```

---

### Appendix (Sample Config on Standby)

```sql
ALTER SYSTEM SET LOG_ARCHIVE_CONFIG='DG_CONFIG=(dbrest,dbrestdrc)' SCOPE=BOTH SID='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_2='SERVICE=dbrest ASYNC VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=dbrest' SCOPE=BOTH SID='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_STATE_2=ENABLE SCOPE=BOTH SID='*';
ALTER SYSTEM SET FAL_SERVER=dbrest SCOPE=BOTH SID='*';
ALTER SYSTEM SET FAL_CLIENT=dbrestdrc SCOPE=BOTH SID='*';
```
