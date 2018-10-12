(function () {
    // store a reference to the application object that will be created
    // later on so that we can use it if need be
    var app = {
        data: {}
    };
    var bootstrap = function () {
        $(function () {
            app.mobileApp = new kendo.mobile.Application(document.body, {

                // you can change the default transition (slide, zoom or fade)
                transition: 'slide',
                // comment out the following line to get a UI which matches the look
                // and feel of the operating system
                skin: 'flat',
                // the application needs to know which view to load first
                initial: 'components/home/view.html',
                statusBarStyle: 'black-translucent',
                layout: 'main'
            });
        });
    };
	alert("got here");
	    // this function is called by Cordova when the application is loaded by the device
    document.addEventListener('deviceready', function () {
            // hide the splash screen as soon as the app is ready. otherwise
            // Cordova will wait 5 very long seconds to do it for you.
    	if (navigator && navigator.splashscreen) {
        	navigator.splashscreen.hide();
    	}

        var element = document.getElementById('appDrawer');
        if (typeof (element) != 'undefined' && element != null) {
                if (window.navigator.msPointerEnabled) {
                    $("#navigation-container").on("MSPointerDown", "a", function (event) {
                        app.keepActiveState($(this));
                    });
                } else {
                    $("#navigation-container").on("touchstart", "a", function (event) {
                        app.keepActiveState($(this));
                    });
                }
        }

        bootstrap();
            
	    var options = {
	    	lang: "en-US",
	    	showPopup: true
	    }
	    var useSpeech = false;
	    
	    window.plugins.speechRecognition.isRecognitionAvailable(
	    	function(result) { useSpeech = result }, function(err) { useSpeech = false; alert(err); });
	    alert ("useSpeech " + useSpeech);	
    }, false);

	app.speech = function recognize() {
    	window.plugins.speechRecognition.startListening(
    	function(result) {
    		alert(result);
    	}, function(err) {
    		alert(err);
    	}, options);
    };
    app.sendVoice = function sendVoice() {
        try {
            ApiAIPlugin.requestVoice({
                    contexts: ['phn']
                },
                function (response) {
                    //               alert(JSON.stringify(response));
                    window.encounterView.set("phn", response.result.parameters.number);
                    if (response.result.parameters.number.length == 10) {
                        app.findPHN();
                    }
                },
                function (error) {
                    alert("Please try again");
                });
        } catch (e) {
            alert(e);
        }
    };

    app.keepActiveState = function _keepActiveState(item) {
        var currentItem = item;
        $("#navigation-container li a.active").removeClass("active");
        currentItem.addClass('active');
    };

    app.encounterData = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_encounter.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    eventId: function () {
                        return app.curEvent;
                    }
                }
            },
            create: {
                url: "https://mmb.medinet.ca/cgi-bin/json_encounter_add.cgi",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    }
                }
            },
            update: {
                url: "https://mmb.medinet.ca/cgi-bin/json_encounter_update.cgi",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    }
                }
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
		if (app.calendarData._data.length > 0) {
		    app.mobileApp.navigate("#calendar");
		}
		else {
		    app.mobileApp.navigate("#splash");
		}
		return;
            }
            if (e.type == "read") {
                // when we do this it prevents the data from populating on the form.
                //var tabToActivate = $("#demogTab");
                //$("#tabstrip").kendoTabStrip().data("kendoTabStrip").activateTab(tabToActivate);
                //  $("#tabstrip").kendoTabStrip().data("kendoTabStrip").select(0);
                //$("#provCode").data("kendoDropDownList").enable(false);
                //$("#phn").data("kendoNumericTextBox").enable(false);
                //$("#lastname").disable(true);
                window.encounterView.set("clinicDoctorId", e.response.encounter.clinicDoctorId);
                app.clinicDoctorId = e.response.encounter.clinicDoctorId;
                window.encounterView.set("clinicDoctor", "(" +
                    app.clinicDocs.get(e.response.encounter.clinicDoctorId).label + ") " +
                    app.clinicDocs.get(e.response.encounter.clinicDoctorId).name);
                // if no province default to BC
                if (e.response.encounter.provCode == null) {
                    dropdownlist = $("#provCode").data("kendoDropDownList");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.label === "BC";
                    });
                    window.encounterView.set("provCode", dropdownlist.dataItem(dropdownlist.selectedIndex));
                    $('#updprovtext').val(app.provinces.get(window.encounterView.get("provCode").code).description);
                } else {
                    $('#updprovtext').val(app.provinces.get(e.response.encounter.provCode).description);
                    window.encounterView.set("provCode", app.provinces.get(e.response.encounter.provCode));
                }
                $('#updphntext').val(e.response.encounter.phn);
                window.encounterView.set("phn", e.response.encounter.phn);
                window.encounterView.set("lastname", e.response.encounter.lastname);
                window.encounterView.set("firstname", e.response.encounter.firstname);
                window.encounterView.set("initials", e.response.encounter.initials);
                window.encounterView.set("dateOfBirth", e.response.encounter.dateOfBirth);
                window.encounterView.set("gender", app.genders.get(e.response.encounter.gender).code);
                window.encounterView.set("insurerCode", app.insurers.get(e.response.encounter.insurerCode));
                window.encounterView.set("ihn", e.response.encounter.ihn);
                if (e.response.encounter.procId != "") {
                    window.encounterView.set("procCode", app.procedures.get(e.response.encounter.procId).label);
                    window.encounterView.set("procId", e.response.encounter.procId);
                }
                if (e.response.encounter.diseaseId != "") {
                    window.encounterView.set("diseaseCode", app.diseases.get(e.response.encounter.diseaseId).label);
                    window.encounterView.set("diseaseId", e.response.encounter.diseaseId);
                }
                window.encounterView.set("stopTime", e.response.encounter.stopTime);
                window.encounterView.set("startTime", e.response.encounter.startTime);
                window.encounterView.set("notes", e.response.encounter.notes);
                window.encounterView.set("locationCode", app.locations.get(e.response.encounter.locationCode));
                window.encounterView.set("patientId", e.response.encounter.patientId);
                if (e.response.encounter.toDay != "") {
                    window.encounterView.set("toDay", e.response.encounter.toDay);
                } else {
                    window.encounterView.set("toDay", "");
                }
                if (app.procedures.get(e.response.encounter.procId).toDay) {
                    $('#toDayDiv').fadeIn('fast');
                } else {
                    $('#toDayDiv').fadeOut('fast');
                }
                window.encounterView.set("callback", e.response.encounter.callback);
                if (e.response.encounter.referralId != "") {
                    window.encounterView.set("referral",
                            app.doctors.get(e.response.encounter.referralId).name +
                        " (" + app.doctors.get(e.response.encounter.referralId).msp + ") ");
                }
                if (e.response.encounter.feeCode1 != undefined) {
                    window.encounterView.set('feeCode1',e.response.encounter.feeCode1);
                    window.encounterView.set('feeId1',e.response.encounter.feeId1);
                }
                else {
                    window.encounterView.set('feeCode1',"");
                }
                if (e.response.encounter.feeCode2 != undefined) {
                    window.encounterView.set('feeCode2',e.response.encounter.feeCode2);
                    window.encounterView.set('feeId2',e.response.encounter.feeId2);
                }
                else {
                    window.encounterView.set('feeCode2',"");
                }
                if (e.response.encounter.feeCode3 != undefined) {
                    window.encounterView.set('feeCode3',e.response.encounter.feeCode3);
                    window.encounterView.set('feeId3',e.response.encounter.feeId3);
                }
                else {
                    window.encounterView.set('feeCode3',"");
                }
                if (e.response.encounter.feeCode4 != undefined) {
                    window.encounterView.set('feeCode4',e.response.encounter.feeCode4);
                    window.encounterView.set('feeId4',e.response.encounter.feeId4);
                }
                else {
                    window.encounterView.set('feeCode4',"");
                }
                if (e.response.encounter.feeCode5 != undefined) {
                    window.encounterView.set('feeCode5',e.response.encounter.feeCode5);
                    window.encounterView.set('feeId5',e.response.encounter.feeId5);
                }
                else {
                    window.encounterView.set('feeCode5',"");
                }
                if (e.response.encounter.qty1 != undefined) {
                    window.encounterView.set("qty1", e.response.encounter.qty1);
                }
                else {
                    window.encounterView.set("qty1","");
                }
                if (e.response.encounter.qty2 != undefined) {
                    window.encounterView.set("qty2", e.response.encounter.qty2);
                }
                else {
                    window.encounterView.set("qty2","");
                }
                if (e.response.encounter.qty3 != undefined) {
                    window.encounterView.set("qty3", e.response.encounter.qty3);
                }
                else {
                    window.encounterView.set("qty3","");
                }
                if (e.response.encounter.qty4 != undefined) {
                    window.encounterView.set("qty4", e.response.encounter.qty4);
                }
                else {
                    window.encounterView.set("qty4","");
                }
                if (e.response.encounter.qty5 != undefined) {
                    window.encounterView.set("qty5", e.response.encounter.qty5);
                }
                else {
                    window.encounterView.set("qty5","");
                }
            } else if (e.type == "update") {
                app.calendarData.read();
            } else
            if (e.type == "create") {
                app.calendarData.read();
            }
        },
        schema: {
            data: "encounter",
            model: {
                hasChildren: false,
                id: "eventId",
                fields: {
                    eventId: {
                        editable: false
                    },
                    type: {
                        type: "string",
                        editable: false
                    },
                    clinicDoctor: {
                        type: "string",
                        editable: true
                    },
                    clinicDoctorId: {
                        type: "number",
                        editable: true
                    },
                    firstname: {
                        type: "string",
                        editable: true
                    },
                    lastname: {
                        type: "string",
                        editable: true
                    },
                    initials: {
                        type: "string",
                        editable: true
                    },
                    dateOfBirth: {
                        type: "date",
                        editable: true
                    },
                    gender: {
                        type: "string",
                        editable: true
                    },
                    startTime: {
                        type: "string",
                        editable: true
                    },
                    stopTime: {
                        type: "string",
                        editable: true
                    },
                    procCode: {
                        type: "number",
                        editable: true
                    },
                    procId: {
                        type: "number",
                        editable: true
                    },
                    diseaseCode: {
                        type: "string",
                        editable: true
                    },
                    diseaseId: {
                        type: "number",
                        editable: true,
                    },
                    notes: {
                        type: "string",
                        editable: true
                    },
                    locationCode: {
                        type: "number",
                        editable: true
                    },
                    insurerCode: {
                        type: "string",
                        editable: true
                    },
                    ihn: {
                        type: "string",
                        editable: true
                    },
                    phn: {
                        type: "number",
                        editable: true
                    },
                    provCode: {
                        type: "string",
                        editable: true
                    },
                    patientId: {
                        type: "number",
                        editable: true
                    },
                    referral: {
                        type: "string",
                        editable: true
                    },
                    referralId: {
                        type: "number",
                        editable: true
                    },
                    serviceId1: {
                    	type: "number",
                    	editable: false
                    },
                    qty1: {
                    	type: "number",
                    	editable: true
                    },
                    feeId1: {
                    	type: "number",
                    	editable: true
                    },
                    feeCode1: {
                    	type: "string",
                    	editable: true
                    },
                    serviceId2: {
                    	type: "number",
                    	editable: false
                    },
                    qty2: {
                    	type: "number",
                    	editable: true
                    },
                    feeId2: {
                    	type: "number",
                    	editable: true
                    },
                    feeCode2: {
                    	type: "string",
                    	editable: true
                    },
                    serviceId3: {
                    	type: "number",
                    	editable: false
                    },
                    qty3: {
                    	type: "number",
                    	editable: true
                    },
                    feeId3: {
                    	type: "number",
                    	editable: true
                    },
                    feeCode3: {
                    	type: "string",
                    	editable: true
                    },
                    serviceId4: {
                    	type: "number",
                    	editable: false
                    },
                    qty4: {
                    	type: "number",
                    	editable: true
                    },
                    feeId4: {
                    	type: "number",
                    	editable: true
                    },
                    feeCode4: {
                    	type: "string",
                    	editable: true
                    },
                    serviceId5: {
                    	type: "number",
                    	editable: false
                    },
                    qty5: {
                    	type: "number",
                    	editable: true
                    },
                    feeId5: {
                    	type: "number",
                    	editable: true
                    },
                    feeCode5: {
                    	type: "string",
                    	editable: true
                    }
                }
            }
        }
    });

    app.activityData = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_activity.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    eventId: function () {
                        return app.curEvent;
                    }
                }
            },
            create: {
                url: "https://mmb.medinet.ca/cgi-bin/json_activity_add.cgi",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    }
                }
            },
            update: {
                url: "https://mmb.medinet.ca/cgi-bin/json_activity_update.cgi",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    }
                }

            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                window.activityView.set("eventId", e.response.activity.eventId);
                window.activityView.set("clinicDoctor", "(" +
                    app.clinicDocs.get(e.response.activity.clinicDoctorId).label + ") " +
                    app.clinicDocs.get(e.response.activity.clinicDoctorId).name);
                window.activityView.set("clinicDoctorId", e.response.activity.clinicDoctorId);
                window.activityView.set("stopTime", e.response.activity.stopTime);
                window.activityView.set("startTime", e.response.activity.startTime);
                window.activityView.set("notes", e.response.activity.notes);
                window.activityView.set("activityType", app.activities.get(e.response.activity.activityTypeId).description);
                window.activityView.set("activityTypeId", e.response.activity.activityTypeId);
            } else if (e.type == "update") {
                app.calendarData.read();
            } else if (e.type == "create") {
                app.calendarData.read();
            }
        },
        schema: {
            data: "activity",
            model: {
                hasChildren: false,
                id: "eventId",
                fields: {
                    eventId: {
                        editable: false
                    },
                    type: {
                        type: "string",
                        editable: false
                    },
                    clinicDoctor: {
                        type: "string",
                        editable: true
                    },
                    clinicDoctorId: {
                        type: "number",
                        editable: true
                    },
                    startTime: {
                        type: "string",
                        editable: true
                    },
                    stopTime: {
                        type: "string",
                        editable: true
                    },
                    activityType: {
                        type: "string",
                        editable: true
                    },
                    activityTypeId: {
                        type: "string",
                        editable: true
                    },
                    notes: {
                        type: "string",
                        editable: true
                    }
                }
            }
        }
    });

    app.appToken = "";
    app.userKey = "";
    app.source = "";
    app.curEvent = 0;
    app.clinicDoctor = "";
    app.clinicDoctorId = 0;
    app.lookup = "";
    app.feeIndex = 0;
    app.mmbClinicDoc = 0; //This is the id for the logged in Clinic Doctor. needed for favourites
    app.holiday = false;

    app.appTokenData = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_login.cgi",
                dataType: "json",
                type: "post"
            },
            parameterMap: function (data, type) {
                if (type == "read") {
                    return {
                        username: $('#username').val(),
                        password: $('#password').val(),
                        datacentre: $('#datacentre').val()
                    }
                }
            }
        },
        schema: {
            data: "keys",
            model: {
                hasChildren: false,
                id: "userKey",
                fields: {
                    token: {
                        type: "string",
                        editable: false
                    },
                    userKey: {
                        type: "string",
                        editable: false
                    },
                    mmbClinicDoc: {
                        type: "number",
                        editable: false
                    }
                }
            }
        },
        error: function (e) {
            checkError(e);
            $('#progressbar').fadeOut("fast");
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = 0;
                pb.value(cur);
                $('#password').val("");
                $('#datacentre').val("");
                app.appToken = e.response.token;
                app.userKey = e.response.userKey;
                app.mmbClinicDoc = e.response.mmbClinicDoc;
                app.calendarData.read();
                app.procedures.read();
                app.diseases.read();
                app.clinicDocs.read();
                app.activities.read();
                app.insurers.read();
                app.genders.read();
                app.provinces.read();
                app.locations.read();
                app.holidays.read();
                app.doctors.read();
                app.feeCodes.read();
            }
        }
    });
    app.resetPwData = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_pw_update.cgi",
                dataType: "json",
                type: "post"
            },
            parameterMap: function (data, type) {
                if (type == "read") {
                    return {
                        username: $('#rp_username').val(),
                        password: $('#rp_password').val(),
                        datacentre: $('#rp_datacentre').val(),
                        collegeId: $('#rp_collegeId').val()
                    }
                }
            }
        },
        schema: { //This might not be necessary at all
            model: {
                fields: {
                    passwd: {
                        type: "string",
                        editable: true
                    },
                    username: {
                        type: "string",
                        editable: true
                    },
                    datacentre: {
                        type: "string",
                        editable: true
                    },
                    collegeId: {
                        type: "string",
                        editable: true
                    }
                }
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                window.loginView.set("username", window.pwChangeView.username);
                window.loginView.set("password", window.pwChangeView.password);
                window.loginView.set("datacentre", window.pwChangeView.datacentre);
                app.mobileApp.navigate('#login');
            }
        }
    });

    app.registerData = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_register.cgi",
                dataType: "json",
                type: "post"
            },
            parameterMap: function (data, type) {
                if (type == "read") {
                    return {
                        firstname: $('#regfirstname').val(),
                        lastname: $('#reglastname').val(),
                        email: $('#regemail').val(),
                        datacentre: $('#regdatacentre').val(),
                        collegeId: $('#regcollegeId').val()
                    }
                }
            }
        },
        schema: { //This might not be necessary at all
            model: {
                fields: {
                    email: {
                        type: "string",
                        editable: true
                    },
                    datacentre: {
                        type: "string",
                        editable: true
                    },
                    collegeId: {
                        type: "string",
                        editable: true
                    }
                }
            }
        },
        error: function (e) {
            if (e.errors == "registration failed") {
                alert("Please contact Medinet for support");
            }
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                alert("registration was sent");
                app.mobileApp.navigate('#login');
            }
        }
    });

    app.eventData = { //This must be a plain object
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_events.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                }
            }
        },
        schema: {
            data: "events",
            model: {
                hasChildren: false,
                id: "id",
                fields: {
                    eventId: {
                        editable: false
                    },
                    id: {
                        editable: false
                    },
                    type: {
                        type: "string",
                        editable: false
                    },
                    label: {
                        type: "string",
                        editable: false
                    }
                }
            }
        }
    };

    app.calendarData = new kendo.data.HierarchicalDataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_dates.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    }
                }
            },
            close: function () {
                this.date = "";
                this.starttime = ""; ///.......
            },
        },
        schema: {
            data: "dates",
            dataType: "json",
            model: {
                id: "date",
                hasChildren: true,
                children: app.eventData,
                fields: {
                    dateId: {
                        editable: false
                    },
                    date: {
                        editable: false
                    }
                },
            }
       },
       requestEnd: function (e) {
	   // Don't want to do this unless we are saving claims
	   // ignore it for startup or when we are picking up events for a date
           if ($('#progressbar').is(":visible") == false) {
               if (e.response.dates !== undefined) {
	           if (e.response.dates.length > 0) {
	             app.mobileApp.navigate("#calendar");
	           }
	       }
	   }
       }   
    });

    window.app = app;

    app.isOnline = function () {
        if (!navigator || !navigator.connection) {
            return true;
        } else {
            return navigator.connection.type !== 'none';
        }
    };
    app.back = function () {
        app.mobileApp.navigate("#:back");
    };
    app.submitPlus = function () {
        app.curEvent = 0;
        if (app.clinicDoctorId != 0) {
            window.encounterView.set("clinicDoctor", "(" + app.clinicDocs.get(app.clinicDoctorId).label + ") " +
                app.clinicDocs.get(app.clinicDoctorId).name);
            window.encounterView.set("clinicDoctorId", app.clinicDoctorId);
        } else {
            window.encounterView.set("clinicDoctor", "");
            window.encounterView.set("clinicDoctorId", 0);
        }
        var dropdownlist = $("#provCode").data("kendoDropDownList");
        dropdownlist.selectedIndex = 1;
        window.encounterView.set("provCode", dropdownlist.dataItem(dropdownlist.selectedIndex));
        window.encounterView.set("phn", "");
        window.encounterView.set("lastname", "");
        window.encounterView.set("firstname", "");
        window.encounterView.set("initials", "");
        window.encounterView.set("dateOfBirth", "");
        window.encounterView.set("gender", "");
        dropdownlist = $("#patientInsurer").data("kendoDropDownList");
        dropdownlist.search("MSP");
        window.encounterView.set("insurerCode", dropdownlist.dataItem(dropdownlist.selectedIndex));
        window.encounterView.set("ihn", "");
        window.encounterView.set("procCode", "");
        if (app.clinicDoctorId != 0) {
        	window.encounterView.set("diseaseCode", app.diseases.get(app.clinicDocs.get(app.clinicDoctorId).diseaseCode).label);
        	window.encounterView.set("diseaseId", app.diseases.get(app.clinicDocs.get(app.clinicDoctorId).diseaseCode).id);
        }
        else {
	        window.encounterView.set("diseaseCode", "");
	        window.encounterView.set("diseaseId",0);
        }
        window.encounterView.set("stopTime", "");
        window.encounterView.set("startTime", "");
        window.encounterView.set("notes", "");
        dropdownlist = $('#location').data("kendoDropDownList");
        if (app.clinicDoctorId != 0) {
        	window.encounterView.set("locationCode", app.locations.get(app.clinicDocs.get(app.clinicDoctorId).location));
        }
        else {
        	window.encounterView.set("locationCode", dropdownlist.dataItem(0));
        }
        window.encounterView.set("procId", 0);
        window.encounterView.set("toDay", "");
        window.encounterView.set("callback", false);
        window.encounterView.set("referral", "");
        window.encounterView.set("referralId", 0);
        window.encounterView.set("street1","");
        window.encounterView.set("street2","");
        window.encounterView.set("city","");
        window.encounterView.set("phone","");
        window.location.href = "#encounter";
        $("#addenc").fadeIn("fast");
        $("#updenc").fadeOut("fast");
    };
    app.submitMinus = function () {
        app.curEvent = 0;
        if (app.clinicDoctor != 0) {
            window.activityView.set("clinicDoctor", "(" + app.clinicDocs.get(app.clinicDoctorId).label + ") " +
                app.clinicDocs.get(app.clinicDoctorId).name);
            window.activityView.set("clinicDoctorId", app.clinicDoctorId);
        } else {
            window.activityView.set("clinicDoctor", "");
            window.activityView.set("clinicDoctorId", 0);
        }
        window.activityView.set("activityType", "");
        window.activityView.set("activityTypeId", 0);
        window.activityView.set("stopTime", "");
        window.activityView.set("startTime", "");
        window.activityView.set("notes", "");

        window.location.href = "#activityForm";
    };
    app.findPHN = function () {
        app.phnData.read();
    };

    app.filterFav = function () {
        if (app.lookup == "procedure") {
            if (app.localProcs.filter() === undefined) {
                app.localProcs.filter({
                    field: "favourite",
                    operator: "equals",
                    value: true
                });
                
                
                $("#filterProcFav").attr("src","components/images/orange.png");
            } else {
                app.localProcs.filter({});
                $("#filterProcFav").attr("src","components/images/grey.png");
            }
        } else if (app.lookup == "disease") {
            if (app.localDiseases.filter() === undefined) {
                app.localDiseases.filter({
                    field: "favourite",
                    operator: "equals",
                    value: true
                });
                $("#filterDisFav").attr("src","components/images/orange.png");
            } else {
                app.localDiseases.filter({});
                $("#filterDisFav").attr("src","components/images/grey.png");
            }
        } else if (app.lookup == "activities") {
            if (app.activities.filter() === undefined) {
                app.activities.filter({
                    field: "favourite",
                    operator: "equals",
                    value: true
                });
                $("#filterActFav").attr("src","components/images/orange.png");
            } else {
                app.activities.filter({});
                $("#filterActFav").attr("src","components/images/grey.png");
            }
        } else if (app.lookup == "feecode") {
            if (app.localFeeCodes.filter() === undefined) {
                app.localFeeCodes.filter({
                    field: "favourite",
                    operator: "equals",
                    value: true
                });
                $("#filterFeeFav").attr("src","components/images/orange.png");
            } else {
                app.localFeeCodes.filter({});
                $("#filterFeeFav").attr("src","components/images/grey.png");
            }
        } else if (app.lookup == "doctor") {
            if (app.localDocs.filter() === undefined) {
                app.localDocs.filter({
                    field: "favourite",
                    operator: "equals",
                    value: true
                });
                $("#filterRefFav").attr("src","components/images/orange.png");
            } else {
                app.localDocs.filter({});
                $("#filterRefFav").attr("src","components/images/grey.png");
            }
        } else {
            if (app.clinicDocs.filter() === undefined) {
                app.clinicDocs.filter({
                    field: "favourite",
                    operator: "equals",
                    value: true
                });
                $("#filterDocFav").attr("src","components/images/orange.png");
            } else {
                app.clinicDocs.filter({});
                $("#filterDocFav").attr("src","components/images/grey.png");
            }

        }
        app.mobileApp.scroller().scrollTo(0, 0);
    };

    app.filterU = function () {
        if ($("#filterU").val() != "") {
            app.localFeeCodes.filter({
                field: "description",
                operator: "startswith",
                value: $('#filterU').val()
            });
            app.mobileApp.scroller().scrollTo(0, 0);
        }
        else {
            app.localFeeCodes.filter({});
        }
    };

    app.filterV = function () {
        if ($("#filterV").val() != "") {
            app.localDocs.filter({
                field: "name",
                operator: "startswith",
                value: $('#filterV').val()
            });
            app.mobileApp.scroller().scrollTo(0, 0);
        }
        else {
            app.localDocs.filter({});
        }
    };

    app.filterW = function (filter) {
        if ($("#filterW").val() != "") {
            app.activities.filter({
                field: "description",
                operator: "startswith",
                value: $('#filterW').val()
            });
            app.mobileApp.scroller().scrollTo(0, 0);
        }
        else {
            app.activities.filter({});
        }
    };

    app.filterX = function () {
        if ($('#filterX').val() != "") {
            app.localProcs.filter({
                field: "description",
                operator: "startswith",
                value: $('#filterX').val()
            });
            app.mobileApp.scroller().scrollTo(0, 0);
        }
        else {
            app.localProcs.filter({});
        }
    };

    app.filterY = function () {
        if ($('#filterY').val() != "") {
            app.localDiseases.filter({
                field: "description",
                operator: "startswith",
                value: $('#filterY').val()
            });
            app.mobileApp.scroller().scrollTo(0, 0);
        }
        else {
            app.localDiseases.filter({});
        }
    };

    app.filterZ = function () {
        if ($('#filterZ').val() != "") {
            app.clinicDocs.filter({
                field: "name",
                operator: "startswith",
                value: $('#filterZ').val()
            });
            app.mobileApp.scroller().scrollTo(0, 0);
        }
        else {
            app.clinicDocs.filter({});
        }
    };

    app.procedureModel = new kendo.data.Model.define({
        id: "code",
        hasChildren: false,
        fields: {
            code: {
                type: "number",
                editable: "false"
            },
            label: {
                type: "string",
                editable: false
            },
            description: {
                type: "string",
                editable: "false"
            },
            favourite: {
                type: "boolean",
                editable: true
            },
            toDay: {
                type: "boolean",
                editable: false
            },
            timeReq: {
                type: "boolean",
                editable: false
            },
            anesFee: {
                type: "boolean",
                editable: false
            },
            surgery: {
                type: "boolean",
                editable: false
            },
            critCare: {
                type: "boolean",
                editable: false
            },
            specPhone: {
                type: "boolean",
                editable: false
            },
            labour: {
                type: "boolean",
                editable: false
            }
        },
        icon: function () {
            if (this.get("favourite") == true) {
                return "components/images/orange.png";
            } else {
                return "components/images/grey.png";
            }
        }
    });

    app.procArray = [];

    app.procedures = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_procCodes.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }
                }
            },
            update: {
                url: "https://mmb.medinet.ca/cgi-bin/json_procCode_update.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }
                }
            }
        },
        schema: {
            data: "codes",
            dataType: "json",
            model: app.procedureModel
        },
        parameterMap: function (data, type) { ///might not need this unless we need to send other codes for crud ops
            if (type == "read") {
                return {}
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                for (i = 0; i < e.response.codes.length; i++) {
                    app.procArray.push({
                        code: e.response.codes[i].code,
                        label: e.response.codes[i].label,
                        description: e.response.codes[i].description,
                        favourite: e.response.codes[i].favourite,
                        toDay: e.response.codes[i].toDay,
                        timeReq: e.response.codes[i].timeReq,
                        anesFee: e.response.codes[i].anesFee,
                        surgery: e.response.codes[i].surgery,
                        critCare: e.response.codes[i].critCare,
                        specPhone: e.response.codes[i].specPhone,
                        labour: e.response.codes[i].labour
                    });
                }
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }
    });

    app.localProcs = new kendo.data.DataSource({
        data: app.procArray,
        schema: {
            model: app.procedureModel,
            total: function () {
                return app.procArray.length;
            }
        }
    });

    app.feeCodeModel = new kendo.data.Model.define({
        id: "code",
        hasChildren: false,
        fields: {
            code: {
                type: "number",
                editable: "false"
            },
            label: {
                type: "string",
                editable: false
            },
            description: {
                type: "string",
                editable: "false"
            },
            favourite: {
                type: "boolean",
                editable: true
            }
        },
        icon: function () {
            if (this.get("favourite") == true) {
                return "components/images/orange.png";
            } else {
                return "components/images/grey.png";
            }
        }
    });

    app.feeCodeArray = [];

    app.feeCodes = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_feeCodes.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }
                }
            },
            update: {
                url: "https://mmb.medinet.ca/cgi-bin/json_feeCodeFav_update.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }
                }
            }
        },
        schema: {
            data: "codes",
            dataType: "json",
            model: app.feeCodeModel
        },
        parameterMap: function (data, type) { ///might not need this unless we need to send other codes for crud ops
            if (type == "read") {
                return {}
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                for (i = 0; i < e.response.codes.length; i++) {
                    app.feeCodeArray.push({
                        code: e.response.codes[i].code,
                        label: e.response.codes[i].label,
                        description: e.response.codes[i].description,
                        favourite: e.response.codes[i].favourite
                    });
                }
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }
    });

    app.localFeeCodes = new kendo.data.DataSource({
        data: app.feeCodeArray,
        schema: {
            model: app.feeCodeModel,
            total: function () {
                return app.feeCodeArray.length;
            }
        }
    });

    app.activityModel = new kendo.data.Model.define({
        id: "code",
        hasChildren: false,
        fields: {
            code: {
                type: "number",
                editable: false
            },
            description: {
                type: "string",
                editable: false
            },
            favourite: {
                type: "boolean",
                editable: true
            }
        },
        icon: function () {
            if (this.get("favourite") == true) {
                return "components/images/orange.png";
            } else {
                return "components/images/grey.png";
            }
        }
    });

    app.activities = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_activitytypes.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }
                }
            },
            update: {
                url: "https://mmb.medinet.ca/cgi-bin/json_activityTypeFav_update.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }
                }
            }
        },
        schema: {
            data: "codes",
            dataType: "json",
            model: app.activityModel
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }
    });

    app.diseaseModel = new kendo.data.Model.define({
        id: "code",
        hasChildren: false,
        fields: {
            code: {
                type: "number",
                editable: false
            },
            description: {
                type: "string",
                editable: false
            },
            label: {
                type: "string",
                editable: false
            },
            favourite: {
                type: "boolean",
                editable: true
            }
        },
        icon: function () {
            if (this.get("favourite") == true) {
                return "components/images/orange.png";
            } else {
                return "components/images/grey.png";
            }
        }
    });

    app.diseases = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_diseaseCodes.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }
                }
            },
            update: {
                url: "https://mmb.medinet.ca/cgi-bin/json_disease_update.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }

                }
            }
        },
        schema: {
            data: "codes",
            dataType: "json",
            model: app.diseaseModel
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                for (i = 0; i < e.response.codes.length; i++) {
                    app.disArray.push({
                        code: e.response.codes[i].code,
                        label: e.response.codes[i].label,
                        description: e.response.codes[i].description,
                        favourite: e.response.codes[i].favourite
                    });
                }
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }

    });

    app.disArray = [];

    app.localDiseases = new kendo.data.DataSource({
        data: app.disArray,
        schema: {
            model: app.diseaseModel,
            total: function () {
                return app.disArray.length;
            }
        }
    });

    app.phnData = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_phn.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    phn: function () {
                        return $('#phn').val();
                    },
                    prov: function () {
                        var dropdownlist = $("#provCode").data("kendoDropDownList");
                        var theProv = dropdownlist.dataItem(dropdownlist.selectedIndex).label;
                        return theProv;
                    }
                }
            }
        },
        schema: {
            data: "data",
            dataType: "json",
            model: {
                hasChildren: false,
                fields: {
                    lastname: {
                        editable: false
                    },
                    firstname: {
                        editable: false
                    },
                    dob: {
                        editable: false
                    },
                    gender: {
                        editable: false
                    },
                    street1: {
                        editable: false
                    },
                    street2: {
                        editable: false
                    },
                    city: {
                        editable: false
                    },
                    phone: {
                        editable: false
                    },
                    patientId: {
                        editable: true
                    }
                }
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                if (e.response.data.lastname != null) {
                    window.encounterView.set("lastname", e.response.data.lastname);
                    window.encounterView.set("firstname", e.response.data.firstname);
                    window.encounterView.set("dateOfBirth", e.response.data.dob);
                    window.encounterView.set("gender", app.genders.get(e.response.data.gender).code);
                    window.encounterView.set("patientId", e.response.data.patientId);
                    window.encounterView.set("street1", e.response.data.street1);
                    window.encounterView.set("street2", e.response.data.street2);
                    window.encounterView.set("city", e.response.data.city);
                    window.encounterView.set("phone", e.response.data.phone);
                }
            }
        }

    });

    app.clinicDocModel = new kendo.data.Model.define({
        id: "id",
        hasChildren: false,
        fields: {
            id: {
                type: "number",
                editable: false
            },
            label: {
                type: "string",
                editable: false
            },
            name: {
                type: "string",
                editable: false
            },
            favourite: {
                type: "boolean",
                editable: true
            },
            specType: {
                type: "string",
                editable: false
            },
            diseaseCode: {
                type: "number",
                editable: false
            },
            location: {
                type: "number",
                editable: false
            },
            serviceCode: {
                type: "number",
                editable: false
            },
            subFacility: {
                type: "number",
                editable: false
            },
            facility: {
                type: "number",
                editable: false
            },
            scc: {
                type: "number",
                editable: false
            }
        },
        icon: function () {
            if (this.get("favourite") == true) {
                return "components/images/orange.png";
            } else {
                return "components/images/grey.png";
            }
        }
    });

    app.clinicDocs = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_clinicDocs.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }
                }
            },
            update: {
                url: "https://mmb.medinet.ca/cgi-bin/json_clinicDoc_update.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    },
                    clinicDoctor: function () {
                    	return app.clinicDoctor;
                    }
                }
            }
        },
        schema: {
            data: "doctors",
            dataType: "json",
            model: app.clinicDocModel,
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }
    });

    app.insurers = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_insurers.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    }
                }
            }
        },
        schema: {
            data: "codes",
            dataType: "json",
            model: {
                id: "code",
                hasChildren: false,
                fields: {
                    code: {
                        editable: false
                    },
                    description: {
                        editable: false
                    }
                }
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }
    });

    app.genders = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_genders.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    }
                }
            }
        },
        schema: {
            data: "codes",
            dataType: "json",
            model: {
                id: "code",
                hasChildren: false,
                fields: {
                    code: {
                        editable: false
                    },
                    description: {
                        editable: false
                    },
                }
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }
    });

    app.provinces = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_provinces.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    }
                }
            }
        },
        schema: {
            data: "codes",
            dataType: "json",
            model: {
                id: "code",
                hasChildren: false,
                fields: {
                    code: {
                        editable: false
                    },
                    description: {
                        editable: false
                    },
                    label: {
                        editable: false
                    }
                }
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }
    });

    app.locations = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_locations.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    }
                }
            }
        },
        schema: {
            data: "codes",
            dataType: "json",
            model: {
                id: "code",
                hasChildren: false,
                fields: {
                    code: {
                        editable: false
                    },
                    description: {
                        editable: false
                    }
                }
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }
    });

    app.holidays = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_holidays.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    }
                }
            }
        },
        schema: {
            data: "codes",
            dataType: "json",
            model: {
                id: "date",
                hasChildren: false,
                fields: {
                    date: {
                        editable: false
                    }
                }
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }
    });

    app.doctorModel = new kendo.data.Model.define({
        id: "code",
        hasChildren: false,
        fields: {
            code: {
                type: "number",
                editable: "false"
            },
            name: {
                type: "string",
                editable: false
            },
            msp: {
                type: "string",
                editable: false
            },
            favourite: {
                type: "boolean",
                editable: true
            }
        },
        icon: function () {
            if (this.get("favourite") == true) {
                return "components/images/orange.png";
            } else {
                return "components/images/grey.png";
            }
        }
    });

    app.docArray = [];

    app.doctors = new kendo.data.DataSource({
        transport: {
            read: {
                url: "https://mmb.medinet.ca/cgi-bin/json_doctors.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }
                }
            },
            update: {
                url: "https://mmb.medinet.ca/cgi-bin/json_doctorFav_update.cgi",
                dataType: "json",
                type: "post",
                data: {
                    token: function () {
                        return app.appToken;
                    },
                    userKey: function () {
                        return app.userKey;
                    },
                    mmbClinicDoc: function () {
                        return app.mmbClinicDoc;
                    }
                }
            }
        },
        schema: {
            data: "doctors",
            dataType: "json",
            model: app.doctorModel
        },
        parameterMap: function (data, type) { ///might not need this unless we need to send other codes for crud ops
            if (type == "read") {
                return {}
            }
        },
        error: function (e) {
            checkError(e);
        },
        requestEnd: function (e) {
            if (e.response === undefined) {
                return;
            }
            if (e.response.state == "ERROR") {
                return;
            }
            if (e.type == "read") {
                for (i = 0; i < e.response.doctors.length; i++) {
                    app.docArray.push({
                        code: e.response.doctors[i].code,
                        name: e.response.doctors[i].name,
                        msp: e.response.doctors[i].msp,
                        favourite: e.response.doctors[i].favourite
                    });
                }
                var pb = $("#progressbar").data("kendoProgressBar");
                var cur = pb.value() + 1;
                pb.value(cur);
            }
        }
    });

    app.localDocs = new kendo.data.DataSource({
        data: app.docArray,
        schema: {
            model: app.doctorModel,
            total: function () {
                return app.docArray.length;
            }
        }
    });

}());

