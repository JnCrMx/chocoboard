import React from 'react';
import axios from 'axios';

import { MyContext } from './context.js';
import Config from './config.js';

class Member extends React.Component
{
    state = {
        chagingCoins: false
    }

    changeCoins = event =>
    {
        this.setState({chagingCoins: true, coins: this.props.data.coins});
    }

    updateCoins = event =>
    {
        this.setState({coins: event.target.value});
    }

    confirmCoins = event =>
    {
        if(event.key === 'Enter')
        {
            var bodyFormData = new FormData();
            bodyFormData.append("coins", this.state.coins)
            axios(
            {
                method: 'post',
                url: Config.apiUrl + '/' + this.context.guild + '/user/' + this.props.data.userId + '/coins',
                data: bodyFormData,
                headers: {'Authorization': 'Bearer '+this.context.token}
            })
            .then(res =>
            {
                this.props.updateCoins(this.props.data.userId, this.state.coins);
                this.setState({chagingCoins: false});
            });
        }
    }

    cancelCoins = event =>
    {
        this.setState({chagingCoins: false});
    }

    render()
    {
        return (
            <tr className="member">
                <td style={{textAlign: "left"}}>{this.props.data.tag}</td>
                <td style={{textAlign: "left"}}><i>aka {this.props.data.nickname}</i></td>
                {this.state.chagingCoins?
                <td><input autoFocus type="number" value={this.state.coins} 
                    onChange={this.updateCoins} onKeyPress={this.confirmCoins} onBlur={this.cancelCoins}/> Coins</td>:
                <td onDoubleClick={this.changeCoins}>{this.props.data.coins} Coins</td>}
            </tr>
        )
    }
}

class Members extends React.Component
{
    state = {
        members: [],
        q: ""
    }

    componentDidMount()
    {
        this.fetchMembers();
    }

    fetchMembers = () =>
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/guild/members', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({members: res.data});
        });
    }

    updateSearch = event =>
    {
        this.setState({q: event.target.value});
    }

    updateCoins = (id, coins) =>
    {
        const oldUser = this.state.members.filter(m => m.userId === id)[0];
        const index = this.state.members.indexOf(oldUser);
        const updated = [...this.state.members];
        updated[index].coins = coins;
        this.setState({members: updated});

        if(id === this.props.user.userId)
        {
            this.props.updateUser();
        }
    }

    render()
    {
        return (
            <div id="members">
                <div className="member-buttons">
                    <button onClick={this.fetchMembers}>↻</button>
                    <input name="search" type="text" placeholder="Suche..." onChange={this.updateSearch} values={this.state.q}/>
                </div>
                <div id="table-div">
                    <table>
                        <tbody>
                            {this.state.members.filter(m =>
                                m.tag.toLowerCase().includes(this.state.q.toLowerCase()) ||
                                m.nickname.toLowerCase().includes(this.state.q.toLowerCase())
                            ).map(m => <Member key={m.userId} data={m} updateCoins={this.updateCoins}/>)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

Member.contextType = MyContext;
Members.contextType = MyContext;

export default Members
