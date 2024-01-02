// Build a Web server on self-made backend framework ButterJS
const ButterJS = require("./ButterJS");
const SESSIONS = [];
const USERS = [
  { id: 1, name: "Liam Brown", username: "liam23", password: "string" },
  { id: 2, name: "Sam Cook", username: "sam23", password: "string" },
  { id: 3, name: "Ben Adam", username: "ben.poet", password: "string" },
];
const POSTS = [
  {
    id: 1,
    title: "This is the first post",
    body: "Apache Kafka is a distributed event store and stream-processing\
     platform. It is an open-source system developed by the Apache Software\
      Foundation written in Java and Scala. The project aims to provide a \
      unified, high-throughput, low-latency platform for handling real-time \
      data feeds. Kafka can connect to external systems (for data import/export)\
       via Kafka Connect, and provides the Kafka Streams libraries for stream \
       processing applications. ",
    userId: 1,
  },
];
const PORT = 9001;
const server = new ButterJS();
// for authentication
server.beforeEach((req, res, next) => {
  const routesToAuthenticate = [
    "GET /api/user",
    "PUT /api/user",
    "POST /api/posts",
    "DELETE /api/logout",
  ];
  if (routesToAuthenticate.indexOf(req.method + " " + req.url) === -1) {
    next();
  } else {
    if (!req.headers.cookie) {
      return res.status(401).json({ error: "Unauthorized user" });
    }
    const token = req.headers.cookie.split("=")[1];
    const session = SESSIONS.find((session) => session.token === token);
    // if we have a token cookie, save the userId to the request object
    if (session) {
      req.userId = session.userId;
      return next();
    } else {
      return res.status(401).json({ error: "Unauthorized user" });
    }
  }
});
// parse json body
server.beforeEach((req, res, next) => {
  if (req.headers["content-type"] === "application/json") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf-8");
    });
    req.on("end", () => {
      body = JSON.parse(body);
      req.body = body;
      return next();
    });
  } else {
    next();
  }
});
// for different routes that need the index.html file
server.beforeEach((req, res, next) => {
  const routes = ["/", "/login", "/profile", "new-post"];
  if (routes.indexOf(req.url) !== -1 && req.method === "GET") {
    return res.status(200).sendFile("./public/index.html", "text/html");
  } else {
    next();
  }
});
server.route("get", "/styles.css", (req, res) => {
  res.sendFile("./public/styles.css", "text/css");
});
server.route("get", "/scripts.js", (req, res) => {
  res.sendFile("./public/scripts.js", "text/javascript");
});
server.route("post", "/api/login", (req, res) => {
  const user = USERS.find((user) => user.username === req.body.username);
  if (user && user.password === req.body.password) {
    const token = Math.floor(Math.random() * 10000000000).toString();
    SESSIONS.push({ userId: user.id, token: token });
    res.setHeader("Set-Cookie", `token=${token}; Path=/;`);
    res.status(200).json({
      message: "Login successfully",
    });
  } else {
    res.status(401).json({
      error: "Invalid username or password",
    });
  }
});
server.route("delete", "/api/logout", (req, res) => {
  // remove the session object from the SESSIONS array
  const sessionIndex = SESSIONS.findIndex(
    (session) => session.userId == req.userId
  );
  if (sessionIndex > -1) {
    SESSIONS.slice(sessionIndex, 1);
  }
  // remove the cookie in the browser
  res.setHeader(
    "Set-Cookie",
    `token=deleted; Path=/; Expires=Tue, 03 Jan 2024 19:45:46 GMT`
  );
  res.status(200).json({ message: "Logged out successful" });
});
server.route("get", "/api/user", (req, res) => {
  const user = USERS.find((user) => user.id === req.userId);
  res.json({ username: user.username, name: user.name });
});
server.route("put", "/api/user", (req, res) => {
  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;
  // grab the user object that is currently logged in
  const user = USERS.find((user) => user.id === req.userId);
  user.username = username;
  user.name = name;
  if (password) {
    user.password = password;
  }
  res.status(200).json({
    username: user.username,
    name: user.name,
    password_status: password ? "updated" : "Unchanged",
  });
});
server.route("get", "/api/posts", (req, res) => {
  const posts = POSTS.map((post) => {
    const user = USERS.find((user) => user.id === post.userId);
    post.author = user.name;
    return post;
  });
  res.status(200).json(posts);
});
server.route("post", "/api/posts", (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const post = {
    id: POSTS.length + 1,
    title: title,
    body: body,
    userId: req.userId,
  };
  POSTS.unshift(post);
  res.status(201).json(post);
});
server.lissten(PORT, () => {
  console.log("Server has started on port", PORT);
});
