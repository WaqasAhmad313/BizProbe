# BizProbe

BizProbe is a web application designed to streamline business outreach and analytics by integrating with multiple APIs, including Google Maps, Yelp Fusion, Google Ads, Google My Business Profile, and Gmail. The platform allows users to efficiently track businesses, manage follow-ups, and analyze data for strategic decision-making.

## Features

- **Authentication System**: Secure user login/signup with authentication state management.
- **Business Search & Analytics**: Fetch and analyze business data using Google Maps and Yelp APIs.
- **Follow-up Management**: Keep track of outreach efforts and receive alerts for scheduled follow-ups.
- **API Usage Logging**: Monitor and log API requests to track usage.
- **Automated Background Jobs**: Periodic updates on business data and follow-up reminders.
- **User Dashboard**: Provides insights and easy access to key functionalities.

## Tech Stack

### Frontend
- **Vite + React**: Fast and modern frontend development.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **React Context API**: Manages authentication state.

### Backend
- **Node.js + Express**: Lightweight backend framework.
- **PostgreSQL**: Relational database for storing business, user, and API data.
- **JWT Authentication**: Secure user authentication with JSON Web Tokens.
- **Dotenv**: Manages environment variables securely.

## Folder Structure

```
BizProbe/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── server.js
│   │   ├── config/
│   ├── .env
│   ├── package.json
│   ├── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── App.jsx
│   ├── .env
│   ├── package.json
│   ├── README.md
├── README.md
```

## Installation

### Prerequisites
- Node.js installed
- PostgreSQL database set up

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/WaqasAhmad313/BizProbe.git
   cd BizProbe
   ```
2. Set up backend:
   ```sh
   cd backend
   npm install
   ```
   - Create a `.env` file and configure environment variables.
   - Start the backend server:
     ```sh
     npm run dev
     ```
3. Set up frontend:
   ```sh
   cd ../frontend
   npm install
   npm run dev
   ```

## API Integration
BizProbe integrates with several APIs to fetch and analyze business data:
- **Google Maps API**: Fetch business locations and details.
- **Yelp Fusion API**: Retrieve business ratings and reviews.
- **Google Ads API**: Access ad insights (planned feature).
- **Google Business Profile API**: Manage business listings.
- **Gmail API**: Automate outreach and follow-up emails.

## Roadmap
- ✅ User authentication system
- ✅ Business search and tracking
- ✅ API request logging
- ⏳ Google Ads integration
- ⏳ Email automation with Gmail API
- ⏳ Advanced analytics dashboard

## Contributing
Contributions are welcome! Feel free to fork the repo and submit pull requests.

## License
This project is licensed under the MIT License.

