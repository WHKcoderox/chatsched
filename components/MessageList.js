
import React, { Component } from 'react';
import { Row, Image, View, Subtitle, Caption, Heading} from '@shoutem/ui';
import { ListView, Text, } from 'react-native';
import moment from 'moment';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

const Message = ({ msg }, sectID, rowID) => (
    <Row>
        <Image styleName="small-avatar top"
               source={{ uri: msg.author.avatar }} />
        <View styleName="vertical">
            <View styleName="horizontal space-between">
                <Subtitle>{msg.author.name}</Subtitle>
                <Caption>{moment(msg.time).from(Date.now())}</Caption>
            </View>
            <Text>{msg.text}</Text>
        </View>
    </Row>
);

const MessageList = ({ messages }) => (
    <ListView dataSource={ds.cloneWithRows(messages)}
              renderRow={(msg, sectID, rowID) => <Message msg={msg} />} />
);

export default MessageList;
