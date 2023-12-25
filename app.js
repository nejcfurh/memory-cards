'use strict';

// modules

const username = require(__dirname + "/auth.js").username;
const password = require(__dirname + "/auth.js").password;

// console.log(password, username);

const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js'); // our own module
const mongoose = require('mongoose');
const _ = require('lodash');

const day = date.getDate();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

main().catch(err => console.log(err));

async function main() {
  mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.06chanb.mongodb.net/CardsDB`, {useNewUrlParser: true});
}

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Successfully connected to MongoDB');
});

// CARDS SCHEMA

const cardSchema = {
  name: {
    required: true,
    type: String
  },
  url: {
    required: true,
    type: String
  },
  body: {
    required: false,
    type: String
  }
};

const Card = mongoose.model('card', cardSchema);

const card1 = new Card({
  name: "Chicago",
  url: `../photos/image1.jpg`,
  body: "Chicago skyline is one of the best in the world!"
})

const card2 = new Card({
  name: "Home",
  url: `../photos/image2.jpg`,
  body: "Calling a house home is fulfiling!"
})

const card3 = new Card({
  name: "School",
  url: `../photos/image3.jpg`,
  body: "Going to school is the best time you will ever have!"
})

const card4 = new Card({
  name: "Bali",
  url: `../photos/image4.jpg`,
  body: "Bali is nice every season of the year!"
})

const defaultCards = [card1, card2, card3, card4];

// Save initial array of cards to DB!

// defaultCards.map((card) => {
//   db.collection('cards').insertOne(card, (err, result) => {
//     if (err) return console.log(err)
//     console.log('Saved to database')
//   })
// });

// RENDERING THE LIST OF CARDS from DB

app.get("/", function(req, res) {
  Card.find({})
    .then(cards => 
      {
        if(cards.length === 0)
        {
          Card.insertMany(defaultCards)
          .then(function() {
            console.log("Filled cards with defaultCards");
          })
          .catch(function(err) {
            console.log(err);
          });
        res.redirect("/");   
        } else {
          res.render("list", {cardItems: cards});
        }
      })
    .catch(err => console.error(err, "insert default"));
});

// ADDING A CARD TO DB

app.post("/", function(req, res) {
  try {
    const newCard = new Card({
      name: req.body.cardName,
      url: req.body.cardImg,
      body: req.body.cardBody,
      })
    db.collection('cards').insertOne(newCard)
    console.log("Card added to collection!")
    res.redirect("/")
  } catch (err) {
    console.log(err)
    res.redirect("/")
  }
});

// DELETING A CARD FROM DB

app.post("/delete", function(req,res){
  const cardID = req.body;
  const cardToDelete = mongoose.Types.ObjectId.createFromHexString(cardID.card)
  Card.findByIdAndRemove(cardToDelete)
    .then(function() {
      console.log("Card sucessfully removed");
      res.redirect("/");
    })
    .catch(function(err){
      console.log("Card could not be deleted!", err);
    }); 
});

// RENDERING THE ABOUT ME PAGE

const aboutContent =
  `I'm a dedicated Junior Software Engineer eager to contribute my skills to innovative projects. 
  
  With a solid foundation in mostly JavaScript (EJS, jQuerry, Node.JS, React.JS), and HTML/CSS coupled with my hands-on experience in building web applications and exploring emerging technologies, I'm excited about the opportunity to collaborate and learn from experienced professionals in the field.

  I am proactive, detail-oriented, and committed to continuous improvement.`

app.get("/contact", function(req, res){
  res.render("contact", {about: aboutContent});
});

// RENDERING INFO PAGE

const aboutAppContent =
  `This is a an app that mostly uses CSS/HTML and EJS for the front-end, uses Node.JS & Express.JS as a back-end, and MongoDB as a database.
  
  Basic Express.JS is used for connection with the MongoDB database, that stores Image links (except the default items, which are stored locally), image titles and image descriptions!
  
  To display the photos, HTML <input type="radio"> is used. App extensivelly uses flexbox CSS.
  
  I am using free Unsplash.com stock images.`

app.get("/about", function(req, res){
  res.render("about", {aboutApp: aboutAppContent});
});

// SERVER RUNNING LOG
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
