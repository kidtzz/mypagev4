---
ShareButtons:
- linkedin
- whatsapp
- twitter
ShowReadingTime: true
draft: false
tags:
- database
- mysql
date : 2024-12-09T11:13:58+07:00
draft : false
title : Install MYSQL Server Community
---


### prereq

1. Get repository

    ```go
    wget https://repo.mysql.com//mysql57-community-release-el7-11.noarch.rpm
    sudo rpm -ivh mysql57-community-release-el7-11.noarch.rpm

    ```

2. Get key mysql

    ```go
    rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
    rpm -qa gpg-pubkey*
    ls -l /etc/pki/rpm-gpg/RPM-GPG-KEY-mysql

    ```


### Install Mysql

1. Install mysql-server

    ```go
    sudo yum install mysql-server
    ```

2. Because MySQL is automatically installed you can use OS command for service management, for example to check if it’s already started

    ```go
    sudo systemctl status mysqld
    ```

3. Start MySQL if not started

    ```go
    sudo systemctl start mysqld
    sudo systemctl enable mysqld
    sudo systemctl status mysqld
    ```

### Change root password

1. Check the content of my.cnf, that is in default folder for linux OS and note the following info (lines that start with “#”are just comments)
  - Where is the database and the error log (mysqld.log) stored?
  - Check if there are error for the instance looking in the error log file
2. Starting from MySQL 5.7 the default installation of MySQL Server generates a one-time password. You find it in error log notes above

    ```go
    sudo grep 'temporary' /var/log/mysqld.log
    ```

3. Login to MySQL using password retrieved in previous step

    ```go
    mysql -uroot -p -h localhost
    ```

4. Try to run a command and write down the error message

    ```go
    mysql>status
    ```

5. Change root password

    ```go
    mysql>ALTER USER 'root'@'localhost' IDENTIFIED BY 'Welcome1!';
    ```

6. Retry command above, now it works

    ```go
    mysql>status;
    ```

7. Which databases are installed by default?

    ```go
    mysql>show databases;
    ```

8. To see which version of MySQL you are using submit the command

    ```go
    mysql>show variables like "%version%";
    ```

9. Check default users in standard installation

    ```go
    mysql>select user, host from mysql.user where user='root';
    ```

10. Logout as ‘root’ and connect as admin

    ```go
    mysql>exit
    ```


### Secure MySQL Installation

```go
sudo mysql_secure_installation

Enter current password for root (enter for none): 
Set root password? [Y/n] Y
New password: 
Re-enter new password: 
Do you wish ...? : Y
Remove anonymous users? [Y/n] Y
Disallow root login remotely? [Y/n] n
Remove test database and access to it? [Y/n] Y
Reload privilege tables now? [Y/n] Y
```
  