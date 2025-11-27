const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Conectar no Firebase
admin.initializeApp({
    credential: admin.credential.cert(require("./serviceAccountKey.json"))
});

// Guardar tokens dos usuários
let tokens = {}; // ex: { "usuario123": "tokenABC" }

// Endpoint para registrar token do usuário
app.post("/registrar-token", (req, res) => {
    const { userId, token } = req.body;
    tokens[userId] = token;
    res.send("Token salvo com sucesso!");
});

// Endpoint para enviar notificação a um usuário
app.post("/enviar", async (req, res) => {
    const { userId, titulo, mensagem } = req.body;

    if (!tokens[userId]) {
        return res.status(404).send("Usuário não registrado");
    }

    const msg = {
        token: tokens[userId],
        notification: {
            title: titulo,
            body: mensagem
        }
    };

    try {
        await admin.messaging().send(msg);
        res.send("Notificação enviada!");
    } catch (err) {
        console.log(err);
        res.status(500).send("Erro ao enviar notificação");
    }
});

app.listen(3000, () => {
    console.log("Servidor LinkExpress rodando na porta 3000!");
});
