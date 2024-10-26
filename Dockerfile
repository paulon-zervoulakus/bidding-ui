# Use an official Node.js image to build the app
FROM node:18.18.2 AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app and build the production files
COPY . .
RUN npm run build

# Use a lightweight web server to serve the frontend
FROM nginx:alpine

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port that the app will be available on
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
