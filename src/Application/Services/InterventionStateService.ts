import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InterventionState {
    isStarted: boolean;
    startTime: number; // timestamp
    noIntervention: string;
    codeImmeuble: string;
    latitudeDebut?: number;
    longitudeDebut?: number;
    latitudeDebutHZ?: number;
    longitudeDebutHZ?: number;
}

export class InterventionStateService {
    private static readonly INTERVENTION_STATE_KEY = '@intervention_state';
    private static readonly INTERVENTION_HISTORY_KEY = '@intervention_history';

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
    static async startIntervention(noIntervention: string, codeImmeuble: string, latitude?: number, longitude?: number, latitudeHZ?: number, longitudeHZ?: number): Promise<void> {
        const state: InterventionState = {
            isStarted: true,
            startTime: Date.now(),
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
    } | null> {
        const state = await this.getInterventionState();
        if (!state?.isStarted) {
            return null;
        }

        const duration = await this.getInterventionDuration();
        const startDate = new Date(state.startTime);

        return {
            isActive: true,
            duration: this.formatDuration(duration),
            noIntervention: state.noIntervention,
            codeImmeuble: state.codeImmeuble,
            startTime: startDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
        };
    }
}
