package sqlite

import (
	"fmt"
	types "my-social-network/types"
	util "my-social-network/util"
	"strings"
)

func SaveUser(user *types.User) (int64, error) {

	statement, err := db.Prepare("INSERT INTO users (first_name, last_name, date_of_birth, nick_name, email, password, about_me, avatar, privacy) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)")

	if err != nil {
		return -1, err
	}
	defer statement.Close()

	result, err := statement.Exec(
		user.FirstName,
		user.LastName,
		user.DateOfBirth,
		user.NickName,
		strings.TrimSpace(strings.ToLower(user.Email)),
		util.Encrypt(user.Password),
		user.AboutMe,
		user.Avatar,
		strings.TrimSpace(strings.ToLower(user.Privacy)))

	if err != nil {
		return -1, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return -1, err
	}
	return id, nil
}

/*
func SaveUser(
	fileName string,
	firstName string,
	lastName string,
	nickName string,
	dateOfBirthMilli int64,
	email string,
	password string,
	aboutMe string,
) (int64, error) {

	statement, err := db.Prepare("INSERT INTO users (first_name, last_name, date_of_birth, nick_name, email, password, about_me, avatar) VALUES(?, ?, ?, ?, ?, ?, ?, ?)")

	if err != nil {
		return -1, err
	}
	defer statement.Close()

	result, err := statement.Exec(firstName, lastName, dateOfBirthMilli, nickName, strings.TrimSpace(strings.ToLower(email)), util.Encrypt(password), aboutMe, fileName)
	if err != nil {
		return -1, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return -1, err
	}
	return id, nil
}
*/

func GetUserBySessionId(session_id string) (*types.User, error) {

	if strings.TrimSpace(session_id) == "" {
		return nil, nil
	}

	query := `
	SELECT * FROM users
	WHERE
	id = 
		(SELECT user_id FROM session WHERE session_id = ? LIMIT 1)
	LIMIT 1
	`
	rows, err := db.Query(query, session_id)

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var user *types.User = nil
	for rows.Next() {
		user = &types.User{}
		err = rows.Scan(
			&(user.Id),
			&(user.FirstName),
			&(user.LastName),
			&(user.DateOfBirth),
			&(user.NickName),
			&(user.Email),
			&(user.Password),
			&(user.AboutMe),
			&(user.Avatar),
			&(user.Privacy))

		if err != nil {
			return nil, err
		}
	}
	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserByEmailOrNickNameAndPassword(user types.User) (*types.User, error) {
	u := types.User{}

	// Get By Email
	rows, err := db.Query("SELECT * FROM users WHERE email = ?", strings.ToLower(strings.TrimSpace(user.NickName)))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		err = rows.Scan(
			&(u.Id),
			&(u.FirstName),
			&(u.LastName),
			&(u.DateOfBirth),
			&(u.NickName),
			&(u.Email),
			&(u.Password),
			&(u.AboutMe),
			&(u.Avatar),
			&(u.Privacy))

		if err != nil {
			return nil, err
		}
		if util.CompairPasswords(u.Password, user.Password) {
			return &u, nil
		}
	}
	err = rows.Err()
	if err != nil {
		return nil, err
	}
	// Get By Nick Name
	rows, err = db.Query("SELECT * FROM users WHERE nick_name = ?", strings.TrimSpace(user.NickName))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		err = rows.Scan(
			&(u.Id),
			&(u.FirstName),
			&(u.LastName),
			&(u.DateOfBirth),
			&(u.NickName),
			&(u.Email),
			&(u.Password),
			&(u.AboutMe),
			&(u.Avatar),
			&(u.Privacy))

		if err != nil {
			return nil, err
		}
		if util.CompairPasswords(u.Password, user.Password) {
			return &u, nil
		}
	}
	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return nil, nil
}

/*
  "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TEXT NOT NULL,
    "nick_name" TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "about_me" TEXT,
    "avatar" TEXT,
    "privacy" TEXT NOT NULL
*/

func UpdateUser(user *types.User) error {
	fmt.Println(user)
	query := `
	UPDATE users
	SET
	first_name = ?,
	last_name = ?,
	date_of_birth = ?,
	nick_name = ?,
	email = ?,
	password = ?,
	about_me = ?,
	avatar = ?,
	privacy = ?
	WHERE id = ?`

	statement, err := db.Prepare(query)

	if err != nil {
		return err
	}

	defer statement.Close()

	_, err = statement.Exec(
		user.FirstName,
		user.LastName,
		user.DateOfBirth,
		user.NickName,
		user.Email,
		user.Password,
		user.AboutMe,
		user.Avatar,
		user.Privacy,
		user.Id)

	if err != nil {
		return err
	}

	return nil

}

func GetUserById(id int) (*types.User, error) {

	query := `
	SELECT * FROM users
	WHERE
	id = ?		
	LIMIT 1
	`
	rows, err := db.Query(query, id)

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var user *types.User = nil
	for rows.Next() {
		user = &types.User{}
		err = rows.Scan(
			&(user.Id),
			&(user.FirstName),
			&(user.LastName),
			&(user.DateOfBirth),
			&(user.NickName),
			&(user.Email),
			&(user.Password),
			&(user.AboutMe),
			&(user.Avatar),
			&(user.Privacy))

		if err != nil {
			return nil, err
		}
	}
	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return user, nil
}
