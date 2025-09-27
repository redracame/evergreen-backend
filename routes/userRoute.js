import express from "express";
import { createEmployee } from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.post("/", createEmployee);

export default userRoute;
