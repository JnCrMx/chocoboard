import React from 'react';
import axios from 'axios';

import { MyContext } from './context.js';
import Config from './config.js';

import { ChannelSelector, RoleSelector } from './Selectors.js';

class Operators extends React.Component
{
    state = {
    }

    addRole = role =>
    {
        axios.put(Config.apiUrl + '/'+this.context.guild+'/guild/settings/operators/'+role.id, {},
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.props.addRole(role);
        });
    }

    removeRole = role =>
    {
        axios.delete(Config.apiUrl + '/'+this.context.guild+'/guild/settings/operators/'+role.id,
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.props.removeRole(role);
        });
    }

    render()
    {
        return (
            <div>
                <h2>Operatoren</h2>
                <table>
                    <tbody>
                        {this.props.data.map(r => 
                            (
                                <tr className="operator-entry">
                                    <td className="dashboard-table-key">
                                        {r.name}
                                    </td>
                                    <td>
                                        <button style={{background: 'none', border: 'none', fontSize: '25px'}} onClick={this.removeRole.bind(this, r)}>
                                            <span role="img" aria-label="delete">❌</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                <button style={{float: 'left'}} onClick={event => this.props.rolePopup(this.addRole)}><span role="img" aria-label="delete">➕</span></button>
            </div>
        );
    }
}

class MutedChannels extends React.Component
{
    state = {
    }

    addMutedChannel = channel =>
    {
        axios.put(Config.apiUrl + '/'+this.context.guild+'/guild/settings/muted/'+channel.id, {},
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.props.addMutedChannel(channel);
        });
    }

    removeMutedChannel = channel =>
    {
        axios.delete(Config.apiUrl + '/'+this.context.guild+'/guild/settings/muted/'+channel.id,
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.props.removeMutedChannel(channel);
        });
    }

    render()
    {
        return (
            <div>
                <h2>ignorierte Kanäle</h2>
                <table>
                    <tbody>
                        {(this.props.data||[]).map(c => 
                            (
                                <tr className="operator-entry">
                                    <td className="dashboard-table-key">
                                        {c.name}
                                    </td>
                                    <td>
                                        <button style={{background: 'none', border: 'none', fontSize: '25px'}} onClick={this.removeMutedChannel.bind(this, c)}>
                                            <span role="img" aria-label="delete">❌</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                <button style={{float: 'left'}} onClick={event => this.props.channelPopup(this.addMutedChannel)}><span role="img" aria-label="delete">➕</span></button>
            </div>
        );
    }
}

class Settings extends React.Component
{
    defaultSettings = {
        guild: this.context.guild,
        prefix: '',
        commandChannel: {
            name: 'undefined',
            id: "-1"
        },
        remindChannel: {
            name: 'undefined',
            id: "-1"
        },
        warningChannel: {
            name: 'undefined',
            id: "-1"
        },
        pollChannel: {
            name: 'undefined',
            id: "-1"
        },
        operators: []
    }

    state = {
        settings: this.defaultSettings,
        dirty: "ORIGINAL",
        selectingChannel: false,
        selectingChannelSelected: null,
        selectingChannelCallback: () => {},
        selectingRole: false,
        selectingRoleCallback: () => {}
    }

    componentDidMount()
    {
        this.fetchSettings();
    }

    fetchSettings = () =>
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/guild/settings', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            if(res.data)
            {
                this.setState({settings: res.data});
            }
            else
            {
                this.setState({settings: this.defaultSettings, dirty: "NEW"});
            }
        });
    }

    updatePrefix = event =>
    {
        const val = event.target.value;
        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                prefix: val
            },
            dirty: prevState.dirty === "NEW"?"NEW":"DIRTY"
        }));
    }

    selectingChannel = event =>
    {
        this.setState({
            selectingChannel: true,
            selectingChannelCallback: this.selectChannel,
            selectingChannelSelected: event.target.name
        });
        event.preventDefault();
    }

    selectChannel = channel =>
    {
        var copy = {...this.state.settings};
        copy[this.state.selectingChannelSelected] = channel;

        this.setState(prevState => ({
            settings: copy,
            selectingChannel: false,
            selectingChannelSelected: null,
            selectingChannelCallback: () => {},
            dirty: prevState.dirty === "NEW"?"NEW":"DIRTY"
        }));
    }

    closePopup = event =>
    {
        if(this.state.selectingChannel === true)
        {
            this.setState({
                selectingChannel: false,
                selectingChannelSelected: null,
                selectingChannelCallback: () => {},
            });
        }
        if(this.state.selectingRole === true)
        {
            this.setState({
                selectingRole: false,
                selectingRoleCallback: () => {}
            });
        }
    }

    openRolePopup = callback =>
    {
        this.setState({
            selectingRole: true,
            selectingRoleCallback: callback
        });
    }

    openChannelPopup = callback =>
    {
        this.setState({
            selectingChannel: true,
            selectingChannelCallback: callback
        });
    }

    save = event =>
    {
        axios.post(Config.apiUrl + '/'+this.context.guild+'/guild/settings', this.state.settings,
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        }).then(res =>
        {
            this.setState({dirty: "SAVED"});
        });
    }
    
    delete = event =>
    {
        if(window.confirm('Einstellungen wirklich löschen?'))
        {
            axios.delete(Config.apiUrl + '/'+this.context.guild+'/guild/settings',
            {
                headers: {'Authorization': 'Bearer '+this.context.token}
            }).then(res =>
            {
                this.fetchSettings();
            });
        }
    }

    addRole = role =>
    {
        var copy = {...this.state.settings};
        copy.operators.push(role);

        this.setState({settings: copy});
    }

    removeRole = role =>
    {
        var copy = {...this.state.settings};
        copy.operators = copy.operators.filter(op => op.id !== role.id);

        this.setState({settings: copy});
    }

    addMutedChannel = channel =>
    {
        var copy = {...this.state.settings};
        copy.mutedChannels.push(channel);

        this.setState({settings: copy});
    }

    removeMutedChannel = channel =>
    {
        var copy = {...this.state.settings};
        copy.mutedChannels = copy.mutedChannels.filter(ch => ch.id !== channel.id);

        this.setState({settings: copy});
    }

    render()
    {
        var saveText;
        switch(this.state.dirty)
        {
            case "SAVED":
                saveText = "✔ Gespeichert"
                break;
            case "NEW":
                saveText = "Eintragen"
                break;
            default:
                saveText = "Speichern";
                break;
        }

        return (
            <div onClick={this.closePopup} id="settings">
                <table style={{emptyCells: 'show'}}>
                    <tbody>
                        <tr>
                            <td className="dashboard-table-key">Prefix</td>
                            <td className="dashboard-table-value"><input value={this.state.settings.prefix} onChange={this.updatePrefix}/></td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Befehlskanal</td>
                            <td className="dashboard-table-value">{this.state.settings.commandChannel.name}
                                <button name="commandChannel" className="settings-select-button" onClick={this.selectingChannel}>Auswählen</button>
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Erinnerungskanal</td>
                            <td className="dashboard-table-value">{this.state.settings.remindChannel.name}
                                <button name="remindChannel" className="settings-select-button" onClick={this.selectingChannel}>Auswählen</button>
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Verwarnungskanal</td>
                            <td className="dashboard-table-value">{this.state.settings.warningChannel.name}
                                <button name="warningChannel" className="settings-select-button" onClick={this.selectingChannel}>Auswählen</button>
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Umfragekanal</td>
                            <td className="dashboard-table-value">{this.state.settings.pollChannel.name}
                                <button name="pollChannel" className="settings-select-button" onClick={this.selectingChannel}>Auswählen</button>
                            </td>
                        </tr>
                        <tr style={{height: '2.5vh'}}></tr>
                        <tr>
                            <td></td>
                            <td className="dashboard-table-value">
                                <button onClick={this.save} disabled={this.state.dirty !== "DIRTY" && this.state.dirty !== "NEW"}>{saveText}</button>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td className="dashboard-table-value">
                                <button onClick={this.delete} disabled={this.state.dirty === "NEW"} className="delete-button">Löschen</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <Operators
                    data={this.state.settings.operators}
                    rolePopup={this.openRolePopup}
                    addRole={this.addRole}
                    removeRole={this.removeRole}/>
                <MutedChannels
                    data={this.state.settings.mutedChannels}
                    channelPopup={this.openChannelPopup}
                    addMutedChannel={this.addMutedChannel}
                    removeMutedChannel={this.removeMutedChannel}
                    />
                <ChannelSelector
                    open={this.state.selectingChannel} 
                    channel={(this.state.settings[this.state.selectingChannelSelected]||{}).id}
                    select={this.state.selectingChannelCallback}/>
                <RoleSelector 
                    open={this.state.selectingRole} 
                    select={this.state.selectingRoleCallback}/>
            </div>
        );
    }
}

Operators.contextType = MyContext;
MutedChannels.contextType = MyContext;
Settings.contextType = MyContext;

export default Settings;