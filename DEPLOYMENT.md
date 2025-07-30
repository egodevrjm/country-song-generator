# Deployment Guide

This guide will help you deploy the Alex Wilson Country Song Generator to various platforms.

## Prerequisites

- Node.js 14+ installed
- Git installed
- Anthropic API key

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/egodevrjm/country-song-generator.git
   cd country-song-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment Options

### Deploy to Heroku

1. Install Heroku CLI
2. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts and add environment variables

### Deploy to DigitalOcean App Platform

1. Create a new app on DigitalOcean
2. Connect your GitHub repository
3. Configure environment variables
4. Set build command: `npm install`
5. Set run command: `npm start`

### Deploy to AWS (EC2)

1. Launch an EC2 instance (Ubuntu recommended)
2. SSH into your instance
3. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. Clone your repository:
   ```bash
   git clone https://github.com/egodevrjm/country-song-generator.git
   cd country-song-generator
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

6. Install PM2 for process management:
   ```bash
   sudo npm install -g pm2
   ```

7. Create `.env` file with your configuration

8. Start the application:
   ```bash
   pm2 start server.js --name "country-song-generator"
   pm2 save
   pm2 startup
   ```

9. Configure Nginx as reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Deploy with Docker

1. Create a `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .

   EXPOSE 3000

   CMD ["node", "server.js"]
   ```

2. Build the Docker image:
   ```bash
   docker build -t country-song-generator .
   ```

3. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env country-song-generator
   ```

## Environment Variables

For production deployments, ensure these environment variables are set:

- `NODE_ENV=production`
- `PORT` (if different from 3000)

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Consider implementing rate limiting for the API endpoints
4. **CORS**: Configure CORS appropriately for your domain

## Monitoring

Consider setting up monitoring with:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry, Rollbar
- **Analytics**: Google Analytics, Plausible

## Backup

Regular backups of `song-history.json` are recommended if you want to preserve user-generated content.

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Module not found**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Permission denied**:
   ```bash
   sudo chown -R $USER:$USER .
   ```

## Performance Optimization

1. **Enable gzip compression** in Express
2. **Implement caching** for static assets
3. **Use a CDN** for Font Awesome and other libraries
4. **Minify** CSS and JavaScript for production

## Scaling

For high traffic:
1. Use a load balancer (Nginx, HAProxy)
2. Run multiple Node.js instances with PM2
3. Consider using Redis for session storage
4. Implement database for song history instead of JSON file

---

For more help, please open an issue on GitHub or check the documentation.
