const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  currentLocation = document.getElementById("location"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  description = document.getElementById("description"),
  mainIcon = document.getElementById("icon"),

  windSpeed = document.querySelector(".wind-speed"),
  windSpeedStatus = document.querySelector(".wind_speed_status"),
  
  humidity = document.querySelector(".humidity"),
  humidityStatus = document.querySelector(".humidity-status"),
  
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  
  visibility = document.querySelector(".visibility"),
  visibilityStatus = document.querySelector(".visibility-status"),
  weatherCards = document.querySelector("#weather-cards"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query");

let currentCity = "";
let currentUnit = "C";
let hourlyorWeek = "Week";
let weatherChart;


function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  hour = hour % 12;
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }

  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

function getPublicIp() {
  fetch("https://geolocation-db.com/json/")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.city) {
        currentCity = data.city;
        getWeatherData(data.city, currentUnit, hourlyorWeek);
      } else {
        console.error("City not found in API response.");
      }
    })
    .catch((error) => {
      console.error("Error fetching public IP location:", error);
    });
}
getPublicIp();

document.addEventListener("DOMContentLoaded", () => {
  fetch("https://ipinfo.io/json?token=21e81e563bb30b")
    .then(response => response.json())
    .then(data => {
      console.log(data); // Debugging: Check the response in the console

      if (data.city) {
        search.value = data.city;
        currentCity = data.city;
        getWeatherData(currentCity, currentUnit, hourlyorWeek);
      }
    })
    .catch(error => console.error("Error fetching location:", error));
});


