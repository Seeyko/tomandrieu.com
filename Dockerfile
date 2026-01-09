FROM nginx:alpine AS production

# Copy static files to nginx html directory
COPY . /usr/share/nginx/html

# Remove unnecessary files from the image
RUN rm -rf /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/docker-compose.yml \
    /usr/share/nginx/html/.git \
    /usr/share/nginx/html/.idea

# Custom nginx config for SPA-friendly routing
RUN echo 'server { \
    listen 4200; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
