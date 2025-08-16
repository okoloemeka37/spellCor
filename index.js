import dictionary from "dictionary-en";
import http from "http";
import nSpell from "nspell";
import fs from 'fs';
import druglist from './druglist.js';
const port = process.env.PORT;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "POST" && req.url === "/spellcheck") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { words } = JSON.parse(body);

const dic = `${druglist.length}\n${druglist.join("\n")}`;
const aff = `SET UTF-8\nTRY:abcdefghijklmnopqrstuvwxyz`;
const spell=nSpell(aff, dic);

words.forEach((wrd,i) => {
  const numIndex=wrd.search(/[0-9]/);
  let textPart = wrd.substring(0, numIndex);
  if (!spell.correct(textPart)) {
   const dpl= spell.suggest(textPart);
   if (dpl.length !==0) {
      words[i]=dpl[0]
   }
  }
});

  res.writeHead(200, { "Content-Type": "application/json" });
       res.end(JSON.stringify({corrected:words}));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
