# API Services Migration Guide

## 🚀 Overview

This guide helps you migrate from the legacy `apiServices.tsx` to the new enhanced version that uses the generated OpenAPI client.

## 📋 What's New

### ✅ Enhanced Features:
- **Generated API Client**: Uses OpenAPI Generator for type-safe API calls
- **Better Error Handling**: Comprehensive error handling with fallback mechanisms
- **Improved Logging**: Detailed console logging with emojis for better debugging
- **Token Management**: Centralized token management with automatic refresh
- **Fallback Support**: Automatic fallback to legacy methods if new client fails
- **Type Safety**: Full TypeScript support with generated interfaces

### 🔧 Architecture:
```
apiServices.tsx (Enhanced)
├── GeneratedApiService (New generated client)
├── Legacy API calls (Fallback)
└── Token management
```

## 🛠️ Migration Steps

### Step 1: Generate API Client
```bash
# Install OpenAPI Generator CLI
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i https://your-api-url/swagger.json \
  -g typescript-fetch \
  -o ./src/Application/ApiCalls/generated \
  --additional-properties=typescriptThreePlus=true,supportsES6=true,platform=react-native
```

### Step 2: Run Migration Script
```bash
# Run the migration
npm run migrate-api migrate

# Check migration status
npm run migrate-api status

# Rollback if needed
npm run migrate-api rollback
```

### Step 3: Update Package.json
Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "generate-api": "openapi-generator-cli generate -i https://your-api-url/swagger.json -g typescript-fetch -o ./src/Application/ApiCalls/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,platform=react-native",
    "migrate-api": "ts-node scripts/migrate-api-services.ts",
    "api:full": "npm run generate-api && npm run migrate-api migrate"
  }
}
```

## 📁 File Structure

```
src/Application/Services/
├── apiServices.tsx                    # Enhanced API service (replaces old)
├── apiServices-enhanced.tsx          # New enhanced version
├── generated-api-client.ts           # Generated API client wrapper
└── apiServices-backup.tsx            # Backup of original (created during migration)

scripts/
└── migrate-api-services.ts           # Migration script
```

## 🔄 How It Works

### 1. **Primary Path**: Generated API Client
```typescript
// Uses the new generated client
const response = await GeneratedApiService.getPlanning();
```

### 2. **Fallback Path**: Legacy API Calls
```typescript
// Falls back to legacy method if new client fails
try {
    return await GeneratedApiService.getPlanning();
} catch (error) {
    // Fallback to legacy method
    const apiClient = new InterventionApi(new Configuration({ basePath: url }));
    const response = await apiClient.apiInterventionPlanningGet(token);
    return response.data;
}
```

### 3. **Token Management**
```typescript
// Centralized token management
class TokenManager {
    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem('@token');
    }
    
    async setToken(token: string): Promise<void> {
        await AsyncStorage.setItem('@token', token);
    }
}
```

## 🎯 Benefits

### ✅ **Immediate Benefits:**
- **Zero Downtime**: Fallback ensures no breaking changes
- **Better Debugging**: Enhanced logging with emojis and context
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error management

### ✅ **Long-term Benefits:**
- **Maintainability**: Generated code stays in sync with API
- **Performance**: Optimized API calls
- **Scalability**: Easy to add new endpoints
- **Documentation**: Auto-generated from Swagger

## 🔍 Monitoring

### Console Logs:
- `🔐 Starting login process...` - New client being used
- `⚠️ Falling back to legacy login method...` - Fallback activated
- `✅ Login successful` - Operation completed successfully
- `❌ Login failed` - Error occurred

### Migration Status:
```bash
npm run migrate-api status
```

## 🚨 Troubleshooting

### Common Issues:

1. **Import Errors**:
   ```bash
   # Check if all files were updated
   npm run migrate-api status
   ```

2. **API Connectivity**:
   ```bash
   # Check console for fallback warnings
   # Ensure API URL is correct in generated client
   ```

3. **Type Errors**:
   ```bash
   # Regenerate API client with correct types
   npm run generate-api
   ```

### Rollback:
```bash
# If issues occur, rollback to original
npm run migrate-api rollback
```

## 📊 Performance Impact

### Before Migration:
- Manual API client instantiation
- Basic error handling
- No type safety
- Limited logging

### After Migration:
- Centralized client management
- Comprehensive error handling
- Full type safety
- Enhanced logging
- Automatic fallback

## 🔮 Future Enhancements

1. **Remove Fallbacks**: Once confident, remove legacy fallback methods
2. **Add Retry Logic**: Implement automatic retry for failed requests
3. **Caching**: Add response caching for better performance
4. **Offline Support**: Enhance offline capabilities
5. **Real-time Updates**: Add WebSocket support for real-time data

## 📞 Support

If you encounter issues during migration:

1. Check the console logs for detailed error messages
2. Verify API connectivity and Swagger documentation
3. Use the rollback feature if needed
4. Check the migration status with `npm run migrate-api status`

## 🎉 Success Criteria

Migration is successful when:
- ✅ All API calls work without errors
- ✅ Console shows new client being used (not fallbacks)
- ✅ TypeScript compilation passes
- ✅ App functionality remains unchanged
- ✅ Enhanced logging is visible in console

---

**Happy Migrating! 🚀**

