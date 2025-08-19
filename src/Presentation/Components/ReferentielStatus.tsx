import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useReferentiel } from '../../Infrastructure/Contexte/ReferentielContext';

const ReferentielStatus = () => {
    const { 
        isLoading, 
        error, 
        isOffline, 
        lastSyncTime, 
        dataCount, 
        hasData,
        syncReferentielData,
        isDataStale 
    } = useReferentiel();

    if (!hasData && !isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.noDataText}>Aucune donnée référentielle disponible</Text>
                <TouchableOpacity 
                    style={styles.syncButton} 
                    onPress={syncReferentielData}
                    disabled={isOffline}
                >
                    <Text style={styles.syncButtonText}>
                        {isOffline ? 'Hors ligne' : 'Synchroniser'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Statut:</Text>
                <Text style={[
                    styles.statusValue, 
                    isOffline ? styles.offlineStatus : styles.onlineStatus
                ]}>
                    {isOffline ? 'Hors ligne' : 'En ligne'}
                </Text>
            </View>

            {lastSyncTime && (
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Dernière sync:</Text>
                    <Text style={[
                        styles.statusValue,
                        isDataStale() ? styles.staleStatus : styles.freshStatus
                    ]}>
                        {new Date(lastSyncTime).toLocaleString('fr-FR')}
                        {isDataStale() && ' (Périmé)'}
                    </Text>
                </View>
            )}

            <View style={styles.dataCountRow}>
                <Text style={styles.dataCountLabel}>Données:</Text>
                <Text style={styles.dataCountValue}>
                    {dataCount.modeReglement + dataCount.articles + dataCount.immeubles + dataCount.priPrimes} éléments
                </Text>
            </View>

            {/* Show detailed data counts */}
            <View style={styles.detailedCountsContainer}>
                {dataCount.modeReglement > 0 && (
                    <Text style={styles.detailedCountText}>Mode Reglement: {dataCount.modeReglement}</Text>
                )}
                {dataCount.articles > 0 && (
                    <Text style={styles.detailedCountText}>Articles: {dataCount.articles}</Text>
                )}
                {dataCount.immeubles > 0 && (
                    <Text style={styles.detailedCountText}>Immeubles: {dataCount.immeubles}</Text>
                )}
                {dataCount.priPrimes > 0 && (
                    <Text style={styles.detailedCountText}>Pri Primes: {dataCount.priPrimes}</Text>
                )}
            </View>

            {error && (
                <View style={styles.errorRow}>
                    <Text style={styles.errorText}>Erreur: {error}</Text>
                </View>
            )}

            <TouchableOpacity 
                style={[styles.syncButton, isLoading && styles.syncButtonLoading]} 
                onPress={syncReferentielData}
                disabled={isLoading || isOffline}
            >
                <Text style={styles.syncButtonText}>
                    {isLoading ? 'Synchronisation...' : 'Actualiser'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    noDataText: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 10,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    statusLabel: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '500',
    },
    statusValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    onlineStatus: {
        color: '#28a745',
    },
    offlineStatus: {
        color: '#dc3545',
    },
    freshStatus: {
        color: '#28a745',
    },
    staleStatus: {
        color: '#ffc107',
    },
    dataCountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dataCountLabel: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '500',
    },
    dataCountValue: {
        fontSize: 14,
        color: '#007bff',
        fontWeight: 'bold',
    },
    errorRow: {
        marginBottom: 10,
    },
    errorText: {
        fontSize: 12,
        color: '#dc3545',
        textAlign: 'center',
    },
    syncButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    syncButtonLoading: {
        backgroundColor: '#6c757d',
    },
    syncButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    detailedCountsContainer: {
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    detailedCountText: {
        fontSize: 13,
        color: '#6c757d',
        marginBottom: 2,
    },
});

export default ReferentielStatus;
