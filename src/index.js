import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App/App.jsx';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
// Step 1: npm install redux-saga
// Step 2: import createSagaMiddleware
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import axios from 'axios';
// put in redux-saga is dispatch
import { takeEvery, put } from 'redux-saga/effects';


const elementList = (state = [], action) => {
    switch (action.type) {
        case 'SET_ELEMENTS':
            return action.payload;
        default:
            return state;
    }
};    

function* fetchElements() {
    try {
        // Wait for a server response
        const elements = yield axios.get('/api/element');
        //  After we get a response, this will dispatch an action
        yield put({ type: 'SET_ELEMENTS', payload: elements.data});
    } catch (error) {
        console.log(`Error in fetchElements: ${error}`);
        alert('Something went wrong.');
    }
}

function* postElement(action) {
    try {
        yield axios.post('/api/element', action.payload);
        yield put({ type: 'FETCH_ELEMENTS'});
        action.setNewElement('');
    } catch (error) {
        console.log(`Error in postElement: ${error}`);
        alert('Something went wrong.')
    }
}

// Step 3: create a root saga
// this is the saga that will watch for actions
function* rootSaga() {
    // ! FETCH_ELEMENTS is our action type. DO NOT USE the same action as the reducer
    yield takeEvery('FETCH_ELEMENTS', fetchElements);
    yield takeEvery('ADD_ELEMENT', postElement);
}

// Step 4: create Saga Middleware
const sagaMiddleware = createSagaMiddleware();

// This is creating the store
// the store is the big JavaScript Object that holds all of the information for our application
const storeInstance = createStore(
    // This function is our first reducer
    // reducer is a function that runs every time an action is dispatched
    combineReducers({
        elementList,
    }),
    // Step 5: add middleware to redux
    applyMiddleware(sagaMiddleware, logger),
);

// Step 6: add our root saga to our middleware
sagaMiddleware.run(rootSaga);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={storeInstance}>
            <App />
        </Provider>
    </React.StrictMode>
);
