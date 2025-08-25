
---

# Oceanova: Maritime Weather Intelligence System

**Oceanova** is a modern, responsive **maritime weather intelligence dashboard** built with **React**. It provides **real-time** and **forecasted oceanic weather data**, enhanced with **AI-powered vessel optimization recommendations**.

Designed for **maritime professionals, sailors, researchers, and enthusiasts**, Oceanova helps users make **informed decisions** based on oceanic conditions, improving safety, efficiency, and navigation.

---

## Features

* ** Real-Time Weather Data** – Access live conditions across global oceans, seas, straits, and major Indian ports.
* ** Dynamic Weather Alerts** – Automated warnings for **high winds, dangerous swells, and poor visibility**.
* ** 5-Day Forecast** – Interactive charts for **temperature, wind speed, and wave height trends**.
* ** AI-Powered Vessel Optimization** – Google’s **Gemini API** delivers smart recommendations for **optimal speed, fuel efficiency, and safer routing**.
* ** Location Search** – Quickly search and select from a predefined list of global and Indian maritime zones.
* ** Responsive Dashboard** – Optimized for **desktop, tablet, and mobile** devices.
* **Dark/Light Theme** – Switch seamlessly between professional **light mode** and elegant **dark mode**.

---

## Technology Stack

* **Frontend**: React + Vite
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Charts**: Recharts
* **APIs**:

  * OpenWeather API – Meteorological data source
  * Gemini API – AI-driven optimization & insights

---

## Getting Started

### 1. Prerequisites

Ensure you have the following installed:

* **Node.js & npm**
* **API Keys**:

  * OpenWeather API key → [Get one here](https://openweathermap.org/api)
  * Gemini API key → [Google AI for Developers](https://ai.google.dev/)

---

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd oceanova-weather-system

# Install dependencies
npm install
```

---

### 3. Configure API Keys

Create a **.env** file in the root directory:

```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5/forecast
```

---

### 4. Run the Application

```bash
npm run dev
```

The app will be available at:
👉 [http://localhost:5173](http://localhost:5173) (or the next available port).

---

## Future Enhancements

*  Integration with additional marine APIs (NOAA, Copernicus, etc.)
*  Satellite-based weather visualization
*  Real-time AIS (Automatic Identification System) integration
*  Fleet management dashboard

---

##  Contributing

Contributions, bug reports, and feature requests are welcome!
Feel free to fork the repo, create a branch, and submit a pull request.

---



