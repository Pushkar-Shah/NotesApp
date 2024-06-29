/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Fab } from "@mui/material";
import { Zoom } from "@mui/material";

function CreateArea(props) {
  const [isZoom, setZoom] = useState(false);
  const empty = { title: "", content: "" };
  const [note, setNote] = useState(empty);

  function handleChange(event) {
    const { name, value } = event.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  }

  async function submitNote(event) {
    event.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_PORT_URL}/newNote/${props.user}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      setZoom(false);
      props.addItem(await response.json());
      setNote(empty);
    } catch (err) {
      console.error(err.message);
    }
  }

  function handleClick() {
    setZoom(true);
  }

  return (
    <div>
      <form className="create-note">
        {isZoom && (
          <input
            name="title"
            onChange={handleChange}
            placeholder="Title"
            value={note.title}
          />
        )}
        <textarea
          name="content"
          onChange={handleChange}
          onClick={handleClick}
          placeholder="Take a note..."
          rows={isZoom ? 3 : 1}
          value={note.content}
        />
        <Zoom in={isZoom}>
          <Fab onClick={submitNote}>
            <AddIcon />
          </Fab>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;