function isHoliday(date) {
    if (date == null) {
        app.holiday = false;
        return;
    }
    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth()+1)).slice(-2);
    var key = date.getFullYear() + "-" + month + "-" + day;
    if (app.holidays.get(key) === undefined) {
        app.holiday = false;
    } else {
        app.hoiday = true;
    }
};

function allowCallback(time) {
    //decide if they have the option to do a callback
    if (((time.getHours() < 8) || (time.getHours() > 18)) || app.holiday) {
        var doc = app.clinicDocs.get(app.clinicDoctorId);
        if (doc !== undefined) {
            if (doc.specType != "Emerg") {
                $('#callbackDiv').fadeIn('fast');
            } else {
                $('#callbackDiv').fadeOut('fast');
            }
        } else {
            $('#callbackDiv').fadeOut('fast');
        }
    } else {
        $('#callbackDiv').fadeOut('fast');
    }
}

function checkError(e) {
    if (e.errorThrown != "custom error") {
        var message = "Error Returned from server: " + e.errorThrown;
        alert(message);
    } else {
        if (e.errors == "not registered") {
            alert("That email address is not valid. Click on Sign up to set up a new account");
        } else if (e.errors == "login failed") {
            alert("Login failure");
        } else if (e.errors == "disabled") {
            alert("That account is disabled");
        } else if (e.errors == "Expired") {
            alert("Your data was saved but the session has timed out.  Please log in again");
            app.mobileApp.navigate("#login");
        } else if (e.errors == "not logged in") {
            alert("Please log in again");
            app.mobileApp.navigate("#login");
        } else {
            alert(e.errors);
        }
    }

};
