import axios from 'axios';
import history from '../history';
import { error, fetchRecipe } from './';
import socket from '../socket';

/**
 * ACTION TYPES
 */
const GET_USER_ITEMS = 'GET_USER_ITEMS';
const REMOVE_FRIDGE_ITEM = 'REMOVE_FRIDGE_ITEM';
const ADD_ITEM_TO_FRIDGE = 'ADD_ITEM_TO_FRIDGE';

/**
 * ACTION CREATORS
 */
const getItems = items => ({ type: GET_USER_ITEMS, items });
const addItem = item => ({ type: ADD_ITEM_TO_FRIDGE, item });
const remove = itemId => ({ type: REMOVE_FRIDGE_ITEM, itemId });

/**
 * THUNK CREATORS
 */
 let counter = 0;
export const AddProductThunk = item => (dispatch) => {
  axios.post('/api/fridge', item).catch(() => dispatch(error('Please enter a real food item')));
  socket.on('post_to_fridge', (addedItem) => {
    counter++;
    console.log(counter)
    dispatch(addItem(addedItem));
    dispatch(fetchRecipe());
    dispatch(error('')); // Empty string === no error
    history.push('/myfridge');
  });
};

export const fetchProducts = () => (dispatch) => {
  axios.get('/api/fridge').catch(console.error);
  socket.on('get_fridge', (fridgeItems) => {
    console.log('UP IN THE get_fridge SOCKET');
    dispatch(getItems(fridgeItems));
  });
};

export const removeItem = itemId =>
  dispatch =>
    axios.delete(`/api/fridge/${itemId}`)
      .then(res => res.data)
      .then(dispatch(remove(itemId)))
      .then(() => {
        dispatch(fetchRecipe());
      })
      .catch(err => console.log(err));


/**
 * Reducer
 */

export default (state = [], action) => {
  switch (action.type) {
    case ADD_ITEM_TO_FRIDGE:
      return [...state, action.item];
    case GET_USER_ITEMS:
      return action.items;
    case REMOVE_FRIDGE_ITEM:
      return state.filter(fridgeItems => (fridgeItems.id !== action.itemId));
    default:
      return state;
  }
};
