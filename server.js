const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const morgan = require('morgan');
const app = express();

app.use(morgan('combined'));

// 서버를 8080 포트로 실행
app.listen(8080, () => {
  console.log('server running on port 8080');
});

// client가 '/'으로 접속하면 index.html을 전송
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// public 폴더를 static 폴더로 지정
app.use(express.static('public'));

// client가 'api/data'로 접속하면 sqplite3로 연결한 뒤 데이터베이스에서 데이터를 가져와서 전송
app.get('/api/centerData/:id', (req, res) => {
  const id = req.params.id;
  let db = new sqlite3.Database('./database/eum_database.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
    }else{
      console.log('Connected to the database.');
    }
  });
  // 데이터베이스에서 데이터를 가져옴
  db.all(`SELECT * FROM Center_Information_tbl WHERE ID = ${id}`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }else{
      console.log('Query successfully executed.');
      res.send(rows);
    }
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }else{
      console.log('Close the database connection.');
    }
  });
});
