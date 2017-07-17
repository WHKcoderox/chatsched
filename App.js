import React, { Component } from 'react';

import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { ScrollView, } from 'react-native';
import ChatUI from './components/ChatUI';
import LoginUI from './components/LoginUI';
import rootReducer from './reducers';
import { fetchMessages, checkUserExists, hideWeather, } from './actions';
import { Button,Text } from "native-base/src";

const loggerMiddleware = createLogger();

const store = createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware,
        //loggerMiddleware,
    )
);

const LoginOrChat = connect(
    (state) => ({
        showWeather: state.chatroom.showWeather,
        weather: state.chatroom.weather,
        showLocation: state.chatroom.showLocation,
        authorized: state.user.authorized
    }))
    (({ showWeather, weather, authorized, dispatch }) => {
        if (authorized) {
            alert('authorised');
            if (showWeather) {
                return (
                    <ScrollView>
                        <Text>You got cucked\n
                            { weather }</Text>
                        <Button
                            title="hideWeather"
                            onPress={() => hideWeather()}>
                            <Text>Hide</Text>
                        </Button>
                    </ScrollView>
                );
            } else {
                return (<ChatUI />);
            }
        }else{
            dispatch(checkUserExists());
            return (<LoginUI />);
        }
});

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <LoginOrChat />
            </Provider>
        );
    }
}

export default App;