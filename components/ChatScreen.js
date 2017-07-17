import React from 'react';
import {
    ScrollView,
    Header,
    Text,
    View,
    StyleSheet,
} from 'react-native';

import ChatBubble from '../components/ChatBubble';
import Input from '../components/Input';

// styling the scrollView -={ start }=-
const styles = StyleSheet.create({
    chatContent: {
        justifyContent: 'space-between',
    },
});
// styling the scrollView -={ end }=-

import firebase from '../firebase';

// exporting chat UI -={ start }=-
export default class ChatScreen extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            messages: [],
        };
        this.db = this.dbRef();
    }

    dbRef() {
        return firebase.database().ref();
    }

    // fetch messages -={ start }=-
    listenForMessages(db) {
        /*setTimeout(
            db.on('value', (snapshot) => {
                let snapsht = snapshot;
                snapsht.val().forEach(
                    (messageKey, message) =>
                    {
                        this.state.messages.push({ ...message, loaded: true, });
                    }
                );
            }), 0
        );*/
    }
    componentDidMount(){
        this.listenForMessages(this.db);
        console.log(this.state.messages);
        this.setState({messages: [...this.state.messages, this.messageArr]});
    }
    // fetch messages -={ end }=-

    messageArr = [
        {
            senderID: "lol",
            receipientID: "trollfalgar",
            content: "woof",
            timeStamp: "1309",
            dateStamp: "20000131",
            img: {
                uri: false
            }
        },
        {
            senderID: "trollfalgar",
            receipientID: "lol",
            content: "meow\n".repeat(20),
            timeStamp: "1310",
            dateStamp: "20000131",
            img: {
            uri: false
        }
        },
        {
            senderID: "thirdwheel",
            receipientID: "trollol",
            content: "What's up you two?",
            timeStamp: Date.now(),
            dateStamp: Date.UTC,
            img: {
            uri: "https://i.imgur.com/mxgtWKt.jpg"
        }
        },
    ];

    bubbleArr() {
        return (
            <ScrollView contentContainerStyle={styles.chatContent}>
                { this.renderMessages() }
            </ScrollView>
        )
    };

    renderMessages = () => {
        const rendered = [];
        this.messageArr.forEach( (message) => {
            let msg = message;
            rendered.push(
                <ChatBubble
                    content={ msg.content }
                    timeStamp={ msg.timeStamp }
                    imgUri={ msg.img.uri }
                    senderID={ msg.senderID }
                    dateStamp={msg.dateStamp}
                />
            );
        });
        this.state.messages.forEach( (message) => {
            let msg = message;
            console.log(msg);
        });
        return rendered;
    };

    render(){
        return (
            <View style={{flex: 1}}>
                { this.bubbleArr() }
                <Input
                    multiline={true}
                    placeholder="Say something..."
                />
            </View>
        )
    };

}
// exporting chat UI -={ end }=-