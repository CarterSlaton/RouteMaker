# RouteMaker

A web application for creating and managing custom running routes using interactive maps.

## Features

- Create custom running routes using an interactive map interface
- Calculate route distances in real-time
- Save and organize your favorite routes
- Responsive design for both desktop and mobile use
- User-friendly interface with modern UI components

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Mapbox API key

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/routemaker.git
cd routemaker
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your Mapbox API key:

```
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Environment Setup

Before running the application, you'll need to:

1. Sign up for a Mapbox account at https://www.mapbox.com/
2. Create an access token in your Mapbox account
3. Add the access token to your `.env` file

## Technologies Used

- React
- TypeScript
- Vite
- Mapbox GL JS
- Chakra UI
- React Router
- React Icons

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── App.tsx        # Main application component
  └── main.tsx       # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
