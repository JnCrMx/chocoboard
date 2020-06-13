import React from 'react';
import axios from 'axios';
import Chart from "react-apexcharts";

import { MyContext } from './context.js';
import Config from './config.js';

class Poll extends React.Component
{
    render()
    {
        var series = [];
        var labels = [];
        this.props.data.answers.forEach(e => 
        {
            series.push(e.votes);
            labels.push(e.answer);
        });

        var options = {
            labels: labels,
            legend: {
                show: false
            },
            tooltip: {
                style: {
                    fontSize: '25px'
                }
            }
        }

        return (
            <div className="poll-box">
                {this.props.data.question}
                <div className="pie-chart">
                    <Chart options={options} series={series} type="pie" width="380"/>
                </div>
            </div>
        );
    }
}

class Polls extends React.Component
{
    state = {
        page: 0,
        pageCount: 0,
    };

    componentDidMount()
    {
        axios.get(Config.apiUrl + '/' + this.context.guild + '/polls/all', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({polls: res.data, pageCount: Math.ceil(res.data.length/3)});
        });
    }

    nextPage = event =>
    {
        this.setState({page: this.state.page+1});
    }

    previousPage = event =>
    {
        this.setState({page: this.state.page-1});
    }

    render()
    {
        return (
            <div style={{height: 'inherit', width: 'inherit'}}>
                <button className="poll-page-button" disabled={this.state.page === 0} onClick={this.previousPage}>🡄</button>
                Seite {this.state.page+1} von {this.state.pageCount}
                <button className="poll-page-button" disabled={this.state.page >= this.state.pageCount - 1} onClick={this.nextPage}>🡆</button>
                <div className="polls">
                    {(this.state.polls||[]).slice(this.state.page * 3, (this.state.page + 1) * 3).map(v =>
                        {
                            return <Poll data={v} key={v.id}/>;
                        })
                    }
                </div>
            </div>
        );
    }
}

Polls.contextType = MyContext;

export default Polls;