const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const http = require('http').Server(app);
const session = require("express-session");
const assert = require('assert');

const url = 'mongodb://localhost:27017';
//const url = 'mongodb://mongo:primitive1A@219.94.241.56:27017';
const dbName = 'myMongo';
// const connectOption = {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    }
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, access_token'
  )

  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.sendStatus(200)
  } else {
    next()
  }
}
app.use(allowCrossDomain);




app.get('/', (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + "/style.css");
});

app.get('/mypage', (req, res) => {
    res.sendFile(__dirname + "/mypage.html");
});

app.get('/newpage', (req, res) => {
    res.sendFile(__dirname + "/newpage.html");
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});
  

app.get("/create", (req, res) => {
    res.sendFile(__dirname + "/create.html");
});

app.get("/create.css", (req, res) => {
    res.sendFile(__dirname + "/create.css");
});

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

app.get("/signup.css", (req, res) => {
    res.sendFile(__dirname + "/signup.css");
});

const initPages = async () => {

  let client;
  try {
    client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection('account');
    await collection.find({}).toArray( async (err, docs) => {
        for (const doc of docs) {
          let client2 = await MongoClient.connect(url);
          const db2 = client2.db(dbName);
          const collection2 = db2.collection('page');
          if (doc.name) {
            await collection2.find({name: doc.name}).toArray( (err2, docs2) => {
                for (const doc2 of docs2) {
                  app.get("/" + doc2.name, (req, res) => {
                    if (req.session.name) {
                      res.sendFile(__dirname + "/mypage.html");
                    } else {
                      res.send("404 not found");
                    }
                  });

                  app.get("/" + doc2.name + "/" + doc2.pageName, (req, res) => {
                    res.sendFile(__dirname + "/newpage.html");
                  });

                  app.get("/" + doc2.name + "/" + doc2.pageName, (req, res) => {
                    res.sendFile(__dirname + "/newpage.html");
                  });
                  app.get("/" + doc2.name + "/" + doc2.pageName + "/newpage.css", (req, res) => {
                    res.sendFile(__dirname + "/newpage.css");
                  });
                  app.get("/" + doc2.name + "/newpage.css", (req, res) => {
                    res.sendFile(__dirname + "/newpage.css");
                  });
                  app.get("/" + doc2.name + "/" + doc2.pageName + "/edit", (req, res) => {
                    if (req.session.name) {
                      res.sendFile(__dirname + "/edit.html");
                    } else {
                      res.send("404 not found");
                    }
                  });
                  app.get("/" + doc2.name + "/" + doc2.pageName + "/edit.css", (req, res) => {
                    res.sendFile(__dirname + "/edit.css");
                  });

                }          
            });
          }
        }
      });
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }

}

initPages();

const deleteData = async () => {
  let client;
  try {
    client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection('account');
    await collection.deleteMany({});
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }
  let client2;
  try {
    client2 = await MongoClient.connect(url);
    const db2 = client2.db(dbName);
    const collection2 = db2.collection('page');
    await collection2.deleteMany({});
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }

}

// deleteData();
const transactionDownloadMyPage = async (req, res) => {
  let client;
  let data = {name: req.session.name, pageName: req.body.pageName};
  data = Object.assign(data, {date: new Date() });
  try {
    client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection('account');

    const account = await collection.findOne({ name: req.session.name });

    res.json(account);
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }

}


const transactionDownloadPageText = async (req, res) => {
  let client;
  let data = {name: req.session.name, pageName: req.body.pageName};
  data = Object.assign(data, {date: new Date() });
  try {
    client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection('page');

    const page = await collection.findOne({ name: req.body.name, pageName: req.body.pageName });

    res.json(page);
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }
}


const transactionSaveText = async (req, res) => {
  let client;
  let data = {name: req.session.name, pageName: req.body.pageName};
  data = Object.assign(data, {date: new Date() });
  try {
    client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection('page');

    await collection.updateOne(
      { name: req.body.name, pageName: req.body.pageName },
      {
        $set: {
          text: req.body.text,
        },
      }
    );

    res.json({result: "保存済み"});
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }

}

const transactionCreatePage = async (req, res) => {
  let client;
  let data = {name: req.session.name, pageName: req.body.pageName};
  data = Object.assign(data, {date: new Date() });
  try {
    client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection('page');

    req.session.pageName = req.body.pageName;
    app.get("/" + req.session.name + "/" + req.body.pageName, (req, res) => {
      res.sendFile(__dirname + "/newpage.html");
    });
    app.get("/" + req.session.name + "/" + req.body.pageName + "/newpage.css", (req, res) => {
      res.sendFile(__dirname + "/newpage.css");
    });
    app.get("/" + req.session.name + "/newpage.css", (req, res) => {
      res.sendFile(__dirname + "/newpage.css");
    });

    app.get("/" + req.session.name + "/" + req.body.pageName + "/edit", (req, res) => {
      if (req.session.name) {
        res.sendFile(__dirname + "/edit.html");
      } else {
        res.send("404 not found");
      }
    });
    app.get("/" + req.session.name + "/" + req.body.pageName + "/edit.css", (req, res) => {
      res.sendFile(__dirname + "/edit.css");
    });

    await collection.insertOne(data);



    let client2 = await MongoClient.connect(url);
    const db2 = client2.db(dbName);
    const collection2 = db2.collection('account');

    await collection2.updateOne(
      { name: req.session.name },
      {
        $push: {
          pageNames: req.body.pageName,
        },
      }
    );



    res.json({name: req.session.name, pageName: req.body.pageName});
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }
};

