# PARI Frontend Deployment Guide

## Server: fev2.ruralindiaonline.org

## Quick Deployment Steps

### 1. Build the Application
```bash
cd /root/Pari-frontend
npm install
npm run build
```

### 2. Start with PM2
```bash
# Create logs directory
mkdir -p logs

# Start the app
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot (run once)
pm2 startup
```

### 3. Test Nginx Configuration
```bash
# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 4. Verify Deployment
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs pari-frontend

# Check if app is running locally
curl http://localhost:3000

# Check if accessible via domain
curl https://fev2.ruralindiaonline.org
```

## PM2 Commands

```bash
# View status
pm2 status

# View logs (real-time)
pm2 logs pari-frontend

# View error logs only
pm2 logs pari-frontend --err

# Restart app
pm2 restart pari-frontend

# Stop app
pm2 stop pari-frontend

# Delete from PM2
pm2 delete pari-frontend

# Monitor CPU/Memory
pm2 monit
```

## Update/Redeploy

```bash
cd /root/Pari-frontend

# Pull latest code (if using git)
git pull origin main

# Install dependencies (if package.json changed)
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart pari-frontend

# Or use reload for zero-downtime
pm2 reload pari-frontend
```

## Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload nginx (graceful)
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/pari-access.log
sudo tail -f /var/log/nginx/pari-error.log
```

## Environment Variables

Create `.env.local` in the project root:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://production.ruralindiaonline.org
NEXT_PUBLIC_BREVO_API_KEY=your-api-key
# Add other variables as needed
```

## Troubleshooting

### App not starting
```bash
# Check PM2 logs
pm2 logs pari-frontend --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Kill process on port 3000
sudo kill -9 $(sudo lsof -t -i:3000)
```

### Nginx errors
```bash
# Check nginx error log
sudo tail -100 /var/log/nginx/pari-error.log

# Check nginx is running
sudo systemctl status nginx

# Restart nginx
sudo systemctl restart nginx
```

### SSL certificate renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Check certificate expiry
sudo certbot certificates
```

## Performance Monitoring

```bash
# Check system resources
htop

# Check disk usage
df -h

# Check PM2 metrics
pm2 monit

# View nginx access logs
sudo tail -f /var/log/nginx/pari-access.log
```

## Architecture

```
Internet → Nginx (Port 443/HTTPS) → Next.js App (Port 3000) → Backend API
                ↓
         SSL/TLS (Let's Encrypt)
```

- **Domain**: fev2.ruralindiaonline.org
- **SSL**: Let's Encrypt (auto-renewal)
- **Process Manager**: PM2 (cluster mode, auto-restart)
- **Reverse Proxy**: Nginx (caching, gzip, security headers)
- **Next.js**: Port 3000 (SSG + API routes)
