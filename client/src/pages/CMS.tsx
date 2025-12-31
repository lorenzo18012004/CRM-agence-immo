import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cms-tabpanel-${index}`}
      aria-labelledby={`cms-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CMS() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">CMS - Gestion du contenu</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          {value === 0 ? 'Nouvelle page' : 'Nouvel article'}
        </Button>
      </Box>

      <Paper>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Pages" />
          <Tab label="Articles" />
        </Tabs>
        <TabPanel value={value} index={0}>
          <Typography>Gestion des pages du site web</Typography>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Typography>Gestion des articles/blog</Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
}

