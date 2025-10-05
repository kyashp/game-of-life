/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    async redirects(){
        return [
            {
                source: '/',
                destination: '/Landing_Page',
                permanent: true, // This is a permanent redirect
            }
        ]
    }
};

export default nextConfig;
