import { View, Text, Modal, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from '@react-navigation/native';
import screenNames from '../../Infrastructure/Navigation/navigationNames';


interface FinInterventionModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (datetime: Date) => void;
    title: string;
    initialDateTimeFin?: Date;
}

const FinInterventionModal = ({ visible, onClose, onConfirm, title, initialDateTimeFin }: FinInterventionModalProps) => {
    const [datetime1, setDatetime1] = useState(initialDateTimeFin || new Date());
    const { navigate } = useNavigation();
    const [showDateFin, setShowDateFin] = useState(false);
    const [showTimeFin, setShowTimeFin] = useState(false);

    // Update datetime when initialDateTime prop changes or modal becomes visible
    useEffect(() => {
        console.log(initialDateTimeFin, 'selectedDate');
        if (visible) {
            if (initialDateTimeFin) {
                setDatetime1(initialDateTimeFin);
            } else {
                setDatetime1(new Date());
            }
            // Reset the picker states when modal becomes visible
            setShowDateFin(false);
            setShowTimeFin(false);
        }
    }, [initialDateTimeFin]);


    const onChangeDate = (event: any, selectedDate?: Date) => {
        console.log(selectedDate?.toLocaleString('fr-FR'), 'selectedDate');
        
        if (selectedDate) {
            setDatetime1(selectedDate);
            setShowDateFin(false);
        }
    };

    const onChangeTime = (event: any, selectedDate?: Date) => {
        console.log(selectedDate?.toLocaleString('fr-FR'), 'selectedDate');
        if (selectedDate) {
            setDatetime1(selectedDate);
            setShowTimeFin(false);
        }
    };

    function makeTwoDigits(time: number) {
        const timeString = `${time}`;
        if (timeString.length === 2) return time
        return `0${time}`
    }

    function formatDateToDDMMYYYY(date: Date): string {
        const day = makeTwoDigits(date.getDate());
        const month = makeTwoDigits(date.getMonth() + 1); // getMonth() returns 0-11
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <SafeAreaView style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{title}</Text>

                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Date : </Text>
                        <Text style={styles.inputValue}>{formatDateToDDMMYYYY(datetime1)}</Text>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setShowDateFin(true)}>
                            <Image
                                source={require('./../../../assets/Icons/clock.png')}
                                style={styles.clockIcon}
                            />
                            {showDateFin && (
                                <DateTimePicker
                                    value={datetime1}
                                    mode="date"
                                    display="default" // Uses system default UI
                                    onChange={onChangeDate}
                                />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Heure : </Text>
                        <Text style={styles.inputValue}>{makeTwoDigits(datetime1.getHours())} : {makeTwoDigits(datetime1.getMinutes())}</Text>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setShowTimeFin(true)}>
                            <Image
                                source={require('./../../../assets/Icons/clock.png')}
                                style={styles.clockIcon}
                            />
                            {showTimeFin     && (
                                <DateTimePicker
                                    value={datetime1}
                                    mode="time"
                                    display="default" // Uses system default UI
                                    onChange={onChangeTime}
                                />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>ANNULER</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={() => onConfirm(datetime1)}
                        >
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    buildingInfoContainer: {
        padding: 15,
        backgroundColor: 'white',
    },
    infoLabel: {
        fontWeight: 'bold',
        marginTop: 8,
    },
    infoValue: {
        marginBottom: 4,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 5,
        width: '80%',
        padding: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 1,
        overflow: 'hidden',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 15,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        width: 80,
    },
    inputValue: {
        fontSize: 16,
        flex: 1,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clockIcon: {
        width: 40,
        height: 40,
        tintColor: '#5c6bc0',
    },
    buttonRow: {
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
    },
    cancelButton: {
    },
    confirmButton: {

    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FinInterventionModal;