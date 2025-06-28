# MongoDB Setup Guide

This guide explains how to set up MongoDB cloud storage for Tony Assistant.

## Prerequisites

1. MongoDB Atlas account (free tier available)
2. Node.js and npm installed
3. Tony Assistant project set up

## Step 1: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new cluster (M0 Free tier is sufficient)
4. Set up database access:
   - Create a database user with read/write permissions
   - Note down username and password
5. Set up network access:
   - Add your IP address or use `0.0.0.0/0` for all IPs (development only)
6. Get your connection string

## Step 2: Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# MongoDB Configuration
REACT_APP_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tony_assistant?retryWrites=true&w=majority
REACT_APP_MONGODB_DB=tony_assistant

# API Configuration
REACT_APP_API_KEY=your_api_key_here
REACT_APP_API_URL=https://api.openai.com/v1

# Application Configuration
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
```

**Important:** Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials.

## Step 3: Install MongoDB Dependencies

For a production implementation, you'll need to install MongoDB driver:

```bash
npm install mongodb
```

## Step 4: Update MongoDB Service

The current implementation includes a simulated MongoDB service. To use real MongoDB:

1. Update `src/services/MongoDBService.ts` to use the actual MongoDB driver
2. Replace the simulated operations with real MongoDB operations
3. Add proper error handling and connection management

## Step 5: Configure User Context

In your application, set the user context for MongoDB sync:

```typescript
import { memorySystem } from './components/core/MemorySystem';

// Set user context (call this when user logs in)
memorySystem.setUserContext('user123', 'session456');
```

## Step 6: Test the Integration

1. Start the application
2. Create some memory nodes
3. Check the browser console for MongoDB sync messages
4. Verify data is being saved to both local storage and MongoDB

## Database Collections

The system creates the following collections:

- `memory` - Memory system data
- `ux_repository` - UX Repository data
- `learning_system` - Learning system data
- `design_system` - Design system data
- `school_bench` - School bench data
- `asset_library` - Asset library data

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Connection String**: Keep your MongoDB connection string secure
3. **Network Access**: Use specific IP addresses in production
4. **Database User**: Use least privilege principle for database users
5. **Data Encryption**: Enable encryption at rest and in transit

## Troubleshooting

### Connection Issues
- Verify your connection string is correct
- Check network access settings in MongoDB Atlas
- Ensure your IP address is whitelisted

### Authentication Issues
- Verify username and password are correct
- Check database user permissions
- Ensure the database user has access to the correct database

### Data Sync Issues
- Check browser console for error messages
- Verify MongoDB service is properly initialized
- Check if user context is set correctly

## Production Deployment

For production deployment:

1. Use environment-specific connection strings
2. Set up proper monitoring and logging
3. Implement connection pooling
4. Add retry logic for network failures
5. Set up database backups
6. Monitor database performance

## Data Privacy

- All data is stored per user and session
- Users can delete their data using the `deleteUserData()` method
- Data is automatically synced between local storage and MongoDB
- No data is shared between users

## Performance Optimization

- Local storage provides fast access for frequently used data
- MongoDB provides backup and cross-device sync
- Data is synced every 30 seconds to minimize API calls
- Failed operations are queued and retried automatically 