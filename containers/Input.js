import React, { Component } from 'react';
import { connect } from 'react-redux';

/*import { TextInput } from '@shoutem/ui';


class Input extends Component {
    state = {
        text: null
    };

    onChangeText = text => this.setState({text: text});

    onSubmitEditing = () => {
        this.props.dispatch(this.props.submitAction(this.state.text));

        if (!this.props.noclear) {
            this.setState({
                text: null
            });
        }
    };

    render() {
        return (
            <TextInput placeholder={this.props.placeholder}//
                       onChangeText={this.onChangeText}//
                       onSubmitEditing={this.onSubmitEditing}//
                       ref="input"/>
        )
    }
}

export default connect()(Input);
*/