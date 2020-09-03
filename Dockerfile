FROM node:14-alpine
WORKDIR /ddns

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

#RUN npm install
# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY . .

VOLUME ["/ddns/data"]

CMD [ "npm", "start" ]