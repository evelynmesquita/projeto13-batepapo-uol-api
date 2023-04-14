import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
const Joi = require('joi');


const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();

let db
const mongoClient = new MongoClient(process.env.DATABASE_URL)
mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message))


app.post("/participants", (req, res) => {
    const { name } = req.body;

})

app.get("/participants", (req,res) => {

})

app.post("/messages", (req, res) => {

}) 

app.get("/messages", (req, res) => {

})

app.post("/status", (req, res) => {

})

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))