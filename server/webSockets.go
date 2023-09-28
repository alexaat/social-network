package main

import (
	"fmt"
	types "my-social-network/types"
	"net/http"

	"github.com/gorilla/websocket"
)

type Client struct {
	user           *types.User
	conn           *websocket.Conn
	messageChannel chan []byte
}

var clients = make(map[int]*Client)

var conn *websocket.Conn

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

// func makeWebSocketConnection(w http.ResponseWriter, r *http.Request) {
// 	connLocal, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		fmt.Println(err)
// 		return
// 	}
// 	conn = connLocal

// 	go readMessages(conn)

// }

/*
func readMessages(conn *websocket.Conn) {
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
			return
		}
		fmt.Println(string(message))

	}
}
*/

//New Code
func addClient(user types.User, w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	client := Client{
		user:           &user,
		conn:           ws,
		messageChannel: make(chan []byte),
	}
	clients[user.Id] = &client

	fmt.Println("Client with Id ", user.Id, " added.")
	fmt.Println("Clients: ", clients)

	go writeMessage(user.Id)
	go readMessages(user.Id)
}

func removeClient(id int) {
	if client, ok := clients[id]; ok {
		client.conn.Close()
		delete(clients, id)
		fmt.Printf("Deleted: %v\n", id)
		fmt.Println("Clients: ", clients)
	}
}

func readMessages(id int) {
	defer func() {
		removeClient(id)
		//broadcastClientsStatus()
	}()
	for {
		_, message, err := clients[id].conn.ReadMessage()
		fmt.Println("Incoming message: ", string(message))
		if err != nil {
			// Error:  websocket: close 1001 (going away)
			fmt.Println(err, " Connection: ", id)
			return
		}
		fmt.Println("Message ", string(message))
		message = []byte("Using channel. Message: " + string(message))
		for _, conn := range clients {
			conn.messageChannel <- message
		}
	}
}

func writeMessage(id int) {
	client := clients[id]
	defer func() {
		removeClient(id)
	}()
	for {
		select {
		case message, ok := <-client.messageChannel:
			if ok {
				if err := client.conn.WriteMessage(websocket.TextMessage, message); err != nil {
					fmt.Println(err)
					return
				}
			} else {
				if err := client.conn.WriteMessage(websocket.CloseMessage, nil); err != nil {
					fmt.Println(err)
					return
				}
			}
		}
	}
}

func notifyClient(id int, message []byte) {
	if client, ok := clients[id]; ok {
		client.messageChannel <- message
	}
}
