const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studentconnect';

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  enrollment: String
});

const marketplaceSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  condition: String,
  location: String,
  status: { type: String, default: 'available' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const lostFoundSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String, // 'lost' or 'found'
  category: String,
  location: String,
  date: Date,
  contactInfo: String,
  isResolved: { type: Boolean, default: false },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const hackathonSchema = new mongoose.Schema({
  title: String,
  description: String,
  hackathonName: String,
  techStack: [String],
  skillsNeeded: String,
  maxMembers: Number,
  contactInfo: String,
  isClosed: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', userSchema);
const Marketplace = mongoose.model('Marketplace', marketplaceSchema);
const LostFound = mongoose.model('LostFound', lostFoundSchema);
const Hackathon = mongoose.model('Hackathon', hackathonSchema);

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get a user to attach to
    let user = await User.findOne();
    if (!user) {
        console.log("Creating dummy user since none found.");
        user = await User.create({
            name: "John Doe",
            email: "john@example.com",
            enrollment: "0123CS201010",
            passwordHash: "dummy"
        });
    }

    // Marketplace Seed
    const mpItems = await Marketplace.countDocuments();
    if (mpItems === 0) {
      await Marketplace.create([
        {
          title: "Engineering Mathematics Textbook",
          description: "BS Grewal 44th Edition in good condition. Barely used.",
          price: 350,
          category: "Books",
          condition: "Like New",
          location: "Hostel A",
          seller: user._id
        },
        {
          title: "Scientific Calculator Casio fx-991EX",
          description: "Works perfectly. Upgraded so selling this one.",
          price: 700,
          category: "Electronics",
          condition: "Used",
          location: "CSE Block, 2nd Floor",
          seller: user._id
        },
        {
          title: "Drawing Board & Instruments",
          description: "Complete set for 1st-year engineering drawing.",
          price: 450,
          category: "Stationery",
          condition: "Good",
          location: "Library",
          seller: user._id
        }
      ]);
      console.log('Marketplace items seeded.');
    }

    // Lost Found Seed
    const lfItems = await LostFound.countDocuments();
    if (lfItems === 0) {
      await LostFound.create([
        {
          title: "Blue Milton Water Bottle",
          description: "Left it in Room 304 yesterday during OS class.",
          type: "lost",
          category: "Other",
          location: "Room 304",
          date: new Date(),
          contactInfo: "9876543210",
          reportedBy: user._id
        },
        {
          title: "Found a smart watch near canteen",
          description: "Black smart watch found on the table. Handed it over to the canteen owner.",
          type: "found",
          category: "Electronics",
          location: "Main Canteen",
          date: new Date(),
          contactInfo: "Canteen Owner",
          reportedBy: user._id
        }
      ]);
      console.log('Lost & Found items seeded.');
    }

    // Hackathon Seed
    const hItems = await Hackathon.countDocuments();
    if (hItems === 0) {
      await Hackathon.create([
        {
          hackathonName: "Smart India Hackathon 2026",
          title: "Looking for a Frontend Developer",
          description: "We are a team of 3 looking for a strong React developer. Our project is a blockchain based credential system.",
          techStack: ["React", "TailwindCSS", "Web3.js"],
          skillsNeeded: "Frontend Development, UI/UX",
          maxMembers: 4,
          contactInfo: "john@example.com",
          createdBy: user._id
        },
        {
          hackathonName: "Campus CodeFest",
          title: "Need a Backend/AI person",
          description: "Building an AI-driven study planner. I handle the frontend, need someone for the backend and AI integration.",
          techStack: ["Node.js", "Python", "MongoDB"],
          skillsNeeded: "Backend, Machine Learning",
          maxMembers: 3,
          contactInfo: "Insta: @johndoescode",
          createdBy: user._id
        }
      ]);
      console.log('Hackathon items seeded.');
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
