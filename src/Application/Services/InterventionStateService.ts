import AsyncStorage from '@react-native-async-storage/async-storage';
import { stat } from 'react-native-fs';

export interface InterventionState {
    isStarted: boolean;
    startTime: number; // timestamp
    startDateTime?: Date; 
    startDateTimeString? : string// actual date and time
    noIntervention: string;
    codeImmeuble: string;
    latitudeDebut?: number;
    longitudeDebut?: number;
    latitudeDebutHZ?: number;
    longitudeDebutHZ?: number;
}

export interface InterventionFormData {
    // Basic intervention data
    noIntervention: string;
    dateDebut: string;
    dateFin: string;
    latitudeDebut?: number;
    longitudeDebut?: number;
    latitudeFin?: number;
    longitudeFin?: number;
    latitudeDebutHZ?: number;
    longitudeDebutHZ?: number;
    latitudeFinHZ?: number;
    longitudeFinHZ?: number;
    
    // Images
    imageRapport: string[];
    imagebeforeAfterIntervention: string[];
    imagequoteRequest: string[];
    
    // Audio recordings
    recordPath: string;
    speechToText: string;
    
    // Form sections and state
    step: string;
    screen: string;
    expandedSections: Record<string, any>;
    
    // Devis data
    devisArticles: any[];
    devisImages: string[];
    devisSignataire: string;
    devisSignature: any;
    devisModeReglement: string;
    devisImage: string | null;
    
    // Drawing data
    drawingPaths: any[];
    selectedColor: string;
    selectedStrokeWidth: number;
    
    // Other form data
    listQualification: any[];
    listPrimeConventionelle: any[];
    meters: any[];
    
    // Timestamps
    lastSaved: number;
    lastModified: number;
}

export class InterventionStateService {
    private static readonly INTERVENTION_STATE_KEY = '@intervention_state';
    private static readonly INTERVENTION_HISTORY_KEY = '@intervention_history';
    private static readonly INTERVENTION_FORM_DATA_KEY = '@intervention_form_data';
    private static readonly INTERVENTION_IMAGES_KEY = '@intervention_images';

    // Save intervention state
    static async saveInterventionState(state: InterventionState): Promise<void> {
        try {
            await AsyncStorage.setItem(this.INTERVENTION_STATE_KEY, JSON.stringify(state));
            console.log('Intervention state saved:', state);
        } catch (error) {
            console.error('Error saving intervention state:', error);
        }
    }

    // Get current intervention state
    static async getInterventionState(): Promise<InterventionState | null> {
        try {
            const state = await AsyncStorage.getItem(this.INTERVENTION_STATE_KEY);
            return state ? JSON.parse(state) : null;
        } catch (error) {
            console.error('Error getting intervention state:', error);
            return null;
        }
    }

    // Start intervention
    static async startIntervention(noIntervention: string, codeImmeuble: string, startDateTime?: Date,
        startDateTimeString?: string, latitude?: number, longitude?: number, latitudeHZ?: number, longitudeHZ?: number): Promise<void> {
        const actualStartTime = startDateTime || new Date();
        console.log(actualStartTime, 'actualStartTime', startDateTime);
        
        const state: InterventionState = {
            isStarted: true,
            startTime: actualStartTime.getTime(), // Store timestamp
            startDateTime: startDateTime, // Store actual date object
            startDateTimeString: startDateTimeString, // Store actual date object
            noIntervention,
            codeImmeuble,
            latitudeDebut: latitude,
            longitudeDebut: longitude,
            latitudeDebutHZ: latitudeHZ,
            longitudeDebutHZ: longitudeHZ,
        };
        
        await this.saveInterventionState(state);
        
        // Add to history
        await this.addToHistory(state);
        
        // Clear cart when new intervention starts
        await this.clearCart();
    }

    // End intervention
    static async endIntervention(): Promise<void> {
        try {
            const currentState = await this.getInterventionState();
            if (currentState && currentState.isStarted) {
                // Update state
                const updatedState: InterventionState = {
                    ...currentState,
                    isStarted: false,
                };
                
                await this.saveInterventionState(updatedState);
                
                // Update history with end time
                await this.updateHistoryEndTime(currentState.startTime, Date.now());
                
                console.log('Intervention ended');
            }
        } catch (error) {
            console.error('Error ending intervention:', error);
        }
    }

    // Check if intervention is currently active
    static async isInterventionActive(): Promise<boolean> {
        const state = await this.getInterventionState();
        return state?.isStarted || false;
    }

