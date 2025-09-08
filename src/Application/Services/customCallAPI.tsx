import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompteurInfo, OperationDetail } from '../ApiCalls/generated/models';
import { ArticleDevis } from '../ApiCalls/generated/models';
import { Alert } from 'react-native';

export interface fileModel {
    uri: string,
    type: string,
    name: string,
}

// Helper function to get file extension from URI
function getFileExtension(uri) {
    if (!uri) return '.jpg'; // Default extension
    const match = /\.([a-zA-Z0-9]+)$/.exec(uri);
    return match ? match[0] : '.jpg';
}

export const customCallAPI = {


    uploadAudioFile: async (audioFile, nODemande) => {
        // setUploading(true);
        // setUploadStatus('Preparing upload...');

        try {
            // Create form data
            const formData = new FormData();

            // Append audio file
            formData.append('rapportVocal.files', {
                uri: audioFile.uri,
                type: audioFile.type,
                name: audioFile.name || 'audio.mp3',
            });
            let token = await AsyncStorage.getItem('@token')
            // Append nODemande
            formData.append('speechToText', nODemande);
            console.log(formData,'**********body');
            // Make API call
            const response = await fetch(`https://gmao.groupe-dt.fr/api/Intervention/ConvertAudioToText?token=${token}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'accept': 'text/plain',
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (!response.ok) {
                throw new Error(`Upload failed with status ${response.status}`);
            }

            const result = await response.json();
            return result.text;
        } catch (error) {
            console.error('Upload error:', error);
            //   setUploadStatus('Upload failed');
            Alert.alert('Error', 'Failed to upload audio file');
            throw error;
        } finally {
            //   setUploading(false);
        }
    },




    apiInterventionUpdateInterventionPost: async (noIntervention?: string, codeImmeuble?: string, devisEtablir?: number, bEvent?: boolean, noAstreint?: number, primeConventionnelle?: string, nomSignataire?: string, qualificationSignataire?: string, signature?: fileModel, compteRendu?: string, latitudeDebutIntervention?: string, longitudeDebutIntervention?: string, latitudeFinIntervention?: string, longitudeFinIntervention?: string, latitudeDebutInterventionHZ?: string, longitudeDebutInterventionHZ?: string, latitudeFinInterventionHZ?: string, longitudeFinInterventionHZ?: string, dateDebut?: string, dateFin?: string, dateRealisation?: string, drapeau?: boolean, heuresSupp?: boolean, isAstreintte?: number, rapportVocalSpeechToText?: string, rapportVocalRapportVocalFiles?: Array<fileModel>, interventionApresAvantFiles?: Array<fileModel>, rapportFiles?: Array<fileModel>, devisAvantTravauxListArticle?: Array<ArticleDevis>, devisAvantTravauxSignataire?: string, devisAvantTravauxSignature?: fileModel, devisAvantTravauxModeReglement?: string, devisAvantTravauxFlagEmail?: boolean, devisAvantTravauxPhotosDevisAvantTravauxFiles?: Array<fileModel>, demandeDeDevisFiles?: Array<fileModel>) => {


        let token = await AsyncStorage.getItem('@token')

        try {
            console.log('Starting API call to updateIntervention');
            
            // Get token from storage
            const token = await AsyncStorage.getItem('@token');
            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            // Create form data
            const formData = new FormData();

            // Helper function to append data to form safely
            const appendToForm = (key, value) => {
              if (value !== undefined && value !== null) {
                if (typeof value === 'boolean') {
                  formData.append(key, String(value));
                } else {
                  formData.append(key, value.toString());
                }
              }
            };
            
            // Helper function to append file to form
            const appendFile = (key, file) => {
              if (file && file.uri) {
                formData.append(key, {
                  uri: file.uri,
                  type: file.type || 'application/octet-stream',
                  name: file.name || getFileNameFromUri(file.uri)
                });
              }
            };
            
            // Helper function to extract filename from URI
            const getFileNameFromUri = (uri) => {
              if (!uri) return 'file.jpg';
              const segments = uri.split('/');
              const fileName = segments[segments.length - 1];
              return fileName || 'file.jpg';
            };
            
            // Basic intervention parameters
            appendToForm('noIntervention', noIntervention);
            appendToForm('codeImmeuble', codeImmeuble);
            appendToForm('dateDebut', dateDebut);
            appendToForm('dateFin', dateFin);
            appendToForm('dateRealisation', dateRealisation);
            appendToForm('compteRendu', compteRendu);
            
            // Location parameters
            appendToForm('latitudeDebutIntervention', latitudeDebutIntervention);
            appendToForm('longitudeDebutIntervention', longitudeDebutIntervention);
            appendToForm('latitudeFinIntervention', latitudeFinIntervention);
            appendToForm('longitudeFinIntervention', longitudeFinIntervention);
            appendToForm('latitudeDebutInterventionHZ', latitudeDebutInterventionHZ);
            appendToForm('longitudeDebutInterventionHZ', longitudeDebutInterventionHZ);
            appendToForm('latitudeFinInterventionHZ', latitudeFinInterventionHZ);
            appendToForm('longitudeFinInterventionHZ', longitudeFinInterventionHZ);
            
            // Flag parameters
            appendToForm('drapeau', drapeau);
            appendToForm('heuresSupp', heuresSupp);
            appendToForm('bEvent', bEvent);
            appendToForm('isAstreintte', isAstreintte);
            
            // Astreinte parameters
            appendToForm('noAstreint', noAstreint);
            appendToForm('primeConventionnelle', primeConventionnelle);
            
            // Signature parameters
            appendToForm('nomSignataire', nomSignataire);
            appendToForm('qualificationSignataire', qualificationSignataire);
            appendFile('signature', signature);
            
            // Devis parameters
            appendToForm('devisEtablir', devisEtablir);
            appendToForm('devisAvantTravaux.signataire', devisAvantTravauxSignataire);
            appendToForm('devisAvantTravaux.modeReglement', devisAvantTravauxModeReglement);
            appendToForm('devisAvantTravaux.flagEmail', devisAvantTravauxFlagEmail);
            appendFile('devisAvantTravaux.signature', devisAvantTravauxSignature);
            
             // Handle complex object: devisAvantTravauxListArticle
             if (devisAvantTravauxListArticle && Array.isArray(devisAvantTravauxListArticle)) {
               // The API spec shows this should be an array of ArticleDevis objects
               // We need to append each property of each object with proper indexing

               formData.append(`devisAvantTravaux.listArticle`, JSON.stringify(devisAvantTravauxListArticle));
               // devisAvantTravauxListArticle.forEach((article, index) => {
               //   if (article) {
               //     Object.keys(article).forEach(key => {
               //       const value = article[key];
               //       if (value !== undefined && value !== null) {
               //         formData.append(`devisAvantTravaux.listArticle[${index}].${key}`, value.toString());
               //       }
               //     });
               //   }
               // });
             }

             // Add compteurInfo as empty array
             formData.append('compteurInfo', JSON.stringify([]));
             
             // Add operationDetails as empty array
             formData.append('operationDetails', JSON.stringify([]));


            // Append report vocal text
            appendToForm('rapportVocal.speechToText', rapportVocalSpeechToText);
            
            // Append files
            if (rapportVocalRapportVocalFiles && Array.isArray(rapportVocalRapportVocalFiles)) {
              rapportVocalRapportVocalFiles.forEach(file => {
                appendFile('rapportVocal.rapportVocal.files', file);
              });
            }
            
            if (interventionApresAvantFiles && Array.isArray(interventionApresAvantFiles)) {
              interventionApresAvantFiles.forEach(file => {
                appendFile('interventionApresAvant.files', file);
              });
            }
            
            if (rapportFiles && Array.isArray(rapportFiles)) {
              rapportFiles.forEach(file => {
                appendFile('rapport.files', file);
              });
            }
            
            if (devisAvantTravauxPhotosDevisAvantTravauxFiles && Array.isArray(devisAvantTravauxPhotosDevisAvantTravauxFiles)) {
              devisAvantTravauxPhotosDevisAvantTravauxFiles.forEach(file => {
                appendFile('devisAvantTravaux.photosDevisAvantTravaux.files', file);
              });
            }
            
            if (demandeDeDevisFiles && Array.isArray(demandeDeDevisFiles)) {
              demandeDeDevisFiles.forEach(file => {
                appendFile('demandeDeDevis.files', file);
              });
            }
            
            
            console.log('FormData prepared successfully');
            
            // Set up request options with timeout
            const requestOptions = {
              method: 'POST',
              body: formData,
              headers: {
                'Accept': 'application/json, text/plain, */*'
                // Don't set Content-Type for multipart/form-data
              },
              // Set a timeout (for XMLHttpRequest implementation)
              timeout: 60000 // 60 seconds
            };
            
            // Make the request with fetch
            const apiUrl = `https://gmao.groupe-dt.fr/api/Intervention/updateIntervention?token=${encodeURIComponent(token)}`;
            // const apiUrl = `http://161.97.82.216:9000/api/Intervention/updateIntervention?token=${encodeURIComponent(token)}`;

            console.log(`Sending request to: ${apiUrl}`);
            console.log(formData,'**********body');
            
            // Implement fetch with retry logic
            const fetchWithRetry = async (url, options, maxRetries = 3, delay = 2000) => {
              let lastError;
              
              for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                  const response = await fetch(url, options);
                  
                  // Debug info
                  console.log(`Attempt ${attempt + 1} - Response status:`, response.status);
                  
                  if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server responded with status ${response.status}: ${errorText}`);
                  }
                  
                  return response;
                } catch (error) {
                  console.warn(`Attempt ${attempt + 1} failed:`, error.message);
                  lastError = error;
                  
                  if (attempt < maxRetries - 1) {
                    console.log(`Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    // Exponential backoff
                    delay = delay * 1.5;
                  }
                }
              }
              
              throw lastError;
            };
            
            const response = await fetchWithRetry(apiUrl, requestOptions);
            const result = await response.json();
            
            console.log('API call successful, result:', result);
            return result;
            
          } catch (error) {
            console.error('API call failed:', error);
            console.error('Network Error:', {
              message: error.message,
              name: error.name,
              stack: error.stack,
              config: error.config, // For axios
              response: error.response, // For axios or fetch with response
            });
            // Enhanced error logging
            if (error.message.includes('Network request failed')) {
              console.error('Network error detected. Please check:');
              console.error('- Internet connection');
              console.error('- Server availability');
              console.error('- Firewall/proxy settings');
              console.error('- SSL certificate issues');
            }
            
            throw error;
        }
    },


}