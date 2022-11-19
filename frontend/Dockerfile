FROM node:16-alpine AS builder

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json /app/
WORKDIR /app

RUN npm install

# Bundle app source
COPY . /app
RUN npm run-script build


FROM nginx:alpine
COPY --from=builder /app/dist* /usr/share/nginx/html/
EXPOSE 80
CMD nginx -g 'daemon off;'

