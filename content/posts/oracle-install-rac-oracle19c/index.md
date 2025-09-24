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
- asm
- rac
date : '2024-12-03T12:31:29+07:00'
draft : false
title : 'Install Rac Oracle19c with ASM in local lab'
---



### Prerequisite
1. Pastikan OS dapat membaca ASM disini saya menggunak oracle linux 7.8 dan saya perlu merubah kernel menjadi CHK karena disini defaultny adalah UEK

    ```go
    grub2-set-default 1
    uname -r
    reboot
    ```

2. ubah selinux menjadi disabled agar tidak terlock  


    ```go
    /etc/selinux/config
    SELINUX=disabled
    ```

3. ubah hostname disini saya menggunakan 2 node berikut contohnya

    ```go
    hostnamectl set-hostname db1.db.com
    hostnamectl set-hostname db2.db.com
    ```
4. tambahkan etc hosts dengan IP yang sudah di set pastikan IP Public , IP Virtual, IP Scan dalam satu segment yang sama 

    ```go
    vi /etc/hosts

    #masukan IP berikut

    127.0.0.1 localhost.db.com localhost

    # Public
    192.168.8.201 db1.db.com db1
    192.168.8.202 db2.db.com db2

    # Private
    192.168.9.201 db1-priv.db.com db1-priv
    192.168.9.202 db2-priv.db.com db2-priv

    # Virtual
    192.168.8.211 db1-vip.db.com db1-vip
    192.168.8.212 db2-vip.db.com db2-vip

    # SCAN
    192.168.8.221 db-scan.db.com db-scan
    192.168.8.222 db-scan.db.com db-scan
    192.168.8.223 db-scan.db.com db-scan

    ```


5. install package tambahan untuk preinstall RAC dan oracle19c 

    ```go
    yum install -y oracle-database-preinstall-19c
    yum install oracleasm-support
    sudo yum install kmod-oracleasm
    sudo yum install chrony
    yum install bind* -y
    sysctl -p
    ```

6. Disable IPv6 (optional)

    ```go
    ifconfig | grep inet

    vi /etc/sysctl.conf

    # Disable IPv6
    net.ipv6.conf.all.disable_ipv6 = 1
    net.ipv6.conf.default.disable_ipv6 = 1
    net.ipv6.conf.lo.disable_ipv6 = 1

    #reset agar berubah configurasinya
    /sbin/sysctl -p
    ```
7. Matikan dan stop firewalld agar antar node dapat saling terhubung

    ```go
    systemctl disable firewalld
    systemctl stop firewalld
    ```

8. Delete user dan group yang sudah ada lalu buat user dan group baru 

    ```go
    sudo userdel -r oracle
    sudo groupdel dba

    groupadd dba -g 1600
    useradd -g dba -G dba,vboxsf -s /bin/bash oracle -u 1601
    useradd -g dba -G dba,vboxsf -s /bin/bash grid -u 1602
    echo "12345" | passwd --stdin oracle
    echo "12345" | passwd --stdin grid
    echo "%dba ALL=(ALL:ALL) NOPASSWD: ALL" >> /etc/sudoers
    ```

9. tambahkan prereq limits di os 

    ```go
    vi /etc/security/limits.conf

    grid soft stack 10240
    oracle soft stack 10240
    grid soft nofile 4096
    grid hard nofile 63536
    oracle soft nofile 4096
    oracle hard nofile 63536
    ```
10. reboot OS

    ```go
    reboot
    ```

11. setelah hidup, configure oracleasm 

    ```go
    oracleasm configure -i

    grid
    dba
    y
    y
    ```

12. hidupkan service dari oracleasm 

    ```go
    systemctl enable oracleasm.service
    systemctl start oracleasm.service

    systemctl list-unit-files | grep asm

    ```



13. buat directory untuk oracle database dan RAC

    ```go
    mkdir /dbi
    mkdir /dbi/oracle/
    mkdir /dbi/oracle/V19BaseDatabase
    mkdir /dbi/oracle/V19Database
    mkdir /dbi/oracle/V19BaseGrid
    mkdir /dbi/oracle/V19Grid
    chmod 777 /dbi
    chmod 777 /dbi/oracle/
    chown oracle:dba /dbi/oracle/V19Database
    chown oracle:dba /dbi/oracle/V19BaseDatabase
    chown grid:dba /dbi/oracle/V19BaseGrid
    chown grid:dba /dbi/oracle/V19Grid
    ```
14. hidupkan service chronyd 
    
    ```go
    sudo systemctl enable chronyd
    sudo systemctl start chronyd

    chronyc -a 'burst 4/4' 
    chronyc -a makestep
    ```

