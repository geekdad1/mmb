/* Now checks and returns a 10 digit number only */
    function checkPHN(value) {
    	var xValue = value.toString();
        if (xValue == "") { return true; }
        /* Remove any internal/external blanks and spaces */
        PHNval = "";
        for ($i=0; $i<xValue.length; $i++) {
            if (xValue.substr($i,1) == " ") {
                continue;
            }
            if (xValue.substr($i,1) == "-") {
                 continue;
            }
            PHNval += xValue.substr($i,1);
        }
        xValue = PHNval;
        if (xValue.substr(0,2) == "%b") {
            xValue = xValue.substr(8,10);
        }
        if (isNaN(xValue)) {
            alert("PHN must contain a numeric value.");
            return false;
        }
        /* PHN checksum */
        if (PHNval.length != 10) {
            alert("PHN must be 10 digits. Please re-enter the value.");
            return false;
        }
        PHNOut = "";
        TotDig = 0;
        TotMod = 0;
        PHNOut = PHNval;
        PHNWeight = new Array(0,2,4,8,5,10,9,7,3,0);
        for ($i=1; $i<=10; $i++) {
            PHNx = PHNOut.substr($i-1,1);
            TotDig = PHNx;
            TotDig = TotDig * PHNWeight[$i-1];
            TotDig = TotDig % 11;
            TotMod = TotMod + TotDig;
        }
        TotMod = (11 - (TotMod % 11));
        if (TotMod != (PHNOut.substr(9,1))) {
            alert("Not a valid PHN.");
            return false;
        }
        return true;
    }
