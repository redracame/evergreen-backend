import express from "express";
import { createEmployee , getEmployee , updateEmployee , deleteEmployee , loginEmployee } from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.post("/", createEmployee);
userRoute.get("/", getEmployee);
userRoute.put("/:id", updateEmployee);
userRoute.delete("/:id", deleteEmployee);
userRoute.post("/login", loginEmployee);

export default userRoute;
