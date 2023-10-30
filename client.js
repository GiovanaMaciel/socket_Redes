const net = require("net");
const fs = require("fs");
const readline = require("readline");

const client_data_dir = "client_data/";
const server_host = "127.0.0.1";
const server_port = 8888;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new net.Socket();

client.connect(server_port, server_host, function () {
  console.log("Conectado ao servidor.");

  function menu() {
    console.log("Menu:");
    console.log("1 - Enviar arquivo");
    console.log("2 - Receber arquivo");
    console.log("3 - Encerrar programa");
    rl.question("Selecione uma opção: ", function (option) {
      if (option === "1") {
        rl.question(
          "Digite o nome do arquivo a ser enviado: ",
          function (file_name) {
            client.write("1");
            client.write(file_name);
            const fileStream = fs.createReadStream(client_data_dir + file_name);
            fileStream.on("data", function (data) {
              client.write(data);
            });
            fileStream.on("end", function () {
              client.end();
              console.log("Arquivo enviado.");
              console.log("Conexão encerrada.");
              process.exit(0);
            });
          }
        );
      } else if (option === "2") {
        rl.question(
          "Digite o nome do arquivo a ser recebido: ",
          function (file_name) {
            client.write("2");
            client.write(file_name);
            client.on("data", function (data) {
              if (data.toString() === "Arquivo não encontrado.") {
                console.log("Arquivo não encontrado.");
              } else {
                fs.appendFileSync(client_data_dir + file_name, data);
              }
            });

            client.on("end", function () {
              console.log("Arquivo recebido e salvo.");
              process.exit(0);
            });
          }
        );
      } else if (option === "3") {
        client.end();
        console.log("Conexão encerrada.");
        process.exit(0);
      } else {
        console.log("Opção inválida.");
        menu();
      }
    });
  }

  menu();
});

client.on("close", function () {
  console.log("Conexão encerrada.");
  process.exit(0);
});
