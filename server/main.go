package main

import (
	"fmt"
	"log"
	"my-social-network/db/sqlite"
	"strings"

	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func main() {

	db, err := sqlite.CreateDatabase()
	if err != nil {
		if !strings.Contains(err.Error(), "no change") {
			log.Fatal(err)
		}
	}

	fmt.Println("Startig server at port 8080")
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/signin", signinHandler)
	http.HandleFunc("/signup", signupHandler)
	http.HandleFunc("/signout", signoutHandler)

	http.HandleFunc("/image", imageHandler)
	http.HandleFunc("/user", userHandler)
	http.HandleFunc("/profile", profileHandler)
	http.HandleFunc("/post", postHandler)
	http.HandleFunc("/posts", postsHandler)
	http.HandleFunc("/followers", followersHandler)
	http.HandleFunc("/following", followingHandler)
	http.HandleFunc("/notifications", notificationsHandler)

	http.HandleFunc("/ws", wsHandler)

	http.ListenAndServe(":8080", nil)

	defer db.Close()
}
