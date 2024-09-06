const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

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

const isValid = (username)=>{ //returns boolean
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }
  // Authenticate user
  if (authenticatedUser(username, password)) {
      // Generate JWT access token
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });
      // Store access token and username in session
      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  let isbn = req.params.isbn;
  let user = req.session?.authorization?.username;
  let review = req.query.review;
 
  if (!user)
    return res.status(400).json({'message': 'Not logged in'});

  if (!review)
    return res.status(400).json({'message': 'missing review query parameter'});

  //find book
  let criteria = {'isbn': isbn}
  let book = findBooksByCriteria(books, criteria)
  if (book.length == 0)
    return res.status(404).json({'message': 'Book not found'});

  let reviews = book[0].reviews?.data;
  if (reviews){
    user_review = reviews.filter(item=>item.user == user);
    if (user_review.length > 0)
      user_review[0].review = review;
    else {
      let review_record = {'user': user, 'review': review};
      book[0].reviews.data.push(review_record);
    }
  }
  else{
    let review_record = {'user': user, 'review': review};
    book[0].reviews.data = [];
    book[0].reviews.data.push(review_record);
  }
  return res.status(201).json({message: "Review added"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let user = req.session?.authorization?.username;

  if (!user)
    return res.status(400).json({'message': 'Not logged in'});

  //find book
  let criteria = {'isbn': isbn}
  let book = findBooksByCriteria(books, criteria)
  if (book.length == 0)
    return res.status(404).json({'message': 'Book not found'});

  let reviews = book[0].reviews?.data;
  if (reviews){
    deleted_reviews = reviews.filter(item=>item.user != user);
    book[0].reviews.data = deleted_reviews;
    return res.status(200).json({'message': 'review deleted'});
  }
  else {
    return res.status(400).json({'message': 'Book has no reviews nothing to delete'});
  }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
