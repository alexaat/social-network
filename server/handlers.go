package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"net/http"

	types "my-social-network/types"

	db "my-social-network/db/sqlite"
)

func signinHandler(w http.ResponseWriter, r *http.Request) {

	resp := types.Response{Payload: nil, Error: nil}

	if r.Method != "POST" {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
	} else {

		user := strings.TrimSpace(r.FormValue("user"))
		password := strings.TrimSpace(r.FormValue("password"))

		if len(user) < 2 || len(user) > 50 {
			resp.Error = &types.Error{Type: INVALID_USER_FORMAT, Message: "Error: username should be between 2 and 50 characters long"}
		} else {

			user, err := db.GetUserByEmailOrNickNameAndPassword(types.User{NickName: user, Password: password})

			if err != nil {
				resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: cannot get user from database"}
			} else if user == nil {
				resp.Error = &types.Error{Type: NO_USER_FOUND, Message: "Error: no user found"}
			} else {

				sessionId := generateSessionId()

				err = db.SaveSession(int64(user.Id), sessionId)

				if err != nil {
					resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: cannot save session"}
				} else {
					resp.Payload = types.Session{SessionId: sessionId}
				}
			}
		}
	}

	w.Header().Set("Access-Control-Allow-Origin", clientOrigin)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func signupHandler(w http.ResponseWriter, r *http.Request) {

	resp := types.Response{Payload: nil, Error: nil}

	if r.Method != "POST" {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
	} else {

		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: error while parse multipart form %v", err)}
			sendResponse(w, resp)
			return
		}

		firstName := strings.TrimSpace(r.FormValue("firstName"))
		lastName := strings.TrimSpace(r.FormValue("lastName"))
		nickName := strings.TrimSpace(r.FormValue("nickName"))
		dateOfBirth := strings.TrimSpace(r.FormValue("dateOfBirth"))
		email := strings.TrimSpace(r.FormValue("email"))
		password := strings.TrimSpace(r.FormValue("password"))
		about := strings.TrimSpace(r.FormValue("about"))

		//Validate image

		fileName := ""

		file, _, err := r.FormFile("image")

		if err == nil {

			defer file.Close()

			err = makeDirectoryIfNotExists(IMAGES_DIRECTORY)

			if err != nil {
				resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: error while creating directory %v", err)}
				sendResponse(w, resp)
				return
			}

			uuid := generateSessionId()
			tempFile, err := ioutil.TempFile(IMAGES_DIRECTORY, fmt.Sprintf("%v-*.gif", uuid))

			if err != nil {
				resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: error while creating temp file %v", err)}
				sendResponse(w, resp)
				return
			}

			defer tempFile.Close()

			fileBytes, err := ioutil.ReadAll(file)
			if err != nil {
				resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: error while reading file %v", err)}
				sendResponse(w, resp)
				return
			}

			_, err = tempFile.Write(fileBytes)
			if err != nil {
				resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: error while writing file %v", err)}
				sendResponse(w, resp)
				return
			}

			fileName = filepath.Base(tempFile.Name())

		} else {
			if !strings.Contains(err.Error(), "no such file") {
				resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: image error %v", err)}
				sendResponse(w, resp)
				return
			}
		}

		//Validate input
		if len(firstName) < 1 || len(firstName) > 50 {
			resp.Error = &types.Error{Type: INVALID_FIRST_NAME_FORMAT, Message: "Error: First Name should be between 1 and 50 characters long"}
			sendResponse(w, resp)
			return
		}
		if len(lastName) < 1 || len(lastName) > 50 {
			resp.Error = &types.Error{Type: INVALID_LAST_NAME_FORMAT, Message: "Error: Last Name should be between 1 and 50 characters long"}
			sendResponse(w, resp)
			return
		}
		if len(nickName) != 0 && (len(nickName) < 2 || len(nickName) > 50) {
			resp.Error = &types.Error{Type: INVALID_NICK_NAME_FORMAT, Message: "Error: Nickname should be between 2 and 50 characters long"}
			sendResponse(w, resp)
			return
		}

		parseTime, err := time.Parse("2006-01-02 15:04:05", dateOfBirth+" 00:00:00")
		if err != nil {
			resp.Error = &types.Error{Type: INVALID_DATE_FORMAT, Message: "Error: Invalid date format"}
			sendResponse(w, resp)
			return
		}
		milli := parseTime.UnixNano() / 1000000
		unixMilli := time.Now().UnixMilli()

		if milli > unixMilli || milli <= 0 {
			resp.Error = &types.Error{Type: INVALID_DATE_FORMAT, Message: "Error: Invalid date"}
			sendResponse(w, resp)
			return
		}

		reg := `^[^@\s]+@[^@\s]+\.[^@\s]+$`
		match, err := regexp.MatchString(reg, email)
		if err != nil || !match {
			resp.Error = &types.Error{Type: INVALID_EMAIL, Message: "Error: invalid email"}
			sendResponse(w, resp)
			return
		}

		if len(password) < 6 || len(password) > 50 {
			resp.Error = &types.Error{Type: INVALID_PASSWORD, Message: "Error: password should be between 6 and 50 charachters long"}
			sendResponse(w, resp)
			return
		}

		if len(about) > 5000 {
			resp.Error = &types.Error{Type: INVALID_ABOUT_ME, Message: "Error: about me should be less than 5000 charachters"}
			sendResponse(w, resp)
			return
		}

		id, err := db.SaveUser(

			&types.User{
				FirstName:   firstName,
				LastName:    lastName,
				NickName:    nickName,
				DateOfBirth: milli,
				Email:       email,
				Password:    password,
				AboutMe:     about,
				Avatar:      fileName,
				Privacy:     "public",
			},
		)

		if err != nil {

			errorStr := fmt.Sprintf("%v", err)

			if strings.Contains(errorStr, "UNIQUE constraint") {
				if strings.Contains(errorStr, "email") {
					resp.Error = &types.Error{Type: INVALID_EMAIL, Message: "Error: email already in use"}
				} else {
					resp.Error = &types.Error{Type: DATABASE_ERROR, Message: fmt.Sprintf("Error: cannot save user. %v", err)}
				}
			} else {
				resp.Error = &types.Error{Type: DATABASE_ERROR, Message: fmt.Sprintf("Error: cannot save user. %v", err)}
			}
			sendResponse(w, resp)
			return
		}

		//Generate session id
		sessionId := generateSessionId()

		//Save session id to db
		err = db.SaveSession(id, sessionId)

		if err != nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: cannot save session"}
		}

		resp.Payload = types.Session{SessionId: sessionId}

	}

	w.Header().Set("Access-Control-Allow-Origin", clientOrigin)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func signoutHandler(w http.ResponseWriter, r *http.Request) {

	resp := types.Response{Payload: nil, Error: nil}

	if r.Method != "GET" {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
		sendResponse(w, resp)
		return
	}

	keys, ok := r.URL.Query()["session_id"]
	if !ok || len(keys[0]) < 1 {
		resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: session_id"}
		sendResponse(w, resp)
		return
	}
	session_id := keys[0]

	user, err := db.GetUserBySessionId(session_id)

	if err != nil || user == nil {
		resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
		sendResponse(w, resp)
		return
	}
	removeClient(user.Id)

	user.Password = ""
	user.DateOfBirth = 0
	resp.Payload = user
	sendResponse(w, resp)
}

