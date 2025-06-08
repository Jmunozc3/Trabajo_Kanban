import { Handlers } from "$fresh/server.ts";
import { connectDB, tasksCol } from "../../utils/db.ts";
import { ObjectId } from "mongodb";

//Pasamos el _id de ObjectID a un String para estandarizar los datos
function toClient<T extends { _id?: unknown }>(doc: T | null): T | null {
  if (doc && doc._id) (doc as any)._id = String(doc._id);
  return doc;
}

export const handler: Handlers = {
  //Metodo get 
  async GET() {
    try {
      await connectDB();
      const tasks = await tasksCol().find({}).toArray();

      return Response.json(tasks.map(toClient));

    } catch (err) {
      
      return Response.json({ error: "Error obteniendo tareas" }, { status: 500 });
    }
  },
 //Metodo Post
  async POST(req) {
    try {
      const { title = "", description = "" } = await req.json();
      if (!title.trim()) {return Response.json({ error: "Título requerido" }, { status: 400 });}

      await connectDB();
      const { insertedId } = await tasksCol().insertOne({
        title,
        description,
        status: "Backlog",
        createdAt: new Date(),
      });

      const created = await tasksCol().findOne({ _id: insertedId });
      return Response.json(toClient(created));

    } catch (err) {
      
      return Response.json({ error: "Error creando tarea" }, { status: 500 });
    }
  },
 //Metodo Put
  async PUT(req) {
    try {
      const { id, ...fields } = await req.json();
      if (!id) {return Response.json({ error: "ID requerido" }, { status: 400 });}

      await connectDB();
      await tasksCol().updateOne({ _id: new ObjectId(id) }, { $set: fields },);

      const updated = await tasksCol().findOne({ _id: new ObjectId(id) });
      return Response.json(toClient(updated));

    } catch (err) {

      return Response.json({ error: "Error actualizando tarea" }, { status: 500 });
    }
  },
 //Metodo Delete
  async DELETE(req) {
    try {
      const id = new URL(req.url).searchParams.get("id");
      if (!id) {return Response.json({ error: "ID requerido" }, { status: 400 });}

      await connectDB();
      await tasksCol().deleteOne({ _id: new ObjectId(id) });
      return Response.json({ success: true });

    } catch (err) {

      return Response.json({ error: "Error eliminando tarea" }, { status: 500 });
    }
  },
};
