import React from 'react';

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
            </div>
        );
    }
}

class MenuEntry extends React.Component
{
    render()
    {
        return(
            <div className={"menuEntry"+(this.props.selection===this.props.name?" menuEntrySelected":"")}
                    onClick={this.props.onClick||this.props.updatePage.bind(null, this.props.name)}>
                <img src={this.props.icon} width="50vw" alt=""/>
                {this.props.extended?<div className="menuName">{this.props.title}</div>:null}
            </div>
        );
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
                <Menu updatePage={this.updatePage} selection={this.state.currentPage}>
                    <MenuEntry name="dashboard" title="Dashboard" icon={dashboard}/>
                    <MenuEntry name="reminders" title="Erinnerungen" icon={reminders}/>
                    <MenuEntry name="polls" title="Umfragen" icon={polls}/>
                    <MenuEntry name="logout" title="Abmelden" icon={logout} onClick={this.logout}/>
                </Menu>
                <div id="page">
                    {page}
                </div>
            </div>
        );
    }
}

export default MainPage;
