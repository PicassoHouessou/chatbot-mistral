import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: String,
    pseudo: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const users = [
    {
        name: "Picasso",
        pseudo: "picasso",
        email: "picasso@eilco.fr",
        password: "password",
    },
    {
        name: "Delphine",
        pseudo: "delphine",
        email: "delphine@eilco.fr",
        password: "password",
    },
    {
        name: "Raoul",
        pseudo: "raoul",
        email: "raoul@eilco.fr",
        password: "password",
    },
];

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const u of users) {
        const hashed = await bcrypt.hash(u.password, 10);
        const existing = await User.findOne({ pseudo: u.pseudo });

        if (existing) {
            await User.updateOne(
                { pseudo: u.pseudo },
                { $set: { name: u.name, email: u.email, password: hashed } }
            );
            console.log(`Updated user "${u.pseudo}"`);
        } else {
            await User.create({ ...u, password: hashed });
            console.log(`Created user "${u.pseudo}"`);
        }
    }

    await mongoose.disconnect();
    console.log("Done.");
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
