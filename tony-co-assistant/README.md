# Tony Assistant

A sophisticated AI assistant system with advanced memory management, learning capabilities, and comprehensive UX design tools.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Production Deployment
```bash
# Setup production environment
npm run setup:production

# Edit .env.production with your MongoDB credentials

# Deploy to production
npm run deploy
```

## 📋 Features

- **Memory System**: Advanced memory management with indexing and persistence
- **Learning System**: Pattern recognition and knowledge sharing
- **UX Repository**: Comprehensive design system and component library
- **Hybrid Storage**: Local + MongoDB cloud storage with automatic syncing
- **Real-time Communication**: Event-driven architecture with pub/sub system
- **Production Ready**: Complete deployment pipeline with security best practices

## 🗄️ Database Integration

Tony Assistant uses MongoDB for cloud storage with automatic local/cloud synchronization:

- **Local Storage**: Browser localStorage for immediate access
- **Cloud Storage**: MongoDB Atlas for persistence and cross-device sync
- **Automatic Syncing**: Every 30 seconds and on save operations
- **User Isolation**: Per-user and per-session data separation
- **Connection Management**: Automatic retry logic and connection pooling

## 📁 Project Structure

```
src/
├── components/
│   ├── core/           # Core system components
│   ├── ui/             # UI components
│   └── MongoDBStatus.tsx
├── services/
│   └── MongoDBService.ts
├── types/
│   └── tony.ts
├── store/
│   └── TonyStore.ts
└── events/
    └── EventBus.ts
```

## 🔧 Configuration

### Environment Variables

Copy `env.production.example` to `.env.production` and configure:

```bash
# MongoDB Configuration
REACT_APP_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tony_assistant
REACT_APP_MONGODB_DB=tony_assistant
REACT_APP_ENABLE_MONGODB=true

# Application Settings
REACT_APP_ENVIRONMENT=production
REACT_APP_APP_NAME=Tony Assistant
```

### MongoDB Setup

1. **MongoDB Atlas** (Recommended)
   - Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create cluster and database user
   - Configure network access
   - Get connection string

2. **Self-Hosted MongoDB**
   - Install MongoDB locally
   - Use connection string: `mongodb://localhost:27017/tony_assistant`

## 🚀 Deployment

### Automated Deployment
```bash
npm run deploy
```

### Manual Deployment Options
- **Vercel**: `npm run deploy:vercel`
- **Netlify**: `npm run deploy:netlify`
- **Manual**: Upload `build/` folder to web server

### Production Checklist
See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for complete deployment guide.

## 📊 Monitoring

- **MongoDB Atlas**: Built-in monitoring and alerts
- **Application**: Real-time connection status and statistics
- **Performance**: Automatic database indexing and optimization

## 🔒 Security

- Environment variables for sensitive data
- HTTPS enforcement in production
- MongoDB Atlas security features
- Automatic credential rotation support

## 📚 Documentation

- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)
- [MongoDB Setup Guide](./MONGODB_SETUP.md)
- [Project Roadmap](./PROJECT_ROADMAP.md)
- [Architecture Overview](./ARCHITECTURE.md)

## 🛠️ Development

### Available Scripts

```bash
npm start              # Start development server
npm run build          # Build for production
npm test               # Run tests
npm run deploy         # Automated deployment
npm run deploy:vercel  # Deploy to Vercel
npm run deploy:netlify # Deploy to Netlify
npm run test:production # Test production build locally
```

### Testing

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run production build test
npm run test:production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for troubleshooting
- Review [MongoDB Setup Guide](./MONGODB_SETUP.md) for database issues
- See [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md) for deployment help

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: December 2024
