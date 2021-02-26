import React from 'react';
import axios from 'axios';
import querystring from 'querystring';

import { MyContext } from './context.js';
import Config from './config.js';

class Command extends React.Component
{
	state = {
		edit: false
	}

	startEdit = () => {
		this.setState({edit: true, command: this.props.data});
	}

	stopEdit = () => {
		this.setState({edit: false});
	}

	updateField = event =>
    {
        var copy = {...this.state.command};
        copy[event.target.name] = event.target.value;

        this.setState({
            command: copy,
            dirty: true
        });
    }

    patchCommand = () => {
        this.props.patch(this.state.command);
        this.stopEdit();
    }

    render()
    {
        return (
            <div className="command">
				{this.state.edit?
					<div>
						{this.props.prefix}<input type="text" value={this.state.command.keyword} name="keyword" onChange={this.updateField}/>
					</div>:
					<p onDoubleClick={this.startEdit}>
						{this.props.prefix}{this.props.data.keyword}
					</p>
				}

                {this.state.edit?
					<div>
						<textarea value={this.state.command.message} name="message" onChange={this.updateField}/>
					</div>:
					<p onDoubleClick={this.startEdit} className="multiline">
						{this.props.data.message}
					</p>
				}

				{this.state.edit?
				<div>
					<button disabled={!this.state.dirty} onClick={this.patchCommand}>Speichern</button>
					<button onClick={this.stopEdit}>Abbrechen</button>
				</div>:
                <div>
                    <button onClick={this.startEdit}>Bearbeiten</button>
                    <button onClick={this.props.delete}>Löschen</button>
                </div>
				}
            </div>
        )
    }
}

class Commands extends React.Component
{
    state = {
        commands: [],
		settings: {}
	}

    componentDidMount()
    {
        this.fetchCommands();
		this.fetchSettings();
    }

	fetchCommands = () =>
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/guild/settings/commands', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({commands: res.data});
        });
    }

	fetchSettings = () =>
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/guild/settings', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({settings: res.data});
        });
    }

    putCommand = () => {
        axios.put(Config.apiUrl + '/'+this.context.guild+'/guild/settings/commands/neuerBefehl'+Date.now(),
        querystring.stringify({message: "Nachricht eingeben..."}),
        {
            headers: {'Authorization': 'Bearer '+this.context.token, "Content-Type": "application/x-www-form-urlencoded"}
        })
        .then(res => {
            this.fetchCommands();
        });
    }

    deleteCommand = (keyword) => {
        if(window.confirm(`Befehl "${keyword}" wirklich löschen?`))
        {
            axios.delete(Config.apiUrl + '/'+this.context.guild+'/guild/settings/commands/'+keyword,
            {
                headers: {'Authorization': 'Bearer '+this.context.token}
            })
            .then(res => {
                this.fetchCommands();
            });
        }
    }

    patchCommand = (keyword, command) => {
        axios.patch(Config.apiUrl + '/'+this.context.guild+'/guild/settings/commands/'+keyword,
        querystring.stringify(command),
        {
            headers: {'Authorization': 'Bearer '+this.context.token, "Content-Type": "application/x-www-form-urlencoded"}
        })
        .then(res => {
            this.fetchCommands();
        });
    }

    render()
    {
		return (
            <div id="commands" style={{height: 'inherit'}}>
                <button id="add-button" onClick={this.putCommand}>Hinzufügen</button>
                <div className="commands">
                    {this.state.commands.map(i => <Command 
                        data={i}
                        prefix={this.state.settings.prefix}
                        delete={this.deleteCommand.bind(this, i.keyword)}
                        patch={this.patchCommand.bind(this, i.keyword)}/>)}
                </div>
			</div>
		);
	}
}

Commands.contextType = MyContext;

export default Commands