# Production Deployment Guide

This guide will help you deploy Tony Assistant to production with real MongoDB integration.

## Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (or self-hosted MongoDB)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Step 1: MongoDB Setup

### Option A: MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 tier is free)

2. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these securely)
   - Set privileges to "Read and write to any database"

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For production: Add your server's IP address
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)

4. **Get Connection String**
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### Option B: Self-Hosted MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS
   brew install mongodb-community
   
   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   
   # macOS
   brew services start mongodb-community
   ```

3. **Create Connection String**
   ```
   mongodb://localhost:27017/tony_assistant
   ```

## Step 2: Environment Configuration

1. **Copy Environment Template**
   ```bash
   cp env.production.example .env.production
   ```

2. **Configure Environment Variables**
   Edit `.env.production` and update the following:

   ```bash
   # Replace with your actual MongoDB connection string
   REACT_APP_MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/tony_assistant?retryWrites=true&w=majority
   
   # Database name (can be anything you prefer)
   REACT_APP_MONGODB_DB=tony_assistant
   
   # Enable MongoDB
   REACT_APP_ENABLE_MONGODB=true
   
   # Set environment to production
   REACT_APP_ENVIRONMENT=production
   ```

3. **Optional: Configure Additional Settings**
   ```bash
   # Performance tuning
   REACT_APP_MONGODB_SYNC_INTERVAL=30000
   REACT_APP_MONGODB_RETRY_ATTEMPTS=3
   REACT_APP_MONGODB_MAX_POOL_SIZE=10
   
   # Analytics (optional)
   REACT_APP_ANALYTICS_ID=your_google_analytics_id
   ```

## Step 3: Build for Production

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Production Bundle**
   ```bash
   npm run build
   ```

3. **Test Production Build Locally**
   ```bash
   npx serve -s build
   ```

## Step 4: Deploy to Production

### Option A: Vercel (Recommended for React Apps)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel Dashboard**
   - Go to your project in Vercel dashboard
   - Go to Settings > Environment Variables
   - Add all variables from `.env.production`

### Option B: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod --dir=build
   ```

3. **Configure Environment Variables in Netlify Dashboard**
   - Go to Site settings > Environment variables
   - Add all variables from `.env.production`

### Option C: Traditional Web Server

1. **Upload Build Files**
   ```bash
   # Upload the entire 'build' folder to your web server
   scp -r build/* user@your-server:/var/www/html/
   ```

2. **Configure Web Server**
   
   **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header Referrer-Policy "no-referrer-when-downgrade" always;
       add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
   }
   ```

## Step 5: SSL/HTTPS Setup

### Option A: Let's Encrypt (Free)

1. **Install Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Option B: Cloudflare (Free)

1. **Add Domain to Cloudflare**
2. **Update DNS to point to Cloudflare**
3. **Enable SSL/TLS encryption mode to "Full"**

## Step 6: Security Configuration

1. **Environment Variables Security**
   - Never commit `.env.production` to version control
   - Use platform-specific secret management
   - Rotate credentials regularly

2. **MongoDB Security**
   - Use strong passwords
   - Enable IP whitelisting
   - Enable MongoDB Atlas security features
   - Consider using MongoDB Atlas VPC peering for additional security

3. **Application Security**
   - Enable HTTPS only
   - Set up Content Security Policy
   - Configure CORS properly
   - Implement rate limiting

## Step 7: Monitoring and Maintenance

1. **Set Up Monitoring**
   ```bash
   # MongoDB Atlas provides built-in monitoring
   # For application monitoring, consider:
   # - Sentry for error tracking
   # - Google Analytics for usage analytics
   # - Uptime monitoring (UptimeRobot, Pingdom)
   ```

2. **Database Maintenance**
   ```bash
   # Regular backups (MongoDB Atlas provides automatic backups)
   # Monitor database size and performance
   # Set up alerts for connection issues
   ```

3. **Application Updates**
   ```bash
   # Set up CI/CD pipeline for automatic deployments
   # Test updates in staging environment first
   # Monitor for breaking changes
   ```

## Step 8: Testing Production Deployment

1. **Test MongoDB Connection**
   - Open the application
   - Check browser console for MongoDB connection logs
   - Verify data is being saved/loaded correctly

2. **Test All Features**
   - Memory system functionality
   - UX repository operations
   - Learning system features
   - Cross-component communication

3. **Performance Testing**
   - Test with multiple users
   - Monitor database performance
   - Check application response times

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string format
   - Verify network access settings
   - Ensure credentials are correct
   - Check if MongoDB service is running

2. **Environment Variables Not Loading**
   - Verify variable names start with `REACT_APP_`
   - Check platform-specific environment variable configuration
   - Restart application after changes

3. **Build Errors**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check Node.js version compatibility

4. **CORS Issues**
   - Configure MongoDB Atlas CORS settings
   - Check web server CORS configuration
   - Verify domain is whitelisted

### Support

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- React Deployment Guide: https://create-react-app.dev/docs/deployment/
- Vercel Documentation: https://vercel.com/docs
- Netlify Documentation: https://docs.netlify.com/

## Next Steps

After successful deployment:

1. **Set up monitoring and alerting**
2. **Implement user authentication** (if needed)
3. **Add analytics and error tracking**
4. **Plan for scaling** (database optimization, CDN, etc.)
5. **Document deployment procedures** for team members

Your Tony Assistant is now production-ready with real MongoDB integration! 