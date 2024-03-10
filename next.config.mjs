/** @type {import('next').NextConfig} */

const Environments = {
    'development':{
        API_URL: 'http://localhost:5254/api',
        CLIENT_DOMAIN: "https://localhost:3000",
        DEBUG: "true"
    },
    'production':{
        API_URL: 'https://ourfuturewebsite.azurewebsites.net/api',
        CLIENT_DOMAIN: "https://ourfuturewebsite.com",
        DEBUG: "false"
    },
}

const nextConfig = {
    env: { ...Environments['development']}
};

export default nextConfig;
