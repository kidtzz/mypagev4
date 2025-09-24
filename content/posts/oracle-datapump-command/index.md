---
ShareButtons:
- linkedin
- whatsapp
- twitter
ShowReadingTime: true
draft: false
tags:
- database
- oracledb
date : '2024-12-03T12:31:29+07:00'
draft : false
title : 'Install Rac Oracle19c with ASM in local lab'
date : '2024-12-09T13:16:17+07:00'
title : 'Oracle Datapump Command'
---



```go
# Basic Data Pump Import Command Syntax
impdp username/password DIRECTORY=directory_name DUMPFILE=dumpfile_name LOGFILE=logfile_name

# Common Parameters:
# 1. DIRECTORY - Specifies the directory object where the dump file is located.
DIRECTORY=db_backup_dir

# 2. DUMPFILE - Specifies the name of the dump file. You can use multiple files if needed.
DUMPFILE=db_backup.dmp

# 3. LOGFILE - Specifies the name of the log file to log the import process.
LOGFILE=db_restore.log

# 4. TABLES - Imports specific tables from the dump file.
TABLES=hr.employees, hr.departments

# 5. REMAP_SCHEMA - Remaps the source schema to a target schema during import.
REMAP_SCHEMA=old_schema:new_schema

# 6. REMAP_TABLESPACE - Remaps the source tablespace to a target tablespace.
REMAP_TABLESPACE=old_tablespace:new_tablespace

# 7. EXCLUDE - Excludes specific object types or objects from the import. Example: Exclude indexes.
EXCLUDE=INDEX

# 8. INCLUDE - Includes specific object types or objects for import. Example: Only import `employees` and `departments` tables.
INCLUDE=TABLE:"IN ('EMPLOYEES', 'DEPARTMENTS')"

# 9. CONTENT - Specifies whether to import only data (DATA_ONLY), only DDL (METADATA_ONLY), or both (ALL).
CONTENT=DATA_ONLY

# 10. ACCESS_METHOD - Specifies the method used for accessing the dump file (direct_path or external_table).
ACCESS_METHOD=direct_path

# 11. FULL - Imports the entire database.
FULL=Y

# 12. PARALLEL - Uses multiple parallel threads for faster import.
PARALLEL=4

# 13. FLASHBACK_TIME - Imports data as it was at a specific point in time.
FLASHBACK_TIME="TO_TIMESTAMP('2023-01-01 00:00:00', 'YYYY-MM-DD HH24:MI:SS')"

# 14. TRANSPORT_TABLESPACES - Imports specified transportable tablespaces.
TRANSPORT_TABLESPACES=users

# 15. CLUSTER - Used when importing a cluster.
CLUSTER=Y

# 16. SINGLE_TRANSACTION - Imports all objects in a single transaction.
SINGLE_TRANSACTION=Y

# 17. REMAP_DATAFILE - Remaps datafile names during import.
REMAP_DATAFILE='/old/path/datafile.dbf'='/new/path/datafile.dbf'

# 18. TABLE_EXISTS_ACTION - Specifies what action to take if a table already exists during import. Options: SKIP, APPEND, REPLACE, TRUNCATE.
TABLE_EXISTS_ACTION=APPEND

# Example: Import Specific Tables
impdp dbning/12345 DIRECTORY=db_backup_dir DUMPFILE=dbning_backup.dmp LOGFILE=restore.log TABLES=hr.employees,hr.departments

# Example: Remap Schema During Import
impdp sys/12345 as sysdba DIRECTORY=db_backup_dir DUMPFILE=dbning_backup.dmp LOGFILE=restore.log REMAP_SCHEMA=old_schema:new_schema

# Example: Import with Parallelism (4 threads)
impdp sys/12345 as sysdba DIRECTORY=db_backup_dir DUMPFILE=dbning_backup.dmp LOGFILE=restore.log PARALLEL=4

# Example: Import Data Only (No DDL)
impdp sys/12345 as sysdba DIRECTORY=db_backup_dir DUMPFILE=dbning_backup.dmp LOGFILE=restore.log CONTENT=DATA_ONLY

# Example: Import Full Database
impdp sys/12345 as sysdba DIRECTORY=db_backup_dir DUMPFILE=dbning_backup.dmp LOGFILE=restore.log FULL=Y

# Example: Exclude Indexes During Import
impdp sys/12345 as sysdba DIRECTORY=db_backup_dir DUMPFILE=dbning_backup.dmp LOGFILE=restore.log EXCLUDE=INDEX

# Example: Flashback Import to a Specific Time
impdp sys/12345 as sysdba DIRECTORY=db_backup_dir DUMPFILE=dbning_backup.dmp LOGFILE=restore.log FLASHBACK_TIME="TO_TIMESTAMP('2023-01-01 00:00:00', 'YYYY-MM-DD HH24:MI:SS')"
```