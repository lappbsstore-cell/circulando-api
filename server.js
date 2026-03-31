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
app.get("/set", async (req,res)=>{
  try {

    if(req.query.key !== ADMIN_KEY){
      return res.send("Acceso no autorizado");
    }

    const estado=req.query.estado || "ninguna";

    let modo = "auto";

    if (estado === "ninguna") modo = "normal";
    if (estado === "faseI") modo = "fase1";
    if (estado === "faseII") modo = "fase2";

    await admin.firestore().collection("config").doc("restricciones").set(
      { modo },
      { merge: true }
    );

    res.send("Modo actualizado a: " + modo);

  } catch(e) {
    console.log("❌ ERROR /set:", e);
    res.send("ERROR: " + e.message);
  }
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



// 👇 AGREGA ESTO AQUÍ
console.log("ENV PROJECT:", process.env.FIREBASE_PROJECT_ID);
console.log("ENV EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("ENV PRIVATE KEY LENGTH:", process.env.FIREBASE_PRIVATE_KEY?.length);


if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

console.log("🔥 Firebase inicializado");
console.log("🔥 Proyecto:", process.env.FIREBASE_PROJECT_ID);

const { GoogleAuth } = require("google-auth-library");

const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
});

async function enviarFCM(token) {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: token,
          notification: {
            title: "🚗 CirculAndo",
            body: "Prueba real 🔔",
          },
        },
      }),
    }
  );

  const data = await res.json();
  console.log("🔥 FCM RESPONSE:", data);
}

app.get("/notify", async (req, res) => {
  try {

    if (tokens.length === 0) {
      return res.send("No hay tokens registrados");
    }

    console.log("🔥 TOKENS:", tokens);

    for (const token of tokens) {

      console.log("📤 ENVIANDO A:", token);

      await enviarFCM(token);
    }

    res.send("Notificación enviada");

  } catch (e) {
    console.log("❌ ERROR FIREBASE:");
    console.log(e);

    res.send("ERROR REAL: " + e.message);
  }
});
    

    
app.get("/tokens", (req, res) => {
  res.json(tokens);
});



app.get("/test", (req, res) => {
  res.send("🔥 TEST OK");
});
// ─────────────────────────────
// 🚀 START SERVER
// ─────────────────────────────
app.listen(3000, () => {
  console.log("🔥 API lista en puerto 3000");
});