15. Buat profile untuk user oracle dan user grid

    ```go
    #user ORACLE

    vi /home/oracle/.bashrc

    PATH=$PATH:$HOME/bin ; export PATH
    TMP=/tmp ; export TMP
    TMPDIR=$TMP ; export TMPDIR
    ORACLE_SID=ora19c ; export ORACLE_SID
    ORACLE_UNQNAME=ora19c ; export ORACLE_UNQNAME
    ORACLE_GLOBAL_NAME=ora19c1.db.com ; export ORACLE_GLOBAL_NAME
    ORACLE_BASE=/dbi/oracle/V19BaseDatabase ; export ORACLE_BASE
    ORACLE_HOME=/dbi/oracle/V19Database ; export ORACLE_HOME
    ORACLE_GRID=/dbi/oracle/V19Grid ; export ORACLE_GRID
    ORACLE_HOSTNAME=db1.db.com ; export ORACLE_HOSTNAME
    PATH=/usr/sbin:$PATH ; export PATH
    PATH=$ORACLE_HOME/bin:$PATH ; export PATH
    LD_LIBRARY_PATH=$ORACLE_HOME/lib:/lib:/usr/lib ; export LD_LIBRARY_PATH
    CLASSPATH=$ORACLE_HOME/jlib:$ORACLE_HOME/rdbms/jlib ; export CLASSPATH
    CLASSPATH=$ORACLE_HOME/JRE:$CLASSPATH ; export CLASSPATH
    



    #user GRID

    vi /home/grid/.bashrc

    PATH=$PATH:$HOME/bin ; export PATH
    TMP=/tmp ; export TMP
    TMPDIR=$TMP ; export TMPDIR
    ORACLE_SID=+ASM1 ; export ORACLE_SID
    ORACLE_BASE=/dbi/oracle/V19BaseGrid ; export ORACLE_BASE
    ORACLE_HOME=/dbi/oracle/V19Grid ; export ORACLE_HOME
    ORACLE_GRID=/dbi/oracle/V19Grid ; export ORACLE_GRID
    ORACLE_HOSTNAME=db1.db.com ; export ORACLE_HOSTNAME
    PATH=/usr/sbin:$PATH ; export PATH
    PATH=$ORACLE_HOME/bin:$PATH ; export PATH
    LD_LIBRARY_PATH=$ORACLE_HOME/lib:/lib:/usr/lib ; export LD_LIBRARY_PATH
    CLASSPATH=$ORACLE_HOME/jlib:$ORACLE_HOME/rdbms/jlib ; export CLASSPATH
    CLASSPATH=$ORACLE_HOME/JRE:$CLASSPATH ; export CLASSPATH

    ```


### Clone VM dan setting network dan storage shareable untuk ASM

pada tahap ini akan melakukan clone dari node 1 ke node 2 agar konfigurasi sama tetapi untuk network perlu di reset mac adddress dan mengubahnya menjadi network static , lalu tambahkan storage shareable agar kedua node dapat saling akses 

1. SS stepnya


2. ssh ke kedua node jalankan perintah berikut untuk menambahkan dan mount ASM

    ```go
    fdisk -l | grep /dev/sd

    printf "o\nn\np\n1\n\n\nw\n" | sudo fdisk /dev/sdb
    printf "o\nn\np\n1\n\n\nw\n" | sudo fdisk /dev/sdc
    oracleasm createdisk ASMDATA1 /dev/sdb1
    oracleasm createdisk ASMOCR /dev/sdc1

    oracleasm scandisks
    oracleasm listdisks
    ```


### Install grid

Pindahkan file oracle grid ke dalam server disini contoh file saya adalah ***LINUX.X64_193000_grid_home***

1. Login sebagai grid, unzip file

    ```go
    cd /media/
    unzip -qq LINUX.X64_193000_grid_home -d /dbi/oracle/V19Grid
    ```

2. login sebagai root, kirim ke node2:

    ```go
    cd /dbi/oracle/V19Grid/cv/rpm
    scp cvuqdisk-1.0.10-1.rpm db2:/tmp/

    CVUQDISK_GRP=dba;
    export CVUQDISK_GRP
    rpm -i cvuqdisk-1.0.10-1.rpm

    ```

3. login sebagai grid lagi:

    ```go
    /dbi/oracle/V19Grid/gridSetup.sh

    ```


4. SS step

5. checks

    ```go
    /dev/oracleasm/disks/*


    abaikan error

    checking...
    /dbi/oracle/V19Grid/bin/crsctl check crs
    /dbi/oracle/V19Grid/bin/crsctl check cluster -all
    /dbi/oracle/V19Grid/bin/crsctl check stat res -t

    ```


### install dan setup oracle database di RAC
Pindahkan file oracle db ke dalam server disini contoh file saya adalah ***LINUX.X64_193000_db_home***

1. sebelum membuat database buat ASM Data disk.

    ```go
    asmca

    trus create tambahkan asmdata1
    ```


2. login sebagai oracle , install software only:

    ```go
    cd /media
    unzip -qq LINUX.X64_193000_db_home -d /dbi/oracle/V19Database/

    /dbi/oracle/V19Database/runInstaller.sh
    ```
3. ss install software only


4. install dan create database Create Database

    ```go
    dbca
    ```

5. checking ...




### Check semua apakah sudah terinstall dengan benar RAC dan database 

1. check dan login instance database

    ```go
    ora19c1/ora19c2 #ORACLESID/instance

    sqlplus sys/12345@ora19c as sysdba

    def

    select inst_id, instance_name, status from gv$instance;

    select distinct instance_name, status, name, open_mode, host_name, startup_time from gv$instance, gv$database;
    ```

2. check status instance database

    ```go
    #check status
    srvctl status database -d ora19c 

    #untuk start 
    srvctl start database -d ora19c
    ```

3. check backgound proses apakah sudah berjalan

    ```go
    node1 dan node2:
    ps -ef | grep pmon
    ```

4. check cluster , login sebagai grid

    ```go
    crsctl check crs
    crsctl stat res -t
    login grid/oracle:
    srvctl status asm
    srvctl start asm
    srvctl status listener
    srvctl start listener
    srvctl config scan | grep VIP
    ```

5. untuk mematikan dan menghidupkan cluster login sebagai root

    ```go
    /dbi/oracle/V19Grid/bin/crsctl stop crs
    /dbi/oracle/V19Grid/bin/crsctl start crs
    ```

6. untuk melihat log cluseter

    ```go
    crsctl stat res -t
    tail -f /u01/app/grid/diag/crs/<hostname>/crs/trace/alert.log
    ```



****
### Reference:

https://www.youtube.com/watch?v=e6qCJYYXzZw&t=2s

https://www.youtube.com/watch?v=5gPGClH99vQ&t=7698
