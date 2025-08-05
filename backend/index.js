import express from 'express';
import cors from 'cors';
import { createTheFirstAdmin } from "./controllers/authController.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//getting all routes:
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import interventionRoutes from './routes/interventionRoutes.js';
import requestRoutes from './routes/requestRoutes.js';

app.use(userRoutes);
app.use(authRoutes);
app.use(interventionRoutes);
app.use(requestRoutes);


app.listen(3000, () => {
    console.log("server is listening to port 3000");
    createTheFirstAdmin();
});