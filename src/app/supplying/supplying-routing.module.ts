import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SupplyingComponent } from './supplying.component';
import { PurchaseOrdersComponent } from './modules/purchase-order/purchase-orders/purchase-orders.component';
import { ArticlesComponent } from './modules/article/articles/articles.component';
import { PurchaseOrderComponent } from './modules/purchase-order/purchase-order/purchase-order.component';
import { PurchaseOrderReceptionComponent } from './modules/purchase-order/purchase-order-reception/purchase-order-reception.component';
import { ArticlesDetailComponent } from './modules/article/articles-detail/articles-detail.component';
import { BincardComponent } from './modules/article/bincard/bincard.component';
import { OrdersComponent } from './modules/order/orders/orders.component';
import { OrderDetailComponent } from './modules/order/order-detail/order-detail.component';
import { OrderNewComponent } from './modules/order/order-new/order-new.component';
import { MovementDispatchComponent } from './modules/movement/movement-dispatch/movement-dispatch.component';
import { MovementDispatchListComponent } from './modules/movement/movement-dispatch-list/movement-dispatch-list.component';
import { MovementDispatchDetailComponent } from './modules/movement/movement-dispatch-detail/movement-dispatch-detail.component';
import { MovementDispatchmentComponent } from './modules/movement/movement-dispatchment/movement-dispatchment.component';
import { MassiveCodificationComponent } from './modules/massive-codification/massive-codification.component';
import { ManualPurchaseOrderComponent } from './modules/purchase-order/manual-purchase-order/manual-purchase-order.component';
import { ProviderDevolutionComponent } from './modules/purchase-order/provider-devolution/provider-devolution.component';
import { ProvidersComponent } from './modules/provider/providers/providers.component';
import { LocationsComponent } from './modules/locations/location-list/locations.component';
import { ProviderCreateComponent } from './modules/provider/provider-create/provider-create.component';
import { CostCenterCreateComponent } from './modules/cost-centers/cost-center-create/cost-center-create.component';
import { CostCentersComponent } from './modules/cost-centers/cost-center-list/cost-centers.component';
import { LocationCreateComponent } from './modules/locations/location-create/location-create.component';
import { CostCenterDetailComponent } from './modules/cost-centers/cost-center-detail/cost-center-detail.component';
import { LocationDetailComponent } from './modules/locations/location-detail/location-detail.component';
import { ProviderDetailComponent } from './modules/provider/provider-detail/provider-detail.component';
import { AgreementEditComponent } from './modules/agreement/agreement-edit/agreement-edit.component';
import { AgreementCreateComponent } from './modules/agreement/agreement-create/agreement-create.component';
import { AgreementListComponent } from './modules/agreement/agreement-list/agreement-list.component';
import { AgreementDetailComponent } from './modules/agreement/agreement-detail/agreement-detail.component';
import { AgreementFineCreateComponent } from './modules/agreement/agreement-fine-create/agreement-fine-create.component';
import { AgreementFineEditComponent } from './modules/agreement/agreement-fine-edit/agreement-fine-edit.component';
import { AgreementFineDetailComponent } from './modules/agreement/agreement-fine-detail/agreement-fine-detail.component';
import { SupplyingDashboardComponent } from './modules/supplying-dashboard/supplying-dashboard.component';
import { ServiceListComponent } from './modules/service/service-list/service-list.component';
import { ServiceCreateComponent } from './modules/service/service-create/service-create.component';
import { ServiceDetailComponent } from './modules/service/service-detail/service-detail.component';
import { StockAdjustComponent } from './modules/stock-adjust/stock-adjust/stock-adjust.component';

