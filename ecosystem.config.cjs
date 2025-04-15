module.exports = {
	apps: [
		{
			name: "api",
			script: "dist/app.js",
			env: {
				NODE_ENV: "production",
				DOTENV_CONFIG_PATH: ".env.production",
			},
		},
	],
};
