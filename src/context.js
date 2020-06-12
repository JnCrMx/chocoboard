import React from 'react';

export const MyContext = React.createContext({
    token: null,
    guild: null,
    setGuild: guild => {}
}); 
