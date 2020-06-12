import React from 'react';
import axios from 'axios';

import { MyContext } from './context.js';
import Config from './config.js';

import Dashboard from './Dashboard.js';
import Reminders from './Reminders.js';
import Polls from './Polls.js';

import dashboard from './dashboard.svg';
import reminders from './reminders.svg';
import polls from './polls.svg';
import logout from './logout.svg';

class Menu extends React.Component
{
    state = {
        extended: true
    }

    changeExtended = event => {
        this.setState({extended: !this.state.extended});
    }

    render()
    {
        return (
            <div className="menu">
                <button className="menuButton" onClick={this.changeExtended}>☰</button>
                {
                    React.Children.map(this.props.children, child => 
                    {
                        return React.cloneElement(child, { extended: this.state.extended, updatePage: this.props.updatePage, selection: this.props.selection })
                    })
                }
                <GuildSelector extended={this.state.extended} logout={this.props.logout}/>
            </div>
        );
    }
}

class MenuEntry extends React.Component
{
    render()
    {
        return (
            <div className={"menuEntry"+(this.props.selection===this.props.name?" menuEntrySelected":"")}
                    onClick={this.props.onClick||this.props.updatePage.bind(null, this.props.name)}>
                <img src={this.props.icon} width="50vw" alt=""/>
                {this.props.extended?<div className="menuName">{this.props.title}</div>:null}
            </div>
        );
    }
}

class GuildEntry extends React.Component
{
    changeGuild = event =>
    {
        this.context.setGuild(this.props.data.id);
        this.props.close();
    }

    render()
    {
        return (
            <div className="menuEntry" onClick={this.props.onClick||this.changeGuild}>
                <img src={this.props.data.iconUrl} width="50vw" alt="?"/>
                {this.props.extended?<div className="menuName">{this.props.data.name}</div>:null}
            </div>
        );
    }
}

class GuildSelector extends React.Component
{
    state = {
        open: false,
        guilds: []
    }

    openClose = () =>
    {
        this.setState({open: !this.state.open});
    }

    closeSelector = () =>
    {
        this.setState({open: false});
    }

    componentDidMount()
    {
        axios.get(Config.apiUrl + '/token/guilds', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            if(this.context.guild)
            {
                this.setState({guilds: res.data});
            }
            else
            {
                this.setState({guilds: res.data, guild: res.data[0]});
                this.context.setGuild(res.data[0].id);
            }
        })
    }

    render()
    {
        return (
            <div id="guild-selector">
                <GuildEntry data={(this.state.guilds||[]).filter(g => g.id === this.context.guild)[0]||{}} extended={this.props.extended} onClick={this.openClose}/>
                {this.state.open ? 
                    this.state.guilds.filter(g => g.id != this.context.guild).map(g => <GuildEntry data={g} extended={this.props.extended} close={this.closeSelector}/>)
                    :null
                }
                {this.state.open ?
                    <div className="menuEntry" onClick={this.props.logout}>
                        <img src={logout} width="50vw"/>
                        {this.props.extended?<div className="menuName">Abmelden</div>:null}
                    </div>
                    :null
                }
            </div>
        )
    }
}

class MainPage extends React.Component
{
    state = {
        currentPage: 'dashboard'
    }

    updatePage = name =>
    {
        this.setState({currentPage: name});
    }

    logout = event =>
    {
        this.props.logout();
    }

    render()
    {
        let page = null;
        switch(this.state.currentPage)
        {
            case 'dashboard':
                page = <Dashboard/>
                break;
            case 'reminders':
                page = <Reminders/>
                break;
            case 'polls':
                page = <Polls/>
                break;
        }

        return (
            <div id="main">
                <Menu updatePage={this.updatePage} selection={this.state.currentPage} logout={this.logout}>
                    <MenuEntry name="dashboard" title="Dashboard" icon={dashboard}/>
                    <MenuEntry name="reminders" title="Erinnerungen" icon={reminders}/>
                    <MenuEntry name="polls" title="Umfragen" icon={polls}/>
                </Menu>
                <div id="page">
                    {this.context.guild?page:null}
                </div>
            </div>
        );
    }
}

GuildEntry.contextType = MyContext;
GuildSelector.contextType = MyContext;
MainPage.contextType = MyContext;

export default MainPage;
