package sqlite

import (
	"fmt"
	types "my-social-network/types"
	"time"
)

func SaveNotification(n types.Notification) error {

	statement, err := db.Prepare("INSERT INTO notifications (date, content, sender_id, recipient_id, is_read) VALUES(?,?,?,?,?)")

	if err != nil {
		return err
	}

	defer statement.Close()

	date := time.Now().UnixNano() / 1000000

	_, err = statement.Exec(date, n.Content, n.Sender.Id, n.RecipientId, false)

	if err != nil {
		return err

	}
	return nil

}

func GetNotifications(userId int) (*[]types.Notification, error) {

	notifications := []types.Notification{}

	sql := `
	SELECT
		notifications.id,
		notifications.date,
		notifications.content,
		users.id,
		users.first_name,
		users.last_name,
		users.nick_name,
		users.date_of_birth,
		users.email,
		users.password,
		users.about_me,
		users.avatar,
		users.privacy,
		notifications.recipient_id,
		notifications.is_read
	FROM notifications
	INNER JOIN users
	ON
	notifications.sender_id = users.id
	WHERE
	notifications.recipient_id = ?
	ORDER BY date DESC`

	rows, err := db.Query(sql, userId)

	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	for rows.Next() {
		notification := types.Notification{}
		sender := types.User{}

		err = rows.Scan(
			&(notification.Id),
			&(notification.Date),
			&(notification.Content),
			&(sender.Id),
			&(sender.FirstName),
			&(sender.LastName),
			&(sender.NickName),
			&(sender.DateOfBirth),
			&(sender.Email),
			&(sender.Password),
			&(sender.AboutMe),
			&(sender.Avatar),
			&(sender.Privacy),
			&(notification.RecipientId),
			&(notification.IsRead))
		if err != nil {
			return nil, err
		}
		notification.Sender = &sender
		notifications = append(notifications, notification)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return &notifications, nil
}
