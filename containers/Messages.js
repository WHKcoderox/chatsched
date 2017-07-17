import React from 'react';
import { connect } from 'react-redux';
import { Container, Spinner } from 'native-base/src';

import MessageList from '../components/MessageList';
import { updateMessagesHeight } from '../actions';
const mapStateToProps = (state) => ({
    messages: state.chatroom.messages,
    isFetching: state.chatroom.meta.isFetching
});

const Messages = connect(
    mapStateToProps
)(({ messages, isFetching, dispatch }) => {
    if (isFetching) {
        return (
            <Container style={{paddingTop: 50,
                          paddingBottom: 50}}>
                <Spinner />
            </Container>
        )
    }else{
        return <MessageList messages={messages}
                            style={{minHeight: 100}} />
    }
});

export default Messages;
