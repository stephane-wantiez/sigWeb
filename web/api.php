<?php

require_once('../app/config.php');

use \coursWeb\App;

header('Content-Type: application/json');

if (ENCRYPT_ENABLED)
{
	if (isset($_REQUEST['d']))
	{
		$data = json_decode(\aes\AesCtr::decrypt($_REQUEST['d'], 't1pGs9g36eE8NctIFO90O887g0Q1vmO1', 256));
		App::getInstance()->api($data->action,$data->data);
	}
}
else
{
	if (isset($_REQUEST['action']) && isset($_REQUEST['data']))
	{
		App::getInstance()->api($_REQUEST['action'],$_REQUEST['data']);
	}
}