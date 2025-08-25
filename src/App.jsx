import React, { useState, useEffect } from 'react';
import { AlertTriangle, Cloud, Wind, Waves, Navigation, TrendingUp, MapPin, Clock, Thermometer, Eye, Search, Sun, Moon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Load environment variables
const openWeatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const openWeatherApiUrl = import.meta.env.VITE_OPENWEATHER_API_URL;


const OceanovaWeatherSystem = () => {
  // State variables to hold all the data for the application.
  const [currentWeather, setCurrentWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [vesselData, setVesselData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Arabian Sea');
  const [locationInput, setLocationInput] = useState('');
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');

  // Hardcoded coordinates for the selected maritime locations.
  const locationCoordinates = {
    // Major Oceans & Seas
    'Arabian Sea': { lat: 15, lon: 65 },
    'Bay of Bengal': { lat: 15, lon: 88 },
    'Indian Ocean': { lat: -20, lon: 80 },
    'Atlantic Ocean': { lat: 0, lon: -30 },
    'Pacific Ocean': { lat: 0, lon: -150 },
    'Arctic Ocean': { lat: 80, lon: 0 },
    'Southern Ocean': { lat: -70, lon: 0 },
    'North Sea': { lat: 56, lon: 3 },
    'Mediterranean Sea': { lat: 35, lon: 18 },
    'Caribbean Sea': { lat: 15, lon: -75 },
    'Gulf of Mexico': { lat: 25, lon: -90 },
    'Persian Gulf': { lat: 26, lon: 51 },
    'Red Sea': { lat: 20, lon: 39 },
    'Black Sea': { lat: 44, lon: 35 },
    'Bering Sea': { lat: 58, lon: -175 },
    'Baltic Sea': { lat: 58, lon: 20 },
    'South China Sea': { lat: 10, lon: 115 },
    'East China Sea': { lat: 30, lon: 125 },
    'Sea of Japan': { lat: 40, lon: 135 },
    'Gulf of Aden': { lat: 12.5, lon: 47 },
    'Tasman Sea': { lat: -40, lon: 160 },
    
    // Major Straits & Canals
    'Strait of Hormuz': { lat: 26.5, lon: 56.5 },
    'Suez Canal': { lat: 30.5, lon: 32.5 },
    'Panama Canal': { lat: 9.1, lon: -79.9 },
    'Strait of Malacca': { lat: 3.1, lon: 101.4 },
    'English Channel': { lat: 50.5, lon: -1 },
    'Gibraltar Strait': { lat: 35.9, lon: -5.5 },
    'Bosphorus Strait': { lat: 41.1, lon: 29.1 },
    'Singapore Strait': { lat: 1.2, lon: 103.8 },
    'Dover Strait': { lat: 51, lon: 1.5 },
    
    // Other Notable Locations
    'Cape of Good Hope': { lat: -34.5, lon: 18.5 },
    'Horn of Africa': { lat: 8, lon: 50 },
    'Great Barrier Reef': { lat: -18, lon: 147 },

    // Indian Maritime Locations & Cities
    'Mumbai Port': { lat: 18.96, lon: 72.82 },
    'Chennai Port': { lat: 13.08, lon: 80.27 },
    'Kolkata Port': { lat: 22.56, lon: 88.36 },
    'Visakhapatnam Port': { lat: 17.70, lon: 83.21 },
    'Kochi Port': { lat: 9.96, lon: 76.26 },
    'Goa (Mormugao Port)': { lat: 15.42, lon: 73.80 },
    'Port Blair (Andaman)': { lat: 11.62, lon: 92.73 },
    'Gulf of Kutch': { lat: 22.6, lon: 69.5 },
    'Lakshadweep Sea': { lat: 10, lon: 72 },
    'Andaman Sea': { lat: 12, lon: 95 },
  };

  // Toggles between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Handles the form submission for a new location search.
  const handleLocationSearch = (e) => {
    e.preventDefault();
    if (locationInput.trim()) {
      const newLocation = Object.keys(locationCoordinates).find(
        (key) => key.toLowerCase() === locationInput.toLowerCase().trim()
      );
      if (newLocation) {
        setLocation(newLocation);
        setLocationInput('');
        setLoading(true);
        setError(null);
      } else {
        setError('Location not found. Please choose from the suggested list.');
      }
    }
  };
  
  // New function to dynamically generate alerts based on weather data
  const generateAlerts = (weather) => {
    const newAlerts = [];
    const { windSpeed, waveHeight, visibility, temperature } = weather;

    if (windSpeed > 34) { // 34 knots is the threshold for Tropical Storm
      newAlerts.push({
        type: 'cyclone',
        severity: 'high',
        message: 'Extreme wind warning! A potential cyclone is developing in the area. Take immediate action.'
      });
    } else if (windSpeed > 25) { // Strong gale force
      newAlerts.push({
        type: 'wind',
        severity: 'medium',
        message: 'Strong winds detected. Secure all loose equipment and navigate with caution.'
      });
    }

    if (waveHeight > 4) { // 4m is a significant wave height
      newAlerts.push({
        type: 'swell',
        severity: 'high',
        message: 'Dangerous swells detected. Significant wave heights are impacting navigation. Reduce speed.'
      });
    } else if (waveHeight > 2.5) {
      newAlerts.push({
        type: 'swell',
        severity: 'medium',
        message: 'Moderate swells. Expect rough seas and prepare for vessel motion.'
      });
    }

    if (visibility < 5) { // 5km is a common threshold for fog/poor visibility
      newAlerts.push({
        type: 'fog',
        severity: 'low',
        message: 'Reduced visibility due to mist or fog. Exercise extreme caution and use navigation lights.'
      });
    }
    
    // Add a temperature alert for extreme conditions
    if (temperature > 35) {
      newAlerts.push({
        type: 'heat',
        severity: 'medium',
        message: 'High temperatures detected. Monitor engine cooling systems and crew well-being.'
      });
    }

    return newAlerts;
  };

  // Fetches and processes weather and AI data.
  // This useEffect hook is responsible for fetching data on initial load,
  // when the location changes, and every 10 minutes thereafter.
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      if (!openWeatherApiKey || !geminiApiKey) {
        setError('Please provide valid OpenWeather and Gemini API keys.');
        setLoading(false);
        return;
      }

      try {
        const coords = locationCoordinates[location] || locationCoordinates['Arabian Sea'];
        const weatherResponse = await fetch(`${openWeatherApiUrl}?lat=${coords.lat}&lon=${coords.lon}&appid=${openWeatherApiKey}&units=metric`);
        if (!weatherResponse.ok) throw new Error('Failed to fetch weather data.');

        const weatherData = await weatherResponse.json();

        // Process OpenWeatherMap data
        const currentData = weatherData.list[0];
        const current = {
          location: { lat: coords.lat, lon: coords.lon, name: location },
          temperature: currentData.main.temp,
          windSpeed: currentData.wind.speed * 1.94384, // convert m/s to knots
          windDirection: currentData.wind.deg,
          waveHeight: Math.random() * 3 + 1, // OpenWeatherMap does not provide wave height
          visibility: currentData.visibility / 1000,
          pressure: currentData.main.pressure,
          humidity: currentData.main.humidity,
          seaState: Math.floor(Math.random() * 6) + 1,
          currentSpeed: Math.random() * 2 + 1, // Not provided by OpenWeatherMap
          currentDirection: Math.random() * 360
        };
        setCurrentWeather(current);
        
        // Generate alerts based on the new weather data
        setAlerts(generateAlerts(current));

        const forecastData = weatherData.list.filter((item, index) => index % 8 === 0).slice(0, 5).map((item, index) => {
          const date = new Date();
          date.setDate(date.getDate() + index);
          return {
            date: date.toISOString().split('T')[0],
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            temp: item.main.temp,
            windSpeed: item.wind.speed * 1.94384,
            waveHeight: Math.random() * 3 + 1, // Simulation
            visibility: item.visibility / 1000,
            risk: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
          };
        });
        setForecast(forecastData);

        // --- Fetch AI Recommendations from Gemini API ---
        const prompt = `Based on the following weather data for ${location}, provide vessel optimization recommendations in a JSON object. 
        The JSON object should have the following structure: {
          "optimalSpeed": number, 
          "fuelEfficiency": number, 
          "routeDeviation": number, 
          "timeSavings": number,
          "recommendations": string[]
        }.
        
        Current Conditions:
        - Location: ${current.location.name}
        - Temperature: ${current.temperature}°C
        - Wind Speed: ${current.windSpeed.toFixed(1)} knots
        - Wind Direction: ${current.windDirection}°
        - Wave Height: ${current.waveHeight.toFixed(1)}m
        - Visibility: ${current.visibility.toFixed(1)}km

        Forecast (next 5 days):
        ${forecastData.map(day => `- Date: ${day.date}, Temp: ${day.temp}°C, Wind: ${day.windSpeed.toFixed(1)} knots, Wave Height: ${day.waveHeight.toFixed(1)}m, Risk: ${day.risk}`).join('\n')}
        
        Analyze the data and provide realistic, actionable advice. Ensure the output is a single, valid JSON object with no other text.`;

        const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      "optimalSpeed": { "type": "NUMBER" },
                      "fuelEfficiency": { "type": "NUMBER" },
                      "routeDeviation": { "type": "NUMBER" },
                      "timeSavings": { "type": "NUMBER" },
                      "recommendations": {
                          "type": "ARRAY",
                          "items": { "type": "STRING" }
                      }
                  },
                  "propertyOrdering": ["optimalSpeed", "fuelEfficiency", "routeDeviation", "timeSavings", "recommendations"]
              }
          }
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

        let geminiResult;
        const maxRetries = 5;
        let retries = 0;
        let backoff = 1000;

        while (retries < maxRetries) {
            try {
                const geminiResponse = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!geminiResponse.ok) throw new Error('API request failed');
                const result = await geminiResponse.json();
                geminiResult = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (geminiResult) break;
            } catch (e) {
                retries++;
                if (retries < maxRetries) {
                    await new Promise(res => setTimeout(res, backoff));
                    backoff *= 2;
                } else {
                    throw new Error('Failed to fetch AI recommendations after multiple retries.');
                }
            }
        }

        if (geminiResult) {
            const parsedData = JSON.parse(geminiResult);
            setVesselData({
                currentSpeed: 12.5,
                optimalSpeed: parsedData.optimalSpeed,
                fuelEfficiency: parsedData.fuelEfficiency,
                routeDeviation: parsedData.routeDeviation,
                recommendations: parsedData.recommendations,
                timeSavings: parsedData.timeSavings
            });
        } else {
            throw new Error("AI recommendations could not be generated.");
        }

      } catch (e) {
        console.error("API call error:", e);
        setError(`Error: ${e.message}. Check your API keys and try again.`);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch on component mount or location change
    fetchAllData();

    // Set up a periodic fetch every 10 minutes (600,000 milliseconds)
    const interval = setInterval(() => {
        // We set loading to false here to avoid the loading screen popping up
        // during minor periodic updates, which can be jarring.
        setLoading(false);
        fetchAllData();
    }, 600000); 

    // Clean up the interval when the component unmounts to prevent memory leaks
    return () => clearInterval(interval);

  }, [location]); // Re-fetch data when location changes

  // Helper function to format hours into hours and minutes
  const formatTimeSavings = (hours) => {
    const isNegative = hours < 0;
    const absHours = Math.abs(hours);
    const h = Math.floor(absHours);
    const m = Math.round((absHours - h) * 60);
    return `${isNegative ? '-' : '+'}${h}h ${m}min`;
  };

  // Helper function to get the appropriate alert icon.
  const getAlertIcon = (type) => {
    const color = theme === 'dark' ? 'text-blue-300' : 'text-blue-600';
    switch (type) {
      case 'cyclone': return <AlertTriangle className={`w-5 h-5 ${color}`} />;
      case 'swell': return <Waves className={`w-5 h-5 ${color}`} />;
      case 'wind': return <Wind className={`w-5 h-5 ${color}`} />;
      case 'fog': return <Cloud className={`w-5 h-5 ${color}`} />;
      case 'heat': return <Thermometer className={`w-5 h-5 ${color}`} />;
      default: return <AlertTriangle className={`w-5 h-5 ${color}`} />;
    }
  };

  // Helper function to get the appropriate alert color based on severity.
  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high': return theme === 'dark' ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-red-200/50 border-red-500 text-red-800';
      case 'medium': return theme === 'dark' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-300' : 'bg-yellow-200/50 border-yellow-500 text-yellow-800';
      case 'low': return theme === 'dark' ? 'bg-blue-900/50 border-blue-500 text-blue-300' : 'bg-blue-200/50 border-blue-500 text-blue-800';
      default: return theme === 'dark' ? 'bg-gray-900/50 border-gray-500 text-gray-300' : 'bg-gray-200/50 border-gray-500 text-gray-800';
    }
  };

  // Helper function to get the appropriate risk color.
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // Renders a loading screen while data is being fetched.
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-inter ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-slate-900 text-gray-100' : 'bg-gradient-to-br from-slate-100 to-gray-100 text-gray-900'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${theme === 'dark' ? 'border-white' : 'border-gray-700'}`}></div>
          <p className="text-xl">Loading Oceanova Weather System...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching data for {location}</p>
        </div>
      </div>
    );
  }

  // Renders an error message if API calls fail
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-inter ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-slate-900 text-gray-100' : 'bg-gradient-to-br from-slate-100 to-gray-100 text-gray-900'}`}>
        <div className={`p-8 rounded-2xl text-center border border-red-500 shadow-xl ${theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-200/50 text-red-800'}`}>
          <AlertTriangle className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
          <h2 className="text-2xl font-bold mb-2">API Error</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-red-200' : 'text-red-600'}`}>{error}</p>
        </div>
      </div>
    );
  }

  // Main application UI.
  return (
    <div className={`min-h-screen font-inter ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-slate-900 text-gray-100' : 'bg-gradient-to-br from-slate-100 to-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`backdrop-blur-md border-b sticky top-0 z-10 shadow-lg ${theme === 'dark' ? 'bg-gray-950/60 border-gray-800' : 'bg-white/60 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Navigation className={`w-8 h-8 animate-pulse ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <h1 className="text-2xl font-bold">Marinova</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'}`}>Maritime Weather Intelligence</p>
            </div>
          </div>
          
          {/* Location Search Bar */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleLocationSearch} className="relative">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter maritime location..."
                className={`px-4 py-2 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${theme === 'dark' ? 'bg-gray-800/80 text-white placeholder-gray-400' : 'bg-gray-200/80 text-gray-900 placeholder-gray-500'}`}
                list="maritime-locations"
              />
              <datalist id="maritime-locations">
                {Object.keys(locationCoordinates).map((loc, index) => (
                  <option key={index} value={loc} />
                ))}
              </datalist>
              <button
                type="submit"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700' : 'bg-gray-200/80 text-gray-700 hover:bg-gray-300'}`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className={`hidden md:flex items-center space-x-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="w-4 h-4" />
              <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
              Active Weather Alerts - {location}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-5 rounded-2xl border-l-4 shadow-lg ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-center mb-2">
                    {getAlertIcon(alert.type)}
                    <span className="ml-2 font-semibold text-lg capitalize">{alert.severity} Alert</span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Current Conditions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Current Weather */}
          <div className={`lg:col-span-2 backdrop-blur-md rounded-2xl p-6 shadow-lg transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'}`}>
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <MapPin className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              Current Conditions - {currentWeather?.location.name}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className={`text-center p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-gray-100/40'}`}>
                <Thermometer className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                <p className="text-3xl font-bold">{Math.round(currentWeather?.temperature || 0)}°C</p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Temperature</p>
              </div>
              
              <div className={`text-center p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-gray-100/40'}`}>
                <Wind className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                <p className="text-3xl font-bold">{Math.round(currentWeather?.windSpeed || 0)}</p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Wind (knots)</p>
              </div>
              
              <div className={`text-center p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-gray-100/40'}`}>
                <Waves className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <p className="text-3xl font-bold">{Math.round((currentWeather?.waveHeight || 0) * 10) / 10}m</p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Wave Height</p>
              </div>
              
              <div className={`text-center p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-gray-100/40'}`}>
                <Eye className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                <p className="text-3xl font-bold">{Math.round((currentWeather?.visibility || 0) * 10) / 10}</p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Visibility (km)</p>
              </div>
            </div>

            <div className={`mt-8 grid grid-cols-2 gap-4 text-sm p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-gray-100/40'}`}>
              <div>
                <p><span className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Sea State:</span> {currentWeather?.seaState}/9</p>
                <p><span className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pressure:</span> {Math.round(currentWeather?.pressure || 0)} hPa</p>
              </div>
              <div>
                <p><span className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Humidity:</span> {Math.round(currentWeather?.humidity || 0)}%</p>
                <p><span className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Current:</span> {Math.round((currentWeather?.currentSpeed || 0) * 10) / 10} knots</p>
              </div>
            </div>
          </div>

          {/* Vessel Optimization */}
          <div className={`backdrop-blur-md rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'}`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              Vessel Optimization
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Current Speed</p>
                <p className="text-2xl font-bold">{vesselData?.currentSpeed} knots</p>
              </div>
              
              <div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Optimal Speed</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{vesselData?.optimalSpeed} knots</p>
              </div>
              
              <div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Fuel Efficiency</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{vesselData?.fuelEfficiency}%</p>
                  <div className={`ml-3 flex-1 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
                    <div 
                      className={`h-2 rounded-full ${theme === 'dark' ? 'bg-green-400' : 'bg-green-600'}`} 
                      style={{ width: `${vesselData?.fuelEfficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ETA Improvement</p>
                <p className={`text-lg font-semibold ${vesselData && vesselData.timeSavings >= 0 ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') : (theme === 'dark' ? 'text-red-400' : 'text-red-600')}`}>
                  {vesselData && formatTimeSavings(vesselData.timeSavings)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weather Forecast Chart */}
          <div className={`backdrop-blur-md rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'}`}>
            <h2 className="text-xl font-semibold mb-4">5-Day Weather Forecast - {location}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
                <XAxis 
                  dataKey="day" 
                  stroke={theme === 'dark' ? '#cbd5e1' : '#4b5563'} 
                  fontSize={12}
                  tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#4b5563' }}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#cbd5e1' : '#4b5563'} 
                  fontSize={12} 
                  tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#4b5563' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#e2e8f0', 
                    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#94a3b8'}`,
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#e2e8f0' : '#1f2937'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#1f2937' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke={theme === 'dark' ? '#f87171' : '#ef4444'} 
                  strokeWidth={2}
                  name="Temperature (°C)"
                  dot={{ fill: theme === 'dark' ? '#f87171' : '#ef4444', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="windSpeed" 
                  stroke={theme === 'dark' ? '#4ade80' : '#22c55e'} 
                  strokeWidth={2}
                  name="Wind Speed (knots)"
                  dot={{ fill: theme === 'dark' ? '#4ade80' : '#22c55e', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Wave Height Forecast */}
          <div className={`backdrop-blur-md rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'}`}>
            <h2 className="text-xl font-semibold mb-4">Wave Height Forecast - {location}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
                <XAxis 
                  dataKey="day" 
                  stroke={theme === 'dark' ? '#cbd5e1' : '#4b5563'} 
                  fontSize={12}
                  tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#4b5563' }}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#cbd5e1' : '#4b5563'} 
                  fontSize={12} 
                  tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#4b5563' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#e2e8f0', 
                    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#94a3b8'}`,
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#e2e8f0' : '#1f2937'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#1f2937' }}
                />
                <Area
                  type="monotone"
                  dataKey="waveHeight"
                  stroke={theme === 'dark' ? '#60a5fa' : '#2563eb'}
                  fill={`url(#${theme === 'dark' ? 'waveGradientDark' : 'waveGradientLight'})`}
                  strokeWidth={2}
                  name="Wave Height (m)"
                />
                <defs>
                  <linearGradient id="waveGradientLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="waveGradientDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations and Detailed Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Recommendations */}
          <div className={`backdrop-blur-md rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'}`}>
            <h2 className="text-xl font-semibold mb-4">AI Recommendations for {location}</h2>
            <div className="space-y-4">
              {vesselData?.recommendations.map((rec, index) => (
                <div key={index} className={`flex items-start space-x-3 p-4 rounded-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-900/40 hover:bg-gray-900/60' : 'bg-gray-100/40 hover:bg-gray-200/60'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mt-0.5 shadow-md ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'}`}>
                    {index + 1}
                  </div>
                  <p className={`text-sm flex-grow ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{rec}</p>
                </div>
              ))}
            </div>
            
            <div className={`mt-6 p-5 rounded-2xl border border-green-500/20 shadow-inner ${theme === 'dark' ? 'bg-green-900/40' : 'bg-green-200/40'}`}>
              <p className={`font-semibold mb-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>Optimal Route Summary</p>
              <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-green-200' : 'text-green-700'}`}>
                <p>• Route deviation: {vesselData?.routeDeviation}nm</p>
                <p>• Fuel savings: ~{vesselData && (vesselData.fuelEfficiency - 85)}%</p>
                <p>• Time savings: {vesselData && formatTimeSavings(vesselData.timeSavings)}</p>
                <p>• Weather risk: Reduced by {vesselData && (vesselData.timeSavings > 0 ? '40%' : '10%')}</p>
              </div>
            </div>
          </div>

          {/* Detailed Forecast Table */}
          <div className={`backdrop-blur-md rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'}`}>
            <h2 className="text-xl font-semibold mb-4">Extended Forecast - {location}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Weather</th>
                    <th className="text-left py-3 px-2">Risk</th>
                    <th className="text-left py-3 px-2">Visibility</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.slice(0, 5).map((day, index) => (
                    <tr key={index} className={`border-b transition-colors ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-800/80' : 'border-gray-300/50 hover:bg-gray-200/80'}`}>
                      <td className="py-3 px-2">
                        <p className="font-medium">{day.day}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{day.date}</p>
                      </td>
                      <td className="py-3 px-2">
                        <p>{day.temp}°C</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{day.windSpeed}kt, {day.waveHeight}m</p>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(day.risk)}`}>
                          {day.risk.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-2">{day.visibility}km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-md border-t px-4 py-2 z-20 ${theme === 'dark' ? 'bg-gray-950/60 border-gray-800' : 'bg-white/60 border-gray-200'}`}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full mr-2 animate-pulse ${theme === 'dark' ? 'bg-green-400' : 'bg-green-600'}`}></div>
              System Online - {location}
            </span>
            <span>API Connected</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Data Source: OpenWeather Marine API & Gemini API</span>
            <span>Refresh: 10m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OceanovaWeatherSystem;