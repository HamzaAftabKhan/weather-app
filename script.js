const userLocation = document.getElementById("userLocation");
const converter = document.getElementById("converter");
const weatherIcon = document.querySelector(".weatherIcon");
const temperature = document.querySelector(".temperature");
const feelslike = document.querySelector(".feelslike");
const description = document.querySelector(".description");
const date = document.querySelector(".date");
const city = document.querySelector(".city");
const HValue = document.getElementById("HValue");
const WValue = document.getElementById("WValue");
const SRValue = document.getElementById("SRValue");
const SSValue = document.getElementById("SSValue");
const CValue = document.getElementById("CValue");
const UVValue = document.getElementById("UVValue");
const PValue = document.getElementById("PValue");
const Forecast = document.querySelector(".Forecast");

const WEATHER_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=ab09dc631001468394f851fa16f4e187&q=`;
const WEATHER_DATA_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=ab09dc631001468394f851fa16f4e187&exclude=minutely&units=metric&`;
const WEATHER_FORECAST_ENDPOINT = `https://api.openweathermap.org/data/2.5/forecast?appid=ab09dc631001468394f851fa16f4e187&units=metric&`;

function findUserLocation() {
    const loading = document.getElementById("loading");
    loading.style.display = "flex"; // Show the loading animation (fullscreen)

    // Simulate a 2-second delay for the loading effect
    setTimeout(() => {
        fetch(WEATHER_API_ENDPOINT + userLocation.value)
        .then((response) => response.json())
        .then((data) => {
            loading.style.display = "none"; // Hide the loading animation after 2 seconds
            
            if (data.cod !== "" && data.cod !== 200) {
                alert(data.message);
                return;
            }
            console.log(data);

            // Existing code for updating weather information
            city.innerHTML = data.name + ", " + data.sys.country;
            weatherIcon.style.background = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`;
            fetch(WEATHER_DATA_ENDPOINT + `lon=${data.coord.lon}&lat=${data.coord.lat}`)
            .then((response) => response.json())
            .then((data) => {
                temperature.innerHTML = TemConverter(data.main.temp);
                feelslike.innerHTML = "Feels like " + data.main.feels_like;
                description.innerHTML = `<i class="fa-brands fa-cloudversify"></i> &nbsp;` + data.weather[0].description;
                const options = {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                };
                date.innerHTML = getLongFormateDateTime(data.dt, data.timezone, options);
                HValue.innerHTML = Math.round(data.main.humidity) + "<span>%</span>";
                WValue.innerHTML = Math.round(data.wind.speed) + "<span>ms</span>";
                const options1 = {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                };
                SRValue.innerHTML = getLongFormateDateTime(data.sys.sunrise, data.timezone, options1);
                SSValue.innerHTML = getLongFormateDateTime(data.sys.sunset, data.timezone, options1);
                CValue.innerHTML = data.clouds.all + "<span>%</span>";
                UVValue.innerHTML = Math.round(data.coord.lat) + "λ, " + Math.round(data.coord.lon) + "&#632;";
                PValue.innerHTML = data.main.pressure + "<span>hPa</span>";

                fetch(WEATHER_FORECAST_ENDPOINT + `lon=${data.coord.lon}&lat=${data.coord.lat}`)
                .then((response) => response.json())
                .then((forecastData) => {
                    console.log(forecastData);
                    displayFiveDayForecast(forecastData);
                    createTemperatureChart(forecastData);
                    
                });
            });
        });
    }, 2000); // 2-second delay for loading animation
}


function displayFiveDayForecast(forecastData) {
    Forecast.innerHTML = ""; 
    const filteredForecast = forecastData.list.filter((item) => item.dt_txt.includes("12:00:00")); // Midday forecast for each day
    
    filteredForecast.forEach((weather) => {
        let div = document.createElement("div");
        div.innerHTML = `
            <h3>${new Date(weather.dt * 1000).toLocaleDateString([], { weekday: 'long',month:'long',day:'numeric' })}</h3>
            <img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png" style="display:block; margin: 0 auto;"/>
            <p>Temp: ${TemConverter(weather.main.temp)}</p>
            <p>${weather.weather[0].description}</p>`;
        Forecast.append(div);
    });
}

function formatUnixTime(dtValue,offSet,options={}){
    const date=new Date((dtValue+offSet)*1000);
    return date.toLocaleTimeString([],{timeZone:"UTC",...options});
}

function getLongFormateDateTime(dtValue,offSet,options){
    return formatUnixTime(dtValue,offSet,options);
}

function TemConverter(temp) {
    let tempValue = temp;
    let message = "";

    console.log("converter.value:", converter.value); // Debugging line

    if (converter.value === "C") {
        message = tempValue + "<span>" + "\xB0C</span>";
    } else {
        // Convert to Fahrenheit
        let ctof = (tempValue * 9) / 5 + 32;
        message = ctof + "<span>" + "\xB0F</span>"; // Round Fahrenheit
    }
    
    return message;
}

document.addEventListener("DOMContentLoaded", () => {
    // Automatically fetch weather based on geolocation when the page loads
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
  
          // Fetch weather data using latitude and longitude
          fetchWeatherByCoordinates(lat, lon);
          createTemperatureChart(lat,lon);

        },
        (error) => {
          console.error("Error fetching geolocation: ", error);
          alert("Unable to retrieve your location. Please enter a location manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser. Please enter a location manually.");
    }
  });
  
  function fetchWeatherByCoordinates(lat, lon) {
    const WEATHER_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=ab09dc631001468394f851fa16f4e187&lat=${lat}&lon=${lon}&units=metric`;
  
    fetch(WEATHER_API_ENDPOINT)
      .then((response) => response.json())
      .then((data) => {
        if (data.cod !== 200) {
          alert(data.message);
          return;
        }
  
        // Display weather data in the UI
        updateWeatherUI(data);
      })
      .catch((error) => {
        console.error("Error fetching weather data: ", error);
        alert("Error fetching weather data. Please try again.");
      });
  }

  function updateWeatherUI(data) {
    if (!city || !temperature || !weatherIcon) {
        console.error("Required DOM elements are missing.");
        return;
    }

    city.innerHTML = `${data.name}, ${data.sys.country}`;
    weatherIcon.style.background = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`;
    temperature.innerHTML = TemConverter(data.main.temp);
    feelslike.innerHTML = `Feels like ${TemConverter(data.main.feels_like)}`;
    description.innerHTML = `<i class="fa-brands fa-cloudversify"></i> &nbsp;${data.weather[0].description}`;
    
    const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    };
    date.innerHTML = getLongFormateDateTime(data.dt, data.timezone, options);
    
    // Update other weather details
    HValue.innerHTML = `${Math.round(data.main.humidity)}<span>%</span>`;
    WValue.innerHTML = `${Math.round(data.wind.speed)}<span>ms</span>`;
    const options1 = { hour: "numeric", minute: "numeric", hour12: true };
    SRValue.innerHTML = getLongFormateDateTime(data.sys.sunrise, data.timezone, options1);
    SSValue.innerHTML = getLongFormateDateTime(data.sys.sunset, data.timezone, options1);
    CValue.innerHTML = `${data.clouds.all}<span>%</span>`;
    UVValue.innerHTML = `${Math.round(data.coord.lat)}&lambda;, ${Math.round(data.coord.lon)}&#632;`;
    PValue.innerHTML = `${data.main.pressure}<span>hPa</span>`;

    fetch(WEATHER_FORECAST_ENDPOINT + `lon=${data.coord.lon}&lat=${data.coord.lat}`)
        .then((response) => response.json())
        .then((forecastData) => {
            displayFiveDayForecast(forecastData);
        })
        .catch((error) => {
            console.error("Error fetching forecast data:", error);
        });
}

function createTemperatureChart(lat, lon) {
  fetch(WEATHER_FORECAST_ENDPOINT + `lon=${lon}&lat=${lat}`)
    .then((response) => response.json())
    .then((data) => {
      const forecastData = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );

      const labels = forecastData.map((item) =>
        new Date(item.dt * 1000).toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
      const temperatures = forecastData.map((item) => item.main.temp);

      // Temperature Bar Chart
      const ctx1 = document.getElementById("temperatureChart").getContext("2d");
      new Chart(ctx1, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: temperatures,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Temperature (°C)",
              },
            },
          },
        },
      });

      // Weather Conditions Doughnut Chart
      const weatherConditions = forecastData.map(
        (item) => item.weather[0].main
      );
      const conditionCounts = weatherConditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
      }, {});
      const conditionLabels = Object.keys(conditionCounts);
      const conditionData = Object.values(conditionCounts);

      const ctx2 = document
        .getElementById("weatherConditionsChart")
        .getContext("2d");
      new Chart(ctx2, {
        type: "doughnut",
        data: {
          labels: conditionLabels,
          datasets: [
            {
              data: conditionData,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
      });

      // Temperature Line Chart
      const ctx3 = document
        .getElementById("temperatureLineChart")
        .getContext("2d");
      new Chart(ctx3, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: temperatures,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Temperature (°C)",
              },
            },
          },
        },
      });
    })
    .catch((error) => console.error("Error fetching weather data:", error));
}

createTemperatureChart();

function isWeatherQuery(userInput) {
  const weatherKeywords = ["weather", "forecast", "rain", "temperature", "sunny", "cloudy"];
  return weatherKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
}



const WEATHER_API_KEY = 'ab09dc631001468394f851fa16f4e187';
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather`;

async function fetchWeather(city) {
    const url = `${WEATHER_API_URL}?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === 200) {
            const weatherInfo = {
                city: data.name,
                temperature: data.main.temp,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed
            };
            return weatherInfo;
        } else {
            return { error: "City not found." };
        }
    } catch (error) {
        return { error: "Error fetching weather data." };
    }
}
const GEMINI_API_KEY = 'AIzaSyAm228jFJ3kBtjvrOcXV3iatwjvr74UM_Y';
const GEMINI_API_URL = `https://ai.google.dev/aistudio/gemini/v1/query`;

async function handleGeneralQuery(query) {
    const payload = {
        query: query,
    };
    
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GEMINI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        
        if (response.ok) {
            return data.answer; // Extract the answer from the response
        } else {
            return "Sorry, I couldn't process your query.";
        }
    } catch (error) {
        return "Error connecting to Gemini API.";
    }
}







