import React from 'react';
import axios from 'axios';

import { MyContext } from './context.js';
import Config from './config.js';

class GuildInfo extends React.Component
{
    state = {
        guild: {
            owner: {}
        }
    }

    componentDidMount()
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/guild/info', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({guild: res.data});
        })
    }

    render()
    {
        if(!this.state.guild || !this.state.guild.owner)
            return (null);

        return (
            <div className="dashboard-box">
                <a href={'https://discord.com/channels/'+this.state.guild.guildId} target="_blank" rel="noopener noreferrer">
                    <span className="dashboard-title">
                        <img src={this.state.guild.iconUrl} width="32" alt="Guild Icon"/>
                        {this.state.guild.guildName}
                    </span>
                </a>
                <table className="dashboard-table">
                    <tbody>
                        <tr>
                            <td className="dashboard-table-key">Owner</td>
                            <td className="dashboard-table-value">
                                <img src={this.state.guild.owner.avatarUrl} width="32" alt="Avatar"/>
                                {this.state.guild.owner.tag}
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Befehlskanal</td>
                            <td className="dashboard-table-value">
                                <a href={'https://discord.com/channels/'+this.state.guild.guildId+'/'+this.state.guild.commandChannelId}
                                    target="_blank" rel="noopener noreferrer">
                                    #{this.state.guild.commandChannelName}
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

class UserInfo extends React.Component
{
    render()
    {
        if(!this.props.user)
            return (null);

        return (
            <div className="dashboard-box">
                <span className="dashboard-title">
                    <img src={this.props.user.avatarUrl} width="32" alt="Avatar"/>
                    {this.props.user.tag}
                    <span className={"online-status online-status-"+this.props.user.onlineStatus}>⬤</span>
                </span>
                <table className="dashboard-table">
                    <tbody>
                        <tr>
                            <td className="dashboard-table-key">seit</td>
                            <td className="dashboard-table-value">
                                {new Date(this.props.user.timeJoined*1000||0).toLocaleString()}
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Nick</td>
                            <td className="dashboard-table-value">
                                {this.props.user.nickname}
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Rolle</td>
                            <td className="dashboard-table-value">
                                <span style={{color: "#"+(this.props.user.roleColor||0).toString(16).padStart(6, '0')}}>{this.props.user.role}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Coins</td>
                            <td className="dashboard-table-value">
                                {this.props.user.coins}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

class Dashboard extends React.Component
{
    render()
    {
        return (
            <div className="dashboard">
                <GuildInfo/>
                <UserInfo user={this.props.user}/>
            </div>
        );
    }
}

UserInfo.contextType = MyContext;
GuildInfo.contextType = MyContext;

export default Dashboard;
