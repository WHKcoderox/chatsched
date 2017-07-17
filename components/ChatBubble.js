import React from 'react';
import {
    View,
    Text,
    Linking,
    Image,
    StyleSheet,
} from 'react-native';

/*
 * This is the format of a chat bubble. It takes in the properties:
 *                                                      senderID,
 *                                                      content,
 *                                                      timeStamp,
 *                                                      imgUri,
 * Then, these properties are put together in a "bubble"
 */

// CSS -={ start }=-
const stylesheet = {
    chatBubbleStyle: {
        flex: 4,
        marginVertical: 10,
        marginHorizontal: 10,
        borderRadius: 20,
        padding: 10,
        borderWidth: 10,
    },
    contText: {
        fontSize: 20,
    },
    senderText: {
        fontFamily: "visitor",
    },
    spacing: {
        flex: 1,
    },
};
const styles = StyleSheet.create(stylesheet);
// CSS -={ end }=-

export default class ChatBubble extends React.Component {

    msgBgCol = ['rgba(0,0,0,0.05)','#fff'];

    sender = this.props.senderID;
    msg = this.props.content;
    time = this.props.timeStamp;
    date = this.props.dateStamp;
    imgUri = this.props.imgUri;
    img = this.imgUri === false? false : () => {
        return (
            <Image
                source={{uri: this.imgUri}}
            />
        )
    };

    sentby = StyleSheet.create(
        {
            changingStyle: {
                backgroundColor: this.msgBgCol[ (this.sender === "trollfalgar")? 0:1 ],
                borderColor: this.msgBgCol[ (this.sender === "trollfalgar")? 1:0 ],
            }
        }
    );

    render() {
        return (
            <View style={ { flexDirection: 'row' } }>
                <View style={ [ styles.chatBubbleStyle, this.sentby.changingStyle ] }>

                    { (this.img !== false)? this.img() : null }
                    <Text
                        style={ styles.senderText }
                    >
                        { this.sender }</Text>
                    <Text
                        style={ styles.contText }
                    >
                        { this.msg }</Text>
                    <Text
                        style={ styles.specialText }
                    >
                        { [ this.time,'\n', this.date ] }</Text>

                </View>
                <View style={ styles.spacing } />
            </View>
        )
    }

}