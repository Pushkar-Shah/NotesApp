import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt, { compareSync } from "bcrypt";
import env from "dotenv";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import {OpenAIApi }from 'openai';
import axios from "axios";

const app = express();
const PORT = 8000;
app.use(cors());
const saltRounds = 10;
env.config();

// OpenAI API setup
const openai = new OpenAIApi({
  apiKey: "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", // This is also the default, can be omitted
});

app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const pool = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
pool.connect();

// Summarize note
app.post("/summarize", async (req, res) => {
  const { content } = req.body;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{"role": "user", "content":` Please summarize the following text:\n\n${content}`}],
    });

    const summary = chatCompletion.choices[0].message.content.trim();
    console.log("Request Success");
    // console.log(summary);
    res.json({ summary });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      // console.log(error.status);  // e.g. 401
      // console.log(error.message); // e.g. The authentication token you passed was invalid...
      // console.log(error.code);    // e.g. 'invalid_api_key'
      // console.log(error.type);    // e.g. 'invalid_request_error'
    } else {
      // console.log(error);
    }
    res.status(500).send("Error summarizing text");
  }
});

// ... Other routes ...


// Get all notes for a specific user
app.get("/notes/:id", async (req, res) => {
  const user_id = req.params.id;
  try {
    const notes = await pool.query("SELECT * FROM notes WHERE user_id = $1", [user_id]);
    res.json(notes.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).send("Oops, something went wrong");
  }
});

// Create a new note
app.post("/newNote/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { title, content } = req.body;
  try {
    const note = await pool.query("INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *", [title, content, user_id]);
    res.json(note.rows[0]);
  } catch (err) {
    console.error('Error adding note:', err);
    res.status(500).send("Oops, something went wrong");
  }
});

// Update a note
app.patch("/note/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const prev = (await pool.query("SELECT title, content FROM notes WHERE id = $1", [id])).rows[0];
    const updatedNote = await pool.query("UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING title, content", [
      title || prev.title,
      content || prev.content,
      id
    ]);
    res.json(updatedNote.rows[0]);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).send("Oops, something went wrong");
  }
});

// Delete a note
app.delete("/note/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM notes WHERE id = $1", [id]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).send("Oops, something went wrong");
  }
});

// // Summarize a note using ChatGPT API
// app.get('/summarize/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { rows } = await pool.query('SELECT content FROM notes WHERE id = $1', [id]);
//     const content = rows[0].content;

//     // Make API call to ChatGPT for summarization
//     const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
//       prompt: content,
//       max_tokens: 100,
//       stop: ['\n', '.']
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
//       }
//     });

//     const summary = response.data.choices[0].text.trim();
//     res.json({ summary });
//   } catch (error) {
//     console.error('Error summarizing note:', error);
//     res.status(500).send('Error summarizing note');
//   }
// });


// Search notes by content using ChatGPT API
app.get("/search", async (req, res) => {
  const { term } = req.query;
  try {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci/search', {
      documents: [{ text: term }],
      query: term
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const searchResults = response.data.data.map(result => ({
      title: "Search Result",
      content: result.text
    }));

    res.json(searchResults);
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).send("Oops, something went wrong");
  }
});

// Authentication endpoints (login and signup)
// Implement your existing authentication logic here...

// console.log(app.listen(PORT, () => `Server running on Port ${PORT}`));


// Auth 

// login

app.post('/login', async(req,res)=>{
  const {email,password} = req.body;
//   const hashedPassword = bcrypt.hashSync(password,saltRounds);
  try {
          const user = await pool.query(`SELECT * FROM users WHERE email = $1`,[email]);
          if (!user.rows.length){
                return res.json({detail : 'User does not exist!'});
        }
        //   console.log(user.rows[0]);
        //   console.log(hashedPassword === user.rows[0].password);
          const success = await bcrypt.compare(password,user.rows[0].password);
          const authToken = jwt.sign({email},'secret',{expiresIn : '1 hr'});
          const id = await user.rows[0].id;
          const username = "Back "+ await user.rows[0].username;
        //   console.log(user.rows);
        //   console.log(id);
          if(success){
                  res.json({ email : email , authToken : authToken, id : id, username : username})
          }
          else{
                  res.json({detail : 'Password is Incorrect'});
          }
  } catch (error) {
          console.log(error);
  }
})

