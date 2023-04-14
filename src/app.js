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

    const participantsCollection = db.collection('participants')
    const messagesCollection = db.collection('messages');

    try {
        const schema = Joi.object({
            name: Joi.string().required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(422).send(error.details[0].message);
        }

        const { name } = value;

        const existingParticipant = await participantsCollection.findOne({ name });
        if (existingParticipant) {
            return res.status(409).send("Name already in use");
        }

        const newParticipant = {
            name,
            lastStatus: Date.now()
        };

        const result = await participantsCollection.insertOne(newParticipant);

        const message = {
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        };

        await messagesCollection.insertOne(message)

        return res.status(201).send();

    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
    }
})

app.get("/participants", async (req, res) => {
    const participantsCollection = await db.collection('participants').find().toArray();
    return res.send(participantsCollection);
})

app.post("/messages", async (req, res) => {

    const messagesCollection = db.collection('messages');
    const participantsCollection = db.collection('participants')

    try {

        const { to, text, type } = req.body;
        const from = req.header("User");

        const schemaMessage = Joi.object({
            to: Joi.string().required(),
            text: Joi.string().required(),
            type: Joi.string().valid("message", "private_message").required(),
        });

        const { error } = schemaMessage.validate({ to, text, type });

        if (error) {
            return res.status(422).send(error.details[0].message)
        }

        const participantExists = await participantsCollection.findOne({
            name: from,
        });

        if (!participantExists) {
            return res.status(422).send("Sender not found");
        }

        const time = dayjs().format("HH:mm:ss");
        const message = {
            from,
            to,
            text,
            type,
            time,
        }

        await messagesCollection.insertOne(message)
        return res.status(201).send();

    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal server error');
    }
})

app.get("/messages", (req, res) => {

})

app.post("/status", (req, res) => {

})

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))