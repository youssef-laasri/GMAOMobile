/**
 * Simple Migration Script for Generated API Integration
 * 
 * This script helps verify that the generated API integration is working correctly.
 */

import fs from 'fs';
import path from 'path';

class SimpleApiMigration {
    private config = {
        apiServicePath: './src/Application/Services/apiServices.tsx',
        generatedApisPath: './src/Application/ApiCalls/generated',
        backupPath: './src/Application/Services/apiServices-backup.tsx',
    };

    async verifyIntegration(): Promise<void> {
        try {
            console.log('🔍 Verifying Generated API Integration...');
            
            // Step 1: Check if generated APIs exist
            await this.checkGeneratedApis();
            
            // Step 2: Check if apiServices.tsx uses generated APIs
            await this.checkApiServiceIntegration();
            
            // Step 3: Check for any issues
            await this.checkForIssues();
            
            console.log('✅ Generated API Integration verification completed successfully!');
            console.log('📝 Your API service is now using the generated APIs from generated/apis');
            
        } catch (error) {
            console.error('❌ Verification failed:', error);
            throw error;
        }
    }

    private async checkGeneratedApis(): Promise<void> {
        console.log('📁 Checking generated API files...');
        
        const requiredFiles = [
            `${this.config.generatedApisPath}/apis/AuthenticationApi.ts`,
            `${this.config.generatedApisPath}/apis/InterventionApi.ts`,
            `${this.config.generatedApisPath}/apis/ImmeubleApi.ts`,
            `${this.config.generatedApisPath}/apis/ReferentielApi.ts`,
            `${this.config.generatedApisPath}/models/index.ts`,
            `${this.config.generatedApisPath}/runtime.ts`,
        ];
        
        for (const file of requiredFiles) {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file} exists`);
            } else {
                throw new Error(`Required generated API file missing: ${file}`);
            }
        }
        
        console.log('✅ All generated API files verified');
    }

    private async checkApiServiceIntegration(): Promise<void> {
        console.log('🔧 Checking API service integration...');
        
        if (!fs.existsSync(this.config.apiServicePath)) {
            throw new Error('API service file not found');
        }
        
        const content = fs.readFileSync(this.config.apiServicePath, 'utf8');
        
        // Check for generated API imports
        if (content.includes("from '../ApiCalls/generated'")) {
            console.log('✅ Generated API imports found');
        } else {
            throw new Error('Generated API imports not found in apiServices.tsx');
        }
        
        // Check for generated API usage
        if (content.includes('AuthenticationApi') && content.includes('InterventionApi')) {
            console.log('✅ Generated API classes being used');
        } else {
            throw new Error('Generated API classes not being used');
        }
        
        // Check for enhanced logging
        if (content.includes('🔐 Starting login with generated API')) {
            console.log('✅ Enhanced logging found');
        } else {
            console.log('⚠️ Enhanced logging not found');
        }
        
        console.log('✅ API service integration verified');
    }

    private async checkForIssues(): Promise<void> {
        console.log('🔍 Checking for potential issues...');
        
        const content = fs.readFileSync(this.config.apiServicePath, 'utf8');
        
        // Check for token handling
        if (content.includes('getTokenOrUndefined')) {
            console.log('✅ Proper token handling found');
        } else {
            console.log('⚠️ Token handling may need review');
        }
        
        // Check for error handling
        if (content.includes('console.error') && content.includes('throw new Error')) {
            console.log('✅ Error handling found');
        } else {
            console.log('⚠️ Error handling may need review');
        }
        
        console.log('✅ Issue check completed');
    }

    async createBackup(): Promise<void> {
        try {
            console.log('📦 Creating backup...');
            
            if (fs.existsSync(this.config.apiServicePath)) {
                const content = fs.readFileSync(this.config.apiServicePath, 'utf8');
                fs.writeFileSync(this.config.backupPath, content);
                console.log('✅ Backup created at:', this.config.backupPath);
            } else {
                console.log('⚠️ API service file not found, skipping backup');
            }
        } catch (error) {
            console.error('❌ Failed to create backup:', error);
            throw error;
        }
    }

    async showStatus(): Promise<void> {
        try {
            console.log('📊 Generated API Integration Status:');
            console.log('');
            
            // Check integration status
            const content = fs.readFileSync(this.config.apiServicePath, 'utf8');
            
            if (content.includes("from '../ApiCalls/generated'")) {
                console.log('✅ Status: Generated APIs integrated');
                console.log('📁 Using APIs from: generated/apis folder');
                console.log('🔧 Token handling: Enhanced with getTokenOrUndefined()');
                console.log('📝 Logging: Enhanced with emoji-based console logs');
            } else {
                console.log('❌ Status: Generated APIs not integrated');
                console.log('📁 Still using: Legacy API calls');
            }
            
            console.log('');
            console.log('🎯 Next Steps:');
            console.log('   1. Test your application thoroughly');
            console.log('   2. Check console logs for generated API usage');
            console.log('   3. Monitor for any errors or issues');
            console.log('   4. Remove backup file when confident');
            
        } catch (error) {
            console.error('❌ Failed to show status:', error);
        }
    }
}

// Export the migration class
export default SimpleApiMigration;

// CLI usage
if (require.main === module) {
    const migration = new SimpleApiMigration();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'verify':
            migration.verifyIntegration().catch(console.error);
            break;
        case 'backup':
            migration.createBackup().catch(console.error);
            break;
        case 'status':
            migration.showStatus().catch(console.error);
            break;
        default:
            console.log('Generated API Integration Helper');
            console.log('');
            console.log('Usage:');
            console.log('  npm run api-integration verify  - Verify integration');
            console.log('  npm run api-integration backup  - Create backup');
            console.log('  npm run api-integration status - Show status');
            console.log('');
            console.log('Examples:');
            console.log('  node scripts/simple-api-migration.js verify');
            console.log('  node scripts/simple-api-migration.js status');
            break;
    }
}



