# appController.js

exports.getIndex = (req, res) => {
  res.status(200).send('Welcome to SecureApp API');
};

exports.postData = (req, res) => {
  // Handle POST data
  res.status(201).json({ message: 'Data received', data: req.body });
};