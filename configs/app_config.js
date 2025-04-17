import configData from "./app_config.json" with {type : "json"}

const aria2_configs = configData.aria2_configs
const db_configs = configData.db_configs
const app_configs = configData.app_configs
const keys_configs = configData.keys_configuration

export { aria2_configs, db_configs, app_configs, keys_configs}
