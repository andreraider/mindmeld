### Build
FROM node:current-alpine As build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --prod

### Run
FROM nginx:mainline-alpine as production
COPY --from=build /usr/src/app/dist/mindmeld-statistics /usr/share/nginx/html
COPY --from=build  /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
