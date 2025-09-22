/**
 * Test script to verify generated API imports are working correctly
 */

// Test importing from generated models
try {
    console.log('🧪 Testing generated API imports...');
    
    // Test basic imports
    const { 
        LoginInputDTO,
        StringResultDTO,
        PlanningDTO,
        DetailInterventionDTO,
        AlerteDTOOuput,
        DrapeauxOutpuDTO,
        TranscriptionResponse,
        HistoriqueInterventionInput,
        HistoriqueInterventionOutput,
        CheckSyncRequiredInput,
        SyncOutput,
        HistoriqueDevisInput,
        HistoriqueDevisOutput,
        CountOfItemsDTO,
        ArticleDTO,
        RepReglementPDADTO,
        QualificationDTO,
        PriPrimeDTO,
        ArticleDevis
    } = require('../src/Application/ApiCalls/generated');
    
    console.log('✅ All basic model imports successful');
    
    // Test API class imports
    const { 
        AuthenticationApi,
        InterventionApi,
        ImmeubleApi,
        ReferentielApi,
        Configuration
    } = require('../src/Application/ApiCalls/generated');
    
    console.log('✅ All API class imports successful');
    
    // Test specific problematic imports
    const { InfoIntervention, Infointervention } = require('../src/Application/ApiCalls/generated');
    console.log('✅ InfoIntervention and Infointervention imports successful');
    
    console.log('🎉 All generated API imports are working correctly!');
    
} catch (error) {
    console.error('❌ Import test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}



