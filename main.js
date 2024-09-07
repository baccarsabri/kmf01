require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const nunjucks = require('nunjucks');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const dynamicRoutes = require('./routes/dynamicRoutes');
const dbClient = require('./config/db');

const app = express();

// Middleware
app.use(session({
	secret: process.env.SECRET_KEY,
	resave: true,
	saveUninitialized: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files and view engine
app.use(express.static(path.join(__dirname, 'static')));
const env = nunjucks.configure('views', {
	autoescape: true,
	express: app
});
env.addFilter('formatNumber', num => String(num).replace(/(.)(?=(\d{3})+$)/g, '$1,'));
env.addFilter('formatDateTime', date => (new Date(date).toISOString()).slice(0, -1).split('.')[0]);

app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Routes
app.use('/api', dynamicRoutes);

app.use('/', authRoutes);



const port = process.env.PORT || 3002;
(async () => {
	await dbClient.connectToDb();  // Ensure the database connection is established

	app.listen(5050, '0.0.0.0', () => {
		console.log('Server is running on port 5050');
	});
})();
