import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, ScrollView } from 'react-native';
import { Header, Button } from 'native-base/src';

import Messages from '../containers/Messages';
import { sendMessage, showWeather, } from '../actions';
import Input from "./Input";

const mapStateToProps = (state) => {
    return {
        user: state.user,
    }
};

// connect(mapStateToProps)(ChatUI) --> connects global state to ChatUI.props
class ChatUI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: null,
            mapRegion: null,
            gpsAccuracy: null,
            recommendations: [],
            lookingFor: null,
            headerLocation: null,
        };
    };
    watchID = null;
    //location_timeout = setTimeout("geolocFail()", 10000);
    geolocFail = (error) => {
        alert("failed");
    };
    componentWillMount() {
        // on mount, calls watchPosition, assigns watchID, then stores region
        /*this.watchID = navigator.geolocation.watchPosition((position) => {
            clearTimeout(this.location_timeout);
            let region = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.00922,
                longitudeDelta: 0.00421
            };
            alert("hello world");

            this.onRegionChange(region, position.coords.accuracy);
        }),(error)=>{this.geolocFail(error);console.log(error);},{timeout:2000}*/
    }
    componentWillUnmount() {
        //navigator.geolocation.clearWatch(this.watchID);
    }

    onRegionChange(region, gpsAccuracy) {
        this.setState({
            mapRegion: region,
            gpsAccuracy: gpsAccuracy || this.state.gpsAccuracy
        });
    }

    send = (text) => {
        /*this.watchID = navigator.geolocation.watchPosition((position) => {
            let region = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.00922,
                longitudeDelta: 0.00421
            };
            alert("hello world");

            this.onRegionChange(region, position.coords.accuracy);
        },(error)=>{console.log(error)},{timeout:2000});
        alert(this.state.mapRegion);*/
        this.state.text = "";
        if(text) {
            this.props.dispatch(sendMessage(text, this.props.user));
        }
    };

    render() {
        return (
            <View style={{flex:1}}>
                <Header style={{flexDirection: 'row', paddingTop: 20}}>
                    <Text>Chat Interface{(this.props.user.groupID)}</Text>
                    <Button bordered color="#f900ff" onPress={() => {showWeather()}}>
                        <Text>Weather</Text>
                    </Button>
                </Header>
                <ScrollView style={{height: 500}}
                            ref={ref => this.scrollView = ref}
                            onContentSizeChange={(contentWidth, contentHeight)=>{
                                this.scrollView.scrollToEnd({animated: true});
                            }}
                >
                    <Messages />
                </ScrollView>
                <View style={{flexDirection: 'row'}} contentContainerStyle={{}}>
                    <Input
                        value={this.state.text}
                        style={{width: 320}}
                        onChangeText={(text) => {this.state.text = text}}
                        multiline
                        placeholder="Say something cool..." />
                    <Button bordered color="red" onPress={() => {(this.state)? this.send(this.state.text) : alert("no state")}}>
                        <Text>Send</Text>
                    </Button>
                </View>
            </View>
        )
    }
}

export default connect(mapStateToProps)(ChatUI);