import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckIcon,
  Flag as PriorityIcon,
  Event as DateIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  property?: { id: string; title: string };
  client?: { id: string; firstName: string; lastName: string };
}

const priorityColors: Record<string, string> = {
  LOW: 'var(--text-tertiary)',
  MEDIUM: 'var(--info-color)',
  HIGH: 'var(--primary)',
  URGENT: 'var(--danger-color)',
};

// --- MOCK DATA ---
const MOCK_TASKS: Task[] = [
  {
    id: '1', title: 'Relancer M. Dupont pour le compromis', description: 'Appeler avant 14h',
    status: 'PENDING', priority: 'URGENT', dueDate: '2024-03-21T10:00:00',
    property: { id: '1', title: 'Villa Cannes' }
  },
  {
    id: '2', title: 'Préparer dossier visite Loft',
    status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2024-03-22T09:00:00',
    property: { id: '4', title: 'Loft Nice' }
  },
  {
    id: '3', title: 'Envoyer estimation Weber',
    status: 'COMPLETED', priority: 'MEDIUM', dueDate: '2024-03-20T16:00:00',
    client: { id: 'c3', firstName: 'Marc', lastName: 'Weber' }
  }
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    // Simulate Fetch
    setTimeout(() => {
      setTasks(MOCK_TASKS);
      setLoading(false);
    }, 800);
  }, []);

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' };
      }
      return t;
    }));
  };

  const filteredTasks = tasks.filter(t => filterStatus === 'ALL' || (filterStatus === 'COMPLETED' ? t.status === 'COMPLETED' : t.status !== 'COMPLETED'));

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress sx={{ color: 'var(--primary)' }} />
    </Box>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <TaskIcon fontSize="small" /> Productivité
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Tâches</h1>
        </div>
        <div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
          >
            Nouvelle Tâche
          </Button>
        </div>
      </div>

      {/* FILTER TABS */}
      <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={filterStatus} onChange={(_e, v) => setFilterStatus(v)} textColor="primary" indicatorColor="primary">
          <Tab label="À faire" value="ALL" sx={{ textTransform: 'none', fontSize: '1rem', fontWeight: 500 }} />
          <Tab label="Terminées" value="COMPLETED" sx={{ textTransform: 'none', fontSize: '1rem', fontWeight: 500 }} />
        </Tabs>
      </Box>

      {/* TASK LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="glass-panel"
            style={{
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: '24px',
              opacity: task.status === 'COMPLETED' ? 0.6 : 1,
              transition: 'all 0.3s'
            }}
          >
            {/* Checkbox */}
            <div onClick={() => toggleTaskStatus(task.id)} style={{ cursor: 'pointer', color: task.status === 'COMPLETED' ? 'var(--success-color)' : 'var(--text-tertiary)' }}>
              {task.status === 'COMPLETED' ? <CheckIcon fontSize="large" /> : <UncheckIcon fontSize="large" />}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                  {task.title}
                </h3>
                {task.priority === 'URGENT' && (
                  <Chip label="URGENT" size="small" sx={{ bgcolor: 'var(--danger-color)', color: '#fff', fontSize: '0.7rem', height: 20 }} />
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {task.dueDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'var(--danger-color)' : 'inherit' }}>
                    <DateIcon fontSize="inherit" /> {format(new Date(task.dueDate), 'd MMM HH:mm', { locale: fr })}
                  </span>
                )}
                {task.property && (
                  <span>• {task.property.title}</span>
                )}
              </div>
            </div>

            {/* Priority Indicator */}
            <div style={{ color: priorityColors[task.priority] }}>
              <PriorityIcon />
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
