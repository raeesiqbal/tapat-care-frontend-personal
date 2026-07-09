module.exports = {
    apps: [
        {
            name: "tapat-care-frontend",
            cwd: "/home/ubuntu/tapat-care-frontend",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: "3000"
            }
        }
    ]
};
