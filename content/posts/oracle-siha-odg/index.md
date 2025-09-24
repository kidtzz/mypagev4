---
date: '2025-09-24T13:39:27+07:00'
draft: False
title: 'Setup Oracle Data Guard in RAC'
tags:
- database
- oracledb
- odg
- siha
---

---

##  Summary

This guide provides a structured procedure for configuring **Oracle Data Guard** in a **Real Application Clusters (RAC)** environment. It includes prerequisites, database and parameter setup, listener and network configuration, preparing the standby instance (with pfile details), enabling managed recovery, and final verification. Following these steps ensures a robust disaster recovery solution with synchronized primary and standby databases.

---

### Reference

* Oracle Doc ID: 2283978.1

---

## 1. Prerequisites

On both servers:

```sql
select name, open_mode, log_mode from v$database;
archive log list;

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

## 2. Konfigurasi Parameter Data Guard (Primary)

```sql
ALTER SYSTEM SET LOG_ARCHIVE_CONFIG='DG_CONFIG=(dbsiha,dbsihadrc)' SCOPE=BOTH SID='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_1='LOCATION=USE_DB_RECOVERY_FILE_DEST VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=DBSIHA' SCOPE=BOTH SID='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_2='SERVICE=dbsihadrc ASYNC VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=dbsihadrc' SCOPE=BOTH SID='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_STATE_2=ENABLE SCOPE=BOTH SID='*';
ALTER SYSTEM SET FAL_SERVER=dbsihadrc SCOPE=BOTH SID='*';
ALTER SYSTEM SET FAL_CLIENT=dbsiha SCOPE=BOTH SID='*';
ALTER SYSTEM SET STANDBY_FILE_MANAGEMENT=AUTO scope=both sid='*';
```

Tambahkan standby redo logs:

```sql
select thread#,group#,bytes,status from v$log;

ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 GROUP 4 ('+DATA01') SIZE 200M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 GROUP 5 ('+DATA01') SIZE 200M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 GROUP 6 ('+DATA01') SIZE 200M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 GROUP 7 ('+DATA01') SIZE 200M;

SELECT group#, thread#, bytes, status FROM v$standby_log;
```

---

## 3. Konfigurasi Network Listener

### On both servers

```bash
srvctl config scan
vi /etc/dnsmasq.conf
```

Example SCAN configuration (round-robin):

```ini
# Standby RAC
host-record=sihadrc-scan.db.com,192.168.200.241
host-record=sihadrc-scan.db.com,192.168.200.242
host-record=sihadrc-scan.db.com,192.168.200.243

# Primary RAC
host-record=sihadc-scan.db.com,192.168.200.221
host-record=sihadc-scan.db.com,192.168.200.222
host-record=sihadc-scan.db.com,192.168.200.223
```

Restart and validate:

```bash
systemctl restart dnsmasq
nslookup sihadc-scan
nslookup sihadrc-scan
ping sihadc-scan
ping sihadrc-scan
```

### Configure TNS (tnsnames.ora)

```ora
DBSIHA =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = sihadc-scan.db.com)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = dbsiha)
    )
  )

DBSIHADRC =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = sihadrc-scan.db.com)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = dbsihadrc)
    )
  )
