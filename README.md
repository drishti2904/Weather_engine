##Oceanova: Maritime Weather Intelligence System
Oceanova is a modern, responsive web application built with React that provides real-time and forecasted maritime weather data, along with AI-powered vessel optimization recommendations. It's designed for maritime professionals, sailors, and enthusiasts who need to make informed decisions based on oceanic conditions.

This system combines data from the OpenWeather API for meteorological information and the Gemini API for intelligent, actionable insights.


##Features
Real-time Weather Data: Get current conditions for a wide range of maritime locations, including major oceans, seas, straits, and Indian ports.

Dynamic Weather Alerts: The system automatically generates warnings for high winds, dangerous swells, and poor visibility based on real-time data.

5-Day Forecast: Visualize future weather trends with interactive charts for temperature, wind speed, and wave height.

AI-Powered Vessel Optimization: Leverage the power of Google's Gemini API to receive intelligent recommendations for optimal speed, fuel efficiency, and route planning to save time and mitigate risk.

Location Search: Easily search for and select from a predefined list of global and Indian maritime locations.

Responsive UI: The dashboard is fully responsive, providing a seamless experience on desktop, tablet, and mobile devices.

Dark/Light Theme: Switch between a professional light theme and a sleek dark theme to suit your preference.

##Technology Stack
React: The core library for building the user interface.

Vite: A fast build tool that provides a lightning-fast development experience.

Tailwind CSS: A utility-first CSS framework for rapid and clean UI development.

Lucide React: A collection of beautiful and customizable open-source icons.

Recharts: A React charting library used to create the interactive weather forecast graphs.

OpenWeather API: Serves as the primary source for weather data.

Gemini API: Powers the AI recommendation engine.

##Getting Started
1. Prerequisites
Before you begin, you'll need the following:

Node.js and npm installed on your machine.

An API key from OpenWeather. You can sign up for a free account here.

An API key from Google's Gemini API. You can get one from the Google AI for Developers platform.

2. Installation
Clone the repository and install the dependencies:

Bash

git clone <repository-url>
cd oceanova-weather-system
npm install
3. API Keys
Create a .env file in the root directory of the project and add your API keys:

VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5/forecast
4. Running the Application
Start the development server:

Bash

npm run dev
The application will be available at http://localhost:5173 (or another port if 5173 is in use).

