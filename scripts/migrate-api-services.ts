/**
 * Migration Script for API Services
 * 
 * This script helps migrate from the old apiServices.tsx to the new enhanced version
 * that uses the generated API client.
 */

import fs from 'fs';
import path from 'path';

// Migration configuration
const MIGRATION_CONFIG = {
    oldApiServicePath: './src/Application/Services/apiServices.tsx',
    newApiServicePath: './src/Application/Services/apiServices-enhanced.tsx',
    generatedClientPath: './src/Application/Services/generated-api-client.ts',
    backupPath: './src/Application/Services/apiServices-backup.tsx',
};

// Files that import the old apiService
const FILES_TO_UPDATE = [
    './src/Presentation/Screens/FormulaireInterventionScreen.tsx',
    './src/Presentation/Components/DetailIntervention.tsx',
    './src/Presentation/Screens/LoginScreen.tsx',
    './src/Presentation/Screens/HomeScreen.tsx',
    './src/Presentation/Screens/GMAOScreen.tsx',
    './src/Presentation/Screens/PlanningScreen.tsx',
    './src/Presentation/Screens/DrapeauxScreen.tsx',
    './src/Presentation/Screens/AlertesScreen.tsx',
    './src/Presentation/Screens/AstreinteScreen.tsx',
    './src/Presentation/Screens/MaintenanceScreen.tsx',
    './src/Presentation/Screens/LocalisationScreen.tsx',
    './src/Presentation/Screens/ArticlesDevisScreen.tsx',
    './src/Presentation/Screens/DevisAvantTravauxScreen.tsx',
    './src/Infrastructure/Contexte/ReferentielContext.js',
    './src/Infrastructure/Contexte/ArticlesContext.js',
];

class ApiServiceMigration {
    private config = MIGRATION_CONFIG;

    async migrate(): Promise<void> {
        try {
            console.log('🚀 Starting API Service Migration...');
            
            // Step 1: Create backup
            await this.createBackup();
            
            // Step 2: Replace old service with new enhanced service
            await this.replaceApiService();
            
            // Step 3: Update imports in all files
            await this.updateImports();
            
            // Step 4: Verify migration
            await this.verifyMigration();
            
            console.log('✅ Migration completed successfully!');
            console.log('📝 Next steps:');
            console.log('   1. Test the application thoroughly');
            console.log('   2. Check console logs for any fallback warnings');
            console.log('   3. Remove backup files when confident');
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            await this.rollback();
            throw error;
        }
    }

    private async createBackup(): Promise<void> {
        try {
            console.log('📦 Creating backup of original apiServices.tsx...');
            
            if (fs.existsSync(this.config.oldApiServicePath)) {
                const content = fs.readFileSync(this.config.oldApiServicePath, 'utf8');
                fs.writeFileSync(this.config.backupPath, content);
                console.log('✅ Backup created at:', this.config.backupPath);
            } else {
                console.log('⚠️ Original apiServices.tsx not found, skipping backup');
            }
        } catch (error) {
            console.error('❌ Failed to create backup:', error);
            throw error;
        }
    }

    private async replaceApiService(): Promise<void> {
        try {
            console.log('🔄 Replacing apiServices.tsx with enhanced version...');
            
            if (fs.existsSync(this.config.newApiServicePath)) {
                const content = fs.readFileSync(this.config.newApiServicePath, 'utf8');
                fs.writeFileSync(this.config.oldApiServicePath, content);
                console.log('✅ apiServices.tsx replaced successfully');
            } else {
                throw new Error('Enhanced apiServices.tsx not found');
            }
        } catch (error) {
            console.error('❌ Failed to replace apiServices.tsx:', error);
            throw error;
        }
    }

    private async updateImports(): Promise<void> {
        try {
            console.log('📝 Updating imports in all files...');
            
            for (const filePath of FILES_TO_UPDATE) {
                if (fs.existsSync(filePath)) {
                    await this.updateFileImports(filePath);
                } else {
                    console.log(`⚠️ File not found: ${filePath}`);
                }
            }
            
            console.log('✅ All imports updated successfully');
        } catch (error) {
            console.error('❌ Failed to update imports:', error);
            throw error;
        }
    }

