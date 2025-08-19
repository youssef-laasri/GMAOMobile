import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InterventionStateService } from '../../Application/Services/InterventionStateService';

interface TimeLapseProps {
    startTime?: number;
    showSeconds?: boolean;
    compact?: boolean;
}

const TimeLapse: React.FC<TimeLapseProps> = ({ 
    startTime, 
    showSeconds = true, 
    compact = false 
}) => {
    const [duration, setDuration] = useState<string>('');

    useEffect(() => {
        const updateDuration = async () => {
            try {
                if (startTime) {
                    const durationMs = Date.now() - startTime;
                    setDuration(InterventionStateService.formatDuration(durationMs));
                } else {
                    const durationMs = await InterventionStateService.getInterventionDuration();
                    if (durationMs > 0) {
                        setDuration(InterventionStateService.formatDuration(durationMs));
                    }
                }
            } catch (error) {
                console.error('Error updating duration:', error);
            }
        };

        // Update immediately
        updateDuration();

        // Update every second
        const interval = setInterval(updateDuration, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    if (!duration) {
        return null;
    }

    return (
        <View style={[styles.container, compact && styles.compactContainer]}>
            <Text style={[styles.durationText, compact && styles.compactText]}>
                {duration}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#f0f8ff',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    compactContainer: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    durationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#495DA4',
    },
    compactText: {
        fontSize: 14,
    },
});

export default TimeLapse;
