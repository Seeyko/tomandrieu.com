FROM nginx:alpine AS production

# Copy nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy only necessary static files
COPY assets/ /usr/share/nginx/html/assets/
COPY css/ /usr/share/nginx/html/css/
COPY data/ /usr/share/nginx/html/data/
COPY js/ /usr/share/nginx/html/js/
COPY themes/ /usr/share/nginx/html/themes/
COPY index.html /usr/share/nginx/html/

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
