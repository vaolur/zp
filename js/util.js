Date.prototype.format = function(){
	var day = this.getDate();
	if (day < 10)
		day = '0' + day;
	var month = this.getMonth() + 1;
	if (month < 10)
		month = '0' + month;
	var year = this.getFullYear();
	return day + '.' + month + '.' + year;
};

Date.myParse = function(text){
	var day = parseInt(text.substring(0, 2));
	var month = parseInt(text.substring(3, 5)) - 1;
	var year = parseInt(text.substring(6, 10));
	return new Date(year, month, day);
};

Date.daysBetween = function(date1, date2){
	var timeDiff = date2.getTime() - date1.getTime();
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	return diffDays;
}
