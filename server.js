const express = require("express");

const app = express();
const ADMIN_KEY = "172635";
let estadoActual = {
  estado: "ninguna",

  sabado: {
    hologramas: [],
    digitos: []
  }
};

app.get("/admin", (req,res)=>{

if(req.query.key !== ADMIN_KEY){
  return res.send("Acceso no autorizado");
}

res.send(`
<h2>Control de contingencia</h2>

<form action="/set" method="get">

<input type="hidden" name="key" value="${ADMIN_KEY}">

Estado:
<select name="estado">
<option value="ninguna">Ninguna</option>
<option value="faseI">Fase I</option>
<option value="faseII">Fase II</option>
</select>

<br><br>

Digitos sabado (ej: 1,3,5,7,9):
<input name="digitos">

<br><br>

Hologramas sabado (ej: 0,00):
<input name="hologramas">

<br><br>

<button type="submit">Actualizar</button>

</form>
`);

});
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

estadoActual={
 estado,
 sabado:{
  hologramas,
  digitos
 }
};

res.send("Estado actualizado: "+JSON.stringify(estadoActual));

});

app.get("/contingencia", (req,res)=>{
  res.json(estadoActual);
});

app.listen(3000, () => {
  console.log("API contingencia lista en puerto 3000");
});
