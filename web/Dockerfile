# Use nginx alpine image
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the pre-built application
COPY ./dist /usr/share/nginx/html

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001 -G nodejs

# Set proper permissions
RUN chown -R appuser:nodejs /usr/share/nginx/html
RUN chown -R appuser:nodejs /var/cache/nginx
RUN chown -R appuser:nodejs /var/log/nginx
RUN chown -R appuser:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R appuser:nodejs /var/run/nginx.pid

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Switch to non-root user
USER appuser

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]