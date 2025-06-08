import { useState, useEffect } from "preact/hooks";

interface Task {
  _id: string;          
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface User {
  name: string;
  email: string;
  role: string;
}

const statuses = ["Backlog", "To Do", "In Progress", "Review", "Done"];

const LoginForm = ({ onLogin }: { onLogin: (user: User) => void }) => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      setError("Todos los campos son requeridos");
      return;
    }

    onLogin(formData);
  };

  return (

    //Aqui se muestra el login

    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div class="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <img
            src="/images/BoardLock.png"
            alt="BoardLock Logo"
            class="w-20 h-20 mx-auto mb-4 rounded-xl"
          />
          <p class="text-gray-600 mt-2">Introduce tus datos</p>
        </div>

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"> Nombre </label>
            <input type="text" value={formData.name} onInput={(e) => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"/>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"> Email </label>
            <input type="email" value={formData.email} onInput={(e) => setFormData({ ...formData, email: (e.target as HTMLInputElement).value })} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"> Rol </label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: (e.target as HTMLSelectElement).value })}class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">Selecciona tu rol</option>
              <option value="developer">Desarrollador</option>
              <option value="scrum-master">Scrum Master</option>
              <option value="product-owner">Product Owner</option>
            </select>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="submit" class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"> Iniciar Sesión </button>
            <button type="button" onClick={() => setFormData({ name: "", email: "", role: "" })} class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"> Limpiar</button>
          </div>

          {error && (<div class="text-red-600 text-sm mt-2 text-center">{error}</div>)}
        </form>
      </div>
    </div>
  );
};

{/* Funcion para todo el tablero kanban, dentro cargaremos las tareas de BD y añadiermos nuevas tareas */}
const KanbanBoard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        setShowTaskForm(false);
        setNewTaskTitle("");
        setNewTaskDescription("");
      }
    } catch (error) {
      console.error("Error creando tarea:", error);
    }
  };

  const handleEditTask = async (id: string, title: string, description: string) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, description }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          task._id === id ? updatedTask : task
        ));
      }
    } catch (error) {
      console.error("Error editando tarea:", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta tarea?")) return;

    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task._id !== id));
      }
    } catch (error) {
      console.error("Error eliminando tarea:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          task._id === id ? updatedTask : task
        ));
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const handleDragStart = (e: DragEvent, id: string) => {
    if (user.role === "developer") return;
    e.dataTransfer?.setData("text/plain", id);
  };

  const handleDrop = (e: DragEvent, status: string) => {
    if (user.role === "developer") return;
    e.preventDefault();
    const id = e.dataTransfer?.getData("text/plain");
    if (id) {
      handleStatusChange(id, status);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const saveEditedTask = () => {
    if (editingTaskId !== null) {
      handleEditTask(editingTaskId, editTitle, editDescription);
      setEditingTaskId(null);
    }
  };

  const canCreate = user.role === "scrum-master";
  const canMove = user.role === "scrum-master" || user.role === "product-owner";
  const canEditDelete = user.role === "scrum-master";

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'developer': return 'bg-green-100 text-green-800';
      case 'scrum-master': return 'bg-purple-100 text-purple-800';
      case 'product-owner': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'developer': return 'Desarrollador';
      case 'scrum-master': return 'Scrum Master';
      case 'product-owner': return 'Product Owner';
      default: return role;
    }
  };

 


  if (loading) {
    return (
      <div class="min-h-screen flex items-center justify-center"> <div class="text-xl">Cargando...</div></div>
    );
  }

  return (
    <div class="min-h-screen bg-gray-50">
      
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              
              <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><span class="text-white text-sm font-bold">BL</span>
              </div>
              <div>
                <h1 class="text-xl font-semibold text-gray-900"> Hola, {user.name}!</h1>
                <span class={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>{getRoleName(user.role)}</span>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              {canCreate && (
                <button onClick={() => setShowTaskForm(!showTaskForm)}class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">Nueva Tarea </button>
              )}
              <button onClick={onLogout} class="text-gray-600 hover:text-gray-800 transition-colors"> Cerrar Sesión </button>
            </div>
          </div>
        </div>
      </header>

      {/* Formulario para crear una nueva tarea */}

      {showTaskForm && canCreate && (
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Crear Nueva Tarea</h3>
            <div class="space-y-4">
              <input type="text" placeholder="Nombre de la tarea" value={newTaskTitle} onInput={(e) => setNewTaskTitle((e.target as HTMLInputElement).value)} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              <textarea placeholder="Descripción"value={newTaskDescription} onInput={(e) => setNewTaskDescription((e.target as HTMLTextAreaElement).value)} rows={3} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              <div class="flex space-x-3">
                <button onClick={handleCreateTask} class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"> Añadir Tarea</button>
                <button onClick={() => setShowTaskForm(false)} class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"> Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tablero Kanban */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statuses.map((status) => (
            <div key={status} class="bg-gray-100 rounded-lg p-4 min-h-96" onDrop={canMove ? (e) => handleDrop(e, status) : undefined} onDragOver={canMove ? handleDragOver : undefined}>
              <h3 class="font-semibold text-gray-800 mb-4 text-center"> {status} </h3>
              <div class="space-y-3">
                {tasks.filter((task) => task.status === status)
                  .map((task) => (
                    <div key={task._id} draggable={canMove} onDragStart={canMove ? (e) => handleDragStart(e, task._id) : undefined} class={`bg-white rounded-lg p-4 shadow-sm border ${canMove ? 'cursor-move' : 'cursor-default'} hover:shadow-md transition-shadow`}>
                      {editingTaskId === task._id ? (

                        <div class="space-y-3">
                          <input type="text" value={editTitle}  onInput={(e) => setEditTitle((e.target as HTMLInputElement).value)} class="w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
                          <textarea value={editDescription} onInput={(e) => setEditDescription((e.target as HTMLTextAreaElement).value)} rows={2} class="w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
                          
                          <div class="flex space-x-2">
                            <button onClick={saveEditedTask} class="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"> Guardar</button>
                            <button onClick={() => setEditingTaskId(null)} class="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500" >Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 class="font-medium text-gray-900 mb-2"> {task.title} </h4>
                          <p class="text-sm text-gray-600 mb-3"> {task.description} </p>
                          {canEditDelete && (
                            <div class="flex space-x-2">
                              <button onClick={() => startEditingTask(task)} class="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"> Editar</button>
                              <button onClick={() => handleDeleteTask(task._id)} class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function BoardLock() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verifica si hay una sesión activa en local de almacenamiento
    const savedUser = localStorage.getItem('boardlock_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('boardlock_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('boardlock_user');
  };

  return (
    <div>
      {!isLoggedIn ? (<LoginForm onLogin={handleLogin} />) : (
        user && <KanbanBoard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}