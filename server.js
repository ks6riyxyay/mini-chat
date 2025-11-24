const fs = require("fs");
const http = require("http");
const express = require("express");
const WebSocket = require("ws");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Load users
let users = JSON.parse(fs.readFileSync("users.json"));

// ---------------- AUTH ----------------
app.post("/signup", (req,res)=>{
    const {user, pass} = req.body;
    if(users[user]) return res.json({msg:"Usuário já existe"});
    users[user] = pass;
    fs.writeFileSync("users.json", JSON.stringify(users));
    res.json({msg:"Cadastrado!"});
});

app.post("/login", (req,res)=>{
    const {user, pass} = req.body;
    if(users[user] === pass) res.json({ok:true});
    else res.json({ok:false});
});

// ---------------- WEBSOCKET ----------------
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

wss.on("connection", ws=>{
    ws.on("message", msg=>{
        let data = JSON.parse(msg);
        // Broadcast
        wss.clients.forEach(client=>{
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(data));
            }
        });
    });
});

server.listen(3000, ()=> console.log("Rodando na porta 3000"));
