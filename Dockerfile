FROM node:14.15.0

# Create app directory
WORKDIR /workdir

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY src/ ./src
COPY package*.json ./
COPY .npmrc ./
COPY babel.config.js ./

RUN npm ci

# Bundle app source
RUN npm run build

CMD [ "npm", "run", "start:portal-setup-docker" ]
