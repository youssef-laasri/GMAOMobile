import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    // Import from the generated APIs directly
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
    ArticleDevis
} from '../ApiCalls/generated';

// Base URL configuration
const BASE_URL = "https://gmao.groupe-dt.fr";
// const BASE_URL = "http://161.97.82.216:9000";

// Token management
let token: string | null;

async function getToken() {
    token = await AsyncStorage.getItem('@token');
    return token;
}

async function setToken(newToken: string) {
    token = newToken;
    await AsyncStorage.setItem('@token', newToken);
}

async function clearToken() {
    token = null;
    await AsyncStorage.removeItem('@token');
}

// Helper function to get token or undefined
async function getTokenOrUndefined(): Promise<string | undefined> {
    const tokenValue = await getToken();
    return tokenValue || undefined;
}

// Enhanced API Service using generated APIs directly
export const apiService = {

    // Authentication Methods
    login: async (loginInput: LoginInputDTO): Promise<StringResultDTO> => {
        try {
            console.log('🔐 Starting login with generated API...');
            const apiClient = new AuthenticationApi(new Configuration({
                basePath: BASE_URL,
            }));
            
            const response = await apiClient.apiAuthenticationLoginPost({
                loginInputDTO: loginInput
            });
            
            console.log('✅ Login successful:', response);
            
            if (response.status === 'success' && response.value) {
                await setToken(response.value);
                console.log('🔑 Token saved successfully');
            }
            
            return response;
        } catch (error: any) {
            console.error('❌ Login failed:', error);
            throw new Error(`Login failed: ${error.message || 'Unknown error'}`);
        }
    },

    // Intervention Methods
    getPlanning: async (): Promise<PlanningDTO> => {
        try {
            console.log('📅 Fetching planning with generated API...');
            const apiClient = new InterventionApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            const response = await apiClient.apiInterventionPlanningGet({ token });
            console.log('✅ Planning fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get planning failed:', error);
            throw new Error(`Get planning failed: ${error.message || 'Unknown error'}`);
        }
    },

    getGMAO: async (): Promise<PlanningDTO> => {
        try {
            console.log('🏢 Fetching GMAO with generated API...');
            const apiClient = new InterventionApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            const response = await apiClient.apiInterventionGMAOGet({ token });
            console.log('✅ GMAO data fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get GMAO failed:', error);
            throw new Error(`Get GMAO failed: ${error.message || 'Unknown error'}`);
        }
    },

    getDrapeaux: async (): Promise<DrapeauxOutpuDTO> => {
        try {
            console.log('🚩 Fetching drapeaux with generated API...');
            const apiClient = new InterventionApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            const response = await apiClient.apiInterventionGetDrapeuxGet({ token });
            console.log('✅ Drapeaux fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get drapeaux failed:', error);
            throw new Error(`Get drapeaux failed: ${error.message || 'Unknown error'}`);
        }
    },

    getAlertes: async (): Promise<AlerteDTOOuput> => {
        try {
            console.log('🚨 Fetching alertes with generated API...');
            const apiClient = new InterventionApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            const response = await apiClient.apiInterventionGetAlertesGet({ token });
            console.log('✅ Alertes fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get alertes failed:', error);
            throw new Error(`Get alertes failed: ${error.message || 'Unknown error'}`);
        }
    },

    ConvertAudioToSpeech: async (speechToText?: string, rapportVocalFiles?: Array<File>): Promise<TranscriptionResponse> => {
        try {
            console.log('🎤 Converting audio to speech with generated API...');
            const apiClient = new InterventionApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            // Convert File[] to Blob[] for generated API
            const blobFiles = rapportVocalFiles?.map(file => new Blob([file])) || [];
            
            const response = await apiClient.apiInterventionConvertAudioToTextPost({
                token,
                speechToText,
                rapportVocalFiles: blobFiles
            });
            
            console.log('✅ Audio conversion successful');
            return response;
        } catch (error: any) {
            console.error('❌ Convert audio failed:', error);
            throw new Error(`Convert audio failed: ${error.message || 'Unknown error'}`);
        }
    },

    getInterventionDetail: async (noIntervention: string): Promise<DetailInterventionDTO> => {
        try {
            console.log(`📋 Fetching intervention detail with generated API: ${noIntervention}`);
            const apiClient = new InterventionApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
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
    },

    getHistoriqueIntervention: async (historiqueInterventionInput: HistoriqueInterventionInput): Promise<HistoriqueInterventionOutput> => {
        try {
            console.log('📚 Fetching intervention history with generated API...');
            const apiClient = new InterventionApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
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
    },

    updateIntervention: async (
        noIntervention?: string,
        codeImmeuble?: string,
        devisEtablir?: number,
        bEvent?: boolean,
        noAstreint?: number,
        primeConventionnelle?: string,
        nomSignataire?: string,
        qualificationSignataire?: string,
        signature?: File,
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
        rapportVocalRapportVocalFiles?: Array<File>,
        interventionApresAvantFiles?: Array<File>,
        rapportFiles?: Array<File>,
        devisAvantTravauxListArticle?: Array<ArticleDevis>,
        devisAvantTravauxSignataire?: string,
        devisAvantTravauxSignature?: File,
        devisAvantTravauxModeReglement?: string,
        devisAvantTravauxFlagEmail?: boolean,
        devisAvantTravauxPhotosDevisAvantTravauxFiles?: Array<File>,
        demandeDeDevisFiles?: Array<File>
    ): Promise<StringResultDTO> => {
        try {
            console.log(`💾 Updating intervention with generated API: ${noIntervention}`);
            const apiClient = new InterventionApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            // Convert File[] to Blob[] for generated API
            const signatureBlob = signature ? new Blob([signature]) : undefined;
            const rapportVocalBlobs = rapportVocalRapportVocalFiles?.map(file => new Blob([file])) || [];
            const interventionApresAvantBlobs = interventionApresAvantFiles?.map(file => new Blob([file])) || [];
            const rapportBlobs = rapportFiles?.map(file => new Blob([file])) || [];
            const devisAvantTravauxSignatureBlob = devisAvantTravauxSignature ? new Blob([devisAvantTravauxSignature]) : undefined;
            const devisAvantTravauxPhotosBlobs = devisAvantTravauxPhotosDevisAvantTravauxFiles?.map(file => new Blob([file])) || [];
            const demandeDeDevisBlobs = demandeDeDevisFiles?.map(file => new Blob([file])) || [];
            
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
                signature: signatureBlob,
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
                rapportVocalRapportVocalFiles: rapportVocalBlobs,
                interventionApresAvantFiles: interventionApresAvantBlobs,
                rapportFiles: rapportBlobs,
                devisAvantTravauxListArticle,
                devisAvantTravauxSignataire,
                devisAvantTravauxSignature: devisAvantTravauxSignatureBlob,
                devisAvantTravauxModeReglement,
                devisAvantTravauxFlagEmail,
                devisAvantTravauxPhotosDevisAvantTravauxFiles: devisAvantTravauxPhotosBlobs,
                demandeDeDevisFiles: demandeDeDevisBlobs
            });
            
            console.log('✅ Intervention updated successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Update intervention failed:', error);
            throw new Error(`Update intervention failed: ${error.message || 'Unknown error'}`);
        }
    },

    // Immeuble Methods
    getImmeublesPagination: async (pageNumber?: number, pageSize?: number): Promise<any> => {
        try {
            console.log(`🏠 Fetching immeubles pagination with generated API: page ${pageNumber}, size ${pageSize}`);
            const apiClient = new ImmeubleApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
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
    },

    checkSyncRequired: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<SyncOutput> => {
        try {
            console.log('🔄 Checking sync requirement with generated API...');
            const apiClient = new ImmeubleApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
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
    },

    confirmSync: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<SyncOutput> => {
        try {
            console.log('✅ Confirming sync with generated API...');
            const apiClient = new ImmeubleApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
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
    },

    getImmeublesToSync: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<SyncOutput> => {
        try {
            console.log('📥 Getting immeubles to sync with generated API...');
            const apiClient = new ImmeubleApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
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
    },

    getHistoriqueDevis: async (historiqueDevisInput: HistoriqueDevisInput): Promise<HistoriqueDevisOutput> => {
        try {
            console.log('📊 Fetching devis history with generated API...');
            const apiClient = new ImmeubleApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
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
    },

    // Referentiel Methods
    getCountOfItems: async (): Promise<CountOfItemsDTO> => {
        try {
            console.log('📊 Fetching count of items with generated API...');
            const apiClient = new ReferentielApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            const response = await apiClient.apiReferentielGetCountOfItemsGet({ token });
            console.log('✅ Count of items fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get count of items failed:', error);
            throw new Error(`Get count of items failed: ${error.message || 'Unknown error'}`);
        }
    },

    getArticleDevis: async (): Promise<ArticleDTO> => {
        try {
            console.log('📦 Fetching article devis with generated API...');
            const apiClient = new ReferentielApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            const response = await apiClient.apiReferentielGetAllArticleDevisGet({ token });
            console.log('✅ Article devis fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get article devis failed:', error);
            throw new Error(`Get article devis failed: ${error.message || 'Unknown error'}`);
        }
    },

    getAllModeRegelement: async (): Promise<Array<RepReglementPDADTO>> => {
        try {
            console.log('💳 Fetching all mode reglement with generated API...');
            const apiClient = new ReferentielApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            const response = await apiClient.apiReferentielGetAllModeReglementGet({ token });
            console.log('✅ All mode reglement fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get all mode reglement failed:', error);
            throw new Error(`Get all mode reglement failed: ${error.message || 'Unknown error'}`);
        }
    },

    getAllQualification: async (): Promise<Array<QualificationDTO>> => {
        try {
            console.log('🎓 Fetching all qualifications with generated API...');
            const apiClient = new ReferentielApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            const response = await apiClient.apiReferentielGetAllQualificationGet({ token });
            console.log('✅ All qualifications fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get all qualifications failed:', error);
            throw new Error(`Get all qualifications failed: ${error.message || 'Unknown error'}`);
        }
    },

    getAllPrimeConventionelle: async (): Promise<Array<PriPrimeDTO>> => {
        try {
            console.log('💰 Fetching all prime conventionnelle with generated API...');
            const apiClient = new ReferentielApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            const response = await apiClient.apiReferentielGetAllPriPrimeGet({ token });
            console.log('✅ All prime conventionnelle fetched successfully');
            return response;
        } catch (error: any) {
            console.error('❌ Get all prime conventionnelle failed:', error);
            throw new Error(`Get all prime conventionnelle failed: ${error.message || 'Unknown error'}`);
        }
    },

    getAllPriPrimes: async (): Promise<Array<PriPrimeDTO>> => {
        try {
            console.log('💰 Fetching all pri primes with generated API...');
            const apiClient = new ReferentielApi(new Configuration({
                basePath: BASE_URL,
            }));
            const token = await getTokenOrUndefined();
            
            const response = await apiClient.apiReferentielGetAllPriPrimeGet({ token });
            console.log('✅ All pri primes fetched successfully', response);
            return response;
        } catch (error: any) {
            console.error('❌ Get all pri primes failed:', error);
            throw new Error(`Get all pri primes failed: ${error.message || 'Unknown error'}`);
        }
    },

    // Enhanced sync function that combines all sync operations
    performFullSync: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<{
        syncRequired: boolean;
        syncConfirmed: boolean;
        immeublesSynced: SyncOutput;
    }> => {
        try {
            console.log('🔄 Starting full sync process with generated API...');
            
            // Step 1: Check if sync is required
            console.log('📋 Checking if sync is required...');
            const syncRequiredResponse = await apiService.checkSyncRequired(checkSyncRequiredInput);
            console.log('📋 Sync required response:', syncRequiredResponse);

            if (!syncRequiredResponse || syncRequiredResponse.code !== 'success') {
                throw new Error('Failed to check sync requirement: ' + (syncRequiredResponse?.message || 'Unknown error'));
            }

            // Step 2: Confirm sync
            console.log('✅ Confirming sync...');
            const syncConfirmedResponse = await apiService.confirmSync(checkSyncRequiredInput);
            console.log('✅ Sync confirmed response:', syncConfirmedResponse);

            if (!syncConfirmedResponse || syncConfirmedResponse.code !== 'success') {
                throw new Error('Failed to confirm sync: ' + (syncConfirmedResponse?.message || 'Unknown error'));
            }

            // Step 3: Get immeubles to sync
            console.log('📥 Getting immeubles to sync...');
            const immeublesToSyncResponse = await apiService.getImmeublesToSync(checkSyncRequiredInput);
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
    },

    // Utility function to create CheckSyncRequiredInput
    createCheckSyncInput: (identifiantSync: number, addressMac?: string): CheckSyncRequiredInput => {
        return {
            identifiantSync: identifiantSync,
            addressMac: addressMac || null
        };
    },

    // Utility function to clear authentication
    logout: async (): Promise<void> => {
        try {
            console.log('🚪 Logging out...');
            await clearToken();
            console.log('✅ Logout successful');
        } catch (error: any) {
            console.error('❌ Logout failed:', error);
            throw new Error(`Logout failed: ${error.message || 'Unknown error'}`);
        }
    },

};