const routes: Routes = [
  {
    path: '',
    component: SupplyingComponent,
    children:
      [
        {
          path: '',
          redirectTo: 'dashboard',
          pathMatch: 'full'
        },
        {
          path: 'dashboard',
          data: {
            breadcrumb: 'Bandeja'
          },
          component: SupplyingDashboardComponent
        },
        {
          path: 'purchase-orders',
          data: {
            breadcrumb: 'Ordenes de compra'
          },
          children:
            [
              {
                path: '',
                component: PurchaseOrdersComponent,
                data: {
                  breadcrumb: 'Listado'
                },
              },
              {
                path: 'manual',
                data: {
                  breadcrumb: 'OC manual'
                },
                component: ManualPurchaseOrderComponent
              },
              {
                path: 'return/:code',
                data: {
                  breadcrumb: 'Devolución a proveedor'
                },
                component: ProviderDevolutionComponent
              },
              {
                path: 'detail/:code',
                data: {
                  breadcrumb: 'Detalle de OC'
                },
                component: PurchaseOrderComponent
              },
              {
                path: 'reception/:code',
                data: {
                  breadcrumb: 'Recepción de OC'
                },
                component: PurchaseOrderReceptionComponent
              },
            ]
        },
        {
          path: 'articles',
          data: {
            breadcrumb: 'Articulos'
          },
          children:
            [
              {
                path: '',
                component: ArticlesComponent,
                data: {
                  breadcrumb: 'Listado de articulos'
                },
              },
              {
                path: 'detail/:code',
                data: {
                  breadcrumb: 'Detalle de articulo'
                },
                component: ArticlesDetailComponent
              },
              {
                path: 'bincard',
                data: {
                  breadcrumb: 'Bincard'
                },
                component: BincardComponent
              },
              {
                path: 'services',
                data: {
                  breadcrumb: 'Servicios'
                },
                children:
                  [
                    {
                      path: '',
                      data: {
                        breadcrumb: 'Listado'
                      },
                      component: ServiceListComponent
                    },
                    {
                      path: 'create',
                      data: {
                        breadcrumb: 'Creacion de servicio'
                      },
                      component: ServiceCreateComponent
                    },
                    {
                      path: 'detail/:id',
                      data: {
                        breadcrumb: 'Detalle de servicio'
                      },
                      component: ServiceDetailComponent
                    },
                  ]
              },
            ]
        },
        {
          path: 'orders',
          data: {
            breadcrumb: 'Pedidos'
          },
          children:
            [
              {
                path: '',
                component: OrdersComponent,
                data: {
                  breadcrumb: 'Listar pedidos'
                },
              },
              {
                path: 'detail/:movementId',
                data: {
                  breadcrumb: 'Detalle del pedido'
                },
                component: OrderDetailComponent
              },
              {
                path: 'create',
                data: {
                  breadcrumb: 'Nuevo pedido'
                },
                component: OrderNewComponent
              },
            ]
        },
        {
          path: 'dispatches',
          data: {
            breadcrumb: 'Despachos'
          },
          children:
            [
              {
                path: '',
                data: {
                  breadcrumb: 'Listado de despachos'
                },
                component: MovementDispatchListComponent,
              },
              {
                path: 'detail/:movementId',
                data: {
                  breadcrumb: 'detalle del despacho'
                },
                component: MovementDispatchDetailComponent
              },
              {
                path: 'recept/:movementId',
                data: {
                  breadcrumb: 'Recepcionar despacho'
                },
                component: MovementDispatchmentComponent
              },
            ]
        },
        {
          path: 'movements',
          data: {
            breadcrumb: 'Movimiento'
          },
          children:
            [
              {
                path: 'create',
                data: {
                  breadcrumb: 'Crear movimiento'
                },
                component: MovementDispatchComponent
              },
              {
                path: '',
                redirectTo: '/create',
                pathMatch: 'full'
              },
            ]

        },
        {
          path: 'stock-adjust',
          data: {
            breadcrumb: 'Ajustes de stock'
          },
          children:
            [{
              path: '',
              data: {
                breadcrumb: 'Listado'
              },
              component: StockAdjustComponent,
            },]
        },
        {
          path: 'providers',
          data: {
            breadcrumb: 'Proveedores'
          },
          children:
            [
              {
                path: '',
                data: {
                  breadcrumb: 'Listado'
                },
                component: ProvidersComponent,
              },
              {
                path: 'create',
                data: {
                  breadcrumb: 'Crear proveedor'
                },
                component: ProviderCreateComponent
              },
              {
                path: 'detail/:id',
                data: {
                  breadcrumb: 'Detalle'
                },
                component: ProviderDetailComponent
              },
            ]

        },
        {
          path: 'locations',
          data: {
            breadcrumb: 'Ubicaciones'
          },
          children:
            [
              {
                path: '',
                data: {
                  breadcrumb: 'Listado'
                },
                component: LocationsComponent,
              },
              {
                path: 'create',
                data: {
                  breadcrumb: 'Crear ubicación'
                },
                component: LocationCreateComponent
              },
              {
                path: 'detail/:id',
                data: {
                  breadcrumb: 'Detalle ubicación'
                },
                component: LocationDetailComponent
              },
            ]
        },
        {
          path: 'cost-centers',
          data: {
            breadcrumb: 'Centros de costo'
          },
          children:
            [
              {
                path: '',
                data: {
                  breadcrumb: 'Listado'
                },
                component: CostCentersComponent,
              },
              {
                path: 'create',
                data: {
                  breadcrumb: 'Crear centro de costo'
                },
                component: CostCenterCreateComponent
              },
              {
                path: 'detail/:id',
                data: {
                  breadcrumb: 'Detalle del centro de costo'
                },
                component: CostCenterDetailComponent
              },
            ]

        },
        {
          path: 'agreements',
          data: {
            breadcrumb: 'Convenios'
          },
          children:
            [
              {
                path: '',
                data: {
                  breadcrumb: 'Listado'
                },
                component: AgreementListComponent,
              },
              {
                path: 'edit/:id',
                data: {
                  breadcrumb: 'Editar'
                },
                component: AgreementEditComponent
              },
              {
                path: 'create',
                data: {
                  breadcrumb: 'Crear'
                },
                component: AgreementCreateComponent
              },
              {
                path: 'detail/:id',
                data: {
                  breadcrumb: 'Detalle del convenio'
                },
                children:
                  [
                    {
                      path: '',
                      data: {
                        breadcrumb: ''
                      },
                      component: AgreementDetailComponent,
                    },
                    {
                      path: 'fines',
                      data: {
                        breadcrumb: 'multas'
                      },
                      children:
                        [
                          {
                            path: '',
                            redirectTo: 'create',
                            pathMatch: 'full'
                          },
                          {
                            path: 'create',
                            data: {
                              breadcrumb: 'Crear multa'
                            },
                            component: AgreementFineCreateComponent
                          },
                          {
                            path: 'edit/:fineid',
                            data: {
                              breadcrumb: 'Editar multa'
                            },
                            component: AgreementFineEditComponent
                          },
                          {
                            path: 'detail/:fineid',
                            data: {
                              breadcrumb: 'Detalle multa'
                            },
                            component: AgreementFineDetailComponent
                          }
                        ]
                    },


                  ]
              },


            ]

        },


        { path: 'massive-codification', component: MassiveCodificationComponent },

      ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplyingRoutingModule { }
