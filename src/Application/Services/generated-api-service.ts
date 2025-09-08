/* tslint:disable */
/* eslint-disable */
/**
 * GMAO Enhanced API Service
 * 
 * This service adapts the existing apiServices.tsx to work with the generated APIs
 * from the generated/apis folder while maintaining backward compatibility.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    // Import from the generated APIs
    AuthenticationApi,
    InterventionApi,
    ImmeubleApi,
    ReferentielApi,
    Configuration,
    // Import from generated models
    LoginInputDTO,
    StringResultDTO,
    PlanningDTO,
    DrapeauxOutpuDTO,
    AlerteDTOOuput,
    TranscriptionResponse,
    DetailInterventionDTO,
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
    ArticleDevis,
    CompteurInfo,
    OperationDetail
} from '../ApiCalls/generated';

// Base URL configuration
const BASE_URL = "https://gmao.groupe-dt.fr";
// const BASE_URL = "http://161.97.82.216:9000";

// Token management
class TokenManager {
    private static instance: TokenManager;
    private token: string | null = null;

    static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    async getToken(): Promise<string | null> {
        if (!this.token) {
            this.token = await AsyncStorage.getItem('@token');
        }
        return this.token;
    }

    async setToken(token: string): Promise<void> {
        this.token = token;
        await AsyncStorage.setItem('@token', token);
    }

    async clearToken(): Promise<void> {
        this.token = null;
        await AsyncStorage.removeItem('@token');
    }
}

// API Client Factory for generated APIs
class GeneratedApiClientFactory {
    private static tokenManager = TokenManager.getInstance();

    static createConfiguration(): Configuration {
        return new Configuration({
            basePath: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    static async createAuthenticatedConfiguration(): Promise<Configuration> {
        const token = await this.tokenManager.getToken();
        return new Configuration({
            basePath: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });
    }

    static createAuthenticationApi(): AuthenticationApi {
        return new AuthenticationApi(this.createConfiguration());
    }

    static async createInterventionApi(): Promise<InterventionApi> {
        const config = await this.createAuthenticatedConfiguration();
        return new InterventionApi(config);
    }

    static async createImmeubleApi(): Promise<ImmeubleApi> {
        const config = await this.createAuthenticatedConfiguration();
        return new ImmeubleApi(config);
    }

    static async createReferentielApi(): Promise<ReferentielApi> {
        const config = await this.createAuthenticatedConfiguration();
        return new ReferentielApi(config);
    }
}

// Enhanced API Service using generated APIs
export class GeneratedApiService {
    private static tokenManager = TokenManager.getInstance();

    // Authentication Methods
    static async login(loginInput: LoginInputDTO): Promise<StringResultDTO> {
        try {
            console.log('🔐 Starting login with generated API...');
            const apiClient = GeneratedApiClientFactory.createAuthenticationApi();
            
            const response = await apiClient.apiAuthenticationLoginPost(loginInput);
            console.log('✅ Login successful:', response);
            
            if (response.status === 'success' && response.value) {
                await this.tokenManager.setToken(response.value);
                console.log('🔑 Token saved successfully');
            }
            
            return response;
        } catch (error: any) {
            console.error('❌ Login failed:', error);
            throw new Error(`Login failed: ${error.message || 'Unknown error'}`);
        }
    }

    // Intervention Methods
    static async getPlanning(): Promise<PlanningDTO> {
        try {
            console.log('📅 Fetching planning with generated API...');
            const apiClient = await GeneratedApiClientFactory.createInterventionApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiInterventionPlanningGet({ token });
            console.log('✅ Planning fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get planning failed:', error);
            throw new Error(`Get planning failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getGMAO(): Promise<PlanningDTO> {
        try {
            console.log('🏢 Fetching GMAO with generated API...');
            const apiClient = await GeneratedApiClientFactory.createInterventionApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiInterventionGMAOGet({ token });
            console.log('✅ GMAO data fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get GMAO failed:', error);
            throw new Error(`Get GMAO failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getDrapeaux(): Promise<DrapeauxOutpuDTO> {
        try {
            console.log('🚩 Fetching drapeaux with generated API...');
            const apiClient = await GeneratedApiClientFactory.createInterventionApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiInterventionGetDrapeuxGet({ token });
            console.log('✅ Drapeaux fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get drapeaux failed:', error);
            throw new Error(`Get drapeaux failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getAlertes(): Promise<AlerteDTOOuput> {
        try {
            console.log('🚨 Fetching alertes with generated API...');
            const apiClient = await GeneratedApiClientFactory.createInterventionApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiInterventionGetAlertesGet({ token });
            console.log('✅ Alertes fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get alertes failed:', error);
            throw new Error(`Get alertes failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async convertAudioToSpeech(
        speechToText?: string, 
        rapportVocalFiles?: Array<Blob>
    ): Promise<TranscriptionResponse> {
        try {
            console.log('🎤 Converting audio to speech with generated API...');
            const apiClient = await GeneratedApiClientFactory.createInterventionApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiInterventionConvertAudioToTextPost({
                token,
                speechToText,
                rapportVocalFiles
            });
            
            console.log('✅ Audio conversion successful');
            return response;
        } catch (error: any) {
            console.error('❌ Convert audio failed:', error);
            throw new Error(`Convert audio failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getInterventionDetail(noIntervention: string): Promise<DetailInterventionDTO> {
        try {
            console.log(`📋 Fetching intervention detail with generated API: ${noIntervention}`);
            const apiClient = await GeneratedApiClientFactory.createInterventionApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiInterventionGetInfoInterventionGet({
                token,
                noIntervention
            });
            
            console.log('✅ Intervention detail fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get intervention detail failed:', error);
            throw new Error(`Get intervention detail failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getHistoriqueIntervention(
        historiqueInterventionInput: HistoriqueInterventionInput
    ): Promise<HistoriqueInterventionOutput> {
        try {
            console.log('📚 Fetching intervention history with generated API...');
            const apiClient = await GeneratedApiClientFactory.createInterventionApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiInterventionGetHistoriqueInterventionPost({
                token,
                historiqueInterventionInput
            });
            
            console.log('✅ Intervention history fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get historique intervention failed:', error);
            throw new Error(`Get historique intervention failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async updateIntervention(
        noIntervention?: string,
        codeImmeuble?: string,
        devisEtablir?: number,
        bEvent?: boolean,
        noAstreint?: number,
        primeConventionnelle?: string,
        nomSignataire?: string,
        qualificationSignataire?: string,
        signature?: Blob,
        compteRendu?: string,
        latitudeDebutIntervention?: string,
        longitudeDebutIntervention?: string,
        latitudeFinIntervention?: string,
        longitudeFinIntervention?: string,
        latitudeDebutInterventionHZ?: string,
        longitudeDebutInterventionHZ?: string,
        latitudeFinInterventionHZ?: string,
        longitudeFinInterventionHZ?: string,
        dateDebut?: string,
        dateFin?: string,
        dateRealisation?: string,
        drapeau?: boolean,
        heuresSupp?: boolean,
        isAstreintte?: number,
        rapportVocalSpeechToText?: string,
        rapportVocalRapportVocalFiles?: Array<Blob>,
        interventionApresAvantFiles?: Array<Blob>,
        rapportFiles?: Array<Blob>,
        devisAvantTravauxListArticle?: Array<ArticleDevis>,
        devisAvantTravauxSignataire?: string,
        devisAvantTravauxSignature?: Blob,
        devisAvantTravauxModeReglement?: string,
        devisAvantTravauxFlagEmail?: boolean,
        devisAvantTravauxPhotosDevisAvantTravauxFiles?: Array<Blob>,
        demandeDeDevisFiles?: Array<Blob>,
        compteurInfo?: Array<CompteurInfo>,
        operationDetails?: Array<OperationDetail>
    ): Promise<StringResultDTO> {
        try {
            console.log(`💾 Updating intervention with generated API: ${noIntervention}`);
            const apiClient = await GeneratedApiClientFactory.createInterventionApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiInterventionUpdateInterventionPost({
                token,
                noIntervention,
                codeImmeuble,
                devisEtablir,
                bEvent,
                noAstreint,
                primeConventionnelle,
                nomSignataire,
                qualificationSignataire,
                signature,
                compteRendu,
                latitudeDebutIntervention,
                longitudeDebutIntervention,
                latitudeFinIntervention,
                longitudeFinIntervention,
                latitudeDebutInterventionHZ,
                longitudeDebutInterventionHZ,
                latitudeFinInterventionHZ,
                longitudeFinInterventionHZ,
                dateDebut,
                dateFin,
                dateRealisation,
                drapeau,
                heuresSupp,
                isAstreintte,
                rapportVocalSpeechToText,
                rapportVocalRapportVocalFiles,
                interventionApresAvantFiles,
                rapportFiles,
                devisAvantTravauxListArticle,
                devisAvantTravauxSignataire,
                devisAvantTravauxSignature,
                devisAvantTravauxModeReglement,
                devisAvantTravauxFlagEmail,
                devisAvantTravauxPhotosDevisAvantTravauxFiles,
                demandeDeDevisFiles,
                compteurInfo,
                operationDetails
            });
            
            console.log('✅ Intervention updated successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Update intervention failed:', error);
            throw new Error(`Update intervention failed: ${error.message || 'Unknown error'}`);
        }
    }

    // Immeuble Methods
    static async getImmeublesPagination(
        pageNumber?: number, 
        pageSize?: number
    ): Promise<Array<any>> {
        try {
            console.log(`🏠 Fetching immeubles pagination with generated API: page ${pageNumber}, size ${pageSize}`);
            const apiClient = await GeneratedApiClientFactory.createImmeubleApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiImmeubleGetInfoImmeublePaginationGet({
                token,
                pageNumber,
                pageSize
            });
            
            console.log('✅ Immeubles pagination fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get immeubles pagination failed:', error);
            throw new Error(`Get immeubles pagination failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async checkSyncRequired(
        checkSyncRequiredInput?: CheckSyncRequiredInput
    ): Promise<SyncOutput> {
        try {
            console.log('🔄 Checking sync requirement with generated API...');
            const apiClient = await GeneratedApiClientFactory.createImmeubleApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiImmeubleCheckSyncIsRequiredPost({
                token,
                checkSyncRequiredInput
            });
            
            console.log('✅ Sync requirement checked successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Check sync required failed:', error);
            throw new Error(`Check sync required failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async confirmSync(
        checkSyncRequiredInput?: CheckSyncRequiredInput
    ): Promise<SyncOutput> {
        try {
            console.log('✅ Confirming sync with generated API...');
            const apiClient = await GeneratedApiClientFactory.createImmeubleApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiImmeubleConfirmSyncPost({
                token,
                checkSyncRequiredInput
            });
            
            console.log('✅ Sync confirmed successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Confirm sync failed:', error);
            throw new Error(`Confirm sync failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getImmeublesToSync(
        checkSyncRequiredInput?: CheckSyncRequiredInput
    ): Promise<SyncOutput> {
        try {
            console.log('📥 Getting immeubles to sync with generated API...');
            const apiClient = await GeneratedApiClientFactory.createImmeubleApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiImmeubleGetImmeublesToSyncPost({
                token,
                checkSyncRequiredInput
            });
            
            console.log('✅ Immeubles to sync fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get immeubles to sync failed:', error);
            throw new Error(`Get immeubles to sync failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getHistoriqueDevis(
        historiqueDevisInput: HistoriqueDevisInput
    ): Promise<HistoriqueDevisOutput> {
        try {
            console.log('📊 Fetching devis history with generated API...');
            const apiClient = await GeneratedApiClientFactory.createImmeubleApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiImmeubleGetHistoriqueDevisImmeublePost({
                token,
                historiqueDevisInput
            });
            
            console.log('✅ Devis history fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get historique devis failed:', error);
            throw new Error(`Get historique devis failed: ${error.message || 'Unknown error'}`);
        }
    }

    // Referentiel Methods
    static async getCountOfItems(): Promise<CountOfItemsDTO> {
        try {
            console.log('📊 Fetching count of items with generated API...');
            const apiClient = await GeneratedApiClientFactory.createReferentielApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiReferentielGetCountOfItemsGet({ token });
            console.log('✅ Count of items fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get count of items failed:', error);
            throw new Error(`Get count of items failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getArticleDevis(): Promise<ArticleDTO> {
        try {
            console.log('📦 Fetching article devis with generated API...');
            const apiClient = await GeneratedApiClientFactory.createReferentielApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiReferentielGetAllArticleDevisGet({ token });
            console.log('✅ Article devis fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get article devis failed:', error);
            throw new Error(`Get article devis failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getAllModeReglement(): Promise<Array<RepReglementPDADTO>> {
        try {
            console.log('💳 Fetching all mode reglement with generated API...');
            const apiClient = await GeneratedApiClientFactory.createReferentielApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiReferentielGetAllModeReglementGet({ token });
            console.log('✅ All mode reglement fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get all mode reglement failed:', error);
            throw new Error(`Get all mode reglement failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getAllQualification(): Promise<Array<QualificationDTO>> {
        try {
            console.log('🎓 Fetching all qualifications with generated API...');
            const apiClient = await GeneratedApiClientFactory.createReferentielApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiReferentielGetAllQualificationGet({ token });
            console.log('✅ All qualifications fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get all qualifications failed:', error);
            throw new Error(`Get all qualifications failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getAllPrimeConventionelle(): Promise<Array<PriPrimeDTO>> {
        try {
            console.log('💰 Fetching all prime conventionnelle with generated API...');
            const apiClient = await GeneratedApiClientFactory.createReferentielApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiReferentielGetAllPriPrimeGet({ token });
            console.log('✅ All prime conventionnelle fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get all prime conventionnelle failed:', error);
            throw new Error(`Get all prime conventionnelle failed: ${error.message || 'Unknown error'}`);
        }
    }

    static async getAllPriPrimes(): Promise<Array<PriPrimeDTO>> {
        try {
            console.log('💰 Fetching all pri primes with generated API...');
            const apiClient = await GeneratedApiClientFactory.createReferentielApi();
            const token = await this.tokenManager.getToken();
            
            const response = await apiClient.apiReferentielGetAllPriPrimeGet({ token });
            console.log('✅ All pri primes fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get all pri primes failed:', error);
            throw new Error(`Get all pri primes failed: ${error.message || 'Unknown error'}`);
        }
    }

    // Enhanced sync function that combines all sync operations
    static async performFullSync(
        checkSyncRequiredInput?: CheckSyncRequiredInput
    ): Promise<{
        syncRequired: boolean;
        syncConfirmed: boolean;
        immeublesSynced: SyncOutput;
    }> {
        try {
            console.log('🔄 Starting full sync process with generated API...');
            
            // Step 1: Check if sync is required
            console.log('📋 Checking if sync is required...');
            const syncRequiredResponse = await this.checkSyncRequired(checkSyncRequiredInput);
            console.log('📋 Sync required response:', syncRequiredResponse);

            if (!syncRequiredResponse || syncRequiredResponse.code !== 'success') {
                throw new Error('Failed to check sync requirement: ' + (syncRequiredResponse?.message || 'Unknown error'));
            }

            // Step 2: Confirm sync
            console.log('✅ Confirming sync...');
            const syncConfirmedResponse = await this.confirmSync(checkSyncRequiredInput);
            console.log('✅ Sync confirmed response:', syncConfirmedResponse);

            if (!syncConfirmedResponse || syncConfirmedResponse.code !== 'success') {
                throw new Error('Failed to confirm sync: ' + (syncConfirmedResponse?.message || 'Unknown error'));
            }

            // Step 3: Get immeubles to sync
            console.log('📥 Getting immeubles to sync...');
            const immeublesToSyncResponse = await this.getImmeublesToSync(checkSyncRequiredInput);
            console.log('📥 Immeubles to sync response:', immeublesToSyncResponse);

            if (!immeublesToSyncResponse || immeublesToSyncResponse.code !== 'success') {
                throw new Error('Failed to get immeubles to sync: ' + (immeublesToSyncResponse?.message || 'Unknown error'));
            }

            console.log('🎉 Full sync completed successfully!');
            return {
                syncRequired: true,
                syncConfirmed: true,
                immeublesSynced: immeublesToSyncResponse
            };

        } catch (error: any) {
            console.error('❌ Full sync failed:', error);
            throw new Error(`Full sync operation failed: ${error.message || 'Unknown error'}`);
        }
    }

    // Utility function to create CheckSyncRequiredInput
    static createCheckSyncInput(
        identifiantSync: number, 
        addressMac?: string
    ): CheckSyncRequiredInput {
        return {
            identifiantSync: identifiantSync,
            addressMac: addressMac || null
        };
    }

    // Utility function to clear authentication
    static async logout(): Promise<void> {
        try {
            console.log('🚪 Logging out...');
            await this.tokenManager.clearToken();
            console.log('✅ Logout successful');
        } catch (error: any) {
            console.error('❌ Logout failed:', error);
            throw new Error(`Logout failed: ${error.message || 'Unknown error'}`);
        }
    }
}

// Export the service as default
export default GeneratedApiService;

