---
ShareButtons:
- linkedin
- whatsapp
- twitter
ShowReadingTime: true
date: '2024-12-10T11:28:50+07:00'
draft: false
tags:
- docker
title: Docker Command
---



command docker

```go
docker --version               # Check Docker version  
docker info                    # Display system info  
docker --help                  # List all Docker commands  

docker run [OPTIONS] IMAGE [COMMAND]         # Run a container  
docker ps                                   # List running containers  
docker ps -a                                # List all containers  
docker stop <container_id|name>             # Stop a container  
docker start <container_id|name>            # Start a stopped container  
docker restart <container_id|name>          # Restart a container  
docker rm <container_id|name>               # Remove a container  
docker exec -it <container_id|name> /bin/bash  # Attach to container  

docker images                               # List images  
docker pull <image_name>:<tag>              # Download an image  
docker rmi <image_id|name>                  # Remove an image  
docker tag <image_id> <repo_name>:<tag>     # Tag an image  

docker network ls                           # List networks  
docker network create <network_name>        # Create a new network  
docker network connect <network_name> <container_name>  # Connect container  
docker network disconnect <network_name> <container_name>  # Disconnect container  

docker volume ls                            # List volumes  
docker volume create <volume_name>          # Create a volume  
docker volume rm <volume_name>              # Remove a volume  
docker run -d -v <volume_name>:/path/in/container IMAGE  # Mount volume  


docker-compose up -d                        # Start services  
docker-compose down                         # Stop services  
docker-compose logs -f                      # View service logs  
docker-compose restart                      # Restart services  

docker logs <container_id|name>             # View container logs  
docker logs -f <container_id|name>          # Stream live logs  
docker stats                                # Monitor resource usage  

docker container prune                      # Remove stopped containers  
docker image prune                          # Remove unused images  
docker system prune                         # Remove all unused data  
```


docker ps check all images

```go
REPOSITORY               TAG       IMAGE ID       CREATED         SIZE
kalilinux/kali-rolling   latest    4bcd01f000d0   10 days ago     128MB
postgres                 latest    f0dfc903a663   2 weeks ago     434MB
dpage/pgadmin4           latest    a67d330eef3b   3 weeks ago     485MB
grafana/grafana          latest    de903bc9ce7c   7 weeks ago     478MB
mysql                    8.4       f742bd39cd6b   2 months ago    584MB
phpmyadmin/phpmyadmin    latest    933569f3a9f6   15 months ago   562MB
mysql/mysql-router       latest    22e6cea4af02   21 months ago   255MB
```

