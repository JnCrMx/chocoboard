import React from 'react';
import axios from 'axios';

import Config from './config.js';

class TokenLogin extends React.Component
{
    tokenChange = event => 
    {
        var token = event.target.value;
        var bodyFormData = new FormData();
        bodyFormData.append("token", token)
        axios(
            {
                method: 'post',
                url: Config.apiUrl + '/token/check',
                data: bodyFormData
            })
            .then(res =>
                {
                    if(res.data)
                    {
                        this.props.login(token);
                    }
                });
    };

    render()
    {
        return (
            <div>
                <p>Token eingeben:</p>
                <input type="text" style={{width: '50vw'}} onChange={this.tokenChange}/>
            </div>
        );
    }
}

export default TokenLogin;
