const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");

require("dotenv").config();

const corsOptions = {
	origin: "http://localhost:5173", // or use '*' to allow any origin
	methods: ["GET", "POST", "DELETE"], // or use specific methods
	credentials: true, // enable set cookie
	allowedHeaders: ["Content-Type", "Authorization"], // or specify headers to allow
};

app.use(cors(corsOptions));
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
	const { place } = req.body;
	console.log(place);
	await axios
		.get(
			`http://api.openweathermap.org/geo/1.0/direct?q=${place}&limit=4&appid=${process.env.API_KEY}`
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
var fivedayweather = [];

// call by lat and long
app.get("/5day-zip-fetch", async (req, res) => {
	//https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&appid={API key}
	const { lat, long } = req.body;
	console.log(lat, long);
	await axios
		.get(
			`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=metric&appid=${process.env.API_KEY}`
		)
		.then((response) => {
			for (var i = 0; i < 33; i += 8) {
				fivedayweather.push(response.data.list[i]);
			}
			const filteredresponse = {
				fivedayweather,
				city: response.data.city,
			};
			res.json(filteredresponse);
		})
		.catch((error) => {
			console.log(error);
		});
});

// call by city name
app.get("/5day-api-fetch", async (req, res) => {
	//https://api.openweathermap.org/data/2.5/forecast?q=London&appid={API key}
	const { place } = req.body;
	console.log(place);
	await axios
		.get(
			`https://api.openweathermap.org/data/2.5/forecast?q=${place}&units=metric&appid=${process.env.API_KEY}`
		)
		.then((response) => {
			for (var i = 0; i < 33; i += 8) {
				fivedayweather.push(response.data.list[i]);
			}
			const filteredresponse = {
				fivedayweather,
				city: response.data.city,
			};
			res.json(filteredresponse);
		})
		.catch((error) => {
			console.log(error);
		});
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
	console.log(`helloworld: listening on port ${port}`);
});
