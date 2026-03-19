const express = require("express");
const app = express();

const ADMIN_KEY = "172635";

// 🔥 TOKENS FIREBASE
let tokens = [];

// 🔥 ESTADO CONTINGENCIA
let estadoActual = {
  estado: "ninguna",
  hasta: null,
  sabado: {
    hologramas: [],
    digitos: []
  }
};

// ─────────────────────────────
// 🔐 PANEL ADMIN
// ─────────────────────────────
app.get("/admin", (req,res)=>{

if(req.query.key !== ADMIN_KEY){
  return res.send("Acceso no autorizado");
}

res.send(`
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{ font-family: Arial; font-size:24px; padding:30px; }
h2{ font-size:36px; }
select,input,button{
 font-size:26px;
 padding:15px;
 width:100%;
 margin-top:15px;
}
button{
 background:#4CAF50;
 color:white;
 border:none;
 border-radius:10px;
}
</style>
</head>

<body>

<h2>Control de contingencia</h2>

<form action="/set" method="get">

<input type="hidden" name="key" value="${ADMIN_KEY}">

Estado:
<select name="estado">
<option value="ninguna">Ninguna</option>
<option value="faseI">Fase I</option>
<option value="faseII">Fase II</option>
</select>

<br>

Digitos sabado (ej: 1,3,5,7,9):
<input name="digitos">

<br>

Hologramas sabado (ej: 0,00):
<input name="hologramas">

<br>

<button type="submit">Actualizar</button>

<br><br>

<a href="/auto?key=${ADMIN_KEY}">
<button type="button" style="background:#f44336">
Volver a modo automático (AQI)
</button>
</a>

</form>

</body>
</html>
`);
});

// ─────────────────────────────
// 🔄 SET CONTINGENCIA
// ─────────────────────────────
app.get("/set",(req,res)=>{

if(req.query.key !== ADMIN_KEY){
  return res.send("Acceso no autorizado");
}

const estado=req.query.estado || "ninguna";

const digitos=req.query.digitos
 ? req.query.digitos.split(",").map(n=>parseInt(n))
 : [];

const hologramas=req.query.hologramas
 ? req.query.hologramas.split(",")
 : [];

const ahora = new Date();

const manana = new Date(
 ahora.getFullYear(),
 ahora.getMonth(),
 ahora.getDate() + 1,
 0,0,0,0
);

estadoActual={
 estado,
 hasta: manana.getTime(),
 sabado:{
  hologramas,
  digitos
 }
};

res.send("Estado actualizado: "+JSON.stringify(estadoActual));

});

// ─────────────────────────────
// 🔁 VOLVER AUTOMÁTICO
// ─────────────────────────────
app.get("/auto",(req,res)=>{

if(req.query.key !== ADMIN_KEY){
  return res.send("Acceso no autorizado");
}

estadoActual={
 estado:"ninguna",
 hasta:null,
 sabado:{
  hologramas:[],
  digitos:[]
 }
};

res.send("Modo automático activado (AQI)");
});

// ─────────────────────────────
// 📡 CONSULTA CONTINGENCIA
// ─────────────────────────────
app.get("/contingencia", (req,res)=>{

if(estadoActual.hasta && Date.now() > estadoActual.hasta){
  estadoActual.estado="ninguna";
}

res.json(estadoActual);

});

// ─────────────────────────────
// 📲 REGISTRAR TOKEN FIREBASE
// ─────────────────────────────
app.get("/register", (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.send("No token");
  }

  if (!tokens.includes(token)) {
    tokens.push(token);
  }

  console.log("🔥 TOKENS:", tokens);

  res.send("Token guardado");
});

// ─────────────────────────────
// 🚀 ENVIAR NOTIFICACIÓN
// ─────────────────────────────

// 👉 REQUIERE firebase-admin
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.get("/notify", async (req, res) => {
  try {

    for (let token of tokens) {
      await admin.messaging().send({
        token: token,
        notification: {
          title: "🚗 Hoy No Circula",
          body: "Tu auto NO circula mañana"
        }
      });
    }

    res.send("Notificación enviada");

  } catch (e) {
    console.log(e);
    res.send("Error enviando");
  }
});

// ─────────────────────────────
// 🚀 START SERVER
// ─────────────────────────────
app.listen(3000, () => {
  console.log("🔥 API lista en puerto 3000");
});

// ─────────────────────────────
// 🚀 START SERVER
// ─────────────────────────────
app.listen(3000, () => {
  console.log("🔥 API lista en puerto 3000");
});
