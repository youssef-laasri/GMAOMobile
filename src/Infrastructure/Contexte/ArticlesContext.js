import React, { createContext, useContext, useReducer, useEffect,useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterventionStateService } from '../../Application/Services/InterventionStateService';

// Create the context
const CartContext = createContext();

// Initial state
const initialCartState = [];
const initialArticlesCartState = [];


const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { article } = action.payload;

      // Check if item exists
      const existingItemIndex = state.findIndex(
        item => item.codeArticle === article.codeArticle
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedCart = [...state];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1,
          total: (updatedCart[existingItemIndex].quantity + 1) * updatedCart[existingItemIndex].unitPrice
        };
        return updatedCart;
      } else {
        // Add new item
        return [...state, { ...article, quantity: 1, total: article.unitPrice }];
      }
    }

    case 'REMOVE_ITEM':
      return state.filter(item => item.codeArticle !== action.payload.codeArticle);

    case 'UPDATE_QUANTITY': {
      const { codeArticle, quantity } = action.payload;
      return state.map(item => {
        if (item.codeArticle === codeArticle) {
          return {
            ...item,
            quantity,
            total: quantity * item.unitPrice
          };
        }
        return item;
      });
    }

    case 'CLEAR_CART':
      return [];

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
};

const ArticlescartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      return action.payload || [];
    }

    case 'REMOVE_ITEM':
      return state.filter(item => item.codeArticle !== action.payload.codeArticle);

    case 'CLEAR_CART':
      return [];

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  const [ArticlesCart, dispatchArticlesCart] = useReducer(ArticlescartReducer, initialArticlesCartState);


  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadArticlesCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('Articlescart');
        if (savedCart) {
          dispatchArticlesCart({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
        }
      } catch (error) {
        console.error('Error loading cart from AsyncStorage', error);
      }
    };

    loadArticlesCart();
  }, []);

  // Save cart to AsyncStorage when it changes
  useEffect(() => {
    const saveArticlesCart = async () => {
      try {
        await AsyncStorage.setItem('Articlescart', JSON.stringify(ArticlesCart));
      } catch (error) {
        console.error('Error saving cart to AsyncStorage', error);
      }
    };

    saveArticlesCart();
  }, [ArticlesCart]);
  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
        }
      } catch (error) {
        console.error('Error loading cart from AsyncStorage', error);
      }
    };

    loadCart();
  }, []);

  // Save cart to AsyncStorage when it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to AsyncStorage', error);
      }
    };

    saveCart();
  }, [cart]);

  // Monitor intervention state and clear cart when new intervention starts
  useEffect(() => {
    const checkInterventionState = async () => {
      try {
        const interventionState = await InterventionStateService.getInterventionState();
        
        if (interventionState?.isStarted) {
          // Check if this is a new intervention by comparing timestamps
          const lastInterventionTime = await AsyncStorage.getItem('@last_intervention_time');
          const currentTime = interventionState.startTime.toString();
          
          if (lastInterventionTime !== currentTime) {
            // New intervention started, clear cart
            console.log('New intervention detected, clearing cart...');
            dispatch({ type: 'CLEAR_CART' });
            dispatchArticlesCart({ type: 'CLEAR_CART' });
            
            // Update last intervention time
            await AsyncStorage.setItem('@last_intervention_time', currentTime);
          }
        }
      } catch (error) {
        console.error('Error checking intervention state:', error);
      }
    };

    // Check immediately
    checkInterventionState();
    
    // Check every 5 seconds for new interventions
    const interval = setInterval(checkInterventionState, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate cart totals
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.total, 0);

  // Actions
  const addItem = (article) => {
    dispatch({ type: 'ADD_ITEM', payload: { article } });
  };

  const addArticlesItems = useCallback((article) => {
    dispatchArticlesCart({ type: 'ADD_ITEM', payload: article });
  }, []);

  const removeItem = (codeArticle) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { codeArticle } });
  };

  const updateQuantity = (codeArticle, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { codeArticle, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const clearArticlesCart = () => {
    dispatchArticlesCart({ type: 'CLEAR_CART' });
  };

  const clearAllCarts = () => {
    dispatch({ type: 'CLEAR_CART' });
    dispatchArticlesCart({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        ArticlesCart,
        itemCount,
        cartTotal,
        addItem,
        addArticlesItems,
        removeItem,
        updateQuantity,
        clearCart,
        clearArticlesCart,
        clearAllCarts
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};