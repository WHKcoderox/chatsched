import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { Title, Spinner, Container, Button, Text, } from 'native-base/src';
import Input from './Input';
import { login, setUserName, setUserAvatar, setUserID, setGroupID } from '../actions';

const mapStateToProps = (state) => {
    return {authorizing: state.user.authorizing}
};

class LoginUI extends Component {
    state = {
        name: null,
        avatar: null,
        userID: null,
        groupID: null,
    };

    doLogin = () => {
        let warning = "";
        if(this.state.name) {
            this.props.dispatch(setUserName(this.state.name));
        } else{
            warning += "name ";
        }
        if(this.state.groupID) {
            this.props.dispatch(setGroupID(this.state.groupID));
        } else{
            warning += "groupID ";
        }
        if(this.state.userID) {
            this.props.dispatch(setUserID(this.state.userID));
        } else{
            warning += "userID";
        }
        if(warning !== ""){
            alert("Please fill in field(s): " + warning);
            return;
        }
        this.props.dispatch(setUserAvatar(this.state.avatar));
        this.props.dispatch(login());
    };

    render() {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Title>Who are you?</Title>

                <Input style={{width: 400}}
                       placeholder="Unique account name here"
                       onChangeText={(userID) => {this.state.userID=userID}}
                       multiline={false}
                       ref="userid"/>

                <Input style={{width: 400}}
                       placeholder="Unique groupchat ID here"
                       onChangeText={(groupID) => {this.state.groupID=groupID}}
                       multiline={false}
                       ref="userid"/>

                <Input style={{width: 200}}
                       placeholder="Your name here"
                       onChangeText={(name) => {this.state.name=name}}
                       multiline={false}
                       ref="username"/>

                <Input style={{width: 200}}
                       placeholder="Your avatar URL here"
                       onChangeText={(avatar) => {this.state.avatar=avatar}}
                       multiline={false}
                       ref="avatar"/>

                <Button style={{alignSelf: 'center'}} title="Login" bordered onPress={() => this.doLogin()}><Text>Login</Text></Button>
            </View>
        );
    }
}
export default connect(mapStateToProps)(LoginUI);