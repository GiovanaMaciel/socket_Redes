import socket
import threading
import os

# Diretorios de dados do servidor e cliente
server_data_dir = "server_data/"
client_data_dir = "client_data/"

# Funcao para lidar com um cliente


def handle_client(client_socket):
    try:
        request = client_socket.recv(1024).decode()

        if request == "1":
            file_name = client_socket.recv(1024).decode()
            with open(server_data_dir + file_name, "wb") as file:
                while True:
                    data = client_socket.recv(1024)
                    if not data:
                        break
                    file.write(data)

            print(f"Arquivo '{file_name}' recebido e salvo.")
            client_socket.send("File received".encode())

        elif request == "2":
            file_name = client_socket.recv(1024).decode()
            file_path = server_data_dir + file_name
            try:
                with open(file_path, "rb") as file:
                    data = file.read(1024)
                    while data:
                        client_socket.send(data)
                        data = file.read(1024)
            except FileNotFoundError:
                client_socket.send("Arquivo não encontrado.".encode())


    except Exception as e:
        print(f"Uma conexão foi encerrada.")
    finally:
        client_socket.close()
        print("Conexão encerrada.")


# Configuracao do servidor
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(("0.0.0.0", 8888))
server.listen(5)
print("Servidor ouvindo na porta 8888...")

while True:
    client, addr = server.accept()
    print("Conexão aceita de: %s:%d" % (addr[0], addr[1]))
    client_handler = threading.Thread(target=handle_client, args=(client,))
    client_handler.start()