```

---

## 4. Konfigurasi Instance on Standby

1. Copy password file and control file from primary:

```bash
srvctl config database -d dbsiha | grep 'Password file'
asmcmd cp --local +DATA01/DBSIHA/PASSWORD/pwddbsiha.266.1210295169 /home/oracle/backup
create pfile='/home/oracle/backup/primary.pfile' from spfile;
ALTER DATABASE CREATE STANDBY CONTROLFILE AS '/home/oracle/backup/dbsihadrc.ctl';
scp * oracle@192.168.200.112:/home/oracle/backup
```

2. Prepare standby directories:

```bash
mkdir -p /u01/app/oracle/admin/dbsihadrc/adump
```


3. **Standby pfile example:**

```ini
*.db_unique_name='dbsihadrc'
*.db_name='dbsiha'
*.control_files='+DATA01/DBSIHADRC/CONTROLFILE/dbsihadrc.ctl'
*.db_recovery_file_dest='+RECO01'
*.db_recovery_file_dest_size=5368709120
*.fal_client='DBSIHADRC'
*.fal_server='DBSIHA'
*.log_archive_config='DG_CONFIG=(dbsihadrc,dbsiha)'
*.log_archive_dest_1='LOCATION=USE_DB_RECOVERY_FILE_DEST VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=DBSIHADRC'
*.log_archive_dest_2='SERVICE=dbsiha ASYNC VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=dbsiha'
*.log_archive_dest_state_2='ENABLE'
*.standby_file_management='AUTO'
```


4. Add standby database and instances via `srvctl`:

```bash
srvctl add database -db dbsihadrc -oraclehome /u01/app/oracle/database/19.3/dbhome_1 -dbtype SINGLE -instance dbsihadrc1 -node sihadrc -dbname dbsiha -diskgroup RECO01,DATA01 -role physical_standby
```

5. Setup ASM directories and copy files:

```bash
asmcmd mkdir +DATA01/DBSIHADRC/PASSWORD
asmcmd mkdir +DATA01/DBSIHADRC/CONTROLFILE
asmcmd cp --local /home/oracle/backup/pwddbsiha +DATA01/DBSIHADRC/PASSWORD/orapwdbsihadrc
asmcmd cp --local /home/oracle/backup/dbsihadrc.ctl +DATA01/DBSIHADRC/CONTROLFILE/dbsihadrc.ctl
```

6. Create spfile and modify database configs:

```bash
sqlplus / as sysdba
create spfile='+DATA01/DBSIHADRC/spfiledbsihadrc.ora' from pfile='/home/oracle/backup/standby.pfile';
shutdown immediate;

srvctl modify database -d dbsihadrc -p '+DATA01/DBSIHADRC/spfiledbsihadrc.ora'
srvctl modify database -d dbsihadrc -pwfile +DATA01/DBSIHADRC/PASSWORD/orapwdbsihadrc
srvctl start database -d dbsihadrc -o mount
```

7. Restore database using RMAN:

```sql
restore database from service dbsiha;
backup spfile;
switch database to copy;
shutdown immediate;
```

---

## 5. Start Managed Recovery di Standby

```sql
ALTER DATABASE RECOVER MANAGED STANDBY DATABASE DISCONNECT FROM SESSION;
```

---

## 6. Verifikasi

Check archived log apply:

```sql
SELECT SEQUENCE#, APPLIED FROM V$ARCHIVED_LOG ORDER BY SEQUENCE#;
SELECT NAME, DB_UNIQUE_NAME, OPEN_MODE, DATABASE_ROLE FROM V$DATABASE;
ALTER SYSTEM SWITCH LOGFILE;
```

Check DB information:

```sql
SELECT NAME,DB_UNIQUE_NAME,INSTANCE_NAME,DBID,HOST_NAME,PLATFORM_NAME,OPEN_MODE,STATUS,LOG_MODE,DATABASE_ROLE,TO_CHAR(CURRENT_SCN)CURRENT_SCN FROM V$DATABASE X,V$INSTANCE Y;
```

Check gap:

```sql
SELECT al.thrd "Thread", almax "Last Seq Received", lhmax "Last Seq Applied", almax-lhmax "Gap", decode(almax-lhmax, 0, 'Sync', 'Gap') "Result"
FROM (SELECT thread# thrd, MAX(sequence#) almax FROM v$archived_log WHERE resetlogs_change#=(SELECT resetlogs_change# FROM v$database) GROUP BY thread#) al,
     (SELECT thread# thrd, MAX(sequence#) lhmax FROM v$log_history WHERE resetlogs_change#=(SELECT resetlogs_change# FROM v$database) GROUP BY thread#) lh
WHERE al.thrd = lh.thrd;
```

Check processes:

```sql
SELECT PROCESS,STATUS,SEQUENCE#,INST_ID FROM GV$MANAGED_STANDBY ORDER BY 1,3,2;
```
