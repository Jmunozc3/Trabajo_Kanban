import { MongoClient, Db, Collection, ObjectId } from "mongodb";

//Conexion a base de datos

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGO_URL = Deno.env.get("MONGO_URL");
const DB_NAME = "boardlock";

export interface Task {
  _id?: ObjectId;
  title: string;
  description: string;
  status: string;          
  createdAt: Date;
}

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  role: string;            
}

export async function connectDB(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);

  console.log("✅ Conectado a MongoDB");
  return db;
}

export function tasksCol(): Collection<Task> {
  if (!db) throw new Error("Database not connected");
  return db.collection<Task>("tasks");
}


