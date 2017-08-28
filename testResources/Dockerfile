FROM node:8.1.4 

EXPOSE 1234

ADD healthy-healthcheck.sh /usr/local/bin/
ADD unhealthy-healthcheck.sh /usr/local/bin/

CMD ["sleep", "infinity"]
