// src/components/Main.jsx
import "../index.css"
import '../index.css';
import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import EditArea from "./EditArea";
import { useCookies } from "react-cookie";

function Main() {
  const [cookie, setCookie, removeCookie] = useCookies(null);
  const authToken = cookie.AuthToken;
  const id = cookie.User;
  const email = cookie.Email;

  const [EditNote, setEditNote] = useState({ id: "", title: "", content: "" });
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState([]);

  function addItem(note) {
    setNotes((prev) => [...prev, note]);
  }

  async function deleteItem(id) {
    try {
      await fetch(`${process.env.REACT_APP_PORT_URL}/note/${id}`, { method: "DELETE" });
      getNotes();
    } catch (err) {
      console.log(err);
    }
  }

  const getNotes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_PORT_URL}/notes/${id}`);
      const jsonData = await response.json();
      setNotes(jsonData);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => { if (authToken) getNotes() }, [authToken]);

  function changeMode() {
    setEditMode(prev => !prev);
    setEditNote({ id: "", title: "", content: "" });
    getNotes();
  }

  function handleEdits(note) {
    setEditNote(note);
    setEditMode(prev => !prev);
  }

  return (
    <div>
      {editMode ? <EditArea changeMode={changeMode} note={EditNote} /> : <CreateArea addItem={addItem} user={id} />}
      <div className="notes-container">
        {notes.map((item, index) => (
          <Note
            handleEdits={handleEdits}
            deleteItem={deleteItem}
            key={index}
            id={item.id}
            title={item.title}
            content={item.content}
          />
        ))}
      </div>
      <br />
      <br />
      <Footer />
    </div>
  );
}

export default Main;
