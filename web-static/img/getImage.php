<?php
header('Content-Type: image/'.substr($_REQUEST['url'], -3));
sleep(mt_rand($_REQUEST['sleep'], $_REQUEST['sleep'] * 1.5));
$file = $_REQUEST['url'];
echo file_get_contents($file);
