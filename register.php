<?php

$req = json_decode($_GET['data']);
$login = $req->user;
$password = $req->password;
$hash = md5($password);

mysql_connect("localhost", "zp_site", "123");
mysql_select_db("zp");
mysql_query("set names utf8");

$r = mysql_query("select id from user where login='$login'");
if (mysql_num_rows($r) > 0){
	echo '{"success": false, "message": "Данный email уже был зарегистрирован."}';
	exit;
}

mysql_query("insert into user set login='$login', password='$hash'");

echo '{"success": true}';

?>