    // Get intervention duration in milliseconds
    static async getInterventionDuration(): Promise<number> {
        const state = await this.getInterventionState();
        if (state?.isStarted) {
            return Date.now() - state.startTime;
        }
        return 0;
    }

    // Format duration for display
    static formatDuration(durationMs: number): string {
        const seconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}j ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Add intervention to history
    private static async addToHistory(state: InterventionState): Promise<void> {
        try {
            const history = await this.getInterventionHistory();
            history.push({
                ...state,
                endTime: null,
                duration: null,
            });
            
            // Keep only last 50 interventions
            if (history.length > 50) {
                history.splice(0, history.length - 50);
            }
            
            await AsyncStorage.setItem(this.INTERVENTION_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Error adding to history:', error);
        }
    }

    // Update history with end time
    private static async updateHistoryEndTime(startTime: number, endTime: number): Promise<void> {
        try {
            const history = await this.getInterventionHistory();
            const intervention = history.find(item => item.startTime === startTime);
            if (intervention) {
                intervention.endTime = endTime;
                intervention.duration = endTime - startTime;
            }
            await AsyncStorage.setItem(this.INTERVENTION_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Error updating history:', error);
        }
    }

    // Get intervention history
    static async getInterventionHistory(): Promise<any[]> {
        try {
            const history = await AsyncStorage.getItem(this.INTERVENTION_HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error getting intervention history:', error);
            return [];
        }
    }

    // Clear intervention state (for logout or reset)
    static async clearInterventionState(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.INTERVENTION_STATE_KEY);
            console.log('Intervention state cleared');
        } catch (error) {
            console.error('Error clearing intervention state:', error);
        }
    }

    // Clear cart when new intervention starts
    static async clearCart(): Promise<void> {
        try {
            // Clear cart from AsyncStorage
            await AsyncStorage.removeItem('@cart_items');
            await AsyncStorage.removeItem('@cart_data');
            
            // Emit cart cleared event (can be listened to by cart context)
            const cartClearedEvent = new CustomEvent('cartCleared', {
                detail: { timestamp: Date.now() }
            });
            
            // For React Native, we'll use a different approach
            // Store a flag that cart context can check
            await AsyncStorage.setItem('@cart_cleared_timestamp', Date.now().toString());
            
            console.log('Cart cleared for new intervention');
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }

    // Get current intervention info for display
    static async getCurrentInterventionInfo(): Promise<{
        isActive: boolean;
        duration: string;
        noIntervention: string;
        codeImmeuble: string;
        startTime: string;
        startDate: string;
        startDateTime: string;
        latitudeDebut: number;
        longitudeDebut: number;
        latitudeDebutHZ: number;
        longitudeDebutHZ: number;
    } | null> {
        const state = await this.getInterventionState();
        if (!state?.isStarted) {
            return null;
        }

        const duration = await this.getInterventionDuration();
        // Use stored startDateTime if available, otherwise fallback to startTime timestamp
        const startDate = state.startDateTime || new Date(state.startTime);
console.log(state.startDateTime, 'state.startDateTime');

        return {
            isActive: true,
            duration: this.formatDuration(duration),
            noIntervention: state.noIntervention,
            codeImmeuble: state.codeImmeuble,
            startTime: startDate.toLocaleString('fr-FR'),
            startDate: startDate.toLocaleString('fr-FR'),
            startDateTime: state.startDateTimeString || '',
            latitudeDebut: state.latitudeDebut || 0,
            longitudeDebut: state.longitudeDebut || 0,
            latitudeDebutHZ: state.latitudeDebutHZ || 0,
            longitudeDebutHZ: state.longitudeDebutHZ || 0
        };
    }

    // ===== FORM DATA PERSISTENCE METHODS =====

    // Save form data for current intervention
    static async saveFormData(formData: Partial<InterventionFormData>): Promise<void> {
        try {
            const currentData = await this.getFormData();
            const updatedData = {
                ...currentData,
                ...formData,
                lastModified: Date.now(),
            } as InterventionFormData;
            
            await AsyncStorage.setItem(this.INTERVENTION_FORM_DATA_KEY, JSON.stringify(updatedData));
            console.log('Form data saved:', updatedData);
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    }

    // Get saved form data
    static async getFormData(): Promise<InterventionFormData | null> {
        try {
            const data = await AsyncStorage.getItem(this.INTERVENTION_FORM_DATA_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting form data:', error);
            return null;
        }
    }

    // Save images for current intervention
    static async saveImages(images: {
        imageRapport?: string[];
        imagebeforeAfterIntervention?: string[];
        imagequoteRequest?: string[];
        devisImages?: string[];
    }): Promise<void> {
        try {
            const currentImages = await this.getImages();
            const updatedImages = {
                ...currentImages,
                ...images,
                lastSaved: Date.now(),
            };
            
            await AsyncStorage.setItem(this.INTERVENTION_IMAGES_KEY, JSON.stringify(updatedImages));
            console.log('Images saved:', updatedImages);
        } catch (error) {
            console.error('Error saving images:', error);
        }
    }

    // Get saved images
    static async getImages(): Promise<{
        imageRapport: string[];
        imagebeforeAfterIntervention: string[];
        imagequoteRequest: string[];
        devisImages: string[];
        lastSaved: number;
    } | null> {
        try {
            const images = await AsyncStorage.getItem(this.INTERVENTION_IMAGES_KEY);
            return images ? JSON.parse(images) : null;
        } catch (error) {
            console.error('Error getting images:', error);
            return null;
        }
    }

    // Save audio recording data
    static async saveAudioData(audioData: {
        recordPath?: string;
        speechToText?: string;
    }): Promise<void> {
        try {
            await this.saveFormData(audioData);
            console.log('Audio data saved:', audioData);
        } catch (error) {
            console.error('Error saving audio data:', error);
        }
    }

    // Save devis data
    static async saveDevisData(devisData: {
        devisArticles?: any[];
        devisImages?: string[];
        devisSignataire?: string;
        devisSignature?: any;
        devisModeReglement?: string;
        devisImage?: string | null;
    }): Promise<void> {
        try {
            await this.saveFormData(devisData);
            console.log('Devis data saved:', devisData);
        } catch (error) {
            console.error('Error saving devis data:', error);
        }
    }

    // Save drawing data
    static async saveDrawingData(drawingData: {
        drawingPaths?: any[];
        selectedColor?: string;
        selectedStrokeWidth?: number;
    }): Promise<void> {
        try {
            await this.saveFormData(drawingData);
            console.log('Drawing data saved:', drawingData);
        } catch (error) {
            console.error('Error saving drawing data:', error);
        }
    }

    // Auto-save form data (call this periodically)
    static async autoSaveFormData(formData: Partial<InterventionFormData>): Promise<void> {
        try {
            // Only auto-save if intervention is active
            const isActive = await this.isInterventionActive();
            if (isActive) {
                await this.saveFormData(formData);
                console.log('Auto-save completed');
            }
        } catch (error) {
            console.error('Error in auto-save:', error);
        }
    }

    // Restore all data for current intervention
    static async restoreInterventionData(): Promise<{
        formData: InterventionFormData | null;
        images: any;
    }> {
        try {
            const [formData, images] = await Promise.all([
                this.getFormData(),
                this.getImages()
            ]);

            console.log('Intervention data restored:', { formData, images });
            return { formData, images };
        } catch (error) {
            console.error('Error restoring intervention data:', error);
            return { formData: null, images: null };
        }
    }

    // Clear all form data (when intervention ends)
    static async clearFormData(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.INTERVENTION_FORM_DATA_KEY);
            await AsyncStorage.removeItem(this.INTERVENTION_IMAGES_KEY);
            console.log('Form data cleared');
        } catch (error) {
            console.error('Error clearing form data:', error);
        }
    }

    // Check if there's unsaved data
    static async hasUnsavedData(): Promise<boolean> {
        try {
            const formData = await this.getFormData();
            const images = await this.getImages();
            
            if (!formData && !images) return false;
            
            // Check if there's meaningful data
            const hasFormData = formData && (
                formData.noIntervention ||
                formData.imageRapport?.length > 0 ||
                formData.imagebeforeAfterIntervention?.length > 0 ||
                formData.imagequoteRequest?.length > 0 ||
                formData.recordPath ||
                formData.speechToText ||
                formData.devisArticles?.length > 0
            );
            
            const hasImages = images && (
                images.imageRapport?.length > 0 ||
                images.imagebeforeAfterIntervention?.length > 0 ||
                images.imagequoteRequest?.length > 0 ||
                images.devisImages?.length > 0
            );
            
            return !!(hasFormData || hasImages);
        } catch (error) {
            console.error('Error checking unsaved data:', error);
            return false;
        }
    }
}
