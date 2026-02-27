# Docs for Understanding the Backend

The current implementation includes two routes:  
1. POST /register
2. POST /login

I had to resort to POST instead of GET on register because in case of GET, browsers tend to store cache and do not regenerate keys once a request is loaded.  

POST /register generates a private-public key pair and writes the public key to src/db/keys. Hence, ensure that you create/touch the required file before blaming the backend :)  

POST /login requires a json body to be sent with the request, formatted as { "privateKey": "shgdwfhuhdwqiowf ...." }. If the associated public key for the sent private key exists in the src/db/keys file, the request generates a JWT and sends it. The frontend is to use this JWT to log in the user.  

Lastly, to fire the backend, create an `.env` and add JWT_SECRET=YourJWTSecret. Run `sudo docker compose up` in this directory (Ensure to create /src/db/keys beforehand). If you make any changes to the backend, prune the system before running `sudo docker compose up`. The command for pruning would be `sudo docker system prune --all`