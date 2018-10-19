'use strict';
(function () {
    window.loginView = kendo.observable({
        onShow: function () {},
        afterShow: function () {},
        username: null,
        password: null,
        datacentre: null,
        submit: function () {
            if (!this.username) {
                alert("Email is required.");
                return;
            }
            if (!this.password) {
                alert("Password is required.");
                return;
            }
            if (!this.datacentre) {
                alert("Data Centre is required.");
                return;
            }
            $('#progressbar').fadeIn("slow");
            app.appTokenData.fetch();
        }
    });
    window.registerView = kendo.observable({
        submit: function () {
            if (!this.firstname) {
                alert("First name is required.");
                return;
            }
            if (!this.lastname) {
                alert("Last name is required.");
                return;
            }
            if (!this.email) {
                alert("Email is required.");
                return;
            }
            if (!this.datacentre) {
                alert("Data Centre is required.");
                return;
            }
            if (!this.collegeId) {
                alert("College ID is required.");
                return;
            }
            app.registerData.fetch();
            app.mobileApp.navigate("#login");
        }
    });
    window.pwChangeView = kendo.observable({
        autobind: false,
        submit: function () {
            if (!this.username) {
                alert("Email is required.");
                return;
            }
            if (!this.datacentre) {
                alert("Data centre is required");
                return;
            }
            if (!this.password) {
                alert("Password is required");
                return;
            }
            if (!this.collegeId) {
                alert("College Id is required");
                return;
            }
            app.resetPwData.fetch(); //we do a fetch since we can't update nothing
        }
    });

    window.calendarView = kendo.observable({
        navigate: function () {
        }
    });

    window.encounterView = kendo.observable({
        dataSource: app.encounterData,
        autoBind: false,
        submit: function () {
            if (this.clinicDoctor == "") {
                alert("Clinic Doctor is required");
                return;
            }
            if (this.provCode != "") {
                if ((this.phn == "") || (this.phn == null)) {
                    alert("PHN is required, if you selected a province");
                    return;
                }
            } else {
                if ((this.phn != "") || (this.phn != null)) {
                    alert("Do not include a phn if you have selected no coverage");
                    return;
                }
            }
            if (checkPHN(this.phn) == 0) {
            	return;
            }
            if (this.lastname == "") {
                alert("Last name is required");
                return;
            }
            if (this.firstname == "") {
                alert("First name is required");
                return;
            }
            if (this.dateOfBirth == null) {
            	alert("Date of birth needs to be in mm/dd/yyyy format");
            	return;
            }
            if (this.dateOfBirth == "") {
                alert("Date of birth is required");
                return;
            }
            if (this.gender == undefined) {
            	alert("You must select a gender");
            	return;
            }
            if (this.gender == "") {
                alert("Gender is required");
                return;
            }
            if ((this.insurerCode != null) && (this.insurerCode != "")) {
                if (!this.ihn) {
                    alert("Health number is required");
                    return;
                }
            } else {
                if ((this.ihn != "") || (this.ihn != null)) {
                    alert("You must select an insurer or leave the health # field blank");
                    return;
                }
            }
            if ((this.serviceDate == "") || (this.serviceDate == null)) {
            	alert("Service date is required");
            	return;
            }
            if ((this.startTime == "") || (this.startTime == null)) {
                alert("Start time is required");
                return;
            }

            if ((this.procCode == "") || (this.procCode == null)) {
                $("#tabstrip").select(1);
                alert("Procedure code is required");
                return;
            }

            var item = app.procedures.get(this.procId);
            var doc = app.clinicDocs.get(app.clinicDoctorId);
            if ((item.timeReq) ||
                (doc.specType == "Anes" && item.anesFee == false && item.critCare == false && item.specPhone == false)) {
                if ((this.stopTime == "") || (this.stopTime == null)) {
                    alert("Stop time is required");
                    return;
                }
            }
            if ((this.diseaseCode == "") || (this.diseaseCode == null)) {
                $("#tabstrip").select(1);
                alert("Disease code is required");
                return;
            }
            if ((this.locationCode.code == "") || (this.locationCode.code == null)) {
                $("#tabstrip").select(1);
                alert("Location code is required");
                return;
            }
            if ($("#toDayDiv").is(":visible") == true) {
                if (($('#toDay').data('kendoDatePicker').value() == "") ||
                    ($('#toDay').data('kendoDatePicker').value() == null)) {
                    alert("To Day is required for this procedure");
                    return;
                }
            }
            if (((this.feeCode1 ^= "") && (this.qty1 == "")) ||
            	((this.feeCode1 == "") && (this.qty1 > 0))) {
            	$("#tabstrip").select(3);
            	alert("You must provide both a fee code and a quantity");
            	return;
            }
            if (((this.feeCode2 ^= "") && (this.qty2 == "")) ||
            	((this.feeCode2 == "") && (this.qty2 > 0))) {
            	$("#tabstrip").select(3);
            	alert("You must provide both a fee code and a quantity");
            	return;
            }
            if (((this.feeCode3 ^= "") && (this.qty3 == "")) ||
            	((this.feeCode3 == "") && (this.qty3 > 0))) {
            	$("#tabstrip").select(3);
            	alert("You must provide both a fee code and a quantity");
            	return;
            }
            if (((this.feeCode4 ^= "") && (this.qty4 == "")) ||
            	((this.feeCode4 == "") && (this.qty4 > 0))) {
            	$("#tabstrip").select(3);
            	alert("You must provide both a fee code and a quantity");
            	return;
            }
            if (((this.feeCode5 ^= "") && (this.qty5 == "")) ||
            	((this.feeCode5 == "") && (this.qty5 > 0))) {
            	$("#tabstrip").select(3);
            	alert("You must provide both a fee code and a quantity");
            	return;
            }
            if (app.curEvent == 0) {
                app.encounterData.add({
                    firstname: this.firstname,
                    lastname: this.lastname,
                    initials: this.initials,
                    clinicDoctor: this.clinicDoctor,
                    clinicDoctorId: this.clinicDoctorId,
                    dateOfBirth: this.dateOfBirth,
                    phn: this.phn,
                    insurerCode: this.insurerCode.code,
                    ihn: this.ihn,
                    gender: this.gender,
                    procCode: this.procCode,
                    procId: this.procId,
                    diseaseCode: this.diseaseCode,
                    diseaseId: this.diseaseId,
                    locationCode: this.locationCode.code,
                    provCode: this.provCode.code,
                    street1: this.street1,
                    street2: this.street2,
                    cityCode: this.cityCode,
                    serviceDate: this.serviceDate,
                    startTime: this.startTime,
                    stopTime: this.stopTime,
                    type: "paid",
                    notes: this.notes,
                    patientId: this.patientId,
                    toDay: this.toDay,
                    callback: this.callback,
                    referralId: this.referralId,
                    serviceCode: app.clinicDocs.get(this.clinicDoctorId).serviceCode,
                    subFacility: app.clinicDocs.get(this.clinicDoctorId).subFacility,
                    scc: app.clinicDocs.get(this.clinicDoctorId).scc,
                    facility: app.clinicDocs.get(this.clinicDoctorId).facility,
                    serviceId1:0,
                    qty1: this.qty1,
                    feeCode1: this.feeCode1,
                    feeId1: this.feeId1,
                    serviceId2:0,
                    qty2: this.qty2,
                    feeCode2: this.feeCode2,
                    feeId2: this.feeId2,
                    serviceId3:0,
                    qty3: this.qty3,
                    feeCode3: this.feeCode3,
                    feeId3: this.feeId3,
                    serviceId4:0,
                    qty4: this.qty4,
                    feeCode4: this.feeCode4,
                    feeId4: this.feeId4,
                    serviceId5:0,
                    qty5: this.qty5,
                    feeCode5: this.feeCode5,
                    feeId5: this.feeId5
                });

            } else {
                app.encounterData.at(0).set("lastname", this.lastname);
                app.encounterData.at(0).set("firstname", this.firstname);
                app.encounterData.at(0).set("initials", this.initials);
                app.encounterData.at(0).set("street1", this.street1);
                app.encounterData.at(0).set("street2", this.street2);
                app.encounterData.at(0).set("cityCode", this.cityCode.code);
                app.encounterData.at(0).set("provCode", this.provCode.code);
                app.encounterData.at(0).set("phn", this.phn);
                app.encounterData.at(0).set("gender", this.gender);
                app.encounterData.at(0).set("insurerCode", this.insurerCode.code);
                app.encounterData.at(0).set("procCode", this.procCode);
                app.encounterData.at(0).set("procId", this.procId);
                app.encounterData.at(0).set("diseaseCode", this.diseaseCode);
                app.encounterData.at(0).set("diseaseId", this.diseaseId);
                app.encounterData.at(0).set("ihn", this.ihn);
                app.encounterData.at(0).set("clinicDoctor", this.clinicDoctor);
                app.encounterData.at(0).set("clinicDoctorId", this.clinicDoctorId);
                app.encounterData.at(0).set("serviceDate", this.serviceDate);
                if (this.startTime.length <= 5) {     //This can be a date format or just a number
                	app.encounterData.at(0).set("startTime",this.startTime);
                }
                else {
	                app.encounterData.at(0).set("startTime", this.startTime.getHours() + ":" + this.startTime.getMinutes());
                }
                if (this.stopTime.length <= 5) {     //This can be a date format or just a number
                	app.encounterData.at(0).set("stopTime",this.stopTime);
                }
                else {
	                app.encounterData.at(0).set("stopTime", this.stopTime.getHours() + ":" + this.stopTime.getMinutes());
                }
               	if (this.dateOfBirth.length <= 10) {
               		app.encounterData.at(0).set("dateOfBirth",this.dateOfBirth);
                }
                else {
                	app.encounterData.at(0).set("dateOfBirth", this.dateOfBirth.getMonth() + "/" + this.dateOfBirth.getDay() + "/" + this.dateOfBirth.getFullYear());
                }
                app.encounterData.at(0).set("locationCode", this.locationCode.code);
                app.encounterData.at(0).set("notes", this.notes);
                app.encounterData.at(0).set("patientId", this.patientId);
                app.encounterData.at(0).set("toDay", this.toDay);
                if (this.callback.length <= 5) {     //This can be a date format or just a number
                	app.encounterData.at(0).set("callback",this.callback);
                }
                else {
	                app.encounterData.at(0).set("callback", this.callback.getHours() + ":" + this.callback.getMinutes());
                }
                app.encounterData.at(0).set("referralId", this.referralId);
                app.encounterData.at(0).set("street1",this.street1);
                app.encounterData.at(0).set("street2",this.street2);
                app.encounterData.at(0).set("cityCode",this.cityCode.code);
                app.encounterData.at(0).set("qty1",this.qty1);
                app.encounterData.at(0).set("serviceId1",this.serviceId1);
                app.encounterData.at(0).set("serviceCode",app.clinicDocs.get(this.clinicDoctorId).serviceCode);
                app.encounterData.at(0).set("subFacility",app.clinicDocs.get(this.clinicDoctorId).subFacility);
                app.encounterData.at(0).set("facility",app.clinicDocs.get(this.clinicDoctorId).facility);
                app.encounterData.at(0).set("scc",app.clinicDocs.get(this.clinicDoctorId).scc);
                if (this.feeId1 != undefined) {
                    app.encounterData.at(0).set("feeCode1",app.feeCodes.get(this.feeId1).label);
                    app.encounterData.at(0).set("feeId1",this.feeId1);
                }
                else {
                    app.encounterData.at(0).set("feeCode1",0);
                    app.encounterData.at(0).set("feeId1",0);
                }
                app.encounterData.at(0).set("qty2",this.qty2);
                app.encounterData.at(0).set("serviceId2",this.serviceId2);
                if (this.feeId2 != undefined) {
                    app.encounterData.at(0).set("feeCode2",app.feeCodes.get(this.feeId2).label);
                    app.encounterData.at(0).set("feeId2",this.feeId2);
                }
                else {
                    app.encounterData.at(0).set("feeCode2",0);
                    app.encounterData.at(0).set("feeId2",0);
                }
                app.encounterData.at(0).set("qty3",this.qty3);
                app.encounterData.at(0).set("serviceId3",this.serviceId3);
                if (this.feeId3 != undefined) {
                    app.encounterData.at(0).set("feeCode3",app.feeCodes.get(this.feeId3).label);
                    app.encounterData.at(0).set("feeId3",this.feeId3);
                }
                else {
                    app.encounterData.at(0).set("feeCode3",0);
                    app.encounterData.at(0).set("feeId3",0);
                }
                app.encounterData.at(0).set("qty4",this.qty4);
                app.encounterData.at(0).set("serviceId4",this.serviceId4);
                if (this.feeId4 != undefined) {
                    app.encounterData.at(0).set("feeCode4",app.feeCodes.get(this.feeId4).label);
                    app.encounterData.at(0).set("feeId4",this.feeId4);
                }
                else {
                    app.encounterData.at(0).set("feeCode4",0);
                    app.encounterData.at(0).set("feeId4",0);
                }
                app.encounterData.at(0).set("qty5",this.qty5);
                app.encounterData.at(0).set("serviceId5",this.serviceId5);
                if (this.feeId5 != undefined) {
                    app.encounterData.at(0).set("feeCode5",app.feeCodes.get(this.feeId5).label);
                    app.encounterData.at(0).set("feeId5",this.feeId5);
                }
                else {
                    app.encounterData.at(0).set("feeCode5",0);
                    app.encounterData.at(0).set("feeId5",0);
                }
            }
            app.encounterData.sync();
            var tabToActivate = $("#demogTab");			//reset the tab before we leave the form
            $("#tabstrip").data("kendoTabStrip").activateTab(tabToActivate);
//		this happens after the update is completed
//	    if (app.calendarData._data.length > 0) {
//	        app.mobileApp.navigate("#calendar");
//	    }
//	    else {
//	       	app.mobileApp.navigate("#splash");
//	    }
        },
        findProc: function (e) {
            app.lookup = "procedure";
            app.mobileApp.navigate("#procLookup");
        },
        findFeeCode: function (e) {
            app.lookup = "feecode";
            if (e.sender.element[0].id == "findFeeCode1") {
            	app.feeIndex = 1;
            }
            else if (e.sender.element[0].id == "findFeeCode2") {
            	app.feeIndex = 2;
            }
            else if (e.sender.element[0].id == "findFeeCode3") {
            	app.feeIndex = 3;
            }
            else if (e.sender.element[0].id == "findFeeCode4") {
            	app.feeIndex = 4;
            }
            else if (e.sender.element[0].id == "findFeeCode5") {
            	app.feeIndex = 5;
            }
            app.mobileApp.navigate("#feeCodeLookup");
        },
        findDisease: function () {
            app.lookup = "disease";
            app.mobileApp.navigate("#diseaseLookup");
        },
        findClinicDoc: function () {
            app.source = "encounterView";
            app.lookup = "clinicDoctor";
            app.mobileApp.navigate("#clinicDocLookup");
        },
        findDoctor: function () {
            app.source = "encounterView";
            app.lookup = "doctor";
            app.mobileApp.navigate("#refLookup");
        },
        start: function () {
            var time = new Date();
            var disp = (time.getHours() + ":" + time.getMinutes());
            this.set('startTime', disp);
        },
        stop: function () {
            var time = new Date();
            var disp = (time.getHours() + ":" + time.getMinutes());
            this.set('stopTime', disp);
        },
        calledtime: function () {
            var time = new Date();
            var disp = (time.getHours() + ":" + time.getMinutes());
            this.set('callback', disp);
        },
        setProcCode: function (item) {
            this.set('procCode', item.label);
            this.set('procId', item.code);
            $('#filterX').val("");
            app.filterX();
        },
        setDiseaseCode: function (item) {
            this.set('diseaseCode', item.label);
            this.set('diseaseId', item.code);
            $('#filterY').val("");
            app.filterY();
        },
        setClinicDoc: function (item) {
            this.set("clinicDoctor", "(" +
                item.label + ") " +
                item.name);
            this.set('clinicDoctorId', item.id);
            $('#filterZ').val("");
            app.filterZ();
            app.clinicDoctor = item.label; //save this as the current favourite
            app.clinicDoctorId = item.id;
            if (($('#encStartTime').data('kendoTimePicker').value() != null) &&
                ($('#serviceDate').data('kendoDatePicker').value() != null)) {
                var sDate = new Date($('#serviceDate').data('kendoDatePicker').value());
                sDate.setHours($('#encStartTime').data('kendoTimePicker').value().getHours());
                sDate.setMinutes($('#encStartTime').data('kendoTimePicker').value().getMinutes());
            	allowCallback(sDate);
            }
            if (item.location > 0) {
                window.encounterView.set("locationCode", app.locations.get(item.location));
            }
            if (item.diseaseCode > 0) {
                window.encounterView.set("diseaseCode", app.diseases.get(item.diseaseCode).label);
                window.encounterView.set("diseaseId", app.diseases.get(item.diseaseCode).id);
            }
        },
        setReferral: function (item) {
            this.set("referral", item.name + " (" +
                item.msp + ") ");
            this.set('referralId', item.code);
        },
        setToDay: function (date) {
            var time = new Date(date);
            var disp = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();
            $('#toDay').data('kendoDatePicker').min(new Date(time.getFullYear(), time.getMonth(), time.getDate()));
            var month = time.getMonth() + 2;
            var year = time.getFullYear();
            if (month >= 12) {
                month = month - 12;
                year = year + 1;
            }
            //day 0 is before the first day of the next month, which cuts things off at the end of this month
            $('#toDay').data('kendoDatePicker').max(new Date(year, month, 0));

        },
        setFeeCode: function (item) {
            var key = "feeCode" + app.feeIndex;
 	    this.set(key,item.label);
 	    key = "feeId" + app.feeIndex;
 	    this.set(key,item.id);
        },
        cancel: function() {
            var tabToActivate = $("#demogTab");			//reset the tab before we leave the form
            $("#tabstrip").data("kendoTabStrip").activateTab(tabToActivate);
            //$('#tabstrip').kendoTabStrip().
	    if (app.calendarData._data.length > 0) {
	    	var treeview = $("#mainCalendar").data("kendoTreeView")
	    	treeview.select($());
	        app.mobileApp.navigate("#calendar");
	    }
	    else {
	       	app.mobileApp.navigate("#splash");
	    }
        }
    });

    window.activityView = kendo.observable({
        dataSource: app.activityData,
        submit: function () {
            if (this.clinicDoctor == "") {
                alert("Please select a clinic doctor");
                return;
            }
            if (this.activityType == "") {
                alert("Please select an activity");
                return;
            }
            if (this.startTime == "") {
                alert("Activity start time is required");
                return;
            }
            if (this.stopTime == "") {
                alert("Activity stop time is required");
                return;
            }
            if (app.curEvent == 0) {
                app.activityData.add({
                    clinicDoctor: this.clinicDoctor,
                    clinicDoctorId: this.clinicDoctorId,
                    startTime: this.startTime,
                    stopTime: this.stopTime,
                    type: "unpaid",
                    notes: this.notes,
                    activityTypeId: this.activityTypeId
                });

            } else {
                app.activityData.at(0).set("activityTypeId", this.activityTypeId);
                app.activityData.at(0).set("clinicDoctor", this.clinicDoctor);
                app.activityData.at(0).set("clinicDoctorId", this.clinicDoctorId);
                app.activityData.at(0).set("startTime", this.startTime);
                app.activityData.at(0).set("stopTime", this.stopTime);
                app.activityData.at(0).set("notes", this.notes);
            }
            app.activityData.sync();
        },
        start: function () {
            var time = new Date();
            var disp = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();
            this.set('startTime', disp);
        },
        stop: function () {
            var time = new Date();
            var disp = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();
            this.set('stopTime', disp);
        },
        findClinicDoc: function () {
            app.source = "activityView";
            app.lookup = "clinicDoctor";
            app.mobileApp.navigate("#clinicDocLookup");
        },
        setClinicDoc: function (item) {
            this.set("clinicDoctor", "(" +
                item.label + ") " +
                item.name);
            this.set('clinicDoctorId', item.id);
            $('#filterZ').val("");
            app.clinicDoctor = item.label; //save this as the current favourite
            app.clinicDoctorId = item.id;
        },
        findActivity: function () {
            app.lookup = "activities";
            app.mobileApp.navigate("#activityLookup");
        },
        setActivity: function (item) {
            this.set('activityType', item.description);
            this.set('activityTypeId', item.code);
            $('#filterW').val("");
            app.filterW();
        },
        cancel: function() {
	    if (app.calendarData._data.length > 0) {
	    	var treeview = $("#mainCalendar").data("kendoTreeView")
	    	treeview.select($());
	        app.mobileApp.navigate("#calendar");
	    }
	    else {
	       	app.mobileApp.navigate("#splash");
	    }
        }
    });

    window.procView = kendo.observable({
        localProcs: app.localProcs,
        flipProc: function (e) { // e in this case is an event object
            var item = e.data;
            var prItem = app.procedures.get(item.code); //Need to update the external source
            if (item.favourite == true) {
                item.set("favourite", false);
                prItem.set("favourite", false);
            } else {
                item.set("favourite", true);
                prItem.set("favourite", true);
            }
            app.procedures.sync();
            $("#proclist").data("kendoMobileListView").refresh();
        },
        setProcedure: function (e) { //e in this case is an event object
            var item = e.data;
            window.encounterView.setProcCode(item);
            if (item.toDay) {
                if (($('#serviceDate').data('kendoDatePicker').value() != "") &&
                    ($('#serviceDate').data('kendoDatePicker').value() != null)) {
                    var time = new Date($('#serviceDate').data('kendoDatePicker').value());
                    $('#toDay').data('kendoDatePicker').min(time);
//                    $('#toDay').data('kendoDatePicker').min(new Date(time.getFullYear(), time.getMonth(), 1));
                    var month = time.getMonth() + 1;
                    var year = time.getFullYear();
                    if (month == 12) {
                        month = 0;
                        year = year + 1;
                    }
                    $('#toDay').data('kendoDatePicker').max(new Date(year, month, 0));
                }
                $('#toDayDiv').fadeIn('fast');
            } else {
                $('#toDayDiv').fadeOut('fast');
                $('#toDay').data('kendoDatePicker').value("");
            }
            app.mobileApp.navigate("#encounter");
        }
    });

    window.diseaseView = kendo.observable({
        localDiseases: app.localDiseases,
        flipDis: function (e) { // e in this case is an event object
            var item = e.data;
            var prItem = app.diseases.get(item.code);
            if (item.favourite == true) {
                item.set("favourite", false);
                prItem.set("favourite", false);
            } else {
                item.set("favourite", true);
                prItem.set("favourite", true);
            }
            app.diseases.sync();
            $("#dislist").data("kendoMobileListView").refresh();
        },
        setDisease: function (e) { //e in this case is an event object
            var item = e.data;
            window.encounterView.setDiseaseCode(item);
            app.mobileApp.navigate("#encounter");
        },
    });

    window.feeCodeView = kendo.observable({
    	localFeeCodes: app.localFeeCodes,
        flipFeeCode: function (e) { // e in this case is an event object
            var item = e.data;
            var fcItem = app.feeCodes.get(item.code); //Need to update the external source
            if (item.favourite == true) {
                item.set("favourite", false);
                fcItem.set("favourite", false);
            } else {
                item.set("favourite", true);
                fcItem.set("favourite", true);
            }
            app.feeCodes.sync();
            $("#feeCodelist").data("kendoMobileListView").refresh();
        },
        setFeeCode: function (e) { //e in this case is an event object
            var item = e.data;
            window.encounterView.setFeeCode(item);
            $('#filterU').val("");
            app.filterU();
            app.mobileApp.navigate("#encounter");
        }
    });

    window.referralView = kendo.observable({
        localDocs: app.localDocs,
        flipRefDoctor: function (e) { // e in this case is an event object
            var item = e.data;
            var rdItem = app.doctors.get(item.code); //Need to update the external source
            if (item.favourite == true) {
                item.set("favourite", false);
                rdItem.set("favourite", false);
            } else {
                item.set("favourite", true);
                rdItem.set("favourite", true);
            }
            app.doctors.sync();
            $("#reflist").data("kendoMobileListView").refresh();
        },
        setReferral: function (e) { //e in this case is an event object
            var item = e.data;
            window.encounterView.setReferral(item);
            $('#filterV').val("");
            app.filterV();
            app.mobileApp.navigate("#encounter");
        }
    });

    window.clinicDocView = kendo.observable({
        clinicDocs: app.clinicDocs,
        autobind: false,
        flipDoc: function (e) { // e in this case is an event object
            var item = e.data;
            if (item.favourite == true) {
                item.set("favourite", false);
            } else {
                item.set("favourite", true);
            }
            app.clinicDocs.sync();
            $("#doclist").data("kendoMobileListView").refresh();
        },
        setClinicDoc: function (e) { //e in this case is an event object
            var item = e.data;
            if (app.source == "encounterView") {
                window.encounterView.setClinicDoc(item);
                app.mobileApp.navigate("#encounter");
            } else {
                window.activityView.setClinicDoc(item);
                app.mobileApp.navigate("#activityForm");
            }
        },
    });

    window.activityLookupView = kendo.observable({
        activities: app.activities,
        flipActivity: function (e) { // e in this case is an event object
            var item = e.data;
            if (item.favourite == true) {
                item.set("favourite", false);
            } else {
                item.set("favourite", true);
            }
            app.activities.sync();
            $("#activitylist").data("kendoMobileListView").refresh();
        },
        setActivity: function (e) { //e in this case is an event object
            var item = e.data;
            window.activityView.setActivity(item);
            $('#filterW').val("");
            app.filterW();
            app.mobileApp.navigate("#activityForm");
        }
    });

    window.genderView = kendo.observable({
        dataSource: app.genders
    });

    window.provinceView = kendo.observable({
        selectedProvince: null,
        dataSource: app.provinces
    });

    window.cityView = kendo.observable({
        selectedCity: null,
        dataSource: app.cities
    });

    window.locationView = kendo.observable({
        selectedLocation: null,
        dataSource: app.locations
    });

}());

// START_CUSTOM_CODE_home
// END_CUSTOM_CODE_home