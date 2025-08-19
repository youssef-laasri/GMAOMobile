import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../../Application/Services/apiServices';
import { SqlLIteService } from '../../Application/Services/SqlLiteService';
import NetInfo from '@react-native-community/netinfo';

// Create the context
const ReferentielContext = createContext();

// Initial state
const initialReferentielState = {
    modeReglement: [],
    articles: [],
    immeubles: [],
    alertes: [],
    drapeaux: [],
    interventions: [],
    priPrimes: [],
    lastSyncTime: null,
    isLoading: false,
    error: null,
    isOffline: false
};

// Reducer for managing referentiel state
const referentielReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        
        case 'SET_OFFLINE':
            return { ...state, isOffline: action.payload };
        
        case 'SET_MODE_REGLEMENT':
            return { ...state, modeReglement: action.payload };
        
        case 'SET_ARTICLES':
            return { ...state, articles: action.payload };
        
        case 'SET_IMMEUBLES':
            return { ...state, immeubles: action.payload };
        
        case 'SET_ALERTES':
            return { ...state, alertes: action.payload };
        
        case 'SET_DRAPEAUX':
            return { ...state, drapeaux: action.payload };
        
        case 'SET_INTERVENTIONS':
            return { ...state, interventions: action.payload };
        
        case 'SET_PRI_PRIMES':
            return { ...state, priPrimes: action.payload };
        
        case 'SET_LAST_SYNC_TIME':
            return { ...state, lastSyncTime: action.payload };
        
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        
        case 'RESET_STATE':
            return { ...initialReferentielState, isOffline: state.isOffline };
        
        default:
            return state;
    }
};

