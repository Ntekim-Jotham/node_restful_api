/*
*Main file for the API
*
*/

// Dependencies
let http = require('http');
let https = require('https');
let url = require('url');
let stringDecoder = require('string_decoder').StringDecoder;
let config = require('./config');
let fs = require('fs');

// Instantiate the HTTP server
let httpServer = http.createServer(function(req,res) {
   unifiedServer(req, res);
});

// Start the server and have it listen on port 3000
httpServer.listen(config.httpPort, function() {
  console.log("The server is listening on port: " +config.httpPort);
});

// Instantiate the HTTPS server
let httpsServerOptions = {
   'key' : fs.readFileSync('./https/key.pem'),
   'cert': fs.readFileSync('./https/cert.pem')
};
let httpsServer = https.createServer(httpsServerOptions, function(req,res) {
   unifiedServer(req, res);
});

// Start the server and have it listen on port 3000
httpsServer.listen(config.httpsPort, function() {
  console.log("The server is listening on port: " +config.httpsPort);
});

//All the server logic for both http and https
let unifiedServer = function(req, res){
  // Get URL and parse it
  let parsedUrl = url.parse(req.url,true);

  // Get the Path
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  let queryStringObject = parsedUrl.query;

  // Get the HTTP method
  let method = req.method.toLowerCase();

  //Get the headers as an object
  let headers = req.headers;

  // Get the payload, if any
  let decoder = new stringDecoder('utf-8');
  let buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data);
  });
  req.on('end', function(){
    buffer += decoder.end();

    // Choose the handler this request should go to, if one not found, use the notFound handler
    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Contruct the data object to send to the handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };

    // Route the request to handler specified in the router
    chosenHandler(data, function(statusCode, payload){
      // Use the status code called back by the handler or set default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called back by the handler or set default to empty object
       payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to string
      let payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

       // Log the request path
       console.log('Returning this response: ', statusCode, payloadString);
    });
  });
};

// Define the message a user get on sending an HTTP request to the route /hello
let welcomeMessage = {
  'name' : 'Guest',
  'message' : '',
  'status'  : 200,

  sendMessage(){
    return this.message = 'Hello @' + this.name + ', ' + 'welcome to the Node.js Masterclass. It\'s great to have you on board.'
  }
};

// Define the handlers
let handlers = {};

handlers.hello =  function (data, callback) {
  callback(welcomeMessage.status, {'message' : welcomeMessage.sendMessage()});
};

handlers.notFound =  function (data, callback) {
  callback(404);
};

// Define a request router
let router = {
  'hello' : handlers.hello
}
