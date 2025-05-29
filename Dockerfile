FROM node:23-alpine3.20

WORKDIR /app

EXPOSE 8000

COPY package*.json ./

RUN npm install --force

COPY . .

RUN npx prisma generate

CMD ["npm", "start"]
