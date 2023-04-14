import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import Joi from 'joi';
import dayjs from 'dayjs';


const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();

let db
const mongoClient = new MongoClient(process.env.DATABASE_URL)
mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message))


app.post("/participants", async (req, res) => {

    const participants = db.collection('participants')
    const messages = db.collection('messages');

    try {
        const schema = Joi.object({
            name: Joi.string().required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(422).send(error.details[0].message);
        }

        const { name } = value;

        const existingParticipant = await participants.findOne({ name });
        if (existingParticipant) {
            return res.status(409).send("'Name already in use'");
        }

        const newParticipant = {
            name,
            lastStatus: Date.now()
        };

        const result = await participants.insertOne(newParticipant);

        const message = {
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        };

        await messages.insertOne(message)

        return res.status(201).send();

    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
    }
})

app.get("/participants", async (req, res) => {
    const participants = await db.collection('participants').find().toArray();
    return res.send(participants);
})

app.post("/messages", (req, res) => {

})

app.get("/messages", (req, res) => {

})

app.post("/status", (req, res) => {

})

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))