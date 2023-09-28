package types

type Error struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

type Response struct {
	Payload interface{} `json:"payload"`
	Error   *Error      `json:"error"`
}

type Echo struct {
	User string `json:"user"`
}

type User struct {
	Id          int    `json:"id"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	NickName    string `json:"nick_name"`
	DateOfBirth int64  `json:"date_of_birth"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	AboutMe     string `json:"about_me"`
	Avatar      string `json:"avatar"`
	Privacy     string `json:"privacy"`
}

type Session struct {
	SessionId string `json:"session_id"`
}

type Post struct {
	Id              int    `json:"id"`
	Date            int    `json:"date"`
	Content         string `json:"content"`
	Privacy         string `json:"privacy"`
	SpecificFriends string `json:"specific_friends"`
	Image           string `json:"image"`
	User            User   `json:"user"`
}

// type Post struct {
// 	Id              int    `json:"id"`
// 	Date            int    `json:"date"`
// 	Content         string `json:"content"`
// 	Privacy         string `json:"privacy"`
// 	SpecificFriends string `json:"specific_friends"`
// 	UserId          int    `json:"user_id"`
// 	NickName        string `json:"nick_name"`
// 	FirstName       string `json:"first_name"`
// 	LastName        string `json:"last_name"`
// 	Avatar          string `json:"avatar"`
// 	Image           string `json:"image"`
// 	User            User   `json:"user"`
// }

type HomePageData struct {
	User  *User   `json:"user"`
	Posts *[]Post `json:"posts"`
}

type ProfilePageData struct {
	User      *User   `json:"user"`
	Posts     *[]Post `json:"posts"`
	Followers *[]User `json:"followers"`
	Following *[]User `json:"following"`
}

type Followers struct {
	Following []int `json:"following"`
	Followers []int `json:"followers"`
}

type Follower struct {
	Follower *User `json:"follower"`
	Approved bool  `json:"approved"`
}

type Following struct {
	Following *User `json:"following"`
	Approved  bool  `json:"approved"`
}

type Notification struct {
	Id          int    `json:"id"`
	Date        int    `json:"date"`
	Content     string `json:"content"`
	Sender      *User  `json:"sender"`
	RecipientId int    `json:"recipient_id"`
	IsRead      bool   `json:"is_read"`
}

type WSMessage struct {
	Type    string `json:"type"`
	Payload string `json:"payload"`
}
