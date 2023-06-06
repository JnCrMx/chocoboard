import React from 'react';
import reactStringReplace from 'react-string-replace';

export const replaceEmojis = function(string)
{
    var replacedNonAnimated = reactStringReplace(string, /<:([^:]*:\d+)>/g, (match, id) => {
        let elements = match.split(':');
        return <img key={id} alt={elements[0]} className="emoji" src={"https://cdn.discordapp.com/emojis/"+elements[1]+".png"}/>;
    });

    return reactStringReplace(replacedNonAnimated, /<a:([^:]*:\d+)>/g, (match, id) => {
        let elements = match.split(':');
        return <img key={id} alt={elements[0]} className="emoji" src={"https://cdn.discordapp.com/emojis/"+elements[1]+".gif"}/>;
    });
}
