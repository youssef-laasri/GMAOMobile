import React from 'react';
import { createContext, useState, useContext } from 'react';

// Define the initial state structure for the intervention context
const initialInterventionState = {};

// Create the context
const InterventionContext = createContext();

// Create the provider component
export const InterventionProvider = ({ children }) => {
  const [interventionData, setInterventionData] = React.useState(initialInterventionState);

  // Function to update the entire intervention data
  const updateInterventionData = (newData) => {
    setInterventionData(newData);
    console.log(interventionData, 'context');
  };

  // Function to update specific parts of the intervention data
  const updateInterventionField = (field, value) => {
    setInterventionData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  // Function to update a specific intervention info
  const updateInfosIntervention = (index, data) => {
    const newInfosIntervention = [...interventionData.infos_Intervention];
    newInfosIntervention[index] = {
      ...newInfosIntervention[index],
      ...data
    };
    
    setInterventionData(prevData => ({
      ...prevData,
      infos_Intervention: newInfosIntervention
    }));

    
  };

  // Function to update a specific building info
  const updateInfosImmeuble = (index, data) => {
    const newInfosImmeuble = [...interventionData.infos_Immeuble];
    newInfosImmeuble[index] = {
      ...newInfosImmeuble[index],
      ...data
    };
    
    setInterventionData(prevData => ({
      ...prevData,
      infos_Immeuble: newInfosImmeuble
    }));
  };

  // Function to add new intervention
  const addIntervention = (interventionData) => {
    setInterventionData(prevData => ({
      ...prevData,
      infos_Intervention: [...prevData.infos_Intervention, interventionData]
    }));
  };

  // Function to add new building
  const addImmeuble = (immeubleData) => {
    setInterventionData(prevData => ({
      ...prevData,
      infos_Immeuble: [...prevData.infos_Immeuble, immeubleData]
    }));
  };

  // Reset the intervention data to initial state
  const resetInterventionData = () => {
    setInterventionData(null);
  };

  return (
    <InterventionContext.Provider
      value={{
        interventionData,
        updateInterventionData,
        updateInterventionField,
        updateInfosIntervention,
        updateInfosImmeuble,
        addIntervention,
        addImmeuble,
        resetInterventionData
      }}
    >
      {children}
    </InterventionContext.Provider>
  );
};

// Custom hook to use the intervention context
export const useIntervention = () => {
  const context = React.useContext(InterventionContext);
  if (!context) {
    throw new Error('useIntervention must be used within an InterventionProvider');
  }
  return context;
};

// Example usage in a component:
/*
import { useIntervention } from './path-to-this-file';

const MyComponent = () => {
  const { 
    interventionData, 
    updateInfosIntervention, 
    updateInfosImmeuble 
  } = useIntervention();

  const handleUpdateComment = (newComment) => {
    updateInfosIntervention(0, { commentaire: newComment });
  };

  return (
    <View>
      <Text>Intervention Number: {interventionData.infos_Intervention[0].__NoIntervention}</Text>
      <TextInput
        value={interventionData.infos_Intervention[0].commentaire}
        onChangeText={handleUpdateComment}
        placeholder="Add comment"
      />
    </View>
  );
};
*/