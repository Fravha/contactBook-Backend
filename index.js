require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Client } = require("@notionhq/client");

const app = express();
app.use(cors());
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

app.post("/api/contacto", async (req, res) => {
  const { nombre, correo, telefono, linkedin, fecha } = req.body;

  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        "Nombre": {
          title: [{ text: { content: nombre } }]
        },
        "Correo": {
          email: correo
        },
        "Telefono": {
          phone_number: telefono
        },
        "LinkedIn": {
          url: linkedin || null
        },
        "Fecha": {
          date: { start: fecha }
        }
      }
    });

    res.status(200).json({ mensaje: "Guardado en Notion correctamente" });
  } catch (error) {
    console.error("Error al guardar en Notion:", error.message);
    res.status(500).json({ error: "Error al guardar en Notion" });
  }
});

app.get("/api/contactos", async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending"
        }
      ]
    });

    const contactos = response.results.map((page) => {
      return {
        nombre: page.properties.Nombre.title[0]?.text?.content || "",
        correo: page.properties.Correo.email || "",
        telefono: page.properties.Teléfono.phone_number || "",
        linkedin: page.properties.LinkedIn.url || "",
        fecha: page.properties.Fecha?.date?.start || page.created_time
      };
    });

    res.status(200).json(contactos);
  } catch (error) {
    console.error("Error al obtener contactos:", error.message);
    res.status(500).json({ error: "No se pudieron obtener los contactos" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});