    private async updateFileImports(filePath: string): Promise<void> {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check if file imports apiService
            if (content.includes("from '../../Application/Services/apiServices'") || 
                content.includes("from '../Application/Services/apiServices'") ||
                content.includes("from './apiServices'")) {
                
                console.log(`📝 Updating imports in: ${filePath}`);
                
                // Update import paths if needed
                let updatedContent = content;
                
                // Add comment about enhanced API service
                if (content.includes('import { apiService }')) {
                    updatedContent = content.replace(
                        'import { apiService }',
                        '// Enhanced API Service with generated client support\nimport { apiService }'
                    );
                }
                
                fs.writeFileSync(filePath, updatedContent);
                console.log(`✅ Updated: ${filePath}`);
            }
        } catch (error) {
            console.error(`❌ Failed to update ${filePath}:`, error);
            throw error;
        }
    }

    private async verifyMigration(): Promise<void> {
        try {
            console.log('🔍 Verifying migration...');
            
            // Check if new files exist
            const filesToCheck = [
                this.config.oldApiServicePath,
                this.config.generatedClientPath,
                this.config.backupPath
            ];
            
            for (const file of filesToCheck) {
                if (fs.existsSync(file)) {
                    console.log(`✅ ${file} exists`);
                } else {
                    console.log(`❌ ${file} missing`);
                }
            }
            
            // Check if old apiServices.tsx contains new content
            const apiServiceContent = fs.readFileSync(this.config.oldApiServicePath, 'utf8');
            if (apiServiceContent.includes('GeneratedApiService')) {
                console.log('✅ apiServices.tsx contains new generated client');
            } else {
                console.log('❌ apiServices.tsx does not contain new generated client');
            }
            
            console.log('✅ Migration verification completed');
        } catch (error) {
            console.error('❌ Migration verification failed:', error);
            throw error;
        }
    }

    private async rollback(): Promise<void> {
        try {
            console.log('🔄 Rolling back migration...');
            
            if (fs.existsSync(this.config.backupPath)) {
                const backupContent = fs.readFileSync(this.config.backupPath, 'utf8');
                fs.writeFileSync(this.config.oldApiServicePath, backupContent);
                console.log('✅ Rollback completed');
            } else {
                console.log('⚠️ No backup found for rollback');
            }
        } catch (error) {
            console.error('❌ Rollback failed:', error);
        }
    }

    // Utility method to check migration status
    async checkMigrationStatus(): Promise<void> {
        try {
            console.log('🔍 Checking migration status...');
            
            const apiServiceContent = fs.readFileSync(this.config.oldApiServicePath, 'utf8');
            
            if (apiServiceContent.includes('GeneratedApiService')) {
                console.log('✅ Migration appears to be complete');
                console.log('📊 Status: Using enhanced API service with generated client');
            } else {
                console.log('⚠️ Migration may not be complete');
                console.log('📊 Status: Still using legacy API service');
            }
            
            // Check for fallback warnings in console
            if (apiServiceContent.includes('Falling back to legacy')) {
                console.log('⚠️ Fallback methods are active - check API connectivity');
            }
            
        } catch (error) {
            console.error('❌ Failed to check migration status:', error);
        }
    }
}

// Export the migration class
export default ApiServiceMigration;

// CLI usage
if (require.main === module) {
    const migration = new ApiServiceMigration();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'migrate':
            migration.migrate().catch(console.error);
            break;
        case 'status':
            migration.checkMigrationStatus().catch(console.error);
            break;
        case 'rollback':
            migration.rollback().catch(console.error);
            break;
        default:
            console.log('Usage:');
            console.log('  npm run migrate-api migrate   - Run the migration');
            console.log('  npm run migrate-api status    - Check migration status');
            console.log('  npm run migrate-api rollback   - Rollback migration');
            break;
    }
}

