var PAY_TYPES = [
	{value: 'once', name: 'Один раз'},
	{value: 'everyDay', name: 'Каждый день'},
	{value: 'monday', name: 'Каждый понедельник'},
	{value: 'tuesday', name: 'Каждый вторник'},
	{value: 'wednesday', name: 'Каждую среду'},
	{value: 'thursday', name: 'Каждый четверг'},
	{value: 'freeday', name: 'Каждую пятницу'},
	{value: 'saturday', name: 'Каждую субботу'},
	{value: 'sunday', name: 'Каждое воскресенье'} 
];

var rowId = 0;

function addRow(name, sum, typeId){
	var opts = '';
	for(var key in PAY_TYPES){
		obj = PAY_TYPES[key];
		opts += '<option value="' + obj.value + '"';
		if (typeId == obj.value)
			opts += ' selected'
		opts += '>' + obj.name + '</option>';
	};

	$("#expenses-table").append(
		'<tr id="row-' + rowId + '" class="sum-row">' +
			'<td><input type="text" value="' + name + '" class="grid-input"></td>' +
			'<td><input id="sum-' + rowId + '" type="text" value="' + sum + '" class="sum-input"></td>' +
			'<td>' +
				'<select id="type-' + rowId + '" class="type-select">' + opts + '</select>' +
			'</td>' +
			'<td>' + 
				'<a href="#" class="del-row-button btn btn-danger">' + 
					'<i class="icon-trash icon-large icon-white"></i> ' + 
					//'Удалить строку' +
				'</a>' + 
			'</td>'
	);
	rowId++;
};

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

function readExpenses(){
	var expenses = [];
	var rows = $(".sum-row");
	for(var i = 0; i < rows.length; i++){
		var row = rows.eq(i);
		var sumField = row.find('.sum-input').eq(0);
		var typeField = row.find('.type-select').eq(0);
		expenses[i] = {
			sum: parseInt(sumField.val()),
			type: typeField.val()
		};
	};
	return expenses;
}

function isCalcDay(weekday, payType){
	switch(payType){
		case 'everyDay':
			return true
		case 'sunday':
			return weekday == 0;
		case 'monday':
			return weekday == 1;
		case 'tuesday':
			return weekday == 2;
		case 'wednesday':
			return weekday == 3;
		case 'thursday':
			return weekday == 4;
		case 'freeday':
			return weekday == 5;
	}
	return false;
}

function calc(){
	var exps = readExpenses();
	var today = Date.myParse($("#today").val());
	var payDay = Date.myParse($("#payday").val());
	var dayCount = Date.daysBetween(today, payDay);
	var fullSum = 0;
	while (today < payDay){
		var weekday = today.getDay();
		for(var i = 0; i < exps.length; i++)
			if (isCalcDay(weekday, exps[i].type))
				fullSum += exps[i].sum;
		today.setDate(today.getDate() + 1);
	}
	for(var i = 0; i < exps.length; i++)
		if (exps[i].type == 'once')
			fullSum += exps[i].sum;
	return {sum: fullSum, dayCount: dayCount};
};

function update(){
	var result = calc();
	var profit = parseInt($("#balance").val());
	var total = profit - result.sum;
	$("#dayCount").text(result.dayCount);
	$("#total").text(total);
};

$(document).ready(function(){
	var now = new Date();
	$("#today").val(now.format());
	addRow('Еда коту', 600, 1);
	$("#add-row-button").on("click", function(){
		addRow('Еда коту', 600, 1);
		update();
	});
	$("#expenses-table").on("click", ".del-row-button", function(evt){
		$(evt.target).parents("tr").remove();
	});
	$("#today,#balance,.sum-input,.type-select").keydown(function(){
		setTimeout(update, 0);
	});
	$("#today,#balance,.sum-input,.type-select").change(function(){
		setTimeout(update, 0);
	});
	update();
});