<?php

$req = json_decode(file_get_contents("php://input"));

$login = $req->user;
$password = md5($req->password);
$data = json_encode($req->data, JSON_UNESCAPED_UNICODE);

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

mysql_query("update user set data='$data' where id=$user_id");

?>