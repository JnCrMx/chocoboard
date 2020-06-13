import React from 'react';
import axios from 'axios';

import { MyContext } from './context.js';
import Config from './config.js';

class ChannelSelector extends React.Component
{
    state = {

    };

    componentDidMount()
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/guild/channels', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({channels: res.data});
        });
    }

    render()
    {
        var channels = (this.state.channels||[]).map(channel => 
            <div className={"selector-channel"+(this.props.channel === channel.id ? " selector-channel-selected" : "")} onClick={this.props.select.bind(null, channel)}>
                {channel.name}
            </div>);

        return (
            <div className={"selector-channels"+(this.props.open?" selector-channels-open":"")}>
                {channels}
            </div>
        );
    }
}

class RoleSelector extends React.Component
{
    state = {

    };

    componentDidMount()
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/guild/roles', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({roles: res.data});
        });
    }

    render()
    {
        var roles = (this.state.roles||[]).map(role => 
            <div className="selector-channel" onClick={this.props.select.bind(null, role)}>
                {role.name}
            </div>);

        return (
            <div className={"selector-channels"+(this.props.open?" selector-channels-open":"")}>
                {roles}
            </div>
        );
    }
}

ChannelSelector.contextType = MyContext;
RoleSelector.contextType = MyContext;

export { ChannelSelector, RoleSelector };
