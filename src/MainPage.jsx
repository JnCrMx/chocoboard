import React from 'react';
import axios from 'axios';

import { MyContext } from './context.js';
import Config from './config.js';

import Dashboard from './Dashboard.jsx';
import Reminders from './Reminders.jsx';
import Polls from './Polls.jsx';
import Shop from './Shop.jsx';
import Members from './Members.jsx';
import Settings from './Settings.jsx';
import Commands from './Commands.jsx';
import Translations from './Translations.jsx';

import dashboard from './assets/dashboard.svg';
import reminders from './assets/reminders.svg';
import polls from './assets/polls.svg';
import logout from './assets/logout.svg';
import members from './assets/members.svg';
import settings from './assets/settings.svg';
import shop from './assets/shop.svg';
import commands from './assets/commands.svg';
import translations from './assets/translations.svg';

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
                        if(!child)
                            return null;

                        return React.cloneElement(child, { extended: this.state.extended, updatePage: this.props.updatePage, selection: this.props.selection })
                    })
                }
                <GuildSelector extended={this.state.extended} logout={this.props.logout} updateMenu={this.props.updateMenu}/>
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
                <img src={this.props.icon} width="35w" alt=""/>
                {this.props.extended?<div className="menuName">{this.props.title}</div>:null}
            </div>
        );
    }
}

class GuildEntry extends React.Component
{
    changeGuild = event =>
    {
        this.context.setGuild(this.props.data.id, this.props.updateMenu);
        this.props.close();
    }

    render()
    {
        return (
            <div className="menuEntry guild-entry" onClick={this.props.onClick||this.changeGuild}>
                <img src={this.props.data.icon_url} width="35vw" height="35vw" alt="?"/>
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
            <div id="guild-selector" className={this.state.open?"guild-selector-open":""}>
                <GuildEntry data={(this.state.guilds||[]).filter(g => g.id === this.context.guild)[0]||{}} extended={this.props.extended} onClick={this.openClose}/>
                {this.state.open ? 
                    this.state.guilds.filter(g => g.id !== this.context.guild).map(g => 
                        <GuildEntry data={g} extended={this.props.extended} close={this.closeSelector} updateMenu={this.props.updateMenu}/>)
                    :null
                }
                {this.state.open ?
                    <div className="menuEntry guild-entry guild-entry-top" onClick={this.props.logout}>
                        <img src={logout} width="35vw" alt=""/>
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
        currentPage: 'dashboard',
        user: {}
    }

    updatePage = name =>
    {
        this.setState({currentPage: name});
    }

    logout = event =>
    {
        this.props.logout();
    }

    updateUser = () =>
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/user/self', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({user: res.data});
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot)
    {
        if(prevProps.guild !== this.props.guild)
        {
            if(this.context.guild)
            {
                this.updateUser();
            }
        }
    }

    componentDidMount()
    {
        if(this.context.guild)
        {
            this.updateUser();
        }
        this.interval = setInterval(() => this.updateUser(), 5000);
    }

    componentWillUnmount()
    {
        clearInterval(this.interval);
    }

    render()
    {
        let page = null;
        switch(this.state.currentPage)
        {
            case 'dashboard':
                page = <Dashboard key={this.context.guild} user={this.state.user}/>
                break;
            case 'reminders':
                page = <Reminders key={this.context.guild}/>
                break;
            case 'polls':
                page = <Polls key={this.context.guild}/>
                break;
            case 'shop':
                page = <Shop key={this.context.guild} user={this.state.user} updateUser={this.updateUser}/>
                break;
            case 'members':
                page = <Members key={this.context.guild} user={this.state.user} updateUser={this.updateUser}/>
                break;
            case 'settings':
                page = <Settings key={this.context.guild}/>
                break;
            case 'commands':
                page = <Commands key={this.context.guild}/>
                break;
            case 'translations':
                page = <Translations key={this.context.guild}/>
                break;
            default:
                page = <Dashboard key={this.context.guild} user={this.state.user}/>
                break;
        }

        var menuEntries = [];
        menuEntries.push(<MenuEntry key="dashboard" name="dashboard" title="Dashboard" icon={dashboard}/>);
        menuEntries.push(<MenuEntry key="reminders" name="reminders" title="Erinnerungen" icon={reminders}/>);
        menuEntries.push(<MenuEntry key="polls" name="polls" title="Umfragen" icon={polls}/>);
        menuEntries.push(<MenuEntry key="shop" name="shop" title="Rollenshop" icon={shop}/>);
        if(this.state.user.operator)
        {
            menuEntries.push(<MenuEntry key="members" name="members" title="Mitglieder" icon={members}/>);
            menuEntries.push(<MenuEntry key="commands" name="commands" title="Befehle" icon={commands}/>);
            menuEntries.push(<MenuEntry key="translations" name="translations" title="Übersetzung" icon={translations}/>);
            menuEntries.push(<MenuEntry key="settings" name="settings" title="Einstellungen" icon={settings}/>);
        }

        return (
            <div id="main">
                <Menu updatePage={this.updatePage} selection={this.state.currentPage} logout={this.logout} updateMenu={this.updateUser}>
                    {menuEntries}
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
