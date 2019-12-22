import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupplyingRoutingModule } from './supplying-routing.module';
import { SupplyingComponent } from './supplying.component';

import { PurchaseOrdersComponent } from './modules/purchase-order/purchase-orders/purchase-orders.component';
import { PurchaseOrderComponent, DialogTransferDialog } from './modules/purchase-order/purchase-order/purchase-order.component';
import { ArticlesComponent } from './modules/article/articles/articles.component';

import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from "@angular/flex-layout";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SeisMaterialModule } from '../material-module';
import { MatInputModule } from '@angular/material';
import { PurchaseOrderReceptionComponent, DialogOrderReceptionDialog } from './modules/purchase-order/purchase-order-reception/purchase-order-reception.component';

import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../core/core.module';
import { HttpClient } from '@angular/common/http';
import { ArticlesDetailComponent } from './modules/article/articles-detail/articles-detail.component';
import { BincardComponent } from './modules/article/bincard/bincard.component';
import { IvaPipe, TaxPipe, TaxValuePipe, NewTaxPipe } from '../core/pipes/iva.pipe';


import { PurchaseOrderInfoComponent } from './modules/purchase-order/purchase-order-info/purchase-order-info.component';
import { ArticleInfoComponent } from './modules/article/article-info/article-info.component';
import { OrdersComponent } from './modules/order/orders/orders.component';
import { OrderDetailComponent, } from './modules/order/order-detail/order-detail.component';
import { OrderDetailTargetDialog } from './modules/order/order-detail/OrderDetailTargetDialog';

import { OrderInfoComponent } from './modules/order/order-info/order-info.component';
import { OrderNewComponent, OrderNewDialog } from './modules/order/order-new/order-new.component';

import { ArticleAutocompleteComponent } from './modules/article/article-autocomplete/article-autocomplete.component';
import { MovementDispatchComponent, MovementNewDialog } from './modules/movement/movement-dispatch/movement-dispatch.component';
import { MovementDispatchListComponent } from './modules/movement/movement-dispatch-list/movement-dispatch-list.component';
import { MovementDispatchDetailComponent, MovementDispatchDetailDialog } from './modules/movement/movement-dispatch-detail/movement-dispatch-detail.component';


import { TooltipModule } from 'ng2-tooltip-directive';
import { SeisMatPopoverModule } from 'src/app/core/components/popover/popover.module';
import { LoanComponent } from './modules/movement/forms/loan/loan.component';
import { ReturnComponent } from './modules/movement/forms/return/return.component'

import { MovementRecordComponent } from './modules/movement/movement-record/movement-record.component';
import { MovementDispatchmentComponent } from './modules/movement/movement-dispatchment/movement-dispatchment.component';
import { MovementDispatchHistoryComponent } from './modules/movement/movement-dispatch-history/movement-dispatch-history.component';

import { MassiveCodificationComponent } from './modules/massive-codification/massive-codification.component';

import { MovementHeaderComponent } from './modules/movement/movement-header/movement-header.component';
import { MovementArticleListComponent } from './modules/movement/movement-article-list/movement-article-list.component';
import { MovementDispatchInfoComponent } from './modules/movement/movement-dispatch-info/movement-dispatch-info.component';
import { MassiveCodificationDialog } from './modules/massive-codification/MassiveCodificationDialog.component';
import { MassiveCodificationTargetsDialog } from './modules/massive-codification/MassiveCodificationTargetDialog';
import { MovementDispatchDetailTargetDialog } from './modules/movement/movement-dispatch-detail/MovementDispatchDetailTargetDialog';
import { MovementDispatchCancelDialog } from './modules/movement/movement-dispatch-detail/MovementDispatchCancelDialog';
import { MovementDispatchDetailPackingFactorDialog } from './modules/movement/movement-dispatch-detail/MovementDispatchDetailPackingFactorDialog.component';
import { ManualPurchaseOrderComponent } from './modules/purchase-order/manual-purchase-order/manual-purchase-order.component';
import { MovementDescriptionCardComponent } from './modules/movement/movement-description-card/movement-description-card.component';
import { ProviderAutocompleteComponent } from './modules/provider/provider-autocomplete/provider-autocomplete.component';
import { ProviderDevolutionComponent } from './modules/purchase-order/provider-devolution/provider-devolution.component';
import { MovementDispatchListConsolidatedDialog } from './modules/movement/movement-dispatch-list/movement-dispatch-list-consolidated-dialog.component';
import { ProvidersComponent } from './modules/provider/providers/providers.component';
import { LocationsComponent } from './modules/locations/location-list/locations.component';
import { ProviderCreateComponent } from './modules/provider/provider-create/provider-create.component';
import { CostCenterCreateComponent } from './modules/cost-centers/cost-center-create/cost-center-create.component';
import { CostCentersComponent } from './modules/cost-centers/cost-center-list/cost-centers.component';
import { LocationCreateComponent } from './modules/locations/location-create/location-create.component';
import { LocationDetailComponent } from './modules/locations/location-detail/location-detail.component';
import { CostCenterDetailComponent } from './modules/cost-centers/cost-center-detail/cost-center-detail.component';
import { ProviderDetailComponent } from './modules/provider/provider-detail/provider-detail.component';
import { SeisModule } from '../seis-module';
import { AgreementListComponent } from './modules/agreement/agreement-list/agreement-list.component';
import { AgreementCreateComponent } from './modules/agreement/agreement-create/agreement-create.component';
import { AgreementEditComponent } from './modules/agreement/agreement-edit/agreement-edit.component';
import { CostCenterAutocompleteComponent } from './modules/cost-centers/cost-center-autocomplete/cost-center-autocomplete.component';
import { LicitationAutocompleteComponent } from './modules/licitations/licitation-autocomplete/licitation-autocomplete.component';
import { AgreementDetailComponent } from './modules/agreement/agreement-detail/agreement-detail.component';
import { PurchaseOrderAutocompleteComponent } from './modules/purchase-order/purchase-order-autocomplete/purchase-order-autocomplete.component';
import { AgreementPopoverComponent } from './modules/agreement/agreement-popover/agreement-popover.component';
import { AgreementFineComponent } from './modules/agreement/agreement-fine/agreement-fine.component';
import { AgreementFineCreateComponent } from './modules/agreement/agreement-fine-create/agreement-fine-create.component';
import { AgreementFineEditComponent } from './modules/agreement/agreement-fine-edit/agreement-fine-edit.component';
import { PurchaseOrderPopupComponent } from './modules/purchase-order/purchase-order-popup/purchase-order-popup.component';
import { SupplyingDashboardComponent } from './modules/supplying-dashboard/supplying-dashboard.component';
import { ServiceCreateComponent } from './modules/service/service-create/service-create.component';
import { ServiceDetailComponent } from './modules/service/service-detail/service-detail.component';
import { ServiceListComponent } from './modules/service/service-list/service-list.component';
import { StockAdjustComponent } from './modules/stock-adjust/stock-adjust/stock-adjust.component';
import { AgreementFineDetailComponent } from './modules/agreement/agreement-fine-detail/agreement-fine-detail.component';

