var config = 
{
   apiUrl: "https://jserver.kwgivnecuiphlqnj.myfritz.net/chocoapi"
};

if (process.env.NODE_ENV !== 'production') 
{
   config.apiUrl = "http://localhost:3035"
}

export default config;
 