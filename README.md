# godaddy_ddns
A node script to update dns records via the GoDaddy api.

Support multiple domains and multiple entries per domain.

GoDaddy customers can obtain values for the "key" and "secret" config by creating a production key at https://developer.godaddy.com/keys/

# Usage:
- Rename config.json.sample to config.json and configure it as needed
- Go to project folder and run: npm install
- Then, put it in an cron or run manually: npm start

**Docker run example (short lived):**  
docker run -it --rm -v "$(pwd)/data:/ddns/data" uilton/godaddy_ddns:latest