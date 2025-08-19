import { Alert, Platform } from 'react-native'
import RNFS from 'react-native-fs';


export const CommonFunction = {

    // Function to save signature to file
    saveSignature: async (signature) => {
        if (!signature) {
            console.log(signature);
            
            Alert.alert('Error', 'Please sign before saving');
            return;
        }

        try {
            // Remove the data URL prefix to get just the base64 string
            const base64Data = signature.replace('data:image/png;base64,', '');

            // Define file path where signature will be saved
            const filePath = `file://${RNFS.CachesDirectoryPath}/signature.png`;

            // Write the base64 data to a file
            await RNFS.writeFile(filePath, base64Data, 'base64');

            console.log(`Signature saved to ${filePath}`);
            // Alert.alert('Success', `Signature saved to ${filePath}`);

            // You can now use this file path elsewhere in your app
            // For example, uploading to a server

            // Example of uploading file to server
            // uploadSignature(filePath);
            return filePath;
        } catch (error) {
            console.error('Error saving signature:', error);
            // Alert.alert('Error', 'Failed to save signature');
            return null;
        }
    },
}
