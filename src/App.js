import React from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

import TokenLogin from './TokenLogin.js';
import MainPage from './MainPage.js';

import { TokenContext } from './token-context.js';

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
			loggedIn: cookies.get('token')?true:false
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
		cookies.remove('token');
		this.setState({token: null, loggedIn: false});
	}

	Page = () =>
	{
		if(this.state.loggedIn)
		{
			return (
				<TokenContext.Provider value={this.state.token}>
					<MainPage logout={this.logout}/>
				</TokenContext.Provider>
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