func homeHandler(w http.ResponseWriter, r *http.Request) {

	resp := types.Response{Payload: nil, Error: nil}

	if r.Method == "GET" {
		keys, ok := r.URL.Query()["session_id"]
		if !ok || len(keys[0]) < 1 {
			resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: session_id"}
			sendResponse(w, resp)
			return
		}
		session_id := keys[0]

		user, err := db.GetUserBySessionId(session_id)

		if err != nil || user == nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
			sendResponse(w, resp)
			return
		}

		user.Password = ""

		posts, err := db.GetPosts()

		if err != nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: fmt.Sprintf("Error: could not get posts from database. %v", err)}
			sendResponse(w, resp)
			return
		}

		hpd := types.HomePageData{
			User:  user,
			Posts: posts,
		}

		resp.Payload = hpd

	} else {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
	}
	sendResponse(w, resp)
}

func sendResponse(w http.ResponseWriter, resp types.Response) {
	w.Header().Set("Access-Control-Allow-Origin", clientOrigin)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	json.NewEncoder(w).Encode(resp)
}

func imageHandler(w http.ResponseWriter, r *http.Request) {

	resp := types.Response{Payload: nil, Error: nil}

	if r.Method == "GET" {
		keys, ok := r.URL.Query()["id"]
		if !ok || len(keys[0]) < 1 {
			resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request image parameter: id"}
			json.NewEncoder(w).Encode(resp)
			return
		}
		id := keys[0]
		path := "images/" + id
		w.Header().Set("Access-Control-Allow-Origin", clientOrigin)
		http.ServeFile(w, r, path)

	} else {
		sendResponse(w, resp)
	}
}