// signup

app.post('/signup', async(req,res)=>{
  const {email,password,username} = req.body;
//   console.log(req.body);
//   console.log(`Email: ${email} & Password: ${password}`);
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password,salt);
  try {
         const response = await pool.query(`INSERT INTO users (email,password,username) VALUES ($1,$2,$3) RETURNING *`,[email,hashedPassword,username]);
         const authToken = jwt.sign({email},'secret',{expiresIn : '1 hr'});
         const id = await response.rows[0].id;
         console.log(response.rows);
         console.log(id);
         const usernam = await response.rows[0].username;
         res.json({email,authToken,id,username : usernam});
  } catch (error) {
          console.log(error);
          if (error){
                  res.json({detail : error.detail})
          }
  }
  
});

// Google Auth --> 

app.post("/auth/google", async (req,res)=>{
        const {email,password,username} = req.body;
//   const hashedPassword = bcrypt.hashSync(password,saltRounds);
  try {
          const user = await pool.query(`SELECT * FROM users WHERE email = $1`,[email]);
          if (!user.rows.length){
                // then we have to add a user 
                const response = await pool.query(`INSERT INTO users (email,password,username) VALUES ($1,$2,$3) RETURNING *`,[email,'GoogleAuth',username]);
                const authToken = jwt.sign({email},'secret',{expiresIn : '1 hr'});
                const id = await response.rows[0].id;
                console.log(response.rows);
                console.log(id);
                const usernam = await response.rows[0].username;
                res.json({email,authToken,id,username : usernam});

        }else{
                const authToken = jwt.sign({email},'secret',{expiresIn : '1 hr'});
                const id = await user.rows[0].id;
                const usernam = "Back "+ await user.rows[0].username;
                res.json({email,authToken,id,username : usernam});
        }
        //   console.log(user.rows[0]);
        //   console.log(hashedPassword === user.rows[0].password);
          
        //   console.log(user.rows);
        //   console.log(id)
  } catch (error) {
          console.log(error);
  }

})

// app.get(
//         "/auth/google",
//         passport.authenticate("google", {
//           scope: ["profile", "email"],
//         })
// );
// app.get(
//         "/auth/google/done",
//         passport.authenticate("google", {
//         successRedirect : "/success",
//         failureRedirect : "/"
//         })
// );

// app.get('/success', async (req, res) =>{
//         console.log(req.user);
//         const {email,id}  = req.user;
//         const authToken = jwt.sign({email},'secret',{expiresIn : '1 hr'});
//         res.json({email,authToken,id});
// });



// passport.use(
//         "google",
//         new GoogleStrategy(
//           {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: "http://localhost:8000/success",
//             userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
//           },
//           async (accessToken, refreshToken, profile, cb) => {
//             try {
//               console.log(profile);
//               const result = await db.query("SELECT * FROM users WHERE email = $1", [
//                 profile.email,
//               ]);
//               if (result.rows.length === 0) {
//                 const newUser = await db.query(
//                   "INSERT INTO users (email, password) VALUES ($1, $2)",
//                   [profile.email, "google"]
//                 );
//                 return cb(null, newUser.rows[0]);
//               } else {
//                 return cb(null, result.rows[0]);
//               }
//             } catch (err) {
//               return cb(err);
//             }
//           }
//         )
//       );
// passport.serializeUser((user, cb) => {
//         cb(null, user);
//       });
      
// passport.deserializeUser((user, cb) => {
//         cb(null, user);
//       });


      




app.listen(PORT,()=> `Server running on Port ${PORT}`);