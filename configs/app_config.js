import configData from "./app_config.json" assert {type : "json"}

const aria2_configs = configData.aria2_configs
const user_auth_db_configs = configData.user_auth_db_configs
const session_configs = configData.session_configs
const file_manager_configs = configData.fileManagerConfigs
const keys_configs = configData.keys_configuration
const socketio_configs = configData.socketioConfigs

export { aria2_configs, user_auth_db_configs, session_configs, file_manager_configs, keys_configs, socketio_configs}
