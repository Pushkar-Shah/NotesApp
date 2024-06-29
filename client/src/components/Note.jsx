// src/components/Note.jsx

import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import { Box, Typography } from '@mui/material';

function Note({
  id,
  title,
  content,
  handleEdits,
  deleteItem,
  summarizeNote,
  searchNote,
}) {
  const [openSummary, setOpenSummary] = React.useState(false);
  const [summary, setSummary] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleOpenSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_PORT_URL}/summarize`,{
        method : 'POST',
        headers : {'Content-type' : 'application/json'},
        body : JSON.stringify({content : content})})
        
      const jsonData = await response.json();
      setSummary(jsonData.summary);
      setOpenSummary(true);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSummary = () => {
    setOpenSummary(false);
  };

  const handleSearch = () => {
    searchNote(title);
  };

  return (
    <div className="note">
      <h1>{title}</h1>
      <p>{content}</p>
      
      <IconButton aria-label="delete" onClick={() => deleteItem(id)} size="small">
        <DeleteIcon fontSize="small" />
      </IconButton>
      <IconButton aria-label="Edit" onClick={() => handleEdits({ id, title, content })} size="small">
        <EditNoteIcon fontSize="small" />
      </IconButton>
      <Button variant="outlined" onClick={handleOpenSummary} disabled={loading}>
        {loading ? 'Loading...' : 'Summarize'}
      </Button>
      {false && <Button variant="outlined" onClick={handleSearch}>
        Search
      </Button>}

      <Modal
        open={openSummary}
        onClose={handleCloseSummary}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'white', boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Summary
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {summary || 'Loading summary...'}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}

export default Note;