func sendImage(w http.ResponseWriter, r *http.Request, path string) {

	// w.Header().Set("Access-Control-Allow-Origin", clientOrigin)

	// f, err := os.Open(path)
	// if err != nil {
	// 	fmt.Println(err)
	// }
	// defer f.Close()

	// fi, err := f.Stat()
	// if err != nil {
	// 	fmt.Println(err)
	// }

	// fmt.Println(strings.TrimPrefix(f.Name(), "avatars/"))

	// http.ServeContent(w, r, f.Name(), fi.ModTime(), f)

	w.Header().Set("Access-Control-Allow-Origin", clientOrigin)
	http.ServeFile(w, r, path)
}

func userHandler(w http.ResponseWriter, r *http.Request) {
	resp := types.Response{Payload: nil, Error: nil}

	if r.Method == "GET" {

		keys, ok := r.URL.Query()["session_id"]
		if !ok || len(keys[0]) < 1 {
			resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: session_id"}
			sendResponse(w, resp)
			return
		}
		session_id := keys[0]

		user, err := db.GetUserBySessionId(session_id)

		if err != nil || user == nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
			sendResponse(w, resp)
			return
		}

		user.Password = ""
		resp.Payload = user

	} else if r.Method == "PUT" {

		keys, ok := r.URL.Query()["session_id"]
		if !ok || len(keys[0]) < 1 {
			resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: session_id"}
			sendResponse(w, resp)
			return
		}
		session_id := keys[0]

		user, err := db.GetUserBySessionId(session_id)

		if err != nil || user == nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
			sendResponse(w, resp)
			return
		}

		privacy := strings.TrimSpace(r.FormValue("privacy"))
		if privacy != "" {
			user.Privacy = privacy
			err = db.UpdateUser(user)
			if err != nil {
				resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not update user in database"}
			}

		}

	} else {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
	}

	sendResponse(w, resp)
}

func profileHandler(w http.ResponseWriter, r *http.Request) {

	resp := types.Response{Payload: nil, Error: nil}

	if r.Method != "GET" {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
		sendResponse(w, resp)
		return
	}

	keys, ok := r.URL.Query()["session_id"]
	if !ok || len(keys[0]) < 1 {
		resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: session_id"}
		sendResponse(w, resp)
		return
	}
	session_id := keys[0]

	user, err := db.GetUserBySessionId(session_id)

	if err != nil || user == nil {
		resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
		sendResponse(w, resp)
		return
	}

	user.Password = ""

	if r.Method == "GET" {

		posts, err := db.GetPostsByUserId(user.Id)

		if err != nil || user == nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
			sendResponse(w, resp)
			return
		}

		ppd := types.ProfilePageData{
			User:      user,
			Posts:     posts,
			Followers: nil,
			Following: nil,
		}

		resp.Payload = ppd

	}

	sendResponse(w, resp)
}

func postHandler(w http.ResponseWriter, r *http.Request) {
	resp := types.Response{Payload: nil, Error: nil}

	if r.Method == "POST" {

		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: error while parse multipart form %v", err)}
			sendResponse(w, resp)
			return
		}

		//Validate image
		fileName := ""

		file, _, err := r.FormFile("image")

		if err == nil {

			defer file.Close()

			err = makeDirectoryIfNotExists(IMAGES_DIRECTORY)

			if err != nil {
				resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: error while creating directory %v", err)}
				sendResponse(w, resp)
				return
			}

			uuid := generateSessionId()
			tempFile, err := ioutil.TempFile(IMAGES_DIRECTORY, fmt.Sprintf("%v-*.gif", uuid))

			if err != nil {
				resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: error while creating temp file %v", err)}
				sendResponse(w, resp)
				return
			}

			defer tempFile.Close()

			fileBytes, err := ioutil.ReadAll(file)
			if err != nil {
				resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: error while reading file %v", err)}
				sendResponse(w, resp)
				return
			}

			_, err = tempFile.Write(fileBytes)
			if err != nil {
				resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: error while writing file %v", err)}
				sendResponse(w, resp)
				return
			}

			fileName = filepath.Base(tempFile.Name())

		} else {
			if !strings.Contains(err.Error(), "no such file") {
				resp.Error = &types.Error{Type: IMAGE_UPLOAD_ERROR, Message: fmt.Sprintf("Error: image error %v", err)}
				sendResponse(w, resp)
				return
			}
		}

		content := strings.TrimSpace(r.FormValue("content"))
		privacy := strings.TrimSpace(r.FormValue("privacy"))
		specificFriends := strings.TrimSpace(r.FormValue("specific_friends"))

		userId, err := strconv.Atoi(strings.TrimSpace(r.FormValue("user_id")))
		if err != nil {
			resp.Error = &types.Error{Type: PARSE_ERROR, Message: "Error: cannot parse user_id"}
			sendResponse(w, resp)
			return
		}

		post := types.Post{
			Content:         content,
			Privacy:         privacy,
			User:            types.User{Id: userId},
			Image:           fileName,
			SpecificFriends: specificFriends,
		}

		err = db.SavePost(post)
		if err != nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: fmt.Sprintf("Error: could not save post to database: %v", err)}
		}

	} else {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
	}
	sendResponse(w, resp)
}