function getWeatherData(city, unit, hourlyorWeek) {
  console.log("Fetching weather for:", city);
  const apiKey = "2VXNCLWCN2QYBZTHRJU89EP8Q";
  const unitGroup = unit === "C" ? "metric" : "us";

  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=${unitGroup}&key=${apiKey}&contentType=json`,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (!data.currentConditions) {
        throw new Error("Invalid weather data received");
      }

      let today = data.currentConditions;
      temp.innerText = unit === "C" ? today.temp : celciusToFahrenheit(today.temp);
      currentLocation.innerText = data.resolvedAddress;
      description.innerText = data.description;
      condition.innerText = today.conditions;
      rain.innerText = `Perc - ${today.precip ?? 0}%`;
      windSpeed.innerText = `${today.windspeed} km/h`;
      measureWindStatus(today.windSpeed);
      visibility.innerText = `${today.visibility} km`;
      measureVisibilityStatus(today.visibility);
      airQuality.innerText = `${today.winddir} AQI`;
      measureAirQualityStatus(today.winddir);
      humidity.innerText = `${today.humidity}%`;
      measureHumidityStatus(today.humidity);
      mainIcon.src = getIcon(today.icon);

      let forecastData = hourlyorWeek === "hourly"
        ? data.days[0]?.hours?.slice(0, 24) || []
        : data.days?.slice(0, 7) || [];
      updateForecast(forecastData, unit, hourlyorWeek);
      updateWeatherChart(forecastData, unit, hourlyorWeek);
    })
    .catch((err) => {
      console.error("Error fetching weather data:", err);
      alert("Invalid Entry or Network Issue");
    });
}

function celciusToFahrenheit(temp) {
  console.log(temp);
  return ((temp * 9) / 5 + 32).toFixed(1);
}

function measureWindStatus(windSpeed) {
  if (windSpeed <= 5) {
    windSpeedStatus.innerText = "Calm";
  } else if (windSpeed <= 20) {
    windSpeedStatus.innerText = "Light Breeze";
  } else if (windSpeed <= 40) {
    windSpeedStatus.innerText = "Moderate Wind";
  } else if (windSpeed <= 60) {
    windSpeedStatus.innerText = "Strong Wind";
  } else {
    windSpeedStatus.innerText = "Very Strong Wind";
  }
}

function measureAirQualityStatus(aqi) {
  if (aqi <= 50) {
    airQualityStatus.innerText = "Good";
  } else if (aqi <= 100) {
    airQualityStatus.innerText = "Moderate";
  } else if (aqi <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups";
  } else if (aqi <= 200) {
    airQualityStatus.innerText = "Unhealthy";
  } else if (aqi <= 300) {
    airQualityStatus.innerText = "Very Unhealthy";
  } else {
    airQualityStatus.innerText = "Hazardous";
  }
}

function measureHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

function measureVisibilityStatus(visibility) {
  if (visibility <= 1) {
    visibilityStatus.innerText = "Very Poor";
  } else if (visibility <= 4) {
    visibilityStatus.innerText = "Poor";
  } else if (visibility <= 10) {
    visibilityStatus.innerText = "Moderate";
  } else {
    visibilityStatus.innerText = "Good";
  }
}

function getIcon(condition) {
  if (condition === "Partly-cloudy-day") {
    return "icons/sun/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "icons/moon/15.png";
  } else if (condition === "rain") {
    return "icons/rain/39.png";
  } else if (condition === "clear-day") {
    return "icons/sun/26.png";
  } else if (condition === "clear-night") {
    return "icons/moon/10.png";
  } else {
    return "icons/sun/26.png";
  }
}

function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";

  let numCards = type === "hourly" ? 24 : 7;
  let day = 0;

  for (let i = 0; i < numCards; i++) {
    if (!data[day]) break; // Prevent errors if data is missing

    let card = document.createElement("div");
    card.classList.add("card");

    // Get time or day name based on the type
    let dayName = type === "hourly" ? getHour(data[day].datetime) : getDayName(data[day].datetime);

    // Convert temperature if needed
    let dayTemp = unit === "F" ? celciusToFahrenheit(data[day].temp) : data[day].temp;

    // Get the weather icon
    let iconSrc = getIcon(data[day].icon);

    // Set the temperature unit
    let tempUnit = unit === "F" ? "°F" : "°C";

    // Populate the card HTML
    card.innerHTML = `
      <h2 class="day-name">${dayName}</h2>
      <div class="card-icon">
        <img src="${iconSrc}" alt="Weather Icon" />
      </div>
      <div class="day-temp">
        <h2 class="temp">${dayTemp}</h2>
        <span class="temp-unit">${tempUnit}</span>
      </div>
    `;

    weatherCards.appendChild(card);
    day++; // Move to the next hour/day
  }
}


fahrenheitBtn.addEventListener("click", () => {
  changeUnit("F");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("C");
});

function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    {
      tempUnit.forEach((elem) => {
        elem.innerText = `°${unit.toUpperCase()}`;
      });
      if (unit === "c") {
        celciusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");
      } else {
        celciusBtn.classList.remove("active");
        fahrenheitBtn.classList.add("active");
      }
      getWeatherData(currentCity, currentUnit, hourlyorWeek);
    }
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}


searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
});


function createWeatherChart(labels, data, unit) {
  const ctx = document.getElementById('weatherChart').getContext('2d');

  // Check if a chart instance already exists
  if (typeof weatherChart !== "undefined" && weatherChart !== null) {
    weatherChart.destroy();
  }

  weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Temperature (${unit})`,
        data: data,
        backgroundColor: 'rgba(255, 193, 7, 0.5)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}


function updateWeatherChart(data, unit, type) {
  let labels = [];
  let temps = [];

  if (type === "hourly") {
    data.forEach(hour => {
      labels.push(getHour(hour.datetime));
      temps.push(unit === "F" ? celciusToFahrenheit(hour.temp) : hour.temp);
    });
  } else {
    data.forEach(day => {
      labels.push(getDayName(day.datetime));
      temps.push(unit === "F" ? celciusToFahrenheit(day.temp) : day.temp);
    });
  }
  document.getElementById('chartContainer').style.height = "300px";
  document.getElementById('weatherChart').style.height = "200px";
  // console.log("Labels:", labels); // Debugging
  // console.log("Temperatures:", temps); // Debugging
  createWeatherChart(labels, temps, unit);
}
