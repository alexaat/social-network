package sqlite

import (
	"database/sql"

	"github.com/golang-migrate/migrate"
	"github.com/golang-migrate/migrate/database/sqlite3"
	"github.com/golang-migrate/migrate/source/file"
)

var db *sql.DB

func CreateDatabase() (*sql.DB, error) {

	dbLocal, err := sql.Open("sqlite3", "./db/social.db")

	db = dbLocal

	if err != nil {
		return nil, err
	}

	//defer db.Close()

	//
	// sql := "UPDATE schema_migrations SET dirty=?"
	// statement, err := db.Prepare(sql)
	// if err != nil {
	// 	fmt.Println(err)
	// } else {
	// 	defer statement.Close()
	// 	_, err := statement.Exec(false)
	// 	if err != nil {
	// 		fmt.Println(err)
	// 	}

	// }

	//

	instance, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		return nil, err
	}

	fSrc, err := (&file.File{}).Open("./db/migrations")
	if err != nil {
		return nil, err
	}

	m, err := migrate.NewWithInstance("file", fSrc, "sqlite3", instance)
	if err != nil {
		return nil, err
	}

	// modify for Down
	if err := m.Up(); err != nil {
		return nil, err
	}

	return db, nil
}
