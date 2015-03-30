<?php

$req = json_decode($_GET['data']);
$login = $req->user;
$password = md5($req->password);

mysql_connect("localhost", "zp_site", "123");
mysql_select_db("zp");
mysql_query("set names utf8");

$r = mysql_query("select id from user where login='$login' and password='$password'");
$row = mysql_fetch_row($r);
if (!$row){
	header( 'HTTP/1.1 403 Forbidden' );
	exit;
}
$user_id = $row[0];

$r = mysql_query("select data from user where id=$user_id");
$row = mysql_fetch_row($r);
$data = $row[0];

echo $data;

?>