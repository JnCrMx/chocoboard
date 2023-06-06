import React from 'react';
import axios from 'axios';

import { MyContext } from './context.js';
import Config from './config.js';

class Reminder extends React.Component
{
    cancel = () =>
    {
        var bodyFormData = new FormData();
        bodyFormData.append("id", this.props.data.id);
        axios(
            {
                method: 'post',
                url: Config.apiUrl + '/reminders/cancel',
                data: bodyFormData,
                headers: {'Authorization': 'Bearer '+this.context.token}
            })
            .then(res =>
            {
                this.props.update();
            });
    }

    render()
    {
        return (
            <div className="reminder-box">
                <table className="dashboard-table">
                    <tbody>
                        <tr>
                            <td className="dashboard-table-key">Zeitpunkt</td>
                            <td className="dashboard-table-value">{new Date(this.props.data.time).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">von</td>
                            <td className="dashboard-table-value">{this.props.data.reminder}</td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">zu</td>
                            <td className="dashboard-table-value">{this.props.data.remindee}</td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Nachricht</td>
                            <td className="dashboard-table-value">{this.props.data.message||(<i>keine</i>)}</td>
                        </tr>
                    </tbody>
                </table>
                <button disabled={this.props.data.done} onClick={this.cancel}>
                    {this.props.data.done?"abgeschlossen":"abbrechen"}
                </button>
            </div>
        );
    }
}

class Reminders extends React.Component
{
    state = {
        active: true
    }

    componentDidMount()
    {
        this.update();
    }

    update = () =>
    {
        axios.get(Config.apiUrl + '/reminders/all?type=all&active='+this.state.active, 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({reminders: res.data});
        });
    }

    updateActive = e => 
    {
        this.setState({active: e.target.checked}, this.update);
    }

    render()
    {
        return (
            <div style={{width: 'inherit', height: 'inherit'}}>
                <input type="checkbox" name="active" checked={this.state.active} onChange={this.updateActive}/>
                <label htmlFor="active">nur aktive anzeigen</label>
                <div className="reminders">
                    {(this.state.reminders||[]).map(v =>
                    {
                        return <Reminder data={v} update={this.update}/>;
                    })}
                </div>
            </div>
        );
    }
}

Reminders.contextType = MyContext;
Reminder.contextType = MyContext;

export default Reminders;