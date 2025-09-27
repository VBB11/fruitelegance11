import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const initialCart = JSON.parse(localStorage.getItem('cart') || '[]');

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.find(item => item._id === action.payload._id);
      if (existingItem) {
        return state.map(item =>
          item._id === action.payload._id
            ? { ...item, qty: (item.qty || 1) + 1 }
            : item
        );
      } else {
        return [...state, { ...action.payload, qty: 1 }];
      }
    }
    
    case 'INCREMENT_QTY': {
        return state.map(item =>
            item._id === action.payload
                ? { ...item, qty: item.qty + 1 }
                : item
        );
    }

    case 'DECREMENT_QTY': {
        const itemToDecrement = state.find(item => item._id === action.payload);
        if (!itemToDecrement) {
            return state;
        }
        
        if (itemToDecrement.qty > 1) {
            return state.map(item =>
                item._id === action.payload
                    ? { ...item, qty: item.qty - 1 }
                    : item
            );
        } else {
            return state.filter(item => item._id !== action.payload);
        }
    }
    
    case 'REMOVE_ITEM':
      return state.filter(item => item._id !== action.payload);
      
    case 'CLEAR_CART':
      return [];
      
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}