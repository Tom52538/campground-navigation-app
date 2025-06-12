# Git Workflow Guide: Replit → GitHub → Railway

## Current Repository Status

Your campground navigation app requires GitHub integration for Railway deployment. Here's the complete workflow setup.

## Step 1: GitHub Repository Setup

### 1.1 Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click "New Repository"
3. Repository name: `campground-navigation-app`
4. Set to Public
5. Do NOT initialize with README (we have existing code)
6. Click "Create repository"

### 1.2 Get Repository URL
After creation, GitHub provides:
```
https://github.com/YOUR_USERNAME/campground-navigation-app.git
```

## Step 2: Connect Replit to GitHub

### 2.1 Manual Git Setup (Required)
Since Replit has Git restrictions, use these commands in the Shell:

```bash
# Initialize git if not already done
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Campground Navigation App

- Professional React-TypeScript navigation application
- OpenRouteService routing integration
- OpenWeatherMap weather integration
- Multi-site support (Kamperland & Zuhause)
- Railway deployment configuration
- Comprehensive documentation"

# Add GitHub remote origin
git remote add origin https://github.com/YOUR_USERNAME/campground-navigation-app.git

# Push to GitHub
git push -u origin main
```

### 2.2 Alternative Method (If Git Commands Fail)
If Replit Git restrictions prevent direct commands:

1. **Download Project Files**
   - Download all files from Replit workspace
   - Create local folder: `campground-navigation-app`

2. **Local Git Setup**
   ```bash
   # Clone empty repository
   git clone https://github.com/YOUR_USERNAME/campground-navigation-app.git
   cd campground-navigation-app
   
   # Copy all Replit files to this directory
   # Then commit and push
   git add .
   git commit -m "Initial commit: Campground Navigation App"
   git push origin main
   ```

3. **GitHub Web Interface Upload**
   - Go to your GitHub repository
   - Click "uploading an existing file"
   - Drag and drop all project files
   - Commit directly to main branch

## Step 3: Verify GitHub Integration

### 3.1 Repository Structure Check
Your GitHub repository should contain:

```
campground-navigation-app/
├── client/                          # React frontend
├── server/                          # Express backend
├── shared/                          # Shared schemas
├── package.json                     # Dependencies
├── railway.toml                     # Railway config
├── build.sh                        # Build script
├── start.sh                        # Start script
├── README.md                       # Project documentation
├── DEVELOPER_DOCUMENTATION.md      # Developer guide
└── RAILWAY_DEPLOYMENT_CHECKLIST.md # Deployment guide
```

### 3.2 Branch Configuration
- **Main Branch**: `main` (default)
- **Protection**: None needed for Railway
- **Auto-merge**: Enabled for automated deployments

## Step 4: Railway Deployment Setup

### 4.1 Connect Railway to GitHub
1. Visit [railway.app](https://railway.app)
2. Sign up/Login with GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `campground-navigation-app`
6. Railway auto-detects Node.js project

### 4.2 Environment Variables (Critical)
Set these immediately in Railway dashboard:

```env
NODE_ENV=production
OPENROUTE_API_KEY=your_openroute_service_key
OPENWEATHER_API_KEY=your_openweather_map_key
```

### 4.3 Deployment Configuration
Railway uses these pre-configured files:

**railway.toml**
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "NODE_ENV=production tsx server/index.ts"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

## Step 5: Continuous Deployment Workflow

### 5.1 Development Workflow
```
Replit Development → GitHub Push → Railway Auto-Deploy
```

### 5.2 Code Changes Process
1. **Develop in Replit**: Make changes in Replit environment
2. **Test Locally**: Use `npm run dev` to test changes
3. **Commit Changes**: 
   ```bash
   git add .
   git commit -m "Feature: Description of changes"
   git push origin main
   ```
4. **Auto-Deploy**: Railway automatically deploys on GitHub push

### 5.3 Deployment Monitoring
Monitor deployments in Railway dashboard:
- Build logs and status
- Runtime performance
- Error tracking
- Environment variables

## Step 6: API Keys Setup

### 6.1 OpenRouteService API Key
1. Visit [openrouteservice.org](https://openrouteservice.org)
2. Create free account
3. Generate API key in dashboard
4. Add to Railway environment variables

### 6.2 OpenWeatherMap API Key
1. Visit [openweathermap.org](https://openweathermap.org/api)
2. Create free account
3. Generate API key
4. Add to Railway environment variables

## Step 7: Testing & Verification

### 7.1 Post-Deployment Testing
Test these endpoints after Railway deployment:

```bash
# Replace with your Railway app URL
export APP_URL="https://your-app.railway.app"

# Health check
curl $APP_URL/api/health

# POI data
curl "$APP_URL/api/pois?site=kamperland"

# Weather data
curl "$APP_URL/api/weather?lat=51.589795&lng=3.721826"
```

### 7.2 Frontend Testing
- Navigate to Railway app URL
- Test map loading and interaction
- Verify POI markers and categories
- Test route calculation
- Check weather widget functionality
- Verify mobile responsiveness

## Troubleshooting

### Git Issues
**Problem**: `Permission denied` or authentication errors
**Solution**: Use GitHub personal access token instead of password

**Problem**: `Repository not found`
**Solution**: Verify repository URL and access permissions

### Railway Issues
**Problem**: Build fails
**Solution**: Check build logs, verify package.json scripts

**Problem**: Environment variables not loading
**Solution**: Verify all required variables are set in Railway dashboard

**Problem**: API endpoints return errors
**Solution**: Check API keys are valid and properly set

## Maintenance

### Regular Tasks
- Monitor API usage limits
- Check deployment logs
- Update dependencies monthly
- Review performance metrics

### Git Best Practices
- Use descriptive commit messages
- Keep commits focused and atomic
- Test changes before pushing
- Use branching for major features

Your campground navigation app is now ready for the complete Replit → GitHub → Railway deployment workflow.