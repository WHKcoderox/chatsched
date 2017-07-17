import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import App from './App';
import { Example } from '@shoutem/ui';
import ChatScreen from './components/ChatScreen';

export default class ChatSched extends Component {
    render() {
        return (
            <App />
        );
    }
}

AppRegistry.registerComponent('ChatSched', () => ChatSched);