func postsHandler(w http.ResponseWriter, r *http.Request) {
	resp := types.Response{Payload: nil, Error: nil}
	if r.Method != "GET" {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
		sendResponse(w, resp)
	}

	keys, ok := r.URL.Query()["session_id"]
	if !ok || len(keys) == 0 || len(keys[0]) == 0 {
		resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: session_id"}
		sendResponse(w, resp)
		return
	}
	session_id := keys[0]

	user, err := db.GetUserBySessionId(session_id)

	if err != nil || user == nil {
		resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
		sendResponse(w, resp)
		return
	}

	posts, err := db.GetPosts()

	if err != nil {
		resp.Error = &types.Error{Type: DATABASE_ERROR, Message: fmt.Sprintf("Error: could not get posts from database. %v", err)}
		sendResponse(w, resp)
		return
	}
	resp.Payload = posts

	sendResponse(w, resp)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {

	resp := types.Response{Payload: nil, Error: nil}

	if r.Method != "GET" {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
		sendResponse(w, resp)
	} else {
		keys, ok := r.URL.Query()["session_id"]
		if !ok || len(keys) == 0 || len(keys[0]) < 1 {
			resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: session_id"}
			sendResponse(w, resp)
			return
		}
		session_id := keys[0]

		user, err := db.GetUserBySessionId(session_id)

		if err != nil || user == nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
			sendResponse(w, resp)
			return
		}

		addClient(*user, w, r)
	}

}

func followingHandler(w http.ResponseWriter, r *http.Request) {
	resp := types.Response{Payload: nil, Error: nil}

	if r.Method != "GET" && r.Method != "POST" && r.Method != "OPTIONS" && r.Method != "DELETE" {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
		sendResponse(w, resp)
	}

	keys, ok := r.URL.Query()["session_id"]
	if !ok || len(keys) == 0 || len(keys[0]) == 0 {
		resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: session_id"}
		sendResponse(w, resp)
		return
	}
	session_id := keys[0]

	user, err := db.GetUserBySessionId(session_id)

	if err != nil || user == nil {
		resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
		sendResponse(w, resp)
		return
	}
	user.Password = ""

	if r.Method == "GET" {

		following, err := db.GetFollowing(user.Id)

		if err != nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get followers from database"}
			sendResponse(w, resp)
			return
		}

		resp.Payload = following

	} else if r.Method == "POST" {

		following, err := strconv.Atoi(strings.TrimSpace(r.FormValue("follow")))

		if err != nil {
			resp.Error = &types.Error{Type: PARSE_ERROR, Message: "Error: could not parse user id"}
			sendResponse(w, resp)
			return
		}

		followee, err := db.GetUserById(following)
		if err != nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get following from database"}
		}

		err = db.UpdateFollowers(user.Id, following, followee.Privacy)

		if err != nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get followers from database"}
		}

		if followee.Privacy == "private" {
			resp.Error = &types.Error{Type: AUTHORIZATION, Message: "User approval is required"}
		}

		//Notifications

		nick := strings.TrimSpace(user.NickName)

		if nick == "" {
			nick = user.FirstName + " " + user.LastName
		}

		payload := fmt.Sprintf("%v wants to follow you.", nick)
		m_type := "notification"

		n := types.Notification{
			Content:     payload,
			Sender:      user,
			RecipientId: following,
		}

		err = db.SaveNotification(n)

		if err != nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could save a notification to database"}
			sendResponse(w, resp)
			return
		}

		sendResponse(w, resp)

		swMessage := types.WSMessage{
			Type:    m_type,
			Payload: payload,
		}
		b, err := json.Marshal(swMessage)
		if err == nil {
			notifyClient(followee.Id, b)
		} else {
			fmt.Println(err)
		}

		return

	} else if r.Method == "DELETE" {

		keys, ok := r.URL.Query()["follow"]
		if !ok || len(keys) == 0 || len(keys[0]) == 0 {
			resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: follow"}
			sendResponse(w, resp)
			return
		}

		followingStr := keys[0]

		following, err := strconv.Atoi(strings.TrimSpace(followingStr))

		if err != nil {
			resp.Error = &types.Error{Type: PARSE_ERROR, Message: "Error: could not parse user follow"}
			sendResponse(w, resp)
			return
		}
		err = db.DeleteFollower(user.Id, following)

		if err != nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not delete follower from database"}
		}
	}
	sendResponse(w, resp)
}

