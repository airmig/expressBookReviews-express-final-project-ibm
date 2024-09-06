const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function findBooksByCriteria(books, criteria) {
  let result = [];
  for (let key in books) {
      let match = true;
      for (let [keyCriteria, valueCriteria] of Object.entries(criteria)) {
          if (books[key][keyCriteria].toLowerCase() !== valueCriteria.toLowerCase()) {
              match = false;
              break;
          }
      }
      if (match) {
          result.push(books[key]);
      }
  }
  return result; // Return an array of books that match all criteria
}

public_users.post("/register", (req,res) => {
  //Write your code here
  let username = req.body.username;
  let password = req.body.password;
  if (!username)
    return res.status(400).json({message: "username is required" });
  if (!password)
    return res.status(400).json({message: "password is required"});

  let found_user = users.find(user => user.username == username);
  if (found_user)
    return res.status(400).json({message: "username already taken"})
  
  users.push({"username": username, "password": password})

  return res.status(201).json({message: "user account created"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).json({books});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  let criteria = {'isbn': isbn}
  let result = findBooksByCriteria(books, criteria);
  if (result.length == 0)
    return res.status(404).json({message: "ISBN not found."});
  return res.status(200).json({result});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  let author = req.params.author;
  let criteria = {'author': author}
  let result = findBooksByCriteria(books, criteria);
  if (result.length == 0)
    return res.status(404).json({message: "Author not found."});
  return res.status(200).json({result});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  let title = req.params.title;
  let criteria = {'title': title}
  let result = findBooksByCriteria(books, criteria);
  if (result.length == 0)
    return res.status(404).json({message: "Title not found."});
  return res.status(200).json({result});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  let criteria = {'isbn': isbn}
  let result = findBooksByCriteria(books, criteria);
  if (result.length == 0)
    return res.status(404).json({message: "ISBN not found."});
  const hasReviews = result[0]?.reviews?.data !== undefined;
  if (!hasReviews)
    return res.status(404).json({message: "Book does not have any reviews."});
  let reviews = result[0].reviews.data;
  return res.status(200).json({reviews});
 });

module.exports.general = public_users;
module.exports.findBooksByCriteria = findBooksByCriteria;
