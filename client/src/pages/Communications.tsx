import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  MoreVert as MoreIcon,
  Phone as PhoneIcon,
  VideoCall as VideoIcon,
  AttachFile as AttachIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

interface Conversation {
  id: string;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
  status: 'online' | 'offline';
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', contactName: 'Jean Dupont', lastMessage: 'Merci pour la visite !', timestamp: '2024-03-21T10:30:00', unreadCount: 2, status: 'online' },
  { id: '2', contactName: 'Sophie Martin', lastMessage: 'Je vous envoie le dossier ce soir.', timestamp: '2024-03-20T18:45:00', unreadCount: 0, status: 'offline' },
  { id: '3', contactName: 'Notaire Maître Lambert', lastMessage: 'Le compromis est prêt.', timestamp: '2024-03-19T09:15:00', unreadCount: 0, status: 'online' },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', senderId: 'c1', content: 'Bonjour, avez-vous des nouvelles pour la Villa ?', timestamp: '2024-03-21T10:15:00', isMe: false },
  { id: '2', senderId: 'me', content: 'Bonjour Jean, oui le vendeur a accepté votre offre !', timestamp: '2024-03-21T10:20:00', isMe: true },
  { id: '3', senderId: 'c1', content: 'C\'est une excellente nouvelle ! Merci pour tout.', timestamp: '2024-03-21T10:25:00', isMe: false },
  { id: '4', senderId: 'c1', content: 'Quand pouvons-nous signer ?', timestamp: '2024-03-21T10:30:00', isMe: false },
];

export default function Communications() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setConversations(MOCK_CONVERSATIONS);
      setMessages(MOCK_MESSAGES);
      setLoading(false);
    }, 800);
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isMe: true
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress sx={{ color: 'var(--primary)' }} />
    </Box>
  );

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', gap: '24px', paddingBottom: '24px' }}>

      {/* LEFT: CONVERSATION LIST */}
      <div className="glass-panel" style={{ width: '350px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }} className="font-serif">Messages</h2>
            <IconButton size="small" sx={{ color: 'var(--primary)' }}><AddIcon /></IconButton>
          </div>
          <TextField
            placeholder="Rechercher..."
            size="small" fullWidth
            InputProps={{ startAdornment: <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} /> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.5)' } }}
          />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <List>
            {conversations.map((conv) => (
              <ListItem
                key={conv.id}
                button
                selected={selectedId === conv.id}
                onClick={() => setSelectedId(conv.id)}
                sx={{
                  py: 2, px: 3,
                  borderLeft: selectedId === conv.id ? '4px solid var(--primary)' : '4px solid transparent',
                  bgcolor: selectedId === conv.id ? 'rgba(15, 23, 42, 0.04)' : 'transparent'
                }}
              >
                <ListItemAvatar>
                  <Badge
                    color="success" variant="dot" invisible={conv.status === 'offline'}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar sx={{ bgcolor: 'var(--primary-light)' }}>{conv.contactName[0]}</Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{conv.contactName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{format(new Date(conv.timestamp), 'HH:mm')}</span>
                    </div>
                  }
                  secondary={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                        {conv.lastMessage}
                      </span>
                      {conv.unreadCount > 0 && (
                        <Badge badgeContent={conv.unreadCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: 18, minWidth: 18 } }} />
                      )}
                    </div>
                  }
                />
              </ListItem>
            ))}
          </List>
        </div>
      </div>

      {/* RIGHT: CHAT WINDOW */}
      <div className="glass-panel" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Avatar sx={{ bgcolor: 'var(--primary-light)' }}>J</Avatar>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>Jean Dupont</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success-color)' }}></span> En ligne
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <IconButton><PhoneIcon color="action" /></IconButton>
            <IconButton><VideoIcon color="action" /></IconButton>
            <IconButton><MoreIcon color="action" /></IconButton>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(241, 245, 249, 0.5)' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ alignSelf: msg.isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: msg.isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                background: msg.isMe ? 'var(--primary)' : '#fff',
                color: msg.isMe ? '#fff' : 'var(--text-primary)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                {msg.content}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', textAlign: msg.isMe ? 'right' : 'left' }}>
                {format(new Date(msg.timestamp), 'HH:mm')}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <IconButton color="primary"><AttachIcon /></IconButton>
          <TextField
            placeholder="Écrivez votre message..."
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            variant="outlined"
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px' } }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            sx={{ bgcolor: 'var(--primary)', color: '#fff', '&:hover': { bgcolor: 'var(--primary-dark)' } }}
          >
            <SendIcon />
          </IconButton>
        </div>

      </div>

    </div>
  );
}
