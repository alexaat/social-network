package sqlite

import (
	"errors"
	"fmt"
	types "my-social-network/types"
	"time"
)

func UpdateFollowers(follower int, followee int, privacy string) error {

	userId := -1

	query := `
	SELECT followers.id
	FROM followers
	WHERE
	follower = ? AND followee = ?
	LIMIT 1
	`
	row, err := db.Query(query, follower, followee)

	if err != nil {
		return err
	}

	defer row.Close()

	for row.Next() {
		err = row.Scan(&userId)
		if err != nil {
			fmt.Println(err)
			return err
		}
	}

	err = row.Err()
	if err != nil {
		return err
	}

	if userId > 0 {
		err = DeleteFollower(follower, followee)
		if err != nil {
			return err
		}
	}

	statement, err := db.Prepare("INSERT INTO followers (date, follower ,followee, approved) VALUES(?, ?, ?, ?)")

	if err != nil {
		return err
	}

	defer statement.Close()

	date := time.Now().UnixNano() / 1000000

	approved := true
	if privacy == "private" {
		approved = false
	}

	_, err = statement.Exec(date, follower, followee, approved)

	if err != nil {
		return err
	}

	return nil
}

func DeleteFollower(follower int, followee int) error {
	statement, err := db.Prepare("DELETE FROM followers WHERE follower = ? AND followee = ?")

	if err != nil {
		return err
	}

	defer statement.Close()

	_, err = statement.Exec(follower, followee)

	if err != nil {
		return err
	}

	return nil
}

func GetFollowing(userId int) (*[]types.Following, error) {
	if userId < 1 {
		return nil, errors.New("invalid user id")
	}

	query := `
	SELECT
	users.id, users.first_name, users.last_name, users.nick_name, users.avatar, users.privacy, approved FROM followers
	INNER JOIN
	users
	ON
	users.id = followee
	WHERE
	follower = ?`

	rows, err := db.Query(query, userId)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	followings := []types.Following{}

	for rows.Next() {
		user := types.User{}
		following := types.Following{}
		err = rows.Scan(&(user.Id), &(user.FirstName), &(user.LastName), &(user.NickName), &(user.Avatar), &(user.Privacy), &(following.Approved))
		if err != nil {
			return nil, err
		}
		following.Following = &user
		followings = append(followings, following)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return &followings, nil
}

func GetFollowers(userId int) (*[]types.Follower, error) {
	if userId < 1 {
		return nil, errors.New("invalid user id")
	}

	query := `
	SELECT
	users.id, users.first_name, users.last_name, users.nick_name, users.avatar, users.privacy, approved FROM followers
	INNER JOIN
	users
	ON
	users.id = follower
	WHERE
	followee = ?`

	rows, err := db.Query(query, userId)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	followers := []types.Follower{}

	for rows.Next() {
		user := types.User{}
		follower := types.Follower{}
		err = rows.Scan(&(user.Id), &(user.FirstName), &(user.LastName), &(user.NickName), &(user.Avatar), &(user.Privacy), &(follower.Approved))
		if err != nil {
			return nil, err
		}
		follower.Follower = &user
		followers = append(followers, follower)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return &followers, nil
}

func ApproveFollower(follower int, followee int) error {

	fmt.Println("Approve: ", follower, followee)
	sql := `
	UPDATE followers
	SET approved = true
	WHERE follower = ? AND followee = ?;	
	`

	statement, err := db.Prepare(sql)

	if err != nil {
		return err
	}

	defer statement.Close()

	_, err = statement.Exec(follower, followee)

	if err != nil {
		return err
	}

	return nil
}