@NgModule({
  imports: [
    CommonModule,
    SeisModule,
    SupplyingRoutingModule,
    FlexLayoutModule,
    LayoutModule,
    ReactiveFormsModule,
    FormsModule,
    SeisMaterialModule,
    MatInputModule,
    TooltipModule,
    SeisMatPopoverModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    SupplyingComponent,
    ArticlesComponent,
    PurchaseOrdersComponent,
    PurchaseOrderComponent,
    DialogTransferDialog,
    DialogOrderReceptionDialog,
    MassiveCodificationDialog,
    MassiveCodificationTargetsDialog,
    MovementDispatchDetailTargetDialog,
    MovementDispatchDetailPackingFactorDialog,
    MovementDispatchCancelDialog,
    MovementDispatchDetailDialog,
    MovementDispatchListConsolidatedDialog,
    OrderNewDialog,
    MovementNewDialog,
    PurchaseOrderReceptionComponent,
    ArticlesDetailComponent,
    IvaPipe,
    TaxPipe,
    TaxValuePipe,
    NewTaxPipe,
    BincardComponent,
    PurchaseOrderInfoComponent,
    ArticleInfoComponent,
    OrdersComponent,
    OrderDetailComponent,
    OrderDetailTargetDialog,
    OrderInfoComponent,
    OrderNewComponent,
    ArticleAutocompleteComponent,
    PurchaseOrderAutocompleteComponent,
    MovementDispatchComponent,
    MovementDispatchListComponent,
    MovementDispatchDetailComponent,
    LoanComponent,
    ReturnComponent,
    MovementRecordComponent,
    MovementDispatchmentComponent,
    MovementDispatchHistoryComponent,
    MassiveCodificationComponent,
    MovementHeaderComponent,
    MovementArticleListComponent,
    MovementDispatchInfoComponent,
    ManualPurchaseOrderComponent,
    MovementDescriptionCardComponent,
    ProviderAutocompleteComponent,
    ProviderDevolutionComponent,
    ProvidersComponent,
    LocationsComponent,
    CostCentersComponent,
    ProviderCreateComponent,
    CostCenterCreateComponent,
    LocationCreateComponent,
    LocationDetailComponent,
    CostCenterDetailComponent,
    ProviderDetailComponent,
    AgreementListComponent,
    AgreementCreateComponent,
    AgreementEditComponent,
    CostCenterAutocompleteComponent,
    LicitationAutocompleteComponent,
    AgreementDetailComponent,
    AgreementPopoverComponent,
    AgreementFineComponent,
    AgreementFineCreateComponent,
    AgreementFineEditComponent,
    PurchaseOrderPopupComponent,
    SupplyingDashboardComponent,
    ServiceCreateComponent,
    ServiceDetailComponent,
    ServiceListComponent,
    StockAdjustComponent,
    AgreementFineDetailComponent
  ],
  entryComponents: [DialogTransferDialog,
    DialogOrderReceptionDialog,
    OrderNewDialog,
    OrderDetailTargetDialog,
    MovementDispatchDetailDialog,
    MovementDispatchListConsolidatedDialog,
    MovementDispatchDetailTargetDialog,
    MovementDispatchCancelDialog,
    MovementDispatchDetailPackingFactorDialog,
    MovementNewDialog,
    MassiveCodificationDialog,
    MassiveCodificationTargetsDialog],
  exports: [
    SeisMaterialModule,
    FlexLayoutModule,
    LayoutModule,
    PurchaseOrdersComponent,
    IvaPipe,
  ],
  providers: [
    TranslateService
  ]
})
export class SupplyingModule { }
