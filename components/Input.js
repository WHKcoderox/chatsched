import React from 'react';
import {
    TextInput,
    View,
    StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';

const styles = StyleSheet.create({
    inputBar: {
        fontSize: 20,
    }
});
const MAXHEIGHT = 150;

export default class Input extends React.Component {
    state = {
        height: null,
    };

    componentDidMount = () => {
        //alert("latest");
    };

    onContentSizechange = event => {
        this.setState({...this.state, height: event.nativeEvent.contentSize.height})
    };

    render() {
        return (
            <View>
                <TextInput
                    value={this.props.value}
                    style={[this.props.style, styles.inputBar, {height: Math.min(this.state.height, MAXHEIGHT)}]}
                    multiline={this.props.multiline}
                    onChangeText={(text) => this.props.onChangeText(text)}
                    onContentSizeChange={(event) => this.onContentSizechange(event)}
                    placeholder={this.props.placeholder}
                    ref="input"
                />
            </View>
        )
    }
}