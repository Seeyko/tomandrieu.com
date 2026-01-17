FROM nginx:alpine AS production

# Copy nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy frontend static files
COPY frontend/assets/ /usr/share/nginx/html/assets/
COPY frontend/css/ /usr/share/nginx/html/css/
COPY frontend/data/ /usr/share/nginx/html/data/
COPY frontend/js/ /usr/share/nginx/html/js/
COPY frontend/themes/ /usr/share/nginx/html/themes/
COPY frontend/index.html /usr/share/nginx/html/
COPY frontend/blog.html /usr/share/nginx/html/

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
