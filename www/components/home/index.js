'use strict';
(function () {
    window.loginView = kendo.observable({
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
            if (this.lastname == "") {
                alert("Last name is required");
                return;
            }
            if (this.firstname == "") {
                alert("First name is required");
                return;
            }
            if (this.dateOfBirth == "") {
                alert("Date of birth is required");
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
            if ((this.procCode == "") || (this.procCode == null)) {
                $("#tabstrip").select(1);
                alert("Procedure code is required");
                return;
            }

            var item = app.procedures.get(this.procId);
            if ($("#calledDiv").is(':visible')) {
                if (item.called) {
                    if ((this.calledTime == null) || (this.calledTime == "")) {
	                	alert ("Called time is required");
                        return;
                    }
                }
            }
            if ((this.startTime == "") || (this.startTime == null)) {
                if (this.calledTime != "") {
                    this.startTime = this.calledTime;
                }
                else {
                    alert("Start time is required");
                    return;
                }
            }

            var doc = app.clinicDocs.get(app.clinicDoctorId);
            if ((item.timePeriod != null) ||
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
                    gender: this.gender.code,
                    procCode: this.procCode,
                    procId: this.procId,
                    diseaseCode: this.diseaseCode,
                    diseaseId: this.diseaseId,
                    locationCode: this.locationCode.code,
                    provCode: this.provCode.code,
                    calledTime: this.calledTime,
                    startTime: this.startTime,
                    stopTime: this.stopTime,
                    type: "paid",
                    notes: this.notes,
                    patientId: this.patientId,
                    toDay: this.toDay,
                    callback: this.callback,
                    referralId: this.referralId,
                    street1: this.street1,
                    street2: this.street2,
                    city: this.city,
                    phone: this.phone
                });

            } else {
                app.encounterData.at(0).set("lastname", this.lastname);
                app.encounterData.at(0).set("firstname", this.firstname);
                app.encounterData.at(0).set("initials", this.initials);
                app.encounterData.at(0).set("provCode", this.provCode.code);
                app.encounterData.at(0).set("phn", this.phn);
                app.encounterData.at(0).set("gender", this.gender.code);
                app.encounterData.at(0).set("insurerCode", this.insurerCode.code);
                app.encounterData.at(0).set("procCode", this.procCode);
                app.encounterData.at(0).set("procId", this.procId);
                app.encounterData.at(0).set("diseaseCode", this.diseaseCode);
                app.encounterData.at(0).set("diseaseId", this.diseaseId);
                app.encounterData.at(0).set("ihn", this.ihn);
                app.encounterData.at(0).set("clinicDoctor", this.clinicDoctor);
                app.encounterData.at(0).set("clinicDoctorId", this.clinicDoctorId);
                app.encounterData.at(0).set("calledTime", this.calledTime);
                app.encounterData.at(0).set("startTime", this.startTime);
                app.encounterData.at(0).set("stopTime", this.stopTime);
                app.encounterData.at(0).set("dateOfBirth", this.dateOfBirth);
                app.encounterData.at(0).set("locationCode", this.locationCode.code);
                app.encounterData.at(0).set("notes", this.notes);
                app.encounterData.at(0).set("patientId", this.patientId);
                app.encounterData.at(0).set("toDay", this.toDay);
                app.encounterData.at(0).set("callback", this.callback);
                app.encounterData.at(0).set("referralId", this.referralId);
                app.encounterData.at(0).set("street1",this.street1);
                app.encounterData.at(0).set("street2",this.street1);
                app.encounterData.at(0).set("city",this.city);
                app.encounterData.at(0).set("phone",this.phone);
            }
            app.encounterData.sync();
            app.mobileApp.navigate("#calendar");
        },
        findProc: function (e) {
            app.lookup = "procedure";
            app.mobileApp.navigate("#procLookup");
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
        called: function () {
            var time = new Date();
            var disp = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();
            this.set('calledTime', disp);
        },
        start: function () {
            var time = new Date();
            var disp = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();
            this.set('startTime', disp);
            $('#toDay').data('kendoDatePicker').min(new Date(time.getFullYear(), time.getMonth(), 1));
            var month = time.getMonth() + 1;
            var year = time.getFullYear();
            if (month == 12) {
                month = 0;
                year = year + 1;
            }
            $('#toDay').data('kendoDatePicker').max(new Date(year, month, 0));
            isHoliday($('#encStartTime').data('kendoDateTimePicker').value());
            allowCallback(new Date($('#encStartTime').data('kendoDateTimePicker').value()));
        },
        stop: function () {
            var time = new Date();
            var disp = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();
            this.set('stopTime', disp);
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
            if ($('#encStartTime').data('kendoDateTimePicker').value() != null) {
            	allowCallback(new Date($('#encStartTime').data('kendoDateTimePicker').value()));
           }
        },
        setReferral: function (item) {
            this.set("referral", item.name + " (" +
                item.msp + ") ");
            this.set('referralId', item.code);
            $('#filterV').val("");
            app.filterV();
        },
        setToDay: function (date) {
            var time = new Date(date);
            var disp = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();
            $('#toDay').data('kendoDatePicker').min(new Date(time.getFullYear(), time.getMonth(), 1));
            var month = time.getMonth() + 1;
            var year = time.getFullYear();
            if (month == 12) {
                month = 0;
                year = year + 1;
            }
            $('#toDay').data('kendoDatePicker').max(new Date(year, month, 0));

        },
        cancel: function() {
            //var tabToActivate = $("#demogTab");			//reset the tab before we leave the form
            //$("#tabstrip").data("kendoTabStrip").activateTab(tabToActivate);
            //$('#tabstrip').kendoTabStrip().
            app.mobileApp.navigate("#calendar");
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
                alert("Activity start date/time is required");
                return;
            }
            if (this.stopTime == "") {
                alert("Activity stop date/time is required");
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
            app.mobileApp.navigate("#calendar");
        },
        called: function () {
            var time = new Date();
            var disp = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();
            this.set('calledTime', disp);
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
        }
    });

    window.procView = kendo.observable({
        localProcs: app.localProcs,
        flipFav: function (e) { // e in this case is an event object
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
                if (($('#encStartTime').data('kendoDateTimePicker').value() != "") &&
                    ($('#encStartTime').data('kendoDateTimePicker').value() != null)) {
                    var time = new Date($('#encStartTime').data('kendoDateTimePicker').value());
                    $('#toDay').data('kendoDatePicker').min(new Date(time.getFullYear(), time.getMonth(), 1));
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

    window.referralView = kendo.observable({
        localDocs: app.localDocs,
        setReferral: function (e) { //e in this case is an event object
            var item = e.data;
            window.encounterView.setReferral(item);
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

    window.locationView = kendo.observable({
        selectedLocation: null,
        dataSource: app.locations
    });

}());

// START_CUSTOM_CODE_home
// END_CUSTOM_CODE_home