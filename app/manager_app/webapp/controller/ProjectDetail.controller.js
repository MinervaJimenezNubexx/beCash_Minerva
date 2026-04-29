sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, History, UIComponent, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.nbx.managerapp.controller.ProjectDetail", {

        onInit: function () {
            let oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteProjectDetail").attachPatternMatched(this._onObjectMatched, this);

            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        _onObjectMatched: function (oEvent) {
            let sProjectId = oEvent.getParameter("arguments").projectId;

            this.getView().bindElement({
                path: "/Projects(" + sProjectId + ")"
            });

            let oObjHeader = this.byId("objHeader");
            oObjHeader.bindElement({
                path: "/ManagerProjectFinancesView(" + sProjectId + ")"
            });

            let oIconTabFilterINFO = this.byId("idInfoContainer");
            oIconTabFilterINFO.bindElement({
                path: "/ProjectDetailsView(" + sProjectId + ")"
            });

            let oIconTabFilterTEAM = this.byId("idTeamTable");
            oIconTabFilterTEAM.bindElement({
                path: "/ProjectTeamView(" + sProjectId + ")",
                parameters: {
                    "$expand": "employeesAssigned($filter=isActiveOnThisProject eq true)"
                }
            });
        },

        onNavBack: function () {
            let oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                let oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain");
            }
        },

        onChangeStatus: function () {
            let oView = this.getView(),
                oContext = oView.getBindingContext();

            if (!oContext) return;

            oView.setBusy(true);
            let oOperation = oView.getModel().bindContext("ManagersService.advanceStatus(...)", oContext);

            oOperation.execute().then(() => {
                oView.setBusy(false);

                sap.m.MessageToast.show(this._o18n.getText("StatusUpdatedSuccess"));

                oContext.refresh();
                this.byId("objHeader").getBindingContext().refresh();
                oView.getModel().refresh();
            }).catch((oError) => {
                oView.setBusy(false);

                let sErrorMsg = this._o18n.getText("StatusUpdateError"),
                    aMsgs = sap.ui.getCore().getMessageManager().getMessageModel().getData(),
                    oLastError = aMsgs[aMsgs.length - 1];

                if (oLastError && oLastError.message) {
                    sErrorMsg = oLastError.message;
                }

                sap.m.MessageBox.error(sErrorMsg);
            });
        },

        onRemoveEmployee: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext(),
                sEmployeeId = oContext.getProperty("employee_ID"),
                oTable = this.byId("idTeamTable"),
                oProjectContext = oTable.getBindingContext();

            if (!oProjectContext) return;

            const oModel = oProjectContext.getModel(),
                oActionOData = oModel.bindContext("ManagersService.managerRemoveEmployeeFromProject(...)", oProjectContext);
            oActionOData.setParameter("employee_ID", sEmployeeId);

            oActionOData.execute().then(() => {
                sap.m.MessageToast.show("Empleado eliminado correctamente");
                oProjectContext.refresh();

            }).catch((oError) => {
                sap.m.MessageBox.error(oError.message);
            });
        }

    });
});