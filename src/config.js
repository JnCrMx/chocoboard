var config = 
{
   apiUrl: "https://jcm.re/chocoapi"
};

if (process.env.NODE_ENV !== 'production') 
{
   config.apiUrl = "http://localhost:3035"
}

export default config;
