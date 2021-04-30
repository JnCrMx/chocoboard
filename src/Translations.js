import React from 'react';
import axios from 'axios';
import querystring from 'querystring';

import { MyContext } from './context.js';
import Config from './config.js';

class Translation extends React.Component
{
	state = {
		changingValue: false
	}

	changeValue = e =>
	{
		this.setState({changingValue: true, value: this.props.data[1]});
	}

	updateValue = e =>
	{
		this.setState({value: e.target.value});
	}

	confirmEdit = e =>
	{
		this.props.patch(this.state.value);
		this.setState({changingValue: false});
	}

	cancelEditBlur = e =>
	{
		if(e.relatedTarget !== null && e.relatedTarget.getAttribute("ident") === this.props.data[0])
		{
			return;
		}
		this.cancelEdit();
	}

	cancelEdit = () => 
	{
		this.setState({changingValue: false});
	}

	render()
    {
        return (
            <tr className="member">
                <td>{this.props.data[0]}</td>
                {this.state.changingValue?
                	<td>
						<textarea autoFocus type="text" value={this.state.value} 
                	    onChange={this.updateValue} onBlur={this.cancelEditBlur}/>
						<button onClick={this.confirmEdit} ident={this.props.data[0]}><span role="img" aria-label="confirm">✅</span></button>
						<button onClick={this.cancelEdit} ident={this.props.data[0]}><span role="img" aria-label="cancel">❌</span></button>
					</td>:
               		<td onDoubleClick={this.changeValue}>{this.props.data[1]}</td>
				}
				<td style={{textAlign: "center"}}>
					<button onClick={this.props.delete}>
                        <span role="img" aria-label="delete">❌</span>
                    </button>
				</td>
            </tr>
        )
    }
}

class Translations extends React.Component
{
	state = {
		allTranslations: {},
		translationOverrides: {},
		addKey: "__custom",
		customKey: ""
	}

	componentDidMount()
    {
        this.fetchAllTranslations();
		this.fetchOverrides();
    }

	fetchAllTranslations = () =>
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/guild/settings/language_overrides/all', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({allTranslations: res.data});
        });
    }

	fetchOverrides = () =>
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/guild/settings/language_overrides', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({translationOverrides: res.data});
        });
    }

	addKeyChange = e =>
	{
		this.setState({addKey: e.target.value});
	}

	customKeyChange = e =>
	{
		this.setState({customKey: e.target.value});
	}

	putTranslation = e =>
	{
		var key = this.state.addKey==="__custom"?this.state.customKey:this.state.addKey;
		axios.put(Config.apiUrl + '/'+this.context.guild+'/guild/settings/language_overrides/'+key,
        querystring.stringify({value: this.state.allTranslations[key]}),
        {
            headers: {'Authorization': 'Bearer '+this.context.token, "Content-Type": "application/x-www-form-urlencoded"}
        })
        .then(res => {
            this.fetchOverrides();
        });
	}

	deleteTranslation = (key) =>
	{
        if(window.confirm(`Übersetzung für "${key}" wirklich löschen?`))
        {
            axios.delete(Config.apiUrl + '/'+this.context.guild+'/guild/settings/language_overrides/'+key,
            {
                headers: {'Authorization': 'Bearer '+this.context.token}
            })
            .then(res => {
                this.fetchOverrides();
            });
        }
    }

    patchTranslation = (key, value) =>
	{
        axios.patch(Config.apiUrl + '/'+this.context.guild+'/guild/settings/language_overrides/'+key,
        querystring.stringify({key: key, value: value}),
        {
            headers: {'Authorization': 'Bearer '+this.context.token, "Content-Type": "application/x-www-form-urlencoded"}
        })
        .then(res => {
            this.fetchOverrides();
        });
    }

    render()
    {
		return (
            <div id="translations" style={{height: 'inherit'}}>
				<div>
					<select onChange={this.addKeyChange}>
						<option value="__custom">Benutzerdefinierter Schlüssel...</option>
						{Object.entries(this.state.allTranslations).sort((a, b)=>(a[0].localeCompare(b[0])))
							.map(k=><option key={k[0]} value={k[0]}>{k[0]}: {('"'+k[1]+'"').substring(0, 50)}</option>)}
					</select>
					<input type="text" style={{display: this.state.addKey==="__custom"?"initial":"none"}} 
						value={this.state.customKey} onChange={this.customKeyChange} placeholder="Schlüssel"/>
                	<button id="add-button" onClick={this.putTranslation}>Hinzufügen</button>
				</div>
				<div id="table-div">
                    <table>
                        <tbody>
                            {Object.entries(this.state.translationOverrides).sort((a, b)=>(a[0].localeCompare(b[0])))
								.map(k => <Translation key={k[0]} data={k}
									delete={this.deleteTranslation.bind(this, k[0])}
									patch={this.patchTranslation.bind(this, k[0])}/>)}
                        </tbody>
                    </table>
                </div>
			</div>
		);
	}
}

Translations.contextType = MyContext;
export default Translations;
