# 🎓 StudentConnect

**StudentConnect** is a full-stack campus utility platform built to streamline everyday student needs. It integrates multiple services into a single ecosystem, allowing students to **buy/sell items, recover lost belongings, and find hackathon teammates** efficiently.

The platform emphasizes **security, usability, and real-world practicality**, making it a scalable solution for campus communities. We recently overhauled the UI to feature a premium dark mode, glassmorphism elements, and responsive grids.

---

## 🚀 Core Features

### 🛒 Campus Marketplace
- Post items for sale with images, pricing, and descriptions.
- Browse listings within your campus using a sleek, responsive grid layout.
- Simplified buying/selling experience with integrated contact info.

### 🔍 Lost & Found
- Report lost items with detailed information (date, location, category).
- Post found items to help others recover their belongings.
- Centralized tracking to drastically improve recovery rates on campus.

### 🤝 Hackathon Team Finder
- Create or join teams based on required skills and tech stack.
- Visually engaging cards with tech-stack pills and applicant dashboards.
- Connect with like-minded peers and encourage collaboration and innovation.

### 🔐 Security & Authentication
- Secure login/signup using **JWT authentication** with Refresh Tokens.
- Protected routes and user-specific actions.
- Ownership verification on backend endpoints to prevent unauthorized edits.
- Passwords hashed via `bcryptjs`.

### 🎨 Modern UI / UX
- **Glassmorphism**: Frosted glass effects on navbars, modals, and cards.
- **Dynamic Empty States**: Beautiful, illustrated empty states prompting users to create the first posts.
- **Floating Action Buttons (FAB)** for quick creation of items.
- Custom gradient backgrounds, `lucide-react` icons, and the sleek `Inter` font.

---

## 🛠️ Tech Stack

**Frontend**
- **React.js** (Vite)
- **React Router DOM** (Client-side routing)
- **Lucide React** (Modern iconography)
- Vanilla CSS (Modern utilities, CSS Grid, Flexbox, Animations)

**Backend**
- **Node.js**
- **Express.js** (v5)
- **Mongoose** (ODM)
- **JWT** (JSON Web Tokens)
- **Bcryptjs** (Password hashing)

**Database**
- **MongoDB**

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/AkankshaRaj07/StudentConnect.git
cd studentconnect
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
MONGO_URI=mongodb://127.0.0.1:27017/studentconnect
JWT_SECRET=your_super_secret_key
PORT=4000
```
Run the backend:
```bash
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4️⃣ Seed Database (Optional)
To populate your local instance with dummy data so the UI doesn't look empty:
```bash
cd backend
node seed.js
```

---

## 📸 Screenshots

*(Add updated screenshots of the new Dark Theme UI here)*

---
Made with ❤️ for College Students.