const transactionDownload = async (req, res, data) => {
    let client;
    let login = false;
    try {
      client = await MongoClient.connect(url);
      const db = client.db(dbName);
      const collection = db.collection('account');
        await collection.find({}).toArray( (err, docs) => {
          for (const doc of docs) {
            if (doc.mail == data.mail) {
              if (doc.password == data.password) {
                login = true;
                req.session.name = doc.name;

                app.get("/" + req.session.name, (req, res) => {
                  if (req.session.name) {
                    res.sendFile(__dirname + "/mypage.html");
                  } else {
                    res.send("404 not found");
                  }
                });
                app.get("/" + req.session.name + "/style.css", (req, res) => {
                  res.sendFile(__dirname + "/style.css");
                });
            
                res.sendFile(__dirname + "/index.html");
              }
            }
          }
          if (!login) {
            res.send("login error");
          }
        });
    } catch (error) {
      console.log(error);
    } finally {
  //    client.close();
    }
};
const nextTransactionLogin = async (req, res) => {
    let client;
    try {
        client = await MongoClient.connect(url);
        const db = client.db(dbName);
        const collection = db.collection(req.body.collectionName);
        const data = await collection.findOne({password: req.body.password, mail: req.body.mail});
        res.json({result: data});
    } catch (error) {
        console.log(error);
    }
};

const nextTransactionFind = async (req, res) => {
    let client;
    try {
        client = await MongoClient.connect(url);
        const db = client.db(dbName);
        const collection = db.collection(req.body.collectionName);
        const data = await collection.find({}).toArray();
        res.json({result: data});
    } catch (error) {
        console.log(error);
    }
};

const nextTransactionInsert = async (req, res) => {
    let client;
    let data = req.body;
    data = Object.assign(data, {date: new Date() });
    try {
      client = await MongoClient.connect(url);
      const db = client.db(dbName);
      const collection = db.collection(req.body.collectionName);
      await collection.insertOne(data);
      res.json({result:"success"});
    } catch (error) {
      console.log(error);
    } finally {
//      client.close();
    }
};


const transactionInsert = async (data, res) => {
    let client;
    data = Object.assign(data, {date: new Date() });
    try {
      client = await MongoClient.connect(url);
      const db = client.db(dbName);
      const collection = db.collection('account');

      let existFlag = false;
      await collection.find({}).toArray( (err, docs) => {
        for (const doc of docs) {
          if (doc.mail == data.mail) {
            existFlag = true;
            res.send("error");
          }
          if (doc.name == data.name) {
            existFlag = true;
            res.send("exist same name error");
          }
        }
      });

      if (existFlag == false) {
        await collection.insertOne(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
//      client.close();
    }
};

app.post('/signup', async (req, res) => {
    let client;
    let exist = false;
    try {
      client = await MongoClient.connect(url);
      const db = client.db(dbName);
      const collection = db.collection('account');
        await collection.find({}).toArray( (err, docs) => {
          for (const doc of docs) {
            if (doc.mail == req.body.mail){
                exist = true;
            }
            if (doc.name == req.body.name) {
                exist = true;  
            }
          }
  
          let user = {mail:"", name:"", password:""};
  
          if (!exist && req.body.mail != "" && req.body.password != "") {
            user["mail"] = req.body.mail;
            user["password"] = req.body.password;
            user["name"] = req.body.name;
            transactionInsert(user, res);
  
            res.sendFile(__dirname + "/signuped.html");
          } else {
            res.sendFile(__dirname + "/signuperror.html");
          }
        });
    } catch (error) {
      console.log(error);
    } finally {
  //    client.close();
    }
});


app.post('/', (req, res) => {

    let user = {
      mail:"", name:"", password:""
    };
  
    user["mail"] = req.body.mail;
    user["password"] = req.body.password;
    transactionDownload(req, res, user);  
});

app.post("/mypage", (req, res) => {
//    res.json({name: req.session.name});
    transactionDownloadMyPage(req, res);
});

app.post("/newpage", (req, res) => {
    transactionDownloadPageText(req, res);
//  res.json({pageName: req.body.pageName});
});

app.post("/createpage", (req, res) => {
    transactionCreatePage(req, res);
});

app.post("/savetext", (req, res) => {
    transactionSaveText(req, res);
});

app.post("/insert", (req, res) => {
    nextTransactionInsert(req, res);
});

app.post("/find", (req, res) => {
    nextTransactionFind(req, res);
});

app.post("/login", (req, res) => {
    nextTransactionLogin(req, res);
});

app.get("/download", (req, res) => {
    res.download(__dirname + "/server.js");
});

const port = 80;
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
