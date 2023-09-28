package sqlite

import (
	types "my-social-network/types"
	"time"
)

/*
func SavePost(post types.Post) error {

	statement, err := db.Prepare("INSERT INTO posts (date, user_id, content, privacy, specific_friends, image) VALUES(?,?,?,?,?,?)")

	if err != nil {
		return err
	}

	defer statement.Close()

	date := time.Now().UnixNano() / 1000000

	_, err = statement.Exec(date, post.UserId, post.Content, post.Privacy, post.SpecificFriends, post.Image)

	if err != nil {
		return err

	}
	return nil
}

func GetPosts() (*[]types.Post, error) {
	posts := []types.Post{}

	sql := `
	SELECT posts.id, date, user_id, users.nick_name, users.first_name, users.last_name, users.avatar,content, posts.privacy, specific_friends, image
	FROM posts
	INNER JOIN users
	ON user_id = users.id
	ORDER BY date DESC`

	rows, err := db.Query(sql)

	if err != nil {
		return nil, err
	}

	for rows.Next() {
		post := types.Post{}
		err = rows.Scan(&(post.Id), &(post.Date), &(post.UserId), &(post.NickName), &(post.FirstName), &(post.LastName), &(post.Avatar), &(post.Content), &(post.Privacy), &(post.SpecificFriends), &(post.Image))
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return &posts, nil
}

func GetPostsByUserId(id int) (*[]types.Post, error) {
	posts := []types.Post{}

	sql := `
	SELECT posts.id, date, user_id, users.nick_name, users.first_name, users.last_name, users.avatar, content, posts.privacy, specific_friends, image
	FROM posts
	INNER JOIN users
	ON user_id = users.id
	WHERE user_id = ?
	ORDER BY date DESC`

	rows, err := db.Query(sql, id)

	if err != nil {
		return nil, err
	}

	for rows.Next() {
		post := types.Post{}
		err = rows.Scan(&(post.Id), &(post.Date), &(post.UserId), &(post.NickName), &(post.FirstName), &(post.LastName), &(post.Avatar), &(post.Content), &(post.Privacy), &(post.SpecificFriends), &(post.Image))
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return &posts, nil
}

*/

func SavePost(post types.Post) error {

	statement, err := db.Prepare("INSERT INTO posts (date, user_id, content, privacy, specific_friends, image) VALUES(?,?,?,?,?,?)")

	if err != nil {
		return err
	}

	defer statement.Close()

	date := time.Now().UnixNano() / 1000000

	_, err = statement.Exec(date, post.User.Id, post.Content, post.Privacy, post.SpecificFriends, post.Image)

	if err != nil {
		return err

	}
	return nil
}

func GetPosts() (*[]types.Post, error) {
	posts := []types.Post{}

	sql := `
	SELECT posts.id, date, user_id, users.nick_name, users.first_name, users.last_name, users.avatar, users.privacy, content, posts.privacy, specific_friends, image
	FROM posts
	INNER JOIN users
	ON user_id = users.id
	ORDER BY date DESC`

	rows, err := db.Query(sql)

	if err != nil {
		return nil, err
	}

	for rows.Next() {
		post := types.Post{}
		err = rows.Scan(&(post.Id), &(post.Date), &(post.User.Id), &(post.User.NickName), &(post.User.FirstName), &(post.User.LastName), &(post.User.Avatar), &(post.User.Privacy), &(post.Content), &(post.Privacy), &(post.SpecificFriends), &(post.Image))
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return &posts, nil
}

func GetPostsByUserId(id int) (*[]types.Post, error) {
	posts := []types.Post{}

	sql := `
	SELECT posts.id, date, user_id, users.nick_name, users.first_name, users.last_name, users.avatar, users.privacy, content, posts.privacy, specific_friends, image
	FROM posts
	INNER JOIN users
	ON user_id = users.id
	WHERE user_id = ?
	ORDER BY date DESC`

	rows, err := db.Query(sql, id)

	if err != nil {
		return nil, err
	}

	for rows.Next() {
		post := types.Post{}
		err = rows.Scan(&(post.Id), &(post.Date), &(post.User.Id), &(post.User.NickName), &(post.User.FirstName), &(post.User.LastName), &(post.User.Avatar), &(post.User.Privacy), &(post.Content), &(post.Privacy), &(post.SpecificFriends), &(post.Image))
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return &posts, nil
}
