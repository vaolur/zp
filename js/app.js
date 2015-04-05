App = {};

App.PAY_TYPES = [
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

App.rowId = 0;
App.modified = false;

App.addRow = function(name, sum, typeId){
	var opts = '';
	for(var key in this.PAY_TYPES){
		obj = this.PAY_TYPES[key];
		opts += '<option value="' + obj.value + '"';
		if (typeId == obj.value)
			opts += ' selected'
		opts += '>' + obj.name + '</option>';
	};

	$("#expenses-table").append(
		'<tr id="row-' + this.rowId + '" class="sum-row">' +
			'<td><input id="name-' + this.rowId + '" type="text" value="' + name + '" class="grid-input"></td>' +
			'<td><input id="sum-' + this.rowId + '" type="text" value="' + sum + '" class="sum-input"></td>' +
			'<td>' +
				'<select id="type-' + this.rowId + '" class="type-select">' + opts + '</select>' +
			'</td>' +
			'<td>' + 
				'<a href="#" id="del-row-button-' + this.rowId + '" class="del-row-button btn btn-danger">' + 
					'<i class="icon-trash icon-large icon-white"></i> ' + 
					//'Удалить строку' +
				'</a>' + 
			'</td>'
	);
	App.addRowListeners(this.rowId);
	this.rowId++;
};

App.removeAllRows = function(){
	$(".sum-row").remove();
};

App.addRowListeners = function(rowId){
	$("#expenses-table").on("click", "#del-row-button-" + rowId, function(evt){
		$(evt.target).parents("tr").remove();
		App.update();
	});
	$("#name-" + rowId + ",#sum-" + rowId + ",#type-" + rowId).keydown(function(){
		setTimeout(App.update, 0);
	});
	$("#name-" + rowId + ",#sum-" + rowId + ",#type-" + rowId).change(function(){
		setTimeout(App.update, 0);
	});
};

App.saveData = function(){
	var data = {
		payDay: $("#payday").val(),
		balance: $("#balance").val(),
		rows: []
	};
	var names = $(".grid-input"),
		sums = $(".sum-input"),
		types = $(".type-select");
	for(var i = 0; i < names.length; i++){
		data.rows.push({
			name: names.eq(i).val(),
			sum: sums.eq(i).val(),
			typeId: types.eq(i).val()
		});
	};
	return data;
};

App.loadData = function(data){
	$("#payDay").val(data.payDay);
	$("#balance").val(data.balance);
	this.removeAllRows();
	for(var key in data.rows){
		var row = data.rows[key];
		this.addRow(row.name, row.sum, row.typeId);
	};
	App.update();
};

App.readExpenses = function(){
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
};

App.isCalcDay = function(weekday, payType){
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
};

App.calc = function(){
	var exps = this.readExpenses();
	var today = Date.myParse($("#today").val());
	var payDay = Date.myParse($("#payday").val());
	var dayCount = Date.daysBetween(today, payDay);
	var fullSum = 0;
	while (today < payDay){
		var weekday = today.getDay();
		for(var i = 0; i < exps.length; i++)
			if (this.isCalcDay(weekday, exps[i].type))
				fullSum += exps[i].sum;
		today.setDate(today.getDate() + 1);
	}
	for(var i = 0; i < exps.length; i++)
		if (exps[i].type == 'once')
			fullSum += exps[i].sum;
	return {sum: fullSum, dayCount: dayCount};
};

App.update = function(){
	var result = App.calc();
	var profit = parseInt($("#balance").val());
	var total = profit - result.sum;
	$("#dayCount").text(result.dayCount);
	$("#total").text(total);
	App.modified = true;
};

App.autoSave = function(){
	if (App.modified)
		App.saveToServer();
}

App.saveToServer = function(){
	if (!Util.login || !App.modified)
		return;
	var data = App.saveData();
	$.ajax({
		url: 'save.php',
		type: 'POST',
		cache: false,
		data: JSON.stringify({
			user: Util.login,
			password: Util.password,
			data: data
		}),
		contentType: 'application/json; charset=UTF-8',
		success: function(){
			App.modified = false;
		},
		error: function(jqXHR){
			if (jqXHR.status == 403)
				App.logout();
		}
	})
};

App.loadFromServer = function(){
	$.ajax({
		url: 'load.php',
		type: 'GET',
		cache: false,
		data: {
			data: JSON.stringify({
				user: Util.login,
				password: Util.password
			})
		},
		contentType: 'application/json; charset=UTF-8',
		success: function(data){
			App.modified = false;
			if (data){
				var obj = JSON.parse(data);
				App.loadData(obj);
			}
			else
				App.removeAllRows();
			App.afterLogin();
		},
		error: function(jqXHR, textStatus, errorThrown){
			if (jqXHR.status == 403)
				App.logout();
		}
	})
};

App.afterLogin = function(){
	$("#user-panel").show();
	$("#logged-user-name").text(Util.login);
	$("#login-panel").hide();
	$("#register-panel").hide();
	$("#warning-panel").hide();
}

App.afterLogout = function(){
	$("#user-panel").hide();
	$("#register-panel").hide();
	$("#login-panel").hide();
	$("#warning-panel").show();
}

App.readCookie = function(){
	$("#login-panel").hide();
	$("#register-panel").hide();
	Util.login = $.cookie('login');
	Util.password = $.cookie('password');
	if (Util.login){
		$("#logged-user-name").text(Util.login);	
	}
	else{
		$("#warning-panel").show();
		$("#user-panel").hide();
	}
}

App.logout = function(){
	$.cookie('login', '');
	$.cookie('password', '');
	App.readCookie();
	App.afterLogout();
}

App.register = function(){
	Util.regLogin = $('#email-input').val();
	Util.regPassword  = $('#password-input').val();
	$.ajax({
		url: 'register.php',
		type: 'GET',
		cache: false,
		data: {
			data: JSON.stringify({
				user: Util.regLogin,
				password: Util.regPassword
			})
		},
		success: function(data){
			var obj = JSON.parse(data);
			if (obj.success){
				$.cookie('login', Util.regLogin);
				$.cookie('password', Util.regPassword);
				App.afterLogin();
				App.readCookie();
				App.saveToServer();
			}
			else
				$("#register-error-msg").text(obj.message);
		},
		error: function(jqXHR, textStatus, errorThrown){
			$("#register-error-msg").text("ошибка при регистрации");
		}
	});
};

App.login = function(){
	$.cookie('login', $("#email-entry").val());
	$.cookie('password', $("#password-entry").val());
	App.readCookie();
	App.loadFromServer();
}

$(document).ready(function(){
	var now = new Date();
	$("#today").val(now.format());
	$("#add-row-button").on("click", function(){
		App.addRow('Еда коту', 600, 1);
		App.update();
	});
	$("#today,#balance").keydown(function(){
		setTimeout(App.update, 0);
	});
	$("#today,#balance").change(function(){
		setTimeout(App.update, 0);
	});
	$("#register-button").click(function(){
		App.register();
	});
	$("#register-cancel-button").click(function(){
		$("#register-panel").hide();
		$("#warning-panel").show();
	});

	$("#email-input, #password-input").keydown(function(evt){
		if (evt.which == 13)
			App.register();
	});

	$("#login-button").click(function(){
		App.login();
	});
	$("#login-cancel-button").click(function(){
		$("#login-panel").hide();
		$("#warning-panel").show();
	});
	$("#email-entry, #password-entry").keydown(function(evt){
		if (evt.which == 13)
			App.login();
	});
	$("#login-start-button").click(function(){
		$("#warning-panel").hide();
		$("#login-panel").show();
		$("#email-entry").focus();
	});
	$("#reg-start-button").click(function(){
		$("#warning-panel").hide();
		$("#register-panel").show();
		$("#email-input").focus();
	});
	$("#exit-button").click(function(){
		App.logout();
	});
	App.readCookie();
	App.loadFromServer();
	setInterval(App.saveToServer, 1000);
});