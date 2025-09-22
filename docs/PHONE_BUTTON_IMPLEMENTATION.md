/**
 * Phone Button Implementation Test
 * 
 * This demonstrates how the phone button works in DetailIntervention component
 */

// Example of how the phone button will appear for fields starting with "Tel"
const exampleData = {
    sections: [
        {
            title: "Contact Information",
            params: {
                "Tel Principal": "0639883013",
                "Tel Secondaire": "0123456789", 
                "Email": "contact@example.com",
                "Tel Urgence": "0987654321"
            }
        }
    ]
};

// The renderParameter function will detect keys starting with "Tel" and add phone buttons
// For "Tel Principal": "0639883013" - will show phone button
// For "Tel Secondaire": "0123456789" - will show phone button  
// For "Tel Urgence": "0987654321" - will show phone button
// For "Email": "contact@example.com" - will NOT show phone button

// When user taps the phone button, it will call:
// Linking.openURL(`tel:${phoneNumber}`)
// This will open the device's phone app with the number pre-filled

export default exampleData;



