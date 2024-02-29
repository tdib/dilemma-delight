FROM node:20
WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm run build
EXPOSE 3000
CMD ["node", "./dist/index.js"]