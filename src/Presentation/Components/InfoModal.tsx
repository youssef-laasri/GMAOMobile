import { View, Text, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';

const InfoModal = ({ titleModal, Message, visible, onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.titleContainer}>
                        <Image style={styles.errorIcon} source={require('../../../assets/Icons/errorIcon.png')} />

                        <Text style={styles.modalTitle}>{titleModal}</Text>

                        <Text>               </Text>
                    </View>
                    <View style={styles.messageContainer}>
                        <Text style={styles.message}>{Message}</Text>
                    </View>
                    {/* {titleModal == 'Historique Intervention' && <FlatList
                        data={filteredData}
                        renderItem={renderHistoryItem}
                        keyExtractor={item => item.id}
                        ItemSeparatorComponent={renderSeparator}
                        style={styles.list}
                    />} */}

                    <TouchableOpacity style={styles.okButton} onPress={onClose}>
                        <Text style={styles.okButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingHorizontal: 20
    },
    modalContent: {
        width: '80%',
        // height: '40%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 15,
        // backgroundColor: '#f8f8f8',

    },
    okButton: {
        padding: 15,
        alignItems: 'center',
        // borderTopWidth: 1,
        // borderTopColor: '#ddd'
    },
    okButtonText: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    errorIcon: {
        width: 40,
        height: 40,
        marginRight: 10
    },
    messageContainer: {
        padding: 20
    },
    message: {
        fontSize: 14,
        fontWeight: '400'
    }
})


export default InfoModal;