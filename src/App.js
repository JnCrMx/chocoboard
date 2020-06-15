import React from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

import TokenLogin from './TokenLogin.js';
import MainPage from './MainPage.js';

import { MyContext } from './context.js';

import './App.css';

class App extends React.Component
{
	static propTypes = {
		cookies: instanceOf(Cookies).isRequired
	};

	constructor(props)
	{
		super(props);
		const { cookies } = props;
    	this.state = {
			token: cookies.get('token') || null,
			loggedIn: cookies.get('token')?true:false,
			guild: cookies.get('guild') || null
		};
	}

	login = token =>
	{
		const { cookies } = this.props;
		cookies.set('token', token, { path: '/' });
		this.setState({token: token, loggedIn: true});
	}

	logout = () =>
	{
		const { cookies } = this.props;
		cookies.remove('token', { path: '/' });
		cookies.remove('guild', { path: '/' }); // remove the guild to prevent errros on login with different token
		this.setState({token: null, loggedIn: false});
	}

	setGuild = (guild, then) =>
	{
		const { cookies } = this.props;
		cookies.set('guild', guild, { path: '/' });
		this.setState({guild: guild}, then);
	}

	Page = () =>
	{
		if(this.state.loggedIn)
		{
			return (
				<MyContext.Provider value={{token: this.state.token, guild: this.state.guild, setGuild: this.setGuild}}>
					<MainPage logout={this.logout} guild={this.state.guild}/>
				</MyContext.Provider>
			);
		}
		else
		{
			return (
				<header className="App-header">
					<TokenLogin login={this.login}/>
				</header>
			);
		}
	}

	render()
	{
		return (
			<div className="App">
				<this.Page/>
			</div>
		);
	}
}

export default withCookies(App);