func followersHandler(w http.ResponseWriter, r *http.Request) {

	resp := types.Response{Payload: nil, Error: nil}

	if r.Method != "GET" && r.Method != "POST" {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
		sendResponse(w, resp)
	}

	keys, ok := r.URL.Query()["session_id"]
	if !ok || len(keys) == 0 || len(keys[0]) == 0 {
		resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: session_id"}
		sendResponse(w, resp)
		return
	}
	session_id := keys[0]

	user, err := db.GetUserBySessionId(session_id)

	if err != nil || user == nil {
		resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
		sendResponse(w, resp)
		return
	}
	user.Password = ""

	if r.Method == "GET" {

		followers, err := db.GetFollowers(user.Id)

		if err != nil {
			resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get followers from database"}
			sendResponse(w, resp)
			return
		}

		resp.Payload = followers

		sendResponse(w, resp)

	} else if r.Method == "POST" {

		//Approve Follower

		followee := user.Id
		follower, err := strconv.Atoi(strings.TrimSpace(r.FormValue("follower")))
		//True or False
		approve := strings.TrimSpace(r.FormValue("approve"))

		if err != nil {
			resp.Error = &types.Error{Type: PARSE_ERROR, Message: "Error: could not parse user id"}
			sendResponse(w, resp)
			return
		}

		if approve == "false" {
			fmt.Println("Delete Follower")
			err = db.DeleteFollower(follower, followee)
			if err != nil {
				resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get followers from database"}
				sendResponse(w, resp)
				return
			}
		} else if approve == "true" {
			err = db.ApproveFollower(follower, followee)
			if err != nil {
				resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get followers from database"}
				sendResponse(w, resp)
				return
			}

		}

		sendResponse(w, resp)

		//Notify approve result
		swMessage := types.WSMessage{
			Type:    "approve_follower",
			Payload: approve,
		}

		fmt.Println(swMessage)
		fmt.Println("follower: ", follower)

		b, err := json.Marshal(swMessage)
		if err == nil {
			notifyClient(follower, b)
		} else {
			fmt.Println(err)
		}

	}
}

func notificationsHandler(w http.ResponseWriter, r *http.Request) {
	resp := types.Response{Payload: nil, Error: nil}

	if r.Method != "GET" {
		resp.Error = &types.Error{Type: WRONG_METHOD, Message: "Error: wrong http method"}
		sendResponse(w, resp)
	}

	keys, ok := r.URL.Query()["session_id"]
	if !ok || len(keys) == 0 || len(keys[0]) == 0 {
		resp.Error = &types.Error{Type: MISSING_PARAM, Message: "Error: missing request parameter: session_id"}
		sendResponse(w, resp)
		return
	}
	session_id := keys[0]

	user, err := db.GetUserBySessionId(session_id)

	if err != nil || user == nil {
		resp.Error = &types.Error{Type: DATABASE_ERROR, Message: "Error: could not get user from database"}
		sendResponse(w, resp)
		return
	}
	user.Password = ""

	// resp.Payload = types.Echo{
	// 	User: fmt.Sprintf("%v", user.Id),
	// }
	// sendResponse(w, resp)
	// return

	notifications, err := db.GetNotifications(user.Id)

	if err != nil {

		resp.Error = &types.Error{Type: DATABASE_ERROR, Message: fmt.Sprintf("Error: could not get notifications from database. %v", err)}
		sendResponse(w, resp)
		return
	}

	for _, n := range *notifications {
		n.Sender.Password = ""
		n.Sender.DateOfBirth = 0
	}

	resp.Payload = notifications

	sendResponse(w, resp)

}
