# Travesía ✈️

A full-stack travel review web application built with the MERN stack. Users can explore destinations around the world, read and write reviews, save favorites, and get AI-generated historical guides for each place.

🌐 **Live Demo:** Coming Soon...

---

## Features

### For Users
- Browse and search places by name, country, or city
- Filter by category (Beach, Historical, Nature, City, Adventure, Cultural, etc.)
- Sort places by Top Rated, Most Reviewed, Newest, or A-Z
- View place details with image gallery, location map, and reviews
- Write, edit, and delete reviews with star ratings
- Save places to favorites
- View personal profile with review history and stats
- Get directions, street view, nearby hotels and restaurants via Google Maps
- Generate AI-powered historical travel guides (powered by Claude AI)
- Share place links via clipboard
- Print or save travel guides as PDF

### For Admins
- Add, edit, and delete places with multiple image uploads (Cloudinary)
- Admin dashboard with charts — places by category, top rated, most reviewed
- Manage all users and change user roles
- Delete any review

---

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router DOM
- Axios
- Tailwind CSS v4

**Backend**
- Node.js + Express 4
- MongoDB + Mongoose
- JWT Authentication
- Bcryptjs
- Multer + Cloudinary (image uploads)

**External Services**
- MongoDB Atlas (database)
- Cloudinary (image hosting)
- Anthropic Claude API (AI travel guide generation)
- OpenStreetMap (embedded maps)
- Google Maps (directions, street view, nearby places)

---

## Screenshots

> Home Page
![Home](screenshots/home.png)

> Place Detail
![Place Detail](screenshots/place-detail.png)

> Admin Dashboard
![Dashboard](screenshots/dashboard.png)

> Travel Guide
![Travel Guide](screenshots/travel-guide.png)

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Anthropic API key

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/MohamedIshan24/travesia.git
cd travesia
```

**2. Setup the backend**
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ANTHROPIC_API_KEY=your_anthropic_key
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

**3. Setup the frontend**
```bash
cd client
npm install
```

Create a `.env` file in the `client/` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

**4. Open your browser**

http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Protected |
| PUT | `/api/auth/me` | Update profile | Protected |
| GET | `/api/auth/users` | Get all users | Admin |
| PUT | `/api/auth/users/:id/role` | Update user role | Admin |
| GET | `/api/places` | Get all places | Public |
| GET | `/api/places/:id` | Get single place | Public |
| POST | `/api/places` | Create place | Admin |
| PUT | `/api/places/:id` | Update place | Admin |
| DELETE | `/api/places/:id` | Delete place | Admin |
| POST | `/api/places/:id/essay` | Generate AI guide | Public |
| GET | `/api/reviews/place/:id` | Get place reviews | Public |
| POST | `/api/reviews/place/:id` | Create review | Protected |
| PUT | `/api/reviews/:id` | Update review | Protected |
| DELETE | `/api/reviews/:id` | Delete review | Protected |
| GET | `/api/favorites` | Get favorites | Protected |
| POST | `/api/favorites/:id` | Add favorite | Protected |
| DELETE | `/api/favorites/:id` | Remove favorite | Protected |
| GET | `/api/dashboard/stats` | Get admin stats | Admin |

---

## Deployment

- **Backend:** Railway
- **Frontend:** Vercel
- **Database:** MongoDB Atlas
- **Images:** Cloudinary

---

## Author

**Mohamed Ishan** — Second year Computer Science undergraduate at University of Colombo School of Computing (UCSC)

- GitHub: [@MohamedIshan24](https://github.com/MohamedIshan24)

---

## License

This project is open source and available under the [MIT License](LICENSE).