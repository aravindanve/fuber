source "`dirname $0`/config.sh"

# syntax
# createadmin.sh username password

if [ "$1" != '' ]; then
    LOGIN_NAME="$1"
else
    LOGIN_NAME="$PROJECT_DB_NAME"
fi
if [ "$2" != '' ]; then
    LOGIN_PWD="$2"
else
    LOGIN_PWD='password'
fi
if [ "$3" == 'test' ]; then
    DB_NAME="$PROJECT_DB_NAME"Test
else
    DB_NAME="$PROJECT_DB_NAME"
fi

# kill if mongod running
set -o pipefail
if [ "`pgrep mongod`" != '' ]; then
    sudo kill -9 `pgrep mongod` || true
fi

# start mongod
mongod -f "$MONGO_CONF_NOAUTH" --noauth --fork --logpath /dev/null

# insert user
printf "use $DB_NAME\n\
    db.dropUser('$LOGIN_NAME'); \
    db.createUser({ \
        user: '$LOGIN_NAME', \
        pwd: '$LOGIN_PWD', \
        roles: ['readWrite'] \
    });" | mongo

# kill mongod
if [ "`pgrep mongod`" != '' ]; then
    sudo kill -9 `pgrep mongod` || true
fi