
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import DoneIcon from '@mui/icons-material/Done';
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Fab } from "@mui/material";
import { Zoom } from "@mui/material";

function EditArea(props) {
  const empty = { id : "", title: "", content: "" };
  const [note, setNote] = useState(props.note);

  function handleChange(event) {
    const { name, value } = event.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  }

  async function submitNote(event) {
    event.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_PORT_URL}/note/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      props.changeMode();
      setNote(empty);
    } catch (err) {
      console.error(err.message);
    }
  }


  return (
    <div>
      <form className="create-note">
          <input
            name="title"
            onChange={handleChange}
            placeholder="Title"
            value={note.title}
          />
        <textarea
          name="content"
          onChange={handleChange}
          placeholder="Take a note..."
          rows={3}
          value={note.content}
        />
          <Fab onClick={submitNote}>
            <DoneIcon />
          </Fab>
      </form>
    </div>
  );
}

export default EditArea;