import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlerteDTO, AlerteDTOOuput, ArticleDevis, ArticleDTO, AuthenticationApi, CheckSyncRequiredInput, Configuration, CountOfItemsDTO, DetailInterventionDTO, DrapeauxOutpuDTO, HistoriqueDevisInput, HistoriqueDevisOutput, HistoriqueInterventionInput, HistoriqueInterventionOutput, ImmeubleApi, ImmeubleOutPutDTO, InterventionApi, LoginInputDTO, PlanningDTO, PriPrimeDTO, QualificationDTO, ReferentielApi, RepReglementPDADTO, StringResultDTO, SyncOutput, TranscriptionResponse } from '../ApiCalls';
import axios from 'axios';

// Function to set the token in AsyncStorage
// const setToken = async (token: string): Promise<void> => {
//       try {
//         await AsyncStorage.setItem('authToken', token);
//       } catch (error) {
//         console.error('Error saving token:', error);
//       }
// };

// Initialize the API client (no token required for login)
const url = "https://gmao.groupe-dt.fr"
// const url = "http://161.97.82.216:9000"



let token: string | null;
//getToken
async function getToken() {
    token = await AsyncStorage.getItem('@token')
}



export const apiService = {

    // Authentication Methods
    login: async (loginInput: LoginInputDTO): Promise<StringResultDTO> => {
        const apiClient = new AuthenticationApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            const response = await apiClient.apiAuthenticationLoginPost(loginInput);
            console.log('✅ Success:', response.data);
            
            if (response.data.status === 'success' && response.data.value) {
                // await setToken(response.data.value); // Save the token
            }
            return response.data;
        } catch (error: any) {
            console.log('❌ Login error:', error.message);
            throw new Error('Login failed: ' + error.message);
        }
    },

    // Intervention Methods

    getPlanning: async (): Promise<PlanningDTO> => {

        const apiClient = new InterventionApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiInterventionPlanningGet(token as string);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            console.log(error.message);

            throw new Error('Get planning failed: ' + error.message);
        }
    },

    getGMAO: async (): Promise<PlanningDTO> => {
        const apiClient = new InterventionApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiInterventionGMAOGet(token as string);
            if (response) {
            }
            console.log(response);
            return response.data;
        } catch (error: any) {
            console.log(error.message);

            throw new Error('Get GMAO failed: ' + error.message);
        }
    },

    getDrapeaux: async (): Promise<DrapeauxOutpuDTO> => {
        const apiClient = new InterventionApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiInterventionGetDrapeuxGet(token as string);
            if (response) {
            }
            console.log(response);
            console.log(response.data, 'sdsds');

            return response.data;
        } catch (error: any) {
            console.log(error.message);

            throw new Error('Get drapeaux failed: ' + error.message);
        }
    },

    getAlertes: async (): Promise<AlerteDTOOuput> => {
        const apiClient = new InterventionApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiInterventionGetAlertesGet(token as string);
            console.log(response.data,'data');

            return response.data;
        } catch (error: any) {
            console.log(error.message);

            throw new Error('Get alertes failed: ' + error.message);
        }
    },

    ConvertAudioToSpeech: async (speechToText?: string, rapportVocalFiles?: Array<File>): Promise<TranscriptionResponse> => {
        console.log('start convertion');

        const apiClient = new InterventionApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            console.log(rapportVocalFiles);

            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiInterventionConvertAudioToTextPost(token as string, '', rapportVocalFiles);
            if (response) {
            }
            console.log(response);
            return response.data;
        } catch (error: any) {
            console.log(error);

            throw new Error('Convert audio failed: ' + error.message);
        }
    },

    // get Intervention Detail


    getInterventionDetail: async (noIntervention: string): Promise<DetailInterventionDTO> => {
        const apiClient = new InterventionApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiInterventionGetInfoInterventionGet(token as string, noIntervention);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Get intervention detail failed: ' + error.message);
        }
    },

    getHistoriqueIntervention: async (historiqueInterventionInput: HistoriqueInterventionInput): Promise<HistoriqueInterventionOutput> => {
        const apiClient = new InterventionApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiInterventionGetHistoriqueInterventionPost(token as string, historiqueInterventionInput);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Get historique intervention failed: ' + error.message);
        }
    },

    updateIntervention: async (noIntervention?: string, codeImmeuble?: string, devisEtablir?: number, bEvent?: boolean, noAstreint?: number, primeConventionnelle?: string, nomSignataire?: string, qualificationSignataire?: string, signature?: File, compteRendu?: string, latitudeDebutIntervention?: string, longitudeDebutIntervention?: string, latitudeFinIntervention?: string, longitudeFinIntervention?: string, latitudeDebutInterventionHZ?: string, longitudeDebutInterventionHZ?: string, latitudeFinInterventionHZ?: string, longitudeFinInterventionHZ?: string, dateDebut?: string, dateFin?: string, dateRealisation?: string, drapeau?: boolean, heuresSupp?: boolean, isAstreintte?: number, rapportVocalSpeechToText?: string, rapportVocalRapportVocalFiles?: Array<File>, interventionApresAvantFiles?: Array<File>, rapportFiles?: Array<File>, devisAvantTravauxListArticle?: Array<ArticleDevis>, devisAvantTravauxSignataire?: string, devisAvantTravauxSignature?: File, devisAvantTravauxModeReglement?: string, devisAvantTravauxFlagEmail?: boolean, devisAvantTravauxPhotosDevisAvantTravauxFiles?: Array<File>, demandeDeDevisFiles?: Array<File>): Promise<StringResultDTO> => {
        const apiClient = new InterventionApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiInterventionUpdateInterventionPost(token as string, noIntervention, codeImmeuble, devisEtablir, bEvent, noAstreint, primeConventionnelle, nomSignataire, qualificationSignataire, signature, compteRendu, latitudeDebutIntervention, longitudeDebutIntervention, latitudeFinIntervention, longitudeFinIntervention, latitudeDebutInterventionHZ, longitudeDebutInterventionHZ, latitudeFinInterventionHZ, longitudeFinInterventionHZ, dateDebut, dateFin, dateRealisation, drapeau, heuresSupp, isAstreintte, rapportVocalSpeechToText, rapportVocalRapportVocalFiles, interventionApresAvantFiles, rapportFiles, devisAvantTravauxListArticle, devisAvantTravauxSignataire, devisAvantTravauxSignature, devisAvantTravauxModeReglement, devisAvantTravauxFlagEmail, devisAvantTravauxPhotosDevisAvantTravauxFiles, demandeDeDevisFiles);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Update intervention failed: ' + error.message);
        }
    },


    //Immeuble Methods
    getImmeublesPagination: async (pageNumber?: number, pageSize?: number,): Promise<Array<ImmeubleOutPutDTO>> => {
        const apiClient = new ImmeubleApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiImmeubleGetInfoImmeublePaginationGet(token as string, pageNumber, pageSize);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Login failed: ' + error.message);
        }
    },

    checkSyncRequired: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<SyncOutput> => {
        const apiClient = new ImmeubleApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiImmeubleCheckSyncIsRequiredPost(token as string, checkSyncRequiredInput);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            console.log(error.message);

            throw new Error('Check sync required failed: ' + error.message);
        }
    },

    confirmSync: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<SyncOutput> => {
        const apiClient = new ImmeubleApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            console.log(token, 'token', checkSyncRequiredInput);
            const response = await apiClient.apiImmeubleConfirmSyncPost(token as string, checkSyncRequiredInput);
            console.log(response, 'response');
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            console.log(error.message);

            throw new Error('Confirm sync failed: ' + error.message);
        }
    },

    getImmeublesToSync: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<SyncOutput> => {
        const apiClient = new ImmeubleApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiImmeubleGetImmeublesToSyncPost(token as string, checkSyncRequiredInput);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            console.log(error.message);

            throw new Error('Get immeubles to sync failed: ' + error.message);
        }
    },

    // Enhanced sync function that combines all sync operations
    performFullSync: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<{
        syncRequired: boolean;
        syncConfirmed: boolean;
        immeublesSynced: SyncOutput;
    }> => {
        try {
            // Step 1: Check if sync is required
            console.log('Checking if sync is required...');
            const syncRequiredResponse = await apiService.checkSyncRequired(checkSyncRequiredInput);
            console.log('Sync required response:', syncRequiredResponse);

            if (!syncRequiredResponse || syncRequiredResponse.code !== 'success') {
                throw new Error('Failed to check sync requirement: ' + (syncRequiredResponse?.message || 'Unknown error'));
            }

            // Step 2: Confirm sync
            console.log('Confirming sync...');
            const syncConfirmedResponse = await apiService.confirmSync(checkSyncRequiredInput);
            console.log('Sync confirmed response:', syncConfirmedResponse);

            if (!syncConfirmedResponse || syncConfirmedResponse.code !== 'success') {
                throw new Error('Failed to confirm sync: ' + (syncConfirmedResponse?.message || 'Unknown error'));
            }

            // Step 3: Get immeubles to sync
            console.log('Getting immeubles to sync...');
            const immeublesToSyncResponse = await apiService.getImmeublesToSync(checkSyncRequiredInput);
            console.log('Immeubles to sync response:', immeublesToSyncResponse);

            if (!immeublesToSyncResponse || immeublesToSyncResponse.code !== 'success') {
                throw new Error('Failed to get immeubles to sync: ' + (immeublesToSyncResponse?.message || 'Unknown error'));
            }

            return {
                syncRequired: true,
                syncConfirmed: true,
                immeublesSynced: immeublesToSyncResponse
            };

        } catch (error: any) {
            console.error('Full sync failed:', error);
            throw new Error('Full sync operation failed: ' + error.message);
        }
    },

    // Utility function to create CheckSyncRequiredInput
    createCheckSyncInput: (identifiantSync: number, addressMac?: string): CheckSyncRequiredInput => {
        return {
            identifiantSync: identifiantSync,
            addressMac: addressMac || null
        };
    },

    getHistoriqueDevis: async (historiqueDevisInput: HistoriqueDevisInput): Promise<HistoriqueDevisOutput> => {
        const apiClient = new ImmeubleApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiImmeubleGetHistoriqueDevisImmeublePost(token as string, historiqueDevisInput);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Login failed: ' + error.message);
        }
    },

    // Referentiel Methods
    getCountOfItems: async (): Promise<CountOfItemsDTO> => {
        const apiClient = new ReferentielApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {

            
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiReferentielGetCountOfItemsGet(token as string);
            console.log(response, 'response');
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Login failed: ' + error.message);
        }
    },

    getArticleDevis: async (): Promise<ArticleDTO> => {
        const apiClient = new ReferentielApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiReferentielGetAllArticleDevisGet(token as string);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Login failed: ' + error.message);
        }
    },

    getAllModeRegelement: async (): Promise<Array<RepReglementPDADTO>> => {
        const apiClient = new ReferentielApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiReferentielGetAllModeReglementGet(token as string);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Login failed: ' + error.message);
        }
    },

    getAllQualification: async (): Promise<Array<QualificationDTO>> => {
        const apiClient = new ReferentielApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiReferentielGetAllQualificationGet(token as string);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Login failed: ' + error.message);
        }
    },

    getAllPrimeConventionelle: async (): Promise<Array<PriPrimeDTO>> => {
        const apiClient = new ReferentielApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {

            
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiReferentielGetAllPriPrimeGet(token as string);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Login failed: ' + error.message);
        }
    },

    getAllPriPrimes: async (): Promise<Array<PriPrimeDTO>> => {
        const apiClient = new ReferentielApi(
            new Configuration({
                basePath: url, // Base URL from Swagger
            })
        );
        try {
            token = await AsyncStorage.getItem('@token')
            const response = await apiClient.apiReferentielGetAllPriPrimeGet(token as string);
            if (response) {
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to fetch pri primes: ' + error.message);
        }
    },


};