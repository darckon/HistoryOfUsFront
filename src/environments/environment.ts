export const environment = {
  production: false,
  name: "local",
  env_key: "local_",
  backend_url: "http://localhost:8000",
  media_path: "media",
  WS_LOGIN_URL: "wss://api-erp.sistemasexpertos.cl:8000/ws/login/",
  WS_NOTIFICATION_URL: "wss://api-erp.sistemasexpertos.cl:8000/ws/notification/",

  CELLAR: true,
  DRUGSTORE: false,
  PROVIDER: false,
  COSTCENTER: false,
  PATIENT: false,

  DOCUMENT_TYPE_OC: 1,

  LOCATION_TYPE_CELLAR: 1,
  LOCATION_TYPE_DRUGSTORE: 2,
  LOCATION_TYPE_PROVIDER: 3,
  LOCATION_TYPE_COST_CENTER: 4,
  LOCATION_TYPE_PATIENT: 5,

  MOVEMENT_TYPE_MOVEMENT: 3,
  MOVEMENT_TYPE_ORDER: 2,
  MOVEMENT_TYPE_RECEIVED_FROM_PROVIDER: 1,

  MOVEMENT_TYPE__UNIQUE_ACCION__STOCK_ADJUST: 4
};