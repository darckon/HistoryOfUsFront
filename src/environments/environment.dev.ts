export const environment = {
  production: false,
  name: "Desarrollo",
  env_key: "dev_",
  backend_url: "https://api-erp.sistemasexpertos.cl:8000",
  WS_LOGIN_URL: "wss://api-erp.sistemasexpertos.cl:8000/ws/login/",
  media_path: "media",
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
  MOVEMENT_TYPE_RECEIVED_FROM_PROVIDER: 1

};