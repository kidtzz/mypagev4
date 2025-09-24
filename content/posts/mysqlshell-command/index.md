---
ShareButtons:
- linkedin
- whatsapp
- twitter
ShowReadingTime: true
date : '2024-12-09T11:43:07+07:00'
draft: false
tags:
- database
- mysql
title : 'MYSQL Shell Command '
---



####  General Commands
```go
\help                     # Show help information
\status                   # Display current connection and session status
\quit or \exit            # Exit MySQL Shell
\clear                    # Clear the screen
\history                  # Show command history
\rehash                   # Update auto-completion data
```

####  Session Management
```go
\connect user@host[:port]       # Connect to a MySQL server
\reconnect                      # Reconnect to the last session
\disconnect                     # Disconnect from the current session
\use database_name              # Switch to a specific database
```

####  Mode Switching
```go
\sql                      # Switch to SQL mode
\js                       # Switch to JavaScript mode
\py                       # Switch to Python mode
```

####  Executing SQL Queries
```go
SELECT * FROM table_name;       # Execute SQL queries (in SQL mode)
session.runSql("SQL_QUERY");    # Execute SQL in JavaScript mode
session.run_sql("SQL_QUERY")    # Execute SQL in Python mode
```

####  Working with Admin API
```go
dba.checkInstanceConfiguration();       # Check instance configuration
dba.configureInstance();                # Configure an instance
var cluster = dba.createCluster("name") # Create an InnoDB cluster
cluster.addInstance("user@host");       # Add an instance to the cluster
cluster.status();                       # Get cluster status
cluster.removeInstance("user@host");    # Remove an instance from the cluster
```

####  Data Export and Import
```go
\util.dumpInstance("path", {options});   # Export instance data
\util.loadDump("path", {options});       # Import data
```

####  Script Execution
```go
\source /path/to/script.sql      # Run a SQL script file
```

####  Configuration Management
```go
\show defaultCharacterSet        # Show default character set
\set defaultCharacterSet=utf8mb4 # Set default character set
```

####  Shell Customization
```go
\options                         # List shell options
\set prompt "custom_prompt> "    # Customize shell prompt
```
