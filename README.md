# godaddy_ddns
A node script to update dns records via the GoDaddy api.

Support multiple domains and multiple entries per domain.

GoDaddy customers can obtain values for the "key" and "secret" config by creating a production key at https://developer.godaddy.com/keys/

# How to use this image (Docker):
## Directories
This directory has been created in the image to be used for configuration and persistent storage (**cache.json**: last ip address).  

    /ddns/data

## Configuration
Place a config.json to /ddns/data mount directory, example:

    {
        "key": "XXXXXXXXXXXX",
        "secret": "XXXXXXXXXXXX",
        "entries": [
            {
                "domain": "domain.com.br",
                "entries": [
                    {
                        "type": "A",
                        "name": "@"
                    },
                    {
                        "type": "A",
                        "name": "www"
                    }
                ]
            },
            {
                "domain": "domain.com",
                "entries": [
                    {
                        "type": "A",
                        "name": "@"
                    }
                ]
            }
        ]
    }

## Run:  
    docker run -it --rm -v "$(pwd)/data:/ddns/data" uilton/godaddy_ddns:latest

# Manual Usage (from the source code):
- Rename config.json.sample to config.json and configure it as needed
- Go to project folder and run: npm install
- Then, put it in an cron or run manually: npm start