export const ReferentielProvider = ({ children }) => {
    const [state, dispatch] = useReducer(referentielReducer, initialReferentielState);

    // Load referentiel data from AsyncStorage on mount
    useEffect(() => {
        loadReferentielFromStorage();
        // Also load immeubles from SQLite on mount
        loadImmeublesFromSQLite();
        // Load count data on mount
        loadCountData();
    }, []);

    // Monitor network connectivity
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const isOffline = !state.isConnected;
            dispatch({ type: 'SET_OFFLINE', payload: isOffline });
            
            // If coming back online, try to sync data
            if (!isOffline && state.lastSyncTime) {
                syncReferentielData();
            }
        });

        return () => unsubscribe();
    }, []);

    // Load referentiel data from AsyncStorage
    const loadReferentielFromStorage = async () => {
        try {
            const [
                modeReglement,
                articles,
                immeubles,
                alertes,
                drapeaux,
                interventions,
                priPrimes,
                lastSyncTime
            ] = await Promise.all([
                AsyncStorage.getItem('@referentiel_mode_reglement'),
                AsyncStorage.getItem('@referentiel_articles'),
                AsyncStorage.getItem('@referentiel_immeubles'),
                AsyncStorage.getItem('@referentiel_alertes'),
                AsyncStorage.getItem('@referentiel_drapeaux'),
                AsyncStorage.getItem('@referentiel_interventions'),
                AsyncStorage.getItem('@referentiel_pri_primes'),
                AsyncStorage.getItem('@referentiel_last_sync_time')
            ]);

            if (modeReglement) dispatch({ type: 'SET_MODE_REGLEMENT', payload: JSON.parse(modeReglement) });
            if (articles) dispatch({ type: 'SET_ARTICLES', payload: JSON.parse(articles) });
            if (immeubles) dispatch({ type: 'SET_IMMEUBLES', payload: JSON.parse(immeubles) });
            if (alertes) dispatch({ type: 'SET_ALERTES', payload: JSON.parse(alertes) });
            if (drapeaux) dispatch({ type: 'SET_DRAPEAUX', payload: JSON.parse(drapeaux) });
            if (interventions) dispatch({ type: 'SET_INTERVENTIONS', payload: JSON.parse(interventions) });
            if (priPrimes) dispatch({ type: 'SET_PRI_PRIMES', payload: JSON.parse(priPrimes) });
            if (lastSyncTime) dispatch({ type: 'SET_LAST_SYNC_TIME', payload: JSON.parse(lastSyncTime) });

            console.log('Referentiel data loaded from storage');
        } catch (error) {
            console.error('Error loading referentiel from storage:', error);
        }
    };

    // Load count data from API (alertes, drapeaux, interventions)
    const loadCountData = async () => {
        try {
            const countData = await apiService.getCountOfItems();
            if (countData) {
                // Store counts in AsyncStorage for offline access
                await AsyncStorage.setItem('@referentiel_count_data', JSON.stringify({
                    nbrAlertes: countData.nbrAlertes || 0,
                    nbrDrapeaux: countData.nbrDrapeaux || 0,
                    nbrIntervention: countData.nbrIntervention || 0,
                    timestamp: Date.now()
                }));
                console.log('Count data loaded:', countData);
            }
        } catch (error) {
            console.error('Error loading count data:', error);
        }
    };

    // Load immeubles from SQLite database
    const loadImmeublesFromSQLite = async () => {
        try {
            const db = await SqlLIteService.getDBConnection();
            const immeubles = await SqlLIteService.getAllImmeubles(db);
            if (immeubles && immeubles.length > 0) {
                dispatch({ type: 'SET_IMMEUBLES', payload: immeubles });
                await saveReferentielToStorage(immeubles, '@referentiel_immeubles');
                console.log(`Loaded ${immeubles.length} immeubles from SQLite`);
            }
        } catch (error) {
            console.error('Error loading immeubles from SQLite:', error);
        }
    };

    // Save referentiel data to AsyncStorage
    const saveReferentielToStorage = async (data, key) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
        }
    };

    // Sync all referentiel data from API
    const syncReferentielData = useCallback(async () => {
        if (state.isOffline) {
            console.log('Cannot sync referentiel data while offline');
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        try {
            console.log('🔄 Starting referentiel data sync...');

            // Fetch all referentiel data in parallel
            const [
                modeReglementResponse,
                articlesResponse,
                immeublesResponse,
                alertesResponse,
                drapeauxResponse,
                interventionsResponse,
                priPrimesResponse
            ] = await Promise.all([
                apiService.getAllModeRegelement().catch(err => ({ error: err })),
                apiService.getArticleDevis().catch(err => ({ error: err })),
                // Note: immeubles are synced separately via SQLite
                Promise.resolve({ data: [] }).catch(err => ({ error: err })),
                // Note: alertes are fetched via getCountOfItems
                Promise.resolve({ data: [] }).catch(err => ({ error: err })),
                // Note: drapeaux are fetched via getCountOfItems
                Promise.resolve({ data: [] }).catch(err => ({ error: err })),
                // Note: interventions are managed separately
                Promise.resolve({ data: [] }).catch(err => ({ error: err })),
                apiService.getAllPriPrimes().catch(err => ({ error: err }))
            ]);

            // Process responses and update state
            const syncResults = [];
            const currentTime = Date.now();

            // Mode Reglement
            if (modeReglementResponse && !modeReglementResponse.error) {
                dispatch({ type: 'SET_MODE_REGLEMENT', payload: modeReglementResponse });
                await saveReferentielToStorage(modeReglementResponse, '@referentiel_mode_reglement');
                syncResults.push('Mode Reglement');
            }

            // Articles (from ArticleDevis)
            if (articlesResponse && !articlesResponse.error) {
                dispatch({ type: 'SET_ARTICLES', payload: articlesResponse });
                await saveReferentielToStorage(articlesResponse, '@referentiel_articles');
                syncResults.push('Articles');
            }

            // Load immeubles from SQLite (they are synced separately)
            await loadImmeublesFromSQLite();

            // Load count data (alertes, drapeaux, interventions)
            await loadCountData();

            // Pri Primes
            if (priPrimesResponse && !priPrimesResponse.error) {
                dispatch({ type: 'SET_PRI_PRIMES', payload: priPrimesResponse });
                await saveReferentielToStorage(priPrimesResponse, '@referentiel_pri_primes');
                syncResults.push('Pri Primes');
            }

            // Update last sync time
            dispatch({ type: 'SET_LAST_SYNC_TIME', payload: currentTime });
            await AsyncStorage.setItem('@referentiel_last_sync_time', JSON.stringify(currentTime));

            console.log(`✅ Referentiel sync completed: ${syncResults.join(', ')}`);
            console.log(`Last sync: ${new Date(currentTime).toLocaleString()}`);

        } catch (error) {
            console.error('❌ Error syncing referentiel data:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || 'Sync failed' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.isOffline]);

    // Refresh referentiel data (called on login)
    const refreshReferentielData = useCallback(async () => {
        console.log('🔄 Refreshing referentiel data on login...');
        await syncReferentielData();
    }, [syncReferentielData]);

    // Refresh immeubles from SQLite
    const refreshImmeublesFromSQLite = useCallback(async () => {
        await loadImmeublesFromSQLite();
    }, []);

    // Refresh count data
    const refreshCountData = useCallback(async () => {
        await loadCountData();
    }, []);

    // Get referentiel data by type
    const getReferentielData = useCallback((type) => {
        switch (type) {
            case 'modeReglement':
                return state.modeReglement;
            case 'articles':
                return state.articles;
            case 'immeubles':
                return state.immeubles;
            case 'alertes':
                return state.alertes;
            case 'drapeaux':
                return state.drapeaux;
            case 'interventions':
                return state.interventions;
            case 'priPrimes':
                return state.priPrimes;
            default:
                return null;
        }
    }, [state]);

    // Check if data is stale (older than 24 hours)
    const isDataStale = useCallback(() => {
        if (!state.lastSyncTime) return true;
        const hoursSinceSync = (Date.now() - state.lastSyncTime) / (1000 * 60 * 60);
        return hoursSinceSync > 24;
    }, [state.lastSyncTime]);

    // Clear all referentiel data
    const clearReferentielData = useCallback(async () => {
        try {
            const keys = [
                '@referentiel_mode_reglement',
                '@referentiel_articles',
                '@referentiel_immeubles',
                '@referentiel_alertes',
                '@referentiel_drapeaux',
                '@referentiel_interventions',
                '@referentiel_pri_primes',
                '@referentiel_last_sync_time'
            ];
            
            await AsyncStorage.multiRemove(keys);
            dispatch({ type: 'RESET_STATE' });
            console.log('Referentiel data cleared');
        } catch (error) {
            console.error('Error clearing referentiel data:', error);
        }
    }, []);

    return (
        <ReferentielContext.Provider
            value={{
                // State
                ...state,
                
                // Actions
                syncReferentielData,
                refreshReferentielData,
                getReferentielData,
                clearReferentielData,
                isDataStale,
                refreshImmeublesFromSQLite,
                refreshCountData,
                
                // Computed values
                hasData: state.modeReglement.length > 0 || 
                        state.articles.length > 0 || 
                        state.immeubles.length > 0 ||
                        state.priPrimes.length > 0,
                
                dataCount: {
                    modeReglement: state.modeReglement.length,
                    articles: state.articles.length,
                    immeubles: state.immeubles.length,
                    alertes: state.alertes.length,
                    drapeaux: state.drapeaux.length,
                    interventions: state.interventions.length,
                    priPrimes: state.priPrimes.length
                }
            }}
        >
            {children}
        </ReferentielContext.Provider>
    );
};

// Custom hook
export const useReferentiel = () => {
    const context = useContext(ReferentielContext);
    if (context === undefined) {
        throw new Error('useReferentiel must be used within a ReferentielProvider');
    }
    return context;
};
