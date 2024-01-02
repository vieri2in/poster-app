const ButterJS = require("./ButterJS");
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
const PORT = 9002;

const server = new ButterJS();
server.route("get", "/", (req, res) => {
  console.log("Server-2 is now handing the request");
  res.sendFile("./public/index.html", "text/html");
});
server.route("get", "/login", (req, res) => {
  res.sendFile("./public/index.html", "text/html");
});
server.route("get", "/styles.css", (req, res) => {
  res.sendFile("./public/styles.css", "text/css");
});
server.route("get", "/scripts.js", (req, res) => {
  res.sendFile("./public/scripts.js", "text/javascript");
});
server.route("post", "/api/login", (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString("utf-8");
  });
  req.on("end", () => {
    body = JSON.parse(body);
    const user = USERS.find((user) => user.name === body.username);
    if (user && user.password === body.password) {
      //   console.log("Matched");
      res.status(200).json({
        message: "Login successfully",
      });
    } else {
      res.status(401).json({
        error: "Invalid username or password",
      });
    }
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
server.lissten(PORT, () => {
  console.log("Server has started on port", PORT);
});
