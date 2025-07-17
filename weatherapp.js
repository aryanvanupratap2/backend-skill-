const http = require("http");
const https = require("https");
require("dotenv").config();

const API_KEY = process.env.WEATHER_API_KEY;
const PORT = 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const city = url.searchParams.get("city");

  if (pathname === "/weather" && city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric`;

    https
      .get(apiUrl, (apiRes) => {
        let data = "";

        apiRes.on("data", (chunk) => {
          data += chunk;
        });

        apiRes.on("end", () => {
          try {
            const parsed = JSON.parse(data);

            if (parsed.cod !== 200) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: parsed.message }));
              return;
            }

            const weatherData = {
              location: `${parsed.name}, ${parsed.sys.country}`,
              temperature: `${parsed.main.temp} °C`,
              description: parsed.weather[0].description,
              wind_speed: `${parsed.wind.speed} m/s`,
            };

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(weatherData));
          } catch (e) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal server error" }));
          }
        });
      })
      .on("error", () => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to connect to weather API" }));
      });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found. Use /weather?city=CityName" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
