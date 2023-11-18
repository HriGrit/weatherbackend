const express = require("express");
const app = express();
const axios = require("axios");

require("dotenv").config();

// const corsOptions = {
// 	origin: "http://localhost:5173", // or use '*' to allow any origin
// 	methods: ["GET", "POST", "DELETE"], // or use specific methods
// 	credentials: true, // enable set cookie
// 	allowedHeaders: ["Content-Type", "Authorization"], // or specify headers to allow
// };

const cors = require("cors");

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	console.log(process.env.API_KEY);
	const name = process.env.NAME || "World";
	res.send(`Hey ${name}!`);
});

// if navigator location succesful
// zip call is for lat and long
app.post("/zip", async (req, res) => {
	// http://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit={limit}&appid={API key}
	const { lat, long } = req.body;
	console.log(lat, long);
	await axios
		.get(
			`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=1&appid=${process.env.API_KEY}`
		)
		.then((response) => {
			// handle success
			// to minimize the size of data send to client side we use filtered response where the local names are excluded
			const filteredresponse = response.data.map((data) => {
				return {
					name: data.name,
					lat: data.lat,
					lon: data.lon,
					country: data.country,
					state: data.state,
				};
			});
			res.json(filteredresponse);
			console.log(filteredresponse);
		})
		.catch((error) => {
			// handle error
			console.log(error);
		});
});

// api call is for search bar
app.get("/api", async (req, res) => {
	// fetch data from a url http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
	const { name } = req.query;
	console.log(name);
	await axios
		.get(
			`http://api.openweathermap.org/geo/1.0/direct?q=${name}&limit=4&appid=${process.env.API_KEY}`
		)
		.then((response) => {
			// handle success
			// to minimize the size of data send to client side we use filtered response where the local names are excluded
			const filteredresponse = response.data.map((data) => {
				return {
					name: data.name,
					lat: data.lat,
					lon: data.lon,
					country: data.country,
					state: data.state,
				};
			});
			res.json(filteredresponse);
			console.log(filteredresponse);
		})
		.catch((error) => {
			// handle error
			console.log(error);
		});
});

// save 5 days weather data here
// call by lat and long
app.get("/5day-zip-fetch", async (req, res) => {
	//https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&appid={API key}
	var fivedayweather = [];
	const lat = req.query.lat;
	const long = req.query.long;
	await axios
		.get(
			`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=metric&appid=${process.env.API_KEY}`
		)
		.then((response) => {
			let fivedayweatherC = [];
			for (var i = 0; i < 33; i += 8) {
				fivedayweatherC.push(response.data.list[i]);
			}
			fivedayweather.push(fivedayweatherC);
			console.log(fivedayweather);
		})
		.catch((error) => {
			console.log(error);
		});
	let fivedayweatherF = [];
	await axios
		.get(
			`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=emperical&appid=${process.env.API_KEY}`
		)
		.then((response) => {
			for (var i = 0; i < 33; i += 8) {
				fivedayweatherF.push(response.data.list[i]);
			}
			fivedayweather.push(fivedayweatherF);
			res.json(fivedayweather);
			console.log(fivedayweather);
		})
		.catch((error) => {
			console.log(error);
		});
});

app.get("/current-zip-fetch", async (req, res) => {
	const lat = req.query.lat;
	const long = req.query.long;

	try {
		const response = await axios.get(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${process.env.API_KEY}`
		);

		const weatherData = response.data;
		const filteredResponse = {
			type: weatherData.weather, // This is usually an array
			sun: weatherData.sys,
		};

		console.log(filteredResponse);
		res.json(filteredResponse);
	} catch (error) {
		console.error("Error fetching current weather data:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.get("/current-api-fetch", async (req, res) => {
	const name = req.query.name;

	try {
		const response = await axios.get(
			`https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${process.env.API_KEY}`
		);

		const weatherData = response.data;
		const filteredResponse = {
			type: weatherData.weather, // This is usually an array
			sun: weatherData.sys,
		};

		console.log(filteredResponse);
		res.json(filteredResponse);
	} catch (error) {
		console.error("Error fetching current weather data:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// call by city name
app.get("/5day-api-fetch", async (req, res) => {
	//https://api.openweathermap.org/data/2.5/forecast?q=London&appid={API key}
	var fivedayweather = [];
	const { place } = req.query.name;
	await axios
		.get(
			`https://api.openweathermap.org/data/2.5/forecast?q=${place}&units=metric&appid=${process.env.API_KEY}`
		)
		.then((response) => {
			let fivedayweatherC = [];
			for (var i = 0; i < 33; i += 8) {
				fivedayweatherC.push(response.data.list[i]);
			}
			fivedayweather.push(fivedayweatherC);
			console.log(fivedayweather);
		})
		.catch((error) => {
			console.log(error);
		});
	let fivedayweatherF = [];
	await axios
		.get(
			`https://api.openweathermap.org/data/2.5/forecast?q=${place}units=emperical&appid=${process.env.API_KEY}`
		)
		.then((response) => {
			for (var i = 0; i < 33; i += 8) {
				fivedayweatherF.push(response.data.list[i]);
			}
			fivedayweather.push(fivedayweatherF);
			res.json(fivedayweather);
			console.log(fivedayweather);
		})
		.catch((error) => {
			console.log(error);
		});
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
	console.log(`helloworld: listening on port ${port}`);
});
