const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

const users = [
  { role: "Admin", email: "nlokuvithana71@gmail.com", password: "Nisith1@3" },
  { role: "Admin", email: "linukaauchithya@gmail.com", password: "Linuka1@3" },
  { role: "Employee", email: "gunaratnewickrama@gmail.com", password: "Sandul1@3" },
  { role: "Employee", email: "kaluuathal@gmail.com", password: "Kalu1@3" },
  { role: "Manager", email: "yasas.nawanjana@gmail.com", password: "Yasas1@3" }
];

async function seed() {
  await User.deleteMany();
  for (let user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    user.password = hashed;
    await User.create(user);
  }
  console.log("✅ Users seeded successfully");
  mongoose.disconnect();
}

seed();
