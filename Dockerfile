FROM node18.17.1-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
ADD . /app
RUN npm install
RUN npm install typescript
RUN npm run build
CMD ["npm", "run", "start:prod"]