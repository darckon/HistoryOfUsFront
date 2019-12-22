export class SupplyingConstants {
  public static MOVEMENT_TYPE_COST_CENTER = 3; //Despacho servicio
  public static MOVEMENT_TYPE_CELLAR = 2; //Despacho bodega
  public static MOVEMENT_TYPE_LOAN = 4; //Despacho prestamo
  public static MOVEMENT_TYPE_DEVOLUTION = 10; //Despachop devolucion

  public static ORIGIN_TYPE_CELLAR = 1;
  public static ORIGIN_TYPE_COST_CENTER = 4;
  public static ORIGIN_TYPE_HEALTH_NETWORK = 6;
  public static ORIGIN_TYPE_INTERNAL = 7;

  public static MOVEMENT_TYPE_RETURN = 10;


  public static MOVEMENT_STATE_REQUESTED = 8;
  public static MOVEMENT_STATE_ORDER_MODIFIED = 15;
  public static MOVEMENT_STATE_ORDER_PARTIAL_RECEPT = 11;
  public static MOVEMENT_STATE_ORDER_SENT = 9;
  public static MOVEMENT_STATE_ORDER_AUTHORIZED = 16;
  public static MOVEMENT_STATE_DEVOLUTION_TO_CELLAR = 21;
  public static MOVEMENT_STATE_DEVOLUTION_TO_INSTITUTION = 28;
  public static MOVEMENT_STATE_ORDER_REJECTED = 24;
  public static MOVEMENT_STATE_LOAN_TO_CELLAR = 27;
  public static MOVEMENT_STATE_LOAN_TO_INSTITUTION = 29;


  public static TRANSACTION_STATUS_TRANSIT = 0;
  public static TRANSACTION_STATUS_ACCEPTED = 1;
  public static TRANSACTION_STATUS_CANCELED = 2;

  public static VIEW_TYPE_ORDER = 1;
  public static VIEW_TYPE_CELLAR = 2;

  public static CHOICE_TYPE_CATEGORY_ARTICLE = 0
  public static CHOICE_TYPE_CATEGORY_SERVICE = 1
  public static TAX_CATEGORY_EXENT = 1
  public static TAX_CATEGORY_IVA = 2
  public static TAX_CATEGORY_10 = 3

  public static M = new Map([
    ['institution', ['id', 1]]
  ])

}