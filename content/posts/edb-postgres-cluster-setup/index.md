---
ShareButtons:
- linkedin
- whatsapp
- twitter
ShowReadingTime: true
tags:
- database
- edb
- postgres

date : 2025-02-17T13:12:16+07:00
draft : false
title : Edb Cluster Setup with EFM failover manager
---

### Prerequsite:
- edb installed
- efm installed
- configuration cluster
- open port 7800,7809 between node 


### Step configure:

1. install efm , get repo
    repo:
    ```go
    curl -1sSLf 'https://downloads.enterprisedb.com/gmwxCGUaP97Ygbc4eQB7x8mo7kSVzT9I/enterprise/setup.rpm.sh' | sudo -E bash
    ```
2. install efm tools 

    ```go
    sudo dnf -y install edb-efm47
    ```

### Prereq before cluster on edb master

1. Create User Replicator for Replication Role only 
    ```go
    su - enterprisedb 
    psql edb

    create user replicator with replication encrypted password 'P@ssw0rd';
    ```

2. Change postgresql.conf parameter

    ```go
    vi "/pgdata/postgresql.conf" 

    cat "/pgdata/postgresql.conf" | grep -i 
    listen_addresses listen_addresses = '*'          
    # what IP address(es) to listen on; 

    ```

3. Change pg_hba.conf parameter 

    ```go
    cat "/pgdata/pg_hba.conf" | grep -i replicator 
    host replication replicator 192.168.200.113/32 trust 
    host replication replicator 192.168.200.114/32 trust

    ```


4. Restart edb-as-15 service

    ```go
    systemctl stop edb-as-15
    systemctl start edb-as-15
    systemctl status edb-as-15 
    ```


5. Check replication master status (After Slaves Configured) 

    ```go
    psql edb 
    select * from pg_stat_replication; 
    ```


### Prereq before cluster on edb slave

1. Set up pg_basebackup to enable replication stream 
    ```go
    su - enterprisedb 

    cd /pgdata 
    rm -rf * 

    pg_basebackup -h 192.168.200.113 -D /pgdata -U  replicator -P -R -X stream -C -S dg_db_slave 
    //or
    pg_basebackup -h 192.168.200.113 -D /var/lib/edb/as15/data -U replicator -P -R -X stream -C -S dg_db_slave 
    ```
2. Check replication receiver status 

    ```go

     psql edb 

     \x 

     select * from pg_stat_wal_receiver; 
    ```


### Configure cluster on edb master

1. Change pg_hba.conf parameter 
    ```go

    vi /pgdata/pg_hba.conf 
    cat /pgdata/pg_hba.conf | grep -i 192.168. 

    host replication replicator 192.168.200.113/32 trust 
    host replication replicator 192.168.200.114/32 trust 
    host all all 192.168.200.113/32 trust 
    host all all 192.168.200.114/32 trust 

    //restart

    systemctl restart edb-as-15 

    ```

2. Install EFM 4.7 

    ```go
    yum install edb-efm47 
    ```

3. Encrypt Password to Place In EFM Cluster Properties 

    ```go
    /usr/edb/efm-4.7/bin/efm encrypt efm 

    ```

4. Change efm.nodes & efm.properties parameter 

    note: for efm.node actually automatic add when already allow-nodes
    ```go
    chown efm:efm "/etc/edb/efm-4.7/efm.nodes" 
    chown efm:efm "/etc/edb/efm-4.7/efm.properties" 
    vi "/etc/edb/efm-4.7/efm.nodes" ; cat "/etc/edb/efm-4.7/efm.nodes" 
  
    192.168.200.114:7800 
    ```
    
    for efm.properties

    ```go
    vi "/etc/edb/efm-4.7/efm.properties"

    {config }

    ```
5. Start EFM Service 

    ```go
    systemctl start edb-efm-4.7 
    systemctl status edb-efm-4.7 
    ```

6. Allow Primary, Standby and Replica (report) Nodes 

    ```go
    /usr/edb/efm-4.7/bin/efm allow-node efm 192.168.200.114

    //if have more node just add ip and run 
    ```
7. Check EFM Cluster Status (Standby and Replica server not configured) 

    ```go
    /usr/edb/efm-4.7/bin/efm cluster-status efm 
    ```

8. Check Efm Cluster_Status (All Nodes Configured) 

    ```go
    /usr/edb/efm-4.7/bin/efm cluster-status efm 
    ```

### Configure cluster on edb slave


1. Change pg_hba.conf parameter 

    ```go

    vi /pgdata/pg_hba.conf 
    cat /pgdata/pg_hba.conf | grep -i 192.168. 

    host replication replicator 192.168.200.113/32 trust 
    host replication replicator 192.168.200.114/32 trust 
    host all all 192.168.200.113/32 trust 
    host all all 192.168.200.114/32 trust 

    //restart

    systemctl restart edb-as-15 

    ```
2. Instal EFM 4.7

    ```go
    yum install edb-efm47 
    ```

3. Change efm.nodes & efm.properties parameter 

    note: for efm.node actually automatic add when already allow-nodes
    ```go
    chown efm:efm "/etc/edb/efm-4.7/efm.nodes" 
    chown efm:efm "/etc/edb/efm-4.7/efm.properties" 
    vi "/etc/edb/efm-4.7/efm.nodes" ; cat "/etc/edb/efm-4.7/efm.nodes" 
  
    192.168.200.114:7800 
    ```
    
    for efm.properties

    ```go
    vi "/etc/edb/efm-4.7/efm.properties"

    {config }


4. Start EFM 4.7 Service 

  ```go
    systemctl start edb-efm-4.7 
    systemctl status edb-efm-4.7 
  ```

5. Allow Primary, Standby and Replica (report) Nodes

  ```go
    /usr/edb/efm-4.7/bin/efm allow-node efm 192.168.200.114

    //if have more node slave just add ip and run 
  ```
    
6. Check EFM Cluster-Status

  ```go
  /usr/edb/efm-4.7/bin/efm cluster-status efm 
  ```


### note-note

```go
//refresh cluster
select pg_reload_conf();

//ajmmm

```