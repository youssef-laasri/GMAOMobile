import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';

// Import the new generated API client
import GeneratedApiService from './generated-api-client';
import { AlerteDTOOuput, ApiImmeubleGetInfoImmeublePaginationGetRequest, ArticleDevis, ArticleDTO, AuthenticationApi, CheckSyncRequiredInput, Configuration, CountOfItemsDTO, DetailInterventionDTO, DrapeauxOutpuDTO, HistoriqueDevisInput, HistoriqueDevisOutput, HistoriqueInterventionInput, HistoriqueInterventionOutput, ImmeubleApi, ImmeubleOutPutDTO, InterventionApi, LoginInputDTO, PlanningDTO, PriPrimeDTO, QualificationDTO, ReferentielApi, RepReglementPDADTO, StringResultDTO, SyncOutput, TranscriptionResponse } from '../ApiCalls/generated';

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

// Enhanced API Service that combines old and new approaches
export const apiService = {

    // Authentication Methods - Using new generated client
    login: async (loginInput: LoginInputDTO): Promise<StringResultDTO> => {
        try {
            console.log('🔐 Using new generated API client for login...');
            return await GeneratedApiService.login(loginInput);
        } catch (error) {
            console.log('⚠️ Falling back to legacy login method...');
            // Fallback to legacy method if needed
            const apiClient = new AuthenticationApi(
                new Configuration({
                    basePath: url,
                })
            );
            try {
                console.log('✅ input:', loginInput);
                const response = await apiClient.apiAuthenticationLoginPost(loginInput);
                console.log('✅ Success:', response.data);
                
                if (response.data.status === 'success' && response.data.value) {
                    // await setToken(response.data.value); // Save the token
                }
                return response.data;
            } catch (error: any) {
                console.log('❌ Login error:', error);
                throw new Error('Login failed: ' + error.message);
            }
        }
    },

    // Intervention Methods - Using new generated client
    getPlanning: async (): Promise<PlanningDTO> => {
        try {
            console.log('📅 Using new generated API client for planning...');
            return await GeneratedApiService.getPlanning();
        } catch (error) {
            console.log('⚠️ Falling back to legacy planning method...');
            // Fallback to legacy method
            const apiClient = new InterventionApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    getGMAO: async (): Promise<PlanningDTO> => {
        try {
            console.log('🏢 Using new generated API client for GMAO...');
            return await GeneratedApiService.getGMAO();
        } catch (error) {
            console.log('⚠️ Falling back to legacy GMAO method...');
            // Fallback to legacy method
            const apiClient = new InterventionApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    getDrapeaux: async (): Promise<DrapeauxOutpuDTO> => {
        try {
            console.log('🚩 Using new generated API client for drapeaux...');
            return await GeneratedApiService.getDrapeaux();
        } catch (error) {
            console.log('⚠️ Falling back to legacy drapeaux method...');
            // Fallback to legacy method
            const apiClient = new InterventionApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    getAlertes: async (): Promise<AlerteDTOOuput> => {
        try {
            console.log('🚨 Using new generated API client for alertes...');
            return await GeneratedApiService.getAlertes();
        } catch (error) {
            console.log('⚠️ Falling back to legacy alertes method...');
            // Fallback to legacy method
            const apiClient = new InterventionApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    ConvertAudioToSpeech: async (speechToText?: string, rapportVocalFiles?: Array<File>): Promise<TranscriptionResponse> => {
        try {
            console.log('🎤 Using new generated API client for audio conversion...');
            return await GeneratedApiService.convertAudioToSpeech(speechToText, rapportVocalFiles);
        } catch (error) {
            console.log('⚠️ Falling back to legacy audio conversion method...');
            // Fallback to legacy method
            console.log('start convertion');
            const apiClient = new InterventionApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    // get Intervention Detail
    getInterventionDetail: async (noIntervention: string): Promise<DetailInterventionDTO> => {
        try {
            console.log('📋 Using new generated API client for intervention detail...');
            return await GeneratedApiService.getInterventionDetail(noIntervention);
        } catch (error) {
            console.log('⚠️ Falling back to legacy intervention detail method...');
            // Fallback to legacy method
            const apiClient = new InterventionApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    getHistoriqueIntervention: async (historiqueInterventionInput: HistoriqueInterventionInput): Promise<HistoriqueInterventionOutput> => {
        try {
            console.log('📚 Using new generated API client for intervention history...');
            return await GeneratedApiService.getHistoriqueIntervention(historiqueInterventionInput);
        } catch (error) {
            console.log('⚠️ Falling back to legacy intervention history method...');
            // Fallback to legacy method
            const apiClient = new InterventionApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    updateIntervention: async (noIntervention?: string, codeImmeuble?: string, devisEtablir?: number, bEvent?: boolean, noAstreint?: number, primeConventionnelle?: string, nomSignataire?: string, qualificationSignataire?: string, signature?: File, compteRendu?: string, latitudeDebutIntervention?: string, longitudeDebutIntervention?: string, latitudeFinIntervention?: string, longitudeFinIntervention?: string, latitudeDebutInterventionHZ?: string, longitudeDebutInterventionHZ?: string, latitudeFinInterventionHZ?: string, longitudeFinInterventionHZ?: string, dateDebut?: string, dateFin?: string, dateRealisation?: string, drapeau?: boolean, heuresSupp?: boolean, isAstreintte?: number, rapportVocalSpeechToText?: string, rapportVocalRapportVocalFiles?: Array<File>, interventionApresAvantFiles?: Array<File>, rapportFiles?: Array<File>, devisAvantTravauxListArticle?: Array<ArticleDevis>, devisAvantTravauxSignataire?: string, devisAvantTravauxSignature?: File, devisAvantTravauxModeReglement?: string, devisAvantTravauxFlagEmail?: boolean, devisAvantTravauxPhotosDevisAvantTravauxFiles?: Array<File>, demandeDeDevisFiles?: Array<File>): Promise<StringResultDTO> => {
        try {
            console.log('💾 Using new generated API client for intervention update...');
            return await GeneratedApiService.updateIntervention(
                noIntervention, codeImmeuble, devisEtablir, bEvent, noAstreint, primeConventionnelle, 
                nomSignataire, qualificationSignataire, signature, compteRendu, latitudeDebutIntervention, 
                longitudeDebutIntervention, latitudeFinIntervention, longitudeFinIntervention, 
                latitudeDebutInterventionHZ, longitudeDebutInterventionHZ, latitudeFinInterventionHZ, 
                longitudeFinInterventionHZ, dateDebut, dateFin, dateRealisation, drapeau, heuresSupp, 
                isAstreintte, rapportVocalSpeechToText, rapportVocalRapportVocalFiles, 
                interventionApresAvantFiles, rapportFiles, devisAvantTravauxListArticle, 
                devisAvantTravauxSignataire, devisAvantTravauxSignature, devisAvantTravauxModeReglement, 
                devisAvantTravauxFlagEmail, devisAvantTravauxPhotosDevisAvantTravauxFiles, demandeDeDevisFiles
            );
        } catch (error) {
            console.log('⚠️ Falling back to legacy intervention update method...');
            // Fallback to legacy method
            const apiClient = new InterventionApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    //Immeuble Methods - Using new generated client
    getImmeublesPagination: async (pageNumber?: number, pageSize?: number,): Promise<ImmeubleOutPutDTO> => {
     
            console.log('⚠️ Falling back to legacy immeubles pagination method...');
            // Fallback to legacy method
            const apiClient = new ImmeubleApi(
                new Configuration({
                    basePath: url,
                })
            );
            let apiImmeubleGetInfoImmeublePaginationGetRequest: ApiImmeubleGetInfoImmeublePaginationGetRequest = {
                token: token as string,
                pageNumber: pageNumber,
                pageSize: pageSize
            }
            try {
                token = await AsyncStorage.getItem('@token')
                const response = await apiClient.apiImmeubleGetInfoImmeublePaginationGet(apiImmeubleGetInfoImmeublePaginationGetRequest);
                console.log(response, 'response');
                
                if (response) {
                }
                return response;
            } catch (error: any) {
                throw new Error('Login failed: ' + error.message);
            }
    },

    checkSyncRequired: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<SyncOutput> => {
        try {
            console.log('🔄 Using new generated API client for sync check...');
            return await GeneratedApiService.checkSyncRequired(checkSyncRequiredInput);
        } catch (error) {
            console.log('⚠️ Falling back to legacy sync check method...');
            // Fallback to legacy method
            const apiClient = new ImmeubleApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    confirmSync: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<SyncOutput> => {
        try {
            console.log('✅ Using new generated API client for sync confirmation...');
            return await GeneratedApiService.confirmSync(checkSyncRequiredInput);
        } catch (error) {
            console.log('⚠️ Falling back to legacy sync confirmation method...');
            // Fallback to legacy method
            const apiClient = new ImmeubleApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    getImmeublesToSync: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<SyncOutput> => {
        try {
            console.log('📥 Using new generated API client for immeubles to sync...');
            return await GeneratedApiService.getImmeublesToSync(checkSyncRequiredInput);
        } catch (error) {
            console.log('⚠️ Falling back to legacy immeubles to sync method...');
            // Fallback to legacy method
            const apiClient = new ImmeubleApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    // Enhanced sync function that combines all sync operations - Using new generated client
    performFullSync: async (checkSyncRequiredInput?: CheckSyncRequiredInput): Promise<{
        syncRequired: boolean;
        syncConfirmed: boolean;
        immeublesSynced: SyncOutput;
    }> => {
        try {
            console.log('🔄 Using new generated API client for full sync...');
            return await GeneratedApiService.performFullSync(checkSyncRequiredInput);
        } catch (error) {
            console.log('⚠️ Falling back to legacy full sync method...');
            // Fallback to legacy method
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
        }
    },

    // Utility function to create CheckSyncRequiredInput
    createCheckSyncInput: (identifiantSync: number, addressMac?: string): CheckSyncRequiredInput => {
        return GeneratedApiService.createCheckSyncInput(identifiantSync, addressMac);
    },

    getHistoriqueDevis: async (historiqueDevisInput: HistoriqueDevisInput): Promise<HistoriqueDevisOutput> => {
        try {
            console.log('📊 Using new generated API client for devis history...');
            return await GeneratedApiService.getHistoriqueDevis(historiqueDevisInput);
        } catch (error) {
            console.log('⚠️ Falling back to legacy devis history method...');
            // Fallback to legacy method
            const apiClient = new ImmeubleApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    // Referentiel Methods - Using new generated client
    getCountOfItems: async (): Promise<CountOfItemsDTO> => {
        try {
            console.log('📊 Using new generated API client for count of items...');
            return await GeneratedApiService.getCountOfItems();
        } catch (error) {
            console.log('⚠️ Falling back to legacy count of items method...');
            // Fallback to legacy method
            const apiClient = new ReferentielApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    getArticleDevis: async (): Promise<ArticleDTO> => {
        try {
            console.log('📦 Using new generated API client for article devis...');
            return await GeneratedApiService.getArticleDevis();
        } catch (error) {
            console.log('⚠️ Falling back to legacy article devis method...');
            // Fallback to legacy method
            const apiClient = new ReferentielApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    getAllModeRegelement: async (): Promise<Array<RepReglementPDADTO>> => {
        try {
            console.log('💳 Using new generated API client for mode reglement...');
            return await GeneratedApiService.getAllModeReglement();
        } catch (error) {
            console.log('⚠️ Falling back to legacy mode reglement method...');
            // Fallback to legacy method
            const apiClient = new ReferentielApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    getAllQualification: async (): Promise<Array<QualificationDTO>> => {
        try {
            console.log('🎓 Using new generated API client for qualifications...');
            return await GeneratedApiService.getAllQualification();
        } catch (error) {
            console.log('⚠️ Falling back to legacy qualifications method...');
            // Fallback to legacy method
            const apiClient = new ReferentielApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    getAllPrimeConventionelle: async (): Promise<Array<PriPrimeDTO>> => {
        try {
            console.log('💰 Using new generated API client for prime conventionnelle...');
            return await GeneratedApiService.getAllPrimeConventionelle();
        } catch (error) {
            console.log('⚠️ Falling back to legacy prime conventionnelle method...');
            // Fallback to legacy method
            const apiClient = new ReferentielApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    getAllPriPrimes: async (): Promise<Array<PriPrimeDTO>> => {
        try {
            console.log('💰 Using new generated API client for pri primes...');
            return await GeneratedApiService.getAllPriPrimes();
        } catch (error) {
            console.log('⚠️ Falling back to legacy pri primes method...');
            // Fallback to legacy method
            const apiClient = new ReferentielApi(
                new Configuration({
                    basePath: url,
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
        }
    },

    // New utility methods using the generated client
    logout: async (): Promise<void> => {
        try {
            console.log('🚪 Using new generated API client for logout...');
            return await GeneratedApiService.logout();
        } catch (error) {
            console.log('⚠️ Falling back to manual token clearing...');
            // Fallback to manual token clearing
            try {
                await AsyncStorage.removeItem('@token');
                console.log('✅ Token cleared manually');
            } catch (error: any) {
                console.error('❌ Manual token clearing failed:', error);
                throw new Error('Logout failed: ' + error.message);
            }
        }
    },

};


