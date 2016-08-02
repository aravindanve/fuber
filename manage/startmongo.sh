source "`dirname $0`/config.sh"

mongod -f "$MONGO_CONF" --auth