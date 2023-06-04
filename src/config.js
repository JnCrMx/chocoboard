var config = 
{
   apiUrl: "https://chocobot.jcm.re/api/v1"
};

if (process.env.NODE_ENV !== 'production') 
{
   config.apiUrl = "http://localhost:8080/api/v1"
}

export default config;
